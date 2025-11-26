import { getRecommendations } from "@/utils/recommendation/recommendation-manager";
import { getCollections } from "@/utils/collections/collectionStore";
import { getGroupedRoutes } from "@/utils/route/route-manager";
import { SourceType, ParsedRecommendation, RecommendationPlace } from "@/utils/recommendation/types";

// Country to flag emoji mapping
const countryFlags: Record<string, string> = {
  'japan': '🇯🇵',
  'france': '🇫🇷',
  'italy': '🇮🇹',
  'spain': '🇪🇸',
  'germany': '🇩🇪',
  'united kingdom': '🇬🇧',
  'uk': '🇬🇧',
  'united states': '🇺🇸',
  'usa': '🇺🇸',
  'us': '🇺🇸',
  'canada': '🇨🇦',
  'australia': '🇦🇺',
  'mexico': '🇲🇽',
  'brazil': '🇧🇷',
  'argentina': '🇦🇷',
  'thailand': '🇹🇭',
  'vietnam': '🇻🇳',
  'south korea': '🇰🇷',
  'korea': '🇰🇷',
  'china': '🇨🇳',
  'india': '🇮🇳',
  'greece': '🇬🇷',
  'portugal': '🇵🇹',
  'netherlands': '🇳🇱',
  'belgium': '🇧🇪',
  'switzerland': '🇨🇭',
  'austria': '🇦🇹',
  'czech republic': '🇨🇿',
  'czechia': '🇨🇿',
  'poland': '🇵🇱',
  'sweden': '🇸🇪',
  'norway': '🇳🇴',
  'denmark': '🇩🇰',
  'finland': '🇫🇮',
  'iceland': '🇮🇸',
  'ireland': '🇮🇪',
  'scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'turkey': '🇹🇷',
  'egypt': '🇪🇬',
  'morocco': '🇲🇦',
  'south africa': '🇿🇦',
  'new zealand': '🇳🇿',
  'singapore': '🇸🇬',
  'malaysia': '🇲🇾',
  'indonesia': '🇮🇩',
  'philippines': '🇵🇭',
  'israel': '🇮🇱',
  'uae': '🇦🇪',
  'united arab emirates': '🇦🇪',
  'dubai': '🇦🇪',
  'croatia': '🇭🇷',
  'hungary': '🇭🇺',
  'romania': '🇷🇴',
  'colombia': '🇨🇴',
  'peru': '🇵🇪',
  'chile': '🇨🇱',
  'cuba': '🇨🇺',
  'jamaica': '🇯🇲',
  'puerto rico': '🇵🇷',
  'russia': '🇷🇺',
  'ukraine': '🇺🇦',
};

export function getCountryFlag(country: string): string {
  const normalized = country.toLowerCase().trim();
  return countryFlags[normalized] || '🌍';
}

export interface SourceStats {
  type: SourceType;
  name: string;
  count: number;
  visitedCount: number;
}

export interface CategoryStats {
  category: string;
  emoji: string;
  count: number;
  visitedCount: number;
}

export interface MonthlyStats {
  month: string;
  year: number;
  monthYear: string;
  count: number;
}

export interface CountryStats {
  country: string;
  flag: string;
  count: number;
  cities: string[];
}

export interface DiscoveryEntry {
  id: string;
  name: string;
  city: string;
  country: string;
  category: string;
  visited: boolean;
  dateAdded: string;
  source?: {
    type: SourceType;
    name: string;
  };
}

export interface TravelStoryStats {
  // Core counts
  totalPlaces: number;
  visitedCount: number;
  completionRate: number;

  // Geographic
  countriesCount: number;
  citiesCount: number;
  countries: CountryStats[];

  // Sources
  sourceBreakdown: SourceStats[];
  topRecommenders: SourceStats[];
  sourceTypeDistribution: { type: SourceType; count: number }[];

  // Categories
  categoryBreakdown: CategoryStats[];
  topCategory: CategoryStats | null;

  // Timeline
  monthlyDiscoveries: MonthlyStats[];
  discoveryTimeline: DiscoveryEntry[];

  // Year stats
  yearStats: {
    year: number;
    totalAdded: number;
    mostActiveMonth: string;
    topCategory: string;
    topSource: { name: string; type: SourceType } | null;
  } | null;

  // Routes & Collections
  totalRoutes: number;
  totalCollections: number;
}

