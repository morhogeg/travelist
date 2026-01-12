# Travelist Project Guides

This folder contains all documentation and reference materials for the Travelist iOS app.

---

## 📚 Documentation Files

### 🚀 [CONTEXT.md](./CONTEXT.md) - **START HERE**
**Quick reference for session continuation**

Best for: Jumping back into development, understanding current state, finding key files

Contains:
- Current project status
- Quick start commands
- Key file locations
- Design system reference (colors, spacing, components)
- Recent changes summary
- Development conventions
- Code examples for common tasks

**Use this when:** Starting a new session or need a quick refresher

---

### 🎨 [IOS26_TRANSFORMATION.md](./IOS26_TRANSFORMATION.md)
**Deep dive into the iOS 26 Liquid Glass design system**

Best for: Understanding the design philosophy, learning about Liquid Glass materials

Contains:
- Complete iOS 26 design system documentation
- Liquid Glass materials (5 types)
- iOS system colors and typography
- Animation system
- Before/after comparisons
- How to use the design system
- Pro tips and best practices

**Use this when:** Implementing new UI features, understanding design decisions, applying Liquid Glass

---

### 📋 [ROADMAP.md](./ROADMAP.md)
**Complete to-do list and future plans**

Best for: Planning next features, understanding priorities, tracking progress

Contains:
- ✅ Completed features
- 🎯 Immediate next steps
- 🚀 Short-term goals (1-2 weeks)
- 📱 Medium-term goals (1-2 months)
- 🏆 App Store preparation checklist
- 💡 Future ideas backlog
- 🔧 Technical debt items

**Use this when:** Deciding what to build next, updating project status, planning sprints

---

### 🛠️ [IOS_DEVELOPMENT.md](./IOS_DEVELOPMENT.md)
**iOS development setup and workflows**

Best for: Setting up the development environment, running on device/simulator

Contains:
- Capacitor configuration
- iOS project setup
- Running on simulator/device
- Building and deploying
- Native plugin usage
- Troubleshooting common issues

**Use this when:** Setting up a new machine, deploying to device, debugging iOS-specific issues

---

### 🎛️ [FILTERS_AND_LAYOUT.md](./FILTERS_AND_LAYOUT.md)
**Filter system architecture and header layout best practices**

Best for: Understanding filter implementation, iOS layout patterns, touch target standards

Contains:
- Complete filter system architecture
- Filter types and components
- Header layout patterns (iOS HIG compliant)
- 44px touch target standards
- Development workflow (build:sync, watch script)
- Component reference and usage examples
- Common issues and solutions

**Use this when:** Working with filters, implementing iOS-compliant layouts, debugging touch interactions

---

## 💡 Quick Usage Guide

### For AI Assistants (Claude):
When starting a new session, user might say:
- "Check the guides folder and continue with X"
- "Read CONTEXT.md and implement Y"
- "Look at ROADMAP.md and pick the next priority"

**Recommended approach:**
1. Always start with `CONTEXT.md` for current state
2. Reference `IOS26_TRANSFORMATION.md` for design patterns
3. Check `FILTERS_AND_LAYOUT.md` for filter system and iOS layout patterns
4. Check `ROADMAP.md` for feature priorities
5. Use `IOS_DEVELOPMENT.md` when dealing with iOS/Capacitor

### For Developers:
1. **New to project?** Read files in this order:
   - CONTEXT.md → IOS26_TRANSFORMATION.md → FILTERS_AND_LAYOUT.md → ROADMAP.md → IOS_DEVELOPMENT.md

2. **Continuing work?**
   - CONTEXT.md (get up to speed quickly)

3. **Implementing UI?**
   - IOS26_TRANSFORMATION.md (design system reference)
   - FILTERS_AND_LAYOUT.md (layout patterns and touch standards)

4. **Working with filters?**
   - FILTERS_AND_LAYOUT.md (complete filter system docs)

5. **Planning features?**
   - ROADMAP.md (see what's next)

6. **iOS issues?**
   - IOS_DEVELOPMENT.md (troubleshooting guide)

---

## 🎯 Current Project State

**Status:** First TestFlight build uploaded ✅
**Theme:** Purple Gradient (#667eea → #764ba2)
**Branch:** main
**Last Updated:** January 12, 2026

**Recent Milestones:**
✅ TestFlight internal testing build uploaded
✅ App Store compliance (account deletion, privacy policy)
✅ Share Extension working
✅ Onboarding flow redesigned (5 screens)
✅ AI trip planning with Travelist AI

**Next Priorities:**
1. Bug fixes from TestFlight testing
2. Cloud sync improvements
3. App Store submission preparation

---

## 📁 Folder Structure

```
guides/
├── README.md                    ← You are here
├── CONTEXT.md                   ← Start here for quick reference
├── IOS26_TRANSFORMATION.md      ← Design system deep dive
├── FILTERS_AND_LAYOUT.md        ← Filter system & layout patterns
├── ROADMAP.md                   ← To-do list and plans
├── IOS_DEVELOPMENT.md           ← iOS setup and deployment
├── UI_UX_PATTERNS.md            ← Component patterns
├── ONBOARDING.md                ← Onboarding flow docs
├── AI_SUGGESTIONS.md            ← AI features
├── SHARE_EXTENSION_STATUS.md    ← Share Extension docs
├── CODE_MAINTENANCE.md          ← Code standards
└── APP_STORE_DEPLOYMENT.md      ← App Store prep
```

---

## 🔄 Keeping Documentation Updated

When making significant changes:

1. **Update CONTEXT.md** - Add to "Recent Changes Summary"
2. **Update ROADMAP.md** - Check off completed items, add new ones
3. **Update IOS26_TRANSFORMATION.md** - If design system changes
4. **Update FILTERS_AND_LAYOUT.md** - If filter system or layout patterns change
5. **Update IOS_DEVELOPMENT.md** - If iOS setup/config changes

---

## 💬 Common Questions

**Q: Where do I find the purple gradient code?**
A: CONTEXT.md → Design System Reference section

**Q: What files do I need to edit for UI changes?**
A: CONTEXT.md → Key Files & Locations section

**Q: What should I build next?**
A: ROADMAP.md → Immediate Next Steps section

**Q: How do I run the iOS app?**
A: IOS_DEVELOPMENT.md or CONTEXT.md → Quick Start Commands

**Q: How does the filter system work?**
A: FILTERS_AND_LAYOUT.md → Filter System Architecture section

**Q: What are iOS touch target standards?**
A: FILTERS_AND_LAYOUT.md → iOS Touch Target Standards section

**Q: What's the current status of the project?**
A: CONTEXT.md → Current Status section

---

Last Updated: January 2026
