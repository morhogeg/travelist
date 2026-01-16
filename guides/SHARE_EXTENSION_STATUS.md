# Share Extension & Inbox Status (January 2026)

## What's working
- Inbox feature exists in the app (page + navigation) and can be viewed when built with the current web bundle.
- Deep link share via `travelist://share?text=...` lands items in Inbox and creates cards.
- iOS Share Extension installs, shows in the share sheet, and saves shared text/URLs to the App Group (`group.com.travelist.shared`).
- Import from the App Group into the Inbox now works (toast appears, items show) when the app returns to foreground.
- Inbox list shows friendly titles/addresses for shared links; opening an item auto-parses and pre-fills the form, with link/open/delete actions aligned on the right.
- Inbox page uses the same centered gradient header style as Collections/Routes for consistent iOS UI.
- Saving from Inbox now maps the "Description or tip" into the card's context, so tips show in the expanded view with the amber lightbulb (same as regular cards).
- Shared items are parsed in the background on import, so details are usually ready when you tap "Open." Status labels now read "Ready to Save" and "Saved" for clarity.
- Inbox filter pills match the pill shape/color system used elsewhere (foreground text when inactive, gradient when active).
- Inbox has a dedicated filter drawer (same UI as home) for status + city/country + source (Google Maps/Instagram/Friend/TikTok inferred). Status pills at the top also filter.
- "Ready for Review" status pill is now a primary gradient button with a pencil icon; tapping it opens the item for approval (makes the review step obvious).
- Home screen remembers collapsed city state inside a country; when you collapse a country and reopen it, cities retain their collapsed state.
- Inbox review drawer simplified: header only shows "Open link" and title; confidence badge and host tag removed; re-run parse removed. Saving removes the item from Inbox. Drawer inputs/pills match add-recommendation styling (aligned sizes, category pills below country).
- Splash screen is explicitly hidden at app start (`SplashScreen.hide()`) to avoid timeout warnings.
- Inbox drawer edits a single place (first parsed place or placeholder) to avoid duplicate forms; category pills moved below country; consistent text sizing; inactive pills cleaned up in dark mode.
- Home cards now use the same liquid-glass border/padding treatment as Inbox cards (no side accent bar) while keeping the colored category icon and existing actions; tab bar gains extra bottom padding/rounding to avoid clipped corners on devices with curved screens.
- Home detail drawer: address pill opens Maps; actions now read "Add to Collection," "Add to Route" (route picker drawer to create/select routes), and "Mark Visited." Delete uses the confirmation dialog and neutral styling.
- Route/Collection picker drawers support multi-select with purple "Done" and toasts listing all selected destinations; "Create New" uses solid borders and a map-pin-plus icon for routes.
- Home detail header refined: category icon left, centered title/address, date top-right, inline tip/recommender, and flattened buttons/rows for a cleaner look.
- Occasion tags now highlight in our purple when selected; detail header centering polished.
- **NEW: Paste to Inbox** — A clipboard paste button in the Inbox header lets you paste URLs/text directly from your clipboard, bypassing the Share Extension entirely.

## Why it broke before
- The native config (`ios/App/App/capacitor.config.json`) sometimes regenerated without `SharedInboxPlugin`, so the app reported `UNIMPLEMENTED` and never imported.
- App Groups capability must be enabled on both App + ShareExtension targets; otherwise `UserDefaults(suiteName:)` returns empty.
- Running `npx cap copy ios` without patching the generated config drops the `SharedInboxPlugin`. Use the provided script/command to keep it.
- **Intermittent failures** were caused by: deprecated `.synchronize()` not guaranteeing data writes, extension being terminated before async saves completed, and no proper error handling.

## Fix applied
- `capacitor.config.ts` and generated `ios/App/App/capacitor.config.json` include `SharedInboxPlugin` in `packageClassList`.
- **January 2026 Capacitor 7 fix**: Local plugins in Capacitor 7 must be manually registered. `SharedInboxPlugin.swift` now uses `CAPBridgedPlugin` protocol (same as official plugins) and is registered in `MyViewController.capacitorDidLoad()` via `bridge?.registerPluginInstance(SharedInboxPlugin())`.
- App + ShareExtension targets have App Group `group.com.travelist.shared` enabled.
- **December 2025 reliability fix**: `ShareViewController.swift` now uses `DispatchGroup` for proper async handling, `CFPreferencesAppSynchronize` for reliable saves, duplicate detection, and comprehensive NSLog debugging.

