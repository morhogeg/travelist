import { v4 as uuidv4 } from "uuid";
import { ParsedRecommendation } from "./types";
import { getCategoryPlaceholder } from "@/utils/image/getCategoryPlaceholder";
import { getSmartImage } from "@/utils/image/getSmartImage";

export const getRecommendations = (): ParsedRecommendation[] => {
  try {
    const raw = localStorage.getItem("recommendations");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("❌ Failed to parse recommendations from localStorage:", err);
    return [];
  }
};

export const storeRecommendation = async (
  recommendation: ParsedRecommendation
): Promise<void> => {
  const recommendations = getRecommendations();
  const existingIndex = recommendations.findIndex(
    (r) => r.city.toLowerCase() === recommendation.city.toLowerCase()
  );

  const cityId = recommendation.cityId || recommendation.id || uuidv4();

  recommendation.places = await Promise.all(
    recommendation.places.map(async (place) => {
      const id = place.id || uuidv4();
      let image = place.image;

      if (!image) {
        try {
          image = await getSmartImage(`${place.name} ${recommendation.city}`, place.category);
        } catch (err) {
          console.warn(`❌ Failed to fetch image for ${place.name}`, err);
        }

        if (!image) {
          image = getCategoryPlaceholder(place.category);
        }
      }

      return {
        ...place,
        id,
        recId: place.recId || id,
        image,
      };
    })
  );

  recommendation.cityId = cityId;

  if (existingIndex >= 0) {
    const existing = recommendations[existingIndex];
    const existingNames = new Set(existing.places.map((p) => p.name.toLowerCase()));

    recommendation.places.forEach((place) => {
      if (!existingNames.has(place.name.toLowerCase())) {
        existing.places.push(place);
      }
    });

    existing.categories = Array.from(
      new Set([...existing.categories, ...recommendation.categories])
    );

    // ✅ Ensure country is updated
    if (recommendation.country) {
      existing.country = recommendation.country;
    }

    recommendations[existingIndex] = existing;
  } else {
    recommendations.push(recommendation);
  }

  localStorage.setItem("recommendations", JSON.stringify(recommendations));
  window.dispatchEvent(new CustomEvent("recommendationAdded"));
};

export const markRecommendationVisited = (
  recId: string,
  _name: string,
  visited: boolean
): void => {
  const recommendations = getRecommendations();
  let updated = false;

  for (const rec of recommendations) {
    for (const place of rec.places) {
      if (place.recId === recId) {
        place.visited = visited;
        updated = true;
      }
    }
  }

  if (updated) {
    localStorage.setItem("recommendations", JSON.stringify(recommendations));
    window.dispatchEvent(new CustomEvent("recommendationVisited"));
  }
};

export const deleteRecommendation = (recId: string): void => {
  const recommendations = getRecommendations();
  const updated = recommendations
    .map((rec) => ({
      ...rec,
      places: rec.places.filter((place) => place.recId !== recId),
    }))
    .filter((rec) => rec.places.length > 0);

  localStorage.setItem("recommendations", JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent("recommendationDeleted"));
};

export const updateRecommendationMeta = (
  recId: string,
  updates: {
    source?: ParsedRecommendation['places'][0]['source'];
    context?: ParsedRecommendation['places'][0]['context'];
    description?: string;
    website?: string;
  }
): boolean => {
  const recommendations = getRecommendations();
  let updated = false;

  for (const rec of recommendations) {
    for (const place of rec.places) {
      if (place.recId === recId) {
        // Update source if provided
        if (updates.source !== undefined) {
          place.source = updates.source;
        }
        // Update context if provided
        if (updates.context !== undefined) {
          place.context = updates.context;
        }
        // Update description if provided
        if (updates.description !== undefined) {
          place.description = updates.description;
        }
        // Update website if provided
        if (updates.website !== undefined) {
          place.website = updates.website;
        }
        updated = true;
        break;
      }
    }
    if (updated) break;
  }

  if (updated) {
    localStorage.setItem("recommendations", JSON.stringify(recommendations));
    window.dispatchEvent(new CustomEvent("recommendationUpdated"));
  }

  return updated;
};