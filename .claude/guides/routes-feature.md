# Routes Feature Guide

## Overview

Routes allow users to create ordered itineraries from their saved recommendations. Users can plan single-day or multi-day trips, organize places in a specific order, and track their progress during the trip.

**Key Concept**: Routes = City-specific, ordered lists of places to visit

---

## Feature Capabilities

### Core Features
- ✅ Create routes for a specific city
- ✅ Single-day or multi-day trip support
- ✅ Drag-and-drop reordering of places
- ✅ Mark places as visited within the route
- ✅ Track progress (X of Y places visited)
- ✅ Convert collections to routes
- ✅ Add/remove days dynamically
- ✅ Delete empty days
- ✅ Optional date ranges

### Constraints
- Routes are **city-specific** (cannot mix cities in one route)
- Days can only be deleted if **empty** (no places)
- At least **one day** must remain in the route

---

## Data Architecture

### TypeScript Types
Location: `/src/types/route.ts`

```typescript
interface Route {
  id: string;
  name: string;
  cityId: string;
  city: string;
  country: string;
  startDate?: string;    // ISO format
  endDate?: string;      // ISO format
  days: RouteDay[];
  dateCreated: string;
  dateModified: string;
}

interface RouteDay {
  dayNumber: number;     // 1-indexed
  date?: string;         // ISO format
  label?: string;        // e.g., "Arrival Day"
  places: RoutePlaceReference[];
}

interface RoutePlaceReference {
  placeId: string;       // references RecommendationPlace.id
  order: number;         // position in day (0-indexed)
  notes?: string;        // day-specific notes
  visited: boolean;      // visited status for this route
}
```

### Helper Types
```typescript
interface RouteWithProgress extends Route {
  totalPlaces: number;
  visitedPlaces: number;
  progressPercentage: number;
}

type RouteStatus = 'upcoming' | 'ongoing' | 'past' | 'undated';

interface GroupedRoutes {
  upcoming: RouteWithProgress[];
  ongoing: RouteWithProgress[];
  past: RouteWithProgress[];
  undated: RouteWithProgress[];
}
```

---

## Route Manager Functions

Location: `/src/utils/route/route-manager.ts`

### CRUD Operations
```typescript
// Create
createRoute(name, cityId, city, country, startDate?, endDate?) → Route
createRouteFromCollection(name, cityId, city, country, placeIds[]) → Route

// Read
getRoutes() → Route[]
getRouteById(routeId) → Route | null
getRoutesByCity(cityId) → RouteWithProgress[]
getGroupedRoutes() → GroupedRoutes

// Update
updateRoute(routeId, updates) → boolean
addPlaceToRoute(routeId, dayNumber, placeId, notes?) → boolean
removePlaceFromRoute(routeId, dayNumber, placeId) → boolean
reorderPlacesInDay(routeId, dayNumber, reorderedPlaces[]) → boolean
markRoutePlaceVisited(routeId, dayNumber, placeId, visited) → boolean

// Day Management
addDayToRoute(routeId, date?, label?) → boolean
removeDayFromRoute(routeId, dayNumber) → boolean

// Utils
calculateRouteProgress(route) → RouteWithProgress
getRouteStatus(route) → RouteStatus
validateRoutePlaces(routeId) → boolean
```

### Event System
Route manager dispatches custom events:
- `routeCreated` - When a new route is created
- `routeUpdated` - When route data changes
- `routeDeleted` - When a route is removed

Components listen to these events to refresh data.

---

## Component Hierarchy

### Routes List Page
```
Routes.tsx
  └─ CreateRouteDrawer.tsx
  └─ RouteCard.tsx (for each route)
```

### Route Detail Page
```
RouteDetail.tsx
  ├─ AddPlacesToRouteDrawer.tsx
  └─ DaySection.tsx (for each day)
      └─ SortablePlaceItem (for each place)
          └─ DndContext (drag-and-drop)
```

---

## Component Details

### 1. Routes.tsx (Main List View)

**Purpose**: Display all routes grouped by status

**State**:
- `groupedRoutes: GroupedRoutes` - Routes organized by status
- `isCreateDrawerOpen: boolean` - Create route drawer state

**Key Features**:
- Groups routes: Ongoing → Upcoming → Undated → Past
- Shows route count per section
- Displays progress bars on cards
- Floating "+" button for creating routes
- Empty state for first-time users

**Styling**:
- iOS 26 Liquid Glass cards
- Purple gradient theme
- Section headers with icons
- Progress bars with animations

---

### 2. RouteCard.tsx

**Purpose**: Individual route card in list view

**Props**:
```typescript
{
  route: RouteWithProgress;
  onClick: () => void;
}
```

**Displays**:
- Route name
- City & country
- Date range (if set)
- Multi-day badge (if > 1 day)
- Progress bar (X of Y visited)
- Progress percentage

