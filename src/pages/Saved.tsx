
import React, { useState } from "react";
import { Globe } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SavedContent from "@/components/saved/SavedContent";
import { useSavedPlaces } from "@/hooks/useSavedPlaces";
import { useCategoryFilter } from "@/hooks/useCategoryFilter";
import RecommendationDrawer from "@/components/recommendations/RecommendationDrawer";

const Saved = () => {
  const { savedPlaces, loading, allCategories, loadSavedPlaces, updatePlaceImage } = useSavedPlaces();
  const { selectedCategory, handleCategoryChange } = useCategoryFilter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const handleUpdatePlaceImage = (placeId: string, imageUrl: string) => {
    updatePlaceImage(placeId, imageUrl);
  };
  
  const openRecDrawer = () => {
    setIsDrawerOpen(true);
  };
  
  return (
    <Layout>
      <div className="pt-6 px-6 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Places</h1>
          <p className="text-muted-foreground">Your saved cities</p>
        </div>
        <Globe className="h-8 w-8 text-primary" />
      </div>
      
      <SavedContent 
        savedPlaces={savedPlaces}
        loading={loading}
        allCategories={allCategories}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        onReloadPlaces={loadSavedPlaces}
        onUpdatePlaceImage={handleUpdatePlaceImage}
        openRecDrawer={openRecDrawer}
      />
      
      <RecommendationDrawer
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
      />
    </Layout>
  );
};

export default Saved;
