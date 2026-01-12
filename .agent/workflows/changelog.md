---
description: Update changelog for TestFlight releases and feature tracking
---

# Changelog Update Workflow

Use this workflow to properly update the CHANGELOG.md file for TestFlight version management.

## When to Use

- After completing a feature or bug fix
- Before uploading a new TestFlight build
- When finalizing a version for release

## Steps

### 1. Read Current Changelog
First, view the current state of the changelog:
```
view_file /Users/morhogeg/travelist-2/CHANGELOG.md (lines 1-50)
```

### 2. Add New Entries to [Unreleased]

Add entries under the appropriate category in the `[Unreleased]` section:

- **✨ Added** - New features
- **🐛 Fixed** - Bug fixes  
- **🔧 Changed** - Changes to existing functionality
- **🗑️ Removed** - Removed features

Format each entry as:
```markdown
- **Feature Name** - Brief description
  - Sub-detail if needed
  - Another sub-detail
```

### 3. When Uploading to TestFlight

When ready to upload to TestFlight, do the following:

1. **Rename [Unreleased] to versioned section:**
   ```markdown
   ## [1.0.X] - YYYY-MM-DD
   ```

2. **Create fresh [Unreleased] section above it:**
   ```markdown
   ## [Unreleased] - Next TestFlight Build
   
   > **Instructions:** Add features/fixes here as they're completed.
   
   ### ✨ Added
   - (none yet)
   
   ### 🐛 Fixed
   - (none yet)
   
   ### 🔧 Changed
   - (none yet)
   
   ---
   ```

3. **Update version in Xcode** (General → Version and Build)

4. **Copy changelog entries to App Store Connect** "What to Test" field

### 4. Verify Format

Ensure the changelog follows this structure:
```
# Changelog

## [Unreleased] - Next TestFlight Build
### ✨ Added
### 🐛 Fixed
### 🔧 Changed

---

## [1.0.1] - 2026-01-15
### ✨ Added
### 🐛 Fixed

---

## [1.0.0] - 2026-01-10
...
```

## Example Entry

For a proximity notifications feature:
```markdown
### ✨ Added
- **Proximity Notifications** - Get notified when near saved places
  - Custom distance slider (100m - 2km)
  - Per-city enable/disable toggles
  - Notification tap opens place card
```
