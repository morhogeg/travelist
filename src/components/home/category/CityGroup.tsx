import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getCategoryPlaceholder } from "@/utils/recommendation-helpers";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { markRecommendationVisited, deleteRecommendation } from "@/utils/recommendation-parser";
import CityHeader from "./CityHeader";
import GridView from "./GridView";
import type { CityGroupProps } from "./types";

interface Props extends CityGroupProps {
  hideCityHeader?: boolean; // ✅ NEW
  hideCountry?: boolean;
  isLastInCountry?: boolean;
}

const CityGroup: React.FC<Props> = ({
  cityId,
  cityName,
  cityImage,
  items,
  index = 0,
  onEditClick,
  onViewDetails,
  onToggleVisited,
  onDeleteRecommendation,
  onCityClick,
  onRefresh,
  hideCityHeader = false, // ✅ default false
  hideCountry = false,
  isLastInCountry = false
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(false);

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
      className="mb-1"
    >
      <div className="px-4">
      {!hideCityHeader && (
        <CityHeader
          cityName={cityName}
          cityId={cityId}
          onCityClick={handleCityClickInternal}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          itemCount={items.length}
        />
      )}

      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-2">
              <GridView
                items={processedItems}
                onDeleteRecommendation={handleDeleteRecommendation}
                onToggleVisited={handleToggleVisited}
                onCityClick={handleCityClickInternal}
                onEditClick={handleEdit}
                onViewDetails={onViewDetails}
                getCategoryPlaceholder={getCategoryPlaceholder}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      {/* Gradient divider between cities - only show if NOT the last city in the country */}
      {!isLastInCountry && (
        <div className="h-px w-full bg-gradient-to-r from-neutral-200/40 via-neutral-200/20 to-transparent dark:from-neutral-700/40 dark:via-neutral-700/20 mt-1" />
      )}
    </motion.div>
  );
};

export default CityGroup;