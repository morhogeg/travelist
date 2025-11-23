# Recent Improvements & Changes

## Clickable Attribution Navigation (Nov 2025)

### Feature
Friend/source names in recommendation detail drawers are now clickable, navigating to a filtered homepage showing all recommendations from that source, with easy back navigation to return to the original context.

### Key Capabilities
- **Clickable Friend Names**: Tap any friend/source name in attribution to filter by that source
- **Context-Aware Navigation**: Different behavior based on where drawer is opened
- **Back Navigation**: "Back to Route" button appears when navigating from route detail
- **State Management**: Uses React Router location state for clean navigation
- **Filter Preservation**: Automatically applies friend filter on navigation

### Implementation Details

**Modified Components**:
- `RecommendationDetail.tsx` - Added navigation logic based on current path
- `RecommendationDetailsDialog.tsx` - Passes current path context
- `Index.tsx` - Handles location state and shows back button

**Navigation Flow**:
1. User on `/routes/:id` clicks place name → opens drawer
2. Clicks friend name in attribution
3. Navigates to `/` with state: `{ filterSource: name, returnTo: '/routes/:id' }`
4. Home page applies filter and shows "Back to Route" button
5. Click back → returns to route detail

**Code Changes**:

`RecommendationDetail.tsx` (Lines 93-109):
```typescript
const handleSourceClick = (sourceName: string) => {
  // Check if we're on a route detail page
  if (currentPath && currentPath.startsWith('/routes/')) {
    // Navigate to home with filter state and return path
    navigate('/', {
      state: {
        filterSource: sourceName,
        returnTo: currentPath
      }
    });
    onClose?.();
  } else {
    // Apply filter for this friend (current behavior)
    window.dispatchEvent(new CustomEvent('sourceFilterChanged', { detail: sourceName }));
    onClose?.();
  }
};
```

`Index.tsx` (Lines 134-153):
```typescript
// Handle navigation state for filtering from route detail
useEffect(() => {
  const state = location.state as { filterSource?: string; returnTo?: string };
  if (state?.filterSource) {
    // Apply filter for the friend
    setFilters(prev => ({
      ...prev,
      sources: ['friend'],
      sourceNames: [state.filterSource]
    }));

    // Store return path
    if (state.returnTo) {
      setReturnToPath(state.returnTo);
    }

    // Clear the state to prevent re-applying on refresh
    window.history.replaceState({}, '');
  }
}, [location.state]);
```

**UI Elements**:
- Back button: Ghost variant with ArrowLeft icon + "Back to Route" text
- Positioned at top of home page, above search header
- Only shown when `returnToPath` exists
- Haptic feedback on click

### Behavior by Context

**From Route Detail Page**:
- Click friend name → Navigate to home with filter + back button
- Browser history maintained
- Can use browser back button

**From Home Page**:
- Click friend name → Apply filter via event system (current behavior)
- No navigation, drawer just closes
- Filter applied immediately

**From Other Pages**:
- Uses event-based system (fallback)
- No special navigation handling

### Design Consistency
- Purple gradient for friend names (existing)
- iOS 26 transition animations
- Medium haptic on back button click
- Matches existing back button patterns in app

### Testing
- [x] Click friend name from route detail → navigates with filter
- [x] Back button appears on home page
- [x] Click back button → returns to route
- [x] Click friend name from home page → applies filter (no navigation)
- [x] Browser history works correctly
- [x] State clears on refresh
- [x] Haptic feedback works
- [x] Filter chip shows friend name correctly

### Benefits
- ✅ Explore all recommendations from a friend while planning route
- ✅ Easy context switching without losing place
- ✅ Standard browser navigation patterns
- ✅ Clean state management with React Router

---

## Routes Feature (Nov 2025)

### Feature
Complete trip planning feature that allows users to create ordered itineraries from saved recommendations.

### Key Capabilities
- **Create Routes**: City-specific trip itineraries with optional dates
- **Multi-Day Support**: Add multiple days to routes
- **Drag-and-Drop Reordering**: Touch-optimized reordering of places within each day
- **Progress Tracking**: Visual progress bars showing visited/total places
- **Convert Collections**: One-click convert collections to ordered routes
- **Delete Days**: Remove empty days from routes
- **Status Grouping**: Routes organized as Upcoming, Ongoing, Past, or Undated

### Implementation Details