**Interactions**:
- Tap card → Navigate to RouteDetail
- Haptic feedback on tap
- Scale animation (whileTap)

---

### 3. RouteDetail.tsx

**Purpose**: Full route view with day-by-day breakdown

**State**:
- `route: Route | null` - Current route data
- `places: Map<string, RecommendationPlace>` - Place details lookup
- `isAddDrawerOpen: boolean` - Add places drawer
- `selectedDayNumber: number` - Which day to add places to
- `isDeleteDialogOpen: boolean` - Delete confirmation
- `selectedPlaceDetails: Recommendation | null` - Place detail drawer state
- `selectedPlaceNotes: string | undefined` - Route-specific notes for place

**Key Handlers**:
```typescript
handleAddPlaces(dayNumber)      // Open drawer to add places
handleToggleVisited(day, place) // Mark place as visited
handleRemovePlace(day, place)   // Remove place from day
handleReorderPlaces(day, places) // Drag-and-drop reorder
handleAddDay()                  // Add new day
handleRemoveDay(dayNumber)      // Delete empty day
handleDeleteRoute()             // Delete entire route
handlePlaceClick(placeId)       // Open place details drawer (NEW)
handleToggleVisitedFromDrawer() // Sync visited state for route & source (NEW)
```

**Layout**:
1. Header (back button, delete button)
2. Route info card (name, location, dates, progress)
3. Day sections (one per day)
4. "Add Another Day" button

---

### 4. DaySection.tsx

**Purpose**: Single day view with sortable places

**Props**:
```typescript
{
  route: Route;
  day: RouteDay;
  places: Map<string, RecommendationPlace>;
  onAddPlaces: () => void;
  onToggleVisited: (day, place, visited) => void;
  onRemovePlace: (day, place) => void;
  onReorderPlaces: (day, places[]) => void;
  onRemoveDay: (day) => void;
  onPlaceClick: (placeId) => void;  // NEW: Opens place detail drawer
}
```

**Features**:
- **Header**: Day label, date, Add button, Delete button (if empty)
- **Places List**: Sortable with drag handles
- **Empty State**: Prompt to add first place
- **Drag-and-Drop**: Touch-optimized reordering

**Delete Day Logic**:
```typescript
// Shows delete button only if:
route.days.length > 1 && sortedPlaces.length === 0
```

---

### 5. SortablePlaceItem (Sub-component of DaySection)

**Purpose**: Individual draggable place item

**Features**:
- **Drag Handle**: ⋮⋮ icon for touch dragging
- **Order Number**: Auto-updated badge (1, 2, 3...)
- **Category Icon**: Colored category indicator
- **Place Info**: Name, description, notes
- **Actions**: Visit checkbox, delete button

**Visual States**:
- Normal: White/card background
- Visited: Success green tint
- Dragging: 50% opacity, elevated shadow

**Drag Configuration**:
```typescript
TouchSensor: {
  activationConstraint: {
    delay: 250,      // Long-press delay
    tolerance: 5,    // Movement tolerance
  }
}
```

---

### 6. CreateRouteDrawer.tsx

**Purpose**: Bottom drawer for creating new routes

**Form Fields**:
- Route name (required)
- City selection (required, dropdown)
- Start date (optional)
- End date (optional, requires start date)

**Validation**:
- Name cannot be empty
- City must be selected
- End date must be after start date

**Auto-features**:
- Auto-creates Day 1 on route creation
- Auto-selects city if only one available
- Auto-suggests route name based on city

---

### 7. AddPlacesToRouteDrawer.tsx

**Purpose**: Select places to add to a specific day

**Features**:
- Shows only places from the same city
- Filters out already-added places
- Checkbox multi-select
- Search bar for filtering
- Visual indication of already-added places

**Place Display**:
- Category-colored left border
- Category icon
- Place name and description
- "Already in route" badge for existing places

**Disabled State**:
- Places already in any day are shown but disabled
- Tooltip: "Already in route"

---

## User Flows

### Create Route Flow
1. Navigate to Routes tab
2. Tap "+" floating button (or "Create Your First Route")
3. Enter route name
4. Select city from dropdown
5. Optionally set dates
6. Tap "Create Route"
7. → Navigates to RouteDetail for new route

### Add Places Flow
1. Open route detail
2. Tap "Add" on a day
3. Select places from list (checkboxes)
4. Tap "Add (X) Places"
5. → Places appear in day, numbered 1, 2, 3...

### Reorder Places Flow
1. View route with places
2. Long-press drag handle (⋮⋮) on any place
3. Drag up or down
4. Release to drop
5. → Numbers auto-update
6. → Haptic feedback confirms

