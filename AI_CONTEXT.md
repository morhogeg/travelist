# Travelist AI Project Context (Deep Dive)

Copy and paste this entire document into your AI chat (ChatGPT, Claude, Claude Code) for a comprehensive technical briefing.

---

## 🏗 ARCHITECTURE OVERVIEW
- **Core:** React 18 + TypeScript + Vite.
- **Mobile Foundation:** Capacitor 7. The app is designed for iOS.
- **Backend:** Supabase (Postgres, Auth, Realtime) + Firebase (using the Firebase JS SDK for some legacy features or specific integrations, mainly Auth/Firestore logic wrapped in `src/lib/firebase.ts`).
- **Native Bridge:** Uses Capacitor plugins for Geolocation, Haptics, Status Bar, Local Notifications, and Share extension.
- **Design System:** "iOS 26 Liquid Glass" – high-transparency glassmorphism with a primary Purple Gradient (#667eea → #764ba2).

## 🚀 DEVELOPMENT WORKFLOW
### Setup
1. `npm install`
2. `cp .env.example .env` (Requires `VITE_GEMINI_API_KEY` and Firebase Config)
3. `npm run dev` (Web preview on port 5173)

### iOS Specifics
- `npm run ios:dev`: Builds the project and opens Xcode.
- `npm run build:sync`: Performs a fresh build and syncs assets to the iOS project.
- `npx cap open ios`: Opens the `.xcworkspace` in Xcode.
- `watch-and-sync.sh`: (Utility) Watches `src/` and auto-syncs to the native iOS app.

### Testing Deep Links
- `npm run share:test`: Simulates a text share from another app to the Travelist inbox.

## 📁 COMPONENT HIERARCHY & FEATURES
- **Home (`src/pages/Index.tsx`):** Categorized view of saved places (Countries > Cities > Places).
- **Inbox (`src/pages/Inbox.tsx`):** Incoming shares from other apps. Uses AI to parse natural language into structured data.
- **Trips (`src/pages/TripDetailPage.tsx`):** AI-generated itineraries.
  - *Logic:* `src/types/trip.ts` defines the structure.
  - *Features:* Suggests time slots (morning/afternoon), calculates walking times, and theme-based days.
- **Proximity Alerts:** Background location monitoring to notify users when near a saved place.
  - *Service:* `src/services/proximity/`

## 🎨 DESIGN SYSTEM (CRITICAL)
- **Theme:** Zero standard blue (#007AFF) allowed. Everything uses Purple Gradient.
- **Glassmorphism:** 
  - Utilities: `.liquid-glass-clear`, `.liquid-glass-tinted`, `.liquid-glass-float`.
  - CSS Variables: defined in `src/index.css` (`--glass-clear`, `--glass-blur`).
- **Animations:** Custom spring physics and scale transitions defined in `tailwind.config.ts`.

## 🤖 AI IMPLEMENTATION
- **Provider:** Primary AI is **Google Gemini** (specifically `gemini-3-flash-preview`).
- **Implementation:** Uses a custom `callGemini` function in `src/services/ai/gemini-client.ts` that bypasses the Google GenAI SDK and uses the **Raw Fetch API** for maximum Capacitor/iOS compatibility.
- **Features:** Supports **Google Search Grounding** and **Thinking/Reasoning** capabilities.
- **Caching:** AI responses are cached in Firestore/Supabase to minimize API calls via `src/services/ai/ai-cache-service.ts`.

## 💾 DATA MODEL (Supabase/Firestore)
- **Places:** `name`, `city`, `country`, `category`, `visited`, `googlePlaceId`.
- **Trips:** `cityId`, `days[]`, `generatedAt`.
- **Sync:** Real-time sync ensures offline edits are pushed when online.

---
