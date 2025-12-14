# App Store & TestFlight Deployment Guide

**Last Updated:** December 2025

This document tracks the progress toward Apple TestFlight and App Store submission for Travelist.

---

## 📊 Current Status

| Requirement | Status | Notes |
|-------------|--------|-------|
| Apple Developer Account | ⏳ Pending | Purchased Dec 14, 2025 (Individual) |
| Privacy Manifest | ✅ Complete | `ios/App/App/PrivacyInfo.xcprivacy` |
| App Icon | ✅ Complete | 1024x1024 in Assets.xcassets |
| Bundle ID | ✅ Complete | `com.travelist.app` |
| iOS Project Setup | ✅ Complete | Capacitor 7.4.4 |
| Privacy Policy URL | ✅ Complete | https://morhogeg.github.io/travelist/PRIVACY_POLICY |
| Support URL | ✅ Complete | https://morhogeg.github.io/travelist/SUPPORT |
| App Store Connect | ❌ Not created | Requires active developer account |
| Screenshots | ❌ Needed | Required for external TestFlight |
| Signing & Certificates | ❌ Pending | Auto-managed in Xcode |

---

## ✅ Completed Steps

### 1. iOS Project Configuration
- [x] Capacitor iOS project set up
- [x] Bundle ID: `com.travelist.app`
- [x] App name: `Travelist`
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

---

## ⏳ Pending Steps

### 4. Developer Account Activation
- [ ] Wait for Apple to process enrollment (typically 24-48 hours)
- [ ] Two-factor authentication enabled
- [ ] Sign into Xcode with Apple ID

### 5. Add Privacy Manifest to Xcode Project
After developer account is active:
1. Open `ios/App/App.xcworkspace` in Xcode
2. Right-click **App** folder → **Add Files to "App"...**
3. Select `PrivacyInfo.xcprivacy`
4. Click **Add**

### 6. Create Privacy Policy & Support URLs
- [ ] Create a privacy policy webpage (can be hosted on GitHub Pages, Notion, etc.)
- [ ] Create a support page or email address

**Sample Privacy Policy Topics:**
- What data is collected (email for optional account)
- How data is stored (locally, optionally synced to cloud)
- Third-party services (Supabase for auth, OpenRouter for AI)
- No tracking or advertising
- Contact information

### 7. Xcode Signing Configuration
- [ ] Open project in Xcode
- [ ] Select **App** target → **Signing & Capabilities**
- [ ] Choose your **Team** (Apple Developer account)
- [ ] Enable **Automatically manage signing**
- [ ] Verify no signing errors

### 8. Set Version & Build Number
In Xcode project settings:
- [ ] Version (MARKETING_VERSION): `1.0.0`
- [ ] Build (CURRENT_PROJECT_VERSION): `1`

### 9. Create App in App Store Connect
1. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. **My Apps** → **+** → **New App**
3. Fill in:
   - Name: `Travelist`
   - Bundle ID: `com.travelist.app`
   - SKU: `TRAVELIST001`
   - Primary Language: English
   - Category: Travel

### 10. Prepare App Store Listing (for external TestFlight)
- [ ] Description (up to 4000 chars)
- [ ] Keywords (up to 100 chars total)
- [ ] Privacy Policy URL
- [ ] Support URL

### 11. Create Screenshots
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

---

## 🚀 Upload Process

### TestFlight Upload Steps
1. **Build the app**
   ```bash
   npm run build && npx cap copy ios
   ```

2. **Archive in Xcode**
   - Open `ios/App/App.xcworkspace`
   - Select **Product** → **Archive**
   - Wait for archive to complete

3. **Distribute to App Store Connect**
   - In Organizer: **Distribute App**
   - Select **App Store Connect** → **Upload**
   - Follow prompts

4. **Configure TestFlight**
   - Wait for build processing (5-30 min)
   - Complete Export Compliance questionnaire
   - Add testers

### Internal vs External Testing
| Type | Testers | Review Required | Limit |
|------|---------|-----------------|-------|
| Internal | Team members | No | 100 |
| External | Anyone with link | Yes (1-2 days) | 10,000 |

---

## 📋 Pre-Upload Checklist

Before archiving:
- [ ] App builds without errors
- [ ] App runs on real device
- [ ] All features work correctly
- [ ] No crashes on launch
- [ ] Version/build numbers correct
- [ ] Privacy manifest added to project
- [ ] Signing configured properly

---

## 📚 Reference Links

- [Apple Developer Program](https://developer.apple.com/programs/)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Privacy Manifest Documentation](https://developer.apple.com/documentation/bundleresources/privacy_manifest_files)
- [TestFlight Documentation](https://developer.apple.com/testflight/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