### Convert Collection to Route Flow
1. Navigate to Collection detail
2. Tap "Create Route" button (header)
3. → Validates all places are from same city
4. → Creates route with collection name
5. → All places added to Day 1
6. → Navigates to new route

### Delete Day Flow
1. Add extra day (empty)
2. Trash icon appears next to "Add" button
3. Tap trash icon
4. → Day removed immediately
5. → Remaining days renumber automatically

### View Place Details Flow (NEW)
1. View route with places
2. Tap place name (clickable, shows purple on hover)
3. → Opens RecommendationDetailsDialog
4. Shows full place details, attribution, tips, website
5. Route-specific notes shown in amber box (if present)
6. Can mark visited (syncs both route & source)
7. Edit/Delete buttons hidden (route context)
8. Close drawer → returns to route

### Navigate to Friend's Recommendations Flow (NEW)
1. View route with places
2. Tap place name → opens drawer
3. Tap friend name in attribution (purple, clickable)
4. → Navigates to home page with friend filter applied
5. "Back to Route" button appears at top
6. Browse all recommendations from that friend
7. Tap "Back to Route"
8. → Returns to route detail view

---

## Drag-and-Drop Implementation

### Libraries Used
- `@dnd-kit/core` - Core functionality
- `@dnd-kit/sortable` - Sortable lists
- `@dnd-kit/utilities` - Helper functions

### Sensors Configuration
```typescript
const sensors = useSensors(
  useSensor(PointerSensor),         // Mouse/trackpad
  useSensor(TouchSensor, {          // Touch screens
    activationConstraint: {
      delay: 250,                   // Prevent accidental drags
      tolerance: 5,                 // Allow small movements
    },
  }),
  useSensor(KeyboardSensor, {       // Accessibility
    coordinateGetter: sortableKeyboardCoordinates,
  })
);
```

### Drag End Handler
```typescript
const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;

  if (over && active.id !== over.id) {
    const oldIndex = findIndex(active.id);
    const newIndex = findIndex(over.id);

    const reordered = arrayMove(places, oldIndex, newIndex);
    mediumHaptic();  // Haptic feedback

    onReorderPlaces(dayNumber, reordered);
  }
};
```

### Visual Feedback
- **Grabbing**: Cursor changes to grab → grabbing
- **Opacity**: Dragged item fades to 50%
- **Shadow**: Elevated shadow during drag
- **Haptic**: Light haptic on grab, medium on drop

---

## Progress Tracking

### Calculation
```typescript
const calculateProgress = (route: Route) => {
  let totalPlaces = 0;
  let visitedPlaces = 0;

  route.days.forEach(day => {
    totalPlaces += day.places.length;
    visitedPlaces += day.places.filter(p => p.visited).length;
  });

  const percentage = totalPlaces > 0
    ? Math.round((visited / total) * 100)
    : 0;

  return { totalPlaces, visitedPlaces, percentage };
};
```

### Progress Bar
- Gradient: `from-primary to-purple-500`
- Animation: Smooth width transition (0.5s ease-out)
- Display: "X of Y visited" + "Z%"

---

## Route Status Logic

### Status Determination
```typescript
const getRouteStatus = (route: Route): RouteStatus => {
  if (!route.startDate && !route.endDate) return 'undated';

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Past: end date has passed
  if (route.endDate && new Date(route.endDate) < now) {
    return 'past';
  }

  // Upcoming: start date is in future
  if (route.startDate && new Date(route.startDate) > now) {
    return 'upcoming';
  }

  // Ongoing: between start and end, or started without end
  return 'ongoing';
};
```

### Grouping & Sorting
- **Upcoming**: Sort by start date (earliest first)
- **Ongoing**: Sort by start date (earliest first)
- **Past**: Sort by end date (most recent first)
- **Undated**: Sort by creation date (newest first)

---

## Styling Guidelines

### iOS 26 Liquid Glass
All route components use the Liquid Glass design system:

```css
.liquid-glass-clear {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
```

### Color Palette
- **Primary**: `#667eea` (purple)
- **Gradient**: `from-primary via-purple-500 to-pink-500`
- **Success**: `#34C759` (green, for visited)
- **Destructive**: Red for delete actions
- **Muted**: Gray for secondary info

### Animations
- **Card tap**: `whileTap={{ scale: 0.98 }}`
- **Drag item**: `transform + transition + opacity`
- **Progress bar**: `width animation (0.5s ease-out)`
- **Item appear**: `opacity: 0 → 1, y: 10 → 0`

### Haptics
- **Light**: Drag start, minor actions
- **Medium**: Route created, day added, reorder complete
- **Heavy**: (reserved for major actions)

---

## Storage & Persistence

### localStorage Key
```typescript
const ROUTES_STORAGE_KEY = "routes";
```

