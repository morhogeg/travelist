import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SearchHeader from "@/components/home/SearchHeader";
import CategoriesScrollbar from "@/components/home/CategoriesScrollbar";
import ViewModeToggle from "@/components/home/category/ViewModeToggle";
import RecommendationDrawer from "@/components/recommendations/RecommendationDrawer";
import RecommendationDetailsDialog from "@/components/home/RecommendationDetailsDialog";
import { FilterButton, FilterSheet } from "@/components/home/filters";
import ActiveFilters from "@/components/home/filters/ActiveFilters";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  getFilteredRecommendations,
  getAvailableOccasions,
  getAvailableCountries,
  getAvailableCities,
  getAvailableSourceNames
} from "@/utils/recommendation/filter-helpers";
import { markRecommendationVisited, deleteRecommendation } from "@/utils/recommendation-parser";
import CountryGroupList from "@/components/home/category/CountryGroupList";
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [detailsRecommendation, setDetailsRecommendation] = useState<any>(null);

  // Filter state
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTER_STATE);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [availableOccasions, setAvailableOccasions] = useState<string[]>([]);
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [availableSourceNames, setAvailableSourceNames] = useState<string[]>([]);

  const navigate = useNavigate();

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

  const handleToggleVisited = (id: string, name: string, currentVisited: boolean) => {
    markRecommendationVisited(id, name, !currentVisited);
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

  const handleDetailsToggleVisited = () => {
    if (detailsRecommendation?.recId) {
      markRecommendationVisited(
        detailsRecommendation.recId,
        detailsRecommendation.name,
        !detailsRecommendation.visited
      );
      setDetailsRecommendation({
        ...detailsRecommendation,
        visited: !detailsRecommendation.visited,
      });
      loadRecommendations();
    }
  };

  const handleCityClick = (cityId: string) => {
    if (!cityId) return;
    navigate(`/place/${cityId}`);
  };

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "grid" ? "list" : "grid"));
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

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="pb-16"
      >
        <SearchHeader
          heading="Travelist"
          viewMode={viewMode}
          onToggleViewMode={toggleViewMode}
        />

        <div className="mb-3 space-y-3">
          {/* Filter + Categories Row */}
          <div className="flex items-center gap-3 px-4">
            <FilterButton
              activeCount={activeFilterCount}
              onClick={() => setIsFilterSheetOpen(true)}
            />
            <div className="flex-1 min-w-0 relative">
              <CategoriesScrollbar />
              {/* Gradient hint for scrollable content */}
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
            </div>
          </div>
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
          viewMode={viewMode}
          toggleViewMode={toggleViewMode}
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

      {!detailsDialogOpen && !isDrawerOpen && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          className="fixed bottom-20 right-4 rounded-full w-16 h-16 z-[100] ios26-transition-spring flex items-center justify-center text-white"
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
          <Plus className="h-7 w-7" strokeWidth={2.5} />
        </motion.button>
      )}
    </Layout>
  );
};

export default Index;
