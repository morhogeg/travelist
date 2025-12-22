import { Capacitor } from '@capacitor/core';

export interface MapExportPlace {
    name: string;
    address?: string;
    city?: string;
    country?: string;
    lat?: number;
    lng?: number;
}

/**
 * Opens a URL
 */
const openUrl = async (url: string) => {
    // On iOS, window.open with _blank works for universal links and schemes if allowed
    window.open(url, '_blank');
};

/**
 * Generates a query string for a place
 */
const getPlaceQuery = (place: MapExportPlace): string => {
    if (place.lat && place.lng) {
        return `${place.lat},${place.lng}`;
    }
    const parts = [place.name, place.address, place.city, place.country].filter(Boolean);
    return encodeURIComponent(parts.join(', '));
};

/**
 * Exports a list of places to Google Maps
 * Supports multi-stop routing
 */
export const exportToGoogleMaps = async (places: MapExportPlace[]) => {
    if (places.length === 0) return;

    if (places.length === 1) {
        // Single destination
        const query = getPlaceQuery(places[0]);
        const url = `https://www.google.com/maps/search/?api=1&query=${query}`;

        // On iOS, try to open comgooglemaps:// if possible
        if (Capacitor.getPlatform() === 'ios') {
            // We can't easily check if installed without the plugin, so we'll just try the web URL
            // which will redirect to the app if installed and universal links are set up,
            // or we can try the scheme and fallback.
            // For now, let's stick to the web URL which is safer.
            // If we really want to force app:
            // window.location.href = `comgooglemaps://?q=${query}`;
            // But that breaks if not installed.
        }

        await openUrl(url);
        return;
    }

    // Multi-stop route
    // https://www.google.com/maps/dir/Place1/Place2/Place3
    const destinations = places.map(p => getPlaceQuery(p)).join('/');
    const url = `https://www.google.com/maps/dir/${destinations}`;

    await openUrl(url);
};

/**
 * Exports a list of places to Apple Maps
 * Supports multi-stop routing
 */
export const exportToAppleMaps = async (places: MapExportPlace[]) => {
    if (places.length === 0) return;

    // Apple Maps URL scheme: maps://?daddr=Address
    // Multiple destinations: maps://?daddr=A&daddr=B (treats as route)

    const destinations = places.map(p => `daddr=${getPlaceQuery(p)}`).join('&');
    const url = `maps://?${destinations}&dirflg=d`; // dirflg=d for driving

    await openUrl(url);
};
