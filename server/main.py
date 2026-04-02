from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import itertools
import requests
import math

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImY3NzQ2YzJhODViMjQ4ZjU5NTY2MWNhYmYzODM3YTMxIiwiaCI6Im11cm11cjY0In0="
FALLBACK_AVG_SPEED_KMPH = 50


class Location(BaseModel):
    name: str
    lat: float
    lng: float


class OptimizeRequest(BaseModel):
    locations: List[Location]


class RouteLegsRequest(BaseModel):
    route: List[Location]


# ---------------------------------------------------------------------------
# Haversine fallback — returns straight-line travel estimate in seconds
# ---------------------------------------------------------------------------

def haversine(a: Location, b: Location) -> float:
    R = 6371000
    lat1, lon1 = math.radians(a.lat), math.radians(a.lng)
    lat2, lon2 = math.radians(b.lat), math.radians(b.lng)
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    x = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    return R * 2 * math.asin(math.sqrt(x))


def build_matrix_haversine(locations: List[Location]) -> List[List[float]]:
    n = len(locations)
    speed_m_per_s = (FALLBACK_AVG_SPEED_KMPH * 1000) / 3600
    return [[haversine(locations[i], locations[j]) / speed_m_per_s for j in range(n)] for i in range(n)]


# ---------------------------------------------------------------------------
# OpenRouteService duration matrix
# ---------------------------------------------------------------------------

def build_matrix_ors(locations: List[Location]) -> List[List[float]]:
    coords = [[loc.lng, loc.lat] for loc in locations]
    res = requests.post(
        "https://api.openrouteservice.org/v2/matrix/driving-car",
        headers={
            "Authorization": ORS_API_KEY,
            "Content-Type": "application/json",
        },
        json={"locations": coords, "metrics": ["duration"]},
        timeout=10,
    )
    res.raise_for_status()
    return res.json()["durations"]


def get_leg_geometry_ors(start: Location, end: Location) -> List[List[float]]:
    payload = {
        "coordinates": [
            [start.lng, start.lat],
            [end.lng, end.lat],
        ]
    }

    res = requests.post(
        "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
        headers={
            "Authorization": ORS_API_KEY,
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=15,
    )
    res.raise_for_status()

    data = res.json()
    features = data.get("features", [])
    if not features:
        raise ValueError("No route geometry returned by ORS directions API")

    geometry = features[0].get("geometry", {})
    geometry_type = geometry.get("type")
    coordinates = geometry.get("coordinates", [])

    if geometry_type == "LineString":
        return coordinates

    if geometry_type == "MultiLineString":
        flattened: List[List[float]] = []
        for segment in coordinates:
            flattened.extend(segment)
        return flattened

    raise ValueError(f"Unsupported ORS geometry type: {geometry_type}")


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/")
def root():
    return {"status": "RouteIQ backend running"}

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "ors_key_configured": ORS_API_KEY != "PASTE_YOUR_KEY_HERE",
    }


@app.post("/optimize")
def optimize(req: OptimizeRequest):
    locations = req.locations
    n = len(locations)

    if n < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 locations (hub + 1 stop).")
    if n > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 locations supported (hub + 4 stops).")

    fallback = False

    # STEP 1 — distance/duration matrix
    try:
        matrix = build_matrix_ors(locations)
        print(f"[optimize] distance source=ORS locations={n}")
    except Exception:
        matrix = build_matrix_haversine(locations)
        fallback = True
        print(f"[optimize] distance source=HAVERSINE_FALLBACK locations={n}")

    # STEP 2 — brute-force TSP (hub = index 0)
    stop_indices = list(range(1, n))
    best_order = stop_indices
    best_cost = float("inf")
    worst_order = stop_indices
    worst_cost = float("-inf")

    for perm in itertools.permutations(stop_indices):
        cost = matrix[0][perm[0]]
        for i in range(len(perm) - 1):
            cost += matrix[perm[i]][perm[i + 1]]
        cost += matrix[perm[-1]][0]

        if cost < best_cost:
            best_cost = cost
            best_order = list(perm)

        if cost > worst_cost:
            worst_cost = cost
            worst_order = list(perm)

    # STEP 3 — build response (hub → stops → hub)
    ordered = [locations[0]] + [locations[i] for i in best_order] + [locations[0]]
    route = [
        {"name": loc.name, "lat": loc.lat, "lng": loc.lng, "order": i}
        for i, loc in enumerate(ordered)
    ]

    worst_route = [locations[0]] + [locations[i] for i in worst_order] + [locations[0]]
    worst_route_serialized = [
        {"name": loc.name, "lat": loc.lat, "lng": loc.lng, "order": i}
        for i, loc in enumerate(worst_route)
    ]

    return {
        "optimized_route": route,
        "total_duration_seconds": round(best_cost, 1),
        "total_duration_minutes": round(best_cost / 60, 2),
        "worst_duration_seconds": round(worst_cost, 1),
        "worst_duration_minutes": round(worst_cost / 60, 2),
        "time_saved_seconds": round(worst_cost - best_cost, 1),
        "time_saved_minutes": round((worst_cost - best_cost) / 60, 2),
        "matrix_location_names": [loc.name for loc in locations],
        "duration_matrix_seconds": [
            [round(value, 1) for value in row]
            for row in matrix
        ],
        "worst_route": worst_route_serialized,
        "stops_count": len(stop_indices),
        "fallback_used": fallback,
    }


@app.post("/route-legs")
def route_legs(req: RouteLegsRequest):
    route = req.route
    if len(route) < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 points to build route legs.")

    legs = []
    for index in range(len(route) - 1):
        start = route[index]
        end = route[index + 1]
        try:
            coordinates = get_leg_geometry_ors(start, end)
            print(f"[route-legs] source=ORS leg={index} {start.name}->{end.name}")
        except Exception as exc:
            print(f"[route-legs] source=ORS_FAILED leg={index} {start.name}->{end.name} error={exc}")
            raise HTTPException(
                status_code=502,
                detail="Failed to fetch road geometry from ORS Directions API.",
            )

        legs.append(
            {
                "leg_index": index,
                "start_name": start.name,
                "end_name": end.name,
                "coordinates": coordinates,
            }
        )

    return {"leg_geometries": legs}
