import { middleOfUSA } from "./constants";

const renderApiUrl = "https://routeiq.onrender.com";
const configuredApiUrl = (import.meta.env.VITE_API_URL || "").trim().replace(/\/$/, "");
const runningOnLocalhost =
  typeof window !== "undefined"
  && ["localhost", "127.0.0.1"].includes(window.location.hostname);
const configuredPointsToLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(configuredApiUrl);
const configuredUsesHttp = configuredApiUrl.startsWith("http://");

const apiBaseUrl = (!runningOnLocalhost && (configuredPointsToLocalhost || configuredUsesHttp))
  ? renderApiUrl
  : (configuredApiUrl || renderApiUrl);

// ── IP geolocation (existing) ──────────────────────────────────────────────

export interface LocationResponse {
  status: string;
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  as: string;
  query: string;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

export interface PlaceSuggestion {
  name: string;
  lat: number;
  lng: number;
  displayName: string;
}

export async function getLocation() {
  try {
    const response = await fetch("http://ip-api.com/json/");
    const json = (await response.json() as LocationResponse);
    if (typeof json.lat === "number" && typeof json.lon === "number") {
      return [json.lon, json.lat];
    }
  // eslint-disable-next-line no-empty
  } catch {}
  return middleOfUSA;
}

export async function geocodePlace(placeName: string): Promise<LocationInput> {
  const query = placeName.trim();
  if (!query) {
    throw new Error("Please enter a place name.");
  }

  const params = new URLSearchParams({
    q: query,
    format: "json",
    limit: "1",
  });

  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Geocoding failed. Please try again.");
  }

  const results = (await response.json()) as NominatimResult[];
  if (!results.length) {
    throw new Error("No matching place found.");
  }

  const first = results[0];
  const lat = Number(first.lat);
  const lng = Number(first.lon);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error("Geocoding returned invalid coordinates.");
  }

  return {
    name: query,
    lat,
    lng,
  };
}

export async function searchPlaceSuggestions(query: string): Promise<PlaceSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) {
    return [];
  }

  const params = new URLSearchParams({
    q: trimmed,
    format: "json",
    limit: "5",
    addressdetails: "1",
  });

  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch place suggestions.");
  }

  const results = (await response.json()) as NominatimResult[];

  return results
    .map((item) => {
      const lat = Number(item.lat);
      const lng = Number(item.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return null;
      }

      const shortName = item.display_name.split(",")[0]?.trim() || trimmed;
      return {
        name: shortName,
        lat,
        lng,
        displayName: item.display_name,
      };
    })
    .filter((item): item is PlaceSuggestion => item !== null);
}

// ── TSP Optimizer ──────────────────────────────────────────────────────────

export interface LocationInput {
  name: string;
  lat: number;
  lng: number;
}

export interface RouteStop {
  name: string;
  lat: number;
  lng: number;
  order: number;
}

export interface RouteLegGeometry {
  leg_index: number;
  start_name: string;
  end_name: string;
  coordinates: [number, number][];
}

export interface OptimizeResponse {
  optimized_route: RouteStop[];
  leg_geometries?: RouteLegGeometry[];
  worst_route: RouteStop[];
  total_duration_seconds: number;
  total_duration_minutes: number;
  worst_duration_seconds: number;
  worst_duration_minutes: number;
  time_saved_seconds: number;
  time_saved_minutes: number;
  matrix_location_names: string[];
  duration_matrix_seconds: number[][];
  stops_count: number;
  fallback_used: boolean;
}

interface RouteLegsResponse {
  leg_geometries: RouteLegGeometry[];
}

export async function optimizeRoute(locations: LocationInput[]): Promise<OptimizeResponse> {
  const response = await fetch(`${apiBaseUrl}/optimize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ locations }),
  });

  if (!response.ok) {
    let detail = "Optimization failed";
    try {
      const err = await response.json();
      if (err.detail) detail = err.detail;
    } catch { /* ignore */ }
    throw new Error(detail);
  }

  return response.json() as Promise<OptimizeResponse>;
}

export async function fetchRouteLegGeometries(route: RouteStop[]): Promise<RouteLegGeometry[]> {
  const response = await fetch(`${apiBaseUrl}/route-legs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ route }),
  });

  if (!response.ok) {
    let detail = "Failed to fetch road route geometry";
    try {
      const err = await response.json();
      if (err.detail) detail = err.detail;
    } catch {
      // ignore JSON parse failure
    }
    throw new Error(detail);
  }

  const json = (await response.json()) as RouteLegsResponse;
  return json.leg_geometries;
}