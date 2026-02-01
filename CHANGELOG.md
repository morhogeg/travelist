# Changelog

All notable changes to the Travelist iOS app will be documented in this file.

---

## [Build 8] - 2026-02-01 (Unreleased)

### ✨ Added
- **Onboarding Value Proposition Improvements**
  - **New "Problem" Screen**: Establish context by highlighting the frustration of losing track of travel finds
  - **Solution-Centric Welcome**: Reframed the welcome screen to present Travelist AI as the smart solution
  - **Streamlined Flow**: Updated the onboarding sequence to 8 steps for better psychological anchoring
  - **Premium Navigate Icons**: Replaced emoji map icons with professional SVG logos for Google and Apple Maps
  - **Navigate Screen Wording**: Improved screen text to be more action-oriented and premium
- **AI Features Transparency**
  - **AI Settings Hub**: New section in Settings for model status and provider info
  - **Data Privacy Dialog**: "How we use your data" explanation of data usage policies
  - **Transparent Attribution**: Added "POWERED BY TRAVELIST AI" badges to all suggestion sections
  - **Enhanced AI Error Handling**: Improved retry UI and persistence logic for AI service failures
- **Routes & Collections Merger (Phase 2)**
  - **Route Mode**: Collections now support a dedicated "Route Mode" for trip planning
  - **Enhanced Collection Cards**: Polished card design to match the home screen's liquid glass aesthetic
  - **Collection Renaming**: Integrated renaming functionality directly in the detail view
  - **Place Categorization**: Collection items now display category icons and colors consistently
- **AI Trip Planning Enhancements**
  - **Opt-in Trip Saving**: AI-generated trips no longer auto-save; users now see a preview page after generation
  - **Trip Preview Page**: Review the complete itinerary before choosing to save or discard
  - **Collection Filtering**: Added filter toggle to Collections tab (All / Collections Only / AI Trips Only)
  - **Explicit User Control**: Users decide what to keep, reducing clutter and improving organization
- **Centralized iOS Safe Area Handling**
  - **Central Layout Padding**: Moved safe-area logic to `Layout.tsx` for consistent protection across all tabs
  - **Native Viewport Fit**: Backgrounds now flow behind the status bar and notch for a more premium look
  - **Improved Capacitor Settings**: Optimized `contentInset` behavior to eliminate unwanted layout shifts

### 🐛 Fixed
- **AI Description Button Not Working** - Fixed "Get info from Travelist AI" button that was silently failing
  - Increased `max_tokens` from 60 to 500 to accommodate reasoning model's internal processing
  - Added visible error messages when AI generation fails (no longer silent failure)
  - Added retry logic with exponential backoff for rate-limited requests
  - Improved prompt to generate richer, more helpful 1-2 sentence descriptions
- **Collection Deletion Logic**: Fixed a bug where deleting a collection didn't always reflect in the UI immediately
- **Top Layout Gaps**: Eliminated the white gap at the top of the Home screen and other tabs

---

## [Build 7] - 2026-01-26 (Unreleased)

### ✨ Added
- **Free AI Models** - Switched to high-performance free models from OpenRouter to ensure zero API costs
  - **Parsing**: `google/gemma-3-27b-it:free` for accurate extraction from shared links
  - **Suggestions**: `meta-llama/llama-3.3-70b-instruct:free` for personalized recommendations
  - **Trip Planning**: `google/gemma-3-27b-it:free` for optimizing itineraries
- **Freeform Text Input** - Add recommendations from Instagram, friends, or any text source
  - **In-App "+" Button**: Opens drawer with textarea for pasting/typing recommendations
  - **AI Text Parser**: Automatically extracts place names, cities, tips, and sources from natural language
  - **Share Extension Support**: Share text directly from other apps to Travelist
  - **Auto-Detection**: System automatically routes URLs vs text to appropriate AI parsers
  - **Multi-Language Support**: Preserves original language in tips (Hebrew, English, etc.)
- **Source Attribution System** - Track recommendation origins with full attribution
  - **5 Source Types**: Friend (with name input), Instagram, TikTok, Article, Other
  - **Friend Name Suggestions**: Shows previously used friend names as quick-select pills
  - **Optional URLs**: Instagram/TikTok/Article sources include optional source URL field
  - **AI Auto-Detection**: Extracts sources from text like "via @username" or "my friend Sarah"
  - **Visual Indicators**: Source info displayed on recommendation cards
- **Multi-Place Support** - Extract and save multiple places from one text
  - **Tabbed Review Interface**: Each extracted place gets its own tab for individual editing
  - **Individual Save**: Save places one at a time, not in batch
  - **Progress Badges**: Inbox items show count badge (e.g., "2 places") for multi-place entries
  - **Smart Workflow**: After saving a place, it's removed from drawer; item auto-deleted when all places saved
  - **Use Case**: Perfect for "Top 10" articles or multi-recommendation texts from friends

