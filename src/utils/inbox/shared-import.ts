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

let isImporting = false;

/**
 * Pulls items from the native share extension (App Group) into the app inbox.
 * Returns the number of imported items.
 */
export async function importSharedInbox(): Promise<number> {
  if (isImporting) {
    return 0;
  }

  try {
    isImporting = true;
    const { items = [] } = await SharedInbox.readShared();

    if (!items.length) {
      return 0;
    }

    // Add to inbox and parse in background
    let importedCount = 0;
    for (const item of items) {
      if (item?.rawText) {
        // addInboxItem now handles duplicates internally
        const added = addInboxItem(item.rawText, item.sourceApp || "share-extension");

        // Only trigger parse if it's a new item (not a duplicate returned by addInboxItem)
        // We can check if the receivedAt is very recent
        const isNew = new Date().getTime() - new Date(added.receivedAt).getTime() < 5000;

        if (isNew && added.status === "new") {
          parseInboxItem(added.id).catch((err) => {
            if (import.meta.env.DEV) {
              console.warn("[Inbox] Background parse failed", err);
            }
          });
          importedCount++;
        }
      }
    }

    await SharedInbox.clearShared();
    return importedCount;
  } catch (err) {
    console.error("[Inbox] ❌ Failed to import shared items", err);
    if ((err as any)?.message?.toLowerCase?.().includes("unimplemented") || (err as any)?.code === "ERR_NOT_AVAILABLE") {
      throw new Error("SharedInboxPlugin not available. Run `npx cap copy ios && node scripts/ensure-shared-inbox-plugin.js`, rebuild in Xcode, and ensure App Groups are enabled for both targets.");
    }
    return 0;
  } finally {
    isImporting = false;
  }
}
