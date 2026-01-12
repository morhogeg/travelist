import React, { useState } from 'react';
import { MapPin, ChevronRight, AlertCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useProximity } from '@/hooks/native/useProximity';
import { lightHaptic } from '@/utils/ios/haptics';
import { motion } from 'framer-motion';
import ProximityCityManager from './ProximityCityManager';

interface ProximitySettingsProps {
    allCities: Array<{ cityId: string; cityName: string; placeCount: number }>;
}

const ProximitySettings: React.FC<ProximitySettingsProps> = ({ allCities }) => {
    const {
        isEnabled,
        distanceMeters,
        enabledCityCount,
        permissionStatus,
        toggleEnabled,
        setDistance,
        isLoading
    } = useProximity();

    const [showCityManager, setShowCityManager] = useState(false);

    const handleToggle = async () => {
        lightHaptic();
        await toggleEnabled();
    };

    const handleDistanceChange = (value: number[]) => {
        setDistance(value[0]);
        lightHaptic();
    };

    const formatDistance = (meters: number): string => {
        if (meters >= 1000) {
            return `${(meters / 1000).toFixed(1)} km`;
        }
        return `${meters} m`;
    };

    return (
        <>
            {/* Main Toggle Row */}
            <motion.div
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 px-1 ios26-transition-smooth flex items-center gap-3"
            >
                <MapPin className="h-5 w-5 shrink-0" style={{ color: '#667eea' }} />
                <div className="flex-1 text-left min-w-0">
                    <p className="font-medium text-[15px]">Proximity Alerts</p>
                    <p className="text-xs text-muted-foreground">
                        Get notified when near saved places.
                    </p>
                </div>
                <Switch
                    checked={isEnabled}
                    onCheckedChange={handleToggle}
                    disabled={isLoading}
                />
            </motion.div>

            {/* Permission Warning */}
            {isEnabled && permissionStatus === 'denied' && (
                <div className="ml-8 px-1 py-2 flex items-start gap-2 text-amber-600">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <p className="text-xs">
                        Location access denied. Enable in Settings → Travelist → Location to use proximity alerts.
                    </p>
                </div>
            )}

            {/* Distance Slider - only visible when enabled */}
            {isEnabled && permissionStatus !== 'denied' && (
                <div className="ml-8 px-1 py-2 space-y-3">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">Alert distance</p>
                        <p className="text-sm font-medium" style={{ color: '#667eea' }}>
                            {formatDistance(distanceMeters)}
                        </p>
                    </div>
                    <Slider
                        value={[distanceMeters]}
                        onValueChange={handleDistanceChange}
                        min={100}
                        max={2000}
                        step={50}
                        className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>100m</span>
                        <span>2km</span>
                    </div>
                </div>
            )}

            {/* Manage Cities Button - only visible when enabled */}
            {isEnabled && permissionStatus !== 'denied' && (
                <motion.div
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 px-1 ml-8 ios26-transition-smooth flex items-center gap-3 cursor-pointer"
                    onClick={() => {
                        lightHaptic();
                        setShowCityManager(true);
                    }}
                >
                    <div className="flex-1 text-left min-w-0">
                        <p className="text-sm">Manage Cities</p>
                        <p className="text-xs text-muted-foreground">
                            {enabledCityCount} {enabledCityCount === 1 ? 'city' : 'cities'} enabled
                        </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </motion.div>
            )}

            {/* City Manager Drawer */}
            <ProximityCityManager
                isOpen={showCityManager}
                onClose={() => setShowCityManager(false)}
                allCities={allCities}
            />
        </>
    );
};

export default ProximitySettings;
