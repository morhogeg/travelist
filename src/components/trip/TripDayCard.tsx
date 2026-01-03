/**
 * Trip Day Card
 *
 * Displays a single day in a trip itinerary with draggable places.
 */

import React from 'react';
import { motion, Reorder } from 'framer-motion';
import { Clock, MapPin, Plus, Trash2, GripVertical, Navigation } from 'lucide-react';
import { TripDay, TripPlaceReference, TimeSlot } from '@/types/trip';
import { RecommendationPlace } from '@/utils/recommendation/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCategoryIcon, getCategoryColor } from '@/components/recommendations/utils/category-data';
import { generateMapLink } from '@/utils/link-helpers';
import { lightHaptic, mediumHaptic } from '@/utils/ios/haptics';

interface TripDayCardProps {
    day: TripDay;
    places: Map<string, RecommendationPlace>;
    cityName: string;
    onReorder: (dayNumber: number, places: TripPlaceReference[]) => void;
    onToggleVisited: (dayNumber: number, placeId: string, visited: boolean) => void;
    onRemovePlace: (dayNumber: number, placeId: string) => void;
    onPlaceClick: (placeId: string) => void;
    onAddPlaces: () => void;
}

const TIME_SLOT_LABELS: Record<TimeSlot, string> = {
    morning: 'Morning',
    lunch: 'Lunch',
    afternoon: 'Afternoon',
    evening: 'Evening',
    night: 'Night',
};

const TIME_SLOT_COLORS: Record<TimeSlot, string> = {
    morning: '#f59e0b',  // Amber
    lunch: '#10b981',    // Emerald
    afternoon: '#3b82f6', // Blue
    evening: '#8b5cf6',   // Purple
    night: '#6366f1',     // Indigo
};

const TripDayCard: React.FC<TripDayCardProps> = ({
    day,
    places,
    cityName,
    onReorder,
    onToggleVisited,
    onRemovePlace,
    onPlaceClick,
    onAddPlaces,
}) => {
    const handleReorder = (newOrder: TripPlaceReference[]) => {
        lightHaptic();
        onReorder(day.dayNumber, newOrder);
    };

    const formatDuration = (minutes?: number) => {
        if (!minutes) return '';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours === 0) return `${mins}min`;
        if (mins === 0) return `${hours}h`;
        return `${hours}h ${mins}min`;
    };

    const totalPlaces = day.places.length;
    const visitedCount = day.places.filter((p) => p.visited).length;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
        >
            {/* Day Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        Day {day.dayNumber}
                        {day.theme && (
                            <span className="text-sm font-normal text-muted-foreground">
                                — {day.theme}
                            </span>
                        )}
                    </h3>
                    {day.neighborhood && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {day.neighborhood}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {day.estimatedWalkingMinutes && (
                        <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDuration(day.estimatedWalkingMinutes)} walking
                        </Badge>
                    )}
                    <Badge variant="secondary" className="text-xs">
                        {visitedCount}/{totalPlaces}
                    </Badge>
                </div>
            </div>

            {/* Places List (Draggable) */}
            <Reorder.Group
                axis="y"
                values={day.places}
                onReorder={handleReorder}
                className="space-y-2"
            >
                {day.places.map((placeRef, index) => {
                    const place = places.get(placeRef.placeId);
                    if (!place) return null;

                    const categoryColor = getCategoryColor(place.category);
                    const categoryIcon = getCategoryIcon(place.category);
                    const timeSlotColor = TIME_SLOT_COLORS[placeRef.suggestedTimeSlot || 'afternoon'];

                    return (
                        <Reorder.Item key={placeRef.placeId} value={placeRef}>
                            <motion.div
                                className="liquid-glass-clear rounded-xl overflow-hidden cursor-pointer
                           border border-white/20 dark:border-white/10"
                                style={{
                                    borderLeft: `3px solid ${categoryColor}`,
                                    boxShadow: 'none',
                                }}
                                whileTap={{ scale: 0.98 }}
                                layout
                            >
                                <div className="flex items-center gap-3 p-3">
                                    {/* Drag Handle */}
                                    <div className="text-muted-foreground/50 cursor-grab active:cursor-grabbing">
                                        <GripVertical className="h-4 w-4" />
                                    </div>

                                    {/* Time Slot Badge */}
                                    <div
                                        className="flex-shrink-0 px-2 py-1 rounded-md text-xs font-medium text-white"
                                        style={{ backgroundColor: timeSlotColor }}
                                    >
                                        {placeRef.suggestedTime || TIME_SLOT_LABELS[placeRef.suggestedTimeSlot || 'afternoon']}
                                    </div>

                                    {/* Place Info */}
                                    <div className="flex-1 min-w-0" onClick={() => onPlaceClick(placeRef.placeId)}>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-sm" style={{ color: categoryColor }}>
                                                {categoryIcon}
                                            </span>
                                            <span className="font-medium text-sm truncate">{place.name}</span>
                                        </div>
                                        {placeRef.travelToNextMinutes && index < day.places.length - 1 && (
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                → {placeRef.travelToNextMinutes}min to next
                                            </p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1">
                                        {/* Navigate */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const mapUrl = generateMapLink(place.name, `${place.name}, ${cityName}`);
                                                window.open(mapUrl, '_blank');
                                            }}
                                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground 
                                 hover:bg-muted/40 transition-colors"
                                        >
                                            <Navigation className="h-4 w-4" />
                                        </button>

                                        {/* Visited Toggle */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                lightHaptic();
                                                onToggleVisited(day.dayNumber, placeRef.placeId, placeRef.visited);
                                            }}
                                            className={`p-1.5 rounded-lg transition-colors ${placeRef.visited
                                                    ? 'bg-emerald-500/20 text-emerald-600'
                                                    : 'text-muted-foreground hover:bg-muted/40'
                                                }`}
                                        >
                                            <svg
                                                className="h-4 w-4"
                                                fill={placeRef.visited ? 'currentColor' : 'none'}
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                        </button>

                                        {/* Remove */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                mediumHaptic();
                                                onRemovePlace(day.dayNumber, placeRef.placeId);
                                            }}
                                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive 
                                 hover:bg-destructive/10 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </Reorder.Item>
                    );
                })}
            </Reorder.Group>

            {/* Add Places Button */}
            <Button
                variant="ghost"
                size="sm"
                onClick={onAddPlaces}
                className="w-full border border-dashed border-border hover:border-[#667eea] 
                   hover:text-[#667eea] transition-colors"
            >
                <Plus className="h-4 w-4 mr-2" />
                Add Places to Day {day.dayNumber}
            </Button>
        </motion.div>
    );
};

export default TripDayCard;
