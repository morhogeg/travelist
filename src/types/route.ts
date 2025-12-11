// Route types for organizing saved places into ordered itineraries

export interface RoutePlaceReference {
  placeId: string; // references RecommendationPlace.id or recId
  placeName?: string; // place name for fallback lookup if ID doesn't match
  order: number; // position in the day's itinerary
  notes?: string; // day-specific notes for this place
  visited: boolean; // visited status for this specific route
}

export interface RouteDay {
  dayNumber: number; // 1-indexed day number (Day 1, Day 2, etc.)
  date?: string; // optional specific date (ISO format)
  label?: string; // optional custom label (e.g., "Arrival Day", "Museum Day")
  places: RoutePlaceReference[]; // ordered list of places for this day
}

export interface Route {
  id: string; // unique route identifier
  name: string; // user-defined route name (e.g., "Paris Weekend", "Tokyo Day 1")
  cityId: string; // references city in recommendations
  city: string; // city name
  country: string; // country name
  startDate?: string; // optional trip start date (ISO format)
  endDate?: string; // optional trip end date (ISO format)
  days: RouteDay[]; // array of days with places
  dateCreated: string; // when the route was created (ISO format)
  dateModified: string; // last modified timestamp (ISO format)
}

// Helper type for route list display
export interface RouteWithProgress extends Route {
  totalPlaces: number;
  visitedPlaces: number;
  progressPercentage: number;
}

// Grouping for route list view
export type RouteStatus = 'ongoing' | 'completed' | 'upcoming' | 'past' | 'undated';

export interface GroupedRoutes {
  ongoing: RouteWithProgress[];
  completed: RouteWithProgress[];
  upcoming: RouteWithProgress[];
  past: RouteWithProgress[];
  undated: RouteWithProgress[];
}
