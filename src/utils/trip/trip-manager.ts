/**
 * Trip Manager
 * 
 * CRUD operations for AI-generated trip itineraries.
 * Stored in localStorage following the same pattern as routes.
 */

import { Trip, TripWithProgress, TripDay, TripPlaceReference } from '@/types/trip';
import { v4 as uuidv4 } from 'uuid';

const TRIPS_STORAGE_KEY = 'travelist_trips';

/**
 * Get all trips from storage
 */
export function getTrips(): Trip[] {
    try {
        const stored = localStorage.getItem(TRIPS_STORAGE_KEY);
        if (!stored) return [];
        return JSON.parse(stored);
    } catch (error) {
        console.error('[TripManager] Failed to load trips:', error);
        return [];
    }
}

/**
 * Get trips with computed progress
 */
export function getTripsWithProgress(): TripWithProgress[] {
    const trips = getTrips();
    return trips.map((trip) => {
        const totalPlaces = trip.days.reduce((sum, day) => sum + day.places.length, 0);
        const visitedPlaces = trip.days.reduce(
            (sum, day) => sum + day.places.filter((p) => p.visited).length,
            0
        );
        const progressPercentage = totalPlaces > 0
            ? Math.round((visitedPlaces / totalPlaces) * 100)
            : 0;

        return {
            ...trip,
            totalPlaces,
            visitedPlaces,
            progressPercentage,
        };
    });
}

/**
 * Get a single trip by ID
 */
export function getTripById(id: string): Trip | null {
    const trips = getTrips();
    return trips.find((t) => t.id === id) || null;
}

/**
 * Get trips for a specific city
 */
export function getTripsByCity(city: string): Trip[] {
    const trips = getTrips();
    return trips.filter((t) => t.city.toLowerCase() === city.toLowerCase());
}

/**
 * Save trips to storage
 */
function saveTrips(trips: Trip[]): void {
    try {
        localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(trips));
        window.dispatchEvent(new CustomEvent('tripUpdated'));
    } catch (error) {
        console.error('[TripManager] Failed to save trips:', error);
    }
}

/**
 * Create a new trip
 */
export function createTrip(tripData: Omit<Trip, 'id' | 'dateCreated' | 'dateModified'>): Trip {
    const now = new Date().toISOString();
    const trip: Trip = {
        ...tripData,
        id: uuidv4(),
        dateCreated: now,
        dateModified: now,
    };

    const trips = getTrips();
    trips.unshift(trip); // Add to beginning (most recent first)
    saveTrips(trips);

    window.dispatchEvent(new CustomEvent('tripCreated', { detail: { tripId: trip.id } }));
    return trip;
}

/**
 * Update an existing trip
 */
export function updateTrip(id: string, updates: Partial<Trip>): Trip | null {
    const trips = getTrips();
    const index = trips.findIndex((t) => t.id === id);

    if (index === -1) return null;

    const updated = {
        ...trips[index],
        ...updates,
        dateModified: new Date().toISOString(),
    };

    trips[index] = updated;
    saveTrips(trips);

    return updated;
}

/**
 * Delete a trip
 */
export function deleteTrip(id: string): boolean {
    const trips = getTrips();
    const filtered = trips.filter((t) => t.id !== id);

    if (filtered.length === trips.length) return false;

    saveTrips(filtered);
    window.dispatchEvent(new CustomEvent('tripDeleted', { detail: { tripId: id } }));
    return true;
}

/**
 * Mark a place as visited within a trip
 */
export function markTripPlaceVisited(
    tripId: string,
    dayNumber: number,
    placeId: string,
    visited: boolean
): void {
    const trips = getTrips();
    const trip = trips.find((t) => t.id === tripId);

    if (!trip) return;

    const day = trip.days.find((d) => d.dayNumber === dayNumber);
    if (!day) return;

    const place = day.places.find((p) => p.placeId === placeId);
    if (!place) return;

    place.visited = visited;
    trip.dateModified = new Date().toISOString();

    saveTrips(trips);
}

/**
 * Reorder places within a day and recalculate times
 */
export function reorderTripPlacesInDay(
    tripId: string,
    dayNumber: number,
    reorderedPlaces: TripPlaceReference[]
): void {
    const trips = getTrips();
    const trip = trips.find((t) => t.id === tripId);

    if (!trip) return;

    const dayIndex = trip.days.findIndex((d) => d.dayNumber === dayNumber);
    if (dayIndex === -1) return;

    // Recalculate times based on new order
    const updated = recalculateTimesForPlaces(reorderedPlaces);
    trip.days[dayIndex].places = updated;
    trip.dateModified = new Date().toISOString();

    saveTrips(trips);
}

/**
 * Recalculate suggested times for places based on order
 * Starts at 9:00, adds ~45min per place + travel time
 */
