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
**Design Philosophy:**
- iOS drag handle at top (horizontal bar, built into Drawer component)
- Max heights by type:
  - **Detail drawer:** 85vh
  - **Add recommendation drawer:** 85vh (default)
  - **Filter drawer:** 92vh (taller to show all options without scrolling)
- Users can swipe down or tap backdrop to dismiss
- No X close buttons in headers

**Header Design:**
- Title on the left (bold, purple, `leading-none` for perfect alignment)
- Action button on the right (text-only, no background)
- Reduced top padding (`pt-2`) to account for drag handle space

**Drawer Configuration:**
```tsx
{/* Standard drawers */}
<DrawerContent className="max-h-[85vh] p-0 flex flex-col">
  {/* Drag handle automatically rendered by Drawer component */}
  <div className="px-6 pt-2 pb-5">
    {/* Header content */}
  </div>
</DrawerContent>

{/* Filter drawer (taller) */}
<DrawerContent className="max-h-[92vh] p-0 flex flex-col">
  {/* Header, scrollable content, footer with compact button */}
</DrawerContent>
```

**Filter Drawer Specifics:**
- Taller height (92vh) to fit all filter sections without scrolling
- Compact "Apply Filters" button: `py-2.5 rounded-xl` (not py-3.5 rounded-2xl)
- Scrollable content area for filter sections
- Reset button in header when filters active

**Example (FilterSheet Header):**
```tsx
<div className="flex items-center justify-between px-6 pt-2 pb-4">
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
- **No shadows** - `boxShadow: 'none'` for clean, flat appearance

### Card Structure (Updated November 23, 2025)
```tsx
<motion.div
  className="liquid-glass-clear rounded-2xl overflow-hidden cursor-pointer relative"
  style={{
    borderLeft: `4px solid ${categoryColor}`,  // Colored accent border
    borderTop: 'none',
    borderRight: 'none',
    borderBottom: 'none',
    boxShadow: 'none'  // No grey shadows
  }}
>
  <div className="px-3 py-2.5 space-y-1.5">
    {/* Header with category icon and name */}
    <div className="flex items-center gap-2">
      {/* Category Icon (from pills) */}
      <div className="w-6 h-6 flex items-center justify-center" style={{ color: borderColor }}>
        {getCategoryIcon(item.category)}
      </div>
      <h3 className="text-base font-bold leading-tight flex-1">{name}</h3>
    </div>

    {/* Gradient divider */}
    <div className="h-px w-full rounded-full"
      style={{
        background: `linear-gradient(90deg, ${borderColor}40 0%, ${borderColor}10 50%, transparent 100%)`
      }}
    />

    {/* Content sections... */}
  </div>
</motion.div>
```

### Key Visual Elements

**4px Colored Left Border:**
- Uses `getCategoryColor(category)` for color
- Creates visual distinction without images
- Matches category pill colors
- Applied to entire card height

**Category Icon (Not Emoji!):**
- Uses `getCategoryIcon(category)` - same icons as category pills
- Size: 24px (w-6 h-6)
- Colored to match category
- Consistent design language throughout app

**Gradient Divider:**
- Subtle separator after header
- Uses category color at 40% → 10% → transparent
- Adds polish without heavy lines

**No Shadows:**
- All cards use `boxShadow: 'none'`
- Removes grey halos from liquid-glass-clear
- Clean, modern, flat appearance

### Vertical List Layout
**GridView displays cards as vertical list:**
```tsx
<div className="space-y-4">  {/* Increased from space-y-3 for better breathing room */}
  {items.map(item => <RecommendationItem />)}
