/**
 * Trip Detail Page
 *
 * Clean, minimal design following UI patterns guide.
 * - Ghost buttons, no blue fills
 * - Simplified place cards
 * - Dynamic time recalculation on reorder
 * - AI suggestions that disappear when added
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Lightbulb, MoreHorizontal, Map as MapIcon, Sparkles, FolderPlus } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import {
    getTripById,
    deleteTrip,
    markTripPlaceVisited,
    removePlaceFromTrip,
    reorderTripPlacesInDay,
    addDayToTrip,
    dismissTripSuggestion,
    addPlaceToTripDay,
} from '@/utils/trip/trip-manager';
import { getRecommendations, markRecommendationVisited, storeRecommendation } from '@/utils/recommendation/recommendation-manager';
import { Trip, TripPlaceReference, TripSuggestedPlace } from '@/types/trip';
import { RecommendationPlace, Recommendation } from '@/utils/recommendation/types';
import { mediumHaptic, lightHaptic } from '@/utils/ios/haptics';
import RecommendationDetailsDialog from '@/components/home/RecommendationDetailsDialog';
import { ExportToMapsButton } from '@/components/maps/ExportToMapsButton';
import { MapExportPlace } from '@/utils/maps/export-to-maps';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { getCategoryIcon, getCategoryColor } from '@/components/recommendations/utils/category-data';
import { Reorder } from 'framer-motion';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { createCollectionFromPlaces } from '@/utils/collections/collectionStore';

const TripDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [trip, setTrip] = useState<Trip | null>(null);
    const [places, setPlaces] = useState(() => new Map<string, RecommendationPlace>());
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedPlaceDetails, setSelectedPlaceDetails] = useState<Recommendation | null>(null);

    const loadTrip = useCallback(() => {
        if (!id) return;
        const tripData = getTripById(id);
        setTrip(tripData);

        if (tripData) {
            const recommendations = getRecommendations();
            const placesMap = new Map<string, RecommendationPlace>();
            recommendations.forEach((rec) => {
                rec.places.forEach((place) => {
                    if (place.id) placesMap.set(place.id, place);
                    if (place.recId) placesMap.set(place.recId, place);
                });
            });
            setPlaces(placesMap);
        }
    }, [id]);

    useEffect(() => { loadTrip(); }, [loadTrip]);

    useEffect(() => {
        const handleUpdate = () => loadTrip();
        window.addEventListener('tripUpdated', handleUpdate);
        return () => window.removeEventListener('tripUpdated', handleUpdate);
    }, [loadTrip]);

    const exportPlaces: MapExportPlace[] = useMemo(() => {
        if (!trip) return [];
        const list: MapExportPlace[] = [];
        trip.days.forEach((day) => {
            day.places.forEach((placeRef) => {
                const place = places.get(placeRef.placeId);
                if (place) {
                    list.push({ name: place.name, address: place.name, city: trip.city, country: trip.country });
                }
            });
        });
        return list;
    }, [trip, places]);

    // Filter out dismissed suggestions
    const visibleSuggestions = useMemo(() => {
        if (!trip?.suggestedAdditions) return [];
        const dismissed = new Set(trip.dismissedSuggestionNames || []);
        return trip.suggestedAdditions.filter(s => !dismissed.has(s.name));
    }, [trip]);

    const handleBack = () => { mediumHaptic(); navigate(-1); };

    const handleReorder = (dayNumber: number, reorderedPlaces: TripPlaceReference[]) => {
        if (!id) return;
        reorderTripPlacesInDay(id, dayNumber, reorderedPlaces);
        loadTrip();
    };

    const handleToggleVisited = (dayNumber: number, placeId: string, currentVisited: boolean) => {
        lightHaptic();
        if (!id) return;
        const newVisited = !currentVisited;
        markTripPlaceVisited(id, dayNumber, placeId, newVisited);
        const place = places.get(placeId);
        if (place) markRecommendationVisited(place.recId || place.id || placeId, place.name, newVisited);
        loadTrip();
    };

    const handleRemovePlace = (dayNumber: number, placeId: string) => {
        mediumHaptic();
        if (!id) return;
        removePlaceFromTrip(id, dayNumber, placeId);
        loadTrip();
    };

    const handlePlaceClick = (placeId: string) => {
        const place = places.get(placeId);
        if (!place || !trip) return;
        setSelectedPlaceDetails({
            id: place.id || placeId,
            name: place.name,
            location: trip.city,
            image: place.image || '',
            category: place.category,
            description: place.description,
            website: place.website,
            recId: place.recId || place.id || placeId,
            visited: place.visited || false,
            country: trip.country,
            source: place.source?.name === 'Trip Planner AI' ? { ...place.source, name: 'Travelist AI' } : place.source,
            context: place.context,
        });
    };

    const handleToggleVisitedFromDialog = (recId: string, name: string, currentVisited: boolean) => {
        lightHaptic();
        const newVisited = !currentVisited;
        if (id && trip) {
            for (const day of trip.days) {
                const placeRef = day.places.find((p) => p.placeId === recId);
                if (placeRef) { markTripPlaceVisited(id, day.dayNumber, placeRef.placeId, newVisited); break; }
            }
        }
        markRecommendationVisited(recId, name, newVisited);
        if (selectedPlaceDetails) setSelectedPlaceDetails({ ...selectedPlaceDetails, visited: newVisited });
        loadTrip();
    };

    const handleAddSuggestion = async (suggestion: TripSuggestedPlace) => {
        if (!trip || !id) return;
        mediumHaptic();

        // Save to recommendations
        const recId = uuidv4();
        await storeRecommendation({
            id: recId,
            cityId: trip.cityId,
            city: trip.city,
            country: trip.country,
            categories: [suggestion.category || 'general'],
            places: [{
                id: uuidv4(),
                recId,
                name: suggestion.name,
                category: suggestion.category || 'general',
                description: suggestion.description,
                source: { type: 'ai', name: 'Travelist AI' },
                context: { specificTip: suggestion.whyItFits },
            }],
            rawText: suggestion.whyItFits,
            dateAdded: new Date().toISOString(),
        } as any);

        // Add to the LAST day of the trip
        const lastDay = trip.days[trip.days.length - 1];
        if (lastDay) {
            addPlaceToTripDay(trip.id, lastDay.dayNumber, {
                placeId: recId,
                suggestedTime: '', // Will be calculated
                order: 999, // Will be calculated
                travelToNextMinutes: 15,
                visited: false,
            });
        }

        // Dismiss from trip suggestions
        dismissTripSuggestion(id, suggestion.name);

        toast({ title: 'Added to Route!', description: `${suggestion.name} added to Day ${lastDay?.dayNumber || 1}.` });
        loadTrip();
    };

    const handleSuggestionClick = (suggestion: TripSuggestedPlace) => {
        if (!trip) return;
        mediumHaptic();
        setSelectedPlaceDetails({
            id: uuidv4(), // Temp ID for display
            name: suggestion.name,
            location: trip.city,
            image: '', // No image for suggestions yet
            category: suggestion.category || 'general',
            description: suggestion.description,
            website: '',
            recId: '',
            visited: false,
            country: trip.country,
            source: { type: 'ai', name: 'Travelist AI' },
            context: { specificTip: suggestion.whyItFits },
        });
    };

    const handleSaveAsCollection = () => {
        mediumHaptic();
        if (!trip) return;

        const placeIds = trip.days.flatMap(day => day.places.map(p => p.placeId));
        const newCollection = createCollectionFromPlaces(`${trip.name} (Saved)`, placeIds);

        toast({
            title: 'Saved to Collections',
            description: `"${newCollection.name}" has been created.`,
        });

        navigate('/collections');
    };

    const confirmDeleteTrip = () => {
        mediumHaptic();
        if (!id) return;
        deleteTrip(id);
        navigate('/collections');
    };

    if (!trip) {
        return <Layout><div className="flex items-center justify-center h-full"><p className="text-muted-foreground">Trip not found</p></div></Layout>;
    }

    const totalPlaces = trip.days.reduce((sum, day) => sum + day.places.length, 0);
    const visitedPlaces = trip.days.reduce((sum, day) => sum + day.places.filter((p) => p.visited).length, 0);
    const progressPercentage = totalPlaces > 0 ? Math.round((visitedPlaces / totalPlaces) * 100) : 0;

    return (
        <Layout>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pt-2 pb-24">
                {/* Minimal Header */}
                <div className="flex items-center justify-between mb-2">
                    <Button variant="ghost" size="icon" onClick={handleBack}><ArrowLeft className="h-5 w-5" /></Button>
                    <div className="text-center flex-1">
                        <h1 className="text-lg font-bold">{trip.name}</h1>
                        <p className="text-xs text-muted-foreground">{trip.city}, {trip.country}</p>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-muted-foreground">
                                <MoreHorizontal className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleSaveAsCollection} className="gap-2">
                                <FolderPlus className="h-4 w-4" />
                                Save as Collection
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive gap-2">
                                <Trash2 className="h-4 w-4" />
                                Delete Trip
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Progress - subtle */}
                {totalPlaces > 0 && (
                    <div className="mb-4">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>{visitedPlaces}/{totalPlaces} visited</span>
                            <span>{progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-1">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercentage}%` }} className="h-1 rounded-full bg-gradient-to-r from-[#667eea] to-[#764ba2]" />
                        </div>
                    </div>
                )}

                {/* Export Button - Outline style, not filled */}
                {exportPlaces.length > 0 && (
                    <div className="mb-6 flex gap-2">
                        <ExportToMapsButton places={exportPlaces} variant="outline" size="default" showText={true} className="flex-1" />
                    </div>
                )}

                {/* Days */}
                {trip.days.map((day) => {
                    // Pre-filter to only include places that exist in our places map
                    const validPlaces = day.places.filter(placeRef => places.has(placeRef.placeId));

                    return (
                        <div key={day.dayNumber} className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-sm font-bold">Day {day.dayNumber}</span>
                                {day.theme && <span className="text-xs text-muted-foreground">— {day.theme}</span>}
                            </div>

                            {validPlaces.length === 0 ? (
                                <p className="text-sm text-muted-foreground italic py-4 text-center">No places added yet</p>
                            ) : (
                                <Reorder.Group axis="y" values={validPlaces} onReorder={(newOrder) => handleReorder(day.dayNumber, newOrder)} className="space-y-2">
                                    {validPlaces.map((placeRef) => {
                                        const place = places.get(placeRef.placeId);
                                        if (!place) return null;
                                        const categoryColor = getCategoryColor(place.category);

                                        return (
                                            <Reorder.Item key={placeRef.placeId} value={placeRef}>
                                                <motion.div
                                                    className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-neutral-200/50 dark:border-neutral-700/30"
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    {/* Time */}
                                                    <span className="text-xs text-muted-foreground w-10 shrink-0">{placeRef.suggestedTime || '--:--'}</span>

                                                    {/* Category Icon + Name */}
                                                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handlePlaceClick(placeRef.placeId)}>
                                                        <div className="flex items-center gap-2">
                                                            <span style={{ color: categoryColor }}>{getCategoryIcon(place.category)}</span>
                                                            <span className={`text-sm font-medium truncate ${placeRef.visited ? 'line-through text-muted-foreground' : ''}`}>{place.name}</span>
                                                        </div>
                                                    </div>

                                                    {/* Visited checkmark */}
                                                    <button
                                                        onClick={() => handleToggleVisited(day.dayNumber, placeRef.placeId, placeRef.visited)}
                                                        className={`p-1.5 rounded-full transition-colors ${placeRef.visited ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'text-muted-foreground hover:bg-muted/50'}`}
                                                    >
                                                        <svg className="h-4 w-4" fill={placeRef.visited ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </button>

                                                    {/* More menu */}
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <button className="p-1.5 rounded-full text-muted-foreground hover:bg-muted/50"><MoreHorizontal className="h-4 w-4" /></button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handlePlaceClick(placeRef.placeId)}>View Details</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleRemovePlace(day.dayNumber, placeRef.placeId)} className="text-destructive">Remove</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </motion.div>
                                            </Reorder.Item>
                                        );
                                    })}
                                </Reorder.Group>
                            )}
                        </div>
                    );
                })}

                {/* Add Day */}
                <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => { mediumHaptic(); if (id) addDayToTrip(id); loadTrip(); }}>
                    <Plus className="h-4 w-4 mr-2" /> Add Day
                </Button>

                {/* AI Suggestions - Only if there are visible ones */}
                {visibleSuggestions.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-neutral-200/50 dark:border-neutral-700/30">
                        <div className="flex items-center gap-2 mb-3">
                            <Lightbulb className="h-4 w-4 text-amber-500" />
                            <span className="text-sm font-medium">You might also like</span>
                        </div>

                        <div className="space-y-2">
                            {visibleSuggestions.map((suggestion, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/30 dark:border-amber-700/20 active:scale-[0.98] transition-transform cursor-pointer"
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span style={{ color: getCategoryColor(suggestion.category) }}>{getCategoryIcon(suggestion.category)}</span>
                                        <span className="text-sm font-medium truncate">{suggestion.name}</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddSuggestion(suggestion);
                                        }}
                                        className="shrink-0 text-muted-foreground hover:text-foreground"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        {/* Attribution */}
                        <div className="mt-4 flex items-center justify-center gap-1.5 opacity-40">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span className="text-[9px] font-medium tracking-tight uppercase px-1 py-0.5 rounded-md border border-foreground/20">POWERED BY TRAVELIST AI</span>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Detail Dialog */}
            {selectedPlaceDetails && (
                <RecommendationDetailsDialog
                    isOpen={true}
                    onClose={() => setSelectedPlaceDetails(null)}
                    recommendation={selectedPlaceDetails}
                    onToggleVisited={handleToggleVisitedFromDialog}
                    hideEditDelete={true}
                    onAddToTrip={() => {
                        // Find the original suggestion object to add
                        const suggestion = visibleSuggestions.find(s => s.name === selectedPlaceDetails.name);
                        if (suggestion) {
                            handleAddSuggestion(suggestion);
                        }
                    }}
                />
            )}

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Trip?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete "{trip.name}".</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteTrip} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Layout>
    );
};

export default TripDetailPage;
