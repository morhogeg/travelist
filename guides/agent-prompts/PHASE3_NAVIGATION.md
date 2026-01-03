# Agent Prompt: Phase 3 — Navigation Enhancements

**Copy this entire file into a new Claude conversation to start this agent.**

---

## Your Mission

You are implementing **Phase 3: Navigation Enhancements** for the Travelist app. Your goal is to reduce cognitive load and improve wayfinding through breadcrumbs, a unified "Add to..." flow, and visited progress badges.

## Project Context

- **App:** Travelist - iOS travel recommendations app
- **Stack:** React + TypeScript + Vite + Capacitor (iOS)
- **Design System:** iOS 26 Liquid Glass with purple gradient theme (#667eea → #764ba2)
- **Location:** `/Users/morhogeg/travelist-2`

Read these files first for full context:
- `guides/CONTEXT.md` — Quick reference and conventions
- `guides/UI_UX_PATTERNS.md` — Design patterns and component styles
- `src/components/collections/CollectionPickerDrawer.tsx` — Current collection picker
- `src/components/routes/RoutePickerDrawer.tsx` — Current route picker

## Task 1: Breadcrumb Navigation

### Create: `src/components/ui/Breadcrumb.tsx`
- Shows navigation path: Home > Country > City
- Each segment is tappable (navigates back)
- Chevron separators between segments
- Compact design, truncates long names
- Props: `items: Array<{ label: string, path: string }>`

### Integrate breadcrumbs in:
- `src/pages/place-detail/` — Show: Home > {Country} > {City}
- `src/pages/CountryView.tsx` — Show: Home > {Country}
- Position: Below header, above content

## Task 2: Unified "Add To..." Flow

### Create: `src/components/common/AddToDrawer.tsx`
Combines Collections and Routes into one drawer:
- Tab interface: "Collections" | "Routes"
- Each tab shows existing items with toggle to add/remove
- "Create New" button in each tab
- Single drawer, cleaner UX

### Refactor these files to use AddToDrawer:
- `src/components/home/category/recommendation-item/RecommendationItem.tsx`
  - Replace separate collection/route drawers with unified AddToDrawer
- `src/components/recommendations/RecommendationDetail.tsx`
  - Replace "Add to Collection" and "Add to Route" with single "Add to..." button

### Deprecate (but don't delete yet):
- `src/components/collections/CollectionPickerDrawer.tsx`
- `src/components/routes/RoutePickerDrawer.tsx`

## Task 3: Visited Progress Badges

### Modify: `src/components/home/category/CountryHeader.tsx`
- Add visited count/ratio: "3/8 visited" or progress ring
- Green checkmark icon if ALL places visited
- Position: Right side of header, before chevron
- Use success color (#34C759) for completed state

### Modify: `src/components/home/category/CityHeader.tsx`
- Same pattern as country headers
- Smaller badge to fit city header size

### Helper function needed:
Create utility to calculate visited stats per country/city from recommendations data.

## Design Requirements

- Breadcrumbs: Muted text color, purple on hover, small chevrons
- Tabs: Use existing tab pattern or create minimal pill-style tabs
- Progress badges: Subtle, don't compete with main content
- All components support light and dark modes
- Match existing Liquid Glass drawer style

## Verification

After implementation:
1. Navigate Home → Country → City → Place and verify breadcrumbs
2. Tap each breadcrumb segment to verify navigation
3. Test unified Add-to drawer from card swipe and detail view
4. Mark places as visited and verify badges update
5. Verify 100% visited shows green checkmark

## Deliverable

When complete, create a progress report at:
`/Users/morhogeg/.gemini/antigravity/brain/2c3a33e8-94c3-4c87-846d-ed35bc2d1811/phase3_navigation_report.md`

Include:
- What was implemented
- Files created/modified
- Screenshots or recordings if possible
- Any issues encountered
- Suggestions for follow-up work
