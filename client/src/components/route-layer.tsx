import { Source, Layer } from "@vis.gl/react-maplibre";
import type { RouteLegGeometry } from "../lib/api";

interface Props {
  legGeometries: RouteLegGeometry[];
}

const LEG_COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#f97316", "#a855f7"];

export default function RouteLayer({ legGeometries }: Props) {
  const segments = legGeometries.map((leg, index) => {
    const color = LEG_COLORS[index] ?? LEG_COLORS[LEG_COLORS.length - 1];

    const geojson: GeoJSON.Feature<GeoJSON.LineString> = {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: leg.coordinates,
      },
      properties: {},
    };

    return {
      id: `route-leg-${index}`,
      color,
      geojson,
    };
  });

  return (
    <>
      {segments.map((segment) => (
        <Source key={segment.id} id={segment.id} type="geojson" data={segment.geojson}>
          <Layer
            id={`${segment.id}-line`}
            type="line"
            paint={{
              "line-color": segment.color,
              "line-width": 4,
              "line-opacity": 0.9,
            }}
            layout={{ "line-join": "round", "line-cap": "round" }}
          />
        </Source>
      ))}
    </>
  );
}
