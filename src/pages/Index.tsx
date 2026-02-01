import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ArrowLeft } from "lucide-react";
import { Capacitor } from '@capacitor/core';
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
import { markRecommendationVisited, deleteRecommendation, getRecommendations } from "@/utils/recommendation-parser";
import CountryGroupList from "@/components/home/category/CountryGroupList";
import SectionIndex from "@/components/home/category/SectionIndex";
import { mediumHaptic } from "@/utils/ios/haptics";
import { FilterState, INITIAL_FILTER_STATE, countActiveFilters } from "@/types/filters";
import { GroupedRecommendation, Recommendation, RecommendationPlace } from "@/utils/recommendation/types";
import EmptyState from "@/components/ui/EmptyState";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";

const Index: React.FC = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [groupedRecommendations, setGroupedRecommendations] = useState<GroupedRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | undefined>(undefined);
  const [selectedCountry, setSelectedCountry] = useState<string | undefined>(undefined);
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [detailsRecommendation, setDetailsRecommendation] = useState<Recommendation | null>(null);
  const [hideFab, setHideFab] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  // Filter state
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTER_STATE);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const [availableOccasions, setAvailableOccasions] = useState<string[]>([]);
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [availableSourceNames, setAvailableSourceNames] = useState<string[]>([]);
  const [showAISuggestions, setShowAISuggestions] = useState(() => {
    const saved = localStorage.getItem("showAISuggestions");
    return saved === null ? true : saved === "true";
  });

  const navigate = useNavigate();
  const location = useLocation();
  const [returnToPath, setReturnToPath] = useState<string | null>(null);

  // Scroll-based header opacity (Feature 3: Scroll Fade Effect)
  const [scrollOpacity, setScrollOpacity] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      // Calculate opacity based on scroll position (fade over first 100px)
      const scrollY = window.scrollY;
      const fadeStart = 0;
      const fadeEnd = 100;
      const opacity = Math.max(0, Math.min(1, 1 - (scrollY - fadeStart) / (fadeEnd - fadeStart)));
      setScrollOpacity(opacity);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadRecommendations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getFilteredRecommendations(
        selectedCategories.length === 0 ? "all" : selectedCategories,
        undefined,
        filters
      );
      setGroupedRecommendations(data);
      setRefreshKey((prev) => prev + 1);
    } finally {
      setLoading(false);
    }
  }, [selectedCategories, filters]);

  const { isRefreshing, pullProgress } = usePullToRefresh({
    onRefresh: loadRecommendations
  });

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
    const handleAISuggestionsChange = () => {
      const saved = localStorage.getItem("showAISuggestions");
      setShowAISuggestions(saved === null ? true : saved === "true");
    };
    window.addEventListener("aiSuggestionsChanged", handleAISuggestionsChange);
    window.addEventListener("storage", handleAISuggestionsChange);
    return () => {
      window.removeEventListener("aiSuggestionsChanged", handleAISuggestionsChange);
      window.removeEventListener("storage", handleAISuggestionsChange);
    };
  }, []);
  useEffect(() => {
    const handleRecommendationUpdate = () => {
      loadRecommendations();
    };

    window.addEventListener("recommendationAdded", loadRecommendations);
    window.addEventListener("recommendationUpdated", handleRecommendationUpdate);
    return () => {
      window.removeEventListener("recommendationAdded", loadRecommendations);
      window.removeEventListener("recommendationUpdated", handleRecommendationUpdate);
    };
  }, [loadRecommendations]);

  // Handle search result click to open recommendation details
  useEffect(() => {
    const handleOpenRecommendationDetails = (e: Event) => {
      const customEvent = e as CustomEvent<{ id: string; placeId?: string; cityId?: string }>;
      const { id, placeId, cityId } = customEvent.detail;

      // Find the recommendation from all data
      const allRecs = getRecommendations();
      for (const rec of allRecs) {
        const place = rec.places.find(p => p.id === id || p.recId === id || p.id === placeId);
        if (place) {
          setDetailsRecommendation({
            id: place.id || place.recId || '',
            name: place.name,
            location: rec.city,
            image: place.image || '',
            category: place.category,
            description: place.description,
            website: place.website,
            recId: place.recId || place.id,
            city: rec.city,
            country: rec.country,
          } as Recommendation);
          setDetailsDialogOpen(true);
          break;
        }
      }
    };

    window.addEventListener('openRecommendationDetails', handleOpenRecommendationDetails);
    return () => window.removeEventListener('openRecommendationDetails', handleOpenRecommendationDetails);
  }, []);

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
      const sourceName = customEvent.detail;

      // Map source names to their types (case-insensitive match)
      const sourceTypeMap: Record<string, string> = {
        'instagram': 'instagram',
        'tiktok': 'tiktok',
        'youtube': 'youtube',
        'friend': 'friend',
        'text': 'text',
        'email': 'email',
        'article': 'article',
        'blog': 'blog',
        'ai': 'ai',
        'other': 'other',
      };

      // Check if the source name matches a known source type
      const matchedType = sourceTypeMap[sourceName.toLowerCase()];

      setFilters(prev => ({
        ...prev,
        sources: matchedType ? [matchedType as any] : [],
        sourceNames: [sourceName]
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
    loadRecommendations();
  };

  const handleDeleteRecommendation = (id: string, name: string) => {
    deleteRecommendation(id);
    loadRecommendations();
  };

  const handleEditClick = (recommendation: Recommendation) => {
    setSelectedRecommendation(recommendation);
    setIsDrawerOpen(true);
  };

  const handleRecommendationClick = (place: RecommendationPlace) => {
    console.log("🔍 Index: Clicked recommendation", place.name, "Website:", place.website);
    const recommendation: Recommendation = {
      id: place.id || place.recId || '',
      name: place.name,
      location: place.location || '',
      image: place.image || '',
      category: place.category,
      description: place.description,
      website: place.website,
      recId: place.recId || place.id,
      visited: place.visited,
      country: place.country,
      city: place.city,
      source: place.source,
      context: place.context,
    };
    setDetailsRecommendation(recommendation);
    setDetailsDialogOpen(true);
  };

  const handleViewDetails = (recommendation: Recommendation) => {
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
          heading="Travelist AI"
          activeFilterCount={activeFilterCount}
          onFilterClick={() => setIsFilterSheetOpen(true)}
          scrollOpacity={scrollOpacity}
        />

        {/* AI Suggestions Section - Conditional (if we had one here) */}
        {/* {showAISuggestions && <AISuggestionsSection ... />} */}

        {/* Pull to Refresh Indicator */}
        <AnimatePresence>
          {(isRefreshing || pullProgress > 0) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: isRefreshing ? 60 : pullProgress * 60, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex items-center justify-center overflow-hidden"
            >
              <motion.div
                animate={{ rotate: isRefreshing ? 360 : pullProgress * 180 }}
                transition={isRefreshing ? { repeat: Infinity, duration: 1, ease: "linear" } : {}}
                className="text-[#667eea]"
              >
                <Plus className="h-6 w-6" style={{ transform: `scale(${Math.min(pullProgress, 1)})` }} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Categories Row */}
        <div className="px-2 mb-2" style={{ opacity: scrollOpacity, transition: 'opacity 0.3s ease-out' }}>
          <CategoriesScrollbar onSheetOpenChange={setIsCategorySheetOpen} />
        </div>
        <div className="px-4 mb-3">
          <ActiveFilters filters={filters} onRemoveFilter={handleRemoveFilter} />
        </div>

        {/* Content - List View */}
        <AnimatePresence mode="wait">
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {groupedRecommendations.length === 0 ? (
              <EmptyState
                variant={activeFilterCount > 0 ? 'no-results' : 'no-places'}
                onCtaClick={() => setIsDrawerOpen(true)}
              />
            ) : (
              <CountryGroupList
                groupedRecommendations={groupedRecommendations}
                onToggleVisited={handleToggleVisited}
                onDeleteRecommendation={handleDeleteRecommendation}
                onEditClick={handleEditClick}
                onViewDetails={handleViewDetails}
                onCityClick={handleCityClick}
                onRefresh={loadRecommendations}
                showCounts={false}
                loading={loading}
              />
            )}
          </motion.div>
        </AnimatePresence>

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
