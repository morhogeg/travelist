// FILE: src/pages/place-detail/PlaceDetail.tsx

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getUserPlaces, getRecommendations, markRecommendationVisited, deleteRecommendation, storeRecommendation } from "@/utils/recommendation-parser";
import Layout from "@/components/layout/Layout";
import { useToast } from "@/hooks/use-toast";
import CategoryResults from "@/components/home/CategoryResults";
import RecommendationDrawer from "@/components/recommendations/RecommendationDrawer";
import RecommendationDetailsDialog from "@/components/home/RecommendationDetailsDialog";
import { FilterSheet } from "@/components/home/filters";
import ActiveFilters from "@/components/home/filters/ActiveFilters";
import { GroupedRecommendation } from "@/utils/recommendation/types";
import { getFilteredRecommendations, getAvailableOccasions, getAvailableSourceNames } from "@/utils/recommendation/filter-helpers";
import { syncVisitedStateToRoutes } from "@/utils/route/route-manager";
import CategoriesScrollbar from "@/components/home/CategoriesScrollbar";
import SearchInput from "@/components/home/search/SearchInput";
import { Plus, ArrowLeft, Search as SearchIcon, SlidersHorizontal, Sparkles, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import countryToCode from "@/utils/flags/countryToCode";
import { lightHaptic, mediumHaptic } from "@/utils/ios/haptics";
import { AISuggestionsSection } from "@/components/ai";
import { AISuggestion } from "@/services/ai/types";
import { FilterState, INITIAL_FILTER_STATE, countActiveFilters } from "@/types/filters";
import { v4 as uuidv4 } from "uuid";
import DurationPickerDrawer from "@/components/trip/DurationPickerDrawer";
import useTripPlanner from "@/hooks/useTripPlanner";
import Breadcrumb from "@/components/ui/breadcrumb";

interface Place {
  id: string;
  name: string;
  image: string;
  country?: string;
}

const PlaceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editRecommendation, setEditRecommendation] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | string[]>("all");
  const [groupedRecommendations, setGroupedRecommendations] = useState<GroupedRecommendation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // Details dialog state
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [detailsRecommendation, setDetailsRecommendation] = useState<any>(null);

  // Filter state
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTER_STATE);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [availableOccasions, setAvailableOccasions] = useState<string[]>([]);
  const [availableSourceNames, setAvailableSourceNames] = useState<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [hideFab, setHideFab] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(() => {
    const saved = localStorage.getItem("showAISuggestions");
    return saved === null ? true : saved === "true";
  });

  // Trip planner state
  const [isDurationPickerOpen, setIsDurationPickerOpen] = useState(false);

  // Get trip planner hook (will initialize after place is loaded)
  const tripPlanner = useTripPlanner({
    city: place?.name || '',
    country: place?.country || '',
  });

  useEffect(() => {
    if (!id) return;
    const places = getUserPlaces();
    let currentPlace = places.find(p => p.id === id);

    if (!currentPlace) {
      const recommendations = getRecommendations();
      const recWithThisId = recommendations.find(rec => rec.id === id || rec.cityId === id);
      if (recWithThisId) {
        currentPlace = {
          id: recWithThisId.cityId || recWithThisId.id,
          name: recWithThisId.city,
          image: recWithThisId.places?.[0]?.image || "https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?auto=format&fit=crop&w=800&q=80",
          country: recWithThisId.country
        };
      }
    }

    if (currentPlace) {
      setPlace(currentPlace);
    } else {
      toast({
        title: "Place not found",
        description: "We couldn't find this place.",
        variant: "destructive"
      });
    }
    setLoading(false);
  }, [id, toast]);

  const loadRecommendations = useCallback(async () => {
    if (!place) return;

    const results = await getFilteredRecommendations(
      selectedCategory === "all" ? "all" : selectedCategory,
      undefined,
      filters
    );
    const filtered = results.filter(group =>
      group.cityId === place.id
    );
    setGroupedRecommendations(filtered);
    setRefreshKey(prev => prev + 1);
  }, [place, selectedCategory, filters]);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  useEffect(() => {
    window.addEventListener("recommendationAdded", loadRecommendations);
    return () => window.removeEventListener("recommendationAdded", loadRecommendations);
  }, [loadRecommendations]);

  // Load available filter options
  useEffect(() => {
    setAvailableOccasions(getAvailableOccasions());
    setAvailableSourceNames(getAvailableSourceNames());
  }, [refreshKey]);

  useEffect(() => {
    const categoryHandler = (e: Event) => {
      const customEvent = e as CustomEvent<string | string[]>;
      setSelectedCategory(customEvent.detail);
    };
    window.addEventListener("categorySelected", categoryHandler);
    return () => window.removeEventListener("categorySelected", categoryHandler);
  }, []);

  // Listen for FAB hide/show events from child components (e.g., AI suggestions drawer)
  useEffect(() => {
    const handleHide = () => setHideFab(true);
    const handleShow = () => setHideFab(false);
    const handleAISuggestionsChange = () => {
      const saved = localStorage.getItem("showAISuggestions");
      setShowAISuggestions(saved === null ? true : saved === "true");
    };
    window.addEventListener("fab:hide", handleHide);
    window.addEventListener("fab:show", handleShow);
    window.addEventListener("aiSuggestionsChanged", handleAISuggestionsChange);
    window.addEventListener("storage", handleAISuggestionsChange);
    return () => {
      window.removeEventListener("fab:hide", handleHide);
      window.removeEventListener("fab:show", handleShow);
      window.removeEventListener("aiSuggestionsChanged", handleAISuggestionsChange);
      window.removeEventListener("storage", handleAISuggestionsChange);
    };
  }, []);

  const handleEditClick = (recommendation: any) => {
    setEditRecommendation(recommendation);
    setIsDrawerOpen(true);
  };

  const handleViewDetails = (recommendation: any) => {
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
      loadRecommendations();
    }
  };

  const handleToggleVisited = (id: string, name: string, currentVisited: boolean) => {
    const newVisitedState = !currentVisited;
    markRecommendationVisited(id, name, newVisitedState);
    syncVisitedStateToRoutes(id, newVisitedState);
    loadRecommendations();
  };

  const handleDetailsToggleVisited = (recId: string, name: string, visited: boolean) => {
    markRecommendationVisited(recId, name, visited);
    syncVisitedStateToRoutes(recId, visited);
    if (detailsRecommendation) {
      setDetailsRecommendation({
        ...detailsRecommendation,
        visited: visited,
      });
    }
    loadRecommendations();
  };

  const handleDeleteRecommendation = (id: string, name: string) => {
    deleteRecommendation(id);
    loadRecommendations();
  };

  // Handle adding an AI suggestion to the list
  const handleAddAISuggestion = async (suggestion: AISuggestion) => {
    if (!place) return;

    const recId = uuidv4();
    const newRecommendation = {
      id: recId,
      cityId: place.id,
      city: place.name,
      country: place.country || "",
      categories: [suggestion.category || "general"],
      places: [
        {
          id: uuidv4(),
          recId,
          name: suggestion.name,
          category: suggestion.category || "general",
          description: suggestion.description,
          source: {
            type: "ai",
            name: "Travelist AI",
          },
          context: {
            ...(suggestion.description ? { specificTip: suggestion.description } : {}),
            ...(suggestion.whyRecommended ? { why: suggestion.whyRecommended } : {}),
          },
        },
      ],
      rawText: suggestion.whyRecommended,
      dateAdded: new Date().toISOString(),
    };

    await storeRecommendation(newRecommendation as any);
    toast({
      title: "Added from AI suggestions",
      description: `${suggestion.name} was added to your list.`,
    });
    loadRecommendations();
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

  // Count all places in this city for the trip planner
  const totalPlacesInCity = groupedRecommendations.reduce(
    (sum, group) => sum + group.items.length,
    0
  );

  // Trip generation handler
  const handleGenerateTrip = async (durationDays: number) => {
    const trip = await tripPlanner.generateTrip(durationDays);
    if (trip) {
      setIsDurationPickerOpen(false);
      toast({
        title: 'Trip created!',
        description: `Your ${durationDays}-day ${place?.name} itinerary is ready.`,
      });
      navigate(`/trip/${trip.id}`);
    } else if (tripPlanner.error) {
      toast({
        title: 'Could not create trip',
        description: tripPlanner.error,
        variant: 'destructive',
      });
    }
  };

  const filteredGroups = groupedRecommendations.map(group => ({
    ...group,
    items: Array.isArray(group.items)
      ? group.items.filter(place =>
        place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (place.country?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
      )
      : []
  })).filter(group => group.items.length > 0);

  const flagEmoji =
    place?.country && countryToCode[place.country]
      ? String.fromCodePoint(...[...countryToCode[place.country]].map(c => 127397 + c.charCodeAt(0)))
      : "";

  if (loading) {
    return (
      <Layout>
        <div className="p-6 text-center text-muted-foreground">Loading city...</div>
      </Layout>
    );
  }

  if (!place) return null;

  return (
    <Layout>
      <div className="px-4 pt-2 pb-4 relative">
        {/* Header row - title centered, buttons on sides */}
        <div className="flex items-center justify-between mb-1 relative">
          {/* Left side: Back + Search */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            {/* Search icon button */}
            {!isSearchExpanded && (
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={toggleSearch}
                className="min-h-11 min-w-11 rounded-full flex items-center justify-center hover:opacity-60 ios26-transition-smooth text-neutral-700 dark:text-neutral-300"
                aria-label="Open search"
              >
                <SearchIcon className="h-5 w-5" />
              </motion.button>
            )}
          </div>



          {/* Right side: Filter */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              lightHaptic();
              setIsFilterSheetOpen(true);
            }}
            className="min-h-11 min-w-11 rounded-full flex items-center justify-center hover:opacity-60 ios26-transition-smooth relative"
            aria-label="Open filters"
          >
            <SlidersHorizontal className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#667eea] text-white text-xs flex items-center justify-center font-medium">
                {activeFilterCount}
              </span>
            )}
          </motion.button>
        </div>
      </div>

      <Breadcrumb
        items={[
          { label: place.country || "Country", path: `/country/${encodeURIComponent(place.country || "")}` },
          { label: place.name, path: `/place/${place.id}` },
        ]}
      />

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

      {/* User's saved places */}
      <div>
        <CategoryResults
          category={selectedCategory}
          groupedRecommendations={filteredGroups}
          onToggleVisited={handleToggleVisited}
          onDeleteRecommendation={handleDeleteRecommendation}
          onEditClick={handleEditClick}
          onViewDetails={handleViewDetails}
          onCityClick={() => { }}
          hideCityHeader
          hideCountryHeader
          showToggle={false}
          noSidePadding={true}
        />
      </div>

      {/* AI Suggestions Section - at the bottom (Conditional) */}
      {showAISuggestions && (
        <AISuggestionsSection
          cityName={place.name}
          countryName={place.country || ""}
          onAddSuggestion={handleAddAISuggestion}
        />
      )}

      {/* Plan Trip Button - shows when 4+ places available */}
      {totalPlacesInCity >= 4 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 pb-4 mt-4"
        >
          <Button
            onClick={() => {
              mediumHaptic();
              setIsDurationPickerOpen(true);
            }}
            className="w-full py-6 text-white font-semibold"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
            }}
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Plan Trip with AI
            <span className="ml-2 text-white/80 text-sm font-normal">
              ({totalPlacesInCity} places)
            </span>
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            AI will organize your places into an optimized day-by-day itinerary
          </p>
        </motion.div>
      )}

      {/* Duration Picker Drawer for Trip Planning */}
      <DurationPickerDrawer
        isOpen={isDurationPickerOpen}
        onClose={() => setIsDurationPickerOpen(false)}
        cityName={place.name}
        onSelectDuration={handleGenerateTrip}
        isGenerating={tripPlanner.isGenerating}
        progress={tripPlanner.progress}
      />

      {!isDrawerOpen && !detailsDialogOpen && !hideFab && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          className="fixed bottom-20 right-4 rounded-full w-14 h-14 z-[100] ios26-transition-spring flex items-center justify-center text-white"
          aria-label="Add recommendation"
          onClick={() => {
            mediumHaptic();
            setEditRecommendation(null);
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

      <RecommendationDrawer
        key={editRecommendation ? `edit-${editRecommendation.id}` : "new"}
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        initialCity={place.name}
        initialCountry={place.country || ""}
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
        availableCountries={place.country ? [place.country] : []}
        availableCities={[place.name]}
        availableOccasions={availableOccasions}
        availableSourceNames={availableSourceNames}
      />
    </Layout>
  );
};

export default PlaceDetail;
