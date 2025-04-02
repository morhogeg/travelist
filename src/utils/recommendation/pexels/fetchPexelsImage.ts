const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY;
const API_URL = "https://api.pexels.com/v1/search";

export const fetchPexelsImage = async (query: string): Promise<string | null> => {
  console.log("📡 Fetching from Pexels:", query);

  try {
    const response = await fetch(
      `${API_URL}?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape&size=medium`,
      {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      console.warn("❌ Pexels API error:", response.status);
      return null;
    }

    const data = await response.json();
    console.log("📸 Pexels response:", data);

    if (data.photos && data.photos.length > 0) {
      return data.photos[0].src.medium || data.photos[0].src.original;
    }

    return null;
  } catch (error) {
    console.error("🛑 Pexels fetch error:", error);
    return null;
  }
};