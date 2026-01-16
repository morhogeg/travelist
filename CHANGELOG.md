# Changelog

All notable changes to the Travelist iOS app will be documented in this file.

---

## [Unreleased] - Next TestFlight Build

> **Instructions:** Add features/fixes here as they're completed. Move to versioned section when TestFlight is uploaded.

### ✨ Added
- (none yet)

### 🐛 Fixed
- (none yet)

### 🔧 Changed
- (none yet)

---

## [Build 4] - 2026-01-16

### ✨ Added
- **App Rebranding** - Renamed app to **Travelist AI** throughout the UI
- **Home View Search Bar Redesign** - Replaced expandable search icon with an always-visible search bar for better discoverability
- **Scroll Fade Effect** - Header and search bar now fade out elegantly as you scroll down
- **Dynamic Country Search** - Replaced static dropdown with a searchable autocomplete field in recommendation forms
- **AI Place Descriptions** - Added "Get info from Travelist AI" to generate descriptions for places without them
- **External Source Links** - Added "Recommendation Source" links to easily visit the origin of a recommendation
- **Recommendation Details Dialog Refinement** - Complete overhaul for a more compact, iOS-native feel
  - **Isolated AI Feature**: AI generation now stands alone at the top
  - **Logical Grouping**: Source and Website links are grouped together near action buttons
  - **Toned Down Actions**: Changed "Add" and "Edit" to ghost buttons (text-only) for better visual balance
  - **Removed Clutter**: Removed "Mark Visited" button (handled via swipe gestures in lists)
  - **Destructive Action Separation**: Moved "Delete" to the bottom of the action group
  - **Ultra-Compact Layout**: Aggressively reduced spacing, padding, and button heights
- **Proximity Notifications** - Get notified when near saved places
  - Custom distance slider (100m - 2km) in Settings
  - Per-city enable/disable toggles via "Manage Cities" drawer
  - Notification tap opens place card → Navigate button opens Maps
  - Background location monitoring with battery-efficient settings

### 🐛 Fixed
- **Website Field Persistence** - Fixed bug where the "Official Website" field was not saving or displaying correctly
- FAB no longer shows when proximity place card is open
- Source name filter now works for all source types (was hardcoded to "friend" only)
- Source names now properly capitalized (e.g., "Article" not "article")
- AI parser now extracts tips from phrases like "recommending pizza at X"
- **Eliminated blue tap highlights** - Changed accent color from iOS System Blue to app purple
- **Filter drawer now reflects applied filters** - Clicking source from card highlights in drawer
- **Friend filter shows only actual friend names** - Excludes source types like AI or generic categories
- **Filter count fixed** - No longer double-counts when source type and name match
- **Unchecking source type clears matching source name** - Consistent filter state
- **SharedInboxPlugin UNIMPLEMENTED error** - Fixed Capacitor 7 plugin registration (manual registration in MyViewController required)
- **Inbox card pink highlight removed** - Cards now use subtle neutral background instead of pink/purple gradient

### 🔧 Changed
- **Labeling Clarity**: Renamed "Website" to "Official Website" in forms to distinguish from recommendation sources

---

## [2025-11-26] - Collection & Route Management Enhancements

