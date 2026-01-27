# Travelist AI - Free Models Documentation

To ensure zero API costs while maintaining high-quality AI features, Travelist now uses exclusively free models from OpenRouter.

## Implemented Models

| Feature | Model | Why Selected |
| :--- | :--- | :--- |
| **Parsing & Extraction** | `google/gemma-3-27b-it:free` | Excellent at following structured JSON instructions and extracting place data from shared links/text. |
| **Personalized Suggestions** | `meta-llama/llama-3.3-70b-instruct:free` | High-performance 70B model with strong reasoning, excellent for understanding preferences. |
| **Trip Planning** | `google/gemma-3-27b-it:free` | Fast, reliable, and capable of complex multi-step reasoning required for itinerary optimization. |

## Model Cascading & Fallbacks

The app implements a cascading logic for parsing:
1. **Primary**: `google/gemma-3-27b-it:free`
2. **Fallbacks**: 
   - `google/gemini-2.0-flash-lite-preview-02-05:free`
   - `meta-llama/llama-3.3-70b-instruct:free`
   - `qwen/qwen-2.5-72b-instruct:free`

This ensures that if one free model is rate-limited or unavailable, the app automatically tries another high-quality free alternative.

## Configuration

All models are configured in their respective provider files:
- `src/services/ai/providers/openrouter-parser.ts`
- `src/services/ai/providers/deepseek-suggestions-provider.ts`
- `src/services/ai/providers/trip-planner-provider.ts`

API keys are managed via the `VITE_OPENROUTER_API_KEY` environment variable.
