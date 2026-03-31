# RouteIQ — TSP Delivery Route Optimizer

![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Build-Vite-646CFF?logo=vite&logoColor=white)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Runtime-Python-3776AB?logo=python&logoColor=white)
![MapLibre](https://img.shields.io/badge/Maps-MapLibre_GL_JS-3B82F6)
![OpenRouteService](https://img.shields.io/badge/Routing-OpenRouteService-F97316)
![Nominatim](https://img.shields.io/badge/Geocoding-Nominatim-10B981)

## About

RouteIQ is a full-stack delivery route optimization project that solves a small-scale Travelling Salesman Problem (TSP) for delivery planning.

It combines:

- brute force TSP optimization for guaranteed best-order routing
- real road distance and duration calculations using OpenRouteService
- interactive map rendering with MapLibre GL JS and OpenFreeMap tiles
- autocomplete place search using Nominatim

The result is a practical route planner that shows the mathematically optimal stop order while drawing route legs on real roads.

## Tech Stack

- Frontend: React, TypeScript, Vite
- Mapping: MapLibre GL JS, OpenFreeMap
- Backend: FastAPI, Python
- External APIs: OpenRouteService API, Nominatim

## Project Structure

```text
openfreemap-examples/
|- client/
|  |- src/
|  |- public/
|  |- package.json
|  |- vite.config.ts
|
|- server/
|  |- main.py
|  |- requirements.txt
|
|- maps/
|  |- svelte-example/
|  |- vanilla-example/
|  |- vanilla-leaflet-example/
|  |- vue-example/
|
|- README.md
```

## Prerequisites

- Node.js (18+ recommended)
- npm
- Python 3 (3.10+ recommended)
- OpenRouteService API key from https://openrouteservice.org

## Setup and Installation

Clone the repository:

```bash
git clone https://github.com/Vedanthdamn/openfreemap-examples.git
cd openfreemap-examples
```

Install client dependencies:

```bash
cd client
npm install
cd ..
```

Install server dependencies:

```bash
cd server
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd ..
```

## Running the Project

Start server on port 8000:

```bash
cd server
source .venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Start client on port 5173:

```bash
cd client
npm run dev -- --host 0.0.0.0 --port 5173
```

Then open:

- Client: http://localhost:5173
- Server health: http://localhost:8000/health

## How It Works

RouteIQ solves TSP using exhaustive brute force for a small number of stops.

For 4 stops:

```text
4! = 24 permutations
```

The backend computes every permutation, compares total route cost, and selects the shortest one. Because all permutations are evaluated, the chosen result is guaranteed optimal for the provided stops.

Distance and travel-time values are primarily sourced from OpenRouteService road data for realistic routing.

If ORS is unavailable or not configured, the backend falls back to Haversine-based estimates, so optimization still works with approximate straight-line distance modeling.

## API Endpoints

### GET /health

Simple backend health check.

Response:

```json
{
	"status": "ok"
}
```

### POST /optimize

Optimizes stop order using brute force TSP.

Request body:

```json
{
	"locations": [
		{ "label": "Hub", "lat": 28.6139, "lng": 77.2090 },
		{ "label": "Stop 1", "lat": 28.5355, "lng": 77.3910 },
		{ "label": "Stop 2", "lat": 28.4595, "lng": 77.0266 },
		{ "label": "Stop 3", "lat": 28.7041, "lng": 77.1025 }
	]
}
```

Sample response:

```json
{
	"optimized_route": [0, 2, 1, 3, 0],
	"total_distance_km": 87.42,
	"total_duration_minutes": 146.3,
	"stops_count": 4,
	"fallback_used": false,
	"worst_route": [0, 1, 3, 2, 0],
	"worst_distance_km": 111.27,
	"worst_duration_minutes": 189.7,
	"matrix": {
		"labels": ["Hub", "Stop 1", "Stop 2", "Stop 3"],
		"distance_km": [[0, 12.3, 8.6, 15.1], [12.3, 0, 10.2, 9.8], [8.6, 10.2, 0, 14.4], [15.1, 9.8, 14.4, 0]],
		"duration_min": [[0, 24.1, 18.9, 28.6], [24.1, 0, 21.2, 19.6], [18.9, 21.2, 0, 27.9], [28.6, 19.6, 27.9, 0]]
	}
}
```

## Author

Vedanth

GitHub: https://github.com/Vedanthdamn