import { useEffect, useRef, useState } from "react";
import { Map } from "@vis.gl/react-maplibre";
import { middleOfUSA } from "./lib/constants";
import Sidebar from "./components/sidebar";
import RouteLayer from "./components/route-layer";
import LocationMarkers from "./components/location-markers";
import { fetchRouteLegGeometries, optimizeRoute, warmupBackend } from "./lib/api";
import type { LocationInput, OptimizeResponse, PlaceSuggestion } from "./lib/api";

type ThemeMode = "light" | "dark";

interface AppProps {
  embedded?: boolean;
}

export default function App({ embedded = false }: AppProps) {
  const hasResizedMapRef = useRef(false);
  const [locations, setLocations] = useState<LocationInput[]>([]);
  const [result, setResult] = useState<OptimizeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobileSidebarExpanded, setIsMobileSidebarExpanded] = useState(() => false);
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (embedded) {
      return "light";
    }

    if (typeof window === "undefined") {
      return "light";
    }

    const savedTheme = window.localStorage.getItem("routeiq-theme");
    return savedTheme === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    warmupBackend();
  }, []);

  useEffect(() => {
    if (embedded) {
      return;
    }

    window.localStorage.setItem("routeiq-theme", themeMode);
    window.dispatchEvent(new CustomEvent<ThemeMode>("routeiq-theme-change", { detail: themeMode }));
  }, [themeMode, embedded]);

  useEffect(() => {
    if (!embedded) return;
    setThemeMode("light");
    setIsMobileSidebarExpanded(false);
  }, [embedded]);

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
      setResult(optimized);

      if (
        !Array.isArray(optimized.duration_matrix_seconds)
        || !Array.isArray(optimized.matrix_location_names)
      ) {
        setError("Optimization succeeded, but distance matrix data is missing from the API response.");
      }

      try {
        const legGeometries = await fetchRouteLegGeometries(optimized.optimized_route);
        setResult((prev) => {
          if (!prev) {
            return {
              ...optimized,
              leg_geometries: legGeometries,
            };
          }
          return {
            ...prev,
            leg_geometries: legGeometries,
          };
        });
      } catch (routeErr) {
        const routeMessage = routeErr instanceof Error
          ? routeErr.message
          : "Failed to fetch route geometry.";
        setError(`Optimization succeeded, but map route geometry failed: ${routeMessage}`);
      }
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

  function handleToggleTheme() {
    if (embedded) return;
    setThemeMode((prev) => (prev === "light" ? "dark" : "light"));
  }

  return (
    <div className={`app-root theme-${themeMode}`}>
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
          isMobileExpanded={isMobileSidebarExpanded}
          onMobileToggle={(expanded) => setIsMobileSidebarExpanded(expanded)}
          themeMode={themeMode}
          onToggleTheme={handleToggleTheme}
          hideMobileToggle={embedded}
          hideThemeToggle={embedded}
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
            onLoad={(event) => {
              if (hasResizedMapRef.current) return;
              hasResizedMapRef.current = true;

              window.requestAnimationFrame(() => {
                event.target.resize();
              });
            }}
          >
            <LocationMarkers locations={locations} result={result} />
            {result && <RouteLayer legGeometries={result.leg_geometries ?? []} />}
          </Map>
        </div>
      </div>
    </div>
  );
}