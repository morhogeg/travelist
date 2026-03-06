import { Geolocation, Position } from '@capacitor/geolocation';
import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';
import {
    getProximitySettings,
    markPlaceNotified,
    hasPlaceBeenNotified,
} from '@/utils/proximity/proximity-settings';
import { calculateDistance } from './geocoding-service';
import { logger } from '@/utils/logger';

export interface ProximityPlace {
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
 * Request location + notification permissions and set up notification tap listener.
 * Safe to call multiple times.
 */
export async function initializeProximity(): Promise<boolean> {
    try {
        const permission = await Geolocation.checkPermissions();

        if (permission.location === 'denied') {
            logger.warn('ProximityService', 'Location permission denied');
            return false;
        }

        if (permission.location === 'prompt' || permission.location === 'prompt-with-rationale') {
            const result = await Geolocation.requestPermissions();
            if (result.location === 'denied') {
                logger.warn('ProximityService', 'Location permission denied after request');
                return false;
            }
        }

        // Request notification permissions
        const notifPerm = await LocalNotifications.checkPermissions();
        if (notifPerm.display === 'prompt') {
            await LocalNotifications.requestPermissions();
        }

        if (!isInitialized) {
            await setupNotificationListeners();
            isInitialized = true;
        }

        logger.info('ProximityService', 'Initialized successfully');
        return true;
    } catch (error) {
        logger.error('ProximityService', 'Initialization error:', error);
        return false;
    }
}

/**
 * Start (or restart) the GPS watch and proximity checks.
 * Call this with the full list of places to monitor.
 */
export async function startProximityMonitoring(places: ProximityPlace[]): Promise<void> {
    const settings = getProximitySettings();

    if (!settings.enabled) {
        logger.debug('ProximityService', 'Proximity disabled — skipping start');
        return;
    }

    if (!isInitialized) {
        const ok = await initializeProximity();
        if (!ok) return;
    }

    // Keep only places with valid coordinates
    monitoredPlaces = places.filter(p => typeof p.lat === 'number' && typeof p.lng === 'number');
    logger.info('ProximityService', `Monitoring ${monitoredPlaces.length} places`);

    // Clear any existing watch before starting a new one
    if (watchId !== null) {
        await Geolocation.clearWatch({ id: watchId });
        watchId = null;
    }

    watchId = await Geolocation.watchPosition(
        {
            enableHighAccuracy: true,  // GPS accuracy needed for sub-500m detection
            timeout: 30000,
            maximumAge: 30000,         // Accept positions up to 30s old
        },
        (position, err) => {
            if (err) {
                logger.error('ProximityService', 'watchPosition error:', err);
                return;
            }
            if (position) checkProximity(position);
        }
    );

    logger.debug('ProximityService', `GPS watch started (watchId: ${watchId})`);
}

/**
 * Stop GPS watch and clear monitored places.
 */
export async function stopProximityMonitoring(): Promise<void> {
    if (watchId !== null) {
        await Geolocation.clearWatch({ id: watchId });
        watchId = null;
        logger.debug('ProximityService', 'GPS watch stopped');
    }
    monitoredPlaces = [];
}

/**
 * Update the list of monitored places without restarting the GPS watch.
 * Use this when new places are geocoded or places change.
 */
export async function updateMonitoredPlaces(places: ProximityPlace[]): Promise<void> {
    monitoredPlaces = places.filter(p => typeof p.lat === 'number' && typeof p.lng === 'number');
    logger.debug('ProximityService', `Updated to ${monitoredPlaces.length} monitored places`);
}

/**
 * Check whether the user is within alert distance of any monitored place.
 */
function checkProximity(position: Position): void {
    const settings = getProximitySettings();
    const { latitude: userLat, longitude: userLng, accuracy } = position.coords;

    // Skip updates where GPS error radius is larger than the alert distance.
    // Cap threshold at 300m so we still work in areas with poor GPS lock.
    const accuracyThreshold = Math.min(settings.distanceMeters, 300);
    if (accuracy !== null && accuracy > accuracyThreshold) {
        logger.debug(
            'ProximityService',
            `Low accuracy (${Math.round(accuracy)}m > ${Math.round(accuracyThreshold)}m threshold) — skipping`
        );
        return;
    }

    for (const place of monitoredPlaces) {
        const placeKey = place.recId || place.id;
        if (hasPlaceBeenNotified(placeKey)) continue;

        const distance = calculateDistance(userLat, userLng, place.lat, place.lng);

        if (distance <= settings.distanceMeters) {
            logger.info('ProximityService', `"${place.name}" is ${Math.round(distance)}m away — sending notification`);
            sendProximityNotification(place, Math.round(distance));
            markPlaceNotified(placeKey);
        }
    }
}

/**
 * Fire an immediate local notification for a nearby place.
 */
async function sendProximityNotification(place: ProximityPlace, distanceMeters: number): Promise<void> {
    const distanceText = distanceMeters < 1000
        ? `${distanceMeters}m away`
        : `${(distanceMeters / 1000).toFixed(1)}km away`;

    const notification: ScheduleOptions = {
        notifications: [
            {
                id: Math.floor(Math.random() * 2_000_000),
                title: `📍 ${place.name}`,
                body: place.tip
                    ? `${distanceText} · ${place.tip}`
                    : `${distanceText} in ${place.city}`,
                extra: {
                    placeId: place.id,
                    recId: place.recId,
                    placeName: place.name,
                    cityId: place.cityId,
                    action: 'proximity',
                },
                // Schedule 500ms in the future — scheduling at exactly "now" can fail
                schedule: { at: new Date(Date.now() + 500) },
            },
        ],
    };

    try {
        await LocalNotifications.schedule(notification);
        logger.debug('ProximityService', `Notification sent for "${place.name}"`);
    } catch (error) {
        logger.error('ProximityService', 'Failed to schedule notification:', error);
    }
}

/**
 * Set up listener for notification taps (fires even when app is backgrounded).
 * Only registered once per session.
 */
async function setupNotificationListeners(): Promise<void> {
    LocalNotifications.addListener('localNotificationActionPerformed', (event) => {
        const extra = event.notification.extra as {
            placeId?: string;
            recId?: string;
            placeName?: string;
            cityId?: string;
        };

        logger.debug('ProximityService', `Notification tapped: ${extra?.placeName}`);

        window.dispatchEvent(
            new CustomEvent('proximityPlaceTapped', {
                detail: {
                    placeId: extra?.placeId,
                    recId: extra?.recId,
                    placeName: extra?.placeName,
                    cityId: extra?.cityId,
                },
            })
        );
    });
}

export function getProximityStatus(): { isMonitoring: boolean; monitoredCount: number } {
    return {
        isMonitoring: watchId !== null,
        monitoredCount: monitoredPlaces.length,
    };
}
