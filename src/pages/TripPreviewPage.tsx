/**
 * Trip Preview Page
 * 
 * Shows a generated AI trip with the option to save it to Collections.
 * This is displayed after trip generation, before the trip is persisted.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Sparkles } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Trip } from '@/types/trip';
import { createTrip } from '@/utils/trip/trip-manager';
import { mediumHaptic } from '@/utils/ios/haptics';
import { useToast } from '@/hooks/use-toast';
import { getRecommendations } from '@/utils/recommendation/recommendation-manager';
import { RecommendationPlace } from '@/utils/recommendation/types';
import { getCategoryIcon, getCategoryColor } from '@/components/recommendations/utils/category-data';

const TripPreviewPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    // Get trip data from navigation state
    const tripData = location.state?.tripData as Omit<Trip, 'id' | 'dateCreated' | 'dateModified'> | undefined;

    // Load place details
    const recommendations = getRecommendations();
    const placesMap = new Map<string, RecommendationPlace>();
    recommendations.forEach((rec) => {
        rec.places.forEach((place) => {
            if (place.id) placesMap.set(place.id, place);
            if (place.recId) placesMap.set(place.recId, place);
        });
    });

    if (!tripData) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No trip data found</p>
                </div>
            </Layout>
        );
    }

    const handleSaveTrip = () => {
        mediumHaptic();
        setIsSaving(true);

        try {
            const savedTrip = createTrip(tripData);
            toast({
                title: 'Trip Saved!',
                description: `"${savedTrip.name}" has been added to your Collections.`,
            });
            navigate('/collections');
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to save trip. Please try again.',
                variant: 'destructive',
            });
            setIsSaving(false);
        }
    };

    const handleDiscard = () => {
        mediumHaptic();
        navigate(-1);
    };

    const totalPlaces = tripData.days.reduce((sum, day) => sum + day.places.length, 0);

    return (
        <Layout>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pt-2 pb-24">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <Button variant="ghost" size="icon" onClick={handleDiscard}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="text-center flex-1">
                        <div className="flex items-center justify-center gap-2">
                            <Sparkles className="h-4 w-4 text-[#667eea]" />
                            <h1 className="text-lg font-bold">Your AI Trip</h1>
                        </div>
                        <p className="text-xs text-muted-foreground">{tripData.city}, {tripData.country}</p>
                    </div>
                    <div className="w-10" /> {/* Spacer for alignment */}
                </div>

                {/* Trip Summary */}
                <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-[#667eea]/10 to-[#764ba2]/10 border border-[#667eea]/20">
                    <h2 className="font-semibold mb-2">{tripData.name}</h2>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>{tripData.generationParams.durationDays} days</span>
                        <span>•</span>
                        <span>{totalPlaces} stops</span>
                    </div>
                </div>

                {/* Days Preview */}
                <div className="space-y-4 mb-6">
                    {tripData.days.map((day) => (
                        <div key={day.dayNumber} className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold">Day {day.dayNumber}</span>
                                {day.theme && <span className="text-xs text-muted-foreground">— {day.theme}</span>}
                            </div>
                            <div className="space-y-2">
                                {day.places.map((placeRef) => {
                                    const place = placesMap.get(placeRef.placeId);
                                    if (!place) return null;
                                    const categoryColor = getCategoryColor(place.category);

                                    return (
                                        <div
                                            key={placeRef.placeId}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-neutral-200/50 dark:border-neutral-700/30"
                                        >
                                            <span className="text-xs text-muted-foreground w-10 shrink-0">
                                                {placeRef.suggestedTime || '--:--'}
                                            </span>
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <span style={{ color: categoryColor }}>{getCategoryIcon(place.category)}</span>
                                                <span className="text-sm font-medium truncate">{place.name}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Save Actions */}
                <div className="fixed bottom-20 left-0 right-0 px-4 pb-4 bg-gradient-to-t from-background via-background to-transparent pt-6">
                    <div className="space-y-2">
                        <Button
                            onClick={handleSaveTrip}
                            disabled={isSaving}
                            className="w-full h-12 text-white text-base font-medium"
                            style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                            }}
                        >
                            <Save className="h-5 w-5 mr-2" />
                            {isSaving ? 'Saving...' : 'Save Trip to Collections'}
                        </Button>
                        <Button
                            onClick={handleDiscard}
                            variant="ghost"
                            className="w-full"
                            disabled={isSaving}
                        >
                            Discard
                        </Button>
                    </div>
                </div>
            </motion.div>
        </Layout>
    );
};

export default TripPreviewPage;
