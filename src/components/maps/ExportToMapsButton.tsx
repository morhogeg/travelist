import React from 'react';
import { Map, Navigation } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { exportToGoogleMaps, exportToAppleMaps, MapExportPlace } from '@/utils/maps/export-to-maps';
import { Capacitor } from '@capacitor/core';

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
    const handleGoogleMaps = () => {
        exportToGoogleMaps(places);
    };

    const handleAppleMaps = () => {
        exportToAppleMaps(places);
    };

    const isDisabled = places.length === 0;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={variant} size={size} className={className} disabled={isDisabled}>
                    {icon ? (
                        icon
                    ) : (
                        <Map className={`h-4 w-4 ${showText ? 'mr-2' : ''} ${iconClassName || ''}`} />
                    )}
                    {showText && "Export to Maps"}
                </Button>
            </DropdownMenuTrigger>
            {!isDisabled && (
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={handleGoogleMaps} className="cursor-pointer">
                        <Navigation className="mr-2 h-4 w-4" />
                        <span>Google Maps</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleAppleMaps} className="cursor-pointer">
                        <Map className="mr-2 h-4 w-4" />
                        <span>Apple Maps</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            )}
        </DropdownMenu>
    );
};
