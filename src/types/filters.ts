// Filter types for the recommendation filtering system

import { SourceType, VisitPriority } from "@/utils/recommendation/types";

export type VisitStatusFilter = "all" | "visited" | "not-visited";
export type PriceRangeFilter = "$" | "$$" | "$$$" | "$$$$";

export interface FilterState {
  // Visit status
  visitStatus: VisitStatusFilter;

  // Who recommended (source)
  sources: SourceType[];
  sourceNames: string[]; // Filter by specific person names

  // Price range
  priceRanges: PriceRangeFilter[];

  // Priority
  priorities: VisitPriority[];

  // Occasions (tags)
  occasions: string[];

  // Location filters
  countries: string[];
  cities: string[];
}

export const INITIAL_FILTER_STATE: FilterState = {
  visitStatus: "all",
  sources: [],
  sourceNames: [],
  priceRanges: [],
  priorities: [],
  occasions: [],
  countries: [],
  cities: [],
};

// Helper to count active filters
export const countActiveFilters = (filters: FilterState): number => {
  let count = 0;

  if (filters.visitStatus !== "all") count++;
  if (filters.sources.length > 0) count++;
  if (filters.sourceNames.length > 0) count++;
  if (filters.priceRanges.length > 0) count++;
  if (filters.priorities.length > 0) count++;
  if (filters.occasions.length > 0) count++;
  if (filters.countries.length > 0) count++;
  if (filters.cities.length > 0) count++;

  return count;
};

// Helper to check if any filters are active
export const hasActiveFilters = (filters: FilterState): boolean => {
  return countActiveFilters(filters) > 0;
};

// Helper to reset all filters
export const resetFilters = (): FilterState => ({ ...INITIAL_FILTER_STATE });
