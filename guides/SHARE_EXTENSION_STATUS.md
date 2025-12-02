# Share Extension & Inbox Status (December 2025)

## What’s working
- Inbox feature exists in the app (page + navigation) and can be viewed when built with the current web bundle.
- Deep link share via `travelist://share?text=...` lands items in Inbox and creates cards.
- iOS Share Extension installs, shows in the share sheet, and saves shared text/URLs to the App Group (`group.com.travelist.shared`).
- Import from the App Group into the Inbox now works (toast appears, items show) when the app returns to foreground.
- Inbox list shows friendly titles/addresses for shared links; opening an item auto-parses and pre-fills the form, with link/open/delete actions aligned on the right.
- Inbox page uses the same centered gradient header style as Collections/Routes for consistent iOS UI.
- Saving from Inbox now maps the “Description or tip” into the card’s context, so tips show in the expanded view with the amber lightbulb (same as regular cards).
- Shared items are parsed in the background on import, so details are usually ready when you tap “Open.” Status labels now read “Ready to Save” and “Saved” for clarity.
- Inbox filter pills match the pill shape/color system used elsewhere (foreground text when inactive, gradient when active).
- Inbox has a dedicated filter drawer (same UI as home) for status + city/country + source (Google Maps/Instagram/Friend/TikTok inferred). Status pills at the top also filter.
- “Ready for Review” status pill is now a primary gradient button with a pencil icon; tapping it opens the item for approval (makes the review step obvious).
- Home screen remembers collapsed city state inside a country; when you collapse a country and reopen it, cities retain their collapsed state.
- Inbox review drawer simplified: header only shows “Open link” and title; confidence badge and host tag removed; re-run parse removed. Saving removes the item from Inbox. Drawer inputs/pills match add-recommendation styling (aligned sizes, category pills below country).
- Splash screen is explicitly hidden at app start (`SplashScreen.hide()`) to avoid timeout warnings.
- Inbox drawer edits a single place (first parsed place or placeholder) to avoid duplicate forms; category pills moved below country; consistent text sizing; inactive pills cleaned up in dark mode.
- Home cards now use the same liquid-glass border/padding treatment as Inbox cards (no side accent bar) while keeping the colored category icon and existing actions; tab bar gains extra bottom padding/rounding to avoid clipped corners on devices with curved screens.

## Why it broke before
- The native config (`ios/App/App/capacitor.config.json`) sometimes regenerated without `SharedInboxPlugin`, so the app reported `UNIMPLEMENTED` and never imported.
- App Groups capability must be enabled on both App + ShareExtension targets; otherwise `UserDefaults(suiteName:)` returns empty.
- Running `npx cap copy ios` without patching the generated config drops the `SharedInboxPlugin`. Use the provided script/command to keep it.

## Fix applied
- `capacitor.config.ts` and generated `ios/App/App/capacitor.config.json` include `SharedInboxPlugin` in `packageClassList`.
- `SharedInboxPlugin.swift/m` compiled only into the App target; ShareExtension target excludes it.
- App + ShareExtension targets have App Group `group.com.travelist.shared` enabled.

## How to use (dev / live reload)
1) Terminal A (repo root): `npm run dev -- --host` → note LAN URL (e.g., `http://192.168.0.108:5173`).
2) `capacitor.config.ts` server points to that URL with `cleartext: true` (already set).
3) Terminal B (repo root): `npx cap copy ios` (fast; no pod install) to push web assets + config.
4) In Xcode, run the **App** scheme. Simulator will load from the dev server and hot-reload on save.

## How to test sharing
1) In Safari (or any app using the iOS share sheet), tap Share → Travelist.
2) Return to the app; you should see a toast like “Imported shared items” and items in Inbox.
3) Open an item: it auto-parses and pre-fills name/city/country; actions (open link/open/delete) are on the right. Choose a category pill and tap “Save as Card” (closes the drawer and marks item imported). You can still re-run AI parse inside the drawer if needed.
4) Deep link also works: `xcrun simctl openurl booted "travelist://share?text=Test"`.

## If you see `UNIMPLEMENTED` again
- Run `npm run cap:copy:ios` (or `npx cap copy ios && node scripts/ensure-shared-inbox-plugin.js`) from the project root to regenerate `ios/App/App/capacitor.config.json` with `SharedInboxPlugin`, then rebuild/run in Xcode.
- Verify App Groups are still checked on both targets in Xcode.

## Notes
- For prod builds remove the dev server URL from `capacitor.config.ts`/`capacitor.config.prod.ts` before submitting.
- No need to pod install every time; `npx cap copy ios` is enough for config/web changes during dev.
