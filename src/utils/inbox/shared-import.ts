import { registerPlugin } from "@capacitor/core";
import { addInboxItem } from "./inbox-store";

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

    items.forEach((item) => {
      if (item?.rawText) {
        addInboxItem(item.rawText, item.sourceApp || "share-extension");
      }
    });

    await SharedInbox.clearShared();
    return items.length;
  } catch (err) {
    console.warn("[Inbox] Failed to import shared items", err);
    return 0;
  }
}
