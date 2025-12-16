# Apple Maps Implementation Status

> **Command Word:** `CONTINUE_APPLE_MAPS`
> 
> Use this command in a new chat to pick up where we left off.

## Current Status: 80% Complete - Needs Xcode Project Fix

### What Works
- ✅ Native Apple Maps view renders with MapKit
- ✅ Plugin registered via `MyViewController.swift` with `CAPBridgedPlugin`
- ✅ Map toggle button on home page (iOS only)
- ✅ Geocoding places from addresses
- ✅ 6 places counter badge visible
- ✅ "List View" button visible with blur effect
- ✅ Category-colored pins with icons

### What's Broken
1. **"List View" button not functional** - tapping doesn't return to list view
2. **Xcode project has duplicate files** - "AppleMapsPlugin" and "AppleMapsPlugin 2"
3. **Build scheme shows "ShareExtension"** - App scheme may be missing
4. **Pins not visible on map** - markers geocoded but not displaying

---

## Files Created/Modified

### Native iOS Files (`ios/App/App/`)
| File | Purpose |
|------|---------|
| `AppleMapsPlugin.swift` | Main plugin with MKMapView, FloatingHeader, back button |
| `MyViewController.swift` | Registers plugin via `bridge?.registerPluginInstance()` |
| `AppleMapsPlugin.m` | *DELETED* - Not needed with CAPBridgedPlugin |

### TypeScript Files (`src/`)
| File | Purpose |
|------|---------|
| `plugins/apple-maps-plugin.ts` | Plugin interface with `showMap`, `hideMap`, `addMarkers`, `backTap` events |
| `components/map/NativeMapView.tsx` | React component managing map lifecycle |
| `components/map/MapPlacePreview.tsx` | Preview card for tapped pins |
| `pages/Index.tsx` | Map/list toggle with `viewMode` state |

### Storyboard Change
- `Main.storyboard` → Changed ViewController class from `CAPBridgeViewController` to `MyViewController`

---

## Known Issues to Fix

### 1. Xcode Project Cleanup Required
The user's Xcode project has:
- Duplicate `AppleMapsPlugin` files (one named "AppleMapsPlugin 2")
- Missing "App" scheme - only "ShareExtension" showing
- Files may be pointing to wrong locations

**Fix:** 
1. Delete both AppleMapsPlugin entries from Xcode
2. Re-add `ios/App/App/AppleMapsPlugin.swift` properly
3. Ensure "App" scheme exists in scheme selector

### 2. Event Listener for Back Button
The `backTap` event fires from Swift but JS listener may not be receiving it.

**Debug steps:**
- Check Xcode console for: `[AppleMapsPlugin] Back button tapped`
- Check web console for: `[NativeMapView] Back button tapped`

### 3. Map Type
User reported satellite view, but code sets `.standard`. May need `.mutedStandard` for cleaner look.

---

## Code Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   React (Index.tsx)                        │
│  ┌─────────────┐    viewMode: 'list' | 'map'              │
│  │ Toggle Btn  │────────────────────────────────────────► │
│  └─────────────┘                                          │
│         │                                                  │
│         ▼                                                  │
│  ┌─────────────────────────────────────────────────────┐  │
│  │           NativeMapView.tsx                         │  │
│  │  - Calls AppleMaps.showMap()                        │  │
│  │  - Listens for 'backTap' → onBack()                 │  │
│  │  - Passes markers to addMarkers()                   │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ Capacitor Bridge
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              AppleMapsPlugin.swift                         │
│  ┌─────────────────┐  ┌─────────────────┐                 │
│  │   MKMapView     │  │ FloatingHeader  │                 │
│  │   (Native Map)  │  │ - Back Button   │                 │
│  │                 │  │ - Place Count   │                 │
│  └─────────────────┘  └─────────────────┘                 │
│                              │                             │
│  backButtonTapped() ─► notifyListeners("backTap")         │
└─────────────────────────────────────────────────────────────┘
```

---

## Next Steps for New Chat

1. **Fix Xcode project** - Delete duplicates, re-add AppleMapsPlugin.swift correctly
2. **Restore App scheme** - May need to recreate via Product → Scheme → New Scheme
3. **Test back button** - Verify event flows from Swift → JS
4. **Pin visibility** - Debug why markers aren't appearing on map
5. **Polish UI** - Ensure design matches app's Liquid Glass aesthetic

---

## Quick Commands

```bash
# Build and sync to iOS
npm run build && npx cap copy ios

# Open Xcode
npx cap open ios

# Clean Xcode build
# In Xcode: Cmd + Shift + K
```

---

*Last updated: December 16, 2024*
