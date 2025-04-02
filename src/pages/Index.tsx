// FILE: src/pages/Index.tsx
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SearchHeader from "@/components/home/SearchHeader";
import CategoriesScrollbar from "@/components/home/CategoriesScrollbar";
import RecommendationDrawer from "@/components/recommendations/RecommendationDrawer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { getFilteredRecommendations } from "@/utils/recommendation/filter-helpers";
import { markRecommendationVisited, deleteRecommendation } from "@/utils/recommendation-parser";
import CountryGroupList from "@/components/home/category/CountryGroupList";

const Index: React.FC = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [groupedRecommendations, setGroupedRecommendations] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | undefined>(undefined);
  const [selectedCountry, setSelectedCountry] = useState<string | undefined>(undefined);
  const [selectedRecommendation, setSelectedRecommendation] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const navigate = useNavigate();

  const loadRecommendations = useCallback(async () => {
    const data = await getFilteredRecommendations(
      selectedCategories.length === 0 ? "all" : selectedCategories
    );
    setGroupedRecommendations(data);
    setRefreshKey((prev) => prev + 1);
  }, [selectedCategories]);

  useEffect(() => {
    loadRecommendations();
  }, [selectedCategories, loadRecommendations]);

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

  const handleCityClick = (cityId: string) => {
    if (!cityId) return;
    navigate(`/place/${cityId}`);
  };

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "grid" ? "list" : "grid"));
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="pb-16"
      >
        <SearchHeader heading="Alisa Travels" />
        <CategoriesScrollbar />
        <CountryGroupList
          groupedRecommendations={groupedRecommendations}
          onToggleVisited={handleToggleVisited}
          onDeleteRecommendation={handleDeleteRecommendation}
          onEditClick={handleEditClick}
          onCityClick={handleCityClick}
          viewMode={viewMode}
          toggleViewMode={toggleViewMode} // ✅ added this prop
        />
        <RecommendationDrawer
          isDrawerOpen={isDrawerOpen}
          setIsDrawerOpen={setIsDrawerOpen}
          initialCity={selectedRecommendation?.location}
          initialCountry={selectedRecommendation?.country}
          editRecommendation={selectedRecommendation}
        />
      </motion.div>
      <Button
        className="fixed bottom-20 right-4 rounded-full w-12 h-12 shadow-lg z-[100] hover:bg-primary/80 transform hover:scale-105 transition-all"
        size="icon"
        variant="default"
        aria-label="Add recommendation"
        onClick={() => setIsDrawerOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </Layout>
  );
};

export default Index;