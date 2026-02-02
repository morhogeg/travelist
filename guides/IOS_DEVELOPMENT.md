# 📱 Travelist - iOS Development Guide

## Project Overview

**Project Name:** Travelist
**Type:** iOS travel recommendation management app
**Location:** `/Users/morhogeg/Desktop/TravelApp/travelist`
**Status:** iOS conversion complete, ready for optimization

---

## Tech Stack

### Core
- **React** 18.3.1 - UI library
- **TypeScript** 5.5.3 - Type safety
- **Vite** 5.4.1 - Build tool and dev server
- **Capacitor** - iOS native wrapper
- **Firebase** - Auth, Firestore, and Vertex AI (Gemini)

### UI/Styling
- **Tailwind CSS** 3.4.11 - Styling
- **shadcn/ui** - Component library (built on Radix UI)
- **Framer Motion** 12.5.0 - Animations

### Forms & Validation
- **React Hook Form** 7.53.0 - Form management
- **Zod** 3.23.8 - Schema validation

### Data & State
- **React Router DOM** 6.26.2 - Client-side routing
- **Firestore** - Centralized cloud storage with offline persistence
- **Firebase Auth** - Email/password identity management
- **Custom window events** - Cross-component communication

### External APIs
- **Pexels API** - Travel images (key in `.env`)

---

## Development Setup

### Installed & Configured
- ✅ Capacitor core, CLI, and iOS platform
- ✅ iOS project created (`ios/App/` folder)
- ✅ Live reload configured
- ✅ Xcode project workspace ready
- ✅ Code signing configured

### Live Reload Workflow

**1. Start Dev Server**
```bash
cd /Users/morhogeg/Desktop/TravelApp/travelist
npm run dev -- --host
```

**Must see:**
```
➜  Network: http://192.168.0.108:5173/
```

**2. Run in Xcode**
```bash
npx cap open ios
# OR open: ios/App/App.xcworkspace
```

Then press ▶️ Play button (Cmd + R)

**3. Code in VS Code**
- Edit any `.tsx` or `.ts` file
- Save (Cmd + S)
- Simulator auto-updates! ✨

---

## Key Configuration Files

### capacitor.config.ts
```typescript
{
  appId: 'com.travelist.app',
  appName: 'Travelist',
  webDir: 'dist',
  server: {
    // LIVE RELOAD - Comment out for production!
    url: 'http://192.168.0.108:5173',
    cleartext: true
  }
}
```

**⚠️ IMPORTANT:** Remove `server` section before App Store builds!

### package.json scripts
```bash
npm run dev              # Dev server (add -- --host for iOS)
npm run build            # Production build
npm run ios:sync         # Build + sync to iOS
npm run ios:open         # Open Xcode
```

---

## App Structure & Features

### Core Functionality
- **Collect recommendations** - Structured form or free-text parsing
- **Organize by location** - Country → City → Recommendations
- **Categorize** - 7 categories with colors/icons
- **Collections** - Group places into trip plans
- **Track visits** - Mark places as visited
- **Search & filter** - Find places and destinations

### Categories
1. 🍴 **Food** - Restaurants, cafes (#FEC6A1)
2. 🏨 **Lodging** - Hotels, hostels (#E5DEFF)
3. 🎭 **Attractions** - Museums, landmarks (#FFDEE2)
4. 🛍️ **Shopping** - Markets, stores (#D3E4FD)
5. 🌙 **Nightlife** - Bars, clubs (#accbee)
6. 🌲 **Outdoors** - Parks, hiking (#F2FCE2)
7. 📍 **General** - Everything else (#eef1f5)

### Data Storage
**Method:** Browser LocalStorage (no backend)

**Keys:**
- `recommendations` - Array of recommendation objects
- `travelist-collections` - Array of collections
- `theme` - Light/dark preference

---

## Project Structure

```
src/
├── pages/                    # Route components
│   ├── Index.tsx            # Home - all recommendations
│   ├── CountryView.tsx      # Country-specific view
│   ├── Profile.tsx          # User profile
│   ├── Settings.tsx         # Settings page
│   └── collections/         # Collection pages
├── components/
│   ├── layout/              # App layout & navigation
│   ├── home/                # Home page components
│   │   └── category/        # Recommendation display
│   ├── recommendations/     # Add/edit forms
│   │   ├── forms/           # Structured & free-text
│   │   └── utils/           # Category definitions
│   ├── collections/         # Collection components
│   └── ui/                  # shadcn/ui primitives
├── hooks/                   # Custom React hooks
├── utils/
│   ├── recommendation/      # Core business logic
│   │   ├── recommendation-manager.ts
│   │   ├── filter-helpers.ts
│   │   ├── parser/          # Text parsing
│   │   └── pexels/          # Image fetching
│   └── collections/
└── App.tsx                  # Root with routing

ios/                         # Native iOS project
capacitor.config.ts          # Capacitor configuration
```

---

## Current Status

### ✅ Completed
- Capacitor installation and configuration
- iOS platform added and configured
- Xcode project created
- Live reload working (VS Code → Xcode simulator)
- Code signing configured
- App running successfully in simulator

### 🎯 Next Steps: iOS Optimizations
1. **Safe Area Support** - Handle iPhone notch/Dynamic Island ✓
2. **Status Bar Styling** - Configure iOS status bar ✓
3. **iOS 15+ Requirement** - Minimum version bumped to support Firebase AI features
4. **Native AI Bridge** - Leverages `FirebaseVertexAI` for stable Gemini access

---

## Important Notes

### Development
- User codes in **VS Code** with **Claude Code**
- Previews changes in **Xcode iOS Simulator**
- Focus is on **iOS mobile app** (not web anymore)
- Live reload must always work

### Troubleshooting
- If IP changes: Update `capacitor.config.ts` and run `npx cap sync ios`
- If port changes: Check terminal output and update config
- Always use `-- --host` flag with `npm run dev`
- Rebuild in Xcode (Cmd + R) after config changes

### Production Builds
1. Comment out `server` section in `capacitor.config.ts`
2. Run `npm run build`
3. Run `npx cap sync ios`
4. Build in Xcode for App Store

---

## Quick Commands

```bash
# Development
npm run dev -- --host        # Start dev server with network
npx cap sync ios            # Sync web → iOS
npx cap open ios            # Open Xcode

# Utilities
ipconfig getifaddr en0      # Get local IP
npx cap update              # Update Capacitor

# Production
npm run build               # Build for production
```

---

## Contact & Context

**User:** Prefers Claude Code in VS Code
**Machine:** macBook Pro
**IP (current):** 192.168.0.108
**Xcode Version:** 26.1.1
**Simulator:** iPhone 17 Pro (iOS 26.1)

---

**Last Updated:** 2025-11-16
**Ready for:** iOS-specific code optimizations
