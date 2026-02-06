import React from 'react';
import { Map, Navigation } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { exportToGoogleMaps, exportToAppleMaps, MapExportPlace, getMapPreference, setMapPreference, MapAppPreference } from '@/utils/maps/export-to-maps';
import { Capacitor } from '@capacitor/core';
import { useState, useEffect } from 'react';

interface ExportToMapsButtonProps {
    places: MapExportPlace[];
    variant?: 'default' | 'outline' | 'ghost' | 'secondary';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    className?: string;
    showText?: boolean;
    icon?: React.ReactNode;
    iconClassName?: string;
}

export const ExportToMapsButton: React.FC<ExportToMapsButtonProps> = ({
    places,
    variant = 'outline',
    size = 'sm',
    className,
    showText = true,
    icon,
    iconClassName
}) => {
    const [preference, setPreference] = useState<MapAppPreference | null>(null);

    useEffect(() => {
        const loadPreference = () => {
            setPreference(getMapPreference());
        };

        loadPreference();
        window.addEventListener('mapPreferenceChanged', loadPreference);
        return () => window.removeEventListener('mapPreferenceChanged', loadPreference);
    }, []);

    const handleGoogleMaps = () => {
        setMapPreference('google');
        setPreference('google');
        exportToGoogleMaps(places);
    };

    const handleAppleMaps = () => {
        setMapPreference('apple');
        setPreference('apple');
        exportToAppleMaps(places);
    };

    const handleMainClick = (e: React.MouseEvent) => {
        if (preference) {
            e.preventDefault();
            e.stopPropagation();
            if (preference === 'google') exportToGoogleMaps(places);
            else exportToAppleMaps(places);
        }
    };

    const isDisabled = places.length === 0;

    const buttonContent = (
        <Button
            variant={variant}
            size={size}
            className={`${className} ${variant === 'default' ? 'app-purple-gradient border-none shadow-md hover:opacity-90' : ''}`}
            disabled={isDisabled}
            onClick={preference ? handleMainClick : undefined}
        >
            {icon ? (
                icon
            ) : (
                <Map className={`h-4 w-4 ${showText ? 'mr-2' : ''} ${iconClassName || ''}`} />
            )}
            {showText && "Export to Maps"}
        </Button>
    );

    if (preference) {
        return buttonContent;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {buttonContent}
            </DropdownMenuTrigger>
            {!isDisabled && (
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={handleGoogleMaps} className="cursor-pointer font-medium py-3 border-b border-muted/20">
                        <Navigation className="mr-2 h-4 w-4" />
                        <span>Google Maps</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleAppleMaps} className="cursor-pointer font-medium py-3">
                        <Map className="mr-2 h-4 w-4" />
                        <span>Apple Maps</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            )}
        </DropdownMenu>
    );
};
