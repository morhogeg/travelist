/**
 * useTripPlanner Hook
 *
 * React hook for generating and managing AI-powered trip itineraries.
 */

import { useState, useCallback } from 'react';
import { tripPlannerProvider } from '@/services/ai/providers/trip-planner-provider';
import {
    Trip,
    TripPlanRequest,
    TripPlanResult,
    TripDay,
    TripPlaceReference,
    TripPreferences,
} from '@/types/trip';
import { createTrip } from '@/utils/trip/trip-manager';
import { getRecommendations } from '@/utils/recommendation/recommendation-manager';
import { RecommendationPlace } from '@/utils/recommendation/types';

interface UseTripPlannerOptions {
    city: string;
    country: string;
}

interface UseTripPlannerReturn {
    generateTrip: (durationDays: number, preferences?: TripPreferences) => Promise<Trip | null>;
    isGenerating: boolean;
    error: string | null;
    progress: string;
}

/**
 * Get all places for a specific city from recommendations
 */
function getPlacesForCity(city: string): Array<{
    id: string;
    name: string;
    category: string;
    visited: boolean;
    description?: string;
}> {
    const recommendations = getRecommendations();
    const places: Array<{
        id: string;
        name: string;
        category: string;
        visited: boolean;
        description?: string;
    }> = [];

    recommendations.forEach((rec) => {
        if (rec.city.toLowerCase() === city.toLowerCase()) {
            rec.places.forEach((place) => {
                places.push({
                    id: place.recId || place.id || '',
                    name: place.name,
                    category: place.category,
                    visited: place.visited || false,
                    description: place.description || place.context?.specificTip,
                });
            });
        }
    });

    return places;
}

/**
 * Convert AI plan result to Trip structure
 */
function createTripFromPlan(
    result: TripPlanResult,
    city: string,
    country: string,
    durationDays: number,
    preferences?: TripPreferences
): Omit<Trip, 'id' | 'dateCreated' | 'dateModified'> {
    const days: TripDay[] = result.days.map((day) => ({
        dayNumber: day.dayNumber,
        theme: day.theme,
        neighborhood: day.neighborhood,
        estimatedWalkingMinutes: day.estimatedWalkingMinutes,
        places: day.places.map((p) => ({
            placeId: p.placeId,
            placeName: undefined, // Will be resolved from recommendations
            order: p.order,
            notes: undefined,
            visited: false,
            suggestedTimeSlot: p.suggestedTimeSlot,
            suggestedTime: p.suggestedTime,
            travelToNextMinutes: p.travelToNextMinutes,
        })),
    }));

    return {
        name: `${city} ${durationDays}-Day Trip`,
        cityId: city.toLowerCase().replace(/\s+/g, '-'),
        city,
        country,
        days,
        suggestedAdditions: result.suggestedAdditions,  // Save AI suggestions
        generatedAt: result.generatedAt,
        generationParams: {
            durationDays,
            placesPerDay: Math.ceil(days.reduce((sum, d) => sum + d.places.length, 0) / durationDays),
            preferences,
        },
        isAIGenerated: true,
    };
}

/**
 * Hook for generating AI trip plans
 */
export function useTripPlanner(options: UseTripPlannerOptions): UseTripPlannerReturn {
    const { city, country } = options;
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState('');

    const generateTrip = useCallback(
        async (durationDays: number, preferences?: TripPreferences): Promise<Trip | null> => {
            setIsGenerating(true);
            setError(null);
            setProgress('Finding your saved places...');

            try {
                // Get places for this city
                const places = getPlacesForCity(city);

                if (places.length < 4) {
                    throw new Error(`Need at least 4 places saved in ${city} to generate a trip.`);
                }

                setProgress('AI is optimizing your itinerary...');

                // Build request
                const request: TripPlanRequest = {
                    city,
                    country,
                    durationDays,
                    placesPerDay: preferences?.pacePreference === 'relaxed' ? 4 : preferences?.pacePreference === 'packed' ? 7 : 5,
                    places,
                    preferences,
                };

                // Call AI provider
                const result = await tripPlannerProvider.generateTripPlan(request);

                setProgress('Saving your trip...');

                // Create and save the trip
                const tripData = createTripFromPlan(result, city, country, durationDays, preferences);
                const trip = createTrip(tripData);

                setProgress('');
                return trip;
            } catch (err: any) {
                console.error('[useTripPlanner] Error:', err);
                setError(err.message || 'Failed to generate trip');
                setProgress('');
                return null;
            } finally {
                setIsGenerating(false);
            }
        },
        [city, country]
    );

    return {
        generateTrip,
        isGenerating,
        error,
        progress,
    };
}

export default useTripPlanner;
