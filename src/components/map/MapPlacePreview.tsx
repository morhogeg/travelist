import { motion } from 'framer-motion';
import { X, Navigation, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MapMarker } from '@/plugins/apple-maps-plugin';
import { getCategoryIcon, getCategoryColor } from '@/components/recommendations/utils/category-data';
import { Capacitor } from '@capacitor/core';

interface MapPlacePreviewProps {
    place: MapMarker;
    onClose: () => void;
    onViewDetails: () => void;
}

export function MapPlacePreview({ place, onClose, onViewDetails }: MapPlacePreviewProps) {
    const categoryIcon = getCategoryIcon(place.category);
    const categoryColor = getCategoryColor(place.category);

    const handleNavigate = () => {
        // Extract city and country from address
        const query = encodeURIComponent(place.address);

        if (Capacitor.isNativePlatform()) {
            // Open in Apple Maps on iOS
            window.open(`maps://?q=${query}`, '_blank');
        } else {
            // Fallback to Google Maps on web
            window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
        }
    };

    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-4 right-4 z-50"
        >
            <div
                className="liquid-glass-tinted rounded-2xl p-4 shadow-lg"
                style={{
                    borderLeft: `4px solid ${categoryColor}`,
                }}
            >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Category Icon */}
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${categoryColor}40` }}
                        >
                            {categoryIcon}
                        </div>

                        {/* Name & Category */}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground truncate">
                                {place.name}
                            </h3>
                            <p className="text-sm text-muted-foreground capitalize">
                                {place.category}
                                {place.visited && (
                                    <span className="ml-2 text-green-500">• Visited</span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-full hover:bg-foreground/10 transition-colors"
                    >
                        <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={handleNavigate}
                    >
                        <Navigation className="w-4 h-4 mr-2" />
                        Navigate
                    </Button>

                    <Button
                        size="sm"
                        className="flex-1"
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        }}
                        onClick={onViewDetails}
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
