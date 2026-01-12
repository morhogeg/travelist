import { Geolocation, Position, WatchPositionCallback } from '@capacitor/geolocation';
import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';
import {
    getProximitySettings,
    markPlaceNotified,
    hasPlaceBeenNotified
} from '@/utils/proximity/proximity-settings';
import {
    getCurrentLocation,
    calculateDistance
} from './geocoding-service';

// Types
interface ProximityPlace {
    id: string;
    recId?: string;
    name: string;
    category: string;
    city: string;
    cityId: string;
    lat: number;
    lng: number;
    tip?: string;
}

// Singleton state
let watchId: string | null = null;
let monitoredPlaces: ProximityPlace[] = [];
let isInitialized = false;

/**
 * Initialize the proximity service
 */
export async function initializeProximity(): Promise<boolean> {
    try {
        // Check and request location permissions
        const permission = await Geolocation.checkPermissions();

        if (permission.location === 'denied') {
            console.log('[ProximityService] Location permission denied');
            return false;
        }

        if (permission.location === 'prompt' || permission.location === 'prompt-with-rationale') {
            const result = await Geolocation.requestPermissions();
            if (result.location === 'denied') {
                console.log('[ProximityService] Location permission denied after request');
                return false;
            }
        }

        // Request notification permissions
        const notifPermission = await LocalNotifications.checkPermissions();
        if (notifPermission.display === 'prompt') {
            await LocalNotifications.requestPermissions();
        }

        // Set up notification action handlers
        await setupNotificationListeners();

        isInitialized = true;
        console.log('[ProximityService] Initialized successfully');
        return true;
    } catch (error) {
        console.error('[ProximityService] Initialization error:', error);
        return false;
    }
}

/**
 * Start monitoring for proximity to places
 */
export async function startProximityMonitoring(
    places: ProximityPlace[]
): Promise<void> {
    const settings = getProximitySettings();

    if (!settings.enabled) {
        console.log('[ProximityService] Proximity disabled, not starting monitoring');
        return;
    }

    if (!isInitialized) {
        const success = await initializeProximity();
        if (!success) return;
    }

    // Filter places to only those in enabled cities with valid coordinates
    monitoredPlaces = places.filter(
        place =>
            settings.enabledCityIds.includes(place.cityId) &&
            place.lat !== undefined &&
            place.lng !== undefined
    );

    console.log(`[ProximityService] Monitoring ${monitoredPlaces.length} places from ${settings.enabledCityIds.length} cities`);

    // Stop existing watch if any
    if (watchId) {
        await Geolocation.clearWatch({ id: watchId });
    }

    // Start watching position
    watchId = await Geolocation.watchPosition(
        {
            enableHighAccuracy: false, // Battery efficient
            timeout: 30000,
            maximumAge: 60000 // Accept 1-minute-old positions
        },
        (position, err) => {
            if (err) {
                console.error('[ProximityService] Watch position error:', err);
                return;
            }
            if (position) {
                checkProximity(position);
            }
        }
    );
}

/**
 * Stop proximity monitoring
 */
export async function stopProximityMonitoring(): Promise<void> {
    if (watchId) {
        await Geolocation.clearWatch({ id: watchId });
        watchId = null;
        console.log('[ProximityService] Stopped monitoring');
    }
}

/**
 * Check if user is near any monitored places
 */
function checkProximity(position: Position): void {
    const settings = getProximitySettings();
    const userLat = position.coords.latitude;
    const userLng = position.coords.longitude;

    for (const place of monitoredPlaces) {
        // Skip if already notified
        const placeKey = place.recId || place.id;
        if (hasPlaceBeenNotified(placeKey)) continue;

        const distance = calculateDistance(userLat, userLng, place.lat, place.lng);

        if (distance <= settings.distanceMeters) {
            console.log(`[ProximityService] User is ${Math.round(distance)}m from "${place.name}"`);
            sendProximityNotification(place, Math.round(distance));
            markPlaceNotified(placeKey);
        }
    }
}

/**
 * Send a local notification for a nearby place
 */
async function sendProximityNotification(
    place: ProximityPlace,
    distanceMeters: number
): Promise<void> {
    const distanceText = distanceMeters < 1000
        ? `${distanceMeters}m away`
        : `${(distanceMeters / 1000).toFixed(1)}km away`;

    const notification: ScheduleOptions = {
        notifications: [
            {
                id: Math.floor(Math.random() * 100000),
                title: `📍 ${place.name}`,
                body: place.tip
                    ? `${distanceText} • ${place.tip}`
                    : `${distanceText} in ${place.city}`,
                extra: {
                    placeId: place.id,
                    recId: place.recId,
                    placeName: place.name,
                    cityId: place.cityId,
                    action: 'proximity'
                },
                schedule: { at: new Date() }
            }
        ]
    };

    await LocalNotifications.schedule(notification);
    console.log(`[ProximityService] Sent notification for "${place.name}"`);
}

/**
 * Set up notification action handlers
 */
async function setupNotificationListeners(): Promise<void> {
    // Listen for notification tap (no quick actions, just open the place card)
    LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
        const { notification: notif } = notification;
        const extra = notif.extra as { placeId?: string; recId?: string; placeName?: string; cityId?: string };

        console.log(`[ProximityService] Notification tapped for place: ${extra?.placeName}`);

        // Dispatch event for the app to open the place card
        window.dispatchEvent(new CustomEvent('proximityPlaceTapped', {
            detail: {
                placeId: extra?.placeId,
                recId: extra?.recId,
                placeName: extra?.placeName,
                cityId: extra?.cityId
            }
        }));
    });
}

/**
 * Update monitored places (call when recommendations change)
 */
export async function updateMonitoredPlaces(
    places: ProximityPlace[]
): Promise<void> {
    const settings = getProximitySettings();

    if (!settings.enabled || !isInitialized) return;

    monitoredPlaces = places.filter(
        place =>
            settings.enabledCityIds.includes(place.cityId) &&
            place.lat !== undefined &&
            place.lng !== undefined
    );

    console.log(`[ProximityService] Updated to monitor ${monitoredPlaces.length} places`);
}

/**
 * Get proximity monitoring status
 */
export function getProximityStatus(): {
    isMonitoring: boolean;
    monitoredCount: number;
} {
    return {
        isMonitoring: watchId !== null,
        monitoredCount: monitoredPlaces.length
    };
}
