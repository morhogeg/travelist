# AI Suggestions Feature

## Overview

AI-powered place suggestions that appear on city detail pages when users have saved enough places. The feature analyzes saved places and recommends similar spots the user might enjoy.

## How It Works

1. **Trigger**: User has 3+ places saved in a city
2. **Display**: Horizontal scrollable carousel on PlaceDetail page
3. **Personalization**: Suggestions are based on saved places' categories
4. **Actions**: Users can tap "Add to List" to open the recommendation drawer pre-filled

## Architecture

### File Structure
```
src/
├── services/ai/
│   ├── index.ts              # Main exports
│   ├── types.ts              # Type definitions
│   ├── suggestion-cache.ts   # localStorage caching
│   └── providers/
│       └── mock-provider.ts  # Mock LLM responses
├── hooks/
│   └── useAISuggestions.ts   # React hook for fetching suggestions
└── components/ai/
    ├── index.ts              # Component exports
    ├── AISuggestionCard.tsx  # Individual suggestion card
    └── AISuggestionsSection.tsx # Carousel container
```

### Key Types

```typescript
interface AISuggestion {
  id: string;
  name: string;
  category: PlaceCategory;
  description: string;
  whyRecommended: string;
  estimatedPriceRange?: '$' | '$$' | '$$$' | '$$$$';
  tags?: string[];
}

interface LLMProvider {
  name: string;
  generateSuggestions(request: AISuggestionRequest): Promise<AISuggestionResult>;
}
```

## Provider System

The feature uses a provider pattern for easy swapping between:

- **Mock Provider** (current): Returns realistic-looking suggestions for development
- **OpenAI Provider** (future): Use GPT models for real recommendations
- **Anthropic Provider** (future): Use Claude for recommendations

### Adding a Real Provider

1. Create `src/services/ai/providers/openai-provider.ts`:

```typescript
import { LLMProvider, AISuggestionRequest, AISuggestionResult } from '../types';

export class OpenAIProvider implements LLMProvider {
  name = 'openai';

  async generateSuggestions(request: AISuggestionRequest): Promise<AISuggestionResult> {
    // Call OpenAI API
    // Parse response into AISuggestionResult
  }
}
```

2. Update `useAISuggestions.ts` to use the new provider based on config

## Caching

Suggestions are cached in localStorage to avoid repeated API calls:

- **Key**: `travelist-ai-suggestions-cache`
- **Duration**: 24 hours (configurable)
- **Invalidation**: When saved places change (hash comparison)
- **Max entries**: 20 cities (oldest removed when exceeded)

### Cache Structure

```json
{
  "paris_france": {
    "result": { ... },
    "hash": "abc123",
    "expiresAt": 1700000000000
  }
}
```

## Configuration

Default settings in `DEFAULT_AI_CONFIG`:

```typescript
{
  minPlacesForSuggestions: 3,  // Min places to trigger AI
  cacheDurationMs: 86400000,   // 24 hours
  maxSuggestions: 5,           // Max suggestions returned
  provider: 'mock'             // Current provider
}
```

## UI Components

### AISuggestionsSection

- Shows "unlock" teaser when 1-2 places saved
- Shows suggestions carousel when 3+ places saved
- Loading skeletons during fetch
- Refresh button to regenerate suggestions

### AISuggestionCard

- Category icon with gradient background
- Name, description, price range
- "Why recommended" explanation with AI badge
- Tags for quick context
- "Add to List" button

## Usage

```tsx
import { AISuggestionsSection } from '@/components/ai';

<AISuggestionsSection
  cityName="Paris"
  countryName="France"
  onAddSuggestion={(suggestion) => {
    // Pre-fill recommendation drawer
  }}
/>
```

## Mock Data

The mock provider includes city-specific suggestions for:
- Paris (French bistros, Musée de l'Orangerie, etc.)
- Tokyo (Afuri Ramen, teamLab, Golden Gai, etc.)
- Default fallback for all other cities

## Future Enhancements

- [ ] Connect to real LLM provider (OpenAI/Anthropic)
- [ ] Add user preference learning
- [ ] Filter suggestions by category
- [ ] Save dismissed suggestions to avoid re-showing
- [ ] Add "Show More" pagination
- [ ] Analytics for suggestion clicks/adds

---

Last Updated: November 2025
