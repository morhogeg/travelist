# Recent Improvements & Changes

## Day Editing Feature (Nov 2025)

### Feature
Users can now edit individual days in routes to customize labels and dates, providing flexibility beyond auto-calculated values.

### Key Capabilities
- **Edit Day Labels**: Add custom names like "Museum Day", "Beach Day", "Arrival Day"
- **Edit Day Dates**: Override auto-calculated dates with specific dates
- **Quick Access**: Edit button (pencil icon) on every day section
- **Clear Overrides**: Empty fields to remove customizations and revert to defaults

### Implementation Details

**New Component**: `EditDayDrawer.tsx`

Location: `/src/components/routes/EditDayDrawer.tsx`

```typescript
interface EditDayDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  day: RouteDay | null;
  onSave: (dayNumber: number, label: string, date: string) => void;
}
```

**New Function**: `updateDay(routeId, dayNumber, label, date)`

Location: `/src/utils/route/route-manager.ts` (Lines 348-374)

```typescript
export const updateDay = (
  routeId: string,
  dayNumber: number,
  label: string,
  date: string
): boolean => {
  const routes = getRoutes();
  const route = routes.find(r => r.id === routeId);

  if (!route) return false;

  const day = route.days.find(d => d.dayNumber === dayNumber);
  if (!day) return false;

  // Update label (empty string means remove custom label)
  day.label = label.trim() || undefined;

  // Update date (empty string means remove custom date)
  day.date = date.trim() || undefined;

  route.dateModified = new Date().toISOString();

  localStorage.setItem(ROUTES_STORAGE_KEY, JSON.stringify(routes));
  window.dispatchEvent(new CustomEvent("routeUpdated", { detail: route }));

  return true;
};
```

**Modified Components**:
- `DaySection.tsx` (Lines 250-257) - Added Edit button
- `RouteDetail.tsx` (Lines 129-144, 375-380) - Wired up drawer and handlers

### User Flow

1. User clicks pencil icon on day header
2. Edit drawer opens with current values
3. User modifies label and/or date
4. Click "Save Changes"
5. Day updates with new label/date
6. Changes persist and trigger route update event

### UI Elements
- Edit button with Edit2 icon (pencil)
- Ghost variant button (muted → primary on hover)
- Positioned before Add/Delete buttons
- Light haptic feedback on click
- Purple gradient save button

### Testing
- [x] Edit day label updates header
- [x] Edit day date overrides calculated date
- [x] Clear label reverts to default "Day X"
- [x] Clear date reverts to calculated date
- [x] Changes persist across sessions
- [x] Route modified timestamp updates
- [x] Haptic feedback works

### Benefits
- ✅ Customize day names for better organization
- ✅ Override dates when trip schedule changes
- ✅ Flexible beyond rigid start/end dates
- ✅ Easy to revert to defaults

---

## Completion-Based Route Status (Nov 2025)

### Feature
Routes now automatically move to "Completed" status when all places are marked as visited (100% progress), regardless of dates.

### Key Capabilities
- **Automatic Completion**: 100% visited → "Completed" status
- **Priority Status**: Completion overrides date-based status
- **New Section**: "Completed" section in Routes list
- **Smart Sorting**: Completed routes sorted by most recently completed

### Implementation Details

**Modified Type**: `RouteStatus`

Location: `/src/types/route.ts` (Line 38)

```typescript
export type RouteStatus = 'ongoing' | 'completed' | 'upcoming' | 'past' | 'undated';

export interface GroupedRoutes {
  ongoing: RouteWithProgress[];
  completed: RouteWithProgress[];  // NEW
  upcoming: RouteWithProgress[];
  past: RouteWithProgress[];
  undated: RouteWithProgress[];
}
```

**Modified Function**: `getRouteStatus(routeWithProgress)`

Location: `/src/utils/route/route-manager.ts` (Lines 372-416)

```typescript
export const getRouteStatus = (routeWithProgress: RouteWithProgress): RouteStatus => {
  // Check completion first - if 100% visited, it's completed regardless of dates
  if (routeWithProgress.progressPercentage === 100) {
    return 'completed';
  }

  // Otherwise use date-based logic
  // ... existing date logic
};
```

**Modified Pages**:
- `Routes.tsx` (Lines 15-19, 59-63, 151-155) - Added completed section

### Status Hierarchy

Routes organized in this order:
1. **Ongoing** - In-progress routes (dates current, not 100% complete)
2. **Completed** ✅ - All places visited (100% progress)
3. **Upcoming** - Future trips (start date not arrived)
4. **Undated** - No dates set
5. **Past** - End date has passed

