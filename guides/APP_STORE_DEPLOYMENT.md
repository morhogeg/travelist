# App Store & TestFlight Deployment Guide

**Last Updated:** January 2026

This document tracks the progress toward Apple TestFlight and App Store submission for Travelist AI.

---

## 📊 Current Status

| Requirement | Status | Notes |
|-------------|--------|-------|
| Apple Developer Account | ✅ Active | Individual account (Mor Hogeg) |
| Privacy Manifest | ✅ Complete | `ios/App/App/PrivacyInfo.xcprivacy` |
| App Icon | ✅ Complete | 1024x1024 in Assets.xcassets |
| Bundle ID | ✅ Complete | `com.travelist.app` |
| iOS Project Setup | ✅ Complete | Capacitor 7.4.4 |
| Privacy Policy URL | ✅ Complete | https://morhogeg.github.io/travelist/PRIVACY_POLICY |
| Support URL | ✅ Complete | https://morhogeg.github.io/travelist/SUPPORT |
| App Store Connect | ✅ Created | App name: "Travelist AI" |
| Signing & Certificates | ✅ Complete | Auto-managed in Xcode |
| TestFlight (Internal) | ✅ Live | Build 1.0 (1) available |
| Screenshots | ❌ Needed | Required for external TestFlight |

---

## ✅ Completed Steps

### 1. iOS Project Configuration
- [x] Capacitor iOS project set up
- [x] Bundle ID: `com.travelist.app`
- [x] App name: `Travelist AI`
- [x] Info.plist configured
- [x] URL scheme: `travelist://`
- [x] CocoaPods dependencies installed

### 2. Privacy Manifest (PrivacyInfo.xcprivacy)
Created and committed. Declares:
- [x] No tracking (`NSPrivacyTracking: false`)
- [x] Email collection for optional cloud sync
- [x] UserDefaults API (CA92.1) - localStorage
- [x] File Timestamp API (C617.1) - sync operations
- [x] System Boot Time API (35F9.1) - timing/performance

### 3. App Icon
- [x] `AppIcon-512@2x.png` (1024x1024) exists
- [x] Located in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

### 4. Developer Account & Signing
- [x] Apple Developer Account active
- [x] Two-factor authentication enabled
- [x] Signed into Xcode with Apple ID
- [x] Automatic signing configured for App target
- [x] Automatic signing configured for ShareExtension target
- [x] Device registered for development

### 5. App Store Connect Setup
- [x] App created: "Travelist AI"
- [x] Bundle ID: `com.travelist.app`
- [x] SKU configured
- [x] Category: Travel
- [x] Subtitle: "Never Forget a Place Again"
- [x] Content rights declared
- [x] Export compliance completed (no encryption)

### 6. Share Extension Fix
- [x] Updated `NSExtensionActivationRule` from `TRUEPREDICATE` to proper dictionary
- [x] Supports text, web URLs, and web pages

### 7. TestFlight Configuration
- [x] Build 1.0 (1) uploaded: January 9, 2026
- [x] Export compliance completed
- [x] Internal testing group created: "Mor's Team"
- [x] Automatic distribution enabled
- [x] App installed via TestFlight

---

## ⏳ Pending Steps (for External TestFlight / App Store)

### 8. Create Screenshots
Capture in iOS Simulator:
- [ ] 6.7" iPhone (1290 × 2796) - iPhone 15 Pro Max
- [ ] 6.5" iPhone (1242 × 2688) - iPhone 11 Pro Max
- [ ] 5.5" iPhone (1242 × 2208) - iPhone 8 Plus

Recommended screens to capture:
1. Home view with recommendations
2. Place detail view
3. Routes tab
4. Route detail with places
5. Collections tab
6. Share Extension in action

### 9. Complete App Store Listing
- [ ] Full description (up to 4000 chars)
- [ ] Keywords (up to 100 chars total)
- [ ] What's New text
- [ ] Age rating questionnaire

### 10. Submit for External TestFlight Review
- [ ] Upload screenshots
- [ ] Complete app description
- [ ] Submit for Beta App Review (1-2 days)

### 11. Submit for App Store Review
- [ ] Complete all App Store listing fields
- [ ] Submit for full review
- [ ] Address any review feedback

---

## 🚀 Upload Process

### Quick TestFlight Update
```bash
# 1. Build production bundle
npm run build:prod && npx cap sync ios

# 2. Open Xcode
npx cap open ios

# 3. In Xcode:
#    - Select "Any iOS Device (arm64)"
#    - Product → Archive
#    - Distribute App → App Store Connect → Upload
```

### Build Numbers
For each new upload, increment the build number in Xcode:
- Version (MARKETING_VERSION): `1.0.0` (change for new features)
- Build (CURRENT_PROJECT_VERSION): `2`, `3`, etc. (increment each upload)

---

## 📋 Pre-Upload Checklist

Before archiving:
- [x] App builds without errors
- [x] App runs on real device
- [x] All features work correctly
- [x] No crashes on launch
- [x] Version/build numbers correct
- [x] Privacy manifest added to project
- [x] Signing configured properly
- [x] ShareExtension activation rules valid

---

## 📱 TestFlight Info

| Property | Value |
|----------|-------|
| App Name | Travelist AI |
| Bundle ID | com.travelist.app |
| Current Version | 1.0 |
| Current Build | 1 |
| Testing Group | Mor's Team |
| Distribution | Automatic |

---

## 📚 Reference Links

- [Apple Developer Program](https://developer.apple.com/programs/)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Privacy Manifest Documentation](https://developer.apple.com/documentation/bundleresources/privacy_manifest_files)
- [TestFlight Documentation](https://developer.apple.com/testflight/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
