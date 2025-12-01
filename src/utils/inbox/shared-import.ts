import { registerPlugin } from "@capacitor/core";
import { addInboxItem, parseInboxItem } from "./inbox-store";

type SharedInboxPlugin = {
  readShared(): Promise<{
    items?: Array<{
      id?: string;
      rawText: string;
      receivedAt?: string;
      sourceApp?: string;
    }>;
  }>;
  clearShared(): Promise<void>;
};

// Plugin id must match the native @objc class name (SharedInboxPlugin)
const SharedInbox = registerPlugin<SharedInboxPlugin>("SharedInboxPlugin");

/**
 * Pulls items from the native share extension (App Group) into the app inbox.
 * Returns the number of imported items.
 */
export async function importSharedInbox(): Promise<number> {
  try {
    const { items = [] } = await SharedInbox.readShared();
    if (!items.length) return 0;

    // Add to inbox and parse in background so details are ready when the user opens the item
    for (const item of items) {
      if (item?.rawText) {
        const added = addInboxItem(item.rawText, item.sourceApp || "share-extension");
        // Kick off parse but don't block the loop
        parseInboxItem(added.id).catch((err) => {
          console.warn("[Inbox] Background parse failed", err);
        });
      }
    }

    await SharedInbox.clearShared();
    return items.length;
  } catch (err) {
    console.warn("[Inbox] Failed to import shared items", err);
    return 0;
  }
}
