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
│   ├── index.ts                        # Main exports
│   ├── types.ts                        # Type definitions
│   ├── suggestion-cache.ts             # localStorage caching
│   └── providers/
│       ├── grok-suggestions-provider.ts # Grok 4.1 via OpenRouter (primary)
│       ├── mock-provider.ts             # Mock responses (fallback)
│       └── openrouter-parser.ts         # Free text parsing (shared API)
├── hooks/
│   └── useAISuggestions.ts             # React hook for fetching suggestions
└── components/ai/
    ├── index.ts                        # Component exports
    ├── AISuggestionCard.tsx            # Individual suggestion card with directions
    └── AISuggestionsSection.tsx        # Carousel container
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

The feature uses a provider pattern for easy swapping between providers:

- **Grok Provider** (current): Uses Grok 4.1 Fast via OpenRouter for real AI recommendations
- **Mock Provider** (fallback): Returns realistic-looking suggestions if API fails

### Current Implementation: Grok 4.1 Fast

The app uses **Grok 4.1 Fast** (`x-ai/grok-4.1-fast:free`) via OpenRouter API for generating personalized recommendations.

**API Configuration:**
- Endpoint: `https://openrouter.ai/api/v1/chat/completions`
- Model: `x-ai/grok-4.1-fast:free` (free tier)
- API Key: Set `VITE_OPENROUTER_API_KEY` in `.env` file

**How it works:**
1. Analyzes user's saved places to understand preferences (budget, cuisine, activity types)
2. Generates personalized "why recommended" explanations referencing saved places
3. Suggests real, actual establishments that exist in the city
4. Falls back to mock provider if API fails

**Provider file:** `src/services/ai/providers/grok-suggestions-provider.ts`

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
- "Add to List" button (or "Add to Day" in Trip Planner)

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

## Transparency & Privacy

To maintain user trust, the application includes several transparency features:

- **Model Identity**: The active provider (e.g., DeepSeek via OpenRouter) is displayed in Settings.
- **Connection Status**: Real-time checking of AI reachability.
- **Data Usage Education**: A privacy dialog explaining that only anonymized place and city data is shared for enrichment.
- **Attribution**: "POWERED BY TRAVELIST AI" badges on all AI-generated content.

### Provider Details
The app currently uses a centralized client (`src/services/ai/openrouter-client.ts`) that implements:
1. **Primary**: `tngtech/deepseek-r1t2-chimera:free`
2. **Fallback**: `openai/gpt-oss-120b:free` (with multi-turn reasoning)

## Future Enhancements

- [x] Connect to real LLM provider (Grok 4.1 via OpenRouter)
- [x] Directions button on suggestion cards (Google Maps)
- [x] "Get info from Travelist AI" in details dialog for on-demand generation
- [ ] Add user preference learning
- [ ] Filter suggestions by category
- [ ] Save dismissed suggestions to avoid re-showing
- [ ] Add "Show More" pagination
- [ ] Analytics for suggestion clicks/adds

---

Last Updated: January 2026