function recalculateTimesForPlaces(places: TripPlaceReference[]): TripPlaceReference[] {
    let currentMinutes = 9 * 60; // Start at 9:00 AM (540 minutes)

    return places.map((place, index) => {
        const hours = Math.floor(currentMinutes / 60);
        const mins = currentMinutes % 60;
        const suggestedTime = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
        const suggestedTimeSlot = getTimeSlotFromMinutes(currentMinutes);

        // Add visit duration (45min) + travel time to next place
        const travelTime = place.travelToNextMinutes || 15;
        currentMinutes += 45 + travelTime;

        // Cap at 23:00 to avoid overnight
        if (currentMinutes > 23 * 60) {
            currentMinutes = 23 * 60;
        }

        return {
            ...place,
            order: index + 1,
            suggestedTime,
            suggestedTimeSlot,
        };
    });
}

/**
 * Get time slot string from minutes since midnight
 */
function getTimeSlotFromMinutes(minutes: number): 'morning' | 'lunch' | 'afternoon' | 'evening' | 'night' {
    const hours = Math.floor(minutes / 60);
    if (hours < 12) return 'morning';
    if (hours < 14) return 'lunch';
    if (hours < 18) return 'afternoon';
    if (hours < 21) return 'evening';
    return 'night';
}

/**
 * Dismiss an AI suggestion (mark as added/dismissed)
 */
export function dismissTripSuggestion(tripId: string, suggestionName: string): void {
    const trips = getTrips();
    const trip = trips.find((t) => t.id === tripId);

    if (!trip) return;

    if (!trip.dismissedSuggestionNames) {
        trip.dismissedSuggestionNames = [];
    }

    if (!trip.dismissedSuggestionNames.includes(suggestionName)) {
        trip.dismissedSuggestionNames.push(suggestionName);
    }

    trip.dateModified = new Date().toISOString();
    saveTrips(trips);
}

/**
 * Move a place from one day to another
 */
export function movePlaceBetweenDays(
    tripId: string,
    fromDayNumber: number,
    toDayNumber: number,
    placeId: string
): void {
    const trips = getTrips();
    const trip = trips.find((t) => t.id === tripId);

    if (!trip) return;

    const fromDay = trip.days.find((d) => d.dayNumber === fromDayNumber);
    const toDay = trip.days.find((d) => d.dayNumber === toDayNumber);

    if (!fromDay || !toDay) return;

    const placeIndex = fromDay.places.findIndex((p) => p.placeId === placeId);
    if (placeIndex === -1) return;

    const [place] = fromDay.places.splice(placeIndex, 1);
    place.order = toDay.places.length + 1;
    toDay.places.push(place);

    trip.dateModified = new Date().toISOString();
    saveTrips(trips);
}

/**
 * Remove a place from a trip day
 */
export function removePlaceFromTrip(
    tripId: string,
    dayNumber: number,
    placeId: string
): void {
    const trips = getTrips();
    const trip = trips.find((t) => t.id === tripId);

    if (!trip) return;

    const day = trip.days.find((d) => d.dayNumber === dayNumber);
    if (!day) return;

    day.places = day.places.filter((p) => p.placeId !== placeId);

    // Re-order remaining places
    day.places.forEach((p, i) => {
        p.order = i + 1;
    });

    trip.dateModified = new Date().toISOString();
    saveTrips(trips);
}

/**
 * Add a new day to a trip
 */
export function addDayToTrip(tripId: string): TripDay | null {
    const trips = getTrips();
    const trip = trips.find((t) => t.id === tripId);

    if (!trip) return null;

    const newDayNumber = trip.days.length + 1;
    const newDay: TripDay = {
        dayNumber: newDayNumber,
        places: [],
    };

    trip.days.push(newDay);
    trip.dateModified = new Date().toISOString();

    saveTrips(trips);
    return newDay;
}

/**
 * Remove a day from a trip
 */
export function removeDayFromTrip(tripId: string, dayNumber: number): void {
    const trips = getTrips();
    const trip = trips.find((t) => t.id === tripId);

    if (!trip) return;

    trip.days = trip.days.filter((d) => d.dayNumber !== dayNumber);

    // Renumber remaining days
    trip.days.forEach((d, i) => {
        d.dayNumber = i + 1;
    });

    trip.dateModified = new Date().toISOString();
    saveTrips(trips);
}

/**
 * Update a day's metadata (label, theme, date)
 */
export function updateTripDay(
    tripId: string,
    dayNumber: number,
    updates: Partial<Pick<TripDay, 'label' | 'theme' | 'date'>>
): void {
    const trips = getTrips();
    const trip = trips.find((t) => t.id === tripId);

    if (!trip) return;

    const day = trip.days.find((d) => d.dayNumber === dayNumber);
    if (!day) return;

    Object.assign(day, updates);
    trip.dateModified = new Date().toISOString();

    saveTrips(trips);
}
