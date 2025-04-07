import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import SearchHeader from "@/components/home/search/SearchHeader";
import CategoryResults from "@/components/home/CategoryResults";
import CategoriesScrollbar from "@/components/home/CategoriesScrollbar";
import RecommendationDrawer from "@/components/recommendations/RecommendationDrawer";
import ViewModeToggle from "@/components/home/category/ViewModeToggle";
import { GroupedRecommendation } from "@/utils/recommendation/types";
import { getFilteredRecommendations } from "@/utils/recommendation/filter-helpers";
import { markRecommendationVisited, deleteRecommendation } from "@/utils/recommendation-parser";
import countryToCode from "@/utils/flags/countryToCode";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const CountryView: React.FC = () => {
  const { countryName } = useParams<{ countryName: string }>();
  const navigate = useNavigate();

  const [groupedRecommendations, setGroupedRecommendations] = useState<GroupedRecommendation[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string | string[]>("all");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editRecommendation, setEditRecommendation] = useState<any>(null);

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

  const flagEmoji = countryName && countryToCode[countryName]
    ? String.fromCodePoint(...[...countryToCode[countryName].toUpperCase()].map(c => 127397 + c.charCodeAt(0)))
    : "";

  return (
    <Layout>
      <SearchHeader heading={`📍${flagEmoji} ${countryName}`} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-6 sm:px-8 mt-2">
        <CategoriesScrollbar />
        <ViewModeToggle viewMode={viewMode} onToggleViewMode={toggleViewMode} />
      </div>

      <div className="px-6 sm:px-8">
        <CategoryResults
          category={selectedCategory}
          groupedRecommendations={groupedRecommendations}
          onToggleVisited={handleToggleVisited}
          onDeleteRecommendation={handleDeleteRecommendation}
          onEditClick={handleEditClick}
          onCityClick={handleCityClick}
          viewMode={viewMode}
          toggleViewMode={toggleViewMode}
          hideCityHeader={false}
          hideCountryHeader={true}
          showToggle={false}
        />
      </div>

      <Button
        className="fixed bottom-20 right-4 rounded-full w-12 h-12 shadow-lg z-[100] hover:bg-primary/80 transform hover:scale-105 transition-all"
        size="icon"
        variant="default"
        aria-label="Add recommendation"
        onClick={handleAddClick}
      >
        <Plus className="h-6 w-6" />
      </Button>

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