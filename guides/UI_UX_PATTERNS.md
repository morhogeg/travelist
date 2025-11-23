# UI/UX Design Patterns & Conventions

**Last Updated:** November 2025

This guide documents the established UI/UX patterns, design decisions, and conventions used throughout the Travelist app.

---

## 🎨 Color System

### Primary Gradient (App Purple)
The app's signature purple gradient is used consistently across interactive elements:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
```

**Used in:**
- Active category pills
- Select dropdown highlights (both hover and selected states)
- Primary action buttons
- Floating add button
- Filter drawer title and reset button
- Attribution pills on recommendation cards

### Category Color System
Each category has a dedicated color gradient for visual distinction:

**Food (Orange/Warm):**
```css
--category-food-from: 251 86% 58%;  /* #FB923C */
--category-food-to: 24 95% 53%;     /* #F97316 */
```

**Lodging (Blue/Cool):**
```css
--category-lodging-from: 217 91% 60%;  /* #3B82F6 */
--category-lodging-to: 221 83% 53%;    /* #2563EB */
```

**Attractions (Purple):**
```css
--category-attractions-from: 258 90% 66%;  /* #A78BFA */
--category-attractions-to: 262 83% 58%;    /* #8B5CF6 */
```

**Shopping (Pink):**
```css
--category-shopping-from: 330 81% 60%;  /* #F472B6 */
--category-shopping-to: 333 71% 51%;    /* #EC4899 */
```

**Nightlife (Indigo):**
```css
--category-nightlife-from: 239 84% 67%;  /* #818CF8 */
--category-nightlife-to: 243 75% 59%;    /* #6366F1 */
```

**Usage:** Category badges, emoji backgrounds (future), and accent colors

### Dark Mode
- Background: `#0E0E0E` (HSL: 0 0% 5.5%) - Softer than pure black
- Provides better visual comfort while maintaining OLED benefits
- Category colors are slightly more vibrant in dark mode for better visibility

---

## 📏 Component Alignment & Spacing

### Standard Component Height
**Button/Pill Height:** All interactive buttons and pills use consistent sizing:
```css
min-h-11  /* 44px minimum (iOS touch target) */
```

**Examples:**
- CategoryPill: `min-h-11 py-2.5 px-4`
- SearchButton: `min-h-11 min-w-11 rounded-full`
- FilterButton: `min-h-11 min-w-11 rounded-full`
- This ensures perfect vertical alignment when placed side-by-side

### Search/Toggle Button Positioning
**Left-aligned buttons:**
```css
left-3 top-3  /* Back button */
left-[4rem]   /* Search button, positioned next to back button */
```

**Right-aligned:**
```css
right-3 top-3  /* View toggle */
```

**Pattern used in:**
- Home view: Search (left) + View toggle (right)
- City view: Back (left) + Search (left, offset) + View toggle (right)
- Country view: Back (left) + Search (left, offset) + View toggle (right)

---

## 🍎 iOS-Native UI Patterns

### Bottom Sheets/Drawers
**Header Design:**
- Title on the left (bold, purple, `leading-none` for perfect alignment)
- Action button on the right (text-only, no background)
- No close button (users swipe down or tap backdrop to dismiss)

**Example (FilterSheet):**
```tsx
<div className="flex items-center justify-between">
  <h2 className="text-xl font-bold text-[#667eea] leading-none">Filters</h2>
  {hasFilters && (
    <button className="text-sm font-semibold text-[#667eea]">
      Reset
    </button>
  )}
</div>
```

### Interactive Element Behaviors
**Click Interactions:**
- Separate clickable areas should have distinct handlers
- Use `e.stopPropagation()` to prevent event bubbling
- Example: City header - city name navigates, chevron toggles collapse

**Haptic Feedback:**
- Medium haptic: Primary actions (add, delete, filter changes)
- Light haptic: Secondary actions (toggle, expand/collapse)

---

## 📝 Form Field Conventions

### Select Dropdowns
**Placeholder text:** Clean, no decorative characters
```tsx
// ✅ Good
<SelectItem value="_placeholder">Select a country</SelectItem>

// ❌ Bad
<SelectItem value="_placeholder">-- Select a country --</SelectItem>
```

**Highlight styling:** Use app's purple gradient
```css
data-[highlighted]:bg-gradient-to-r
data-[highlighted]:from-[#667eea]
data-[highlighted]:to-[#764ba2]
data-[highlighted]:text-white
```

### Input Field Sizing
**Date inputs:** Constrained to appropriate width
```tsx
<Input type="date" className="max-w-[200px]" />
```

**Text inputs:** Full width by default, constrained only when context requires

---

## 🔄 Scroll Containers

### Category/Filter Scrollbars
**Container setup:**
```tsx
// Scroll container - horizontal scroll, no vertical padding
<div className="px-4 overflow-x-auto scrollbar-hide scroll-smooth flex">

// Inner flex container - minimal spacing
<div className="flex gap-3">
```

**Avoid:** Extra vertical padding in scroll containers that can cause alignment issues

---

## 🎴 Recommendation Card Design

### Text-Only, Information-Dense Layout
**Design Philosophy:** Prioritize information density over visual appeal. No images to maintain:
- Fast loading and performance
- Clean, minimal aesthetic
- Consistent appearance regardless of image quality
- More recommendations visible on screen

