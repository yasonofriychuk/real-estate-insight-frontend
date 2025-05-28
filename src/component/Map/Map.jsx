import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxLanguage from '@mapbox/mapbox-gl-language';

import Marker from "../Marker/Marker";
import InfraMarker from "../InfraMarker/InfraMarker";
import Card from "../Card/Card";

import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

const Map = ({
  data,
  infrastructure,
  onBoundsChange,
  onFeatureClick,
  onMarkerFeatureClick,
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
          />
        ))}
    </>
  );
};

export default Map;
