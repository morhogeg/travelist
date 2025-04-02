// FILE: src/components/map/SafeMapView.tsx
import React, { useEffect } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { useMapbox } from "./hooks/useMapbox";
import MapContainer from "./components/MapContainer";
import MapLoading from "./components/MapLoading";
import MapError from "./components/MapError";

const SafeMapView: React.FC = () => {
  const {
    initializeMap,
    addPlacesToMap,
    cleanupMap,
    loading,
    mapLoaded,
    mapError,
  } = useMapbox();

  useEffect(() => {
    const handlePlacesChanged = () => {
      if (mapLoaded) {
        addPlacesToMap();
      }
    };

    window.addEventListener("userPlacesChanged", handlePlacesChanged);
    window.addEventListener("recommendationAdded", handlePlacesChanged);
    window.addEventListener("placeDeleted", handlePlacesChanged);

    return () => {
      window.removeEventListener("userPlacesChanged", handlePlacesChanged);
      window.removeEventListener("recommendationAdded", handlePlacesChanged);
      window.removeEventListener("placeDeleted", handlePlacesChanged);
    };
  }, [mapLoaded, addPlacesToMap]);

  if (loading) return <MapLoading />;
  if (mapError) return <MapError error={mapError} />;

  return <MapContainer initializeMap={initializeMap} cleanupMap={cleanupMap} />;
};

export default SafeMapView;
