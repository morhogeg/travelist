// Filter types for the recommendation filtering system

import { SourceType, VisitPriority } from "@/utils/recommendation/types";

export type VisitStatusFilter = "all" | "visited" | "not-visited";

export interface FilterState {
  // Visit status
  visitStatus: VisitStatusFilter;

  // Who recommended (source)
  sources: SourceType[];
  sourceNames: string[]; // Filter by specific person names

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
  priorities: [],
  occasions: [],
  countries: [],
  cities: [],
};

// Helper to count active filters
export const countActiveFilters = (filters: FilterState): number => {
  let count = 0;

  if (filters.visitStatus !== "all") count++;

  // For sources: count source type OR source names, but avoid double-counting
  // when they represent the same thing (e.g., sources=['instagram'] + sourceNames=['Instagram'])
  const sourceTypesLower = filters.sources.map(s => s.toLowerCase());
  const sourceNamesLower = filters.sourceNames.map(s => s.toLowerCase());

  // Check if all sourceNames match source types (then count as 1)
  const allSourceNamesMatchTypes = filters.sourceNames.length > 0 &&
    filters.sourceNames.every(name => sourceTypesLower.includes(name.toLowerCase()));

  if (filters.sources.length > 0 && allSourceNamesMatchTypes) {
    // They represent the same filter, count as 1
    count++;
  } else {
    // Count separately
    if (filters.sources.length > 0) count++;
    if (filters.sourceNames.length > 0) count++;
  }

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