### 🐛 Fixed
- **Google Maps City/Country Extraction** - Fixed parsing for URLs without country
  - URLs like "Villa Mare, Derech Ben Gurion 69, Bat Yam" now correctly set city: "Bat Yam", country: "Israel"
  - AI now checks if last segment is a city (not always a country) and infers country from known city names
  - Added comprehensive list of Israeli cities for automatic country detection
- **AI Response Parsing** - Fixed JSON parsing bug where AI responses with prefix characters (`: ` or `→`) failed to parse
- **Fallback AI Models** - Updated to currently available free models after previous ones became unavailable/rate-limited
- **AI Description Hallucinations** - Made description generator much more conservative
  - No longer guesses cuisine types (was saying "Colombian restaurant" for an Israeli pizza place)
  - Only mentions food types when explicitly in the place name (e.g., "Joe's Pizza" → pizza OK)

### 🔧 Changed
- **"Blog" Source Renamed to "Article"**: More accurate terminology for written content sources
- **App Store Preparation** - Codebase cleanup for production readiness
  - **Bundle Size**: Reduced by ~1MB through removal of 11 unused UI components and 72 unused npm packages
  - **Production Logging**: Added `logger.ts` utility to suppress debug logs in production builds
  - **Code Quality**: Removed Xcode backup files, updated .gitignore and ESLint configurations
  - **Performance**: Configured Vite to strip console.log statements from production builds

---

## [Build 6] - 2026-01-20

### ✨ Added
- **Mobile-to-IDE Bridge (Antigravity)** - Trigger AI tasks directly from your iPhone
  - **Issue Trigger**: Create a GitHub issue with `@Gemini-bot` to start a task
  - **Comment Trigger**: Tag the bot in any comment to request changes
  - **Mission Reports**: Get automated summaries of AI work directly in GitHub
  - **"Plan Only" Mode**: Request technical research or plans without code changes
- **Premium Guides & Tutorials Area** - Centralized help content in a dedicated section
  - **New Guides Page**: Accessible from Profile, focusing on feature discoverability
  - **Redesigned "Saving from other apps" Guide**: A full-screen, immersive tutorial
  - **Onboarding Consistency**: Guides now match the onboarding flow's design, animations, and button styles
- **Smart Duplicate Detection** - Keeps your travel cards organized across shares
  - **URL Matching**: Automatically merges duplicate shares from the same Google Maps link
  - **Normalized Name Matching**: Ignores case, whitespace, and special characters
  - **Inclusion Matching**: Detects and merges similar names (e.g., "The Coffee Shop" vs "The Coffee Shop - City Center")
- **Improved Country Extraction** - Significantly reduced "Needs Info" cards for Google Maps shares
  - **AI Inference**: AI now uses URL paths, TLDs, and recognized city names to automatically fill in the country
  - **Local Fallback**: Enhanced local URL parsing to extract location details from Google Maps paths

### 🐛 Fixed
- **Profile Page Lint Error**: Resolved a persistent type error regarding `visited` state access
- **Share Extension UI Fixes**: Fixed icon overflow and layout issues on smaller devices
- **Plugin Registration**: Improved reliability of native plugin registration in Capacitor 7

### 🔧 Changed
- **Settings Cleanup**: Removed redundant guide links from Settings to focus on preferences
- **Profile Subtitle**: Updated to "Learn how to use Travelist AI" for better clarity
- **Navigation Buttons**: Standardized guide navigation to match onboarding (Vertical stack: Next Step / Back)

---

## [Build 5] - 2026-01-18

### ✨ Added
- **Complete Onboarding Redesign** - A focused 7-step flow highlighting the app's top features
  - **New Welcome Screen**: Clearly explains the app's purpose as your "Personal Travel Memory"
  - **Share to Save & AI Parsing**: Combined screen showing how to save from any app with automatic detail extraction
  - **AI Magic**: Showcases freeform text-to-card generation ("Just type what you heard")
  - **Proximity Alerts**: Introduces the "Never Miss a Spot" notification feature
  - **Refined Gestures**: Polished swipe tutorial for organizing places
  - **Enhanced Navigation**: Impactful "Export to Maps" presentation
- **Onboarding Reset for Testing**: Added `resetOnboarding` event for developers to re-trigger the flow

### 🔧 Changed
- **Premium Aesthetic**: Updated all onboarding screens with the "Liquid Glass" and "Purple Gradient" design system
- **Streamlined Flow**: Reduced onboarding from 8 to 7 steps by consolidating redundant share slides
- **Cleaned Up Codebase**: Removed 4 deprecated onboarding screen files

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
