import React from 'react';
import { MapPin } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useProximity } from '@/hooks/native/useProximity';
import { lightHaptic } from '@/utils/ios/haptics';
import { motion } from 'framer-motion';

interface ProximityCityManagerProps {
    isOpen: boolean;
    onClose: () => void;
    allCities: Array<{ cityId: string; cityName: string; placeCount: number }>;
}

const ProximityCityManager: React.FC<ProximityCityManagerProps> = ({
    isOpen,
    onClose,
    allCities
}) => {
    const { toggleCity, isCityEnabled, enableAll, disableAll, enabledCityCount } = useProximity();

    const handleToggleCity = (cityId: string) => {
        lightHaptic();
        toggleCity(cityId);
    };

    const handleEnableAll = () => {
        lightHaptic();
        enableAll(allCities.map(c => c.cityId));
    };

    const handleDisableAll = () => {
        lightHaptic();
        disableAll();
    };

    return (
        <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DrawerContent className="max-h-[85vh]">
                <DrawerHeader className="flex flex-row items-center justify-between px-4">
                    <DrawerTitle className="text-lg font-semibold">Proximity Cities</DrawerTitle>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDisableAll}
                            disabled={enabledCityCount === 0}
                            className="text-xs"
                        >
                            Disable All
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleEnableAll}
                            disabled={enabledCityCount === allCities.length}
                            className="text-xs"
                            style={{ color: '#667eea' }}
                        >
                            Enable All
                        </Button>
                    </div>
                </DrawerHeader>

                <div className="px-4 pb-safe overflow-y-auto">
                    {allCities.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">
                            <MapPin className="h-10 w-10 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No cities yet</p>
                            <p className="text-xs mt-1">Save some places to enable proximity alerts.</p>
                        </div>
                    ) : (
                        <div className="space-y-1 pb-4">
                            {allCities.map((city) => (
                                <motion.div
                                    key={city.cityId}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex items-center justify-between py-3 px-2 rounded-lg"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-[15px]">{city.cityName}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {city.placeCount} {city.placeCount === 1 ? 'place' : 'places'}
                                        </p>
                                    </div>
                                    <Switch
                                        checked={isCityEnabled(city.cityId)}
                                        onCheckedChange={() => handleToggleCity(city.cityId)}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </DrawerContent>
        </Drawer>
    );
};

export default ProximityCityManager;
