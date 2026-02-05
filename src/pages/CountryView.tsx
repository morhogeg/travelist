// FILE: src/pages/CountryView.tsx

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/layout/Layout";
import CategoryResults from "@/components/home/CategoryResults";
import CategoriesScrollbar from "@/components/home/CategoriesScrollbar";
import RecommendationDrawer from "@/components/recommendations/RecommendationDrawer";
import RecommendationDetailsDialog from "@/components/home/RecommendationDetailsDialog";
import { FilterSheet } from "@/components/home/filters";
import ActiveFilters from "@/components/home/filters/ActiveFilters";
import SearchInput from "@/components/home/search/SearchInput";
import { GroupedRecommendation, Recommendation } from "@/utils/recommendation/types";
import { getFilteredRecommendations, getAvailableOccasions, getAvailableSourceNames, getAvailableCities } from "@/utils/recommendation/filter-helpers";
import { markRecommendationVisited, deleteRecommendation } from "@/utils/recommendation-parser";
import countryToCode from "@/utils/flags/countryToCode";
import { Plus, ArrowLeft, Search as SearchIcon, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { lightHaptic, mediumHaptic } from "@/utils/ios/haptics";
import { FilterState, INITIAL_FILTER_STATE, countActiveFilters } from "@/types/filters";
import Breadcrumb from "@/components/ui/breadcrumb";

const CountryView: React.FC = () => {
  const { countryName } = useParams<{ countryName: string }>();
  const navigate = useNavigate();

  const [groupedRecommendations, setGroupedRecommendations] = useState<GroupedRecommendation[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | string[]>("all");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editRecommendation, setEditRecommendation] = useState<Recommendation | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // Details dialog state
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [detailsRecommendation, setDetailsRecommendation] = useState<Recommendation | null>(null);

  // Filter state
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTER_STATE);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [availableOccasions, setAvailableOccasions] = useState<string[]>([]);
  const [availableSourceNames, setAvailableSourceNames] = useState<string[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadCountryData = useCallback(async () => {
    const filtered = await getFilteredRecommendations(
      selectedCategory === "all" ? "all" : selectedCategory,
      countryName,
      filters
    );
    setGroupedRecommendations(filtered);
    setRefreshKey(prev => prev + 1);
  }, [selectedCategory, countryName, filters]);

  useEffect(() => {
    loadCountryData();
    window.addEventListener("recommendationAdded", loadCountryData);
    return () => window.removeEventListener("recommendationAdded", loadCountryData);
  }, [loadCountryData]);

  // Load available filter options - cities filtered by current country
  useEffect(() => {
    setAvailableOccasions(getAvailableOccasions());
    setAvailableSourceNames(getAvailableSourceNames());
    setAvailableCities(getAvailableCities(countryName));
  }, [refreshKey, countryName]);

  useEffect(() => {
    const categoryHandler = (e: Event) => {
      const customEvent = e as CustomEvent<string | string[]>;
      if (typeof customEvent.detail === "string") {
        setSelectedCategory("all");
      } else if (Array.isArray(customEvent.detail)) {
        setSelectedCategory(customEvent.detail);
      }
    };
    window.addEventListener("categorySelected", categoryHandler);
    return () => window.removeEventListener("categorySelected", categoryHandler);
  }, []);

  const handleToggleVisited = (id: string, name: string, currentVisited: boolean) => {
    const newVisitedState = !currentVisited;
    markRecommendationVisited(id, name, newVisitedState);
    loadCountryData();
  };

  const handleDeleteRecommendation = (id: string, name: string) => {
    deleteRecommendation(id);
    loadCountryData();
  };

  const handleEditClick = (recommendation: Recommendation) => {
    setEditRecommendation(recommendation);
    setIsDrawerOpen(true);
  };

  const handleViewDetails = (recommendation: Recommendation) => {
    setDetailsRecommendation(recommendation);
    setDetailsDialogOpen(true);
  };

  const handleDetailsEdit = () => {
    setDetailsDialogOpen(false);
    setEditRecommendation(detailsRecommendation);
    setIsDrawerOpen(true);
  };

  const handleDetailsDelete = () => {
    if (detailsRecommendation?.recId) {
      deleteRecommendation(detailsRecommendation.recId);
      setDetailsDialogOpen(false);
      loadCountryData();
    }
  };

  const handleDetailsToggleVisited = (recId: string, name: string, visited: boolean) => {
    markRecommendationVisited(recId, name, visited);
    if (detailsRecommendation) {
      setDetailsRecommendation({
        ...detailsRecommendation,
        visited: visited,
      });
    }
    loadCountryData();
  };

  const handleCityClick = (cityId: string) => {
    if (!cityId) return;
    navigate(`/place/${cityId}`);
  };

  const handleAddClick = () => {
    setEditRecommendation(null);
    setIsDrawerOpen(true);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setIsSearchExpanded(false);
  };

  const toggleSearch = () => {
    lightHaptic();
    setIsSearchExpanded(!isSearchExpanded);
    if (isSearchExpanded) {
      setSearchTerm("");
    }
  };

  const handleRemoveFilter = (filterKey: keyof FilterState, value?: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      if (filterKey === "visitStatus") {
        newFilters.visitStatus = "all";
      } else if (value) {
        const currentArray = newFilters[filterKey] as string[];
        newFilters[filterKey] = currentArray.filter((v) => v !== value) as any;
        if (filterKey === "sourceNames" && (newFilters.sourceNames as string[]).length === 0) {
          newFilters.sources = newFilters.sources.filter(s => s !== 'friend');
        }
      }
      return newFilters;
    });
  };

  const activeFilterCount = countActiveFilters(filters);

  const flagEmoji = countryName && countryToCode[countryName]
    ? String.fromCodePoint(...[...countryToCode[countryName].toUpperCase()].map(c => 127397 + c.charCodeAt(0)))
    : "";

  const filteredGroups = groupedRecommendations.map(group => ({
    ...group,
    items: Array.isArray(group.items)
      ? group.items.filter(place =>
        place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (place.country?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
      )
      : []
  })).filter(group => group.items.length > 0);

  return (
    <Layout>
      <div className="px-4 pt-3 pb-2 relative">
        {/* Header row - Back button and Actions */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0 -ml-2 text-neutral-600 dark:text-neutral-400"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>

          <div className="flex items-center gap-2">
            {/* Search icon button */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={toggleSearch}
              className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors text-neutral-600 dark:text-neutral-400"
              aria-label="Open search"
            >
              <SearchIcon className="h-5 w-5" />
            </motion.button>

            {/* Filter Button */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                lightHaptic();
                setIsFilterSheetOpen(true);
              }}
              className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors relative text-neutral-600 dark:text-neutral-400"
              aria-label="Open filters"
            >
              <SlidersHorizontal className="h-5 w-5" />
              {activeFilterCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#667eea] text-white text-[10px] flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </motion.button>
          </div>
        </div>

        {/* Large Title Section */}
        <div className="mb-2">
          <h1 className="text-[28px] font-bold tracking-tight bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent dark:from-white dark:to-white/80">
            <span className="text-foreground inline-block bg-none mr-2">{flagEmoji}</span>
            {countryName}
          </h1>
        </div>
      </div>

      {/* Expandable Search Bar */}
      <AnimatePresence>
        {isSearchExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="px-4 pb-4 relative overflow-hidden"
          >
            <SearchInput
              searchTerm={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClear={handleClearSearch}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-2 mb-2">
        <CategoriesScrollbar />
      </div>
      <div className="px-4 mb-3">
        <ActiveFilters filters={filters} onRemoveFilter={handleRemoveFilter} />
      </div>

      <div>
        <CategoryResults
          category={selectedCategory}
          groupedRecommendations={filteredGroups}
          onToggleVisited={handleToggleVisited}
          onDeleteRecommendation={handleDeleteRecommendation}
          onEditClick={handleEditClick}
          onViewDetails={handleViewDetails}
          onCityClick={handleCityClick}
          hideCityHeader={false}
          hideCountryHeader={true}
          showToggle={false}
          hideCountry={true}
        />
      </div>

      {!isDrawerOpen && !detailsDialogOpen && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          className="fixed bottom-20 right-4 rounded-full w-14 h-14 z-[100] ios26-transition-spring flex items-center justify-center text-white"
          aria-label="Add recommendation"
          onClick={() => {
            mediumHaptic();
            handleAddClick();
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

      <RecommendationDrawer
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        initialCountry={countryName}
        editRecommendation={editRecommendation}
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
        availableCountries={countryName ? [countryName] : []}
        availableCities={availableCities}
        availableOccasions={availableOccasions}
        availableSourceNames={availableSourceNames}
      />
    </Layout>
  );
};

export default CountryView;