</div>
```

**Rationale:**
- ❌ No horizontal carousel (harder to scan, not iOS-native for lists)
- ✅ Vertical scrolling is iOS standard for information-dense content
- ✅ Natural reading flow
- ✅ Consistent with detail dialog design
- ✅ Easier to quickly scan through recommendations

### Content Hierarchy (Updated November 23, 2025)
1. **Title** (text-base font-bold) with category icon
2. **Description** (text-sm text-muted-foreground) - if exists
3. **Tip** (text-xs amber italic) - "💡 {tip}" - **shown first** as it's actionable info
4. **Attribution** (text-xs muted-foreground, clickable) - "Recommended by {name}" - **shown after tip**, grayed to reduce visual noise
5. **Actions** (visited checkbox + directions/map button only) - edit/delete moved to detail drawer

**Order Rationale:**
- Tips are actionable ("order the sambousek") → users want this first
- Attribution is context ("who told me") → secondary metadata
- Visual hierarchy: Amber tip stands out, gray attribution recedes

### Visited State
- **Visual:** Subtle success ring (`ring-2 ring-success/30`)
- **No heavy overlays** - keep card readable

### Visual Dividers - Gradient Approach (Updated November 23, 2025)

**Design Philosophy:**
Instead of solid grey borders, we use **gradient dividers that fade left-to-right**. This matches the card gradient divider pattern and creates a more elegant, iOS-like separation that's less intrusive than hard lines.

**Three-tier hierarchy system:**

1. **Country dividers** (strongest gradient)
   - Pattern: `from-neutral-300/60 via-neutral-200/30 to-transparent`
   - Dark mode: `from-neutral-600/60 via-neutral-700/30`
   - Height: 1px (`h-px`)
   - Spacing: `mt-6` after country content
   - More visible than city dividers but still subtle

2. **City dividers** (subtle gradient)
   - Pattern: `from-neutral-200/40 via-neutral-200/20 to-transparent`
   - Dark mode: `from-neutral-700/40 via-neutral-700/20`
   - Height: 1px (`h-px`)
   - Spacing: `mt-3` after city content
   - Very subtle, just hints at separation

3. **Card spacing** (no divider)
   - 16px gap between individual cards (`space-y-4`)
   - No divider lines, just white space
   - Clean separation without visual clutter

**Implementation:**
```tsx
// Country gradient divider (in CountryGroup.tsx)
{!isLastCountry && (
  <div className="h-px w-full bg-gradient-to-r from-neutral-300/60 via-neutral-200/30 to-transparent dark:from-neutral-600/60 dark:via-neutral-700/30 mt-6" />
)}

// City gradient divider (in CityGroup.tsx)
{!isLastInCountry && (
  <div className="h-px w-full bg-gradient-to-r from-neutral-200/40 via-neutral-200/20 to-transparent dark:from-neutral-700/40 dark:via-neutral-700/20 mt-3" />
)}

// Card spacing
<div className="space-y-4">
```

**Precise divider control:**
- Uses `isLastInCountry` prop to control city dividers
- Uses `isLastCountry` prop to control country dividers
- CountryGroupList passes `isLastCountry={index === sortedCountries.length - 1}`
- CountryGroup passes `isLastInCountry={index === groups.length - 1}`
- Conditional rendering ensures dividers only show between items, not after last

**Why gradients over solid borders:**
- ✅ Matches existing card gradient divider pattern (consistent design language)
- ✅ More elegant and iOS-like than hard lines
- ✅ Less intrusive - fades to transparent instead of abrupt edge
- ✅ Creates hierarchy through opacity rather than thickness
- ✅ Full-width gradients visible on both light and dark modes
- ✅ Conditional rendering provides precise control over divider placement

**Visual hierarchy result:**
- Country gradients more prominent (starts at 60% opacity)
- City gradients subtle (starts at 40% opacity)
- Both fade to transparent for soft, elegant appearance
- Clear separation without harsh visual interruption
- Shows between cities (Tel Aviv → Beer Sheba)
- Shows between countries (Israel → United States)
- Hides after last city in each country
- Hides after last country in list

---

## 🎯 Component-Specific Patterns

### CountryHeader (Updated November 23, 2025)
**Behavior:**
- Country name + count: Clickable, navigates to country detail
- Chevron: Separate button, toggles collapse
- Both have hover states but independent click handlers

**Design Philosophy - De-emphasized:**
- **No purple text** - uses default foreground color (black in light, white in dark)
- **Flag emoji provides color** - colorful flag creates visual interest without purple overload
- **Reduced visual hierarchy** - country headers are organizational, not primary focus
- **Cleaner appearance** - less competing purple elements on screen

**Implementation:**
```tsx
<h2 className="text-xl font-bold flex items-center gap-2">
  <span>{flag}</span>
  <span>{country}</span>
  <span className="text-sm font-normal text-muted-foreground">({totalItems})</span>