### Data Format
Routes are stored as JSON array:
```json
[
  {
    "id": "uuid-1",
    "name": "Paris Weekend",
    "cityId": "city-uuid",
    "city": "Paris",
    "country": "France",
    "startDate": "2025-12-01",
    "endDate": "2025-12-03",
    "days": [
      {
        "dayNumber": 1,
        "date": "2025-12-01",
        "places": [
          {
            "placeId": "place-uuid-1",
            "order": 0,
            "visited": false,
            "notes": "Try the croissants"
          }
        ]
      }
    ],
    "dateCreated": "2025-11-23T18:00:00.000Z",
    "dateModified": "2025-11-23T18:30:00.000Z"
  }
]
```

### Event Listeners
Components listen for storage events:
```typescript
useEffect(() => {
  const handleUpdate = () => loadRoutes();

  window.addEventListener("routeCreated", handleUpdate);
  window.addEventListener("routeUpdated", handleUpdate);
  window.addEventListener("routeDeleted", handleUpdate);

  return () => {
    window.removeEventListener("routeCreated", handleUpdate);
    window.removeEventListener("routeUpdated", handleUpdate);
    window.removeEventListener("routeDeleted", handleUpdate);
  };
}, [loadRoutes]);
```

---

## Testing Checklist

### Create Route
- [ ] Create route with dates → saves correctly
- [ ] Create route without dates → marked as undated
- [ ] Create route auto-creates Day 1
- [ ] Route appears in Routes list

### Add Places
- [ ] Add places to day → shows in numbered order
- [ ] Already-added places are disabled
- [ ] Only shows places from same city
- [ ] Search filters places correctly

### Drag & Drop
- [ ] Long-press activates drag (250ms)
- [ ] Dragging shows visual feedback
- [ ] Drop reorders correctly
- [ ] Numbers update after reorder
- [ ] Haptic feedback on drop

### Multi-Day
- [ ] Add day → creates new empty day
- [ ] Days show correct dates if route has dates
- [ ] Delete empty day → removes successfully
- [ ] Cannot delete last day
- [ ] Cannot delete day with places

### Progress
- [ ] Mark place visited → progress updates
- [ ] Progress bar animates correctly
- [ ] Percentage calculates correctly
- [ ] Visited places show green tint

### Navigation
- [ ] Routes tab in navbar works
- [ ] Route card click → detail view
- [ ] Back button → returns to list
- [ ] Delete route → returns to list

### Place Details (NEW)
- [x] Click place name → opens detail drawer
- [x] Shows full place information
- [x] Route notes shown in amber box (if present)
- [x] Website button appears (if place has website)
- [x] Mark visited → syncs route & source
- [x] Edit/Delete buttons hidden in route context
- [x] Close drawer → returns to route

### Attribution Navigation (NEW)
- [x] Click friend name from route → navigates to home with filter
- [x] Back to Route button appears on home page
- [x] Filter applied correctly (shows friend name chip)
- [x] Click Back to Route → returns to route detail
- [x] Browser history works correctly
- [x] Click friend name from home → applies filter without navigation
- [x] Haptic feedback on back button

---

## Common Issues & Solutions

### Places Not Showing in AddPlaces Drawer
**Cause**: Place doesn't have matching cityId

**Solution**: Check recommendation has correct cityId
```typescript
// In recommendation-manager.ts
recommendation.cityId = cityId;
```

### Drag Not Working on Mobile
**Cause**: Incorrect touch sensor configuration

**Solution**: Ensure delay and tolerance are set:
```typescript
useSensor(TouchSensor, {
  activationConstraint: {
    delay: 250,
    tolerance: 5,
  }
})
```

### Delete Day Button Not Showing
**Cause**: Day has places or is the only day

**Solution**: Check logic:
```typescript
route.days.length > 1 && sortedPlaces.length === 0
```

### Progress Not Updating
**Cause**: Not listening to route events

**Solution**: Add event listeners:
```typescript
window.addEventListener("routeUpdated", loadRoute);
```

---

## Future Enhancements

### Planned Features
- [ ] Map view showing route pins
- [ ] Optimized route ordering (distance-based)
- [ ] Export route to calendar
- [ ] Share route with friends
- [ ] Route templates
- [ ] Budget tracking per route
- [ ] Photo gallery integration
- [ ] Offline sync

### Technical Improvements
- [ ] Backend API for cross-device sync
- [ ] Route analytics (time estimates)
- [ ] Integration with navigation apps
- [ ] Route duplication
- [ ] Archive completed routes

---

## Related Documentation

- [Component Hierarchy](./component-hierarchy.md) - General prop patterns
- [Attribution System](./attribution-system.md) - Source tracking
- [Recent Improvements](./recent-improvements.md) - Latest changes

---

**Last Updated**: November 23, 2025
**Feature Version**: 1.0.0
