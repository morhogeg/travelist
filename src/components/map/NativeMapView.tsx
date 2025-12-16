import { useEffect, useRef, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { List, MapPin } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import AppleMaps, { MapMarker } from '@/plugins/apple-maps-plugin';
import { getRecommendations } from '@/utils/recommendation/recommendation-manager';
import { MapPlacePreview } from './MapPlacePreview';
import { mediumHaptic } from '@/utils/ios/haptics';

interface NativeMapViewProps {
    onPlaceSelect?: (placeId: string) => void;
    onBack: () => void;
    filterCity?: string;
    filterCountry?: string;
}

export function NativeMapView({ onPlaceSelect, onBack, filterCity, filterCountry }: NativeMapViewProps) {
    const [selectedPlace, setSelectedPlace] = useState<MapMarker | null>(null);
    const [isMapReady, setIsMapReady] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [markerCount, setMarkerCount] = useState(0);
    const isNative = Capacitor.isNativePlatform();
    const cleanupRef = useRef<(() => void) | null>(null);

    // Convert recommendations to map markers
    const getMarkers = useCallback((): MapMarker[] => {
        const recommendations = getRecommendations();
        const markers: MapMarker[] = [];

        recommendations.forEach((rec) => {
            const city = rec.city;
            const country = rec.country || '';

            // Apply filters if provided
            if (filterCity && city.toLowerCase() !== filterCity.toLowerCase()) return;
            if (filterCountry && country.toLowerCase() !== filterCountry.toLowerCase()) return;

            rec.places.forEach((place) => {
                markers.push({
                    id: place.recId || place.id || '',
                    name: place.name,
                    address: `${place.name}, ${city}, ${country}`.trim(),
                    category: place.category,
                    visited: place.visited,
                });
            });
        });

        return markers;
    }, [filterCity, filterCountry]);

    // Initialize map on mount
    useEffect(() => {
        if (!isNative) {
            setError('Apple Maps is only available on iOS');
            return;
        }

        const initMap = async () => {
            try {
                // Show the native map
                await AppleMaps.showMap();
                setIsMapReady(true);

                // Add markers
                const markers = getMarkers();
                setMarkerCount(markers.length);
                if (markers.length > 0) {
                    const result = await AppleMaps.addMarkers({ markers });
                    console.log(`[NativeMapView] Added ${result.added} markers`);
                }

                // Listen for marker taps
                const tapListener = await AppleMaps.addListener('markerTap', (data) => {
                    console.log('[NativeMapView] Marker tapped:', data);
                    setSelectedPlace(data);
                    if (onPlaceSelect) {
                        onPlaceSelect(data.id);
                    }
                });

                const selectListener = await AppleMaps.addListener('markerSelect', (data) => {
                    console.log('[NativeMapView] Marker selected:', data);
                });

                // Listen for native back button tap
                const backListener = await AppleMaps.addListener('backTap', () => {
                    console.log('[NativeMapView] Back button tapped');
                    onBack();
                });

                // Store cleanup function
                cleanupRef.current = () => {
                    tapListener.remove();
                    selectListener.remove();
                    backListener.remove();
                };

            } catch (err) {
                console.error('[NativeMapView] Error initializing map:', err);
                setError('Failed to initialize map');
            }
        };

        initMap();

        // Cleanup on unmount
        return () => {
            AppleMaps.hideMap().catch(console.error);
            if (cleanupRef.current) {
                cleanupRef.current();
            }
        };
    }, [isNative, getMarkers, onPlaceSelect, onBack]);

    // Handle closing preview
    const handleClosePreview = useCallback(() => {
        setSelectedPlace(null);
    }, []);

    const handleBack = useCallback(() => {
        mediumHaptic();
        onBack();
    }, [onBack]);

    // Render fallback for web
    if (!isNative) {
        return (
            <div className="flex-1 flex items-center justify-center bg-background/50">
                <div className="text-center p-8">
                    <div className="text-6xl mb-4">🗺️</div>
                    <h3 className="text-lg font-semibold mb-2">Apple Maps</h3>
                    <p className="text-muted-foreground text-sm">
                        Map view is only available on iOS devices.
                    </p>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="flex-1 flex items-center justify-center bg-background/50">
                <div className="text-center p-8">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h3 className="text-lg font-semibold mb-2">Map Error</h3>
                    <p className="text-muted-foreground text-sm">{error}</p>
                </div>
            </div>
        );
    }

    // Map renders natively, this is just a transparent container with floating controls
    return (
        <>
            {/* Floating header with back button */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="fixed top-14 left-4 right-4 z-50 flex items-center justify-between"
                style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
            >
                {/* Back to List button */}
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleBack}
                    className="flex items-center gap-2 px-4 py-2 rounded-full liquid-glass-tinted shadow-lg"
                >
                    <List className="h-5 w-5 text-[#667eea]" />
                    <span className="text-sm font-medium text-foreground">List View</span>
                </motion.button>

                {/* Place count badge */}
                {markerCount > 0 && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-full liquid-glass-tinted shadow-lg">
                        <MapPin className="h-4 w-4 text-[#667eea]" />
                        <span className="text-sm font-medium text-foreground">{markerCount} places</span>
                    </div>
                )}
            </motion.div>

            {/* Transparent container - the native map renders behind */}
            <div className="flex-1" style={{ backgroundColor: 'transparent' }} />

            {/* Preview card floats above the map */}
            {selectedPlace && (
                <MapPlacePreview
                    place={selectedPlace}
                    onClose={handleClosePreview}
                    onViewDetails={() => {
                        if (onPlaceSelect) {
                            onPlaceSelect(selectedPlace.id);
                        }
                        handleClosePreview();
                    }}
                />
            )}
        </>
    );
}