// Category emoji mapping
const categoryEmojis: Record<string, string> = {
  'restaurant': '🍽️',
  'restaurants': '🍽️',
  'food': '🍽️',
  'cafe': '☕',
  'coffee': '☕',
  'bar': '🍸',
  'bars': '🍸',
  'nightlife': '🌙',
  'club': '🎉',
  'hotel': '🏨',
  'lodging': '🏨',
  'accommodation': '🏨',
  'museum': '🏛️',
  'museums': '🏛️',
  'attraction': '🎭',
  'attractions': '🎭',
  'landmark': '🗼',
  'park': '🌳',
  'parks': '🌳',
  'nature': '🌿',
  'beach': '🏖️',
  'shopping': '🛍️',
  'shop': '🛍️',
  'store': '🛍️',
  'spa': '💆',
  'wellness': '💆',
  'temple': '⛩️',
  'shrine': '⛩️',
  'church': '⛪',
  'art': '🎨',
  'gallery': '🖼️',
  'market': '🏪',
  'bakery': '🥐',
  'dessert': '🍰',
  'ramen': '🍜',
  'sushi': '🍣',
  'pizza': '🍕',
  'view': '👀',
  'viewpoint': '👀',
  'entertainment': '🎬',
  'theater': '🎭',
  'zoo': '🦁',
  'aquarium': '🐠',
};

function getCategoryEmoji(category: string): string {
  const normalized = category.toLowerCase().trim();
  return categoryEmojis[normalized] || '📍';
}

