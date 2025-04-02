
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CategoryRecommendationsList from "./CategoryRecommendationsList";
import CategoryIcon from "./CategoryIcon";
import { getRecommendationsForCity } from "@/utils/recommendation/city-helpers";
import CategoryPill from "@/components/ui/CategoryPill";
import { getCategoryIcon } from "@/components/recommendations/utils/category-data";
import CategoriesScrollContainer from "@/components/home/categories/CategoriesScrollContainer";

interface PlaceRecommendationsProps {
  placeId: string;
  placeName: string;
}

interface Recommendation {
  id: string;
  placeName: string;
  category: string;
  name: string;
  description?: string;
  image?: string;
  website?: string;
  address?: string;
  visited?: boolean;
  dateAdded?: string;
  recId?: string;
}

interface GroupedRecommendations {
  [key: string]: Recommendation[];
}

const PlaceRecommendations: React.FC<PlaceRecommendationsProps> = ({ placeId, placeName }) => {
  const [recommendations, setRecommendations] = useState<GroupedRecommendations>({});
  const [allRecommendations, setAllRecommendations] = useState<Recommendation[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");

  // Function to convert to title case
  const toTitleCase = (str: string): string => {
    return str.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  };

  useEffect(() => {
    loadRecommendations();

    const handleRecommendationChange = () => {
      loadRecommendations();
    };

    window.addEventListener('recommendationAdded', handleRecommendationChange);
    window.addEventListener('recommendationDeleted', handleRecommendationChange);
    window.addEventListener('recommendationVisited', handleRecommendationChange);
    
    return () => {
      window.removeEventListener('recommendationAdded', handleRecommendationChange);
      window.removeEventListener('recommendationDeleted', handleRecommendationChange);
      window.removeEventListener('recommendationVisited', handleRecommendationChange);
    };
  }, [placeId]);

  const loadRecommendations = () => {
    console.log("Loading recommendations for place ID:", placeId);
    
    // Get recommendations for this city using the city-helpers utility
    const cityRecommendations = getRecommendationsForCity(placeId);
    console.log("Found recommendations:", cityRecommendations);

    // Store all recommendations for the "All" category
    setAllRecommendations(cityRecommendations.map(rec => ({
      id: rec.id || placeId,
      recId: rec.recId,  // Make sure recId is included
      placeName,
      category: toTitleCase(rec.category || "Other"),
      name: rec.name,
      description: rec.description,
      image: rec.image,
      website: rec.website,
      visited: rec.visited,
      dateAdded: rec.dateAdded
    })));

    // Group recommendations by category
    const grouped: GroupedRecommendations = {};
    cityRecommendations.forEach(rec => {
      const category = toTitleCase(rec.category || "Other");
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push({
        id: rec.id || placeId,
        recId: rec.recId,  // Make sure recId is included
        placeName,
        category,
        name: rec.name,
        description: rec.description,
        image: rec.image,
        website: rec.website,
        visited: rec.visited,
        dateAdded: rec.dateAdded
      });
    });

    // Get all categories and sort alphabetically
    const categoryList = Object.keys(grouped).sort();

    // Add "All" as the first category
    setCategories(["All", ...categoryList]);
    setRecommendations(grouped);
    setActiveTab(categoryList.length > 0 ? "All" : "");
    
    console.log("Grouped recommendations by category:", grouped);
    console.log("Categories:", ["All", ...categoryList]);
  };

  if (categories.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold mb-4">No recommendations yet</h2>
        <p className="text-muted-foreground">
          Add your first recommendation using the button above
        </p>
      </div>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <CategoriesScrollContainer>
        <div className="flex gap-3 pb-2">
          {categories.map(category => (
            <CategoryPill
              key={category} 
              label={category}
              icon={category === "All" ? null : getCategoryIcon(category.toLowerCase())}
              isActive={activeTab === category}
              onClick={() => setActiveTab(category)}
            />
          ))}
        </div>
      </CategoriesScrollContainer>

      {/* Special "All" category that shows all recommendations */}
      <TabsContent value="All" className="mt-6">
        <CategoryRecommendationsList 
          recommendations={allRecommendations} 
          category="All"
        />
      </TabsContent>

      {/* Regular categories */}
      {categories.filter(cat => cat !== "All").map(category => (
        <TabsContent key={category} value={category} className="mt-6">
          <CategoryRecommendationsList 
            recommendations={recommendations[category] || []} 
            category={category}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default PlaceRecommendations;