### User Flow

1. User marks last place as visited in route
2. Route automatically moves to "Completed"
3. Completed section appears/updates on Routes page
4. Route stays completed even if dates change
5. Unchecking a place moves route back to previous status

### Testing
- [x] 100% visited routes show as "Completed"
- [x] Unchecking place moves back to "Ongoing"
- [x] Completed section shows on Routes page
- [x] Sorting by most recent completion works
- [x] Completion overrides date status

### Benefits
- ✅ Clear distinction between active and finished trips
- ✅ Easy to see which routes are done
- ✅ Completion-based organization makes sense
- ✅ Automatic status updates

---

## Seamless Multi-Step Route Creation (Nov 2025)

### Feature
Route creation is now a single seamless flow with 3 steps, eliminating the need to create a route and then go back in to add places.

### Problem Solved
**Before**: Broken flow with 3 redundant add buttons
- Create route → Go back in → Add places (2 separate steps)
- 3 different ways to add places (confusing)

**After**: Seamless 3-step flow
- Step 1: Route Details → Step 2: Select Places → Step 3: Review & Reorder → Done
- Single "Add Places" button in empty state
- Can reorder places before finalizing

### Key Capabilities
- **Step 1 - Route Details**: Name, city, optional dates
- **Step 2 - Select Places**: Multi-select with checkboxes and search
- **Step 3 - Review & Reorder**: Drag-and-drop to reorder before creating
- **Progress Indicator**: Shows current step (1 of 3, 2 of 3, 3 of 3)
- **Back Navigation**: Can go back between steps without losing selections
- **Place Details**: Click place names in Step 2 to view full info

### Implementation Details

**Completely Rewritten**: `CreateRouteDrawer.tsx`

Location: `/src/components/routes/CreateRouteDrawer.tsx` (673 lines)

```typescript
// Multi-step state management
const [currentStep, setCurrentStep] = useState(1);
const [selectedPlaceIds, setSelectedPlaceIds] = useState<Set<string>>(new Set());
const [orderedPlaces, setOrderedPlaces] = useState<PlaceOption[]>([]);

// Step 2: Select places with checkboxes
const handleTogglePlace = (placeId: string) => {
  setSelectedPlaceIds(prev => {
    const next = new Set(prev);
    if (next.has(placeId)) {
      next.delete(placeId);
    } else {
      next.add(placeId);
    }
    return next;
  });
};

// Step 3: Drag-and-drop reordering
const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;
  if (over && active.id !== over.id) {
    const oldIndex = orderedPlaces.findIndex(p => p.id === active.id);
    const newIndex = orderedPlaces.findIndex(p => p.id === over.id);
    setOrderedPlaces(arrayMove(orderedPlaces, oldIndex, newIndex));
    mediumHaptic();
  }
};

// Final creation navigates to new route
const handleCreateRoute = () => {
  const route = createRoute(...);
  orderedPlaces.forEach((place, index) => {
    addPlaceToRoute(route.id, 1, place.id, undefined);
  });
  navigate(`/routes/${route.id}`);
};
```

**Modified Components**:
- `DaySection.tsx` (Lines 257-278) - Hide "Add" button in header when empty

### UI Elements

**Step 1**:
- Route name input
- City selector (required)
- Optional start/end dates

**Step 2**:
- Search bar to filter places
- Checkbox for each place
- Click place name to view details
- Shows "X places selected"

**Step 3**:
- Drag handles (⋮⋮) for reordering
- Numbered list (1, 2, 3...)
- Category icons and colors
- Hint: "Long-press and drag to reorder places"

**Progress Bar**:
- 3 segments showing current step
- Filled segments = completed steps
- Primary color for active/completed

### Drag-and-Drop Details
- Touch-optimized: 250ms long-press, 5px tolerance
- Visual feedback: opacity + shadow while dragging
- Medium haptic on successful reorder
- Numbers auto-update after drop

### Testing
- [x] Step 1 validation (name + city required)
- [x] Step 2 multi-select with checkboxes
- [x] Place names clickable in Step 2
- [x] Step 3 drag-and-drop reordering
- [x] Back navigation preserves selections
- [x] Create navigates to new route
- [x] Places appear in correct order
- [x] Haptic feedback works

### Benefits
- ✅ One seamless flow, no back-and-forth
- ✅ Preview and reorder before finalizing
- ✅ See place details before adding
- ✅ Less confusing with single CTA

