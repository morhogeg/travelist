import { Geolocation } from '@capacitor/geolocation';

/**
 * Geocoding service using Apple CLGeocoder via Capacitor Geolocation's reverse geocoding
 * For forward geocoding (address → coordinates), we use a simple fallback approach
 */

// Cache for geocoded places to avoid repeated lookups
const geocodeCache: Map<string, { lat: number; lng: number }> = new Map();

/**
 * Generate cache key from place info
 */
function getCacheKey(name: string, city: string, country: string): string {
    return `${name.toLowerCase()}-${city.toLowerCase()}-${country.toLowerCase()}`;
}

/**
 * Geocode a place using Nominatim (free, no API key required)
 * Falls back gracefully if the place can't be found
 */
export async function geocodePlace(
    name: string,
    city: string,
    country: string
): Promise<{ lat: number; lng: number } | null> {
    const cacheKey = getCacheKey(name, city, country);

    // Check cache first
    if (geocodeCache.has(cacheKey)) {
        return geocodeCache.get(cacheKey)!;
    }

    try {
        // Build search query - try place name + city first, then just city
        const queries = [
            `${name}, ${city}, ${country}`,
            `${city}, ${country}`
        ];

        for (const query of queries) {
            const encodedQuery = encodeURIComponent(query);
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=1`,
                {
                    headers: {
                        'User-Agent': 'Travelist/1.0 (contact@travelist.app)'
                    }
                }
            );

            if (!response.ok) continue;

            const data = await response.json();

            if (data && data.length > 0) {
                const result = {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon)
                };

                // Cache the result
                geocodeCache.set(cacheKey, result);

                console.log(`[Geocoding] Found coordinates for "${name}" in ${city}: ${result.lat}, ${result.lng}`);
                return result;
            }
        }

        console.warn(`[Geocoding] Could not find coordinates for "${name}" in ${city}, ${country}`);
        return null;
    } catch (error) {
        console.error('[Geocoding] Error geocoding place:', error);
        return null;
    }
}

/**
 * Get current device location
 */
export async function getCurrentLocation(): Promise<{ lat: number; lng: number } | null> {
    try {
        const permission = await Geolocation.checkPermissions();

        if (permission.location === 'denied') {
            console.warn('[Geocoding] Location permission denied');
            return null;
        }

        if (permission.location === 'prompt' || permission.location === 'prompt-with-rationale') {
            await Geolocation.requestPermissions();
        }

        const position = await Geolocation.getCurrentPosition({
            enableHighAccuracy: false, // Use low accuracy for battery efficiency
            timeout: 10000
        });

        return {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
    } catch (error) {
        console.error('[Geocoding] Error getting current location:', error);
        return null;
    }
}

/**
 * Calculate distance between two points in meters (Haversine formula)
 */
export function calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(deg: number): number {
    return deg * (Math.PI / 180);
}

/**
 * Batch geocode multiple places with rate limiting
 */
export async function batchGeocodePlaces(
    places: Array<{ id: string; name: string; city: string; country: string }>
): Promise<Map<string, { lat: number; lng: number }>> {
    const results = new Map<string, { lat: number; lng: number }>();

    for (const place of places) {
        const coords = await geocodePlace(place.name, place.city, place.country);
        if (coords) {
            results.set(place.id, coords);
        }

        // Rate limit: wait 1 second between requests (Nominatim requirement)
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
}
