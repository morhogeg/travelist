import React, { useState, useEffect } from "react";
import { Navigation, Map, RotateCcw } from "lucide-react";
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
        <div className="py-1">
            <SettingsRow
                icon={Navigation}
                title="Navigation App"
                subtitle={preference ? `Default: ${preference === 'google' ? 'Google Maps' : 'Apple Maps'}` : "Ask every time"}
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

            <div className="flex gap-2 ml-8 mt-1 mb-2">
                <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 px-3 text-[11px] font-bold uppercase tracking-tight rounded-xl ios26-transition-smooth ${preference === 'google'
                        ? 'bg-accent/10 text-accent border-accent/20'
                        : 'bg-muted/30 text-muted-foreground/60 border border-transparent'
                        }`}
                    onClick={() => handleSelect('google')}
                >
                    Google Maps
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 px-3 text-[11px] font-bold uppercase tracking-tight rounded-xl ios26-transition-smooth ${preference === 'apple'
                        ? 'bg-accent/10 text-accent border-accent/20'
                        : 'bg-muted/30 text-muted-foreground/60 border border-transparent'
                        }`}
                    onClick={() => handleSelect('apple')}
                >
                    Apple Maps
                </Button>
            </div>
        </div>
    );
};

export default NavigationSettings;
