// FILE: src/pages/CountryView.tsx

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PlaceLayout from "@/components/place/PlaceLayout";
import PlaceActions from "@/components/place/PlaceActions";
import CategoryResults from "@/components/home/CategoryResults";
import RecommendationDrawer from "@/components/recommendations/RecommendationDrawer";
import { GroupedRecommendation } from "@/utils/recommendation/types";
import { getFilteredRecommendations } from "@/utils/recommendation/filter-helpers";
import { markRecommendationVisited, deleteRecommendation } from "@/utils/recommendation-parser";

const CountryView: React.FC = () => {
  const { countryName } = useParams<{ countryName: string }>();
  const navigate = useNavigate();

  const [groupedRecommendations, setGroupedRecommendations] = useState<GroupedRecommendation[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedCategory, setSelectedCategory] = useState<string | string[]>("all");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const loadCountryData = useCallback(async () => {
    const filtered = await getFilteredRecommendations(selectedCategory, countryName);
    setGroupedRecommendations(filtered);
  }, [selectedCategory, countryName]);

  useEffect(() => {
    loadCountryData();
  }, [loadCountryData]);

  useEffect(() => {
    const handler = () => loadCountryData();
    window.addEventListener("recommendationAdded", handler);
    return () => window.removeEventListener("recommendationAdded", handler);
  }, [loadCountryData]);

  const handleToggleVisited = (id: string, name: string, currentVisited: boolean) => {
    markRecommendationVisited(id, name, !currentVisited);
    loadCountryData();
  };

  const handleDeleteRecommendation = (id: string, name: string) => {
    deleteRecommendation(id);
    loadCountryData();
  };

  const handleCityClick = (cityId: string) => {
    if (!cityId) return;
    navigate(`/place/${cityId}`);
  };

  const toggleViewMode = () => {
    setViewMode(prev => (prev === "grid" ? "list" : "grid"));
  };

  const handleAddClick = () => {
    setIsDrawerOpen(true);
  };

  const handleCategorySelect = (category: string | string[]) => {
    setSelectedCategory(category);
  };

  return (
    <Layout>
      <PlaceLayout
        name={countryName || "Unknown Country"}
        onBack={() => navigate(-1)}
        actions={
          <PlaceActions
            placeName={countryName || ""}
            onAddClick={handleAddClick}
          />
        }
      >
        <CategoryResults
          category={selectedCategory}
          onCategorySelect={handleCategorySelect} // ✅ NEW
          groupedRecommendations={groupedRecommendations}
          onToggleVisited={handleToggleVisited}
          onDeleteRecommendation={handleDeleteRecommendation}
          onEditClick={() => {}}
          onCityClick={handleCityClick}
          viewMode={viewMode}
          toggleViewMode={toggleViewMode}
        />
      </PlaceLayout>

      <RecommendationDrawer
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        initialCountry={countryName}
      />
    </Layout>
  );
};

export default CountryView;