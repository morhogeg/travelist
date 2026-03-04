# Onboarding Flow

## Overview

The onboarding flow introduces first-time users to Travelist's core features through a **6-screen experience** with smooth animations, adhering to the "Liquid Glass" design system.

## Screens (Active Flow)

### Screen 0: Great places keep getting lost.
- **Visual:** Stacked chaos cards (Screenshot, DM, Saved post) with stagger animation
- **CTA:** "There's a better way →" (Secondary style)

### Screen 1: Your travel memory, supercharged.
- **Visual:** Animated "T" app icon with shimmer + 3 feature pills (Save, AI, Nearby)
- **CTA:** "Get Started"

### Screen 2: Save from anywhere.
- **Visual:** Share icon with sparkle badge + 3 numbered step cards
- **CTA:** "Continue"

### Screen 3: Just tell us what you heard.
- **Visual:** Input mockup → AI parsing animation → result card (Luigi's Pizza, Paris)
- **CTA:** "Continue"

### Screen 4: Quick actions, no menus.
- **Visual:** Interactive card — tap left half to delete, right half to collect. Animated swipe hint.
- **CTA:** "Got it, let's go"

### Screen 5: You're all set. (SignIn)
- **Visual:** Animated checkmark icon with floating sparkles
- **CTA:** "Start Exploring" (owns its own button — not managed by OnboardingFlow)

## Architecture

### CTA / Button Pattern
All buttons for screens 0–4 live in `OnboardingFlow.tsx`, **not** inside individual screen components. This keeps the CTA in a fixed position regardless of content height.

- Primary button label is defined per-step in the `STEP_CTA` array in `OnboardingFlow.tsx`
- "Back" button uses `className="invisible"` on steps 0–1 to preserve layout without showing it
- `SignInScreen` is the only screen that owns its own CTA

### Dismiss / Skip Pattern
- An **X button** sits in the top bar alongside the progress dots (consistent with the Share Guide)
- X is hidden on the SignIn screen (step 5) — user must take an action there
- Tapping X calls `markOnboardingComplete(true)` and exits

### Progress Bar
- Component: `OnboardingProgress` — pill-shaped dots, active dot expands to 24px wide
- Color: explicitly `#667eea` (active), `rgba(102,126,234,0.5)` (completed), `rgba(255,255,255,0.2)` (upcoming)
- Positioned at `pt-14` to clear the iPhone notch reliably (not `pt-safe-area-top` which resolves to 0 in web context)

### File Structure
```
src/components/onboarding/
├── index.ts                      # Exports
├── types.ts                      # Types + localStorage helpers
├── OnboardingFlow.tsx            # Main controller — owns progress, X button, CTA for steps 0–4
├── screens/
│   ├── ProblemScreen.tsx         # "Great places keep getting lost"
│   ├── WelcomeScreen.tsx         # "Your travel memory, supercharged"
│   ├── ShareToSaveScreen.tsx     # "Save from anywhere"
│   ├── AIMagicScreen.tsx         # "Just tell us what you heard"
│   ├── GestureTutorialScreen.tsx # Interactive swipe demo
│   ├── SignInScreen.tsx          # "You're all set" — owns its own CTA
│   ├── NavigateScreen.tsx        # (unused in active flow)
│   └── ProximityAlertsScreen.tsx # (unused in active flow)
└── components/
    ├── OnboardingProgress.tsx    # Animated progress dots
    └── OnboardingButton.tsx      # primary / secondary / ghost variants
```

### localStorage

**Key:** `travelist-onboarding-completed`

**Value:**
```json
{
  "version": "1.0",
  "completedAt": "2025-11-25T12:00:00.000Z",
  "skipped": false
}
```

### Resetting Onboarding (for testing)

Browser console:
```javascript
localStorage.removeItem('travelist-onboarding-completed')
location.reload()
```

Or from the app: **Settings → Guides & Tutorials → Welcome Tour**

## Share Guide (`ShareExtensionGuide.tsx`)

A 4-step in-app guide accessible from **Settings → Guides & Tutorials → Saving from other apps**.

Shares the same visual language as onboarding: gradient icon boxes with blur glow, 34px bold titles, spring animations.

### Steps
1. **Find it anywhere** — app pill chips (Instagram, TikTok, Maps, Safari, Messages)
2. **Tap the Share button** — mini browser + pulsing share button mockup
3. **Choose Travelist** — iOS share sheet mockup (Safari, Maps, More + highlighted Travelist icon)
4. **AI does the rest** — mini Inbox card preview ("Ready to Review" state)

### Pattern
Same as onboarding: buttons live outside the step components in the main `ShareExtensionGuide` component. `Back` is `invisible` on step 0. X button in top bar resets step to 0 on close.

## Design System

- **Primary Gradient:** `#667eea` → `#764ba2`
- **Typography:** 34px bold titles, 16–17px muted subtitles
- **Icon box:** `w-20 h-20 rounded-[24px]` with gradient fill + `blur(24px)` glow behind
- **Cards/mockups:** `rounded-2xl border border-border/50 bg-card/70 backdrop-blur-md`
- **Page transitions:** `x: 60 → 0`, exit `x: -40`, spring stiffness 80 damping 18

## Future Enhancements

- [ ] Connect Sign-In screen to Supabase auth
- [ ] Add travel style preference selector
- [ ] A/B test different onboarding flows
- [ ] Track onboarding completion analytics

---

Last Updated: March 2026
