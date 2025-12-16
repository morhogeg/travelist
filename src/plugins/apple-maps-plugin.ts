import { registerPlugin } from '@capacitor/core';

export interface MapMarker {
    id: string;
    name: string;
    address: string;  // Format: "Place Name, City, Country"
    category: string;
    visited?: boolean;
}

export interface CenterOptions {
    lat: number;
    lng: number;
    zoom?: number;  // Span in degrees (smaller = more zoomed in), default 0.05
}

export interface AppleMapsPluginInterface {
    showMap(): Promise<void>;
    hideMap(): Promise<void>;
    addMarkers(options: { markers: MapMarker[] }): Promise<{ added: number }>;
    centerOn(options: CenterOptions): Promise<void>;
    clearMarkers(): Promise<void>;
    addListener(
        eventName: 'markerTap' | 'markerSelect',
        listenerFunc: (data: MapMarker) => void
    ): Promise<{ remove: () => void }>;
    addListener(
        eventName: 'backTap',
        listenerFunc: () => void
    ): Promise<{ remove: () => void }>;
}

const AppleMaps = registerPlugin<AppleMapsPluginInterface>('AppleMapsPlugin');

export default AppleMaps;
