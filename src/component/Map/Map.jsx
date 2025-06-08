import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxLanguage from "@mapbox/mapbox-gl-language";

import Marker from "../Marker/Marker";
import InfraMarker from "../InfraMarker/InfraMarker";
import Card from "../Card/Card";

import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

const Map = ({
  data,
  infrastructure,
  routeGeoJSON,
  heatmapData,
  onBoundsChange,
  onFeatureClick,
  onMarkerFeatureClick,
  onInfraMarkerClick,
}) => {
  const mapRef = useRef();
  const mapContainerRef = useRef();

  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    mapRef.current = new mapboxgl.Map({
      style: "mapbox://styles/mapbox/streets-v12",
      container: mapContainerRef.current,
      center: [73.423043, 61.258726],
      zoom: 12,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl());

    mapRef.current.on("load", async () => {
      onBoundsChange(mapRef.current);
      setMapLoaded(true);

      mapRef.current.getStyle().layers.forEach((layer) => {
        if (layer.type === "symbol" && layer.id.includes("poi")) {
          mapRef.current.setLayoutProperty(layer.id, "visibility", "none");
        }
      });
    });

    mapRef.current.on("moveend", () => {
      if (onBoundsChange) {
        onBoundsChange(mapRef.current);
      }
    });

    const language = new MapboxLanguage();
    mapRef.current.addControl(language);

    return () => {
      mapRef.current.remove();
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    const map = mapRef.current;

    // Удаляем предыдущий маршрут, если есть
    if (routeGeoJSON) {
      if (map.getSource("route")) {
        map.removeLayer("route");
        map.removeSource("route");
      }
      if (map.getSource("route-label")) {
        map.removeLayer("route-label");
        map.removeSource("route-label");
      }
      // Добавляем новый маршрут
      map.addSource("route", {
        type: "geojson",
        data: routeGeoJSON,
      });

      map.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#3b82f6",
          "line-width": 4,
        },
      });
      const coordinates = routeGeoJSON.features[0]?.geometry?.coordinates;
      const distance = routeGeoJSON.features[0]?.properties?.distance;

      if (coordinates && coordinates.length > 1 && distance) {
        const midIndex = Math.floor(coordinates.length / 2);
        const midPoint = coordinates[midIndex];

        const labelGeoJSON = {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: midPoint,
              },
              properties: {
                text: distance,
              },
            },
          ],
        };

        map.addSource("route-label", {
          type: "geojson",
          data: labelGeoJSON,
        });

        map.addLayer({
          id: "route-label",
          type: "symbol",
          source: "route-label",
          layout: {
            "text-field": ["get", "text"],
            "text-font": ["Open Sans Bold"],
            "text-size": 14,
            "text-rotate": ["get", "angle"],
            "text-anchor": "center",
          },
          paint: {
            "text-color": "#1f2937",
            "text-halo-color": "#ffffff",
            "text-halo-width": 1.5,
          },
        });
      }
    }

    if (heatmapData) {
      if (map.getSource("infra-heatmap")) {
        map.removeLayer("infra-heatmap");
        map.removeSource("infra-heatmap");
      }

      map.addSource("infra-heatmap", {
        type: "geojson",
        data: heatmapData,
      });

      map.addLayer({
        id: "infra-heatmap",
        type: "fill",
        source: "infra-heatmap",
        paint: {
          "fill-color": [
            "interpolate",
            ["linear"],
            ["get", "total_weight"],
            0.0,
            "#ffffff", // низкая насыщенность — белый
            0.2,
            "#dbe3f7", // светло-сиреневый
            0.4,
            "#a5b8e3", // небесно-синий
            0.6,
            "#5e81c5", // средне-синий
            0.8,
            "#3b4cc0", // насыщенно-синий
            1.0,
            "#2a1659", // тёмно-фиолетовый
          ],
          'fill-opacity': 0.5,
          "fill-outline-color": "rgba(0, 0, 0, 0.5)",
        },
      });
    }
  }, [routeGeoJSON, heatmapData, mapLoaded]);

  return (
    <>
      <div id="map-container" ref={mapContainerRef} className="h-full w-full" />
      {mapLoaded &&
        data &&
        data.map((d, i) => (
          <Marker
            key={`dev-${d.id ?? i}`}
            feature={d}
            map={mapRef.current}
            onClick={onMarkerFeatureClick}
          >
            <Card feature={d} width={300} shortImage onClick={onFeatureClick} />
          </Marker>
        ))}
      {mapLoaded &&
        infrastructure &&
        infrastructure.map((d, i) => (
          <InfraMarker
            key={`infra-${d.id ?? i}`}
            markerData={d}
            map={mapRef.current}
            onClick={onInfraMarkerClick}
          />
        ))}
    </>
  );
};

export default Map;
