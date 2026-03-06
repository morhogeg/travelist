import { useEffect, useRef } from 'react';
import { getRecommendations } from '@/utils/recommendation/recommendation-manager';
import {
    getProximitySettings,
    setProximityEnabled,
    enableAllCities,
    ProximitySettings,
} from '@/utils/proximity/proximity-settings';
import {
    initializeProximity,
    startProximityMonitoring,
    stopProximityMonitoring,
    updateMonitoredPlaces,
    getCachedCoords,
    geocodePlace,
    ProximityPlace,
} from '@/services/proximity';
import { logger } from '@/utils/logger';

/**
 * Build the list of places ready for monitoring (those with cached coordinates)
 * and the list that still need geocoding.
 */
function buildPlaceLists(settings: ProximitySettings): {
    ready: ProximityPlace[];
    uncached: Array<{
        id: string;
        recId?: string;
        name: string;
        city: string;
        country: string;
        cityId: string;
        category: string;
        tip?: string;
    }>;
} {
    const recommendations = getRecommendations();
    const ready: ProximityPlace[] = [];
    const uncached: Array<{
        id: string;
        recId?: string;
        name: string;
        city: string;
        country: string;
        cityId: string;
        category: string;
        tip?: string;
    }> = [];

    for (const rec of recommendations) {
        const cityId = rec.cityId || rec.id;

        // Skip if this city isn't enabled (non-empty list = opt-in whitelist)
        if (settings.enabledCityIds.length > 0 && !settings.enabledCityIds.includes(cityId)) {
            continue;
        }

        for (const place of rec.places || []) {
            const id = place.id || place.recId || `${place.name}-${cityId}`;
            const recId = place.recId;
            const name = place.name;
            const city = rec.city;
            const country = rec.country || '';
            const category = place.category || 'general';
            const tip = place.context?.specificTip || (place.description?.slice(0, 100) ?? undefined);

            // Place already has stored coordinates (rare but possible)
            if (typeof place.lat === 'number' && typeof place.lng === 'number') {
                ready.push({ id, recId, name, category, city, cityId, lat: place.lat, lng: place.lng, tip });
                continue;
            }

            // Check persistent geocode cache
            const cached = getCachedCoords(name, city, country);
            if (cached) {
                ready.push({ id, recId, name, category, city, cityId, lat: cached.lat, lng: cached.lng, tip });
            } else {
                uncached.push({ id, recId, name, city, country, cityId, category, tip });
            }
        }
    }

    return { ready, uncached };
}

/**
 * Auto-enable all cities when turning on proximity for the first time.
 * Without this, enabledCityIds=[] means nothing is monitored.
 */
function autoEnableAllCities(): void {
    const recommendations = getRecommendations();
    const cityIds = [...new Set(
        recommendations
            .map(r => r.cityId || r.id)
            .filter(Boolean)
    )];
    if (cityIds.length > 0) {
        enableAllCities(cityIds);
        logger.debug('ProximityMonitor', `Auto-enabled ${cityIds.length} cities`);
    }
}

/**
 * useProximityMonitor — lives at the App level.
 *
 * Responsibilities:
 * 1. On mount: if proximity is enabled in settings, start GPS monitoring.
 * 2. Geocode places without cached coordinates in the background (rate-limited to 1/sec).
 * 3. Restart monitoring when settings change (distance, city list, enabled toggle).
 * 4. Update monitored places when recommendations change (new place saved).
 */
export function useProximityMonitor(): void {
    const cancelGeocodingRef = useRef(false);
    const currentPlacesRef = useRef<ProximityPlace[]>([]);

    const geocodeInBackground = async (
        places: Array<{
            id: string;
            recId?: string;
            name: string;
            city: string;
            country: string;
            cityId: string;
            category: string;
            tip?: string;
        }>
    ) => {
        for (const place of places) {
            if (cancelGeocodingRef.current) break;

            const coords = await geocodePlace(place.name, place.city, place.country);

            if (coords && !cancelGeocodingRef.current) {
                const newPlace: ProximityPlace = {
                    id: place.id,
                    recId: place.recId,
                    name: place.name,
                    category: place.category,
                    city: place.city,
                    cityId: place.cityId,
                    lat: coords.lat,
                    lng: coords.lng,
                    tip: place.tip,
                };

                currentPlacesRef.current = [...currentPlacesRef.current, newPlace];
                await updateMonitoredPlaces(currentPlacesRef.current);
                logger.debug('ProximityMonitor', `Added geocoded place: ${place.name} (${coords.lat}, ${coords.lng})`);
            }

            // Nominatim rate limit: 1 request/second
            await new Promise(resolve => setTimeout(resolve, 1100));
        }
    };

    const startMonitoring = async () => {
        const settings = getProximitySettings();
        if (!settings.enabled) return;

        // First-time setup: auto-enable all cities so monitoring works out of the box
        if (settings.enabledCityIds.length === 0) {
            autoEnableAllCities();
        }

        const ok = await initializeProximity();
        if (!ok) {
            // Permission denied — disable the setting so UI reflects reality
            setProximityEnabled(false);
            return;
        }

        const { ready, uncached } = buildPlaceLists(getProximitySettings()); // re-read after autoEnable
        currentPlacesRef.current = ready;

        await startProximityMonitoring(ready);
        logger.info('ProximityMonitor', `Started with ${ready.length} ready, ${uncached.length} to geocode`);

        if (uncached.length > 0) {
            cancelGeocodingRef.current = false;
            geocodeInBackground(uncached);
        }
    };

    const stopMonitoring = async () => {
        cancelGeocodingRef.current = true;
        await stopProximityMonitoring();
        currentPlacesRef.current = [];
    };

    const handleSettingsChange = async (e: Event) => {
        const settings = (e as CustomEvent<ProximitySettings>).detail;
        // Always restart — covers enabled/disabled toggle, distance changes, city changes
        await stopMonitoring();
        if (settings.enabled) {
            await startMonitoring();
        }
    };

    const handleDataChange = async () => {
        const settings = getProximitySettings();
        if (!settings.enabled) return;

        // Rebuild place list with updated recommendations
        const { ready, uncached } = buildPlaceLists(settings);
        currentPlacesRef.current = ready;
        await updateMonitoredPlaces(ready);

        if (uncached.length > 0) {
            cancelGeocodingRef.current = false;
            geocodeInBackground(uncached);
        }
    };

    useEffect(() => {
        startMonitoring();

        window.addEventListener('proximitySettingsChanged', handleSettingsChange);
        window.addEventListener('recommendationAdded', handleDataChange);
        window.addEventListener('recommendationDeleted', handleDataChange);
        window.addEventListener('recommendationUpdated', handleDataChange);

        return () => {
            cancelGeocodingRef.current = true;
            stopProximityMonitoring();
            window.removeEventListener('proximitySettingsChanged', handleSettingsChange);
            window.removeEventListener('recommendationAdded', handleDataChange);
            window.removeEventListener('recommendationDeleted', handleDataChange);
            window.removeEventListener('recommendationUpdated', handleDataChange);
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
