# AI Architecture & Implementation Guide

## Overview
Travelist uses Google's Gemini 3 Flash model for generating place descriptions ("Get info from Travelist AI") and parsing recommendations. The implementation is designed to be robust on mobile networks (iOS/Capacitor) and cost-effective.

## Core Components

### 1. Centralized Client (`src/services/ai/gemini-client.ts`)
We use a custom, centralized client instead of the official `@google/genai` Node SDK to ensure full compatibility with the Capacitor iOS runtime.

**Key Features:**
- **Raw Fetch Implementation:** Uses standard `fetch` with `POST` requests to `generativelanguage.googleapis.com`. This avoids compatibility issues with strict iOS environments where some Node.js polyfills usually fail.
- **Cache Safety Mechanism:**
  - Before calling the API, the client checks Firestore for cached results.
  - **CRITICAL:** The cache lookup is wrapped in a `Promise.race` with a **1.5-second timeout**.
  - **Why?** On mobile networks, Firestore connections can sometimes hang indefinitely. If the cache doesn't respond instantly, we skip it and proceed to the live API call to prevent the UI from freezing ("stuck on generated").
- **Monitoring:** Granular tracking of request lifecycle (can be enabled with debug flags).

### 2. Place Descriptions (`src/services/ai/generatePlaceDescription.ts`)
Generates 2-sentence descriptions for specific places.

**Token Budget Strategy:**
To prevent truncated responses (cutoff sentences), we carefully balance the "Thinking" budget vs. the "Output" limit.

| Setting | Value | Reason |
| :--- | :--- | :--- |
| **Thinking Level** | `minimal` (~128 tokens) | Descriptions are factual and short; they don't require deep reasoning. High thinking budgets eat into the response limit. |
| **Max Output** | `1000` tokens | Increased from 500. This ensures there is enough room for both the thinking block (hidden) and the final text response. |
| **Temperature** | `0.3` | Low temperature for consistent, factual outputs. |

### 3. Recommendation Parsing (`src/services/ai/providers/openrouter-parser.ts`)
(Note: File name is legacy, now uses Gemini).
Parses free-text or shared URLs into structured recommendation data.
- **Model:** Gemini 3 Flash
- **Grounding:** Enabled (Google Search) to verify place existence and extract correct city/country data.

## Deployment & Configuration

### Environment Variables
- `VITE_GEMINI_API_KEY`: Must be set in `.env` (development) and added to your production build environment.

### iOS Specifics
- **Network Permissions:** `Info.plist` must allow arbitrary loads if you ever switch to non-HTTPS (currently using HTTPS).
- **CORS:** The raw fetch implementation bypasses strict CORS issues often found when wrapping external SDKs in WebViews.

## Troubleshooting

### "Network Error" on iOS
If the button returns "Network error":
1. Check internet connection.
2. verify `VITE_GEMINI_API_KEY` is valid.
3. The `testConnectivity()` function in `gemini-client.ts` can be re-enabled to debug if the WebView has absolutely no access vs. just an API failure.

### Truncated Output ("...")
If descriptions stop mid-sentence:
1. Increase `maxOutputTokens`.
2. Decrease `thinkingLevel` (High thinking consumes output tokens).

### Stuck on "Generating..."
This usually means the Cache Promise is hanging.
- Ensure the `Promise.race` timeout logic in `gemini-client.ts` is active.
- Verify the timeout duration (currently 1500ms).
