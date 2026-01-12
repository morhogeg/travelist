/**
 * Proximity settings stored in localStorage
 */

const STORAGE_KEY = 'travelist-proximity-settings';

export interface ProximitySettings {
    enabled: boolean;
    distanceMeters: number;
    enabledCityIds: string[];
    notifiedPlaceIds: string[];
}

const DEFAULT_SETTINGS: ProximitySettings = {
    enabled: false,
    distanceMeters: 500, // Default 500m
    enabledCityIds: [],
    notifiedPlaceIds: []
};

/**
 * Get current proximity settings
 */
export function getProximitySettings(): ProximitySettings {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
        }
    } catch (error) {
        console.error('[ProximitySettings] Error reading settings:', error);
    }
    return { ...DEFAULT_SETTINGS };
}

/**
 * Save proximity settings
 */
function saveSettings(settings: ProximitySettings): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        window.dispatchEvent(new CustomEvent('proximitySettingsChanged', { detail: settings }));
    } catch (error) {
        console.error('[ProximitySettings] Error saving settings:', error);
    }
}

/**
 * Set global proximity enabled state
 */
export function setProximityEnabled(enabled: boolean): void {
    const settings = getProximitySettings();
    settings.enabled = enabled;
    saveSettings(settings);
}

/**
 * Set proximity distance (in meters)
 */
export function setProximityDistance(meters: number): void {
    const settings = getProximitySettings();
    settings.distanceMeters = Math.max(100, Math.min(2000, meters));
    saveSettings(settings);
}

/**
 * Toggle proximity for a specific city
 */
export function toggleCityProximity(cityId: string): boolean {
    const settings = getProximitySettings();
    const index = settings.enabledCityIds.indexOf(cityId);

    if (index >= 0) {
        settings.enabledCityIds.splice(index, 1);
        saveSettings(settings);
        return false;
    } else {
        settings.enabledCityIds.push(cityId);
        saveSettings(settings);
        return true;
    }
}

/**
 * Set city proximity enabled/disabled directly
 */
export function setCityProximity(cityId: string, enabled: boolean): void {
    const settings = getProximitySettings();
    const index = settings.enabledCityIds.indexOf(cityId);

    if (enabled && index < 0) {
        settings.enabledCityIds.push(cityId);
        saveSettings(settings);
    } else if (!enabled && index >= 0) {
        settings.enabledCityIds.splice(index, 1);
        saveSettings(settings);
    }
}

/**
 * Check if a city has proximity enabled
 */
export function isCityProximityEnabled(cityId: string): boolean {
    const settings = getProximitySettings();
    return settings.enabledCityIds.includes(cityId);
}

/**
 * Mark a place as notified (to avoid duplicate notifications)
 */
export function markPlaceNotified(placeId: string): void {
    const settings = getProximitySettings();
    if (!settings.notifiedPlaceIds.includes(placeId)) {
        settings.notifiedPlaceIds.push(placeId);
        saveSettings(settings);
    }
}

/**
 * Check if a place has been notified
 */
export function hasPlaceBeenNotified(placeId: string): boolean {
    const settings = getProximitySettings();
    return settings.notifiedPlaceIds.includes(placeId);
}

/**
 * Reset notified places (e.g., when user wants to be notified again)
 */
export function resetNotifiedPlaces(): void {
    const settings = getProximitySettings();
    settings.notifiedPlaceIds = [];
    saveSettings(settings);
}

/**
 * Enable all cities
 */
export function enableAllCities(cityIds: string[]): void {
    const settings = getProximitySettings();
    settings.enabledCityIds = [...new Set([...settings.enabledCityIds, ...cityIds])];
    saveSettings(settings);
}

/**
 * Disable all cities
 */
export function disableAllCities(): void {
    const settings = getProximitySettings();
    settings.enabledCityIds = [];
    saveSettings(settings);
}

/**
 * Get count of enabled cities
 */
export function getEnabledCityCount(): number {
    const settings = getProximitySettings();
    return settings.enabledCityIds.length;
}
