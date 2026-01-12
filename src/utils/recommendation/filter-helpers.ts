import { getRecommendations } from "./recommendation-manager";
import { GroupedRecommendation } from "./types";
import { getSmartImage } from "@/utils/image/getSmartImage";
import { FilterState } from "@/types/filters";

export const getFilteredRecommendations = async (
  category: string | string[],
  filterCountry?: string,
  filters?: FilterState
): Promise<GroupedRecommendation[]> => {
  console.log("🔍 Filtering by category:", category, "country:", filterCountry, "filters:", filters);
  const all = getRecommendations();

  const normalize = (v: string) => v.trim().toLowerCase();
  const isAllCategory = category === "all" || (Array.isArray(category) && category.length === 0);

  const matchesCategory = (cat: string | undefined) => {
    if (!cat) return false;
    const normCat = normalize(cat);
    if (typeof category === "string") return normalize(category) === normCat;
    return category.map(normalize).includes(normCat);
  };

  const flat = await Promise.all(
    all.flatMap(rec => {
      // Country filter (legacy + new filter state)
      if (filterCountry && rec.country?.toLowerCase() !== filterCountry.toLowerCase()) {
        return [];
      }
      if (filters?.countries && filters.countries.length > 0) {
        if (!rec.country || !filters.countries.map(normalize).includes(normalize(rec.country))) {
          return [];
        }
      }

      // City filter
      if (filters?.cities && filters.cities.length > 0) {
        if (!rec.city || !filters.cities.map(normalize).includes(normalize(rec.city))) {
          return [];
        }
      }

      return rec.places
        .filter(p => {
          // Category filter
          if (!isAllCategory && !matchesCategory(p.category)) return false;

          // Visit status filter
          if (filters?.visitStatus === "visited" && !p.visited) return false;
          if (filters?.visitStatus === "not-visited" && p.visited) return false;

          // Source type filter
          if (filters?.sources && filters.sources.length > 0) {
            if (!p.source || !filters.sources.includes(p.source.type)) return false;
          }

          // Source name filter (specific person)
          if (filters?.sourceNames && filters.sourceNames.length > 0) {
            if (!p.source?.name || !filters.sourceNames.map(normalize).includes(normalize(p.source.name))) {
              return false;
            }
          }

          // Priority filter
          if (filters?.priorities && filters.priorities.length > 0) {
            if (!p.context?.visitPriority || !filters.priorities.includes(p.context.visitPriority)) {
              return false;
            }
          }

          // Occasion filter
          if (filters?.occasions && filters.occasions.length > 0) {
            const placeTags = p.context?.occasionTags || [];
            const hasMatchingTag = filters.occasions.some(occ =>
              placeTags.map(normalize).includes(normalize(occ))
            );
            if (!hasMatchingTag) return false;
          }

          return true;
        })
        .map(async place => {
          const image = place.image || (await getSmartImage(place.name, place.category));
          // Use recId with fallback to id for backward compatibility with old data
          const placeIdentifier = place.recId || place.id;
          return {
            id: placeIdentifier,
            recId: placeIdentifier,
            name: place.name,
            location: rec.city,
            cityId: rec.cityId || rec.id,
            image,
            category: place.category,
            description: place.description,
            visited: !!place.visited,
            dateAdded: rec.dateAdded,
            country: rec.country,
            source: place.source,
            context: place.context,
          };
        });
    })
  );

  const grouped: Record<string, GroupedRecommendation> = {};

  flat.forEach(rec => {
    if (!grouped[rec.cityId]) {
      grouped[rec.cityId] = {
        cityId: rec.cityId,
        cityName: rec.location,
        cityImage: "",
        country: rec.country || "",
        items: [],
      };
    }
    grouped[rec.cityId].items.push(rec);
  });

  return Object.values(grouped).map(group => ({
    ...group,
    items: group.items.sort((a, b) => {
      if (a.visited !== b.visited) return a.visited ? 1 : -1;
      return new Date(b.dateAdded || "").getTime() - new Date(a.dateAdded || "").getTime();
    }),
  }));
};

// Helper to get all unique occasions from recommendations
export const getAvailableOccasions = (): string[] => {
  const all = getRecommendations();
  const occasions = new Set<string>();

  all.forEach(rec => {
    rec.places.forEach(place => {
      if (place.context?.occasionTags) {
        place.context.occasionTags.forEach(tag => occasions.add(tag));
      }
    });
  });

  return Array.from(occasions).sort();
};

// Helper to get all unique countries
export const getAvailableCountries = (): string[] => {
  const all = getRecommendations();
  const countries = new Set<string>();

  all.forEach(rec => {
    if (rec.country) {
      countries.add(rec.country);
    }
  });

  return Array.from(countries).sort();
};

// Helper to get all unique cities, optionally filtered by country
export const getAvailableCities = (filterCountry?: string): string[] => {
  const all = getRecommendations();
  const cities = new Set<string>();

  all.forEach(rec => {
    if (rec.city) {
      // If filterCountry is provided, only include cities from that country
      if (filterCountry) {
        if (rec.country?.toLowerCase() === filterCountry.toLowerCase()) {
          cities.add(rec.city);
        }
      } else {
        cities.add(rec.city);
      }
    }
  });

  return Array.from(cities).sort();
};

// Helper to get all unique friend names (only for 'friend' source type)
export const getAvailableSourceNames = (): string[] => {
  const all = getRecommendations();
  const friendNames = new Set<string>();

  // Source types to exclude (these are not people names)
  const excludedNames = new Set([
    'instagram', 'tiktok', 'youtube', 'friend', 'text', 'email',
    'article', 'blog', 'ai', 'other', 'travelist ai', 'travelist'
  ]);

  all.forEach(rec => {
    rec.places.forEach(place => {
      // Only include names from 'friend' source type
      if (place.source?.type === 'friend' && place.source?.name) {
        const name = place.source.name.trim();
        // Exclude source type names and AI
        if (!excludedNames.has(name.toLowerCase())) {
          friendNames.add(name);
        }
      }
    });
  });

  return Array.from(friendNames).sort();
};