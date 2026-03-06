/**
 * Proximity settings stored in localStorage
 */

const STORAGE_KEY = 'travelist-proximity-settings';
const NOTIFICATION_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface ProximitySettings {
    enabled: boolean;
    distanceMeters: number;
    enabledCityIds: string[];
    // placeId → timestamp (ms) of last notification. Replaces old string[] array.
    notifiedPlaces: Record<string, number>;
}

const DEFAULT_SETTINGS: ProximitySettings = {
    enabled: false,
    distanceMeters: 500,
    enabledCityIds: [],
    notifiedPlaces: {},
};

/**
 * Migrate from old format (notifiedPlaceIds: string[]) to new Record<string, number>
 */
function migrate(raw: any): ProximitySettings {
    const s: ProximitySettings = { ...DEFAULT_SETTINGS, ...raw };

    // Old format had notifiedPlaceIds: string[]
    if (Array.isArray(raw?.notifiedPlaceIds)) {
        // Drop old IDs — let places re-notify fresh after upgrade
        delete (s as any).notifiedPlaceIds;
    }

    if (!s.notifiedPlaces || typeof s.notifiedPlaces !== 'object' || Array.isArray(s.notifiedPlaces)) {
        s.notifiedPlaces = {};
    }

    return s;
}

export function getProximitySettings(): ProximitySettings {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return migrate(JSON.parse(stored));
    } catch {
        // ignore parse errors
    }
    return { ...DEFAULT_SETTINGS, notifiedPlaces: {} };
}

function saveSettings(settings: ProximitySettings): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        window.dispatchEvent(new CustomEvent('proximitySettingsChanged', { detail: settings }));
    } catch {
        // ignore
    }
}

export function setProximityEnabled(enabled: boolean): void {
    const settings = getProximitySettings();
    settings.enabled = enabled;
    saveSettings(settings);
}

export function setProximityDistance(meters: number): void {
    const settings = getProximitySettings();
    settings.distanceMeters = Math.max(100, Math.min(2000, meters));
    saveSettings(settings);
}

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

export function isCityProximityEnabled(cityId: string): boolean {
    const settings = getProximitySettings();
    return settings.enabledCityIds.includes(cityId);
}

/**
 * Mark a place as notified. Uses current timestamp for 24h cooldown.
 */
export function markPlaceNotified(placeId: string): void {
    const settings = getProximitySettings();
    settings.notifiedPlaces[placeId] = Date.now();
    saveSettings(settings);
}

/**
 * Returns true only if the place was notified within the last 24 hours.
 * After 24h the place can trigger again.
 */
export function hasPlaceBeenNotified(placeId: string): boolean {
    const settings = getProximitySettings();
    const ts = settings.notifiedPlaces[placeId];
    if (!ts) return false;
    return Date.now() - ts < NOTIFICATION_COOLDOWN_MS;
}

export function resetNotifiedPlaces(): void {
    const settings = getProximitySettings();
    settings.notifiedPlaces = {};
    saveSettings(settings);
}

export function enableAllCities(cityIds: string[]): void {
    const settings = getProximitySettings();
    settings.enabledCityIds = [...new Set([...settings.enabledCityIds, ...cityIds])];
    saveSettings(settings);
}

export function disableAllCities(): void {
    const settings = getProximitySettings();
    settings.enabledCityIds = [];
    saveSettings(settings);
}

export function getEnabledCityCount(): number {
    return getProximitySettings().enabledCityIds.length;
}
