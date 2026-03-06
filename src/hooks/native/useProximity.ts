import { useState, useEffect, useCallback } from 'react';
import { Geolocation, PermissionStatus } from '@capacitor/geolocation';
import {
    getProximitySettings,
    setProximityEnabled,
    setProximityDistance,
    toggleCityProximity,
    isCityProximityEnabled,
    enableAllCities,
    disableAllCities,
    ProximitySettings,
} from '@/utils/proximity/proximity-settings';
import { initializeProximity, stopProximityMonitoring } from '@/services/proximity';

interface UseProximityReturn {
    isEnabled: boolean;
    distanceMeters: number;
    enabledCityCount: number;
    permissionStatus: 'granted' | 'denied' | 'prompt' | 'unknown';
    toggleEnabled: () => Promise<boolean>;
    setDistance: (meters: number) => void;
    toggleCity: (cityId: string) => boolean;
    isCityEnabled: (cityId: string) => boolean;
    enableAll: (cityIds: string[]) => void;
    disableAll: () => void;
    isLoading: boolean;
}

export function useProximity(): UseProximityReturn {
    const [settings, setSettings] = useState<ProximitySettings>(getProximitySettings);
    const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        checkPermissions();

        const handleSettingsChange = (e: Event) => {
            setSettings((e as CustomEvent<ProximitySettings>).detail);
        };

        window.addEventListener('proximitySettingsChanged', handleSettingsChange);
        return () => {
            window.removeEventListener('proximitySettingsChanged', handleSettingsChange);
        };
    }, []);

    const checkPermissions = async () => {
        try {
            const permission = await Geolocation.checkPermissions();
            mapPermissionStatus(permission);
        } catch {
            setPermissionStatus('unknown');
        }
    };

    const mapPermissionStatus = (permission: PermissionStatus) => {
        switch (permission.location) {
            case 'granted': setPermissionStatus('granted'); break;
            case 'denied': setPermissionStatus('denied'); break;
            case 'prompt':
            case 'prompt-with-rationale': setPermissionStatus('prompt'); break;
            default: setPermissionStatus('unknown');
        }
    };

    const toggleEnabled = useCallback(async (): Promise<boolean> => {
        setIsLoading(true);
        try {
            if (!settings.enabled) {
                // Request permissions — the monitor hook (useProximityMonitor in App.tsx)
                // will automatically start monitoring via the 'proximitySettingsChanged' event.
                const success = await initializeProximity();
                if (!success) return false;

                setProximityEnabled(true); // fires 'proximitySettingsChanged'
                await checkPermissions();
                return true;
            } else {
                await stopProximityMonitoring();
                setProximityEnabled(false); // fires 'proximitySettingsChanged'
                return true;
            }
        } finally {
            setIsLoading(false);
        }
    }, [settings.enabled]);

    const setDistance = useCallback((meters: number) => {
        setProximityDistance(meters); // fires 'proximitySettingsChanged' → monitor restarts
    }, []);

    const toggleCity = useCallback((cityId: string): boolean => {
        const newState = toggleCityProximity(cityId); // fires 'proximitySettingsChanged' → monitor restarts
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
        isLoading,
    };
}
