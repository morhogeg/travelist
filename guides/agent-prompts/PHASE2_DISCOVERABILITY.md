# Agent Prompt: Phase 2 — Feature Discoverability

**Copy this entire file into a new Claude conversation to start this agent.**

---

## Your Mission

You are implementing **Phase 2: Feature Discoverability** for the Travelist app. Your goal is to help users discover hidden gestures and features through coach marks, visual hints, and onboarding enhancements.

## Project Context

- **App:** Travelist - iOS travel recommendations app
- **Stack:** React + TypeScript + Vite + Capacitor (iOS)
- **Design System:** iOS 26 Liquid Glass with purple gradient theme (#667eea → #764ba2)
- **Location:** `/Users/morhogeg/travelist-2`

Read these files first for full context:
- `guides/CONTEXT.md` — Quick reference and conventions
- `guides/UI_UX_PATTERNS.md` — Design patterns and component styles
- `src/components/onboarding/` — Existing onboarding implementation

## Task 1: Gesture Coach Marks

### Create: `src/components/ui/CoachMark.tsx`
- Overlay tooltip component
- Arrow pointing to target element
- "Got it" dismiss button
- Saves shown state to localStorage to prevent re-showing
- Props: `targetRef`, `message`, `position`, `storageKey`

### Create: `src/components/ui/GestureHint.tsx`
- Animated hand icon showing swipe direction
- Semi-transparent overlay
- Props: `direction: 'left' | 'right'`, `onDismiss`
- Auto-dismiss after first successful swipe

### Modify: `src/components/home/category/recommendation-item/RecommendationItem.tsx`
- Check localStorage for `hasSeenSwipeHint`
- Show GestureHint on FIRST card only if flag is false
- Mark flag true after any swipe interaction
- Only show once per install, not per session

## Task 2: Scroll Edge Indicators

### Modify: `src/components/home/category/CategoryPills.tsx`
- Add gradient fade masks on left/right edges
- Use CSS masks or pseudo-elements
- Left fade: shows when scrolled past start
- Right fade: shows when more content exists
- Fade should be subtle (purple gradient to transparent)

Example CSS pattern:
```css
.scroll-container::after {
  content: '';
  position: absolute;
  right: 0;
  width: 40px;
  background: linear-gradient(to right, transparent, var(--background));
}
```

## Task 3: Onboarding Enhancement

### Modify onboarding screens in `src/components/onboarding/screens/`

Add or enhance screens for:

1. **Gesture Tutorial Screen**
   - Visual demo of swipe-left (delete) and swipe-right (add to collection)
   - Animated card with finger gesture
   - "Try it yourself" interactive element

2. **Share Extension Screen**
   - Show how to enable Share Extension in iOS
   - Visual guide with Safari/Instagram share sheet mockup
   - Explain "share from any app" capability

3. **AI Suggestions Screen**
   - Highlight the AI-powered features
   - Free-text input demo
   - Personalized suggestions preview

## Design Requirements

- Coach marks: Semi-transparent dark overlay with white tooltip
- Animations: Use Framer Motion (already in project)
- Match existing onboarding style (see `OnboardingButton.tsx` for gradient)
- Haptic feedback on coach mark dismiss
- Support both light and dark modes

## Verification

After implementation:
1. Clear localStorage and test fresh user experience
2. Verify gesture hint shows only once
3. Test scroll indicators on category pills
4. Run through updated onboarding flow
5. Test on both light and dark modes

## Deliverable

When complete, create a progress report at:
`/Users/morhogeg/.gemini/antigravity/brain/2c3a33e8-94c3-4c87-846d-ed35bc2d1811/phase2_discoverability_report.md`

Include:
- What was implemented
- Files created/modified
- Screenshots or recordings if possible
- Any issues encountered
- Suggestions for follow-up work
