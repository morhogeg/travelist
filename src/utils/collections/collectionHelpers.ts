import { Collection } from "./collectionStore";
import { getCategoryColor } from "@/components/recommendations/utils/category-data";

export interface CategoryBreakdown {
  category: string;
  count: number;
  color: string;
  percentage: number;
}

export interface EnrichedCollection extends Collection {
  categoryBreakdown: CategoryBreakdown[];
  totalPlaces: number;
}

export interface GroupedCollections {
  recent: EnrichedCollection[];
  older: EnrichedCollection[];
}

interface PlaceWithCategory {
  id?: string;
  recId?: string;
  category?: string;
}

/**
 * Compute category breakdown for a collection
 */
export function getCollectionCategoryBreakdown(
  collection: Collection,
  allPlaces: PlaceWithCategory[]
): CategoryBreakdown[] {
  // Match placeIds to actual places
  const matchedPlaces = allPlaces.filter(
    (place) =>
      collection.placeIds.includes(place.recId || "") ||
      collection.placeIds.includes(place.id || "")
  );

  // Count by category
  const categoryMap = new Map<string, number>();
  matchedPlaces.forEach((place) => {
    const cat = place.category?.toLowerCase() || "general";
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
  });

  // Convert to array with colors and percentages
  const total = matchedPlaces.length;
  return Array.from(categoryMap.entries())
    .map(([category, count]) => ({
      category,
      count,
      color: getCategoryColor(category),
      percentage: total > 0 ? (count / total) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count); // Sort by count descending
}

/**
 * Group collections by recency (last 7 days = "recent", older = "older")
 */
export function groupCollectionsByRecency(
  collections: EnrichedCollection[]
): GroupedCollections {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const recent: EnrichedCollection[] = [];
  const older: EnrichedCollection[] = [];

  collections.forEach((col) => {
    // Use lastModified if available, otherwise fall back to createdAt
    const dateString = col.lastModified || col.createdAt;
    const date = new Date(dateString);

    if (date >= sevenDaysAgo) {
      recent.push(col);
    } else {
      older.push(col);
    }
  });

  // Sort each group by date, newest first
  const sortByDate = (a: EnrichedCollection, b: EnrichedCollection) => {
    const dateA = new Date(a.lastModified || a.createdAt).getTime();
    const dateB = new Date(b.lastModified || b.createdAt).getTime();
    return dateB - dateA;
  };

  return {
    recent: recent.sort(sortByDate),
    older: older.sort(sortByDate),
  };
}

/**
 * Enrich a collection with category breakdown data
 */
export function enrichCollection(
  collection: Collection,
  allPlaces: PlaceWithCategory[]
): EnrichedCollection {
  return {
    ...collection,
    categoryBreakdown: getCollectionCategoryBreakdown(collection, allPlaces),
    totalPlaces: collection.placeIds.length,
  };
}

/**
 * Enrich all collections and group by recency
 */
export function getEnrichedAndGroupedCollections(
  collections: Collection[],
  allPlaces: PlaceWithCategory[]
): GroupedCollections {
  const enriched = collections.map((col) => enrichCollection(col, allPlaces));
  return groupCollectionsByRecency(enriched);
}
