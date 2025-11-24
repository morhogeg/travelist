import { v4 as uuidv4 } from "uuid";
import { Route, RouteDay, RoutePlaceReference, RouteWithProgress, GroupedRoutes, RouteStatus } from "@/types/route";
import { getRecommendations } from "@/utils/recommendation/recommendation-manager";

const ROUTES_STORAGE_KEY = "routes";

/**
 * Get all routes from localStorage
 */
export const getRoutes = (): Route[] => {
  try {
    const raw = localStorage.getItem(ROUTES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("❌ Failed to parse routes from localStorage:", err);
    return [];
  }
};

/**
 * Get a single route by ID
 */
export const getRouteById = (routeId: string): Route | null => {
  const routes = getRoutes();
  return routes.find(r => r.id === routeId) || null;
};

/**
 * Create a new route
 */
export const createRoute = (
  name: string,
  cityId: string,
  city: string,
  country: string,
  startDate?: string,
  endDate?: string
): Route => {
  const routes = getRoutes();

  const newRoute: Route = {
    id: uuidv4(),
    name: name.trim(),
    cityId,
    city: city.trim(),
    country: country.trim(),
    startDate,
    endDate,
    days: [
      {
        dayNumber: 1,
        date: startDate,
        places: []
      }
    ],
    dateCreated: new Date().toISOString(),
    dateModified: new Date().toISOString()
  };

  routes.push(newRoute);
  localStorage.setItem(ROUTES_STORAGE_KEY, JSON.stringify(routes));
  window.dispatchEvent(new CustomEvent("routeCreated", { detail: newRoute }));

  return newRoute;
};

/**
 * Update an existing route
 */
export const updateRoute = (routeId: string, updates: Partial<Route>): boolean => {
  const routes = getRoutes();
  const index = routes.findIndex(r => r.id === routeId);

  if (index === -1) return false;

  routes[index] = {
    ...routes[index],
    ...updates,
    id: routeId, // Ensure ID doesn't change
    dateModified: new Date().toISOString()
  };

  localStorage.setItem(ROUTES_STORAGE_KEY, JSON.stringify(routes));
  window.dispatchEvent(new CustomEvent("routeUpdated", { detail: routes[index] }));

  return true;
};

/**
 * Delete a route
 */
export const deleteRoute = (routeId: string): boolean => {
  const routes = getRoutes();
  const filtered = routes.filter(r => r.id !== routeId);

  if (filtered.length === routes.length) return false;

  localStorage.setItem(ROUTES_STORAGE_KEY, JSON.stringify(filtered));
  window.dispatchEvent(new CustomEvent("routeDeleted", { detail: { routeId } }));

  return true;
};

/**
 * Add a place to a route day
 */
export const addPlaceToRoute = (
  routeId: string,
  dayNumber: number,
  placeId: string,
  notes?: string
): boolean => {
  const routes = getRoutes();
  const route = routes.find(r => r.id === routeId);

  if (!route) return false;

  let day = route.days.find(d => d.dayNumber === dayNumber);

  // If day doesn't exist, create it
  if (!day) {
    day = {
      dayNumber,
      places: []
    };
    route.days.push(day);
    route.days.sort((a, b) => a.dayNumber - b.dayNumber);
  }

  // Check if place already exists in this day
  if (day.places.some(p => p.placeId === placeId)) {
    return false;
  }

  const newPlace: RoutePlaceReference = {
    placeId,
    order: day.places.length,
    notes,
    visited: false
  };

  day.places.push(newPlace);
  route.dateModified = new Date().toISOString();

  localStorage.setItem(ROUTES_STORAGE_KEY, JSON.stringify(routes));
  window.dispatchEvent(new CustomEvent("routeUpdated", { detail: route }));

  return true;
};

/**
 * Remove a place from a route day
 */
export const removePlaceFromRoute = (
  routeId: string,
  dayNumber: number,
  placeId: string
): boolean => {
  const routes = getRoutes();
  const route = routes.find(r => r.id === routeId);

  if (!route) return false;

  const day = route.days.find(d => d.dayNumber === dayNumber);
  if (!day) return false;

  const initialLength = day.places.length;
  day.places = day.places.filter(p => p.placeId !== placeId);

  if (day.places.length === initialLength) return false;

  // Reorder remaining places
  day.places.forEach((place, index) => {
    place.order = index;
  });

  route.dateModified = new Date().toISOString();

  localStorage.setItem(ROUTES_STORAGE_KEY, JSON.stringify(routes));
  window.dispatchEvent(new CustomEvent("routeUpdated", { detail: route }));

  return true;
};

/**
 * Reorder places within a day
 */
export const reorderPlacesInDay = (
  routeId: string,
  dayNumber: number,
  reorderedPlaces: RoutePlaceReference[]
): boolean => {
  const routes = getRoutes();
  const route = routes.find(r => r.id === routeId);

  if (!route) return false;

  const day = route.days.find(d => d.dayNumber === dayNumber);
  if (!day) return false;

  // Update orders
  day.places = reorderedPlaces.map((place, index) => ({
    ...place,
    order: index
  }));

  route.dateModified = new Date().toISOString();

  localStorage.setItem(ROUTES_STORAGE_KEY, JSON.stringify(routes));
  window.dispatchEvent(new CustomEvent("routeUpdated", { detail: route }));

  return true;
};

/**
 * Mark a place as visited in a route
 */
export const markRoutePlaceVisited = (
  routeId: string,
  dayNumber: number,
  placeId: string,
  visited: boolean
): boolean => {
  const routes = getRoutes();
  const route = routes.find(r => r.id === routeId);

  if (!route) return false;

  const day = route.days.find(d => d.dayNumber === dayNumber);
  if (!day) return false;

  const place = day.places.find(p => p.placeId === placeId);
  if (!place) return false;

  place.visited = visited;
  route.dateModified = new Date().toISOString();

  localStorage.setItem(ROUTES_STORAGE_KEY, JSON.stringify(routes));
  window.dispatchEvent(new CustomEvent("routeUpdated", { detail: route }));

  return true;
};

/**
 * Sync visited state from source recommendation to all routes containing that place
 * This ensures two-way sync: marking visited anywhere updates it everywhere
 */
export const syncVisitedStateToRoutes = (recId: string, visited: boolean): void => {
  const routes = getRoutes();
  const recommendations = getRecommendations();

  // Build a map of place details for quick lookup
  const placesMap = new Map<string, any>();
  recommendations.forEach(rec => {
    rec.places.forEach(place => {
      if (place.id) {
        placesMap.set(place.id, place);
      }
    });
  });

  let updated = false;

  // Check each route for places matching the recId
  routes.forEach(route => {
    route.days.forEach(day => {
      day.places.forEach(placeRef => {
        // Get the actual place details
        const place = placesMap.get(placeRef.placeId);

        // Match by recId or id
        if (place && (place.recId === recId || place.id === recId)) {
          placeRef.visited = visited;
          updated = true;
          route.dateModified = new Date().toISOString();
        }
      });
    });
  });

  // Save and notify if any updates were made
  if (updated) {
    localStorage.setItem(ROUTES_STORAGE_KEY, JSON.stringify(routes));
    window.dispatchEvent(new CustomEvent("routeUpdated"));
  }
};

/**
 * Add a new day to a route
 */
export const addDayToRoute = (
  routeId: string,
  date?: string,
  label?: string
): boolean => {
  const routes = getRoutes();
  const route = routes.find(r => r.id === routeId);

  if (!route) return false;

  const nextDayNumber = route.days.length > 0
    ? Math.max(...route.days.map(d => d.dayNumber)) + 1
    : 1;

  const newDay: RouteDay = {
    dayNumber: nextDayNumber,
    date,
    label,
    places: []
  };

  route.days.push(newDay);
  route.days.sort((a, b) => a.dayNumber - b.dayNumber);
  route.dateModified = new Date().toISOString();

  localStorage.setItem(ROUTES_STORAGE_KEY, JSON.stringify(routes));
  window.dispatchEvent(new CustomEvent("routeUpdated", { detail: route }));

  return true;
};

/**
 * Remove a day from a route (only if empty)
 */
export const removeDayFromRoute = (routeId: string, dayNumber: number): boolean => {
  const routes = getRoutes();
  const route = routes.find(r => r.id === routeId);

  if (!route) return false;

  const day = route.days.find(d => d.dayNumber === dayNumber);
  if (!day || day.places.length > 0) return false;

  route.days = route.days.filter(d => d.dayNumber !== dayNumber);
  route.dateModified = new Date().toISOString();

  localStorage.setItem(ROUTES_STORAGE_KEY, JSON.stringify(routes));
  window.dispatchEvent(new CustomEvent("routeUpdated", { detail: route }));

  return true;
};

/**
 * Update a day's label and/or date
 */
export const updateDay = (
  routeId: string,
  dayNumber: number,
  label: string,
  date: string
): boolean => {
  const routes = getRoutes();
  const route = routes.find(r => r.id === routeId);

  if (!route) return false;

  const day = route.days.find(d => d.dayNumber === dayNumber);
  if (!day) return false;

  // Update label (empty string means remove custom label)
  day.label = label.trim() || undefined;

  // Update date (empty string means remove custom date)
  day.date = date.trim() || undefined;

  route.dateModified = new Date().toISOString();

  localStorage.setItem(ROUTES_STORAGE_KEY, JSON.stringify(routes));
  window.dispatchEvent(new CustomEvent("routeUpdated", { detail: route }));

  return true;
};

/**
 * Calculate progress for a route
 */
export const calculateRouteProgress = (route: Route): RouteWithProgress => {
  let totalPlaces = 0;
  let visitedPlaces = 0;

  route.days.forEach(day => {
    totalPlaces += day.places.length;
    visitedPlaces += day.places.filter(p => p.visited).length;
  });

  const progressPercentage = totalPlaces > 0
    ? Math.round((visitedPlaces / totalPlaces) * 100)
    : 0;

  return {
    ...route,
    totalPlaces,
    visitedPlaces,
    progressPercentage
  };
};

/**
 * Determine route status based on completion and dates
 */
export const getRouteStatus = (routeWithProgress: RouteWithProgress): RouteStatus => {
  // Check completion first - if 100% visited, it's completed regardless of dates
  if (routeWithProgress.progressPercentage === 100) {
    return 'completed';
  }

  // Otherwise use date-based logic
  const route = routeWithProgress;
  if (!route.startDate && !route.endDate) {
    return 'undated';
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (route.endDate) {
    const endDate = new Date(route.endDate);
    endDate.setHours(0, 0, 0, 0);
    if (endDate < now) {
      return 'past';
    }
  }

  if (route.startDate) {
    const startDate = new Date(route.startDate);
    startDate.setHours(0, 0, 0, 0);

    if (startDate > now) {
      return 'upcoming';
    }

    if (route.endDate) {
      const endDate = new Date(route.endDate);
      endDate.setHours(0, 0, 0, 0);
      if (startDate <= now && now <= endDate) {
        return 'ongoing';
      }
    } else {
      // If only start date and it's today or past
      return 'ongoing';
    }
  }

  return 'undated';
};

/**
 * Get all routes grouped by status with progress
 */
export const getGroupedRoutes = (): GroupedRoutes => {
  const routes = getRoutes();
  const routesWithProgress = routes.map(calculateRouteProgress);

  const grouped: GroupedRoutes = {
    ongoing: [],
    completed: [],
    upcoming: [],
    past: [],
    undated: []
  };

  routesWithProgress.forEach(route => {
    const status = getRouteStatus(route);
    grouped[status].push(route);
  });

  // Sort each group
  grouped.ongoing.sort((a, b) => {
    if (!a.startDate || !b.startDate) return 0;
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });

  grouped.completed.sort((a, b) => {
    // Sort completed by most recently completed (modified date)
    return new Date(b.dateModified).getTime() - new Date(a.dateModified).getTime();
  });

  grouped.upcoming.sort((a, b) => {
    if (!a.startDate || !b.startDate) return 0;
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });

  grouped.past.sort((a, b) => {
    if (!a.endDate || !b.endDate) return 0;
    return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
  });

  grouped.undated.sort((a, b) => {
    return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime();
  });

  return grouped;
};

/**
 * Get routes for a specific city
 */
export const getRoutesByCity = (cityId: string): RouteWithProgress[] => {
  const routes = getRoutes();
  return routes
    .filter(r => r.cityId === cityId)
    .map(calculateRouteProgress);
};

/**
 * Create a route from a collection
 */
export const createRouteFromCollection = (
  collectionName: string,
  cityId: string,
  city: string,
  country: string,
  placeIds: string[]
): Route => {
  const route = createRoute(
    collectionName,
    cityId,
    city,
    country
  );

  // Add all places to day 1
  placeIds.forEach(placeId => {
    addPlaceToRoute(route.id, 1, placeId);
  });

  return getRouteById(route.id)!;
};

/**
 * Verify that all places in a route still exist in recommendations
 */
export const validateRoutePlaces = (routeId: string): boolean => {
  const route = getRouteById(routeId);
  if (!route) return false;

  const recommendations = getRecommendations();
  const allPlaceIds = new Set(
    recommendations.flatMap(rec => rec.places.map(p => p.id || ''))
  );

  let hasChanges = false;

  route.days.forEach(day => {
    const validPlaces = day.places.filter(p => allPlaceIds.has(p.placeId));
    if (validPlaces.length !== day.places.length) {
      day.places = validPlaces;
      hasChanges = true;
    }
  });

  if (hasChanges) {
    updateRoute(routeId, { days: route.days });
  }

  return hasChanges;
};
