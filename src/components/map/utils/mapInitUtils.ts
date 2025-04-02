
import mapboxgl from 'mapbox-gl';

// Public token (normally this would be in an environment variable)
export const MAPBOX_TOKEN = 'pk.eyJ1IjoibG92YWJsZWFpIiwiYSI6ImNsczl5MnUwcDFleGYyanBsODR3Y2dvbWUifQ.a-XZqpKHm4lDo5ceTVkQTw';

/**
 * Interface for map initialization options
 */
export interface MapInitOptions {
  container: HTMLDivElement;
  style?: string;
  projection?: string;
  zoom?: number;
  center?: [number, number];
  minZoom?: number;
}

/**
 * Initialize a new mapbox map with common configuration
 */
export const initializeMapboxMap = (
  container: HTMLDivElement, 
  options: Partial<MapInitOptions> = {}
): mapboxgl.Map => {
  // Set token
  mapboxgl.accessToken = MAPBOX_TOKEN;
  
  // Create map with default options that can be overridden
  const map = new mapboxgl.Map({
    container,
    style: options.style || 'mapbox://styles/mapbox/streets-v11',
    projection: options.projection || 'mercator',
    zoom: options.zoom || 1.5,
    center: options.center || [0, 20],
    minZoom: options.minZoom || 1,
  });
  
  // Add navigation controls
  map.addControl(
    new mapboxgl.NavigationControl({
      visualizePitch: true,
    }),
    'top-right'
  );
  
  return map;
};

/**
 * Interface for fog/atmosphere options
 */
export interface AtmosphereOptions {
  color: string;
  'high-color': string;
  'horizon-blend': number;
}

/**
 * Setup map atmosphere and fog effects
 */
export const setupMapAtmosphere = (
  map: mapboxgl.Map, 
  options: Partial<AtmosphereOptions> = {}
): void => {
  map.setFog({
    color: options.color || 'rgb(255, 255, 255)',
    'high-color': options['high-color'] || 'rgb(200, 200, 225)',
    'horizon-blend': options['horizon-blend'] || 0.2,
  });
};
