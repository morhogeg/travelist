import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, ArrowLeft } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SearchHeader from "@/components/home/SearchHeader";
import CategoriesScrollbar from "@/components/home/CategoriesScrollbar";
import RecommendationDrawer from "@/components/recommendations/RecommendationDrawer";
import RecommendationDetailsDialog from "@/components/home/RecommendationDetailsDialog";
import { FilterSheet } from "@/components/home/filters";
import ActiveFilters from "@/components/home/filters/ActiveFilters";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getFilteredRecommendations,
  getAvailableOccasions,
  getAvailableCountries,
  getAvailableCities,
  getAvailableSourceNames
} from "@/utils/recommendation/filter-helpers";
import { markRecommendationVisited, deleteRecommendation } from "@/utils/recommendation-parser";
import { syncVisitedStateToRoutes } from "@/utils/route/route-manager";
import CountryGroupList from "@/components/home/category/CountryGroupList";
import SectionIndex from "@/components/home/category/SectionIndex";
import { mediumHaptic } from "@/utils/ios/haptics";
import { FilterState, INITIAL_FILTER_STATE, countActiveFilters } from "@/types/filters";

const Index: React.FC = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [groupedRecommendations, setGroupedRecommendations] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | undefined>(undefined);
  const [selectedCountry, setSelectedCountry] = useState<string | undefined>(undefined);
  const [selectedRecommendation, setSelectedRecommendation] = useState<any>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [detailsRecommendation, setDetailsRecommendation] = useState<any>(null);
  const [hideFab, setHideFab] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTER_STATE);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const [availableOccasions, setAvailableOccasions] = useState<string[]>([]);
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [availableSourceNames, setAvailableSourceNames] = useState<string[]>([]);

  const navigate = useNavigate();
  const location = useLocation();
  const [returnToPath, setReturnToPath] = useState<string | null>(null);

  const loadRecommendations = useCallback(async () => {
    const data = await getFilteredRecommendations(
      selectedCategories.length === 0 ? "all" : selectedCategories,
      undefined,
      filters
    );
    setGroupedRecommendations(data);
    setRefreshKey((prev) => prev + 1);
  }, [selectedCategories, filters]);

  useEffect(() => {
    loadRecommendations();
  }, [selectedCategories, loadRecommendations]);

  // Load available filter options (refresh when recommendations change)
  useEffect(() => {
    setAvailableOccasions(getAvailableOccasions());
    setAvailableCountries(getAvailableCountries());
    setAvailableCities(getAvailableCities());
    setAvailableSourceNames(getAvailableSourceNames());
  }, [refreshKey]);

  useEffect(() => {
    window.showRecDrawer = (cityName?: string, countryName?: string) => {
      setSelectedCity(cityName);
      setSelectedCountry(countryName);
      setIsDrawerOpen(true);
    };
    return () => {
      window.showRecDrawer = undefined;
    };
  }, []);

  useEffect(() => {
    const hide = () => setHideFab(true);
    const show = () => setHideFab(false);
    window.addEventListener("fab:hide", hide);
    window.addEventListener("fab:show", show);
    return () => {
      window.removeEventListener("fab:hide", hide);
      window.removeEventListener("fab:show", show);
    };
  }, []);
  useEffect(() => {
    const handler = () => loadRecommendations();
    window.addEventListener("recommendationAdded", handler);
    return () => window.removeEventListener("recommendationAdded", handler);
  }, [loadRecommendations]);

  useEffect(() => {
    const categoryHandler = (e: Event) => {
      const customEvent = e as CustomEvent<string | string[]>;
      if (typeof customEvent.detail === "string") {
        setSelectedCategories([]);
      } else if (Array.isArray(customEvent.detail)) {
        setSelectedCategories(customEvent.detail);
      }
    };
    window.addEventListener("categorySelected", categoryHandler);
    return () => window.removeEventListener("categorySelected", categoryHandler);
  }, []);

  // Handle source filter events
  useEffect(() => {
    const sourceFilterHandler = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setFilters(prev => ({
        ...prev,
        sources: ['friend'], // Auto-select "Friend" source type
        sourceNames: [customEvent.detail]
      }));
    };

    const sourceTypeFilterHandler = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setFilters(prev => ({
        ...prev,
        sources: [customEvent.detail as any]
      }));
    };

    const openFilterSheetHandler = () => {
      setIsFilterSheetOpen(true);
    };

    window.addEventListener("sourceFilterChanged", sourceFilterHandler);
    window.addEventListener("sourceTypeFilterChanged", sourceTypeFilterHandler);
    window.addEventListener("openFilterSheet", openFilterSheetHandler);

    return () => {
      window.removeEventListener("sourceFilterChanged", sourceFilterHandler);
      window.removeEventListener("sourceTypeFilterChanged", sourceTypeFilterHandler);
      window.removeEventListener("openFilterSheet", openFilterSheetHandler);
    };
  }, []);

  // Handle navigation state for filtering from route detail
  useEffect(() => {
    const state = location.state as { filterSource?: string; returnTo?: string };
    if (state?.filterSource) {
      // Apply filter for the friend
      setFilters(prev => ({
        ...prev,
        sources: ['friend'],
        sourceNames: [state.filterSource]
      }));

      // Store return path
      if (state.returnTo) {
        setReturnToPath(state.returnTo);
      }

      // Clear the state to prevent re-applying on refresh
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  const handleToggleVisited = (id: string, name: string, currentVisited: boolean) => {
    const newVisitedState = !currentVisited;
    markRecommendationVisited(id, name, newVisitedState);

    // Sync to all routes containing this place (two-way sync)
    syncVisitedStateToRoutes(id, newVisitedState);

    loadRecommendations();
  };

  const handleDeleteRecommendation = (id: string, name: string) => {
    deleteRecommendation(id);
    loadRecommendations();
  };

  const handleEditClick = (recommendation: any) => {
    setSelectedRecommendation(recommendation);
    setIsDrawerOpen(true);
  };

  const handleViewDetails = (recommendation: any) => {
    setDetailsRecommendation(recommendation);
    setDetailsDialogOpen(true);
  };

  const handleDetailsEdit = () => {
    setDetailsDialogOpen(false);
    setSelectedRecommendation(detailsRecommendation);
    setIsDrawerOpen(true);
  };

  const handleDetailsDelete = () => {
    if (detailsRecommendation?.recId) {
      deleteRecommendation(detailsRecommendation.recId);
      setDetailsDialogOpen(false);
      loadRecommendations();
    }
  };

  const handleDetailsToggleVisited = (recId: string, name: string, visited: boolean) => {
    markRecommendationVisited(recId, name, visited);

    // Sync to all routes containing this place (two-way sync)
    syncVisitedStateToRoutes(recId, visited);

    if (detailsRecommendation) {
      setDetailsRecommendation({
        ...detailsRecommendation,
        visited: visited,
      });
    }
    loadRecommendations();
  };

  const handleCityClick = (cityId: string) => {
    if (!cityId) return;
    navigate(`/place/${cityId}`);
  };

  const handleBackToRoute = () => {
    if (returnToPath) {
      mediumHaptic();
      navigate(returnToPath);
      setReturnToPath(null);
    }
  };

  const handleRemoveFilter = (filterKey: keyof FilterState, value?: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev };

      if (filterKey === "visitStatus") {
        newFilters.visitStatus = "all";
      } else if (value) {
        // For array-based filters
        const currentArray = newFilters[filterKey] as string[];
        newFilters[filterKey] = currentArray.filter((v) => v !== value) as any;

        // If removing a friend name and no more friend names, also clear 'friend' from sources
        if (filterKey === "sourceNames" && (newFilters.sourceNames as string[]).length === 0) {
          newFilters.sources = newFilters.sources.filter(s => s !== 'friend');
        }
      }

      return newFilters;
    });
  };

  const activeFilterCount = countActiveFilters(filters);

  // Extract sorted country names for the section index
  const sortedCountryNames = useMemo(() => {
    const countriesSet = new Set<string>();
    groupedRecommendations.forEach((group) => {
      const country = group.items[0]?.country;
      if (country) {
        countriesSet.add(country);
      }
    });
    return Array.from(countriesSet).sort((a, b) => a.localeCompare(b));
  }, [groupedRecommendations]);

  // Handle section index navigation
  const handleSectionSelect = useCallback((letter: string) => {
    const country = sortedCountryNames.find((c) =>
      c.toUpperCase().startsWith(letter)
    );
    if (country) {
      const element = document.getElementById(`country-${country}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [sortedCountryNames]);

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="pb-16"
      >
        {/* Back Button - shown when navigating from route or collection detail */}
        {returnToPath && (
          <div className="px-6 pt-2 pb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToRoute}
              className="text-sm font-medium ios26-transition-smooth"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {returnToPath.startsWith('/collections/') ? 'Back to Collection' : 'Back to Route'}
            </Button>
          </div>
        )}

        <SearchHeader
          heading="Travelist"
          activeFilterCount={activeFilterCount}
          onFilterClick={() => setIsFilterSheetOpen(true)}
        />
        {/* Categories Row */}
        <div className="px-2 mb-2">
          <CategoriesScrollbar onSheetOpenChange={setIsCategorySheetOpen} />
        </div>
        <div className="px-4 mb-3">
          <ActiveFilters filters={filters} onRemoveFilter={handleRemoveFilter} />
        </div>

          <CountryGroupList
            groupedRecommendations={groupedRecommendations}
            onToggleVisited={handleToggleVisited}
            onDeleteRecommendation={handleDeleteRecommendation}
            onEditClick={handleEditClick}
            onViewDetails={handleViewDetails}
            onCityClick={handleCityClick}
            onRefresh={loadRecommendations}
            showCounts={false}
          />

        <RecommendationDrawer
          isDrawerOpen={isDrawerOpen}
          setIsDrawerOpen={setIsDrawerOpen}
          initialCity={selectedRecommendation?.location}
          initialCountry={selectedRecommendation?.country}
          editRecommendation={selectedRecommendation}
        />

        <RecommendationDetailsDialog
          recommendation={detailsRecommendation}
          isOpen={detailsDialogOpen}
          onClose={() => setDetailsDialogOpen(false)}
          onEdit={handleDetailsEdit}
          onDelete={handleDetailsDelete}
          onToggleVisited={handleDetailsToggleVisited}
        />

        <FilterSheet
          isOpen={isFilterSheetOpen}
          onClose={() => setIsFilterSheetOpen(false)}
          filters={filters}
          onFiltersChange={setFilters}
          availableCountries={availableCountries}
          availableCities={availableCities}
          availableOccasions={availableOccasions}
          availableSourceNames={availableSourceNames}
        />
      </motion.div>

      {/* Section Index Scrubber - only show when we have countries and no drawers open */}
      {!detailsDialogOpen && !isDrawerOpen && !isFilterSheetOpen && !isCategorySheetOpen && sortedCountryNames.length > 1 && (
        <SectionIndex
          sections={sortedCountryNames}
          onSectionSelect={handleSectionSelect}
        />
      )}

      {!hideFab && !detailsDialogOpen && !isDrawerOpen && !isFilterSheetOpen && !isCategorySheetOpen && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          className="fixed bottom-20 right-4 rounded-full w-14 h-14 z-[100] ios26-transition-spring flex items-center justify-center text-white"
          aria-label="Add recommendation"
          onClick={() => {
            mediumHaptic();
            setIsDrawerOpen(true);
          }}
          style={{
            bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: "0 8px 32px rgba(102, 126, 234, 0.4), 0 4px 16px rgba(0, 0, 0, 0.2)"
          }}
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </motion.button>
      )}
    </Layout>
  );
};

export default Index;
