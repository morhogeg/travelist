// FILE: src/components/map/CleanMapView.tsx
import React, { useEffect } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapbox } from './hooks/useMapbox';
import MapContainer from './components/MapContainer';
import MapLoading from './components/MapLoading';
import MapError from './components/MapError';

const CleanMapView: React.FC = () => {
  const {
    initializeMap,
    addPlacesToMap,
    cleanupMap,
    loading,
    mapLoaded,
    mapError,
  } = useMapbox();

  useEffect(() => {
    const handler = () => {
      if (mapLoaded) addPlacesToMap();
    };

    window.addEventListener('recommendationAdded', handler);
    window.addEventListener('placeDeleted', handler);
    window.addEventListener('userPlacesChanged', handler);

    return () => {
      window.removeEventListener('recommendationAdded', handler);
      window.removeEventListener('placeDeleted', handler);
      window.removeEventListener('userPlacesChanged', handler);
    };
  }, [mapLoaded, addPlacesToMap]);

  if (loading) return <MapLoading />;
  if (mapError) return <MapError error={mapError} />;

  return <MapContainer initializeMap={initializeMap} cleanupMap={cleanupMap} />;
};

export default CleanMapView;