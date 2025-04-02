import React from "react";
import { motion } from "framer-motion";
import { getCategoryPlaceholder } from "@/utils/recommendation-helpers";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { markRecommendationVisited, deleteRecommendation } from "@/utils/recommendation-parser";
import CityHeader from "./CityHeader";
import GridView from "./GridView";
import ListView from "./ListView";
import type { CityGroupProps } from "./types";

const CityGroup: React.FC<CityGroupProps> = ({
  cityId,
  cityName,
  cityImage,
  items,
  index = 0,
  onEditClick,
  onToggleVisited,
  onDeleteRecommendation,
  onCityClick,
  onRefresh,
  viewMode = "grid"
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const toTitleCase = (str: string): string =>
    str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

  const handleDeleteRecommendation = (recId: string, name: string) => {
    if (onDeleteRecommendation) {
      onDeleteRecommendation(recId, name);
    } else {
      deleteRecommendation(recId);
      toast({
        title: "Recommendation deleted",
        description: `"${name}" has been removed from your recommendations.`,
      });
      window.dispatchEvent(new CustomEvent("recommendationDeleted"));
    }
  };

  const handleToggleVisited = (recId: string, name: string, visited: boolean) => {
    if (onToggleVisited) {
      onToggleVisited(recId, name, visited);
    } else {
      try {
        markRecommendationVisited(recId, name, !visited);
        toast({
          title: visited ? "Marked as not visited" : "Marked as visited",
          description: `"${name}" has been ${visited ? "removed from" : "added to"} your visited places.`,
        });
        window.dispatchEvent(new CustomEvent("recommendationVisited"));
        onRefresh?.();
      } catch (error) {
        console.error("Error toggling visited state:", error);
        toast({
          title: "Error",
          description: "Could not update the visited status. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleCityClickInternal = (cityId: string) => {
    if (onCityClick) {
      onCityClick(cityId);
    } else {
      navigate(`/place/${cityId}`);
    }
  };

  const handleEdit = (item: any) => {
    if (onEditClick) {
      onEditClick(item);
    }
  };

  const processedItems = items.map((item) => ({
    ...item,
    category: toTitleCase(item.category),
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="mb-10 px-6 sm:px-8"
    >
      <CityHeader
        cityName={cityName}
        cityId={cityId}
        onCityClick={handleCityClickInternal}
      />

      <div className="mt-4">
        {viewMode === "grid" ? (
          <GridView
            items={processedItems}
            onDeleteRecommendation={handleDeleteRecommendation}
            onToggleVisited={handleToggleVisited}
            onCityClick={handleCityClickInternal}
            onEditClick={handleEdit}
            getCategoryPlaceholder={getCategoryPlaceholder}
          />
        ) : (
          <ListView
            items={processedItems}
            onDeleteRecommendation={handleDeleteRecommendation}
            onToggleVisited={handleToggleVisited}
            onEditClick={handleEdit}
            onRefresh={onRefresh}
          />
        )}
      </div>
    </motion.div>
  );
};

export default CityGroup;