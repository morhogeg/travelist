import React from "react";
import CityGroup from "@/components/home/category/CityGroup";
import type { GroupedRecommendation } from "@/utils/recommendation/types";

interface PlaceRecommendationsProps {
  placeId: string;
  placeName: string;
}

const PlaceRecommendations: React.FC<PlaceRecommendationsProps> = ({
  placeId,
  placeName,
}) => {
  const raw = localStorage.getItem("recommendations");
  if (!raw) return null;

  let recommendations: GroupedRecommendation["items"] = [];
  let cityImage = "";
  let country = "";

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const found = parsed.find(
        (r) => r.id === placeId || r.cityId === placeId
      );
      if (found) {
        recommendations = found.places.map((p: any) => ({
          id: p.recId,
          recId: p.recId,
          name: p.name,
          image: p.image,
          description: p.description,
          category: p.category,
          visited: p.visited || false,
          dateAdded: p.dateAdded,
          location: found.city,
          cityId: found.cityId || found.id,
          country: found.country,
        }));
        country = found.country;
        cityImage = found.places[0]?.image || "";
      }
    }
  } catch (err) {
    console.error("Failed to parse recommendations for place:", err);
    return null;
  }

  if (recommendations.length === 0) return null;

  return (
    <CityGroup
      cityId={placeId}
      cityName={placeName}
      cityImage={cityImage}
      items={recommendations}
      hideCityHeader={true} // ✅ Suppress city/country title bar
      viewMode="grid"
    />
  );
};

export default PlaceRecommendations;