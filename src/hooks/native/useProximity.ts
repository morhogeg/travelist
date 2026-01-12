import { useState, useEffect, useCallback } from 'react';
import { Geolocation, PermissionStatus } from '@capacitor/geolocation';
import {
    getProximitySettings,
    setProximityEnabled,
    setProximityDistance,
    toggleCityProximity,
    setCityProximity,
    isCityProximityEnabled,
    getEnabledCityCount,
    enableAllCities,
    disableAllCities,
    ProximitySettings
} from '@/utils/proximity/proximity-settings';
import {
    initializeProximity,
    startProximityMonitoring,
    stopProximityMonitoring
} from '@/services/proximity';

interface UseProximityReturn {
    // Settings
    isEnabled: boolean;
    distanceMeters: number;
    enabledCityCount: number;

    // Permission
    permissionStatus: 'granted' | 'denied' | 'prompt' | 'unknown';

    // Actions
    toggleEnabled: () => Promise<boolean>;
    setDistance: (meters: number) => void;
    toggleCity: (cityId: string) => boolean;
    isCityEnabled: (cityId: string) => boolean;
    enableAll: (cityIds: string[]) => void;
    disableAll: () => void;

    // Loading
    isLoading: boolean;
}

export function useProximity(): UseProximityReturn {
    const [settings, setSettings] = useState<ProximitySettings>(getProximitySettings);
    const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
    const [isLoading, setIsLoading] = useState(false);

    // Check permission status on mount
    useEffect(() => {
        checkPermissions();

        // Listen for settings changes
        const handleSettingsChange = (e: CustomEvent<ProximitySettings>) => {
            setSettings(e.detail);
        };

        window.addEventListener('proximitySettingsChanged', handleSettingsChange as EventListener);

        return () => {
            window.removeEventListener('proximitySettingsChanged', handleSettingsChange as EventListener);
        };
    }, []);

    const checkPermissions = async () => {
        try {
            const permission = await Geolocation.checkPermissions();
            mapPermissionStatus(permission);
        } catch (error) {
            console.error('[useProximity] Error checking permissions:', error);
            setPermissionStatus('unknown');
        }
    };

    const mapPermissionStatus = (permission: PermissionStatus) => {
        switch (permission.location) {
            case 'granted':
                setPermissionStatus('granted');
                break;
            case 'denied':
                setPermissionStatus('denied');
                break;
            case 'prompt':
            case 'prompt-with-rationale':
                setPermissionStatus('prompt');
                break;
            default:
                setPermissionStatus('unknown');
        }
    };

    const toggleEnabled = useCallback(async (): Promise<boolean> => {
        setIsLoading(true);

        try {
            if (!settings.enabled) {
                // Enabling - need to request permissions and initialize
                const success = await initializeProximity();

                if (success) {
                    setProximityEnabled(true);
                    setSettings(prev => ({ ...prev, enabled: true }));
                    await checkPermissions();
                    return true;
                } else {
                    return false;
                }
            } else {
                // Disabling
                await stopProximityMonitoring();
                setProximityEnabled(false);
                setSettings(prev => ({ ...prev, enabled: false }));
                return true;
            }
        } finally {
            setIsLoading(false);
        }
    }, [settings.enabled]);

    const setDistance = useCallback((meters: number) => {
        setProximityDistance(meters);
        setSettings(prev => ({ ...prev, distanceMeters: meters }));
    }, []);

    const toggleCity = useCallback((cityId: string): boolean => {
        const newState = toggleCityProximity(cityId);
        setSettings(getProximitySettings());
        return newState;
    }, []);

    const isCityEnabled = useCallback((cityId: string): boolean => {
        return isCityProximityEnabled(cityId);
    }, []);

    const enableAll = useCallback((cityIds: string[]) => {
        enableAllCities(cityIds);
        setSettings(getProximitySettings());
    }, []);

    const disableAll = useCallback(() => {
        disableAllCities();
        setSettings(getProximitySettings());
    }, []);

    return {
        isEnabled: settings.enabled,
        distanceMeters: settings.distanceMeters,
        enabledCityCount: settings.enabledCityIds.length,
        permissionStatus,
        toggleEnabled,
        setDistance,
        toggleCity,
        isCityEnabled,
        enableAll,
        disableAll,
        isLoading
    };
}