### Card Structure
```tsx
<motion.div className="liquid-glass-clear rounded-2xl px-2.5 py-1.5 space-y-0.5">
  {/* Header: Title + Badges */}
  <div className="flex items-start justify-between gap-2">
    <h3 className="text-sm font-semibold flex-1">{name}</h3>

    <div className="flex items-center gap-1.5">
      {/* Attribution badge (if has source/tip) */}
      {hasAttribution && (
        <div className="bg-purple-500/90 text-white p-1 rounded-full">
          <UserCircle className="h-3 w-3" />
        </div>
      )}

      {/* Category badge */}
      <span className="px-2 py-0.5 rounded-md text-xs">
        {categoryEmoji}
      </span>
    </div>
  </div>

  {/* Content sections... */}
</motion.div>
```

### Badge System

**Attribution Badge:**
- **When to show:** Item has `source.name`, `context.specificTip`, or other attribution data
- **Design:** Small purple circle (p-1) with UserCircle icon (h-3 w-3)
- **Position:** Top-right, next to category badge

**Category Badge:**
- **Design:** Colored background matching category (orange/food, blue/lodging, etc.)
- **Content:** Category emoji only (🍕 🏨 🎭 🛍️ 🌙)
- **Size:** `px-2 py-0.5` with `text-xs font-medium`
- **Colors:** Use category-specific classes from color system

### Vertical List Layout
**GridView displays cards as vertical list:**
```tsx
<div className="space-y-3">
  {items.map(item => <RecommendationItem />)}
</div>
```

**Rationale:**
- ❌ No horizontal carousel (harder to scan, not iOS-native for lists)
- ✅ Vertical scrolling is iOS standard for information-dense content
- ✅ Natural reading flow
- ✅ Easier to quickly scan through recommendations

### Content Hierarchy
1. **Title** (text-sm font-semibold) + Badges
2. **Description** (text-sm text-muted-foreground) - if exists
3. **Attribution** (text-xs purple, clickable) - "Recommended by {name}"
4. **Tip** (text-xs amber italic) - "💡 {tip}"
5. **Date** (text-xs muted) with Calendar icon
6. **Actions** (checkbox, map, edit, delete buttons)

### Visited State
- **Visual:** Subtle success ring (`ring-2 ring-success/30`)
- **No heavy overlays** - keep card readable

---

## 🎯 Component-Specific Patterns

### CityHeader
**Behavior:**
- City name + count: Clickable, navigates to city detail
- Chevron: Separate button, toggles collapse
- Both have hover states but independent click handlers

**Implementation:**
```tsx
<div className="flex items-center justify-between">
  <motion.div onClick={handleCityNameClick}>
    {/* City name content */}
  </motion.div>
  {onToggleCollapse && (
    <motion.button onClick={handleChevronClick}>
      <ChevronDown />
    </motion.button>
  )}
</div>
```

### SearchHeader
**Clean hierarchy:**
- Title only, no tagline
- Search expands from button click
- View toggle hidden when search is active

---

## 🚨 Common Pitfalls to Avoid

### Alignment Issues
❌ **Don't:** Mix different padding values on aligned elements
```tsx
// This causes misalignment
<CategoryPill className="py-2.5" />
<FilterButton className="py-1" />  // Wrong!
```

✅ **Do:** Use consistent padding across horizontally aligned elements
```tsx
<CategoryPill className="min-h-11 py-2.5" />
<FilterButton className="min-h-11 py-2.5" />  // Aligned!
```

### Click Propagation
❌ **Don't:** Forget to stop propagation on nested clickable elements
```tsx
<div onClick={openCard}>
  <button onClick={deleteItem}>Delete</button>  // Opens card too!
</div>
```

✅ **Do:** Stop propagation for nested interactive elements
```tsx
<div onClick={openCard}>
  <button onClick={(e) => { e.stopPropagation(); deleteItem(); }}>
    Delete
  </button>
</div>
```

### Color Inconsistency
❌ **Don't:** Use default UI library colors for highlights
```tsx
focus:bg-accent  // Blue highlight (inconsistent)
```

✅ **Do:** Use app's purple gradient for interactive states
```tsx
data-[highlighted]:bg-gradient-to-r
data-[highlighted]:from-[#667eea]
data-[highlighted]:to-[#764ba2]
```

---

## 📱 Responsive Considerations

### Safe Areas
All fixed/absolute positioned elements account for iOS safe areas:
```css
bottom: calc(5rem + env(safe-area-inset-bottom, 0px))
```

### Touch Targets
Minimum touch target: 44x44px (iOS Human Interface Guidelines)
- Achieved with `min-h-11` (44px)
- Additional padding for visual comfort

---

## 🔧 Development Tools

### Live Reload
IP address changes frequently on network switches. Update in:
```typescript
// capacitor.config.ts
server: {
  url: 'http://192.168.1.151:5173',  // Update this IP
  cleartext: true
}
```

Then sync: `npx cap sync ios`

### Testing Alignment
Use browser DevTools to inspect:
- Computed padding values
- Element heights
- Flex alignment

---

## 📚 Related Guides
- `CONTEXT.md` - App overview and quick reference
- `IOS26_TRANSFORMATION.md` - Liquid Glass design system
- `FILTERS_AND_LAYOUT.md` - Filter system architecture
- `IOS_DEVELOPMENT.md` - iOS development workflow
