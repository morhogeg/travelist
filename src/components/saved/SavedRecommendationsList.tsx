
import React from "react";
import SavedRecommendationItem from "./SavedRecommendationItem";

interface Recommendation {
  id: string;
  name: string;
  category: string;
  website?: string;
  visited?: boolean;
}

interface SavedRecommendationsListProps {
  recommendations: Recommendation[];
  cityName: string;
}

const SavedRecommendationsList: React.FC<SavedRecommendationsListProps> = ({ recommendations, cityName }) => {
  if (!recommendations || recommendations.length === 0) {
    return <p className="text-sm text-muted-foreground mt-2">No recommendations yet</p>;
  }

  return (
    <div className="mt-2">
      <h4 className="text-sm font-medium mb-1">Recommendations:</h4>
      <ul className="text-sm space-y-1">
        {recommendations.map((rec) => (
          <SavedRecommendationItem
            key={rec.id}
            name={rec.name}
            cityName={cityName}
            website={rec.website}
            visited={rec.visited}
          />
        ))}
      </ul>
    </div>
  );
};

export default SavedRecommendationsList;
