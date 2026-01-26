import { v4 as uuidv4 } from "uuid";
import { InboxItem, InboxStatus, InboxParsedPlace } from "@/types/inbox";
import { parseSharedText } from "@/services/ai/providers/openrouter-parser";

const STORAGE_KEY = "travelist-inbox";

function deriveLinkMeta(rawText: string): Pick<InboxItem, "url" | "displayHost" | "displayTitle"> {
  try {
    const urlMatch = rawText.match(/https?:\/\/[^\s]+/);
    const url = new URL(urlMatch ? urlMatch[0] : rawText.trim());
    const host = url.host.replace(/^www\./, "");

    const pathParts = url.pathname.split("/").filter(Boolean);
    // Prefer the segment after "place" for Google Maps links
    const placeIndex = pathParts.indexOf("place");
    let candidate =
      placeIndex !== -1 && pathParts[placeIndex + 1]
        ? pathParts[placeIndex + 1]
        : pathParts[pathParts.length - 1] || host;

    let title = decodeURIComponent(candidate).replace(/[-_+]+/g, " ").trim();
    if (!title) title = host;

    return { url: url.toString(), displayHost: host, displayTitle: title };
  } catch {
    return {};
  }
}

function persist(items: InboxItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("inboxUpdated"));
}

export function getInboxItems(): InboxItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item: InboxItem) => {
      if (!item.displayHost && !item.url) {
        return { ...item, ...deriveLinkMeta(item.rawText) };
      }
      return item;
    });
  } catch (err) {
    console.error("[Inbox] Failed to read inbox from storage", err);
    return [];
  }
}

export function addInboxItem(rawText: string, sourceApp?: string): InboxItem {
  const items = getInboxItems();

  // Check for duplicates
  const trimmedText = rawText.trim();
  const existing = items.find(i => i.rawText.trim() === trimmedText);
  if (existing) {
    console.log("[Inbox] Item already exists, skipping:", trimmedText.substring(0, 30));
    return existing;
  }

  // Detect input type
  const urlPattern = /https?:\/\/[^\s]+/;
  const hasURL = urlPattern.test(trimmedText);
  const inputType = hasURL ? 'url' : 'text';

  const meta = deriveLinkMeta(rawText);
  const item: InboxItem = {
    id: uuidv4(),
    rawText: trimmedText,
    ...meta,
    sourceApp,
    inputType,
    receivedAt: new Date().toISOString(),
    status: "new",
    parsedPlaces: [],
  };

  items.unshift(item);
  persist(items);
  return item;
}

export function updateInboxItem(id: string, updates: Partial<InboxItem>): InboxItem | null {
  const items = getInboxItems();
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const updated: InboxItem = {
    ...items[index],
    ...updates,
  };

  items[index] = updated;
  persist(items);
  return updated;
}

export function deleteInboxItem(id: string) {
  const items = getInboxItems().filter((item) => item.id !== id);
  persist(items);
}

export function markImported(id: string) {
  updateInboxItem(id, { status: "imported" });
}

function deriveStatusFromPlaces(places: InboxParsedPlace[]): InboxStatus {
  if (!places.length) return "needs_info";
  const hasLocation = places.some((p) => p.city && p.country);
  return hasLocation ? "draft_ready" : "needs_info";
}

export async function parseInboxItem(id: string): Promise<InboxItem | null> {
  const existing = getInboxItems();
  const target = existing.find((item) => item.id === id);
  if (!target) return null;

  // Mark as processing to update UI immediately
  updateInboxItem(id, { status: "processing", error: undefined });

  try {
    const result = await parseSharedText(target.rawText);

    // If AI returned results, use them
    if (result.places.length > 0) {
      // Map AI ParsedPlace to InboxParsedPlace with source data
      const mappedPlaces: InboxParsedPlace[] = result.places.map(p => ({
        name: p.name,
        category: p.category,
        city: p.city,
        country: p.country,
        description: p.description,
        confidence: p.confidence,
        sourceName: p.source?.name,
        sourceType: p.source?.type as 'friend' | 'instagram' | 'tiktok' | 'article' | 'other' | undefined,
        sourceUrl: p.source?.url,
      }));
      const status = deriveStatusFromPlaces(mappedPlaces);
      return updateInboxItem(id, { parsedPlaces: mappedPlaces, status, error: undefined }) as InboxItem;
    }

    // If AI returned empty, try local URL parsing as fallback
    const localParsed = parseURLLocally(target.rawText);
    if (localParsed) {
      const places = [localParsed];
      const status = deriveStatusFromPlaces(places);
      return updateInboxItem(id, { parsedPlaces: places, status, error: undefined }) as InboxItem;
    }

    // If both failed, mark as needs_info
    return updateInboxItem(id, {
      status: "needs_info",
      error: result.error || "Could not extract place info - please add manually"
    }) as InboxItem;
  } catch (err: any) {
    console.error("[Inbox] Parse failed", err);
    return updateInboxItem(id, { status: "needs_info", error: err?.message || "Parse failed" }) as InboxItem;
  }
}

