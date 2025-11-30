import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabase";
import { ParsedRecommendation, RecommendationPlace } from "./types";

interface SupabaseRecommendationRow {
  id: string;
  name: string;
  category: string;
  city: string;
  country: string | null;
  description: string | null;
  visited: boolean;
  website: string | null;
  source_type: string | null;
  source_name: string | null;
}

function toRow(rec: ParsedRecommendation, place: RecommendationPlace): SupabaseRecommendationRow {
  return {
    id: place.recId || place.id || uuidv4(),
    name: place.name,
    category: place.category,
    city: rec.city,
    country: rec.country ?? null,
    description: place.description ?? rec.rawText ?? null,
    visited: Boolean(place.visited),
    website: place.website ?? null,
    source_type: place.source?.type ?? null,
    source_name: place.source?.name ?? null,
  };
}

/**
 * Pushes the places from a recommendation to Supabase.
 * Safe to call even if Supabase isn't configured.
 */
export async function syncRecommendationToSupabase(rec: ParsedRecommendation) {
  if (!supabase) return;

  const rows = rec.places.map((place) => toRow(rec, place));

  const { error } = await supabase
    .from("recommendations")
    .upsert(rows, { onConflict: "id" });

  if (error) {
    console.warn("[Supabase] Failed to sync recommendation:", error.message);
  }
}
