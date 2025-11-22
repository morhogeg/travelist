// FILE: src/pages/CountryView.tsx

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/layout/Layout";
import CategoryResults from "@/components/home/CategoryResults";
import CategoriesScrollbar from "@/components/home/CategoriesScrollbar";
import RecommendationDrawer from "@/components/recommendations/RecommendationDrawer";
import ViewModeToggle from "@/components/home/category/ViewModeToggle";
import SearchInput from "@/components/home/search/SearchInput";
import { GroupedRecommendation } from "@/utils/recommendation/types";
import { getFilteredRecommendations } from "@/utils/recommendation/filter-helpers";
import { markRecommendationVisited, deleteRecommendation } from "@/utils/recommendation-parser";
import countryToCode from "@/utils/flags/countryToCode";
import { Plus, ArrowLeft, Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { lightHaptic, mediumHaptic } from "@/utils/ios/haptics";

const CountryView: React.FC = () => {
  const { countryName } = useParams<{ countryName: string }>();
  const navigate = useNavigate();

  const [groupedRecommendations, setGroupedRecommendations] = useState<GroupedRecommendation[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string | string[]>("all");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editRecommendation, setEditRecommendation] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const loadCountryData = useCallback(async () => {
    const filtered = await getFilteredRecommendations(selectedCategory, countryName);
    setGroupedRecommendations(filtered);
  }, [selectedCategory, countryName]);

  useEffect(() => {
    loadCountryData();
    window.addEventListener("recommendationAdded", loadCountryData);
    return () => window.removeEventListener("recommendationAdded", loadCountryData);
  }, [loadCountryData]);

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
    markRecommendationVisited(id, name, !currentVisited);
    loadCountryData();
  };

  const handleDeleteRecommendation = (id: string, name: string) => {
    deleteRecommendation(id);
    loadCountryData();
  };

  const handleEditClick = (recommendation: any) => {
    setEditRecommendation(recommendation);
    setIsDrawerOpen(true);
  };

  const handleCityClick = (cityId: string) => {
    if (!cityId) return;
    navigate(`/place/${cityId}`);
  };

  const toggleViewMode = () => {
    setViewMode(prev => (prev === "grid" ? "list" : "grid"));
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
      <div className="px-4 pt-3 pb-4 relative">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => navigate(-1)}
          className="absolute left-3 top-3 min-h-11 min-w-11 rounded-full liquid-glass-clear flex items-center justify-center hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60 z-50 ios26-transition-smooth"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 text-[#667eea]" />
        </motion.button>

        {/* View Mode Toggle */}
        {!isSearchExpanded && (
          <div className="absolute right-3 top-3 z-40">
            <ViewModeToggle viewMode={viewMode} onToggleViewMode={toggleViewMode} />
          </div>
        )}

        {/* Search Icon Button */}
        {!isSearchExpanded && (
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={toggleSearch}
            className="absolute left-[4rem] top-3 min-h-11 min-w-11 rounded-full liquid-glass-clear flex items-center justify-center hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60 z-40 ios26-transition-smooth text-neutral-700 dark:text-neutral-300"
            aria-label="Open search"
          >
            <SearchIcon className="h-5 w-5" />
          </motion.button>
        )}

        <div className="flex items-center justify-center">
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="mr-2">{flagEmoji}</span>
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

      <div className="mb-3">
        <CategoriesScrollbar />
      </div>

      <div>
        <CategoryResults
          category={selectedCategory}
          groupedRecommendations={filteredGroups}
          onToggleVisited={handleToggleVisited}
          onDeleteRecommendation={handleDeleteRecommendation}
          onEditClick={handleEditClick}
          onCityClick={handleCityClick}
          viewMode={viewMode}
          toggleViewMode={toggleViewMode}
          hideCityHeader={false}
          hideCountryHeader={true}
          showToggle={false}
          noSidePadding={true}
          hideCountry={true}
        />
      </div>

      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        className="fixed bottom-20 right-4 rounded-full w-16 h-16 z-[100] ios26-transition-spring flex items-center justify-center text-white"
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
        <Plus className="h-7 w-7" strokeWidth={2.5} />
      </motion.button>

      <RecommendationDrawer
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        initialCountry={countryName}
        editRecommendation={editRecommendation}
      />
    </Layout>
  );
};

export default CountryView;