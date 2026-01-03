# Agent Prompt: Phase 4 — Polish

**Copy this entire file into a new Claude conversation to start this agent.**

---

## Your Mission

You are implementing **Phase 4: Polish** for the Travelist app. Your goal is to add final refinements that elevate the premium feel: adaptive drawer heights, AI toggle in settings, and a Share Extension tutorial.

## Project Context

- **App:** Travelist - iOS travel recommendations app
- **Stack:** React + TypeScript + Vite + Capacitor (iOS)
- **Design System:** iOS 26 Liquid Glass with purple gradient theme (#667eea → #764ba2)
- **Location:** `/Users/morhogeg/travelist-2`

Read these files first for full context:
- `guides/CONTEXT.md` — Quick reference and conventions
- `guides/UI_UX_PATTERNS.md` — Design patterns and component styles
- `guides/SHARE_EXTENSION_STATUS.md` — Share Extension implementation details
- `src/pages/Settings.tsx` — Current settings page

## Task 1: Adaptive Drawer Heights

### Modify: `src/components/home/filters/FilterSheet.tsx`
Current: Fixed at 92vh
Goal: Dynamically size based on content

Implementation:
- Measure content height on render
- Set drawer height to content + padding
- Cap at 85vh maximum
- Minimum height for consistent feel (40vh)
- Smooth height transitions if content changes

### Apply same pattern to other drawers:
- `src/components/recommendations/RecommendationDrawer.tsx`
- Any other drawers that could benefit

## Task 2: AI Suggestions Toggle in Settings

### Modify: `src/pages/Settings.tsx`

Add new setting:
- Label: "AI Suggestions"
- Description: "Show personalized AI recommendations on home screen"
- Toggle switch (use existing Switch component)
- Store preference in localStorage key: `showAISuggestions`
- Default: true (enabled)

### Modify: `src/pages/Index.tsx` (or wherever AI carousel renders)
- Check localStorage for `showAISuggestions`
- Conditionally render AI suggestions carousel
- This connects to existing toggle functionality

## Task 3: Share Extension Tutorial

### Create: `src/components/help/ShareExtensionGuide.tsx`

Step-by-step visual guide:
1. **Enable the Extension**
   - Screenshot/illustration of iOS Settings → Travelist → Share Extension
   - Or: Safari share sheet → "More" → Enable Travelist

2. **Using the Extension**
   - Show share sheet with Travelist icon highlighted
   - Explain: "Share from Safari, Instagram, Maps, or any app"

3. **What Happens Next**
   - Explain inbox flow: shared items appear in Inbox
   - AI parses the content automatically

Design:
- Use carousel or step-by-step layout
- Include illustrations (can use Lucide icons creatively)
- "Got it" button at the end
- Dismissible, with option to "Don't show again"

### Add entry point in Settings:
- New row: "How to Use Share Extension"
- Icon: Share icon
- Opens ShareExtensionGuide as a drawer or modal

## Design Requirements

- Maintain existing Liquid Glass aesthetic
- Settings items should match current pattern
- Tutorial should feel native, not like a web popup
- Smooth animations using Framer Motion
- Support light and dark modes

## Verification

After implementation:
1. Open/close filter drawer and verify adaptive sizing
2. Toggle AI Suggestions in Settings and verify home screen updates
3. Open Share Extension guide and verify all steps display
4. Test in both light and dark modes
5. Verify settings persist across app restarts

## Deliverable

When complete, create a progress report at:
`/Users/morhogeg/.gemini/antigravity/brain/2c3a33e8-94c3-4c87-846d-ed35bc2d1811/phase4_polish_report.md`

Include:
- What was implemented
- Files created/modified
- Screenshots or recordings if possible
- Any issues encountered
- Suggestions for follow-up work