---

## Two-Way Visited State Sync (Nov 2025)

### Feature
Visited state now syncs bidirectionally between source recommendations and routes. Marking a place as visited anywhere updates it everywhere, ensuring consistent state across the entire app.

### Problem Solved
**Before**: Asymmetric sync caused confusion
- Mark visited in route → ✅ Updates source & route
- Mark visited on home → ❌ Only updates source, NOT routes
- Result: Same place shows different visited states in different contexts

**After**: Two-way sync for consistency
- Mark visited anywhere → ✅ Updates EVERYWHERE
- Same place always shows same visited state
- Clear, predictable user experience

### Key Capabilities
- **Bidirectional Sync**: Visited state updates in both directions
- **Universal Updates**: Mark visited anywhere = visited everywhere
- **Multiple Routes**: Updates all routes containing the place
- **Undo Support**: Undoing a visited action syncs correctly
- **Event Dispatching**: Routes update automatically via custom events

### Implementation Details

**New Function**: `syncVisitedStateToRoutes(recId, visited)`

Location: `/src/utils/route/route-manager.ts` (Lines 246-288)

```typescript
export const syncVisitedStateToRoutes = (recId: string, visited: boolean): void => {
  const routes = getRoutes();
  const recommendations = getRecommendations();

  // Build a map of place details for quick lookup
  const placesMap = new Map<string, any>();
  recommendations.forEach(rec => {
    rec.places.forEach(place => {
      if (place.id) {
        placesMap.set(place.id, place);
      }
    });
  });

  let updated = false;

  // Check each route for places matching the recId
  routes.forEach(route => {
    route.days.forEach(day => {
      day.places.forEach(placeRef => {
        const place = placesMap.get(placeRef.placeId);

        // Match by recId or id
        if (place && (place.recId === recId || place.id === recId)) {
          placeRef.visited = visited;
          updated = true;
          route.dateModified = new Date().toISOString();
        }
      });
    });
  });

  // Save and notify if any updates were made
  if (updated) {
    localStorage.setItem(ROUTES_STORAGE_KEY, JSON.stringify(routes));
    window.dispatchEvent(new CustomEvent("routeUpdated"));
  }
};
```

**Modified Components**:

1. **Index.tsx** (Lines 156-164, 190-203)
   - `handleToggleVisited`: Syncs to routes after marking visited
   - `handleDetailsToggleVisited`: Syncs from detail drawer

2. **useRecommendationActions.tsx** (Lines 136-173, 52-70)
   - `handleVisitedToggle`: Syncs when toggling from city/country views
   - `undoDelete`: Syncs when undoing visited state change
   - Used by CityGroup, CountryView, CategoryRecommendationsList

### User Scenarios

**Scenario 1: Mark visited on home screen**
1. User clicks visited checkbox on recommendation card
2. Source recommendation updated ✅
3. **All routes containing this place updated** ✅
4. Route detail views refresh automatically

**Scenario 2: Mark visited in route detail**
1. User clicks visited in route day section
2. Route updated ✅
3. Source recommendation updated ✅ (already implemented)
4. Other routes with same place also updated

**Scenario 3: Mark visited from country/city view**
1. User toggles visited in filtered view
2. Source updated ✅
3. All routes synced ✅
4. Toast shows with undo option

**Scenario 4: Undo visited action**
1. User clicks "Undo" on toast notification
2. Source recommendation reverted ✅
3. All routes reverted ✅
4. Consistent state maintained

### Edge Cases Handled

**Q: What if the same place is in multiple routes?**
A: All routes get updated with the same visited state

**Q: What if I undo a visited state change?**
A: Undo syncs to routes too, maintaining consistency

**Q: What about performance with many routes?**
A: Only iterates when visited state changes, minimal impact

### Testing
- [x] Mark visited on home → syncs to routes
- [x] Mark visited in route → syncs to source
- [x] Mark visited from city view → syncs to routes
- [x] Mark visited from country view → syncs to routes
- [x] Same place in multiple routes → all update
- [x] Undo visited action → all revert correctly
- [x] Route progress bars update automatically
- [x] No duplicate updates or infinite loops

### Benefits
- ✅ **Consistency**: Same visited state everywhere
- ✅ **Predictable UX**: No confusion about visited status
- ✅ **Common Use Case**: Mark visited after trip → updates all contexts
- ✅ **Undo Support**: Undo works correctly across contexts
- ✅ **Performance**: Efficient lookup with Map structure

---

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
