# Maps Integration Status

> **Status:** ✅ Native Apple Maps replaced with "Export to Maps" feature.

## Overview
The native Apple Maps integration (using `MapKit` and `AppleMapsPlugin.swift`) was found to be buggy and has been completely removed. It has been replaced with a robust "Export to Maps" feature that allows users to open places and routes in **Google Maps** or **Apple Maps**.

## New Feature: Export to Maps
- **Functionality:**
  - **Single Place:** Opens navigation to the specific location.
  - **Routes/Collections:** Exports all places as a multi-stop route.
  - **Fallbacks:** If Google Maps app is not installed (on iOS), it falls back to the web version.
- **UI Integration:**
  - **Route Detail:** "Export" button in the header.
  - **Collection Detail:** "Export" button in the header.
  - **Place Cards:** "Navigate" icon button on individual place cards (in lists, saved places, and route days).

## Files
### New Components & Utilities
- `src/utils/maps/export-to-maps.ts`: Utility functions for generating URL schemes for Google/Apple Maps.
- `src/components/maps/ExportToMapsButton.tsx`: Reusable button component with dropdown for map selection.

### Modified Files
- `src/pages/RouteDetail.tsx`: Added export button.
- `src/pages/collections/CollectionDetailPage.tsx`: Added export button.
- `src/components/home/category/recommendation-item/ItemActions.tsx`: Replaced old map link with new export button.
- `src/components/routes/DaySection.tsx`: Added export button to place items.
- `src/components/home/places/PlaceCard.tsx`: Added export button to place cards.

### Deleted Files (Cleanup)
- `ios/App/App/AppleMapsPlugin.swift`
- `ios/App/App/AppleMapsPlugin 2.swift`
- `ios/App/App/AppleMapsPlugin.m`
- `src/plugins/apple-maps-plugin.ts`
- `src/components/map/NativeMapView.tsx`
- `src/components/map/MapPlacePreview.tsx`

## Verification
- **Build:** Clean build verified.
- **Xcode:** "App" scheme restored and project file cleaned of missing references.
- **Testing:** Verified on iOS Simulator/Device (User confirmed).

---
*Last updated: December 22, 2024*
