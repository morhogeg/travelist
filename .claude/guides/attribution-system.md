# Recommendation Attribution & Context System

## Overview
The attribution system tracks WHO recommended places and WHY/WHAT/WHEN context for each recommendation. This helps users remember the source of recommendations and important tips.

## Data Structure

### Types Location
All types defined in: `src/utils/recommendation/types.ts`

### Source Attribution
```typescript
export type SourceType = 'friend' | 'instagram' | 'blog' | 'email' | 'text' | 'tiktok' | 'youtube' | 'article' | 'other';

export interface RecommendationSource {
  type: SourceType;
  name: string;           // Who recommended it
  relationship?: string;  // Friend, colleague, etc.
  url?: string;          // Instagram post, blog URL, etc.
  date?: string;         // When received
  notes?: string;        // Additional notes
}
```

### Context Information
```typescript
export type VisitPriority = 'high' | 'medium' | 'low';

export interface RecommendationContext {
  specificTip?: string;        // "Must try the pizza"
  occasionTags?: string[];     // ["Date night", "Family-friendly"]
  bestTime?: string;           // "Lunch", "Sunset"
  priceRange?: '$' | '$$' | '$$$';
  visitPriority?: VisitPriority;
  personalNote?: string;
}
```

### Recommendation Interface
```typescript
export interface RecommendationPlace {
  // ... existing fields
  source?: RecommendationSource;
  context?: RecommendationContext;
}
```

## Input Components

### SourceInput.tsx
Location: `src/components/recommendations/forms/SourceInput.tsx`
- Collapsible form for attribution
- Fields: name, source type, URL, date, notes
- Used in StructuredInputForm

### ContextInput.tsx
Location: `src/components/recommendations/forms/ContextInput.tsx`
- Collapsible form for context/tips
- Fields: specific tip, occasion tags (multi-select), best time, price range, priority
- Occasion tags: ["Date night", "Family-friendly", "Solo travel", etc.]
- "Clear all" functionality

### Integration
Both integrated in: `src/components/recommendations/forms/StructuredInputForm.tsx`
- Forms are optional and collapsible
- Data saved via `structured-recommendation.ts`

## Display Components

### RecommendationItem (Grid Cards)
Location: `src/components/home/category/recommendation-item/RecommendationItem.tsx`
- Purple badge (👤) on image if has attribution
- Shows "Recommended by [name]" in purple text
- Shows specific tip in amber italic with 💡 icon

### ListView
Location: `src/components/home/category/ListView.tsx`

**In Country View (`hideCountry={true}`):**
- 💡 Specific tip (amber text)
- Occasion tags (purple badges)
- Description (fallback if no tip)

**In Home View:**
- Location with flag
- 💡 Specific tip (amber text)
- Occasion tags (purple badges)
- Description (fallback if no tip)

### RecommendationDetailsDialog
Location: `src/components/home/RecommendationDetailsDialog.tsx`
Uses `RecommendationDetail.tsx` to show:
- Full source info in purple gradient card
- All context fields beautifully formatted
- Specific tips highlighted in amber callout

## Data Flow

### Saving Attribution
1. User fills SourceInput/ContextInput forms
2. Data captured in form state (React Hook Form + Zod)
3. `structured-recommendation.ts` creates place object with source/context
4. Saved to localStorage via `recommendation-manager.ts`

### Loading & Display
1. `getRecommendations()` loads from localStorage
2. `filter-helpers.ts` transforms data, preserving source/context fields
3. `city-helpers.ts` includes source/context in transformations
4. Components receive full data with attribution

## Key Files

### Data Layer
- `src/utils/recommendation/types.ts` - Type definitions
- `src/utils/recommendation/recommendation-manager.ts` - Storage
- `src/utils/recommendation/structured-recommendation.ts` - Save logic
- `src/utils/recommendation/filter-helpers.ts` - Data transformation
- `src/utils/recommendation/city-helpers.ts` - City-specific data

### Input Forms
- `src/components/recommendations/forms/SourceInput.tsx`
- `src/components/recommendations/forms/ContextInput.tsx`
- `src/components/recommendations/forms/StructuredInputForm.tsx`

### Display
- `src/components/home/category/recommendation-item/RecommendationItem.tsx` (Grid view)
- `src/components/home/category/ListView.tsx` (List view)
- `src/components/recommendations/RecommendationDetail.tsx` (Full detail)
- `src/components/home/RecommendationDetailsDialog.tsx` (Dialog wrapper)

## Important Patterns

### Preserving Optional Fields
Always use spread operator to preserve optional fields:
```typescript
return {
  ...place,
  source: place.source,
  context: place.context,
};
```

### hideCountry Prop Pattern
Used to conditionally show country in list view:
- CountryView passes `hideCountry={true}` to CategoryResults
- Prop chain: CategoryResults → CountryGroup → CityGroup → ListView
- ListView conditionally shows location vs context based on hideCountry

### Color Coding
- **Purple** (#667eea, #764ba2): Source attribution
- **Amber**: Specific tips and important context
- **Success green**: Visited status

## Search Integration
Search includes attribution fields:
- Source names
- Specific tips
- Personal notes
- Occasion tags

Location: `src/components/home/search/SearchHeader.tsx`

## Common Tasks

### Adding New Context Field
1. Add to `RecommendationContext` interface in `types.ts`
2. Add input in `ContextInput.tsx`
3. Add display in `RecommendationDetail.tsx` and/or `ListView.tsx`
4. Update Zod schema in form types

### Debugging Attribution Not Showing
1. Check console logs in RecommendationItem
2. Verify data in localStorage
3. Check filter-helpers.ts includes source/context
4. Verify structured-recommendation.ts saves the fields

### Testing
Use Safari Web Inspector (on Mac):
1. Safari > Develop > [Your iPhone] > localhost
2. Check console for debug logs
3. Inspect localStorage data

## Future Enhancements
- Auto-detect attribution from text parsing (basic implementation exists in `text-parser.ts`)
- Enhanced search with attribution filters
- Statistics on most recommended sources
- Timeline view of recommendations
