import { useState } from "react";
import { Map } from "@vis.gl/react-maplibre";
import { middleOfUSA } from "./lib/constants";
import Sidebar from "./components/sidebar";
import RouteLayer from "./components/route-layer";
import LocationMarkers from "./components/location-markers";
import { fetchRouteLegGeometries, optimizeRoute } from "./lib/api";
import type { LocationInput, OptimizeResponse, PlaceSuggestion } from "./lib/api";

export default function App() {
  const [locations, setLocations] = useState<LocationInput[]>([]);
  const [result, setResult] = useState<OptimizeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAddLocation(place: PlaceSuggestion): Promise<boolean> {
    if (result || isGeocoding || locations.length >= 5) return false;

    setIsGeocoding(true);
    setError(null);

    try {
      setLocations((prev) => {
        return [...prev, { name: place.name, lat: place.lat, lng: place.lng }];
      });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add location.");
      return false;
    } finally {
      setIsGeocoding(false);
    }
  }

  async function handleOptimize() {
    if (locations.length < 2 || isLoading || result) return;
    setIsLoading(true);
    setError(null);
    try {
      const optimized = await optimizeRoute(locations);
      const legGeometries = await fetchRouteLegGeometries(optimized.optimized_route);
      setResult({
        ...optimized,
        leg_geometries: legGeometries,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to connect to optimizer."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    setLocations([]);
    setResult(null);
    setError(null);
  }

  return (
    <div className="app-container">
      <Sidebar
        locations={locations}
        result={result}
        isLoading={isLoading}
        isGeocoding={isGeocoding}
        error={error}
        onAddLocation={handleAddLocation}
        onOptimize={handleOptimize}
        onReset={handleReset}
      />

      <div className="map-wrapper">
        <Map
          initialViewState={{
            longitude: middleOfUSA[0],
            latitude: middleOfUSA[1],
            zoom: 2,
          }}
          mapStyle="https://tiles.openfreemap.org/styles/liberty"
          style={{ width: "100%", height: "100%" }}
        >
          <LocationMarkers locations={locations} result={result} />
          {result && <RouteLayer legGeometries={result.leg_geometries ?? []} />}
        </Map>
      </div>
    </div>
  );
}