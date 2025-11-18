import { getRecommendations } from "./recommendation-manager";
import { GroupedRecommendation } from "./types";
import { getSmartImage } from "@/utils/image/getSmartImage";

export const getFilteredRecommendations = async (
  category: string | string[],
  filterCountry?: string
): Promise<GroupedRecommendation[]> => {
  console.log("🔍 Filtering by category:", category, "country:", filterCountry);
  const all = getRecommendations();

  const normalize = (v: string) => v.trim().toLowerCase();
  const isAllCategory = category === "all" || (Array.isArray(category) && category.length === 0);

  const matchesCategory = (cat: string | undefined) => {
    if (!cat) return false;
    const normCat = normalize(cat);
    if (typeof category === "string") return normalize(category) === normCat;
    return category.map(normalize).includes(normCat);
  };

  const flat = await Promise.all(
    all.flatMap(rec => {
      if (filterCountry && rec.country?.toLowerCase() !== filterCountry.toLowerCase()) {
        return [];
      }

      return rec.places
        .filter(p => isAllCategory || matchesCategory(p.category))
        .map(async place => {
          const image = place.image || (await getSmartImage(place.name, place.category));
          return {
            id: place.recId,
            recId: place.recId,
            name: place.name,
            location: rec.city,
            cityId: rec.cityId || rec.id,
            image,
            category: place.category,
            description: place.description,
            visited: !!place.visited,
            dateAdded: rec.dateAdded,
            country: rec.country,
            source: place.source,
            context: place.context,
          };
        });
    })
  );

  const grouped: Record<string, GroupedRecommendation> = {};

  flat.forEach(rec => {
    if (!grouped[rec.cityId]) {
      grouped[rec.cityId] = {
        cityId: rec.cityId,
        cityName: rec.location,
        cityImage: "",
        country: rec.country || "", // ✅ inject the country
        items: [],
      };
    }
    grouped[rec.cityId].items.push(rec);
  });

  return Object.values(grouped).map(group => ({
    ...group,
    items: group.items.sort((a, b) => {
      if (a.visited !== b.visited) return a.visited ? 1 : -1;
      return new Date(b.dateAdded || "").getTime() - new Date(a.dateAdded || "").getTime();
    }),
  }));
};