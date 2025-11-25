# Onboarding Flow

## Overview

The onboarding flow introduces first-time users to Travelist's core features through a 4-screen experience with smooth animations.

## Screens

### Screen 1: Welcome
- App icon with compass animation
- Title: "Your Personal Travel Guide"
- Feature highlights: Save Places, Organize, Explore
- CTA: "Get Started" button

### Screen 2: Add Places
- 7 category icons grid (Food, Lodging, Attractions, Shopping, Nightlife, Outdoors, General)
- Features highlighted:
  - Track who recommended each place
  - Organized by city automatically

### Screen 3: Organization
- Split view showing Collections and Routes features
- Collections: Group places by theme or trip
- Routes: Plan day-by-day itineraries
- Progress tracking highlighted

### Screen 4: Sign In (Placeholder)
- Apple Sign-In button (primary)
- Email Sign-In button (secondary)
- Benefits: Sync everywhere, Never lose data, Works offline
- *Note: Currently a placeholder until Supabase is integrated*

## Technical Details

### File Structure
```
src/components/onboarding/
├── index.ts                  # Exports
├── types.ts                  # Types + localStorage helpers
├── OnboardingFlow.tsx        # Main controller
├── screens/
│   ├── WelcomeScreen.tsx
│   ├── AddPlacesScreen.tsx
│   ├── OrganizeScreen.tsx
│   └── SignInScreen.tsx
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

### Detection Logic

```typescript
import { isOnboardingComplete } from '@/components/onboarding';

// In App.tsx
const [showOnboarding, setShowOnboarding] = useState(() => !isOnboardingComplete());
```

### Resetting Onboarding (for testing)

Browser console:
```javascript
localStorage.removeItem('travelist-onboarding-completed')
location.reload()
```

Or programmatically:
```typescript
import { resetOnboarding } from '@/components/onboarding';
resetOnboarding();
```

## Animations

- **Page transitions:** Slide left/right with fade
- **Progress dots:** Spring animation with width change
- **Elements:** Staggered fade-in with y-axis movement
- **Icon:** Scale + rotation entrance animation

## Future Enhancements

- [ ] Connect Sign-In screen to Supabase auth
- [ ] Add travel style preference selector
- [ ] Add Google Maps import option on final screen
- [ ] A/B test different onboarding flows
- [ ] Track onboarding completion analytics

---

Last Updated: November 2025
