# Travelist - Context & Quick Reference

**Last Updated:** November 2025

---

## 🎯 Current Status

**App State:** iOS 26 Liquid Glass transformation complete
**Primary Theme:** Purple Gradient (#667eea → #764ba2)
**Current Branch:** main
**Active Development:** UI polish and feature enhancement + Supabase sync/auth (email/password)

---

## 🚀 Quick Start

### Run Development Server
```bash
npm run dev              # Web development (port 5173)
npm run dev -- --host    # Accessible on local network
```

### iOS Development
```bash
npm run build:sync       # Build and sync to iOS (recommended workflow)
npm run ios:dev          # Build and open in Xcode (development mode)
npm run ios:prod         # Build for production and open in Xcode
npm run cap:sync         # Sync web code to iOS
npm run cap:open         # Open iOS project in Xcode
./watch-and-sync.sh      # Watch for changes and auto-sync (requires fswatch)
```

### Build
```bash
npm run build:dev        # Development build
npm run build:prod       # Production build
```

---

## 📁 Key Files & Locations

### Cloud Sync & Auth
- `src/lib/supabase.ts` - Supabase client + connectivity check
- `src/utils/recommendation/supabase-recommendations.ts` - Supabase read/write + backfill (user-scoped)
- `src/utils/recommendation/recommendation-manager.ts` - Local storage + Supabase merge on sign-in
- `src/pages/Settings.tsx` - Email/password auth UI with inline password toggle
- Env (local only): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

### Design System
- `src/index.css` - Liquid Glass materials, iOS 26 design tokens, animations
- Theme colors: Purple gradient primary, success green for visited items

### Core Components
- `src/components/layout/Layout.tsx` - Main layout with safe areas
- `src/components/layout/Navbar.tsx` - Bottom floating navbar (minimalistic purple)
- `src/components/layout/ThemeToggle.tsx` - Dark/light mode toggle (top-right)
- `src/components/home/search/SearchHeader.tsx` - Header with title, search, view toggle

### Home/Recommendations
- `src/components/home/category/CountryGroup.tsx` - Country sections (purple headers)
- `src/components/home/category/CityGroup.tsx` - City sections
- `src/components/home/category/CityHeader.tsx` - City headers with purple pin
- `src/components/home/category/GridView.tsx` - Vertical list view for recommendations
- `src/components/home/category/recommendation-item/RecommendationItem.tsx` - Individual cards with colored borders, large emojis

### Filters
- `src/components/home/filters/FilterButton.tsx` - Icon-only filter button with badge
- `src/components/home/filters/FilterSheet.tsx` - Bottom drawer with 4 filter types (visit status, source, occasions, location)
- `src/components/home/filters/ActiveFilters.tsx` - Active filter chips
- `src/components/home/filters/sections/` - Individual filter section components
- `src/types/filters.ts` - Filter state types and helpers (no price range)
- `src/utils/recommendation/filter-helpers.ts` - Filter logic

### Forms & Drawers
- `src/components/recommendations/RecommendationDrawer.tsx` - Add recommendation drawer
- `src/components/recommendations/forms/StructuredInputForm.tsx` - Structured input form
- `src/components/recommendations/forms/FreeTextForm.tsx` - AI-powered free text input
- `src/components/recommendations/ParsePreviewSheet.tsx` - Preview/edit AI-parsed results

### AI Services
- `src/services/ai/providers/openrouter-parser.ts` - Grok 4.1 integration via OpenRouter
- `src/utils/recommendation/ai-parsed-recommendation.ts` - Save AI-parsed places

### Native iOS
- `src/hooks/native/useHaptics.ts` - Haptic feedback hook
- `src/hooks/native/useStatusBar.ts` - Status bar theme management
- `src/utils/ios/haptics.ts` - Haptic utility functions

### Pages
- `src/pages/Index.tsx` - Home page with recommendations
- `src/pages/Profile.tsx` - User profile
- `src/pages/Settings.tsx` - App settings
- `src/pages/place-detail/` - Place detail pages
- `src/pages/CollectionsTab.tsx` - Collections list
- `src/pages/CollectionDetailPage.tsx` - Individual collection

### Configuration
- `capacitor.config.ts` - Main Capacitor config (dev/prod switching)
- `vite.config.ts` - Vite build configuration
- `tailwind.config.ts` - Tailwind customization

---

## 🎨 Design System Reference

### Purple Gradient Theme
```css
/* Primary gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);

/* Text color */
color: #667eea;

/* Hover */
color: #764ba2;
```

### Liquid Glass Materials
```css
.liquid-glass-clear   /* Most transparent - default */
.liquid-glass-tinted  /* More opaque */
.liquid-glass-float   /* Floating elements (navbar) */
.liquid-glass-layered /* Multi-layer depth */
```

### iOS 26 Animations
```css
.ios26-transition-smooth  /* 120Hz smooth */
.ios26-transition-spring  /* Spring physics */
.ios26-animate-in         /* Fade + scale in */
```

### Typography Hierarchy
- Country headers: `text-xl font-bold text-[#667eea]`
- City headers: `text-lg font-semibold` with purple pin
- Body: `text-sm` or `text-base`

### Spacing (Current Compact Style)
- Cards: `px-2.5 py-1.5 space-y-0.5`
- Image aspect: `aspect-[3/2]` (was 4/3)
- Carousel width: `240px` per item
- Country/City groups: `space-y-6` (was space-y-8/10)

---

## 🔧 Important Conventions

### Color Usage
- **Purple gradient** for primary actions, highlights, active states
- **Success green** (#34C759) for visited items (with backdrop blur)
- **Neutral gray** for focus rings (not blue!)
- **No blue** anywhere (fully replaced with purple theme)

### UI Patterns
- Toggles are `h-10 w-10` rounded circles
- Buttons use gradient with inline styles (can't be in Tailwind)
- Visited badges: backdrop blur with success color
- Back buttons: purple with hover/active states
- Navbar: minimalistic, icon-only highlights

### Positioning
- Theme toggle: top-right corner (right-4)
- View mode toggle: SearchHeader at right-16 (avoids theme overlap)
- Back button: left-4 when on city/country views

### File Operations
- Always use Edit tool for existing files (never Write unless new file)
- Read files before editing
- Use parallel tool calls when operations are independent

---

## 📊 Data Structure

### Recommendation Object
```typescript
{
  id: string;
  recId: string;
  name: string;
  description?: string;
  category: string;
  city: string;
  cityId: string;
  country: string;
  visited: boolean;
  website?: string;
  image?: string;
}
```

### Place Object
```typescript
{
  id: string;
  name: string;
  country: string;
  image?: string;
}
```

---

## 🐛 Known Issues & Limitations

### Supabase Sync
- Requires signed-in session; offline/new-device without sign-in stays local-only
- Apple Sign-In not wired yet (email/password only)
- Confirmation links must target the dev host (Supabase Auth → URL Configuration)

### Current Limitations
- Images are placeholder-based (category-specific)
- No Apple Sign-In; no multi-device merge without sign-in
- Local-first storage remains; Supabase used when available

### Safari/Web Limitations
- Liquid Glass blur less pronounced than native iOS
- Some haptics only work on device (not simulator)

### Performance Notes
- Carousel uses snap scroll with scrollbar-hide
- Virtual scrolling not yet implemented for long lists
- Bundle size is optimized but could be smaller

---

## 🎯 Recent Changes Summary

**Latest (Jan 2026): Inbox + Hierarchy polish**
- Inbox share parsing now uses OpenRouter `tngtech/deepseek-r1t2-chimera:free`; failures keep items editable and import toasts were removed.
- Home hierarchy clarified: countries/cities de-emphasized, city/place indentation added (tips align), and country/city counts hidden on the home screen only (still available for collections/routes).
- Inbox UI cleanup: empty-state copy now explains sharing from other apps, and the manual refresh button was removed (imports run automatically on focus).
- Home ordering: unvisited places sort alphabetically; visited items stay grouped at the bottom and also sort alphabetically.

**Latest (December 2025): Supabase Sync + Auth**
- Email/password auth added in Settings (inline password toggle)
- Backfill local recommendations to Supabase on sign-in
- One-time pull/merge from Supabase to local on startup when signed in
- User-scoped writes (user_id + RLS policies required in Supabase)
- Environment: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (local only)
- Auth UI polish: hide email/password when signed in; profile avatar shows user initial + signed-in email line
- Dark mode fix: "Mark Visited" button in detail drawer now matches outline style when unvisited and shows green when visited (no blue flash)

**Latest Session Changes (November 29, 2025):**

**Country Autocomplete & Spacing Improvements:**
1. ✅ **Country autocomplete dropdown** - FreeTextForm now shows country suggestions as user types
2. ✅ **Warm typing filter** - Country dropdown filters in real-time based on typed letters
3. ✅ **Compact country spacing** - Reduced gap between countries in home list view
4. ✅ **Tighter city spacing** - Reduced margins between cities within countries
5. ✅ **Persistent collapse state** - Country collapse state saved to localStorage, survives navigation
6. ✅ **Collapse state retention** - Collapsed countries stay collapsed when switching tabs or categories

**Custom Slash Commands:**
- `/begin` - Load project context from guides folder at session start
- `/done` - Update docs and push to git at session end

**Category Icon Consistency:**
- Unified icons across all components (category pills, AI cards, place details)
- Nightlife: Music icon (was Moon in AI cards)
- Attractions: Eye icon (was Camera in AI cards)
- Outdoors: Palmtree icon (was TreePine in AI cards)

**AI Suggestion Card Redesign:**
- Navigation button matches regular cards (simple icon, no border)
- "Why recommended" uses amber tip style (was blue highlight box)
- Compact spacing with balanced proportions

**Spacing Changes:**
- CountryGroup container: `mb-6` → `mb-1`
- CityGroup container: `mb-3` → `mb-1`
- Space between cities: `space-y-3` → `space-y-1`
- Country header: `min-h-11 py-2 mb-3` → `min-h-[40px] py-1 mb-1`
- Dividers: removed top margin for tighter layout

---

**Previous Session Changes (November 28, 2025):**

**AI Suggestions - Grok Integration:**
1. ✅ **Real AI recommendations** - Replaced mock provider with Grok 4.1 Fast via OpenRouter
2. ✅ **Personalized suggestions** - AI analyzes saved places to understand user preferences
3. ✅ **Smart "why recommended"** - Explanations reference user's actual saved places
4. ✅ **Directions button** - AI suggestion cards now have Google Maps navigation button
5. ✅ **Refresh works** - Refresh button now properly skips cache and fetches new suggestions
6. ✅ **Graceful fallback** - Falls back to mock provider if API fails

**Provider:** `src/services/ai/providers/grok-suggestions-provider.ts`

**iOS Button Blue Highlight Fix:**
1. ✅ **Ghost button fix** - Changed ghost variant from `hover:bg-accent` (blue) to `hover:opacity-70 active:opacity-50`
2. ✅ **Root cause identified** - The `--accent` color was iOS blue (#007AFF), triggered on touch devices during hover/active states
3. ✅ **Matches working pattern** - Now uses same opacity-based feedback as `motion.button` elements (search icon)
4. ✅ **Button component hardened** - Added inline styles: `WebkitTapHighlightColor`, `WebkitTouchCallout`, `WebkitUserSelect`, `outline`
5. ✅ **Style prop fix** - Fixed bug where `{...props}` was overwriting inline `style` object by extracting `style` separately

---

**Previous Session Changes (November 27, 2025):**

**AI-Powered Free Text Input:**
- **AI Provider:** OpenRouter API (https://openrouter.ai)
- **Model:** Grok 4.1 Fast (x-ai/grok-4.1-fast:free) - free tier
- **API Key:** Set `VITE_OPENROUTER_API_KEY` in `.env` file

1. ✅ **Grok 4.1 integration** - Uses OpenRouter API with x-ai/grok-4.1-fast:free model
2. ✅ **Smart extraction** - AI extracts place name, category, tip, and source from natural language
3. ✅ **Multi-language support** - Tips preserved in user's input language (Hebrew, Spanish, etc.)
4. ✅ **Preview & edit sheet** - Users review and correct AI-parsed results before saving
5. ✅ **Editable fields** - Name, category, tip, and source all editable in preview
6. ✅ **Source detection** - Automatically detects friends, Instagram, TikTok, YouTube, etc.
7. ✅ **Tip extraction** - Extracts actionable tips like "Try the falafel" from context
8. ✅ **Country field added** - Free text form now has both city and country inputs
9. ✅ **Auto-fill country** - Country auto-populates when city matches existing recommendations
10. ✅ **Amber tips display** - Tips shown in amber with lightbulb icon (consistent styling)
11. ✅ **Friend name autocomplete** - Shows existing friends as suggestion chips to prevent duplicates
12. ✅ **Original name chip** - Amber chip shows AI-extracted name if user changes it, allows one-click revert
13. ✅ **Dynamic source fields** - Name field only shows for "Friend" source type
14. ✅ **Tip editing fix** - AI-created recommendations now show tip in edit form (description → context.specificTip fallback)

**UX Improvements (November 27, 2025 - Session 2):**
15. ✅ **City/Country header buttons** - Matched collections/routes style (ghost buttons, no borders)
16. ✅ **Clearable inputs** - All text inputs have subtle X button to clear (grey, minimal)
17. ✅ **City dropdown on focus** - Shows existing cities immediately when tapping city field
18. ✅ **Cities sorted by recency** - Most recently used city appears at top of dropdown
19. ✅ **iOS tap highlight removed** - Blue tap highlight removed globally (-webkit-tap-highlight-color: transparent)
20. ✅ **FreeTextForm label** - Changed "Your Recommendations" to "What did you hear?"

**Example usage:**
- Input: "Hanan told me that the falafel in Nivo grill is great"
- Output: Name: "Nivo Grill", Category: Food, Tip: "Try the falafel", Source: Friend (Hanan)

**Section Index (Country Navigator):**
1. ✅ **A-Z alphabet scrubber** - Vertical index on right edge for quick country navigation
2. ✅ **Scroll-triggered visibility** - Hidden by default, appears after scrolling 150px
3. ✅ **Smooth animations** - Fades in/out with slide from right
4. ✅ **Active/inactive states** - Purple for available letters, dimmed for empty
5. ✅ **Haptic feedback** - Selection haptic on letter change
6. ✅ **Drag support** - Drag along bar for continuous scrubbing

**Filter Drawer Polish:**
1. ✅ **Centered "Filters" title** - Title now centered with Reset button absolutely positioned
2. ✅ **Removed "Blog" source** - Simplified source options
3. ✅ **All Places icon** - Changed from AI sparkles to subtle Layers icon
4. ✅ **Tighter spacing** - Reduced gap between header and Visit Status section

**Previous Session Changes (November 26, 2025):**

**Collections & Routes Consistency:**
1. ✅ **CollectionsTab styling updated** - Matches Routes tab with same header, spacing, and FAB button
2. ✅ **CollectionDetailPage redesign** - Matches RouteDetail with ghost buttons, liquid glass info card
3. ✅ **Swipe-to-delete on collections** - Swipe left on collection cards to delete with confirmation dialog
4. ✅ **Swipe-to-delete on collection items** - Swipe left on items within a collection to remove them
5. ✅ **Delete button in collection detail** - Trash icon in header to delete entire collection
6. ✅ **Collection cards clickable** - Tapping a card opens RecommendationDetailsDialog

**Onboarding Purple Theme:**
1. ✅ **Purple gradient buttons** - OnboardingButton now uses purple gradient (#667eea → #764ba2)
2. ✅ **Purple icons throughout** - All onboarding icons use purple instead of blue
3. ✅ **WelcomeScreen positioned higher** - Reduced top gap, content starts from top
4. ✅ **View Welcome Tour button** - Added to Profile page to replay onboarding
5. ✅ **Event-based reset** - Uses CustomEvent to trigger onboarding without page reload

**Previous Session Changes (November 25, 2025):**

**Add to Collection Feature:**
1. ✅ **Swipe right to add** - Cards can be swiped right to reveal purple "Add" button
2. ✅ **Collection picker drawer** - Tapping "Add" opens drawer with all collections
3. ✅ **Toggle membership** - Tap collections to add/remove item (multiple collections allowed)
4. ✅ **Create new collection** - Inline creation from picker drawer
5. ✅ **Details drawer button** - "Add to Collection" button in expanded card view
6. ✅ **Visual feedback** - Button shows collection name when item is in a collection
7. ✅ **Toast notifications** - Feedback on add/remove actions

**Category Sheet Polish:**
1. ✅ **Smaller fonts** - Reduced font sizes to match app style
2. ✅ **Hide FAB when open** - Plus button hides when category sheet is visible
3. ✅ **Removed shadows** - Clean flat appearance for selected categories
4. ✅ **Removed checkmarks** - Purple background alone indicates selection

**Swipe-to-Delete Feature:**
1. ✅ **Swipe left to delete** - Cards can be swiped left to reveal delete button
2. ✅ **Delete confirmation dialog** - Tapping delete opens confirmation dialog
3. ✅ **Click outside to close** - Tapping anywhere outside closes the swipe action
4. ✅ **Swipe right to close** - Can also swipe back to close the delete option

**AI Suggestions & Filter Consistency Improvements:**
1. ✅ **AI source added to filter drawer** - AI now appears as a filterable source type with sparkle icon
2. ✅ **Filter drawer added to city view** - PlaceDetail now has same filter button and FilterSheet as home
3. ✅ **Filter drawer added to country view** - CountryView now has same filter functionality
4. ✅ **Cards clickable everywhere** - City and country views now show RecommendationDetailsDialog on card tap
5. ✅ **Cities filter scoped by country** - In country view, cities filter only shows cities from that country
6. ✅ **Plus button hides on expanded view** - FAB hides when details dialog is open (matches home behavior)
7. ✅ **AI source display fixed** - Shows "AI Suggested" with sparkle icon (not "Recommended by AI Suggested")
8. ✅ **Country header background removed** - Removed subtle gray highlight from country names in home view
9. ✅ **AI suggestions collapsible** - Users can hide AI carousel with toggle (persists in localStorage)
10. ✅ **AI badge on cards** - Cards from AI suggestions show sparkle icon indicator

**Previous Session - Route Place Details:**
1. ✅ **Navigate button fixed** - changed from purple gradient to white outline button (consistent with app style)
2. ✅ **Mark Visited button fixed** - removed purple border/text styling, now uses white outline
3. ✅ **Toggle visited working** - button now properly toggles between visited (green) and unvisited (white)
4. ✅ **iOS tap highlight fixed** - removed blue flash on button tap using inline styles and WebkitTapHighlightColor
5. ✅ **Blur on click** - added button blur after click to prevent iOS focus state issues

**Previous Session (November 23, 2025):**

**Home Screen De-cluttering - UX Improvements:**
1. ✅ **Removed date from cards** - "Nov 23, 2025" removed from card view, kept in detail drawer only
2. ✅ **Simplified action buttons** - cards now show only visited checkbox + directions (map) button
3. ✅ **Edit/Delete moved to drawer** - edit and delete buttons removed from cards, remain in detail drawer footer
4. ✅ **Country headers de-emphasized** - changed from purple (`text-[#667eea]`) to black/foreground color
5. ✅ **Attribution text grayed** - changed from purple to muted-foreground for less visual noise
6. ✅ **Increased card spacing** - changed from `space-y-3` to `space-y-4` for better breathing room
7. ✅ **Reduced purple overload** - purple now used strategically (category accents, active states) not everywhere
8. ✅ **Cards 25% shorter** - removed elements reduce card height from ~180px to ~140-150px
9. ✅ **Cleaner, more scannable** - 30% less visual noise, easier to browse recommendations
10. ✅ **Flag emojis stand out** - country flags provide visual interest without purple competition
11. ✅ **Swapped tip/attribution order** - tips now appear before attribution (actionable info first, context second)
12. ✅ **Gradient dividers** - replaced solid borders with elegant gradient fades (left-to-right: grey → transparent)
13. ✅ **Three-tier hierarchy** - country gradients (60% opacity start) > city gradients (40% opacity) > card spacing
14. ✅ **iOS-like elegance** - matches card gradient divider pattern, less intrusive than hard lines
15. ✅ **Precise divider control** - conditional rendering with isLastInCountry/isLastCountry props
16. ✅ **Perfect divider placement** - shows between cities, between countries, hides after last items

**Previous Session: Profile & Settings Pages Redesign:**
1. ✅ **Compact Profile header** - reduced avatar size (20px → 12px), title size (3xl → xl)
2. ✅ **Removed redundant stat** - removed "Visited" stat card, kept only total/countries/cities/collections
3. ✅ **Tighter stat cards** - reduced padding (p-4 → p-3.5), smaller icons (h-12 w-12 → h-11 w-11)
4. ✅ **Enhanced typography** - labels now font-medium with foreground/80 instead of muted
5. ✅ **Settings page overhaul** - new centered header with large icon and description
6. ✅ **Switch component integration** - replaced manual toggle with proper Switch UI component
7. ✅ **Improved theme setting** - better visual hierarchy with icon, title, and subtitle
8. ✅ **Added "What's Next" section** - coming soon message with sparkles icon
9. ✅ **Consistent spacing** - unified padding and margins across both pages
10. ✅ **Better glass morphism** - improved liquid-glass-clear integration throughout

**Previous Session: Minimalist Polish & iOS Drawer Patterns:**
1. ✅ **Removed all grey shadows** - added `boxShadow: 'none'` to cards and category pills
2. ✅ **Enhanced card design** - replaced emojis with category pill icons, consistent design language
3. ✅ **Improved visited button** - changed from checkbox to circle/check icon, removed blue hover state bug
4. ✅ **Optimized spacing** - increased card spacing (space-y-3), pill spacing (gap-3), button spacing (gap-3)
5. ✅ **Added subtle pill backgrounds** - inactive pills now have `bg-neutral-100/40` for better clickability
6. ✅ **Redesigned detail dialog** - removed 264px hero image, replaced with compact text-only header
7. ✅ **Vertical left border** - 4px colored accent on dialog (matches cards), removed aggressive bottom bar
8. ✅ **Larger category icons** - increased to 48px in dialog header for better visual hierarchy
9. ✅ **Integrated metadata** - moved "Added on" date into header, removed duplicate
10. ✅ **Equal-width footer buttons** - Delete, Edit, and Close now balanced with `flex-1`
11. ✅ **Search bar focus color** - changed from blue to purple (#667eea) for brand consistency
12. ✅ **Clean header design** - removed glass morphism, using clean `bg-background` with `border-b`
13. ✅ **Removed attribution badge** - removed redundant purple person icon from card headers
14. ✅ **Removed city pin icons** - cleaner city headers without decorative purple pins
15. ✅ **Converted to iOS Drawer** - detail view now uses Drawer with drag handle instead of Dialog
16. ✅ **Consistent drawer heights** - detail/add drawers at 85vh, filter drawer at 92vh
17. ✅ **Filter drawer iOS patterns** - converted to Drawer component, added drag handle, reduced button size
18. ✅ **Optimized filter drawer** - increased height to 92vh so all options visible without scrolling

**Previous Session: Enhanced Text-Only Card Design & UX Improvements:**
1. ✅ Unified card view - removed redundant gallery/list toggle
2. ✅ Added colored 4px left border to cards (category-based)
3. ✅ Larger 24x24 emoji for better visual hierarchy
4. ✅ Gradient divider after card header for polish
5. ✅ Improved spacing and typography (bolder names, better padding)
6. ✅ Removed price range filter (simplified filter system)
7. ✅ Text-only design philosophy - no images needed
8. ✅ Single optimized view for all recommendation browsing

**Previous: Filter System & Header Layout Improvements:**
1. ✅ Comprehensive filter system with 4 filter types (visit status, source, occasions, location)
2. ✅ Fixed filter button placement - now stays visible when scrolling categories
3. ✅ All buttons meet iOS 44px minimum touch target standard
4. ✅ Icon-only filter button with active count badge
5. ✅ Reorganized header layout following iOS best practices
6. ✅ Source filter section renamed and logically organized (social → personal → content)
7. ✅ Removed Priority filter section (simplified UX)
8. ✅ Added build:sync npm script for faster development
9. ✅ Created watch-and-sync.sh helper script
10. ✅ Gradient hint for scrollable category area

**Previous Changes:**
1. Purple gradient theme applied throughout (replaced all blue)
2. Typography hierarchy: country (xl) > city (lg)
3. Compact cards: reduced padding/spacing significantly
4. Horizontal carousel for recommendations
5. Minimalistic navbar (no background pill, just icon color)
6. Repositioned toggles to avoid overlaps
7. Purple back button with hover states
8. Purple map pins and country names
9. Neutral focus rings (not blue)

---

## 💻 Development Notes

### When Adding New Features
1. Use Liquid Glass materials for overlays/modals
2. Apply purple gradient to primary actions
3. Add haptic feedback for interactions
4. Use ios26-transition classes for animations
5. Respect safe areas (env(safe-area-inset-*))
6. Test in both light and dark modes
7. Keep spacing compact (current style)

### Haptics Usage
```typescript
import { haptics } from '@/utils/ios/haptics';

haptics.light();   // Light tap
haptics.medium();  // Button press
haptics.heavy();   // Destructive action
haptics.success(); // Success notification
```

### Status Bar
```typescript
// Status bar automatically follows theme
// Configured in App.tsx with useStatusBarTheme hook
```

---

## 📚 Documentation Files

1. **IOS26_TRANSFORMATION.md** - Complete design system guide
2. **ROADMAP.md** - Full to-do list and future plans
3. **IOS_DEVELOPMENT.md** - iOS development setup
4. **CONTEXT.md** (this file) - Quick reference for continuation
5. **README.md** - Project overview

---

## 🎨 Design Philosophy

**Current Aesthetic:**
- Modern iOS 26 Liquid Glass
- Purple gradient theme (elegant, not too flashy)
- Minimalistic and clean
- Compact but readable
- Smooth animations with spring physics
- Dark mode optimized for OLED

**Key Principles:**
- Less is more (minimalistic approach)
- Proper visual hierarchy
- Smooth, natural animations
- Native iOS feel
- Accessibility considered

---

## 🔄 Git Workflow

```bash
# Current branch
main (up to date with origin/main)

# Recent commits
acf64d5 - Add comprehensive roadmap
48f6c35 - Update documentation with purple gradient
9262346 - Implement iOS 26 Liquid Glass design system
96330eb - Convert web app to iOS with Capacitor

# Commit style
# Use descriptive messages with emoji where appropriate
# Include "Co-Authored-By: Claude" footer
```

---

## ⚡ Performance Tips

- Liquid Glass can be heavy on older devices (use sparingly)
- Test on iPhone 11/12 for minimum viable performance
- Carousel uses CSS snap (performant)
- Images need optimization (future task)
- Keep blur radius reasonable (24-32px max)

---

## 🎯 Next Immediate Tasks (from ROADMAP.md)

1. Pull-to-refresh on list views
2. Swipe-to-delete gestures
3. Long-press context menus
4. Loading states with shimmer
5. Empty states with illustrations
6. Image optimization

---

## 📞 Quick Commands Reference

```bash
# Development
npm run dev

# iOS Preview
npm run ios:dev

# Build
npm run build:prod

# Capacitor
npm run cap:sync
npm run cap:open

# Git
git status
git add -A
git commit -m "message"
git push
```

---

## 🎨 Color Palette Quick Reference

```
Purple Gradient Primary: #667eea → #764ba2
Success (Visited): #34C759
Destructive: #FF3B30
Warning: #FFCC00

Focus Ring: neutral gray (240 5% 84%)
Background Light: white
Background Dark: #000000 (true black, OLED optimized)
```

---

**Remember:** Purple theme everywhere, compact spacing, minimalistic style, smooth animations!
