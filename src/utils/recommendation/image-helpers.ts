import { getCategoryPlaceholder } from "@/utils/image/getCategoryPlaceholder";
import { fetchPexelsImage } from "./pexels/fetchPexelsImage";

/**
 * Tries to fetch a smart image using Pexels. Falls back to a category placeholder.
 */
export const getSmartImage = async (name: string, category: string): Promise<string> => {
  const query = `${name} ${category}`;
  console.log("🧠 getSmartImage() called with:", query);

  try {
    const pexelsImage = await fetchPexelsImage(query);
    if (pexelsImage) {
      console.log("✅ Pexels image found:", pexelsImage);
      return pexelsImage;
    } else {
      console.log("❌ No Pexels image found");
    }
  } catch (err) {
    console.error("⚠️ Error calling fetchPexelsImage:", err);
  }

  const fallback = getCategoryPlaceholder(category);
  console.log("🪂 Falling back to placeholder:", fallback);
  return fallback;
};

/**
 * Basic static image for known cities (used in city headers).
 */
export const getCityImage = (cityName?: string): string => {
  if (!cityName) return "https://images.unsplash.com/photo-1490731727228-d56f39758d0e?auto=format&fit=crop&w=800&q=80";

  const cityLower = cityName.toLowerCase();

  if (cityLower.includes("paris")) {
    return "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80";
  }
  if (cityLower.includes("rome") || cityLower.includes("roma")) {
    return "https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=800&q=80";
  }
  if (cityLower.includes("london")) {
    return "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80";
  }
  if (cityLower.includes("new york") || cityLower.includes("nyc")) {
    return "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80";
  }
  if (cityLower.includes("tokyo")) {
    return "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80";
  }
  if (cityLower.includes("barcelona")) {
    return "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=800&q=80";
  }
  if (cityLower.includes("amsterdam")) {
    return "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=800&q=80";
  }
  if (cityLower.includes("istanbul")) {
    return "https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=800&q=80";
  }
  if (cityLower.includes("bangkok")) {
    return "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80";
  }
  if (cityLower.includes("sydney")) {
    return "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80";
  }
  if (cityLower.includes("dubai")) {
    return "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80";
  }
  if (cityLower.includes("singapore")) {
    return "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80";
  }
  if (cityLower.includes("hong kong")) {
    return "https://images.unsplash.com/photo-1506970845246-18f21d533b20?auto=format&fit=crop&w=800&q=80";
  }
  if (cityLower.includes("san francisco")) {
    return "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=800&q=80";
  }
  if (cityLower.includes("los angeles") || cityLower.includes("la")) {
    return "https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?auto=format&fit=crop&w=800&q=80";
  }

  return "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=800&q=80";
};