</h2>
```

**Before vs After:**
- ❌ Before: `text-[#667eea]` (purple) + `text-[#667eea]` chevron
- ✅ After: Default foreground + default chevron color
- Result: Less purple competition, flag emojis stand out more

### CityHeader
**Behavior:**
- City name + count: Clickable, navigates to city detail
- Chevron: Separate button, toggles collapse
- Both have hover states but independent click handlers

**Design:**
- **No decorative icons** - removed purple pin icon for cleaner appearance
- Text-only with hover background for clarity
- Context makes location obvious without icon

**Implementation:**
```tsx
<div className="flex items-center justify-between">
  <motion.div onClick={handleCityNameClick}>
    <h2 className="text-lg font-semibold">{cityName}</h2>
    <span className="text-sm text-muted-foreground">({itemCount})</span>
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

## 📱 Detail Drawer Design (Updated November 23, 2025)

### Text-Only, Information-Dense Philosophy
Consistent with card design - no hero images, prioritizing:
- Fast loading and performance
- Clean, minimal aesthetic
- Information density over visual flair
- Consistent text-only experience

### iOS Drawer Pattern
Uses Drawer component (not Dialog) for native iOS behavior:
- **Drag handle at top** for intuitive dismiss gesture
- **85vh max height** (doesn't reach notch)
- **Swipe down to close** or tap backdrop
- **No X button** - follows iOS conventions

### Drawer Structure
```tsx
<DrawerContent
  className="max-h-[85vh] p-0 flex flex-col"
  style={{
    borderLeft: `4px solid ${categoryColor}`,  // Matches card accent
    boxShadow: 'none'  // No shadows
  }}
>
  {/* Compact Header */}
  <div className="relative flex-shrink-0 px-6 py-5 bg-background border-b">
    {/* Category icon (48px), title, location, date */}
  </div>

  {/* Scrollable Content */}
  <div className="flex-1 overflow-y-auto">
    {/* Attribution details, action buttons */}
  </div>

  {/* Fixed Footer - Equal width buttons */}
  <div className="flex-shrink-0 p-4 border-t liquid-glass-clear flex items-center gap-3"
    style={{ boxShadow: 'none' }}
  >
    {/* Delete, Edit, Close buttons */}
  </div>
</DialogContent>
```

### Key Design Decisions

**No Hero Image:**
- Removed 264px hero section entirely
- Replaced with compact 120px header
- Saves vertical space for content
- Consistent with text-only philosophy

**4px Vertical Left Border:**
- Applied to entire dialog (not just header)
- Uses `getCategoryColor(category)` for color
- Subtle category indication
- Matches card design language

**48px Category Icon:**
- Uses `getCategoryIcon()` - same as cards and pills
- Colored to match category
- Size: `w-12 h-12 text-3xl`
- Creates strong visual hierarchy

**Integrated Header Metadata:**
- Title: `text-2xl font-extrabold`
- Location with MapPin icon (inline)
- Country with Globe icon (inline)
- "Added on" date with Calendar icon
- All in single compact section

**Clean Header Background:**
- Uses `bg-background` instead of liquid-glass-clear
- Simple `border-b` separator
- No glass morphism effects
- Clean, readable design

**Equal-Width Footer Buttons:**
- All three buttons use `flex-1` for balanced layout
- Delete (destructive), Edit (outline), Close (outline)
- Icons + text for clarity
- Proper spacing with `gap-3`

### Avoid These Patterns

❌ **Don't:** Use hero images in detail dialogs
```tsx
// This conflicts with text-only philosophy
<div className="h-64 w-full">
  <img src={image} />
</div>
```

✅ **Do:** Use compact icon-based header
```tsx
<div className="flex items-start gap-4">
  <div className="w-12 h-12 text-3xl" style={{ color: categoryColor }}>
    {categoryIcon}
  </div>
  <div className="flex-1">
    <h2 className="text-2xl font-extrabold">{name}</h2>
  </div>
</div>
```

❌ **Don't:** Place accent bars at bottom of header sections
```tsx
// This creates harsh separation
<div className="border-b-4" style={{ borderColor: categoryColor }} />
```

✅ **Do:** Use subtle left border on entire dialog
```tsx
<DialogContent
  style={{ borderLeft: `4px solid ${categoryColor}` }}
>
```

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

## 📄 Page Layout Patterns

### Detail Page Headers (Collection Detail, Route Detail)
Detail pages use a consistent header pattern with centered titles:

```
[← Back] [🔍 Search]    Page Title    [🗑️ Delete]

              Metadata (centered)
              [Action Button]
```

**Structure:**
```tsx
{/* Header row - title centered, buttons on sides */}
<div className="flex items-center justify-between mb-1 relative">
  {/* Left side buttons */}
  <div className="flex items-center gap-1">
    <Button variant="ghost" size="icon">
      <ArrowLeft />
    </Button>
    {/* Optional: Search icon */}
  </div>

  {/* Center: Title (absolutely positioned for true centering) */}
  <h1 className="absolute left-1/2 -translate-x-1/2 text-xl font-bold truncate max-w-[50%] text-center">
    {title}
  </h1>

  {/* Right side: Delete */}
  <Button variant="ghost" size="icon">
    <Trash2 />
  </Button>
</div>
```

**Key spacing:**
- Header to metadata: `mb-1` (very tight)
- Metadata section: `mb-4 text-center`
- Content centered below header

### Profile Page
Stats and settings are grouped into containers with dividers:

```tsx
{/* Stats container */}
<div className="liquid-glass-clear rounded-2xl p-4 mb-5">
  <StatCard ... />
  <Divider />
  <StatCard ... />
</div>

{/* Settings container */}
<div className="liquid-glass-clear rounded-2xl overflow-hidden">
  <SettingsButton ... />
  <Divider />
  <SettingsButton ... />
</div>
```

**Divider style:**
```tsx
<div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
```

### Day Sections (Route Detail)
Day sections flow without individual containers:
- No `liquid-glass-clear` wrapper
- Subtle gradient divider between days
- Place items have category color left-border

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

## 🔤 Section Index (Country Navigator)

**iOS Pattern:** Contacts app alphabet scrubber

A vertical A-Z index on the right edge for quick country navigation.

### Behavior
- **Hidden by default** - Only appears after scrolling 150px
- **Fade in/out animation** - Slides in from right with opacity transition
- **Tap to jump** - Taps a letter to smooth scroll to first country starting with that letter
- **Drag to scrub** - Drag along the bar for continuous selection
- **Haptic feedback** - Selection haptic on letter change

### Visual Design
- **Active letters** (with countries): Purple (`#667eea`)
- **Inactive letters** (no countries): 25% opacity muted
- **On tap**: Scale up 1.5x with purple background
- **Position**: Fixed, right edge, vertically centered

### Implementation
```tsx
// SectionIndex.tsx
<SectionIndex
  sections={sortedCountryNames}  // Array of country names
  onSectionSelect={handleSectionSelect}
  scrollThreshold={150}  // Show after scrolling this many pixels
/>

// Scroll handler
const handleSectionSelect = (letter: string) => {
  const country = sortedCountryNames.find(c =>
    c.toUpperCase().startsWith(letter)
  );
  if (country) {
    document.getElementById(`country-${country}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};
```

### Key Files
- `src/components/home/category/SectionIndex.tsx` - The index component
- `src/components/home/category/CountryGroup.tsx` - Has `id={country-${country}}` for scroll targets
- `src/pages/Index.tsx` - Wires up the section index

---

## 📚 Related Guides
- `CONTEXT.md` - App overview and quick reference
- `IOS26_TRANSFORMATION.md` - Liquid Glass design system
- `FILTERS_AND_LAYOUT.md` - Filter system architecture
- `IOS_DEVELOPMENT.md` - iOS development workflow
