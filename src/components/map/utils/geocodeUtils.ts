
// Public token (normally this would be in an environment variable)
const MAPBOX_TOKEN = 'pk.eyJ1IjoibG92YWJsZWFpIiwiYSI6ImNsczl5MnUwcDFleGYyanBsODR3Y2dvbWUifQ.a-XZqpKHm4lDo5ceTVkQTw';

/**
 * Type for geographic coordinates [longitude, latitude]
 */
export type GeoCoordinates = [number, number];

/**
 * Interface for geocoding response
 */
interface GeocodingResponse {
  features: {
    center: GeoCoordinates;
    place_name?: string;
    properties?: Record<string, any>;
  }[];
}

/**
 * Simple geocoding function to get coordinates from place name
 */
export const getGeocode = async (placeName: string): Promise<GeoCoordinates | null> => {
  try {
    // Mapbox Geocoding API
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(placeName)}.json?access_token=${MAPBOX_TOKEN}`
    );
    
    if (!response.ok) {
      throw new Error(`Geocoding request failed with status: ${response.status}`);
    }
    
    const data = await response.json() as GeocodingResponse;
    
    if (data.features && data.features.length > 0) {
      const coordinates = data.features[0].center;
      return coordinates;
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};
