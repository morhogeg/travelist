# Project: Codebase Review & Onboarding Redesign

## Overview
I need a team of agents to perform a comprehensive review of the Travelist codebase and features, and then redesign/rewrite our onboarding flow. The goal is to ensure the onboarding accurately reflects our current feature set (including the new "Export to Maps" feature) and adheres to our "Liquid Glass" iOS-native design philosophy.

## Current State
- **Tech Stack**: Capacitor + React + Vite + Tailwind CSS + Framer Motion.
- **Design System**: "Liquid Glass" (glassmorphism, vibrant gradients, iOS-native patterns).
- **Key Features**: 
  - Save places with category-specific metadata.
  - Organize places into Collections and Routes.
  - **NEW**: Export routes/collections to Google Maps or Apple Maps (replacing native maps).
  - Share Extension for saving places from other apps.
  - Filter system for easy discovery.
- **Onboarding**: A 4-screen flow in `src/components/onboarding/`.

---

## PHASE 1: CODEBASE & FEATURE AUDIT (Agent 1)

Perform a deep dive into the codebase to understand the "Source of Truth" for our features and design.

### 1.1 Feature Inventory
Review the following to build a complete feature list:
- `src/pages/Index.tsx` (Home/Discovery)
- `src/pages/RouteDetail.tsx` (Routing)
- `src/pages/CollectionDetail.tsx` (Collections)
- `src/utils/maps/export-to-maps.ts` (The new Export feature)
- `src/components/recommendations/` (Place saving/details)

### 1.2 Design Pattern Review
Study these guides to ensure the redesign matches our aesthetic:
- `guides/UI_UX_PATTERNS.md` (The definitive design guide)
- `guides/IOS26_TRANSFORMATION.md` (Liquid Glass details)
- `guides/ONBOARDING.md` (Current onboarding strategy)

### 1.3 Feature Gap Analysis
Identify what's currently missing from the onboarding screens (e.g., the "Export to Maps" feature, the power of the filter system, the Share Extension).

---

## PHASE 2: ONBOARDING REDESIGN (Agent 2 + Agent 3)

### Agent 2: Content & Copywriting
Rewrite the onboarding copy to be more compelling and feature-complete:
- **Screen 1 (Welcome)**: Focus on the "Travel Brain" concept.
- **Screen 2 (Add & Organize)**: Highlight the ease of saving (Share Extension) and automated organization.
- **Screen 3 (Plan & Navigate)**: Introduce Routes/Collections and the **"Export to Maps"** feature as the bridge to the real world.
- **Screen 4 (Sign In)**: Refine the value prop for account creation (sync, offline, etc.).

### Agent 3: UI/UX Redesign
Update the visual components in `src/components/onboarding/screens/`:
- **WelcomeScreen.tsx**: Enhance the "Liquid Glass" aesthetic.
- **AddPlacesScreen.tsx**: Update icons or layout to reflect current categories.
- **OrganizeScreen.tsx**: Redesign to showcase both Collections and Routes effectively.
- **SignInScreen.tsx**: Polish the placeholder to look premium and "Apple-like".
- **Animations**: Ensure `framer-motion` transitions are smooth and follow iOS patterns (slide/fade).

---

## PHASE 3: IMPLEMENTATION & CLEANUP (Agent 4)

- **Code Updates**: Apply the changes to the onboarding components.
- **Asset Management**: If new icons or images are needed, identify or generate them.
- **Verification**: 
  - Ensure the onboarding flow still triggers correctly for new users.
  - Verify that "Skip" and "Complete" actions work.
  - Test the responsiveness on mobile-sized viewports.
- **Documentation**: Update `guides/ONBOARDING.md` to reflect the new flow.

---

## Success Criteria
1. Onboarding flow accurately describes the "Export to Maps" feature.
2. The UI feels premium, "Liquid Glass", and native to iOS.
3. The copy is concise, helpful, and aligns with the app's mission.
4. No regressions in the onboarding logic or localStorage persistence.
5. All guides are updated to match the new implementation.
