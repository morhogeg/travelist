import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecommendationLoader } from "./useRecommendationLoader";
import { useRecommendationActions } from "./useRecommendationActions";
import { GroupedRecommendation } from "@/utils/recommendation/types";

export const useCategoryResults = (category: string) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const navigate = useNavigate();

  const { groupedRecommendations, loadRecommendations } = useRecommendationLoader(category);
  const { handleDelete, handleVisitedToggle } = useRecommendationActions(loadRecommendations);

  const handleCityClick = (cityId: string) => {
    if (!cityId) {
      console.error("CategoryResults: Missing cityId for navigation");
      return;
    }
    navigate(`/place/${cityId}`);
  };

  const handleEditClick = (recommendation: any) => {
    setSelectedRecommendation(recommendation);
    setIsDrawerOpen(true);
  };

  const toggleViewMode = () => {
    setViewMode(prev => (prev === "grid" ? "list" : "grid"));
  };

  useEffect(() => {
    const handleEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { recId, name, visited } = customEvent.detail;

      if (recId && typeof visited === "boolean") {
        handleVisitedToggle(recId, name, visited);
      }
    };

    window.addEventListener("toggleVisited", handleEvent);
    return () => {
      window.removeEventListener("toggleVisited", handleEvent);
    };
  }, [handleVisitedToggle]);

  return {
    groupedRecommendations,
    isDrawerOpen,
    setIsDrawerOpen,
    selectedRecommendation,
    viewMode,
    handleCityClick,
    handleDelete,
    handleVisitedToggle,
    handleEditClick,
    toggleViewMode,
    reloadRecommendations: loadRecommendations // ✅ expose this
  };
};