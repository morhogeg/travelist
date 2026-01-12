---
description: Upload a new build to TestFlight for testing
---

# TestFlight Upload Workflow

## Pre-Upload Checklist
- [ ] All bug fixes committed to git
- [ ] `npm run build` succeeds without errors
- [ ] App tested locally via `npm run dev`

## Steps

### 1. Increment build number in Xcode
Open `ios/App/App.xcodeproj` → App target → General tab:
- **Version**: Keep as `1.0` (or increment for major releases)
- **Build**: Increment by 1 (e.g., `1` → `2` → `3`)

### 2. Build production bundle
```bash
npm run build
npx cap sync ios
```

### 3. Open Xcode
```bash
npx cap open ios
```

### 4. Archive and upload
1. Select **"Any iOS Device (arm64)"** as build target
2. **Product → Archive** (or Cmd + Shift + B then Product → Archive)
3. When archive completes, click **Distribute App**
4. Select **App Store Connect** → **Upload**
5. Use **Automatically manage signing**
6. Click **Upload**

### 5. Wait for processing
- Takes 5-15 minutes
- Check App Store Connect → TestFlight for status

### 6. Test on device
- Open TestFlight app on iPhone
- New build appears automatically (internal testers)
- Install and test

---

## Version History

| Build | Date | Changes |
|-------|------|---------|
| 1 | Jan 9, 2026 | Initial TestFlight upload |
| 2 | | |

---

## Quick Reference

```bash
# Full upload sequence
npm run build && npx cap sync ios && npx cap open ios
```
