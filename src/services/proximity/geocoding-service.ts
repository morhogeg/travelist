import { Geolocation } from '@capacitor/geolocation';
import { logger } from '@/utils/logger';

const CACHE_KEY = 'travelist-geocode-cache';

// In-memory cache (fast) backed by localStorage (persistent across sessions)
const geocodeCache: Map<string, { lat: number; lng: number }> = new Map();

function cacheKey(name: string, city: string, country: string): string {
    return `${name.toLowerCase().trim()}|${city.toLowerCase().trim()}|${country.toLowerCase().trim()}`;
}

function loadCache(): void {
    try {
        const stored = localStorage.getItem(CACHE_KEY);
        if (!stored) return;
        const data = JSON.parse(stored) as Record<string, { lat: number; lng: number }>;
        for (const [k, v] of Object.entries(data)) {
            if (v && typeof v.lat === 'number' && typeof v.lng === 'number') {
                geocodeCache.set(k, v);
            }
        }
        logger.debug('Geocoding', `Loaded ${geocodeCache.size} cached coordinates from storage`);
    } catch {
        // ignore
    }
}

function saveCache(): void {
    try {
        const data: Record<string, { lat: number; lng: number }> = {};
        for (const [k, v] of geocodeCache) {
            data[k] = v;
        }
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch {
        // ignore
    }
}

// Load on module init
loadCache();

/**
 * Get cached coordinates for a place without making a network request.
 * Returns null if not cached.
 */
export function getCachedCoords(
    name: string,
    city: string,
    country: string
): { lat: number; lng: number } | null {
    return geocodeCache.get(cacheKey(name, city, country)) ?? null;
}

/**
 * Geocode a place using Nominatim. Result is persisted to localStorage.
 */
export async function geocodePlace(
    name: string,
    city: string,
    country: string
): Promise<{ lat: number; lng: number } | null> {
    const key = cacheKey(name, city, country);

    if (geocodeCache.has(key)) {
        return geocodeCache.get(key)!;
    }

    try {
        // Only search for the specific place — never fall back to city-center coords.
        // City-center coordinates would trigger false notifications for every place
        // in that city when the user is near the city center.
        const query = `${name}, ${city}, ${country}`;
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
            { headers: { 'User-Agent': 'Travelist/1.0 (contact@travelist.app)' } }
        );

        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                const coords = {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon),
                };
                geocodeCache.set(key, coords);
                saveCache();
                logger.debug('Geocoding', `Geocoded "${name}" in ${city}: ${coords.lat}, ${coords.lng}`);
                return coords;
            }
        }

        // Place not found in OpenStreetMap — skip it rather than using inaccurate coords.
        logger.warn('Geocoding', `No result for "${name}" in ${city}, ${country} — place will not be monitored`);
        return null;
    } catch (error) {
        logger.error('Geocoding', 'Geocode request failed:', error);
        return null;
    }
}

/**
 * Get current device location
 */
export async function getCurrentLocation(): Promise<{ lat: number; lng: number } | null> {
    try {
        const permission = await Geolocation.checkPermissions();
        if (permission.location === 'denied') return null;
        if (permission.location === 'prompt' || permission.location === 'prompt-with-rationale') {
            await Geolocation.requestPermissions();
        }

        const position = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 10000,
        });

        return {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
        };
    } catch (error) {
        logger.error('Geocoding', 'Error getting current location:', error);
        return null;
    }
}

/**
 * Haversine distance in meters between two lat/lng points
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
    return deg * (Math.PI / 180);
}

/**
 * Batch geocode with Nominatim rate limiting (1 req/second)
 */
export async function batchGeocodePlaces(
    places: Array<{ id: string; name: string; city: string; country: string }>
): Promise<Map<string, { lat: number; lng: number }>> {
    const results = new Map<string, { lat: number; lng: number }>();

    for (const place of places) {
        const coords = await geocodePlace(place.name, place.city, place.country);
        if (coords) results.set(place.id, coords);
        await new Promise(resolve => setTimeout(resolve, 1100));
    }

    return results;
}
