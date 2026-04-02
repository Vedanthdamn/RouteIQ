import { FormEvent, useEffect, useState } from "react";
import { searchPlaceSuggestions } from "../lib/api";
import type { LocationInput, OptimizeResponse, PlaceSuggestion } from "../lib/api";

interface Point {
  x: number;
  y: number;
}

function hasSelfIntersection(route: OptimizeResponse["optimized_route"]): boolean {
  if (route.length < 5) {
    return false;
  }

  const points: Point[] = route.map((stop) => ({ x: stop.lng, y: stop.lat }));
  const segments = points.slice(0, -1).map((point, index) => ({
    a: point,
    b: points[index + 1],
  }));

  const EPSILON = 1e-10;

  function orientation(p: Point, q: Point, r: Point): number {
    const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
    if (Math.abs(val) < EPSILON) return 0;
    return val > 0 ? 1 : 2;
  }

  function onSegment(p: Point, q: Point, r: Point): boolean {
    return (
      q.x <= Math.max(p.x, r.x) + EPSILON &&
      q.x + EPSILON >= Math.min(p.x, r.x) &&
      q.y <= Math.max(p.y, r.y) + EPSILON &&
      q.y + EPSILON >= Math.min(p.y, r.y)
    );
  }

  function segmentsIntersect(p1: Point, q1: Point, p2: Point, q2: Point): boolean {
    const o1 = orientation(p1, q1, p2);
    const o2 = orientation(p1, q1, q2);
    const o3 = orientation(p2, q2, p1);
    const o4 = orientation(p2, q2, q1);

    if (o1 !== o2 && o3 !== o4) return true;
    if (o1 === 0 && onSegment(p1, p2, q1)) return true;
    if (o2 === 0 && onSegment(p1, q2, q1)) return true;
    if (o3 === 0 && onSegment(p2, p1, q2)) return true;
    if (o4 === 0 && onSegment(p2, q1, q2)) return true;

    return false;
  }

  for (let i = 0; i < segments.length; i += 1) {
    for (let j = i + 1; j < segments.length; j += 1) {
      if (Math.abs(i - j) <= 1) continue;
      if (i === 0 && j === segments.length - 1) continue;

      if (
        segmentsIntersect(
          segments[i].a,
          segments[i].b,
          segments[j].a,
          segments[j].b
        )
      ) {
        return true;
      }
    }
  }

  return false;
}

interface Props {
  locations: LocationInput[];
  result: OptimizeResponse | null;
  isLoading: boolean;
  isGeocoding: boolean;
  error: string | null;
  onAddLocation: (place: PlaceSuggestion) => Promise<boolean>;
  onOptimize: () => void;
  onReset: () => void;
  isMobileExpanded: boolean;
  onMobileToggle: (expanded: boolean) => void;
}

const LEGEND_ITEMS = [
  { color: "#ef4444", label: "Hub → Stop 1" },
  { color: "#3b82f6", label: "Stop 1 → Stop 2" },
  { color: "#22c55e", label: "Stop 2 → Stop 3" },
  { color: "#f97316", label: "Stop 3 → Stop 4" },
  { color: "#a855f7", label: "Stop 4 → Hub" },
];

