import React, { useState, useEffect } from "react";
import { Navigation, RotateCcw } from "lucide-react";
import { getMapPreference, MapAppPreference, setMapPreference } from "@/utils/maps/export-to-maps";
import { lightHaptic, mediumHaptic } from "@/utils/ios/haptics";
import SettingsRow from "./SettingsRow";
import { Button } from "@/components/ui/button";

const NavigationSettings = () => {
    const [preference, setPreference] = useState<MapAppPreference | null>(null);

    useEffect(() => {
        const loadPreference = () => {
            setPreference(getMapPreference());
        };

        loadPreference();
        window.addEventListener('mapPreferenceChanged', loadPreference);
        return () => window.removeEventListener('mapPreferenceChanged', loadPreference);
    }, []);

    const handleSelect = (choice: MapAppPreference) => {
        lightHaptic();
        setMapPreference(choice);
        setPreference(choice);
        window.dispatchEvent(new CustomEvent('mapPreferenceChanged'));
    };

    const handleReset = (e: React.MouseEvent) => {
        e.stopPropagation();
        mediumHaptic();
        localStorage.removeItem('travelist_map_preference');
        setPreference(null);
        window.dispatchEvent(new CustomEvent('mapPreferenceChanged'));
    };

    return (
        <div>
            <SettingsRow
                icon={Navigation}
                iconColor="#FF3B30"
                title="Navigation App"
                subtitle={preference
                    ? `Default: ${preference === 'google' ? 'Google Maps' : 'Apple Maps'}`
                    : "Ask every time"}
                action={preference ? (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                        className="h-7 w-7 p-0 rounded-full text-muted-foreground/40 hover:text-destructive transition-colors"
                        title="Reset preference"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                ) : null}
            />

            <div className="flex gap-2 ml-8 pb-3">
                <button
                    className={`h-8 px-4 text-xs font-semibold rounded-xl ios26-transition-smooth ${
                        preference === 'google'
                            ? 'bg-[#667eea]/15 text-[#667eea]'
                            : 'bg-black/[0.06] dark:bg-white/[0.08] text-muted-foreground'
                    }`}
                    onClick={() => handleSelect('google')}
                >
                    Google Maps
                </button>
                <button
                    className={`h-8 px-4 text-xs font-semibold rounded-xl ios26-transition-smooth ${
                        preference === 'apple'
                            ? 'bg-[#667eea]/15 text-[#667eea]'
                            : 'bg-black/[0.06] dark:bg-white/[0.08] text-muted-foreground'
                    }`}
                    onClick={() => handleSelect('apple')}
                >
                    Apple Maps
                </button>
            </div>
        </div>
    );
};

export default NavigationSettings;
