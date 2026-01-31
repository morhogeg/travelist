import { getCollections, addCollection, toggleRouteMode, updateOrderedPlaceIds } from "./collectionStore";
import { getRoutes, deleteRoute } from "../route/route-manager";

/**
 * One-time migration utility to convert existing Routes into Collections with Route Mode enabled
 * This function should be called once when the app starts (in App.tsx useEffect)
 */
export function migrateRoutesToCollections(): void {
    const MIGRATION_KEY = "travelist-routes-to-collections-migration-v1";

    // Check if migration has already run
    if (localStorage.getItem(MIGRATION_KEY)) {
        return; // Migration already completed
    }

    const routes = getRoutes();
    const collections = getCollections();

    // Track how many routes were migrated
    let migratedCount = 0;

    routes.forEach(route => {
        // Collect all place IDs from all days in the route
        const allPlaceIds: string[] = route.days.flatMap(day =>
            day.places.map(p => p.placeId)
        );

        // Skip if route has no places
        if (allPlaceIds.length === 0) {
            return;
        }

        // Check if a collection with this route name already exists
        const existingCollection = collections.find(c => c.name === route.name);

        if (existingCollection) {
            // If collection exists with same name, just enable route mode and set order
            toggleRouteMode(existingCollection.id, true);
            updateOrderedPlaceIds(existingCollection.id, allPlaceIds);
            migratedCount++;
        } else {
            // Create new collection with route mode enabled
            const newCollection = addCollection(route.name);

            // Add all places to the collection
            const collections = getCollections();
            const updatedCollections = collections.map(c => {
                if (c.id === newCollection.id) {
                    return {
                        ...c,
                        placeIds: allPlaceIds,
                        routeMode: true,
                        orderedPlaceIds: allPlaceIds,
                    };
                }
                return c;
            });

            localStorage.setItem("travelist-collections", JSON.stringify(updatedCollections));
            migratedCount++;
        }

        // Delete the original route
        deleteRoute(route.id);
    });

    // Mark migration as complete
    localStorage.setItem(MIGRATION_KEY, new Date().toISOString());

    console.log(`✅ Routes migration complete: ${migratedCount} routes converted to collections with Route Mode enabled`);
}
