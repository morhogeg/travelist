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
    console.log("[Inbox] 🔍 Checking for shared items from native extension...");
    const { items = [] } = await SharedInbox.readShared();
    console.log(`[Inbox] 📊 Found ${items.length} item(s) from share extension`);

    if (!items.length) {
      console.log("[Inbox] ℹ️ No new shared items to import");
      return 0;
    }

    // Add to inbox and parse in background so details are ready when the user opens the item
    for (const item of items) {
      if (item?.rawText) {
        console.log(`[Inbox] ➕ Adding item: ${item.rawText.substring(0, 50)}...`);
        const added = addInboxItem(item.rawText, item.sourceApp || "share-extension");
        console.log(`[Inbox] ✅ Added with ID: ${added.id}`);
        // Kick off parse but don't block the loop
        parseInboxItem(added.id).catch((err) => {
          console.warn("[Inbox] Background parse failed", err);
        });
      }
    }

    await SharedInbox.clearShared();
    console.log(`[Inbox] 🧹 Cleared shared items from native, imported ${items.length} total`);
    return items.length;
  } catch (err) {
    console.error("[Inbox] ❌ Failed to import shared items", err);
    if ((err as any)?.message?.toLowerCase?.().includes("unimplemented") || (err as any)?.code === "ERR_NOT_AVAILABLE") {
      throw new Error("SharedInboxPlugin not available. Run `npx cap copy ios && node scripts/ensure-shared-inbox-plugin.js`, rebuild in Xcode, and ensure App Groups are enabled for both targets.");
    }
    return 0;
  }
}
