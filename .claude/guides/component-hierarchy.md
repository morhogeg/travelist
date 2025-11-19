# Component Hierarchy & Prop Patterns

## Home Page Flow

```
Index.tsx
  └─ CountryGroupList.tsx
      └─ CountryGroup.tsx (per country)
          └─ CityGroup.tsx (per city)
              ├─ GridView.tsx
              │   └─ RecommendationItem.tsx
              └─ ListView.tsx
```

## Country View Page Flow

```
CountryView.tsx
  └─ CategoryResults.tsx
      └─ CountryGroup.tsx
          └─ CityGroup.tsx
              ├─ GridView.tsx
              │   └─ RecommendationItem.tsx
              └─ ListView.tsx
```

## Common Props Patterns

### Event Handlers (Passed Down)
These props flow from top-level pages down through all components:

```typescript
// From Index.tsx or CountryView.tsx
onEditClick?: (item: any) => void
onViewDetails?: (item: any) => void
onToggleVisited?: (recId: string, name: string, visited: boolean) => void
onDeleteRecommendation?: (recId: string, name: string) => void
onCityClick?: (cityId: string) => void
onRefresh?: () => void
```

### Display Control Props
```typescript
viewMode?: "grid" | "list"
hideCityHeader?: boolean      // Hide city name headers
hideCountryHeader?: boolean   // Hide country name headers
hideCountry?: boolean         // Hide country info in cards
```

## Prop Chain Example: onViewDetails

When adding a new prop that needs to flow through all components:

1. **Index.tsx** (or CountryView.tsx)
   ```typescript
   const handleViewDetails = (recommendation: any) => {
     setDetailsRecommendation(recommendation);
     setDetailsDialogOpen(true);
   };

   <CountryGroupList onViewDetails={handleViewDetails} />
   ```

2. **CountryGroupList.tsx**
   ```typescript
   interface Props {
     onViewDetails?: (item: any) => void;
   }

   <CountryGroup onViewDetails={onViewDetails} />
   ```

3. **CountryGroup.tsx**
   ```typescript
   interface Props {
     onViewDetails?: (item: any) => void;
   }

   <CityGroup onViewDetails={onViewDetails} />
   ```

4. **CityGroup.tsx**
   ```typescript
   interface Props extends CityGroupProps {
     onViewDetails?: (item: any) => void;
   }

   <GridView onViewDetails={onViewDetails} />
   <ListView onViewDetails={onViewDetails} />
   ```

5. **GridView.tsx / ListView.tsx**
   ```typescript
   interface Props {
     onViewDetails?: (item: any) => void;
   }

   <RecommendationItem onViewDetails={() => onViewDetails?.(item)} />
   ```

6. **RecommendationItem.tsx**
   ```typescript
   interface Props {
     onViewDetails?: (item: any) => void;
   }

   <div onClick={() => onViewDetails?.(item)}>
   ```

## Type Definitions

### Component Types Files
- `src/components/home/category/types.ts` - Main types for CityGroup, GridView, ListView
- `src/components/home/category/recommendation-item/types.ts` - RecommendationItem types

### Adding Props to Types
When adding new optional props:

```typescript
// types.ts
export interface CityGroupProps {
  // ... existing props
  newProp?: string;  // Add here
}

export interface GridViewProps {
  // ... existing props
  newProp?: string;  // Add here
}

export interface ListViewProps {
  // ... existing props
  newProp?: string;  // Add here
}
```

## Common Patterns

### Conditional Rendering Based on Props
```typescript
// Hide elements based on prop
{!hideCityHeader && <CityHeader />}

// Show different content based on prop
{hideCountry ? (
  <ContextDisplay />
) : (
  <LocationDisplay />
)}
```

### Optional Chaining for Callbacks
Always use optional chaining when calling optional props:
```typescript
onViewDetails?.(item)  // ✅ Safe
onViewDetails(item)     // ❌ Will crash if undefined
```

### Default Props
Use default parameters for boolean flags:
```typescript
const Component = ({
  hideCountry = false,
  viewMode = "grid"
}: Props) => {
```

## Data Transformation Flow

1. **Storage**: localStorage (raw data)
2. **Manager**: `recommendation-manager.ts` (CRUD operations)
3. **Filter**: `filter-helpers.ts` (transform to display format)
4. **City Helpers**: `city-helpers.ts` (city-specific queries)
5. **Components**: Display transformed data

**Critical**: Always preserve optional fields when transforming:
```typescript
// ✅ Correct
return {
  ...existingData,
  source: place.source,
  context: place.context,
};

// ❌ Wrong - loses optional fields
return {
  id: place.id,
  name: place.name,
  // source and context lost!
};
```

## Debugging Prop Chains

When props aren't reaching child components:

1. Check each level's interface includes the prop
2. Check each level passes the prop to children
3. Use console.log at each level:
   ```typescript
   console.log('ComponentName received:', { propName });
   ```

4. Common mistakes:
   - Forgot to add to interface
   - Forgot to pass to child component
   - Typo in prop name
   - Destructuring without including new prop

## View Mode Toggle

**Grid vs List View:**
- Controlled by `viewMode` state in parent (Index.tsx or CountryView.tsx)
- Toggle button updates state
- State passed down to determine which component to render
- Both views should support same event handlers

```typescript
{viewMode === "grid" ? (
  <GridView {...commonProps} />
) : (
  <ListView {...commonProps} />
)}
```

## Country View Special Behavior

CountryView.tsx has unique props for cleaner display:
```typescript
<CategoryResults
  hideCityHeader={false}      // Show cities
  hideCountryHeader={true}    // Already in country page
  hideCountry={true}          // Don't show country in cards
  showToggle={false}          // No category toggle
  noSidePadding={true}       // Full width
/>
```

## Refresh Pattern

After mutations (add, edit, delete, toggle visited):
```typescript
// Parent component
const loadRecommendations = useCallback(async () => {
  const data = await getFilteredRecommendations(categories);
  setGroupedRecommendations(data);
}, [categories]);

// Pass down as onRefresh
<Component onRefresh={loadRecommendations} />

// Child calls after mutation
onRefresh?.();
```