export default function Sidebar({
  locations,
  result,
  isLoading,
  isGeocoding,
  error,
  onAddLocation,
  onOptimize,
  onReset,
  isMobileExpanded,
  onMobileToggle,
}: Props) {
  const [matrixVisible, setMatrixVisible] = useState(false);
  const [placeName, setPlaceName] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<PlaceSuggestion | null>(null);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

  const hasLocations = locations.length > 0;
  const canOptimize = locations.length >= 2 && !result && !isLoading && !isGeocoding;
  const atMax = locations.length >= 5 || Boolean(result);

  const worstDeltaMinutes = result
    ? Number((result.worst_duration_minutes - result.total_duration_minutes).toFixed(2))
    : 0;

  const worstDeltaPercent = result && result.worst_duration_seconds > 0
    ? Number(((worstDeltaMinutes / result.worst_duration_minutes) * 100).toFixed(1))
    : 0;
  const routeHasIntersection = result ? hasSelfIntersection(result.optimized_route) : false;

  useEffect(() => {
    if (!result) {
      setMatrixVisible(false);
      return;
    }

    const matrixNode = document.querySelector<HTMLElement>(".matrix-wrap");
    if (!matrixNode) return;

    matrixNode.style.opacity = "0";
    matrixNode.style.transform = "translateY(40px)";
    matrixNode.classList.add("scroll-reveal-target");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          setMatrixVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(matrixNode);
    return () => observer.disconnect();
  }, [result]);

  useEffect(() => {
    const query = placeName.trim();

    if (selectedSuggestion && query === selectedSuggestion.displayName.trim()) {
      setSuggestions([]);
      setSuggestionError(null);
      setIsSearching(false);
      return;
    }

    if (query.length < 3 || atMax) {
      setSuggestions([]);
      setSuggestionError(null);
      setIsSearching(false);
      return;
    }

    let active = true;
    setIsSearching(true);
    setSuggestionError(null);

    const timer = setTimeout(async () => {
      try {
        const matches = await searchPlaceSuggestions(query);
        if (!active) return;
        setSuggestions(matches);
      } catch (err) {
        if (!active) return;
        setSuggestionError(err instanceof Error ? err.message : "Search failed.");
        setSuggestions([]);
      } finally {
        if (active) {
          setIsSearching(false);
        }
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [placeName, atMax, selectedSuggestion]);

  useEffect(() => {
    const sidebarNode = document.querySelector<HTMLElement>(".sidebar");
    if (!sidebarNode) return;

    let startY = 0;
    let currentY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      currentY = e.touches[0].clientY - startY;
    };

    const handleTouchEnd = () => {
      const threshold = 50;
      if (currentY > threshold) {
        // Dragged down, collapse
        onMobileToggle(false);
      } else if (currentY < -threshold) {
        // Dragged up, expand
        onMobileToggle(true);
      }
      startY = 0;
      currentY = 0;
    };

    const header = sidebarNode.querySelector<HTMLElement>(".sidebar-header");
    if (header && window.innerWidth <= 768) {
      header.addEventListener("touchstart", handleTouchStart, { passive: true });
      header.addEventListener("touchmove", handleTouchMove, { passive: true });
      header.addEventListener("touchend", handleTouchEnd, { passive: true });

      return () => {
        header.removeEventListener("touchstart", handleTouchStart);
        header.removeEventListener("touchmove", handleTouchMove);
        header.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [onMobileToggle]);

  function handleSelectSuggestion(suggestion: PlaceSuggestion) {
    setSelectedSuggestion(suggestion);
    setPlaceName(suggestion.displayName);
    setSuggestions([]);
    setSuggestionError(null);
  }

  async function handleAddSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedSuggestion || isGeocoding || atMax) return;
    const added = await onAddLocation(selectedSuggestion);
    if (added) {
      setPlaceName("");
      setSelectedSuggestion(null);
      setSuggestions([]);
      setSuggestionError(null);
    }
  }

  return (
    <aside className={`sidebar${isMobileExpanded ? " is-expanded" : ""}`}>
      <div className="sidebar-header" onClick={() => window.innerWidth <= 768 && onMobileToggle(!isMobileExpanded)}>
        <div className="header-logo">
          <span className="header-icon">🚚</span>
          <div>
            <h1 className="header-title">Route Optimizer</h1>
            <p className="header-sub">Hub + 4 Stops</p>
          </div>
        </div>
      </div>

      <div className="sidebar-body">
        <form className="location-form" onSubmit={handleAddSubmit}>
          <label className="sec-label" htmlFor="place-input">Add location</label>
          <div className="location-form-row">
            <input
              id="place-input"
              className="place-input"
              type="text"
              placeholder="Enter place name"
              value={placeName}
              onChange={(e) => {
                setPlaceName(e.target.value);
                setSelectedSuggestion(null);
              }}
              disabled={isGeocoding || atMax}
              autoComplete="off"
            />
            <button
              type="submit"
              className="btn btn-neutral add-btn"
              disabled={!selectedSuggestion || isGeocoding || atMax}
            >
              {isGeocoding ? "Adding..." : "Add location"}
            </button>
          </div>
          {!atMax && placeName.trim().length >= 3 && (
            <div className="autocomplete-wrap">
              {isSearching && <div className="autocomplete-state">Searching...</div>}
              {!isSearching && suggestionError && (
                <div className="autocomplete-state is-error">{suggestionError}</div>
              )}
              {!isSearching && !suggestionError && suggestions.length === 0 && !selectedSuggestion && (
                <div className="autocomplete-state">No suggestions found.</div>
              )}
              {!isSearching && suggestions.length > 0 && (
                <ul className="suggestions-list">
                  {suggestions.map((item, index) => (
                    <li key={`${item.displayName}-${index}`}>
                      <button
                        type="button"
                        className="suggestion-item"
                        onClick={() => handleSelectSuggestion(item)}
                      >
                        <span className="suggestion-name">{item.name}</span>
                        <span className="suggestion-detail">{item.displayName}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <p className="field-help">First location is hub. Add up to four stops.</p>
        </form>

        {atMax && !result && (
          <div className="note-box">Max five locations reached. Optimize or reset.</div>
        )}

        {hasLocations && (
          <section className="panel">
            <div className="sec-header">
              <span className="sec-label">Itinerary</span>
              <span className="loc-badge">{locations.length} / 5</span>
            </div>
            <ul className="itinerary-list">
              {locations.map((loc, i) => (
                <li key={i} className="itinerary-item">
                  <div className={`itinerary-dot ${i === 0 ? "is-hub" : ""}`}>
                    {i === 0 ? "H" : i}
                  </div>
                  <div className="itinerary-content">
                    <div className="itinerary-title-row">
                      <span className="loc-name">{loc.name}</span>
                      {i === 0 && <span className="hub-chip">HUB</span>}
                    </div>
                    <span className="loc-coords">
                      {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {result && (
          <section className="panel result-card">
            <div className="result-head">
              <span className="result-head-title">Optimized route</span>
            </div>

            <div className="stats-grid">
              <div className="stat-box">
                <span className="stat-val">
                  {result.total_duration_minutes}
                  <span className="stat-unit"> min</span>
                </span>
                <span className="stat-lbl">Travel time</span>
              </div>
              <div className="stat-box">
                <span className="stat-val">
                  {result.stops_count}
                  <span className="stat-unit"> stops</span>
                </span>
                <span className="stat-lbl">Deliveries</span>
              </div>
            </div>

            {result.fallback_used && (
              <p className="fallback-warn">
                Using estimated distances. Add an ORS API key in backend/main.py for road-accurate optimization.
              </p>
            )}

            {routeHasIntersection && (
              <p className="fallback-warn">
                Route may be suboptimal - using estimated distances, add ORS API key for accurate results
              </p>
            )}

            <div className="subsec">Optimal order</div>
            <ol className="route-order">
              {result.optimized_route.map((stop, i) => {
                const isHubRow =
                  i === 0 || i === result.optimized_route.length - 1;
                return (
                  <li
                    key={i}
                    className={`ro-item ${isHubRow ? "is-hub-row" : ""}`}
                  >
                    <span className="ro-num">{i}</span>
                    <span className="ro-name">{stop.name}</span>
                    {isHubRow && <span className="hub-chip">HUB</span>}
                  </li>
                );
              })}
            </ol>

            <div className="subsec">Route color legend</div>
            <ul className="route-legend">
              {LEGEND_ITEMS.map((item) => (
                <li key={item.label} className="route-legend-item">
                  <span className="route-legend-color" style={{ background: item.color }} />
                  <span className="route-legend-label">{item.label}</span>
                </li>
              ))}
            </ul>

            <div className="subsec">Best vs worst</div>
            <div className="comparison-grid">
              <div className="compare-box is-best">
                <span className="compare-title">Optimized</span>
                <span className="compare-value">{result.total_duration_minutes} min</span>
              </div>
              <div className="compare-box is-worst">
                <span className="compare-title">Worst</span>
                <span className="compare-value">{result.worst_duration_minutes} min</span>
              </div>
            </div>
            <p className="compare-summary">
              Saved <strong>{worstDeltaMinutes} min</strong> vs worst route ({worstDeltaPercent}%).
            </p>

            <div className="subsec">Travel time matrix (min)</div>
            <div className={`matrix-wrap scroll-reveal-target${matrixVisible ? " scroll-reveal-in" : ""}`}>
              <table className="matrix-table">
                <thead>
                  <tr>
                    <th>From \ To</th>
                    {result.matrix_location_names.map((name, idx) => (
                      <th key={`head-${idx}`}>{name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.matrix_location_names.map((rowName, rowIndex) => {
                    const row = result.duration_matrix_seconds[rowIndex] ?? [];
                    return (
                    <tr key={`row-${rowIndex}`}>
                      <th>{rowName}</th>
                      {result.matrix_location_names.map((_, colIndex) => {
                        const seconds = row[colIndex];
                        return (
                        <td key={`cell-${rowIndex}-${colIndex}`}>
                          {typeof seconds === "number" ? (seconds / 60).toFixed(1) : "-"}
                        </td>
                        );
                      })}
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {error && <div className="error-card">{error}</div>}

        {!hasLocations && (
          <div className="empty-hint">Add a hub and stops to begin optimization.</div>
        )}
      </div>

      <div className="sidebar-footer">
        {!result && (
          <button
            id="btn-optimize"
            className="btn btn-primary"
            onClick={onOptimize}
            disabled={!canOptimize}
          >
            {isLoading ? "Optimizing..." : "Optimize route"}
          </button>
        )}

        {hasLocations && (
          <button
            id="btn-reset"
            className="btn btn-neutral"
            onClick={onReset}
          >
            Reset
          </button>
        )}
      </div>
    </aside>
  );
}
