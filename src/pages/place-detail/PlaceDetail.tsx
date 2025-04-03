

// FILE: src/pages/place-detail/PlaceDetail.tsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserPlaces, getRecommendations } from "@/utils/recommendation-parser";
import Layout from "@/components/layout/Layout";
import { useToast } from "@/hooks/use-toast";
import PlaceActions from "@/components/place/PlaceActions";
import CategoryResults from "@/components/home/CategoryResults";
import ViewModeToggle from "@/components/home/category/ViewModeToggle";
import RecommendationDrawer from "@/components/recommendations/RecommendationDrawer";
import { GroupedRecommendation } from "@/utils/recommendation/types";
import { getFilteredRecommendations } from "@/utils/recommendation/filter-helpers";
import CategoriesScrollbar from "@/components/home/CategoriesScrollbar";
import SearchHeader from "@/components/home/search/SearchHeader";

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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string | string[]>("all");
  const [groupedRecommendations, setGroupedRecommendations] = useState<GroupedRecommendation[]>([]);

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
          image: recWithThisId.places[0]?.image || "https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?auto=format&fit=crop&w=800&q=80",
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

  const loadRecommendations = async () => {
    if (!place?.name) return;
    const results = await getFilteredRecommendations(selectedCategory);
    const filtered = results.filter(group => group.cityName.toLowerCase() === place.name.toLowerCase());
    setGroupedRecommendations(filtered);
  };

  useEffect(() => {
    loadRecommendations();
    window.addEventListener("recommendationAdded", loadRecommendations);
    return () => window.removeEventListener("recommendationAdded", loadRecommendations);
  }, [place, selectedCategory]);

  useEffect(() => {
    const categoryHandler = (e: Event) => {
      const customEvent = e as CustomEvent<string | string[]>;
      setSelectedCategory(customEvent.detail);
    };
    window.addEventListener("categorySelected", categoryHandler);
    return () => window.removeEventListener("categorySelected", categoryHandler);
  }, []);

  const toggleViewMode = () => {
    setViewMode(prev => (prev === "grid" ? "list" : "grid"));
  };

  return (
    <Layout>
      <SearchHeader heading={`${place?.name || "City"}`} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-6 sm:px-8 mt-4">
        <CategoriesScrollbar />
        <ViewModeToggle viewMode={viewMode} onToggleViewMode={toggleViewMode} />
      </div>

      <div className="px-6 sm:px-8">
        <CategoryResults
          category={selectedCategory}
          groupedRecommendations={groupedRecommendations}
          onToggleVisited={() => {}}
          onDeleteRecommendation={() => {}}
          onEditClick={() => {}}
          onCityClick={() => {}}
          viewMode={viewMode}
          toggleViewMode={toggleViewMode}
          hideCityHeader
          hideCountryHeader
          showToggle={false}
        />
      </div>

      <RecommendationDrawer
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        initialCity={place?.name}
        initialCountry={place?.country || ""}
      />
    </Layout>
  );
};

export default PlaceDetail;

