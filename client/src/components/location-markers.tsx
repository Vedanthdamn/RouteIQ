import { Marker } from "@vis.gl/react-maplibre";
import type { LocationInput, OptimizeResponse } from "../lib/api";

interface Props {
  locations: LocationInput[];
  result: OptimizeResponse | null;
}

export default function LocationMarkers({ locations }: Props) {

  return (
    <>
      {locations.map((loc, i) => (
        <Marker
          key={`pin-${i}`}
          longitude={loc.lng}
          latitude={loc.lat}
          anchor="bottom"
        >
          <div className="marker-stack">
            <div className={`pin ${i === 0 ? "pin-hub" : "pin-stop"}`}>
              {i === 0 ? (
                <em>H</em>
              ) : (
                <span />
              )}
            </div>
            <div className="pin-label">
              {i === 0 && <span className="pin-label-badge">H</span>}
              <span className="pin-label-text">{loc.name}</span>
            </div>
          </div>
        </Marker>
      ))}
    </>
  );
}