export function calculateTravelStats(): TravelStoryStats {
  const recommendations = getRecommendations();
  const collections = getCollections();
  const groupedRoutes = getGroupedRoutes();

  // Total routes count
  const totalRoutes =
    groupedRoutes.ongoing.length +
    groupedRoutes.completed.length +
    groupedRoutes.upcoming.length +
    groupedRoutes.past.length +
    groupedRoutes.undated.length;

  // Flatten all places with their metadata
  const allPlaces: (RecommendationPlace & {
    city: string;
    country: string;
    dateAdded?: string
  })[] = [];

  recommendations.forEach((rec: ParsedRecommendation) => {
    rec.places.forEach(place => {
      allPlaces.push({
        ...place,
        city: rec.city,
        country: rec.country || '',
        dateAdded: rec.dateAdded,
      });
    });
  });

  const totalPlaces = allPlaces.length;
  const visitedCount = allPlaces.filter(p => p.visited).length;
  const completionRate = totalPlaces > 0 ? Math.round((visitedCount / totalPlaces) * 100) : 0;

  // Country stats
  const countryMap = new Map<string, { cities: Set<string>; count: number }>();
  allPlaces.forEach(place => {
    const country = place.country || 'Unknown';
    if (!countryMap.has(country)) {
      countryMap.set(country, { cities: new Set(), count: 0 });
    }
    const data = countryMap.get(country)!;
    data.cities.add(place.city);
    data.count++;
  });

  const countries: CountryStats[] = Array.from(countryMap.entries())
    .map(([country, data]) => ({
      country,
      flag: getCountryFlag(country),
      count: data.count,
      cities: Array.from(data.cities),
    }))
    .sort((a, b) => b.count - a.count);

  const countriesCount = countries.length;
  const citiesCount = new Set(allPlaces.map(p => p.city)).size;

  // Source breakdown
  const sourceMap = new Map<string, SourceStats>();
  allPlaces.forEach(place => {
    if (place.source) {
      const key = `${place.source.type}:${place.source.name}`;
      if (!sourceMap.has(key)) {
        sourceMap.set(key, {
          type: place.source.type,
          name: place.source.name,
          count: 0,
          visitedCount: 0,
        });
      }
      const stats = sourceMap.get(key)!;
      stats.count++;
      if (place.visited) stats.visitedCount++;
    }
  });

  const sourceBreakdown = Array.from(sourceMap.values()).sort((a, b) => b.count - a.count);
  const topRecommenders = sourceBreakdown.slice(0, 5);

  // Source type distribution
  const sourceTypeMap = new Map<SourceType, number>();
  allPlaces.forEach(place => {
    if (place.source) {
      const type = place.source.type;
      sourceTypeMap.set(type, (sourceTypeMap.get(type) || 0) + 1);
    }
  });
  const sourceTypeDistribution = Array.from(sourceTypeMap.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  // Category breakdown
  const categoryMap = new Map<string, CategoryStats>();
  allPlaces.forEach(place => {
    const category = place.category || 'Other';
    if (!categoryMap.has(category)) {
      categoryMap.set(category, {
        category,
        emoji: getCategoryEmoji(category),
        count: 0,
        visitedCount: 0,
      });
    }
    const stats = categoryMap.get(category)!;
    stats.count++;
    if (place.visited) stats.visitedCount++;
  });

  const categoryBreakdown = Array.from(categoryMap.values()).sort((a, b) => b.count - a.count);
  const topCategory = categoryBreakdown[0] || null;

  // Monthly discoveries
  const monthMap = new Map<string, MonthlyStats>();
  allPlaces.forEach(place => {
    if (place.dateAdded) {
      const date = new Date(place.dateAdded);
      const year = date.getFullYear();
      const month = date.toLocaleString('default', { month: 'short' });
      const key = `${year}-${date.getMonth()}`;
      const monthYear = `${month} ${year}`;

      if (!monthMap.has(key)) {
        monthMap.set(key, { month, year, monthYear, count: 0 });
      }
      monthMap.get(key)!.count++;
    }
  });

  const monthlyDiscoveries = Array.from(monthMap.values())
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return new Date(`${a.month} 1, ${a.year}`).getTime() - new Date(`${b.month} 1, ${b.year}`).getTime();
    })
    .reverse();

  // Discovery timeline (most recent first)
  const discoveryTimeline: DiscoveryEntry[] = allPlaces
    .filter(p => p.dateAdded)
    .map(p => ({
      id: p.id || p.recId || '',
      name: p.name,
      city: p.city,
      country: p.country,
      category: p.category,
      visited: p.visited || false,
      dateAdded: p.dateAdded!,
      source: p.source ? { type: p.source.type, name: p.source.name } : undefined,
    }))
    .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());

  // Year stats (current year)
  const currentYear = new Date().getFullYear();
  const thisYearPlaces = allPlaces.filter(p => {
    if (!p.dateAdded) return false;
    return new Date(p.dateAdded).getFullYear() === currentYear;
  });

  let yearStats: TravelStoryStats['yearStats'] = null;

  if (thisYearPlaces.length > 0) {
    // Most active month this year
    const monthCounts = new Map<string, number>();
    thisYearPlaces.forEach(p => {
      if (p.dateAdded) {
        const month = new Date(p.dateAdded).toLocaleString('default', { month: 'long' });
        monthCounts.set(month, (monthCounts.get(month) || 0) + 1);
      }
    });
    const mostActiveMonth = Array.from(monthCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || '';

    // Top category this year
    const catCounts = new Map<string, number>();
    thisYearPlaces.forEach(p => {
      const cat = p.category || 'Other';
      catCounts.set(cat, (catCounts.get(cat) || 0) + 1);
    });
    const topCat = Array.from(catCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || '';

    // Top source this year
    const srcCounts = new Map<string, { name: string; type: SourceType; count: number }>();
    thisYearPlaces.forEach(p => {
      if (p.source) {
        const key = `${p.source.type}:${p.source.name}`;
        if (!srcCounts.has(key)) {
          srcCounts.set(key, { name: p.source.name, type: p.source.type, count: 0 });
        }
        srcCounts.get(key)!.count++;
      }
    });
    const topSrc = Array.from(srcCounts.values())
      .sort((a, b) => b.count - a.count)[0] || null;

    yearStats = {
      year: currentYear,
      totalAdded: thisYearPlaces.length,
      mostActiveMonth,
      topCategory: topCat,
      topSource: topSrc ? { name: topSrc.name, type: topSrc.type } : null,
    };
  }

  return {
    totalPlaces,
    visitedCount,
    completionRate,
    countriesCount,
    citiesCount,
    countries,
    sourceBreakdown,
    topRecommenders,
    sourceTypeDistribution,
    categoryBreakdown,
    topCategory,
    monthlyDiscoveries,
    discoveryTimeline,
    yearStats,
    totalRoutes,
    totalCollections: collections.length,
  };
}

// Helper to get source icon/emoji
export function getSourceIcon(type: SourceType): string {
  const icons: Record<SourceType, string> = {
    friend: '👤',
    instagram: '📸',
    tiktok: '🎵',
    youtube: '▶️',
    blog: '📝',
    article: '📰',
    email: '📧',
    text: '💬',
    ai: '🤖',
    other: '📌',
  };
  return icons[type] || '📌';
}

// Helper to format source type for display
export function formatSourceType(type: SourceType): string {
  const labels: Record<SourceType, string> = {
    friend: 'Friend',
    instagram: 'Instagram',
    tiktok: 'TikTok',
    youtube: 'YouTube',
    blog: 'Blog',
    article: 'Article',
    email: 'Email',
    text: 'Text',
    ai: 'AI',
    other: 'Other',
  };
  return labels[type] || 'Other';
}
