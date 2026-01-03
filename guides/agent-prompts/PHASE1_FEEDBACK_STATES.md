# Agent Prompt: Phase 1 — Feedback States

**Copy this entire file into a new Claude conversation to start this agent.**

---

## Your Mission

You are implementing **Phase 1: Feedback States** for the Travelist app. Your goal is to make the app feel more responsive and welcoming by adding skeleton loaders, empty states, and pull-to-refresh.

## Project Context

- **App:** Travelist - iOS travel recommendations app
- **Stack:** React + TypeScript + Vite + Capacitor (iOS)
- **Design System:** iOS 26 Liquid Glass with purple gradient theme (#667eea → #764ba2)
- **Location:** `/Users/morhogeg/travelist-2`

Read these files first for full context:
- `guides/CONTEXT.md` — Quick reference and conventions
- `guides/UI_UX_PATTERNS.md` — Design patterns and component styles
- `src/index.css` — Design tokens and Liquid Glass materials

## Task 1: Skeleton Loaders

### Create: `src/components/ui/SkeletonCard.tsx`
- Shimmer animation matching recommendation card dimensions
- Use Liquid Glass styling with subtle pulse animation
- Props: `count?: number` for rendering multiple skeletons
- Match the 4px left border style from real cards

### Modify: `src/components/home/category/CountryGroupList.tsx`
- Show 4-6 skeleton cards while data is loading
- Add fade transition from skeletons to real content
- Use existing loading state or add one if needed

## Task 2: Empty States

### Create: `src/components/ui/EmptyState.tsx`
Reusable component with:
- Large icon (use Lucide icons)
- Title text
- Description text  
- CTA button with purple gradient
- Variants prop: `'no-places' | 'no-collections' | 'no-routes' | 'no-results'`

### Integrate empty states in:
- `src/pages/Index.tsx` — First-time user with no saved places
- `src/pages/CollectionsTab.tsx` — No collections created
- `src/pages/RoutesTab.tsx` — No routes created

## Task 3: Pull-to-Refresh

### Create: `src/hooks/usePullToRefresh.ts`
- Custom hook for pull-to-refresh gesture detection
- Use Capacitor's native pull-to-refresh on iOS if available
- Trigger haptic feedback on release
- Return `{ isRefreshing, pullProgress }` for UI feedback

### Modify: `src/pages/Index.tsx`
- Wrap main content with pull-to-refresh container
- Show refresh indicator during pull
- Re-fetch recommendations on release

## Design Requirements

- Match existing Liquid Glass materials (`liquid-glass-clear`)
- Use purple gradient for CTAs: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- Maintain 44px minimum touch targets
- Support both light and dark modes
- No shadows on cards (`boxShadow: 'none'`)

## Verification

After implementation:
1. Run `npm run dev` and test in browser
2. Test skeleton → content transition
3. Test empty states for each variant
4. Test pull-to-refresh gesture
5. Verify dark mode appearance

## Deliverable

When complete, create a progress report at:
`/Users/morhogeg/.gemini/antigravity/brain/2c3a33e8-94c3-4c87-846d-ed35bc2d1811/phase1_feedback_states_report.md`

Include:
- What was implemented
- Files created/modified
- Screenshots or recordings if possible
- Any issues encountered
- Suggestions for follow-up work
