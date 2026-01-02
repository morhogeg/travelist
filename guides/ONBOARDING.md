# Onboarding Flow

## Overview

The onboarding flow introduces first-time users to Travelist's core features through a **5-screen experience** with smooth animations, adhering to the "Liquid Glass" design system.

## Screens

### Screen 1: Welcome
- **Title:** "Never forget a great place."
- **Subtitle:** "Your personal travel memory. Save. Organize. Navigate."
- **Visual:** Animated Compass icon with pulsing glow ring and floating particles
- **CTA:** "Get Started"

### Screen 2: Save (Share Extension)
- **Title:** "Save from any app."
- **Subtitle:** "Found a place you love? Tap Share → Travelist."
- **Visual:** Share icon with orbiting ring and app flow animation
- **App Icons:** Safari 🧭, Instagram 📸, Maps 🗺️, TikTok 🎵 → Travelist

### Screen 3: Organize (Collections & Routes)
- **Title:** "Collections. Routes."
- **Subtitle:** "Group places by theme. Build day-by-day itineraries."
- **Visual:** Folder and Route icons with connecting line animation
- **Features:** Collections (purple), Routes (gradient)

### Screen 4: Navigate (Export to Maps)
- **Title:** "One tap. Start navigating."
- **Subtitle:** "Export your route directly to Google Maps or Apple Maps."
- **Visual:** Map icon with ripple effect and navigation indicator
- **Map Badges:** 🗺️ Google Maps, 🍎 Apple Maps

### Screen 5: Sign In
- **Title:** "Sync across all devices."
- **Subtitle:** "Keep your places backed up. Works offline, always."
- **Visual:** Cloud icon with orbiting sync dots
- **Badge:** "Cloud sync coming soon" (sparkle animation)
- **Primary Action:** Sign in with Apple
- **Secondary Action:** Continue without account

## Technical Details

### File Structure
```
src/components/onboarding/
├── index.ts                  # Exports
├── types.ts                  # Types + localStorage helpers
├── OnboardingFlow.tsx        # Main controller (5 steps)
├── screens/
│   ├── WelcomeScreen.tsx     # "Never forget a great place"
│   ├── SaveScreen.tsx        # Share Extension
│   ├── OrganizeScreen.tsx    # Collections & Routes
│   ├── NavigateScreen.tsx    # Export to Maps
│   └── SignInScreen.tsx      # Cloud Sync
└── components/
    ├── OnboardingProgress.tsx  # Animated dots
    └── OnboardingButton.tsx    # Styled button
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

## Animations

- **Page transitions:** Spring-based slide with opacity
- **Progress dots:** Spring animation with width change
- **Elements:** Staggered fade-in with y-axis movement
- **Icons:** Scale + rotation entrance with hover effects
- **Backgrounds:** Floating particles, ambient glows, shimmer effects

## Design System

- **Primary Gradient:** `#667eea` → `#764ba2`
- **Typography:** 34px bold titles, 17px muted subtitles
- **Spacing:** px-8 horizontal, pt-16/pb-10 vertical
- **Border Radius:** rounded-2xl (buttons), rounded-3xl (icons)

## Future Enhancements

- [ ] Connect Sign-In screen to Supabase auth
- [ ] Add travel style preference selector
- [ ] A/B test different onboarding flows
- [ ] Track onboarding completion analytics

---

Last Updated: January 2026
