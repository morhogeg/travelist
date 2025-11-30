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
  user_id: string;
}

function toRow(rec: ParsedRecommendation, place: RecommendationPlace, userId: string): SupabaseRecommendationRow {
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
    user_id: userId,
  };
}

function mapRowToPlace(row: SupabaseRecommendationRow): RecommendationPlace {
  return {
    id: row.id,
    recId: row.id,
    name: row.name,
    category: row.category,
    description: row.description ?? undefined,
    visited: row.visited,
    website: row.website ?? undefined,
    source: row.source_type || row.source_name
      ? {
          type: (row.source_type as any) ?? "other",
          name: row.source_name ?? "",
        }
      : undefined,
  };
}

function groupRowsToParsedRecommendations(rows: SupabaseRecommendationRow[]): ParsedRecommendation[] {
  const byCity = new Map<string, ParsedRecommendation>();

  rows.forEach((row) => {
    const key = row.city.toLowerCase();
    const place = mapRowToPlace(row);

    if (!byCity.has(key)) {
      byCity.set(key, {
        id: row.id, // not used for grouping, but kept for structure
        city: row.city,
        country: row.country ?? undefined,
        categories: [row.category],
        places: [place],
        rawText: "",
      });
    } else {
      const rec = byCity.get(key)!;
      rec.places.push(place);
      if (!rec.categories.includes(row.category)) {
        rec.categories.push(row.category);
      }
    }
  });

  return Array.from(byCity.values());
}

/**
 * Pushes the places from a recommendation to Supabase.
 * Safe to call even if Supabase isn't configured.
 */
export async function syncRecommendationToSupabase(rec: ParsedRecommendation) {
  if (!supabase) return;

  const { data, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !data.session?.user?.id) {
    console.warn("[Supabase] No signed-in user; skipping cloud sync.");
    return;
  }

  const userId = data.session.user.id;
  const rows = rec.places.map((place) => toRow(rec, place, userId));

  const { error } = await supabase
    .from("recommendations")
    .upsert(rows, { onConflict: "id" });

  if (error) {
    console.warn("[Supabase] Failed to sync recommendation:", error.message);
  }
}

/**
 * Fetch all recommendations for the signed-in user.
 */
export async function fetchSupabaseRecommendations(): Promise<ParsedRecommendation[]> {
  if (!supabase) return [];

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData.session?.user?.id) {
    return [];
  }

  const { data, error } = await supabase
    .from("recommendations")
    .select("*")
    .eq("user_id", sessionData.session.user.id);

  if (error || !data) {
    console.warn("[Supabase] Failed to fetch recommendations:", error?.message);
    return [];
  }

  return groupRowsToParsedRecommendations(data as SupabaseRecommendationRow[]);
}

/**
 * Backfill local recommendations to Supabase for the signed-in user.
 */
export async function backfillLocalToSupabase(recs: ParsedRecommendation[]) {
  if (!supabase) return;
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData.session?.user?.id) {
    return;
  }

  for (const rec of recs) {
    await syncRecommendationToSupabase(rec);
  }
}
