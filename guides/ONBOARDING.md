# Onboarding Flow

## Overview

The onboarding flow introduces first-time users to Travelist's core features through a 4-screen experience with smooth animations, adhering to the "Liquid Glass" design system.

## Screens

### Screen 1: Welcome
- **Title:** "Your External Travel Brain"
- **Subtitle:** "Collect recommendations. Plan trips. Never forget a hidden gem."
- **Visual:** Animated Compass icon in a liquid-glass container with purple gradient
- **Features:** Save (MapPin), Organize (Folder), Navigate (Map)
- **CTA:** "Get Started"

### Screen 2: Add Places (Share Extension)
- **Title:** "Save From Anywhere"
- **Subtitle:** "Found a gem on Instagram? Sharing to Travelist is instant."
- **Visual:** Share Extension card showing Safari, Maps, Instagram, TikTok integration
- **Categories:** App's 7 category icons with correct colors:
  - Food (Utensils, #FEC6A1)
  - Lodging (Bed, #E5DEFF)
  - Attractions (Eye, #FFDEE2)
  - Shopping (ShoppingBag, #D3E4FD)
  - Nightlife (Music, #accbee)
  - Outdoors (Palmtree, #F2FCE2)
  - General (MapPin, #eef1f5)
- **Highlights:** Organized by Location, Track Recommendations

### Screen 3: Organize & Navigate
- **Title:** "Plan. Navigate. Explore."
- **Subtitle:** "Turn your saved places into actionable trip plans."
- **Collections:** Group places by theme, trip, or occasion
- **Routes:** Day-by-day itineraries with drag-and-drop
- **Star Feature:** **Export to Maps** (Google Maps & Apple Maps)
- **Highlights:** Track Progress, Drag & Drop

### Screen 4: Sign In
- **Title:** "Always In Sync"
- **Subtitle:** "Your travel brain, everywhere you go."
- **Benefits:** Sync Everywhere, Private & Secure, Offline First
- **Primary Action:** Sign in with Apple
- **Secondary Action:** Continue Without Account
- **Teaser:** "Cloud Sync Coming Soon" (purple gradient badge)

## Technical Details

### File Structure
```
src/components/onboarding/
├── index.ts                  # Exports
├── types.ts                  # Types + localStorage helpers
├── OnboardingFlow.tsx        # Main controller
├── screens/
│   ├── WelcomeScreen.tsx     # "Travel Brain"
│   ├── AddPlacesScreen.tsx   # Share Extension
│   ├── OrganizeScreen.tsx    # Export to Maps
│   └── SignInScreen.tsx      # Premium Sign In
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

- **Page transitions:** Slide left/right with fade
- **Progress dots:** Spring animation with width change
- **Elements:** Staggered fade-in with y-axis movement
- **Icon:** Scale + rotation entrance animation
- **Visuals:** Floating liquid-glass cards

## Future Enhancements

- [ ] Connect Sign-In screen to Supabase auth
- [ ] Add travel style preference selector
- [ ] A/B test different onboarding flows
- [ ] Track onboarding completion analytics

---

Last Updated: December 2025

