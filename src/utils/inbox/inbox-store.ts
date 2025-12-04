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
  const meta = deriveLinkMeta(rawText);
  const item: InboxItem = {
    id: uuidv4(),
    rawText: rawText.trim(),
    ...meta,
    sourceApp,
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
    if (result.error) {
      return updateInboxItem(id, { status: "needs_info", error: result.error }) as InboxItem;
    }

    const status = deriveStatusFromPlaces(result.places);
    return updateInboxItem(id, { parsedPlaces: result.places, status, error: undefined }) as InboxItem;
  } catch (err: any) {
    console.error("[Inbox] Parse failed", err);
    return updateInboxItem(id, { status: "needs_info", error: err?.message || "Parse failed" }) as InboxItem;
  }
}

export function saveManualPlaces(id: string, places: InboxParsedPlace[]): InboxItem | null {
  const status = deriveStatusFromPlaces(places);
  return updateInboxItem(id, { parsedPlaces: places, status });
}
