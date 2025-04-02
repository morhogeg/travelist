
import React from "react";
import { Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCategoryColor } from "@/components/recommendations/utils/category-data";

interface SavedPlaceCategoriesProps {
  categories: string[];
}

const SavedPlaceCategories: React.FC<SavedPlaceCategoriesProps> = ({ categories }) => {
  // Function to convert to title case
  const toTitleCase = (str: string): string => {
    return str.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      <div className="text-sm text-muted-foreground mb-2 flex items-center">
        <Tag className="h-3.5 w-3.5 mr-1.5" />
        Categories:
      </div>
      <div className="w-full flex flex-wrap gap-1.5">
        {categories && categories.length > 0 ? (
          categories.map((cat, i) => {
            const categoryName = toTitleCase(cat);
            const borderColor = getCategoryColor(cat.toLowerCase());
            return (
              <Badge 
                variant="outline" 
                key={i} 
                className="text-xs"
                style={{ borderColor }}
              >
                {categoryName}
              </Badge>
            );
          })
        ) : (
          <span className="text-xs text-muted-foreground">No categories yet</span>
        )}
      </div>
    </div>
  );
};

export default SavedPlaceCategories;