/**
 * Local URL parsing fallback - extracts place names from URLs without AI
 */
function parseURLLocally(rawText: string): InboxParsedPlace | null {
  try {
    const urlMatch = rawText.match(/https?:\/\/[^\s]+/);
    if (!urlMatch) return null;

    const url = new URL(urlMatch[0]);
    const host = url.host.toLowerCase();
    const path = url.pathname;

    // Google Maps: /place/PlaceName/
    if (host.includes("google") && path.includes("/place/")) {
      const parts = path.split("/place/");
      if (parts.length > 1) {
        const afterPlace = parts[1].split("/")[0];
        const decoded = decodeURIComponent(afterPlace).replace(/\+/g, " ");

        // Split by comma: "Name, Street Address, City, Country"
        const segments = decoded.split(",").map(s => s.trim()).filter(s => s.length > 0);

        if (segments.length >= 1) {
          const name = segments[0];
          let city: string | undefined;
          let country: string | undefined;

          // Common Israeli cities for automatic country detection
          const israeliCities = [
            "tel aviv", "jerusalem", "haifa", "bat yam", "netanya", "herzliya",
            "ramat gan", "eilat", "beersheba", "ashdod", "ashkelon", "petah tikva",
            "rishon lezion", "holon", "bnei brak", "raanana", "kfar saba", "givatayim",
            "herzliya pituach", "tel aviv-yafo", "tel-aviv"
          ];

          if (segments.length >= 4) {
            // Format: Name, Street, City, Country
            city = segments[segments.length - 2];
            country = segments[segments.length - 1];
          } else if (segments.length === 3) {
            // Format: Name, City, Country OR Name, Street, City
            // Check if last segment looks like a country
            const lastLower = segments[2].toLowerCase();
            const knownCountries = ["israel", "usa", "uk", "italy", "france", "spain", "germany", "austria", "greece", "portugal", "japan", "thailand", "vietnam"];
            if (knownCountries.some(c => lastLower.includes(c))) {
              city = segments[1];
              country = segments[2];
            } else {
              // Might be Name, Street, City - check if segment[2] is a known city
              if (israeliCities.some(c => segments[2].toLowerCase().includes(c))) {
                city = segments[2];
                country = "Israel";
              } else {
                city = segments[2];
              }
            }
          } else if (segments.length === 2) {
            // Format: Name, City - try to detect country from city
            const secondLower = segments[1].toLowerCase();
            if (israeliCities.some(c => secondLower.includes(c))) {
              city = segments[1];
              country = "Israel";
            } else {
              city = segments[1];
            }
          }

          return {
            name,
            city,
            country,
            category: "general",
            confidence: 0.85,
          };
        }
      }
    }

    // Google Maps: ?q=PlaceName
    const qParam = url.searchParams.get("q");
    if (host.includes("google") && qParam) {
      return {
        name: decodeURIComponent(qParam).replace(/\+/g, " "),
        category: "general",
        confidence: 0.7,
      };
    }

    // Yelp: /biz/restaurant-name-city
    if (host.includes("yelp") && path.includes("/biz/")) {
      const bizPart = path.replace("/biz/", "").split("?")[0];
      const nameParts = bizPart.split("-").slice(0, -1); // Remove city part
      const name = nameParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
      if (name) {
        return {
          name,
          category: "food",
          confidence: 0.8,
        };
      }
    }

    // TripAdvisor
    if (host.includes("tripadvisor") && path.includes("-Reviews-")) {
      const match = path.match(/-Reviews-([^-]+)/);
      if (match) {
        const name = match[1].replace(/_/g, " ");
        return {
          name,
          category: "general",
          confidence: 0.7,
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}

export function saveManualPlaces(id: string, places: InboxParsedPlace[]): InboxItem | null {
  const status = deriveStatusFromPlaces(places);
  return updateInboxItem(id, { parsedPlaces: places, status });
}