## Easy Testing Workflow

### Option 1: Paste to Inbox (Recommended for Dev)
1. Copy any URL or text to your clipboard
2. Open the app, go to the Inbox tab
3. Tap the clipboard icon in the header
4. The item appears immediately, ready to review

### Option 2: Deep Link Test (No Xcode scheme switching)
```bash
# Test with plain text
npm run share:test

# Test with a Google Maps URL
npm run share:test:url

# Or manually:
xcrun simctl openurl booted 'travelist://share?text=YOUR_TEXT_HERE'
```

### Option 3: Native Share Extension (Full flow)
1. Build and run the **App** scheme (not ShareExtension!)
2. Open Safari, share a URL → Travelist
3. Return to app, verify toast appears
4. Check Console.app for `[ShareExtension]` logs to confirm data flow

## How to use (dev / live reload)
1) Terminal A (repo root): `npm run dev -- --host` → note LAN URL (e.g., `http://192.168.0.108:5173`).
2) `capacitor.config.ts` server points to that URL with `cleartext: true` (already set).
3) Terminal B (repo root): `npx cap copy ios` (fast; no pod install) to push web assets + config.
4) In Xcode, run the **App** scheme. Simulator will load from the dev server and hot-reload on save.

## If you see `UNIMPLEMENTED` again
This error means the plugin isn't registered with the Capacitor bridge. In Capacitor 7, local plugins (unlike npm plugins) require manual registration.

### Fix Checklist:
1. **Verify `MyViewController.swift`** contains:
   ```swift
   override open func capacitorDidLoad() {
       bridge?.registerPluginInstance(SharedInboxPlugin())
   }
   ```
2. **Verify `SharedInboxPlugin.swift`** uses `CAPBridgedPlugin` protocol:
   ```swift
   public class SharedInboxPlugin: CAPPlugin, CAPBridgedPlugin { ... }
   ```
3. **No `.m` file** - Capacitor 7 doesn't use Objective-C bridge files for local plugins
4. **Main.storyboard** must use `MyViewController` as the custom class
5. **App Groups** must be enabled on both App + ShareExtension targets

## Troubleshooting Intermittent Failures

### If sharing seems to do nothing:
1. Check Console.app (filter for `[ShareExtension]`) — you should see:
   - `✅ Extension loaded successfully`
   - `📤 didSelectPost called`
   - `✅ Got URL: ...` or `✅ Got text: ...`
   - `✅ Successfully saved and verified. Total items: X`
2. If you see `❌ CRITICAL: Could not access App Group`, the App Groups entitlement is misconfigured.
3. If you see `⚠️ Completing without any saved content`, the share content wasn't in a supported format.

### If items don't appear in the app:
1. Make sure the app came to foreground (visibility change triggers import)
2. Check the browser console for `[Inbox]` logs
3. Try the "Paste to Inbox" feature as a workaround

## Notes
- For prod builds remove the dev server URL from `capacitor.config.ts`/`capacitor.config.prod.ts` before submitting.
- No need to pod install every time; `npx cap copy ios` is enough for config/web changes during dev.

## Verification Log

### December 14, 2025 - Reliability Fix
**Status: ✅ Fixed Intermittent Failures**

Rewrote `ShareViewController.swift` with:
- `DispatchGroup` for proper async completion handling
- `CFPreferencesAppSynchronize` instead of deprecated `.synchronize()`
- Duplicate detection to prevent saving the same content twice
- Comprehensive NSLog debugging for troubleshooting
- Added "Paste to Inbox" feature as a guaranteed-working alternative

### January 16, 2026 - Capacitor 7 Plugin Registration Fix
**Status: ✅ Fixed UNIMPLEMENTED Error**

Root cause: Capacitor 7 doesn't auto-discover local Swift plugins. The fix:
- Removed obsolete `SharedInboxPlugin.m` (Capacitor 7 doesn't use Objective-C bridge files)
- Updated `SharedInboxPlugin.swift` to use `CAPBridgedPlugin` protocol (same as official plugins)
- Added manual registration in `MyViewController.capacitorDidLoad()`: `bridge?.registerPluginInstance(SharedInboxPlugin())`
- Verified storyboard uses `MyViewController` as custom class