**New Components**:
- `Routes.tsx` - Main routes list page
- `RouteCard.tsx` - Individual route cards with progress
- `RouteDetail.tsx` - Full route view with day-by-day breakdown
- `DaySection.tsx` - Sortable day view with drag-and-drop
- `CreateRouteDrawer.tsx` - Route creation form
- `AddPlacesToRouteDrawer.tsx` - Place selection interface

**Data Layer**:
- `/src/types/route.ts` - TypeScript type definitions
- `/src/utils/route/route-manager.ts` - CRUD operations and event system
- localStorage with custom event dispatching

**Libraries Added**:
- `@dnd-kit/core` - Core drag-and-drop functionality
- `@dnd-kit/sortable` - Sortable list support
- `@dnd-kit/utilities` - Transform utilities

**Touch Optimization**:
- 250ms long-press activation delay
- 5px tolerance to prevent accidental drags
- Light haptic on drag start, medium on drop
- Visual feedback: opacity, shadow, cursor changes

**Navigation**:
- Added Routes tab to main navbar (4 tabs now)
- Routes at `/routes`
- Route detail at `/routes/:id`

### User Flows

**Create Route**:
1. Tap "+" floating button
2. Enter name, select city, optional dates
3. Auto-creates Day 1
4. Navigate to route detail

**Add Places**:
1. Tap "Add" on a day
2. Select places (city-filtered, checkboxes)
3. Places appear numbered in order

**Reorder**:
1. Long-press drag handle (⋮⋮)
2. Drag to new position
3. Numbers auto-update

**Convert Collection**:
1. Open collection detail
2. Tap "Create Route" button
3. Validates single city
4. Creates route with all places on Day 1

### Design Consistency
- Full iOS 26 Liquid Glass styling
- Purple gradient theme throughout
- Spring animations (120Hz optimized)
- Proper haptic feedback
- Empty states with illustrations
- Progress bars with smooth animations

### Testing
- [x] Create/edit/delete routes
- [x] Add/remove places
- [x] Drag-and-drop reordering
- [x] Multi-day support
- [x] Progress tracking
- [x] Collection conversion
- [x] Delete empty days
- [x] Navigation flow
- [x] Haptic feedback
- [x] Dark mode support

See [Routes Feature Guide](./routes-feature.md) for complete documentation.

---

## Clickable Cards (Nov 2025)

### Feature
Made all recommendation cards clickable to open detail dialog showing full attribution and context.

### Implementation
- Added `onViewDetails` prop chain through entire component hierarchy
- Cards now open `RecommendationDetailsDialog` on click
- Works in both grid and list views

### Key Changes
- **GridView.tsx**: Pass `onViewDetails` to RecommendationItem
- **ListView.tsx**: Added `onClick` to card container
- **RecommendationItem.tsx**: Added `onClick` and `cursor-pointer` styling
- **Index.tsx**: Added dialog state and handlers

### Testing
Click any card in grid or list view → should open dialog with full details

---

## List View Context Display (Nov 2025)

### Feature
Enhanced list view to show attribution context (tips & tags) instead of just location/description.

### What Shows in List View

**Home Page:**
- 📍 Location (City, 🇮🇱 Country)
- 💡 Specific tip (if available, amber text)
- Occasion tags (if available, purple badges)
- Description (fallback if no tip)

**Country Page:**
- 💡 Specific tip (if available, amber text)
- Occasion tags (if available, purple badges)
- Description (fallback if no tip)
- ❌ Location hidden (redundant in country view)

### Implementation Details

**ListView.tsx structure:**
```typescript
<div className="mt-1 mb-2 space-y-1.5">
  {/* Location - only if not in country view */}
  {!hideCountry && (item.city || item.country) && (
    <div className="flex items-center gap-1">
      <MapPin />
      <span>{city}, {flag} {country}</span>
    </div>
  )}

  {/* Specific Tip */}
  {item.context?.specificTip && (
    <p className="text-amber-700">
      💡 {item.context.specificTip}
    </p>
  )}

  {/* Occasion Tags */}
  {item.context?.occasionTags?.length > 0 && (
    <div className="flex flex-wrap gap-1">
      {tags.map(tag => (
        <span className="purple-badge">{tag}</span>
      ))}
    </div>
  )}

  {/* Description fallback */}
  {item.description && !item.context?.specificTip && (
    <p>{item.description}</p>
  )}
</div>
```

