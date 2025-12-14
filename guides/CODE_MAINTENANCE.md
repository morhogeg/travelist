# Code Maintenance Log

Track codebase cleanup, technical debt reduction, and optimization efforts.

## December 14, 2025 - Unused Import Cleanup

**18 unused imports removed across 12 files:**

| File | Removed Imports |
|------|-----------------|
| `src/App.tsx` | `cn`, `useIsMobile`, `isMobile` |
| `src/components/ai/AISuggestionsSection.tsx` | `EyeOff` |
| `src/components/collections/AddPlacesToCollectionDrawer.tsx` | `SlidersHorizontal` |
| `src/components/collections/CollectionPickerDrawer.tsx` | `removePlaceFromCollection`, `FolderPlus` |
| `src/components/home/FeaturedLocations.tsx` | `motion` |
| `src/components/home/categories/CategoryList.tsx` | `motion` |
| `src/components/home/category/CityHeader.tsx` | `ChevronUp` |
| `src/components/home/category/CountryGroup.tsx` | `useEffect` |
| `src/components/home/places/PlaceCard.tsx` | `Button` |
| `src/components/layout/Layout.tsx` | `useIsMobile`, `isMobile` |
| `src/components/recommendations/RecommendationDetail.tsx` | `Separator` |

**Result:** Bundle reduced by ~300 bytes (944.35KB → 944.06KB gzip)

---

## Future Cleanup Opportunities

### High Priority
- Fix 50+ `@typescript-eslint/no-explicit-any` warnings (run `npm run lint` to see)
- Address pre-existing TypeScript type mismatches in callback signatures

### Medium Priority  
- Enable `@typescript-eslint/no-unused-vars` in ESLint config permanently
- Code-split large bundle (currently 944KB, Vite recommends <500KB chunks)

### How to Find Unused Imports
```bash
# Temporarily enable unused vars check
npx eslint src/ --rule '@typescript-eslint/no-unused-vars: warn' 2>&1 | grep "no-unused-vars"
```