### Profile Page Polish
- **Purple icons**: Changed action row icons from blue to purple (#667eea) to match app theme
- **Unified action list**: Merged Collections, Routes, Settings, and Welcome Tour into single list
- **Compact header**: Reduced logo from 56px → 48px, title from 28px → 24px
- **Compact stats**: Reduced stat numbers from 30px → 24px, tightened padding and margins
- **Consistent theming**: Progress percentage now uses purple instead of blue

### Create Collection Drawer Enhancements
- **Category filter pills**: Added category pills matching other drawers (All, Food, Attractions, etc.)
- **Simplified place items**: Replaced large icon boxes with border-left-4 style and small category icons
- **Purple gradient checkboxes**: Consistent checkbox styling with other drawers
- **Proper disabled button**: Gray when no name entered, purple gradient when valid
- **FAB visibility**: Hide FAB when Create Collection drawer is open

### Bug Fixes
- **Blank screen on homescreen cards**: Fixed React hooks violation where `useNavigate()` and `useLocation()` were called after early return in RecommendationDetailsDialog
- **Collection not updating**: Added `collectionUpdated` event dispatching to collectionStore and event listeners in CollectionDetailPage
- **Drawer closing prematurely**: Added `type="button"` to buttons in AddToCollectionPicker to prevent form submission

### Collection Detail Page
- **Swipe-to-delete**: Added SwipeableCard wrapper for removing places from collection
- **Add places FAB**: New floating action button to add places to collection
- **AddPlacesToCollectionDrawer**: New drawer component for selecting places to add
  - Search functionality
  - Category filter pills with purple gradient styling
  - Purple gradient checkboxes for selection
  - Already-in-collection indicators
  - Disabled state styling for "Add Places" button (gray when no selection)

### Route Management
- **AddPlacesToRouteDrawer enhancements**:
  - Added category filter pills (matching collection drawer)
  - Removed "x selected" label (count shown in button)
  - Removed blue highlight on selection
  - Purple gradient checkboxes
  - Proper disabled button styling

### UI Polish
- **Borderless sections**: Removed borders from Profile, Collections, and Routes pages for cleaner look
- **Centered dividers**: Added subtle divider lines between collection/route items
- **FAB visibility**: FAB hides when drawers are open
- **Scrollbar hidden**: Category filter chips use scrollbar-hide class

### Files Modified
- `src/components/home/RecommendationDetailsDialog.tsx` - Hook order fix
- `src/components/recommendations/forms/AddToCollectionPicker.tsx` - Button type fix
- `src/pages/collections/CollectionDetailPage.tsx` - Swipe-to-delete, FAB, drawer integration
- `src/utils/collections/collectionStore.ts` - Event dispatching
- `src/components/routes/AddPlacesToRouteDrawer.tsx` - Category pills, styling fixes
- `src/pages/Profile.tsx` - Borderless sections
- `src/components/collections/CollectionsTab.tsx` - Borderless sections, dividers
- `src/components/routes/RouteCard.tsx` - Divider styling
- `src/components/ui/drawer.tsx` - Flex layout fix

### New Files
- `src/components/collections/AddPlacesToCollectionDrawer.tsx` - New drawer for adding places to collections

---

## [2025-11-24] - Design Consistency Across All Screens

### Cross-App Design Standardization

Following the home screen redesign, this update ensures consistent design standards across all app screens.

#### FAB Button Standardization
- **CountryView**: Updated FAB from 64px → 56px with icon 28px → 24px
- **PlaceDetail**: Updated FAB from 64px → 56px with icon 28px → 24px
- **Routes**: Updated FAB from 64px → 56px (icon was already correct at 24px)
- **Result**: All floating action buttons now use consistent 56px size (w-14 h-14) with 24px icons (h-6 w-6)

#### Typography Consistency
- **Routes page**: Updated header from text-3xl (30px) → text-[28px] with tracking-[-0.01em]
- **Settings page**: Updated header from text-3xl (30px) → text-[28px] with tracking-[-0.01em]
- **Result**: All main page headers now use consistent 28px semibold font with refined letter-spacing

#### Design Audit Findings
- ✅ Purple gradient usage consistent across all screens
- ✅ Category pills standardized at 13px font, px-3 padding
- ✅ Action icons consistent at 14px (h-3.5 w-3.5)
- ✅ Chevrons consistent at 16px (h-4 w-4)
- ✅ Search/Filter icons consistent at 20px (h-5 w-5)
- ✅ Country headers: 17px semibold
- ✅ City headers: 16px medium
- ✅ Place names: 16px semibold

### Files Modified
- `src/pages/CountryView.tsx` - FAB button size
- `src/pages/place-detail/PlaceDetail.tsx` - FAB button size
- `src/pages/Routes.tsx` - FAB button size and page header typography
- `src/pages/Settings.tsx` - Page header typography

---

## [2025-11-24] - Home Screen Design Refinement

### Major UI/UX Improvements

#### Visual Hierarchy & Typography
- **Header**: Reduced "Travelist" header from 34px bold → 28px semibold with refined letter-spacing for a more elegant appearance
- **Country headers**: Optimized to 17px semibold with flag emoji and item count
- **City headers**: Set to 16px medium weight (lighter than country for clear hierarchy)
- **Place names**: Maintained at 16px semibold for content emphasis
- **Chevrons**: Reduced from 20px → 16px for better visual balance

#### Space Efficiency
- **Card height reduction**: ~40% reduction (from 100-120px → 60-70px per card)
  - Moved action buttons (visited/directions) from bottom to right side in vertical layout
  - Removed gradient divider
  - Tightened internal spacing (space-y-1.5 → space-y-1)
  - Reduced padding (py-2.5 → py-2)
- **Country spacing**: Halved from 48px → 24px between country groups
- **Card spacing**: Reduced from 16px → 12px between cards
- **Result**: 50% more content visible on screen without scrolling

#### Action Icons
- **Size refinement**: Reduced from 20px → 16px → 14px based on proportional testing
- **Layout**: Changed from horizontal bottom layout to vertical right-side layout
- **Final size**: 14px (h-3.5 w-3.5) for optimal balance with text content

#### Navigation & Controls
- **Search & Filter**: Converted to icon-only buttons (removed liquid-glass backgrounds)
- **Filter button**: Relocated from category row to top-right corner (opposite search icon)
- **FAB button**: Reduced from 64px → 56px with icon size 28px → 24px
- **FAB visibility**: Now hides when filter drawer is open, returns when closed

#### Category Pills
- **Discoverability**: Always show "More" button when >3 categories exist
- **Sizing**: Reduced font 14px → 13px, padding px-3.5 → px-3, gap-2 → gap-1.5
- **Layout**: Moved left (pl-3) to ensure "X More" button fully visible
- **Sheet component**: Created CategorySheet for multi-select category picking

#### Brand Consistency
- **Purple gradient**: Applied throughout UI - `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
  - Active category pills
  - FAB button
  - "Add Recommendation" buttons (both FreeTextForm and StructuredInputForm)
  - Header text gradient
  - Active filter badges

#### Sorting & Organization
- **Countries**: Alphabetically sorted
- **Cities**: Alphabetically sorted within each country
- **Collapsible sections**: Both country and city levels with smooth animations

### Technical Changes

#### New Components
- `src/components/home/categories/CategorySheet.tsx` - Full-screen category picker with multi-select

#### Modified Components
- `src/components/home/search/SearchHeader.tsx` - Icon-only search, filter button integration
- `src/components/home/filters/FilterButton.tsx` - Removed glass background
- `src/components/home/categories/CategoriesScrollbar.tsx` - Show 3 visible + More button
- `src/components/home/category/CountryGroupList.tsx` - Alphabetical sorting, reduced spacing
- `src/components/home/category/CountryGroup.tsx` - Typography and chevron size updates
- `src/components/home/category/CityHeader.tsx` - Lighter typography, smaller chevrons
- `src/components/home/category/recommendation-item/RecommendationItem.tsx` - Compact card layout redesign
- `src/components/home/category/recommendation-item/ItemActions.tsx` - Vertical action layout
- `src/components/home/category/GridView.tsx` - Tightened card spacing
- `src/components/ui/CategoryPill.tsx` - Refined sizing
- `src/components/recommendations/forms/FreeTextForm.tsx` - Purple gradient button
- `src/pages/Index.tsx` - Filter integration, FAB visibility logic, category row padding

### Design Principles Applied
- **iOS 26 native feel**: System-appropriate interactions, 44pt touch targets, ProMotion animations
- **Hierarchy through contrast**: Using both size AND weight differences for clear visual hierarchy
- **Space efficiency**: Maximize content visibility while maintaining breathing room
- **Brand consistency**: Purple gradient identity throughout the app
- **Progressive disclosure**: Collapsible sections, category sheet for advanced filtering
