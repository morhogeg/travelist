import { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { getUserPlaces } from '@/utils/recommendation-parser';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { initializeMapboxMap, setupMapAtmosphere } from '../utils/mapInitUtils';
import { setupGlobeRotation } from '../utils/rotationUtils';
import { addPlaceMarkersToMap } from '../utils/markerUtils';

export interface MapHookReturn {
  initializeMap: (container: HTMLDivElement) => void;
  addPlacesToMap: () => Promise<void>;
  cleanupMap: () => void;
  loading: boolean;
  mapLoaded: boolean;
  mapError: string | null;
}

export const useMapbox = (): MapHookReturn => {
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const initializeMap = (container: HTMLDivElement): void => {
    try {
      map.current = initializeMapboxMap(container);

      map.current.on('load', () => {
        console.log('✅ Map load event fired');
      });

      map.current.on('style.load', () => {
        console.log('✅ style.load event fired');
        if (!map.current) return;

        setupMapAtmosphere(map.current);
        addPlacesToMap();
        setMapLoaded(true);
        setLoading(false);
      });

      setupGlobeRotation(map.current);

    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Could not initialize the map. Please try again.');
      setLoading(false);
    }
  };

  const addPlacesToMap = async (): Promise<void> => {
    if (!map.current || !mapLoaded) return;

    try {
      const places = getUserPlaces();
      await addPlaceMarkersToMap({
        map: map.current,
        places,
        markersRef,
        navigate
      });
    } catch (error) {
      console.error('Error adding places to map:', error);
      toast({
        title: 'Error',
        description: 'Failed to add places to the map.',
        variant: 'destructive',
      });
    }
  };

  const cleanupMap = (): void => {
    if (map.current) {
      map.current.remove();
      map.current = null;
    }
  };

  return {
    initializeMap,
    addPlacesToMap,
    cleanupMap,
    loading,
    mapLoaded,
    mapError
  };
};
