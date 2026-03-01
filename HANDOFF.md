# Travelist AI — Developer Handoff Document
**Generated:** March 1, 2026
**Session summary:** App Store readiness review + code audit
**Next steps:** See "Action Plan" section at the bottom

---

## PROJECT OVERVIEW

**App:** Travelist AI — iOS travel places curation app
**Path:** `/Users/morhogeg/travelist-2`
**Stack:** React 18 + TypeScript + Vite + Capacitor 7 (iOS)
**Backend:** Firebase (Firestore + Auth, JS SDK) + Supabase
**AI:** Google Gemini 3 Flash via raw `fetch()` in `src/services/ai/gemini-client.ts` (bypasses SDK for Capacitor compat). OpenRouter as fallback.
**Design:** "iOS 26 Liquid Glass" glassmorphism — purple gradient (#667eea → #764ba2). Zero #007AFF.
**Bundle ID:** `com.travelist.app` | **App Name:** `Travelist AI`
**iOS min:** 15.0 | Capacitor 7.4.4
**TestFlight:** Build 1.0 (1) live, internal group "Mor's Team" — uploaded Jan 9, 2026
**Privacy policy:** https://morhogeg.github.io/travelist/PRIVACY_POLICY

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
- `src/services/ai/` — Gemini client, OpenRouter client, AI cache (Firestore, 30-day TTL)
- `src/services/proximity/` — Background location + local notifications
- `src/utils/recommendation/` — localStorage CRUD for places
- `src/utils/inbox/` — Share Extension inbox store
- `ios/App/ShareExtension/` — Native Swift Share Extension (fully implemented)
- App Groups: `group.com.travelist.shared` — used to pass data between Share Extension and main app

---

## WHAT WAS DONE THIS SESSION

### ✅ Completed
1. **Apple Sign-In button removed** — `src/components/onboarding/screens/SignInScreen.tsx`
   - The button was a dummy (just called `onNext()`), risking App Store rejection for non-functional UI
   - Removed the `AppleLogo` SVG, `handleAppleSignIn` function, and the entire button
   - Screen now shows informational content + "Continue without account" only
   - "Cloud sync coming soon" badge remains

2. **Production console.log cleanup** — `src/lib/firebase.ts`
   - 3 `console.warn` calls in firebase.ts were leaking to production builds
   - Now guarded with `if (import.meta.env.DEV)`
   - All other console calls in the codebase were already properly guarded — no further changes needed

3. **App Store listing content written** — ready to paste into App Store Connect:
   - Full description (4000 chars) — see Section 4 below
   - Keywords: `travel,places,trip planner,bucket list,itinerary,maps,travel app,wanderlust,city guide,AI travel`
   - Promotional text (139 chars): "Your AI-powered travel wishlist. Save places from any app, get smart descriptions, and plan perfect trips — all offline, no account needed."
   - What's New text — see Section 4 below
   - Age Rating: **4+** (no social features, no purchases, no adult content)

4. **Screenshots deferred** — requires manual navigation in Simulator. Build and sync ran successfully. iPhone 17 Pro Max simulator was booted and app installed. To take screenshots: open Simulator, navigate each key screen, run `xcrun simctl io booted screenshot <filename>.png`

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
| Apple Sign-In button | ✅ Fixed | Removed dummy button this session |
| Production console.log | ✅ Fixed | Firebase.ts leak fixed this session |
| Screenshots | ❌ BLOCKING | Required for external TF + App Store |
| App description / keywords | ✅ Written | Needs pasting into App Store Connect |
| Age rating questionnaire | ❌ | Must complete in App Store Connect (answer: 4+) |
| What's New text | ✅ Written | Needs pasting in |
| Build number increment | ❌ | Bump before next archive (currently build 1) |

---

## CODE REVIEW FINDINGS

### CRITICAL — Must fix before App Store submission

**[C1] Location permission never requested during onboarding**
- File: `src/components/onboarding/OnboardingFlow.tsx`
- The proximity alerts onboarding screen shows the feature beautifully but never calls `requestPermissions()`. Users complete onboarding without being asked for location permission. Proximity alerts silently don't work. Apple reviewers will test this feature and find it broken.
- **Fix:** On the proximity alerts onboarding screen (or on first toggle in Settings), call `Geolocation.requestPermissions()` before showing the feature as enabled.

**[C2] OpenRouter API key exposed in client JS bundle**
- File: `src/services/ai/openrouter-client.ts`
- The OpenRouter key is a real auth token (not a public key). It is bundled into the production JS and extractable from the IPA file by anyone. If abused, your account gets billed or suspended.
- **Fix:** Proxy OpenRouter calls through a Supabase Edge Function. The client sends the prompt, the edge function holds the key and makes the request.

---

### HIGH — Fix before or immediately after launch

**[H1] Duplicate place submission possible**
- File: `src/components/recommendations/RecommendationDrawer.tsx`
- No loading state disables the submit button while `submitStructuredRecommendation()` is in flight. A double-tap or slow network creates duplicate entries.
- **Fix:** Set `disabled={isAnalyzing}` on the submit button.

**[H2] GPS accuracy not validated before proximity trigger**
- File: `src/services/proximity/proximity-service.ts`
- `calculateDistance()` runs without checking `position.coords.accuracy`. A device with 200m GPS error could trigger "you're nearby!" when the user is nowhere close. Erodes trust in the feature fast.
- **Fix:** Gate triggers on `coords.accuracy < (alertDistance * 0.5)` or similar threshold.

**[H3] Firestore sync failures silent in production**
- File: `src/utils/recommendation/recommendation-manager.ts:121–125`
- Sync errors are swallowed silently in production. Low risk now (sync is "coming soon"), but when cloud sync ships, users could silently lose data.
- **Fix:** When sync fails, write a flag to localStorage and surface a subtle "Sync paused" indicator in the UI.

---

### MEDIUM — Good to fix before next release

**[M1] Onboarding proximity toggle does nothing**
- The "enable proximity alerts" step in onboarding doesn't actually request permission or toggle anything. It's a dead UI state.

**[M2] City name fragmentation**
- "Tel Aviv" and "tel aviv" and "Tel-Aviv" are stored as separate cities. No normalization.
- **Fix:** `.trim()` and title-case normalization on city/country when saving.

**[M3] Trip suggestions have no images**
- AI-suggested places in `TripDetailPage.tsx` show placeholder images. Inconsistent vs. user-added places that get fetched images.

**[M4] No "saved offline" feedback**
- Adding a place with no internet gives no confirmation. Feels like the save failed.

**[M5] No crash reporting**
- No Firebase Crashlytics or Sentry. Flying blind in production.
- **Fix:** Add `@capacitor-firebase/crashlytics` — 30-minute integration.

---

### LOW

**[L1] Performance** — `groupedRecommendations` recalculated on every filter change. Low impact on modern devices but worth memoizing for older iPhones.

**[L2] Accessibility** — Several icon buttons lack `aria-label`. Low risk for App Store but worth addressing over time.

**[L3] Token limit hardcoded** — `maxOutputTokens: 1000` in `gemini-client.ts` can truncate longer AI descriptions.

---

## SECURITY FINDINGS (Dedicated Security Audit)

**Overall Risk: MEDIUM-HIGH** — strong foundations but one critical issue that must be fixed before launch.

### What's Working Well ✅
- **Firebase client config** — public by design, not a security issue
- **Firestore queries all filter by `user_id`** — user A cannot read user B's data through the app
- **No `dangerouslySetInnerHTML`** — AI response content is rendered as plain text, XSS-proof
- **HTTPS everywhere** — all fetch() calls use HTTPS
- **Share Extension validates input** — correct parsing of URLs/text, no code execution
- **Entitlements minimal** — only App Group, no over-permissioning
- **PrivacyInfo.xcprivacy is complete** — Apple's privacy requirements met
- **AI data disclosure present** — `AISettings.tsx` clearly tells users what is shared with Google
- **Dependencies are current** — no known high-severity CVEs found

---

### CRITICAL — Fix Before Launch

**[S-CRIT-1] Gemini API key exposed in .env AND in the built JS bundle**
- The actual key `AIzaSyCe4dodNptsQPS3QfK8V0IvS58B8A9qWGo` was found in the `.env` file. It is compiled into the production iOS app bundle and can be extracted from the IPA by anyone.
- The key is also passed as a URL query param (`?key=...`), which means it appears in system logs, proxy logs, and network monitoring tools.
- **Impact:** Anyone who extracts this key can make unlimited Gemini API calls billed to your account.
- **Action (immediate):** Rotate this key right now in Google Cloud Console. Then proxy all AI calls through a backend.

**[S-CRIT-2] OpenRouter API key also in client bundle (if configured)**
- `src/services/ai/openrouter-client.ts` reads `VITE_OPENROUTER_API_KEY`. If set, same problem — auth token exposed in bundle.
- **Action:** Rotate and move to backend proxy.

---

### HIGH

**[S-HIGH-1] No Firestore Security Rules file in repo**
- The app correctly filters all queries by `user_id` client-side, but there is no `firestore.rules` file. This means server-side enforcement is unknown.
- If the Firestore rules say `allow read, write: if true;`, any authenticated user can read/write any other user's data by hitting the Firestore REST API directly (bypassing the app).
- **Action:** Check Firebase Console → Firestore → Rules. Must have `request.auth.uid == resource.data.user_id` rule in place.

---

### MEDIUM

**[S-MED-1] No rate limiting on AI calls**
- A user can hammer the "get AI description" button repeatedly with no throttle. Exhausts your API quota and runs up costs.
- **Fix:** Add `debounce`/throttle on the button, or enforce per-user quotas in a backend proxy.

**[S-MED-2] localStorage data is unencrypted at rest**
- User's saved places are stored in plain text localStorage (NSUserDefaults on iOS). On a jailbroken or physically compromised device, this data is readable.
- **Risk level for a travel app:** Low-medium. Place names/cities are not high-sensitivity PII. Acceptable for v1.

**[S-MED-3] Prompt injection via Share Extension input**
- User-shared text is concatenated directly into AI prompts. Gemini is robust against injection and output is schema-validated, so practical risk is low.
- **Fix:** Low priority given the use case. No data exfiltration risk since Gemini has no access to stored data.

**[S-MED-4] GDPR compliance unknown**
- No GDPR consent flow, no explicit data processing agreement with Firebase, no "right to be forgotten" confirmation. Low risk if not targeting EU as primary market.

---

### LOW

**[S-LOW-1] No email verification before account creation**
- Users can create accounts with mistyped emails. Data is still protected by `user_id`, so no cross-user risk.

**[S-LOW-2] Dev server HTTP mode (`cleartext: true`)**
- Only active when `USE_DEV_SERVER=true`. Not a production concern, but must never be shipped in a release build.

**[S-LOW-3] No crash reporting**
- No Sentry or Firebase Crashlytics. Flying blind on production errors.

---

### Security Action Plan (Priority Order)

| # | Action | When | Effort |
|---|--------|------|--------|
| 1 | **Rotate Gemini API key** in Google Cloud Console | TODAY | 5 min |
| 2 | **Verify Firestore Rules** in Firebase Console — confirm user_id filtering | TODAY | 10 min |
| 3 | **Set Gemini API quota limit** in Google Cloud Console to cap max spend | This week | 10 min |
| 4 | **Rotate OpenRouter key** if configured | This week | 5 min |
| 5 | **Proxy AI calls through Supabase Edge Function** | Before launch | 2–4 hrs |
| 6 | **Add debounce** on AI description button | Before launch | 30 min |
| 7 | Add Firebase Crashlytics | Post-launch | 1 hr |
| 8 | Add email verification | Post-launch | 1 hr |

---

## APP STORE LISTING CONTENT (ready to paste)

### Promotional Text (updates without resubmission — 139 chars)
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

### Before next TestFlight build
| # | Task | File(s) | Effort |
|---|------|---------|--------|
| 1 | Request location permission in onboarding | `OnboardingFlow.tsx` | 30 min |
| 2 | Disable submit button while saving | `RecommendationDrawer.tsx` | 10 min |
| 3 | Verify Firestore Rules in Firebase Console | Firebase Console | 15 min |
| 4 | Increment build number in Xcode | Xcode project settings | 2 min |
| 5 | Paste App Store listing content into App Store Connect | App Store Connect | 20 min |
| 6 | Complete age rating questionnaire (answer: 4+) | App Store Connect | 5 min |

### Before App Store submission
| # | Task | File(s) | Effort |
|---|------|---------|--------|
| 7 | Take screenshots in Simulator (manual) | iOS Simulator | 30 min |
| 8 | Add GPS accuracy check to proximity trigger | `proximity-service.ts` | 20 min |
| 9 | Set Gemini API key quota limit in Google Cloud Console | Google Cloud Console | 10 min |
| 10 | Rotate OpenRouter key + move to backend (or disable if not critical) | `openrouter-client.ts` | 1–2 hrs |

### Post-launch / next release
| # | Task | Notes |
|---|------|-------|
| 11 | Add Firebase Crashlytics | `@capacitor-firebase/crashlytics` |
| 12 | City name normalization on save | trim + title-case |
| 13 | Offline save feedback | "Saved locally" toast |
| 14 | Sync failure indicator | when cloud sync ships |

---

## NOTES FOR NEXT SESSION

- The simulator (iPhone 17 Pro Max, UDID: `68FC92C8-9CAF-4169-BE14-0BA54276FAC1`) was booted and had the app installed during this session. May still be running.
- Screenshot command: `xcrun simctl io booted screenshot <path>.png`
- To rebuild and see changes in simulator: `npm run build && npx cap sync ios`, then re-run `xcodebuild` and reinstall, OR use the Xcode simulator directly after `npx cap open ios`
- The live simulator workflow: edit code → `npm run build && npx cap sync ios` → changes reflect in running simulator (Capacitor hot-reload)
- `guides/APP_STORE_DEPLOYMENT.md` has the full upload process (archive in Xcode → Product → Archive → Distribute)
