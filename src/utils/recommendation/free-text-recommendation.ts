import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";
import { storeRecommendation } from "@/utils/recommendation-parser";
import { FreeTextFormValues } from "./types";
import { getSmartImage } from "@/utils/image/getSmartImage";
import { autoPopulateSource, cleanAttributionFromText } from "./text-parser";

export const processFreeTextRecommendation = async (
  values: FreeTextFormValues,
  toast: ReturnType<typeof useToast>["toast"]
): Promise<boolean> => {
  try {
    if (!values.city || !values.recommendations) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return false;
    }

    // Try to auto-detect attribution from the text
    const detectedSource = autoPopulateSource(values.recommendations);

    // Clean attribution patterns from the text before processing
    const cleanedText = detectedSource
      ? cleanAttributionFromText(values.recommendations)
      : values.recommendations;

    const lines = cleanedText
      .split("\n")
      .filter((line) => line.trim() !== "");

    if (lines.length === 0) {
      toast({
        title: "No recommendations",
        description: "Please add at least one recommendation",
        variant: "destructive",
      });
      return false;
    }

    const classifyCategory = (line: string): string => {
      const lower = line.toLowerCase();
      if (/(eat|dine|restaurant|food)/.test(lower)) return "food";
      if (/(shop|mall|shopping)/.test(lower)) return "shopping";
      if (/(stay|hotel|airbnb|hostel)/.test(lower)) return "accommodation";
      if (/(museum|gallery|art|exhibit)/.test(lower)) return "culture";
      if (/(park|garden|nature|hike|walk)/.test(lower)) return "nature";
      if (/(visit|explore|attraction|landmark)/.test(lower)) return "attraction";
      if (/(activity|fun|entertainment|play)/.test(lower)) return "experience";
      return "other";
    };

    const extractPlaceName = (line: string): string => {
      const cleaned = line
        .toLowerCase()
        .replace(/^(in|eat|dine|visit|stay|shop|explore|walk|see|go|at)\s+/i, "")
        .replace(/^(in|at|the)\s+/i, "")
        .replace(/[^a-zA-Z0-9'"&\s]/g, "")
        .trim();

      return cleaned.replace(/\b\w/g, (c) => c.toUpperCase());
    };

    const places = await Promise.all(
      lines.map(async (line) => {
        const name = extractPlaceName(line);
        const category = classifyCategory(line);
        const image = await getSmartImage(`${name} ${values.city}`, category);

        return {
          id: uuidv4(),
          recId: uuidv4(),
          name,
          category,
          description: line.includes(":") ? line.split(":")[1].trim() : "",
          image,
          visited: false,
          // Attach detected source if found
          source: detectedSource || undefined,
        };
      })
    );

    const newRec = {
      id: uuidv4(),
      city: values.city,
      categories: Array.from(new Set(places.map((p) => p.category))),
      places,
      rawText: values.recommendations,
      dateAdded: new Date().toISOString(),
    };

    await storeRecommendation(newRec);
    window.dispatchEvent(new CustomEvent("recommendationAdded"));
    return true;
  } catch (error) {
    console.error("Error submitting recommendation:", error);
    toast({
      title: "Error",
      description: "Could not save your recommendation. Please try again.",
      variant: "destructive",
    });
    return false;
  }
};