### Styling
- **Tips**: Amber text (#f59e0b) with 💡 emoji
- **Tags**: Purple badges (bg-purple-100, text-purple-700)
- **Layout**: Stack vertically with gap-1.5

---

## Country View UX Improvements (Nov 2025)

### Changes
1. Removed red pin (📍) from country header
2. Removed redundant country info from list cards
3. Replaced with useful context (tips & tags)

### Before & After

**Before:**
```
📍🇮🇱 Israel          (header)
📍 Beer Sheba, 🇮🇱 Israel  (in each card)
```

**After:**
```
🇮🇱 Israel            (header)
💡 Must try the pizza     (in card)
[Date night] [Special occasion]
```

### hideCountry Prop
New prop to conditionally hide country info:
- Added to: CategoryResults, CountryGroup, CityGroup, ListView
- Default: `false` (show country)
- CountryView sets to `true`

---

## Data Flow: Attribution to Display

### Storage → Display Pipeline

1. **Form Input**
   - SourceInput.tsx / ContextInput.tsx
   - User enters tips, tags, source info

2. **Save**
   - structured-recommendation.ts
   - Creates place object with source/context fields
   - recommendation-manager.ts saves to localStorage

3. **Load & Transform**
   - getRecommendations() loads from localStorage
   - filter-helpers.ts transforms for display
   - **Critical**: Must preserve source/context fields

4. **Display**
   - GridView / ListView receives full data
   - RecommendationItem / ListView shows attribution
   - RecommendationDetailsDialog shows full details

### Common Bug: Missing Attribution
If attribution doesn't show:
1. Check localStorage has the data
2. Check filter-helpers.ts includes source/context in return object
3. Check city-helpers.ts includes source/context
4. Check structured-recommendation.ts saves the fields
5. Use console.log to trace data through pipeline

---

## Sorting (Implemented)

Cards are sorted in this order:
1. **Visited status**: Unvisited first
2. **Date added**: Newest first (within each visited/unvisited group)

Implementation in:
- `filter-helpers.ts` lines 68-71
- `CountryGroupList.tsx` lines 35-38

---

## Design System Colors

### Attribution Colors
- **Purple**: `#667eea` → `#764ba2` (gradient)
  - Source attribution
  - "Recommended by" text
  - Occasion tag badges
  - Source icon on cards

- **Amber**: `#f59e0b` / `text-amber-700`
  - Specific tips
  - Important context highlights

- **Success**: Green ring on visited cards

### Liquid Glass Theme
- Background: `liquid-glass-clear` class
- Cards: Rounded corners, subtle shadows
- Smooth transitions: `ios26-transition-smooth`
- Spring animations: `ios26-transition-spring`

---

## Testing Checklist

### Attribution System
- [ ] Add recommendation with source info → saves correctly
- [ ] Add recommendation with tips → shows in list view
- [ ] Add recommendation with tags → shows as badges
- [ ] Click card → opens detail dialog
- [ ] Detail dialog shows all attribution data
- [ ] Search includes tips and source names

### Country View
- [ ] Navigate to country page
- [ ] Header shows only flag (no pin)
- [ ] List cards show tips, not country
- [ ] Tags display as purple badges
- [ ] Location info hidden

### Home View
- [ ] List cards show location + tips + tags
- [ ] Grid cards show attribution badge
- [ ] Click any card opens dialog
- [ ] Sorting: unvisited first, then by date

---

## Known Issues & Solutions

### Blank Screen After Build
**Cause**: Capacitor not synced with production build

**Solution**:
```bash
npm run build
NODE_ENV=production npx cap sync ios
```

### Attribution Not Saving
**Cause**: structured-recommendation.ts not including fields

**Solution**: Ensure newPlace object includes:
```typescript
const newPlace = {
  // ... other fields
  source: values.source,
  context: values.context,
};
```

### Props Not Reaching Child
**Cause**: Missing from prop chain

**Solution**: Check each level:
1. Interface includes prop
2. Component receives prop in destructuring
3. Component passes prop to child

---

## Future Enhancements

### Short-term
- [ ] Auto-attribution from text parsing
- [ ] Filter by occasion tags
- [ ] Source statistics page

### Long-term
- [ ] Timeline view of when recommendations were received
- [ ] Export recommendations with attribution
- [ ] Share recommendations with attribution data
- [ ] Integration with Instagram/social APIs for auto-import
