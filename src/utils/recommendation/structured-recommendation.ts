import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";
import { getRecommendations, storeRecommendation } from "@/utils/recommendation-parser";
import { StructuredFormValues } from "./types";
import { getSmartImage } from "@/utils/image/getSmartImage";

export const processStructuredRecommendation = async (
  values: StructuredFormValues,
  toast: ReturnType<typeof useToast>["toast"],
  existingRecId?: string
): Promise<boolean> => {
  try {
    const recommendations = getRecommendations();

    if (!values.name || !values.category || !values.city || !values.country) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return false;
    }

    if (existingRecId) {
      let found = false;
      for (const rec of recommendations) {
        for (let i = 0; i < rec.places.length; i++) {
          const place = rec.places[i];
          if (place.id === existingRecId || place.recId === existingRecId) {
            rec.places[i] = {
              ...place,
              name: values.name,
              category: values.category,
              description: values.description || "",
              website: values.website || "",
              id: place.id || existingRecId,
              recId: place.recId || existingRecId,
              visited: place.visited || false,
            };
            if (!rec.categories.includes(values.category)) {
              rec.categories.push(values.category);
            }
            rec.country = values.country;
            localStorage.setItem("recommendations", JSON.stringify(recommendations));
            window.dispatchEvent(new CustomEvent("recommendationAdded"));
            found = true;
            break;
          }
        }
        if (found) break;
      }

      if (found) return true;

      toast({
        title: "Error",
        description: "Recommendation not found.",
        variant: "destructive",
      });
      return false;
    }

    const placeId = uuidv4();
    const recId = uuidv4();
    const cityId = uuidv4(); // ✅ consistent cityId for grouping
    const image = await getSmartImage(`${values.name} ${values.city}`, values.category);

    const newRec = {
      id: cityId,         // 🔐 cityId = rec.id
      cityId,             // 🔁 explicitly stored
      city: values.city,
      country: values.country,
      categories: [values.category],
      places: [
        {
          id: placeId,
          recId,
          name: values.name,
          category: values.category,
          description: values.description || "",
          website: values.website || "",
          image,
          visited: false,
          dateAdded: new Date().toISOString(),
        },
      ],
      rawText: `${values.name} in ${values.city}${values.description ? `: ${values.description}` : ""}`,
      dateAdded: new Date().toISOString(),
    };

    await storeRecommendation(newRec);
    window.dispatchEvent(new CustomEvent("recommendationAdded"));
    return true;
  } catch (error) {
    console.error("Error submitting recommendation:", error);
    toast({
      title: "Error",
      description: "Could not save your recommendation.",
      variant: "destructive",
    });
    return false;
  }
};