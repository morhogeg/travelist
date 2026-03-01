# Travelist AI - Models Documentation

To ensure zero API costs while maintaining high-quality AI features, Travelist now primarily uses **Google Gemini 3 Flash**.

## Implemented Models

| Feature | Model | Implementation | Why Selected |
| :--- | :--- | :--- | :--- |
| **Parsing & Extraction** | `gemini-3-flash-preview` | Raw Fetch API | High speed, native-like performance, and excellent at following structured JSON instructions. |
| **Personalized Suggestions** | `gemini-3-flash-preview` | Raw Fetch API | Strong reasoning and large context window for understanding user preferences. |
| **Trip Planning** | `gemini-3-flash-preview` | Raw Fetch API | Capable of complex multi-step reasoning required for itinerary optimization + Google Search Grounding. |

## Model Implementation Details

The app uses a custom internal client (`src/services/ai/gemini-client.ts`) that:
1. **Bypasses SDKs:** Uses raw fetch to avoid compatibility issues with Capacitor/iOS.
2. **Grounding:** Enables Google Search grounding for real-time accuracy.
3. **Caching:** Implements a global Firestore/Supabase cache to prevent redundant API calls.

## Configuration

- **API Key:** Managed via the `VITE_GEMINI_API_KEY` environment variable.
- **Client:** `src/services/ai/gemini-client.ts`.
- **Services:** `src/services/ai/gemini-service.ts`.
