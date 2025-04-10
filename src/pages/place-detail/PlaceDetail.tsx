// FILE: src/pages/place-detail/PlaceDetail.tsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserPlaces, getRecommendations } from "@/utils/recommendation-parser";
import Layout from "@/components/layout/Layout";
import { useToast } from "@/hooks/use-toast";
import CategoryResults from "@/components/home/CategoryResults";
import ViewModeToggle from "@/components/home/category/ViewModeToggle";
import RecommendationDrawer from "@/components/recommendations/RecommendationDrawer";
import { GroupedRecommendation } from "@/utils/recommendation/types";
import { getFilteredRecommendations } from "@/utils/recommendation/filter-helpers";
import CategoriesScrollbar from "@/components/home/CategoriesScrollbar";
import SearchInput from "@/components/home/search/SearchInput";
import { Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string | string[]>("all");
  const [groupedRecommendations, setGroupedRecommendations] = useState<GroupedRecommendation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

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

  useEffect(() => {
    if (!place) return;

    const loadRecommendations = async () => {
      const results = await getFilteredRecommendations(selectedCategory);
      const filtered = results.filter(group =>
        group.cityId === place.id
      );
      setGroupedRecommendations(filtered);
    };

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

  const handleEditClick = (recommendation: any) => {
    setEditRecommendation(recommendation);
    setIsDrawerOpen(true);
  };

  const handleSearchClear = () => setSearchTerm("");

  const filteredGroups = groupedRecommendations.map(group => ({
    ...group,
    items: (group.items ?? []).filter(place =>
      place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (place.country?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    )
  })).filter(group => group.items.length > 0);

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
      <div className="flex items-center gap-2 px-6 sm:px-8 mt-4">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          size="sm"
          className="p-1 h-auto text-muted-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold">{place.name}</h1>
          {place.country && (
            <p className="text-sm text-muted-foreground">{place.country}</p>
          )}
        </div>
      </div>

      <div className="px-6 sm:px-8 mt-4">
        <SearchInput
          searchTerm={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClear={handleSearchClear}
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-6 sm:px-8 mt-4">
        <CategoriesScrollbar />
        <ViewModeToggle viewMode={viewMode} onToggleViewMode={toggleViewMode} />
      </div>

      <div className="px-6 sm:px-8">
        <CategoryResults
          category={selectedCategory}
          groupedRecommendations={filteredGroups}
          onToggleVisited={() => {}}
          onDeleteRecommendation={() => {}}
          onEditClick={handleEditClick}
          onCityClick={() => {}}
          viewMode={viewMode}
          toggleViewMode={toggleViewMode}
          hideCityHeader
          hideCountryHeader
          showToggle={false}
        />
      </div>

      <Button
        className="fixed bottom-20 right-4 rounded-full w-12 h-12 shadow-lg z-[100] hover:bg-primary/80 transform hover:scale-105 transition-all"
        size="icon"
        variant="default"
        aria-label="Add recommendation"
        onClick={() => {
          setEditRecommendation(null);
          setIsDrawerOpen(true);
        }}
      >
        <Plus className="h-6 w-6" />
      </Button>

      <RecommendationDrawer
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        initialCity={place.name}
        initialCountry={place.country || ""}
        editRecommendation={editRecommendation}
      />
    </Layout>
  );
};

export default PlaceDetail;