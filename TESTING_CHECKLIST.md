# Testing Checklist - Build 7

Use this checklist before uploading to TestFlight to verify all recent changes are working correctly.

---

## 🆕 New Features to Test

### 1. Free AI Models (Zero API Cost)
- [ ] **Add Recommendation (Structured)**: Create a new place using the structured form
- [ ] **Add Recommendation (Free Text)**: Paste text like "My friend said the pizza at Luigi's is amazing" and verify AI parsing works
- [ ] **AI Place Description**: Find a place without a description, tap "Get info from Travelist AI", verify it generates a description
- [ ] **AI Suggestions**: (If implemented) Test personalized suggestions feature

**Expected**: All AI features should work with no API errors. Check that responses are reasonable and accurate.

---

## 🔧 App Store Cleanup Changes

### 2. Production Logging
- [ ] **Build the app in Release mode** (Xcode → Product → Scheme → Edit Scheme → Run → Release)
- [ ] **Check Console**: Verify NO debug console.log statements appear (only errors should show)

**Expected**: Clean console output in production builds.

### 3. Bundle Size
- [ ] **Check app size** in Xcode after building
- [ ] Compare to previous build (should be ~1MB smaller)

**Expected**: Smaller app size due to removed unused components.

---

## ✅ Core Features (Regression Testing)

### 4. Add Recommendation
- [x] **Structured Form**: Already tested ✅
- [x] **Free Text AI**: Already tested ✅
- [ ] **Share Extension**: Share a Google Maps link from Safari → Travelist
- [ ] **Share Text**: Share text from Notes → Travelist

### 5. Search & Filters
- [ ] **Search**: Type a place name in the search bar
- [ ] **Filter by Category**: Open filter drawer, select "Food"
- [ ] **Filter by Visited**: Toggle "Visited" filter
- [ ] **Filter by Source**: Filter by a friend's name

### 6. Proximity Alerts
- [ ] **Enable Proximity**: Settings → Proximity Alerts → Enable
- [ ] **Select City**: Tap "Manage Cities", enable a city
- [ ] **Set Distance**: Adjust distance slider (e.g., 500m)
- [ ] **Test Notification**: (If near a saved place) Verify notification appears

### 7. Collections & Routes
- [ ] **Create Collection**: Profile → Collections → Create new collection
- [ ] **Add to Collection**: Add places to the collection
- [ ] **Create Route**: Profile → Routes → Create new route
- [ ] **Add to Route**: Add places to the route

### 8. Profile & Settings
- [ ] **Profile Page**: Navigate to Profile, verify stats display
- [ ] **Settings**: Open Settings, verify all options load
- [ ] **Guides**: Open Guides section, verify content loads

---

## 🐛 Known Issues to Watch For

### Fixed Issues (Should NOT Occur)
- ❌ "Add Recommendation" button not working → **FIXED**
- ❌ AI models returning 404 or rate limit errors → **FIXED**

### Potential Issues to Monitor
- ⚠️ Any console errors in development mode
- ⚠️ Slow AI response times (free models may be slower)
- ⚠️ Missing place descriptions after AI generation

---

## 📱 Device Testing

Test on at least:
- [ ] iPhone (physical device)
- [ ] iPad (if supported)
- [ ] iOS Simulator

---

## ✅ Sign-Off

- [ ] All critical features tested and working
- [ ] No crashes or major bugs found
- [ ] App size is acceptable
- [ ] Ready for TestFlight upload

**Tester**: _______________  
**Date**: _______________  
**Build Number**: _______________
