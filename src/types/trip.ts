/**
 * Trip Types
 * 
 * Data structures for AI-generated trip itineraries.
 * Extends the existing Route pattern with trip-specific metadata.
 */

/**
 * Base types for route-like structures (previously in route.ts)
 */
export interface RoutePlaceReference {
    placeId: string;
    order: number;
    visited: boolean;
}

export interface BaseRouteDay {
    dayNumber: number;
    places: RoutePlaceReference[];
}

/**
 * Time slots for scheduling places based on category
 */
export type TimeSlot = 'morning' | 'lunch' | 'afternoon' | 'evening' | 'night';

/**
 * Extended place reference with trip-specific scheduling info
 */
export interface TripPlaceReference extends RoutePlaceReference {
    suggestedTimeSlot?: TimeSlot;
    suggestedTime?: string;        // e.g., "10:00"
    travelToNextMinutes?: number;  // Walking/transit time to next place
}

/**
 * A day in a trip with AI-generated metadata
 */
export interface TripDay {
    dayNumber: number;              // 1-indexed
    date?: string;                  // ISO format
    label?: string;                 // User-editable label
    theme?: string;                 // AI-suggested: "Museums & Culture", etc.
    neighborhood?: string;          // Primary area being explored
    estimatedWalkingMinutes?: number;
    places: TripPlaceReference[];
}

/**
 * User preferences for trip generation
 */
export interface TripPreferences {
    pacePreference: 'relaxed' | 'moderate' | 'packed';
    prioritizeUnvisited: boolean;
    balanceCategories: boolean;
    startTime?: string;             // Daily start time, default "09:00"
}

/**
 * Parameters used when generating a trip
 */
export interface TripGenerationParams {
    durationDays: number;
    placesPerDay: number;           // Target (default: 5)
    preferences?: TripPreferences;
}

/**
 * AI-suggested place that complements the trip
 */
export interface TripSuggestedPlace {
    name: string;
    category: string;
    description: string;
    whyItFits: string;
    suggestedDay?: number;
    estimatedPriceRange?: '$' | '$$' | '$$$' | '$$$$';
}

/**
 * A complete AI-generated trip itinerary
 */
export interface Trip {
    id: string;
    name: string;
    cityId: string;
    city: string;
    country: string;
    startDate?: string;
    endDate?: string;
    days: TripDay[];
    suggestedAdditions?: TripSuggestedPlace[];  // AI-suggested additional places
    dismissedSuggestionNames?: string[];         // Suggestions user has added/dismissed
    dateCreated: string;
    dateModified: string;
    generatedAt: string;
    generationParams: TripGenerationParams;
    isAIGenerated: true;
}

/**
 * Trip with computed progress for list display
 */
export interface TripWithProgress extends Trip {
    totalPlaces: number;
    visitedPlaces: number;
    progressPercentage: number;
}

/**
 * Request payload for AI trip generation
 */
export interface TripPlanRequest {
    city: string;
    country: string;
    durationDays: number;
    placesPerDay?: number;
    places: Array<{
        id: string;
        name: string;
        category: string;
        visited: boolean;
        description?: string;
    }>;
    preferences?: TripPreferences;
}

/**
 * Response from AI trip generation
 */
export interface TripPlanResult {
    days: Array<{
        dayNumber: number;
        theme?: string;
        neighborhood?: string;
        estimatedWalkingMinutes?: number;
        places: Array<{
            placeId: string;
            order: number;
            suggestedTimeSlot?: TimeSlot;
            suggestedTime?: string;
            travelToNextMinutes?: number;
        }>;
    }>;
    /**
     * AI-suggested additional places that would complement the trip
     */
    suggestedAdditions?: Array<{
        name: string;
        category: string;
        description: string;
        whyItFits: string;           // Why this place complements the existing plan
        suggestedDay?: number;       // Which day it would fit best
        estimatedPriceRange?: '$' | '$$' | '$$$' | '$$$$';
    }>;
    generatedAt: string;
}

