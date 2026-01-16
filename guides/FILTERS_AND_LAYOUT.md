# Filter System & Header Layout Guide

**Last Updated:** January 2026

This guide documents the comprehensive filter system and iOS-compliant header layout implemented for Travelist.

---

## 📋 Table of Contents

1. [Filter System Architecture](#filter-system-architecture)
2. [Header Layout Best Practices](#header-layout-best-practices)
3. [iOS Touch Target Standards](#ios-touch-target-standards)
4. [Development Workflow](#development-workflow)
5. [Component Reference](#component-reference)

---

## 🎯 Filter System Architecture

### Overview

The filter system allows users to filter travel recommendations by multiple criteria. It follows iOS design patterns with a bottom sheet drawer interface.

### Filter Types

```typescript
interface FilterState {
  visitStatus: 'all' | 'visited' | 'not-visited';
  sources: SourceType[];              // Instagram, Friend, Blog, etc.
  priceRanges: PriceRangeFilter[];    // budget, moderate, expensive, splurge
  occasions: string[];                // Custom tags
  countries: string[];                // Location filters
  cities: string[];                   // Location filters
}
```

### Key Components

**1. FilterButton** (`src/components/home/filters/FilterButton.tsx`)
- Icon-only button with badge showing active filter count
- 44px minimum touch target (iOS standard)
- Liquid glass styling for consistency

**2. FilterSheet** (`src/components/home/filters/FilterSheet.tsx`)
- Bottom drawer with 5 filter sections
- Smooth spring animations
- Apply/Reset/Cancel actions
- Haptic feedback on interactions

**3. Filter Sections:**
- `VisitStatusSection` - Visited, Not Visited, All
- `SourceSection` - Instagram, TikTok, Friend, Blog, etc. (organized: social → personal → content)
- `PriceRangeSection` - Budget to Splurge
- `OccasionSection` - Custom occasion tags
- `LocationSection` - Country and City filters

**4. ActiveFilters** (`src/components/home/filters/ActiveFilters.tsx`)
- Shows active filter chips
- Individual removal capability
- Clear all option

### Filter Logic

Located in `src/utils/recommendation/filter-helpers.ts`:

```typescript
export function getFilteredRecommendations(
  categories: string | string[],
  searchTerm?: string,
  filters?: FilterState
): GroupedRecommendation[]
```

Applies filters in this order:
1. Category filter
2. Search term (if provided)
3. Visit status
4. Source
5. Price range
6. Occasions
7. Location (country/city)

### State Management

Filter state lives in `src/pages/Index.tsx`:

```typescript
const [filters, setFilters] = useState<FilterState>(INITIAL_FILTER_STATE);
const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
```

Updates trigger `loadRecommendations()` which re-filters the entire list.

---

## 📐 Header Layout Best Practices

### Current Layout Structure

```
┌─────────────────────────────────────┐
│ Row 1: Main Header                  │
│ Travelist AI               [Grid]   │
│ (left)                    (right)   │
├─────────────────────────────────────┤
│ Row 2: Search Bar                   │
│ [🔍 Search recommendations...     ] │
│ (full width, fades on scroll)       │
├─────────────────────────────────────┤
│ Row 3: Filter + Categories          │
│ [⚙] [All] [Food] [Lodging] →       │
│(fixed)     (scrollable)             │
└─────────────────────────────────────┘
```

### Key Design Decisions

**1. Filter Button Placement**
- **Fixed on left** - Stays visible when categories scroll
- **Before categories** - Logical hierarchy (filters affect categories)
- **Same row** - Efficient use of space
- **Touch-friendly** - 44px minimum, proper spacing

**2. Category Pills**
- **Horizontal scroll** - Handles unlimited categories
- **Gradient hint** - 8px fade on right edge indicates scrollability
- **"All" first** - Default state, follows iOS conventions
- **Flexible width** - Adapts to content

**3. Search Bar**
- **Always visible** - Replaced expandable icon for better discoverability.
- **Full width** - Maximizes input area.
- **Scroll Fade** - Header and search bar fade out elegantly on scroll to maximize content area.

**4. View Toggle**
- **Top right** - Secondary control position
- **Grid/List icons** - Clear affordance
- **Consistent size** - Matches other header buttons

### iOS Human Interface Guidelines Compliance

✅ **44pt Minimum Touch Targets** - All interactive elements
✅ **Clear Visual Hierarchy** - Primary controls prominent
✅ **Semantic Grouping** - Related controls together
✅ **Proper Spacing** - 16px padding (iOS standard)
✅ **Scrollable Content Hints** - Gradient fade indicators
✅ **Persistent Navigation** - Key controls always visible

### Common Mistakes Avoided

❌ **Filter inside scroll container** - Would hide when scrolling
❌ **Too many controls in header** - Creates clutter
❌ **Inconsistent button sizes** - Poor visual rhythm
❌ **Cramped spacing** - Difficult to tap accurately
❌ **No scroll indicators** - Users don't know content scrolls

---

## 📱 iOS Touch Target Standards

### Minimum Sizes

All interactive elements meet Apple's 44pt minimum:

```css
.button {
  min-height: 44px;  /* 11 * 4 = 44px */
  min-width: 44px;
}
```

In Tailwind: `min-h-11 min-w-11`

### Implemented Components

**SearchHeader button:**
```typescript
className="min-h-11 min-w-11 rounded-full liquid-glass-clear"
```

**FilterButton:**
```typescript
className="min-h-11 min-w-11 px-3 rounded-xl liquid-glass-clear"
```

**ViewModeToggle:**
```typescript
className="min-h-11 min-w-11 rounded-full liquid-glass-clear"
```

**CategoryPill:**
```typescript
className="min-h-11 py-2.5 px-4 rounded-xl"
```

### Why 44px?

Apple's research shows:
- Average adult finger pad: 40-44px
- Comfortable one-handed reach
- Reduces mis-taps
- Better accessibility

---

## 🔄 Development Workflow

### Option 1: Quick Build & Sync

```bash
npm run build:sync
```

Then press **Cmd+R** in Xcode to refresh.

### Option 2: Watch Script (Auto-sync on changes)

```bash
./watch-and-sync.sh
```

Requires `fswatch` (install: `brew install fswatch`)

Watches `src/**/*` and auto-builds + syncs on changes. Still need Cmd+R in Xcode.

### Option 3: Live Reload (Network-based)

**⚠️ Currently disabled for stability**

To re-enable:
1. Update IP in `capacitor.config.ts`:
   ```typescript
   url: 'http://YOUR_IP:5173'
   ```
2. Uncomment server config block
3. Run: `npm run dev -- --host`
4. Rebuild in Xcode once

**Issues with live reload:**
- Network IP changes frequently (WiFi reconnects)
- Blank screen if IP is wrong
- More complex debugging

**Recommended:** Use `build:sync` workflow for reliability.

---

## 🧩 Component Reference

### File Locations

**Filter System:**
```
src/components/home/filters/
├── FilterButton.tsx          # Icon-only button with badge
├── FilterSheet.tsx           # Main bottom drawer
├── ActiveFilters.tsx         # Active filter chips display
├── index.ts                  # Exports
└── sections/
    ├── VisitStatusSection.tsx
    ├── SourceSection.tsx
    ├── PriceRangeSection.tsx
    ├── OccasionSection.tsx
    └── LocationSection.tsx
```

**Header Components:**
```
src/components/home/
├── search/
│   └── SearchHeader.tsx      # Main header with search
├── category/
│   └── ViewModeToggle.tsx    # Grid/List toggle
└── categories/
    ├── CategoriesScrollbar.tsx
    ├── CategoryList.tsx
    └── CategoriesScrollContainer.tsx
```

**Types:**
```
src/types/
└── filters.ts                # FilterState, helper functions
```

**Utilities:**
```
src/utils/recommendation/
└── filter-helpers.ts         # Filter logic, getFilteredRecommendations()
```

### FilterButton Props

```typescript
interface FilterButtonProps {
  activeCount: number;        // Number of active filters
  onClick: () => void;        // Handler to open sheet
}
```

### FilterSheet Props

```typescript
interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableCountries: string[];
  availableCities: string[];
  availableOccasions: string[];
}
```

### Usage Example

```typescript
// In Index.tsx
const [filters, setFilters] = useState<FilterState>(INITIAL_FILTER_STATE);
const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

// Load available options
const [availableOccasions, setAvailableOccasions] = useState<string[]>([]);
const [availableCountries, setAvailableCountries] = useState<string[]>([]);
const [availableCities, setAvailableCities] = useState<string[]>([]);

useEffect(() => {
  setAvailableOccasions(getAvailableOccasions());
  setAvailableCountries(getAvailableCountries());
  setAvailableCities(getAvailableCities());
}, []);

// Apply filters
const loadRecommendations = useCallback(async () => {
  const data = await getFilteredRecommendations(
    selectedCategories.length === 0 ? "all" : selectedCategories,
    undefined,
    filters
  );
  setGroupedRecommendations(data);
}, [selectedCategories, filters]);
```

---

## 🎨 Styling Conventions

### Button States

```css
/* Base state */
liquid-glass-clear

/* Hover (desktop) */
hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60

/* Active (pressed) */
whileTap={{ scale: 0.96 }}

/* Transition */
ios26-transition-spring
```

### Layout Patterns

```tsx
{/* Fixed control + Scrollable content */}
<div className="flex items-center gap-3 px-4">
  <FixedButton />
  <div className="flex-1 min-w-0 relative">
    <ScrollableContent />
    {/* Scroll hint */}
    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
  </div>
</div>
```

### Active Filter Badge

```tsx
<AnimatePresence>
  {activeCount > 0 && (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
      className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold text-white"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        boxShadow: "0 2px 8px rgba(102, 126, 234, 0.4)",
      }}
    >
      {activeCount}
    </motion.div>
  )}
</AnimatePresence>
```

---

## 🐛 Common Issues & Solutions

### Issue: Filter button scrolls out of view

**Cause:** Button is inside the horizontal scroll container.

**Solution:** Move button outside scroll container, use flex layout:
```tsx
<div className="flex items-center gap-3">
  <FilterButton />
  <div className="flex-1 min-w-0">
    <ScrollableCategories />
  </div>
</div>
```

### Issue: Touch targets feel too small

**Cause:** Not meeting 44px minimum.

**Solution:** Add `min-h-11 min-w-11` to all interactive elements.

### Issue: Filter changes don't update the list

**Cause:** Missing dependency in `loadRecommendations` callback.

**Solution:** Include `filters` in useCallback dependencies:
```typescript
const loadRecommendations = useCallback(async () => {
  // ...
}, [selectedCategories, filters]); // ← Add filters here
```

### Issue: Active filter count doesn't update

**Cause:** Not using `countActiveFilters()` helper.

**Solution:**
```typescript
import { countActiveFilters } from '@/types/filters';
const activeFilterCount = countActiveFilters(filters);
```

---

## 📝 Best Practices

### Do's ✅

- Always meet 44px minimum touch targets
- Keep filter button visible (outside scroll containers)
- Use semantic grouping for filter sections
- Provide clear visual feedback (badges, active states)
- Test on actual iOS device for touch accuracy
- Use haptic feedback for important interactions
- Show active filter count prominently
- Allow individual filter removal via chips

### Don'ts ❌

- Don't hide primary controls in scroll areas
- Don't use text labels for icon-only buttons (clutters UI)
- Don't forget gradient hints on scrollable content
- Don't mix different button sizes (breaks visual rhythm)
- Don't over-complicate filter UI with too many sections
- Don't forget to sync filters with URL params (future enhancement)

---

## 🔮 Future Enhancements

### Potential Improvements

1. **URL State Management**
   - Save filter state in URL params
   - Share filtered views via links
   - Browser back/forward support

2. **Filter Presets**
   - "Recently visited"
   - "Budget-friendly"
   - "Recommendations from friends"
   - User-created saved filters

3. **Smart Filters**
   - Auto-suggest based on current location
   - Seasonal recommendations
   - Time-of-day appropriate suggestions

4. **Advanced UI**
   - Horizontal filter pill bar (quick filters)
   - Map view integration with filters
   - Sort options (by date, priority, distance)

5. **Analytics**
   - Track most-used filters
   - Popular filter combinations
   - Filter effectiveness metrics

---

## 📚 Related Documentation

- **[CONTEXT.md](./CONTEXT.md)** - Current project state, quick reference
- **[IOS26_TRANSFORMATION.md](./IOS26_TRANSFORMATION.md)** - Design system details
- **[IOS_DEVELOPMENT.md](./IOS_DEVELOPMENT.md)** - iOS build and deployment

---

**Questions or improvements?** Update this guide as the filter system evolves!
