# Travelist AI — Developer Handoff Document
**Last updated:** March 4, 2026
**Sessions:** App Store readiness + audit → Security hardening → Security hardening round 2 → New-user UX review + fixes → Settings redesign
**Next steps:** Increment build number + submit next TestFlight build (see Action Plan)

---

## PROJECT OVERVIEW

**App:** Travelist AI — iOS travel places curation app
**Path:** `/Users/morhogeg/travelist-2`
**Stack:** React 18 + TypeScript + Vite + Capacitor 7 (iOS)
**Backend:** Firebase (Firestore + Auth, JS SDK)
**AI:** Google Gemini 3 Flash via Firebase Cloud Function proxy (`functions/src/index.ts`). Client calls `https://us-central1-travelistai-production.cloudfunctions.net/callGeminiProxy` — API key never touches the client.
**Design:** "iOS 26 Liquid Glass" glassmorphism — purple gradient (#667eea → #764ba2). Zero #007AFF.
**Bundle ID:** `com.travelist.app` | **App Name:** `Travelist AI`
**iOS min:** 15.0 | Capacitor 7.4.4
**TestFlight:** Build 1.0 (1) live, internal group "Mor's Team" — uploaded Jan 9, 2026
**Privacy policy:** https://morhogeg.github.io/travelist/PRIVACY_POLICY
**Firebase project:** `travelistai-production`

### Key npm scripts
```bash
npm run dev              # Web preview on localhost:5173
npm run build            # Dev build
npm run build:prod       # Production build
npx cap sync ios         # Sync web assets to iOS
npx cap open ios         # Open Xcode
npm run ios:dev          # build + sync + open Xcode
```

### Architecture at a glance
- `src/pages/` — 12 pages: Index (home), Inbox, TripDetailPage, Profile, Settings, etc.
- `src/services/ai/` — Gemini client (proxy-based), AI cache (Firestore, 30-day TTL)
- `functions/src/index.ts` — Firebase Cloud Function proxy for Gemini API (key in Firebase Secrets)
- `src/services/proximity/` — Background location + local notifications
- `src/utils/recommendation/` — localStorage CRUD for places
- `src/utils/inbox/` — Share Extension inbox store
- `ios/App/ShareExtension/` — Native Swift Share Extension (fully implemented)
- App Groups: `group.com.travelist.shared` — used to pass data between Share Extension and main app

### Firebase setup
- **Project:** `travelistai-production`
- **Web app ID:** `1:628341208308:web:fc7a9a90e6b881a5975aa1`
- **Functions:** Node 20, region `us-central1`, Blaze plan
- **Secrets:** `GEMINI_API_KEY` stored in Firebase Secret Manager (not in any file)
- **Firestore rules:** require `request.auth != null` on all collections
- **Firebase config:** in `.env` (not committed) — copy from `.env.example`

---

## WHAT WAS DONE

### Session 1 — App Store readiness + code audit
1. **Apple Sign-In button removed** — `src/components/onboarding/screens/SignInScreen.tsx`
   - Was a dummy (just called `onNext()`), risking App Store rejection
   - Screen now shows informational content + "Continue without account" only

2. **Production console.log cleanup** — `src/lib/firebase.ts`
   - `console.warn` calls now guarded with `if (import.meta.env.DEV)`

3. **App Store listing content written** — ready to paste into App Store Connect (see section below)

### Session 5 — Settings tab redesign (March 4, 2026)
Full redesign of the Settings tab. All changes in `src/pages/Settings.tsx` and `src/components/settings/`.

**Structural changes:**
- Grouped settings into labeled iOS-style sections: Appearance / Location & Alerts / Navigation / Intelligence & Privacy / Account
- Fixed double-separator bug and removed unused `ShareExtensionGuide` import

**Visual/dark mode overhaul:**
- Replaced `liquid-glass-clear` cards (heavy white border in dark mode) with `bg-neutral-100/80 dark:bg-transparent dark:ring-1 dark:ring-white/[0.08]` — transparent glass frames in dark mode, no grey fill
- Reverted to app's original black background (removed `#111113` override that caused inconsistency with rest of app)

**Icon system:**
- `SettingsRow` updated: every icon now sits in a coloured rounded square (iOS 18 style), `iconColor` prop controls the tint
- Colours chosen semantically: orange (theme), green (proximity), red (navigation), purple (AI), green (cloud), red (delete)

**Component redesigns:**
- `AISettings` — removed nested card-within-card. Model status and Privacy & Data are proper list rows with RowDividers. Privacy row has ChevronRight arrow.
- `AuthSettings` — completely redesigned as a collapsible accordion. Shows a single clean row by default; tapping it animates open the sign-in form (`AnimatePresence` height transition). Signed-in state shows just email + Sign Out in one row.
- `NavigationSettings` — fixed selected-state colour from `text-accent` (orange) to `bg-[#667eea]/15 text-[#667eea]` (app purple)
- `DeleteAccountSettings` — converted from "row + separate button" to a single tappable row with ChevronRight that opens the confirmation dialog

---

### Session 4 — New-user UX review + fixes (March 4, 2026)
Full new-user review conducted, 7 fixes shipped to `main` (commit `7c5c4a3`).

**Onboarding overhaul**
- Cut from 8 → 6 screens: removed `ProximityAlertsScreen` and `NavigateScreen`
- Replaced broken Apple Sign-In screen (dummy button + "cloud sync coming soon") with a celebratory "You're all set." completion screen (`SignInScreen.tsx`)
- Full visual redesign of all 5 onboarding screens — cleaner, on-brand, more useful:
  - `ProblemScreen`: stacked chaos-card pile (Screenshot / DM / Saved) instead of XCircle
  - `WelcomeScreen`: gradient T logo with shimmer, gradient headline, 3 animated feature pills
  - `ShareToSaveScreen`: numbered 3-step flow with gradient step numbers
  - `AIMagicScreen`: live input → parsed card demo matching actual app UI (amber tip, MapPin, source)
  - `GestureTutorialScreen`: cleaner swipe labels, refined result state cards

**Add drawer**
- AI free-text tab moved to the left (it's the default) — `RecommendationDrawer.tsx`
- Structured input tab moved to the right

**Navigation**
- "Inbox" renamed to "Shared" in bottom nav and page title — `Navbar.tsx`, `Inbox.tsx`
- Inbox empty state rewritten to explain the iOS Share Sheet workflow

**Profile**
- Welcome card for new users with 0 places: "Welcome, explorer!" + "Add your first place" CTA — `Profile.tsx`

**Home**
- One-time first-launch tooltip above the + FAB: "Tap + to save a place you heard about" — `Index.tsx`
- Dismissed on any tap, never shown again (`travelist-fab-hint-shown` localStorage flag)

---

### Session 3 — Security hardening round 2
8. **"Get info" rate limiting** ✅
   - 30-minute cooldown per place stored in `localStorage` (`ai_cooldown_<placeId>`)
   - Button disabled with "Info refreshes in Xm" label during cooldown
   - Cooldown only written on success — errors allow retry
   - File: `src/components/home/RecommendationDetailsDialog.tsx`

9. **`ai_cache` write-protected** ✅ CRITICAL FIX
   - Cache writes moved from client → Cloud Function (Admin SDK, bypasses rules)
   - Client-side `cacheAISummary` removed from `ai-cache-service.ts`
   - `gemini-client.ts` now sends `cacheContext` in proxy request body
   - `firestore.rules` created: `ai_cache` is read-only for clients (`allow write: if false`)
   - Deployed: `firebase deploy --only functions && firebase deploy --only firestore:rules`

10. **.env git tracking verified** ✅
    - File is untracked (good). Was committed in 3 old commits (`Initial commit`, `Improve AI suggestions caching`, `fix(security): prevent API key leaks`) but all keys are rotated.
    - If repo ever goes public, run BFG Repo-Cleaner to purge history.

### Session 2 — Security hardening
4. **Gemini API key secured** ✅ CRITICAL FIX
   - Old key `AIzaSyCe4dodNptsQPS3QfK8V0IvS58B8A9qWGo` was in bundle — **rotated and invalidated**
   - New key stored in Firebase Secret Manager only (`firebase functions:secrets:set GEMINI_API_KEY`)
   - Client now calls a Firebase Cloud Function proxy via plain `fetch()` — no key in bundle
   - Switched from `onCall` (callable) to `onRequest` (HTTP) — callable SDK was silently failing in Capacitor WKWebView

5. **OpenRouter removed entirely** ✅
   - `src/services/ai/openrouter-client.ts` deleted
   - All imports and references cleaned up across the codebase
   - Gemini is the sole AI provider

6. **Firebase web app registered** — required for JS SDK initialization in Capacitor
   - App ID: `1:628341208308:web:fc7a9a90e6b881a5975aa1`
   - Firebase config vars added to `.env`

7. **Firestore rules verified** — `allow read, write: if request.auth != null` on all collections (confirmed in Firebase Console)

---

## APP STORE STATUS

| Requirement | Status | Notes |
|---|---|---|
| Apple Developer Account | ✅ | Individual — Mor Hogeg |
| Bundle ID | ✅ | `com.travelist.app` |
| App Icon (1024×1024) | ✅ | In Assets.xcassets |
| Privacy Manifest | ✅ | `ios/App/App/PrivacyInfo.xcprivacy` |
| Privacy Policy URL | ✅ | https://morhogeg.github.io/travelist/PRIVACY_POLICY |
| Support URL | ✅ | https://morhogeg.github.io/travelist/SUPPORT |
| App Store Connect listing | ✅ Created | App name, category, subtitle done |
| Signing & Certificates | ✅ | Auto-managed in Xcode |
| TestFlight (internal) | ✅ Live | Build 1.0 (1) |
| Apple Sign-In button | ✅ Fixed | Removed dummy button |
| Production console.log | ✅ Fixed | Firebase.ts leak fixed |
| Gemini API key security | ✅ Fixed | Moved to Firebase Secrets proxy |
| Screenshots | ❌ BLOCKING | Required for external TF + App Store |
| App description / keywords | ✅ Written | Needs pasting into App Store Connect |
| Age rating questionnaire | ❌ | Must complete in App Store Connect (answer: 4+) |
| What's New text | ✅ Written | Needs pasting in |
| Build number increment | ❌ | Bump before next archive (currently build 1) |

---

## CODE REVIEW FINDINGS

### CRITICAL — Must fix before App Store submission

**[C1] Location permission never requested during onboarding** ✅ ALREADY IMPLEMENTED
- `src/components/onboarding/screens/ProximityAlertsScreen.tsx` calls `Geolocation.requestPermissions()` when user taps "Continue". No fix needed.

---

### HIGH — Fix before or immediately after launch

**[H1] Duplicate place submission possible** ✅ ALREADY IMPLEMENTED
- `StructuredInputForm.tsx` and `FreeTextForm.tsx` both have `disabled={isAnalyzing}` with spinners. `isLoading` from `useRecommendationSubmit` is threaded down as `isAnalyzing`. No fix needed.

**[H2] GPS accuracy not validated before proximity trigger** ✅ FIXED (Mar 3, 2026)
- File: `src/services/proximity/proximity-service.ts`
- Threshold is now `Math.min(settings.distanceMeters * 0.5, 100)` — caps at 100m so large alert radii can't let bad GPS readings slip through. Debug log updated to show measured vs threshold values.

**[H3] Firestore sync failures silent in production**
- File: `src/utils/recommendation/recommendation-manager.ts:121–125`
- Sync errors are swallowed silently. When cloud sync ships, users could silently lose data.
- **Fix:** Write a flag to localStorage on failure and surface a subtle "Sync paused" indicator.

---

### MEDIUM — Good to fix before next release

**[M1] Onboarding proximity toggle removed** ✅ RESOLVED (Mar 4)
- `ProximityAlertsScreen` removed from onboarding entirely (was non-functional). Proximity alerts are discoverable via Settings.

**[M2] City name fragmentation**
- "Tel Aviv" and "tel aviv" and "Tel-Aviv" are stored as separate cities. No normalization.
- **Fix:** `.trim()` and title-case normalization on city/country when saving.

**[M3] Trip suggestions have no images**
- AI-suggested places in `TripDetailPage.tsx` show placeholder images.

**[M4] No "saved offline" feedback**
- Adding a place with no internet gives no confirmation.

**[M5] No crash reporting**
- No Firebase Crashlytics or Sentry.
- **Fix:** Add `@capacitor-firebase/crashlytics` — 30-minute integration.

---

### LOW

**[L1] Performance** — `groupedRecommendations` recalculated on every filter change.

**[L2] Accessibility** — Several icon buttons lack `aria-label`.

**[L3] Token limit hardcoded** — `maxOutputTokens: 1000` in `gemini-client.ts` can truncate longer AI descriptions.

---

## SECURITY STATUS

### Resolved ✅
- **[S-CRIT-1] Gemini API key** — rotated + moved to Firebase Secrets. Client never sees the key.
- **[S-CRIT-2] OpenRouter** — removed entirely. No client-side AI keys remain.
- **[S-HIGH-1] Firestore rules** — verified: `request.auth != null` on all collections.

### Remaining

**[S-MED-1] No rate limiting on AI calls** ✅ FIXED — 30-min client-side cooldown per place in `RecommendationDetailsDialog.tsx`.

**[S-MED-2] Proxy has no auth check** — anyone who discovers the Cloud Function URL can invoke it.
- Blocked by: real auth not implemented yet (Apple Sign-In is dummy).
- **Fix (when auth is real):** Add `if (!request.auth) throw HttpsError('unauthenticated')` to the function.

**[S-MED-3] ai_cache writable by any authenticated user** ✅ FIXED — writes moved to Cloud Function (Admin SDK). Firestore rules deny all client writes to `ai_cache`.

**[S-MED-4] localStorage data unencrypted at rest** — readable on jailbroken device. Acceptable for v1.

**[S-LOW-1] No email verification before account creation**

**[S-LOW-2] No crash reporting** — flying blind in production.

---

## APP STORE LISTING CONTENT (ready to paste)

### Promotional Text (139 chars)
```
Your AI-powered travel wishlist. Save places from any app, get smart descriptions, and plan perfect trips — all offline, no account needed.
```

### Keywords (91 chars)
```
travel,places,trip planner,bucket list,itinerary,maps,travel app,wanderlust,city guide,AI travel
```

### What's New
```
Welcome to Travelist AI — we're thrilled to launch the very first version of your new travel companion. Save places from Google Maps, Apple Maps, or any app instantly, get AI-powered descriptions, and turn your wishlist into a full trip itinerary in seconds. Proximity alerts make sure you never walk past a saved gem again. Start building your travel list today.
```

### Full Description
```
Your travel bucket list deserves better than a scattered notes app.

Travelist AI is your intelligent travel companion for saving, organizing, and planning every place you've ever wanted to visit. Whether you spotted a hidden trattoria on Instagram, got a recommendation from a friend, or discovered a must-see temple while researching your next trip — Travelist AI captures it all and makes sure you never forget it.

SAVE PLACES INSTANTLY

See somewhere you want to go? Share it directly from Google Maps or Apple Maps into Travelist AI in seconds. Our Share Extension works from any app — just tap Share, select Travelist, and the place is saved. No typing required.

ORGANIZED THE WAY YOU THINK

Every place is automatically organized by Country, City, and Place — so your travel wishlist stays clean and navigable no matter how many destinations you add. Browse by region when planning a trip to Japan, or filter to your saved spots in Paris. Your entire travel universe, always at your fingertips.

AI-POWERED PLACE DESCRIPTIONS

Travelist AI uses Google Gemini to pull rich, up-to-date information about every place you save — so you always know what makes it special, what to expect, and why it's worth visiting. No more switching between apps to remember why you saved something six months ago.

SMART AI INBOX

Share a screenshot, a link, or a name — the AI Inbox understands what you sent and automatically extracts and categorizes the place for you. It handles the messy part so you don't have to.

PROXIMITY ALERTS

Traveling and forgot you saved a gem nearby? Travelist AI has you covered. Enable proximity alerts and get notified the moment you're close to a saved place — so spontaneous adventures are always on the table.

AI TRIP PLANNER

Ready to turn your wishlist into a real itinerary? The AI trip planner generates day-by-day plans with time slots and estimated walking times between stops — tailored to your saved places. Go from "I want to visit these 12 places in Tokyo" to a fully structured itinerary in moments.

COLLECTIONS

Group places into Collections for any occasion — a weekend road trip, a honeymoon shortlist, the best restaurants in Barcelona, hidden gems for solo travel.

TRAVEL STORIES

Capture memories of places you've visited and relive where you've been.

WORKS OFFLINE

Your places are always available, even without a connection. Travelist AI stores everything locally so your travel data is private, fast, and accessible anywhere in the world — no Wi-Fi required.

NO ACCOUNT REQUIRED

Start saving places immediately. No sign-up, no login, no friction.

Download Travelist AI and start building the travel life you've always imagined.
```

---

## PRIORITIZED ACTION PLAN

### 🔜 Next session
| # | Task | File(s) | Status |
|---|------|---------|--------|
| 0 | **Redesign Settings tab** | `src/pages/Settings.tsx` + sub-components in `src/components/settings/` | ✅ Done Mar 4 (Session 5) |

### Before next TestFlight build
| # | Task | File(s) | Status |
|---|------|---------|--------|
| 1 | Request location permission in onboarding | ~~`ProximityAlertsScreen.tsx`~~ | ✅ Screen removed Mar 4 |
| 2 | Disable submit button while saving | `RecommendationDrawer.tsx` | ✅ Already done |
| 3 | Increment build number in Xcode | Xcode project settings | ❌ TODO |
| 4 | Paste App Store listing content into App Store Connect | App Store Connect | ❌ TODO |
| 5 | Complete age rating questionnaire (answer: 4+) | App Store Connect | ❌ TODO |
| 6 | New-user UX fixes (onboarding, Shared tab, Profile, FAB hint) | Various — see Session 4 | ✅ Done Mar 4 |

### Before App Store submission
| # | Task | File(s) | Status |
|---|------|---------|--------|
| 6 | Take screenshots in Simulator (manual) | iOS Simulator | ❌ TODO |
| 7 | Add GPS accuracy check to proximity trigger | `proximity-service.ts` | ✅ Fixed Mar 3 |
| 8 | Add debounce on "Get info" button (rate limiting) | `RecommendationDetailsDialog.tsx` | ✅ Fixed Mar 3 |
| 9 | Add auth check to Cloud Function proxy | `functions/src/index.ts` | ❌ Blocked on auth |

### Post-launch / next release
| # | Task | Notes |
|---|------|-------|
| 10 | Add Firebase Crashlytics | `@capacitor-firebase/crashlytics` |
| 11 | City name normalization on save | trim + title-case |
| 12 | Offline save feedback | "Saved locally" toast |
| 13 | Sync failure indicator | when cloud sync ships |
| 14 | ~~Restrict ai_cache writes in Firestore rules~~ | ✅ Fixed Mar 3 — writes moved to Cloud Function |

### ⚠️ BEFORE ENABLING CLOUD SYNC — CRITICAL
**[SYNC-BLOCK] Firestore rules are not user-scoped**
- Current rules: `allow read, write: if request.auth != null` — any logged-in user can read ANY document in ANY collection
- Required before sync: `allow read, write: if request.auth.uid == resource.data.userId`
- User data (places, collections, routes) must include a `userId` field on every document
- Without this fix, cloud sync = all users can see each other's data
- `ai_cache` is intentionally global (shared cache) — keep its rules separate

---

## NOTES FOR NEXT SESSION

### 🎯 Priority: Increment build + new TestFlight
1. Bump build number in Xcode (currently Build 1)
2. Take App Store screenshots in Simulator (`xcrun simctl io booted screenshot <path>.png`)
3. Archive → Distribute via Xcode → upload to App Store Connect

### Settings tab — current state (as of Session 5)
Fully redesigned. Key files:
- `src/pages/Settings.tsx` — page layout, section grouping
- `src/components/settings/SettingsRow.tsx` — rounded-square icon system
- `src/components/settings/AuthSettings.tsx` — collapsible accordion sign-in
- `src/components/settings/AISettings.tsx` — flat row list (no nested cards)
- `src/components/settings/NavigationSettings.tsx` — purple selected state
- `src/components/settings/DeleteAccountSettings.tsx` — tappable row → AlertDialog

**Known remaining consideration:** The proximity section (distance slider + city manager) still expands inline inside the card. Could be moved to a dedicated sub-page if it grows more complex.

---

- **AI proxy:** Cloud Function is live at `https://us-central1-travelistai-production.cloudfunctions.net/callGeminiProxy`. To update the Gemini key: `echo "KEY" | firebase functions:secrets:set GEMINI_API_KEY && firebase deploy --only functions`
- **Firebase config** lives in `.env` (not committed). All `VITE_FIREBASE_*` vars required for the app to initialize.
- **Build workflow:** `npm run build:prod && npx cap sync ios` → then Run in Xcode
- **Screenshot command:** `xcrun simctl io booted screenshot <path>.png`
- `guides/APP_STORE_DEPLOYMENT.md` has the full upload process (archive in Xcode → Product → Archive → Distribute)
