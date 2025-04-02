const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY;
const API_URL = "https://api.pexels.com/v1/search";

/**
 * Fetches a relevant image URL from Pexels for a given search query.
 */
export const fetchPexelsImage = async (query: string): Promise<string | null> => {
  if (!PEXELS_API_KEY) {
    console.warn("⚠️ PEXELS_API_KEY is not defined");
    return null;
  }

  try {
    const response = await fetch(`${API_URL}?query=${encodeURIComponent(query)}&per_page=1`, {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
    });

    if (!response.ok) {
      console.warn(`⚠️ Pexels API error: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data?.photos?.length > 0) {
      const src = data.photos[0].src;
      return src.large || src.medium || src.original || null;
    }

    return null;
  } catch (error) {
    console.error("❌ Pexels fetch error:", error);
    return null;
  }
};