
import mapboxgl from 'mapbox-gl';

/**
 * Configuration for globe rotation
 */
export interface RotationConfig {
  secondsPerRevolution: number;
  maxSpinZoom: number;
  slowSpinZoom: number;
}

/**
 * Default rotation settings
 */
const DEFAULT_ROTATION: RotationConfig = {
  secondsPerRevolution: 240, 
  maxSpinZoom: 3, 
  slowSpinZoom: 2
};

/**
 * Setup globe rotation with event handlers
 */
export const setupGlobeRotation = (
  map: mapboxgl.Map,
  config: Partial<RotationConfig> = {}
): void => {
  // Merge default config with provided options
  const rotationConfig: RotationConfig = {
    ...DEFAULT_ROTATION,
    ...config
  };
  
  const { secondsPerRevolution, maxSpinZoom, slowSpinZoom } = rotationConfig;
  let userInteracting = false;
  let spinEnabled = true;

  // Spin globe function
  function spinGlobe() {
    const zoom = map.getZoom();
    if (spinEnabled && !userInteracting && zoom < maxSpinZoom) {
      let distancePerSecond = 360 / secondsPerRevolution;
      if (zoom > slowSpinZoom) {
        const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
        distancePerSecond *= zoomDif;
      }
      const center = map.getCenter();
      center.lng -= distancePerSecond;
      map.easeTo({ center, duration: 1000, easing: (n) => n });
    }
  }

  // Event listeners for interaction
  map.on('mousedown', () => {
    userInteracting = true;
  });
  
  map.on('dragstart', () => {
    userInteracting = true;
  });
  
  map.on('mouseup', () => {
    userInteracting = false;
    spinGlobe();
  });
  
  map.on('touchend', () => {
    userInteracting = false;
    spinGlobe();
  });

  map.on('moveend', () => {
    spinGlobe();
  });

  // Start the globe spinning
  spinGlobe();
};
