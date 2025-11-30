import { v4 as uuidv4 } from "uuid";
import { ParsedRecommendation } from "./types";
import { getCategoryPlaceholder } from "@/utils/image/getCategoryPlaceholder";
import { getSmartImage } from "@/utils/image/getSmartImage";
import { syncRecommendationToSupabase, fetchSupabaseRecommendations, backfillLocalToSupabase } from "./supabase-recommendations";
import { supabase } from "@/lib/supabase";

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

  // Trim city name to prevent duplicates from whitespace
  recommendation.city = recommendation.city.trim();

  const existingIndex = recommendations.findIndex(
    (r) => r.city.toLowerCase().trim() === recommendation.city.toLowerCase()
  );

  // Use existing cityId if merging into existing city, otherwise generate new one
  const cityId = existingIndex >= 0
    ? recommendations[existingIndex].cityId || recommendations[existingIndex].id
    : (recommendation.cityId || recommendation.id || uuidv4());

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

  // Non-blocking cloud sync (if Supabase is configured)
  syncRecommendationToSupabase(recommendation).catch((err) => {
    console.warn("[Supabase] Sync error:", err);
  });
};

let hasSyncedSupabase = false;

export async function syncSupabaseRecommendationsOnce(): Promise<void> {
  if (hasSyncedSupabase) return;
  hasSyncedSupabase = true;

  if (!supabase) return;

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData.session?.user?.id) {
    return;
  }

  // Fetch cloud data
  const cloudRecs = await fetchSupabaseRecommendations();
  const local = getRecommendations();

  // Merge: keep local as source of truth, add any cloud recs/places missing locally
  const localRecIds = new Set<string>();
  local.forEach((rec) => rec.places.forEach((p) => p.recId && localRecIds.add(p.recId)));

  const merged = [...local];

  cloudRecs.forEach((cloudRec) => {
    const targetIndex = merged.findIndex(
      (r) => r.city.toLowerCase().trim() === cloudRec.city.toLowerCase().trim()
    );

    if (targetIndex === -1) {
      // Entire rec is new locally; add it
      merged.push(cloudRec);
    } else {
      const target = merged[targetIndex];
      const existingPlaceIds = new Set(target.places.map((p) => p.recId || p.id));

      cloudRec.places.forEach((place) => {
        const placeId = place.recId || place.id;
        if (placeId && !existingPlaceIds.has(placeId)) {
          target.places.push(place);
          target.categories = Array.from(
            new Set([...target.categories, ...cloudRec.categories])
          );
        }
      });

      merged[targetIndex] = target;
    }
  });

  localStorage.setItem("recommendations", JSON.stringify(merged));

  // Backfill local (merged) to cloud to ensure Supabase has everything
  await backfillLocalToSupabase(merged);
}

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
