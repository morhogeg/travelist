export {
    getCachedCoords,
    geocodePlace,
    getCurrentLocation,
    calculateDistance,
    batchGeocodePlaces,
} from './geocoding-service';

export {
    initializeProximity,
    startProximityMonitoring,
    stopProximityMonitoring,
    updateMonitoredPlaces,
    getProximityStatus,
} from './proximity-service';

export type { ProximityPlace } from './proximity-service';
