
// Recommendation Attribution Types
export type SourceType = 'friend' | 'instagram' | 'blog' | 'email' | 'text' | 'tiktok' | 'youtube' | 'article' | 'ai' | 'other';

export interface RecommendationSource {
  type: SourceType;
  name: string;
  relationship?: string;
  url?: string;
  date?: string;
  notes?: string;
}

export type VisitPriority = 'high' | 'medium' | 'low';

export interface RecommendationContext {
  specificTip?: string;
  occasionTags?: string[];
  bestTime?: string;
  priceRange?: '$' | '$$' | '$$$' | '$$$$';
  visitPriority?: VisitPriority;
  personalNote?: string;
}

// Core Recommendation Types
export interface ParsedRecommendation {
  id: string;
  city: string;
  cityId?: string;
  country?: string;
  categories: string[];
  places: RecommendationPlace[];
  rawText: string;
  dateAdded?: string;
}

export interface RecommendationPlace {
  id?: string;
  recId?: string;  // Added recId property
  name: string;
  category: string;
  description?: string;
  image?: string;
  visited?: boolean;
  website?: string;
  source?: RecommendationSource;
  context?: RecommendationContext;
  location?: string;
  lat?: number;
  lng?: number;
  city?: string;
  country?: string;
}

export interface Place {
  id: string;
  name: string;
  image: string;
  country?: string;
}

export interface Recommendation {
  id: string;
  name: string;
  location: string;
  image: string;
  category: string;
  description?: string;
  website?: string;
  recId?: string;
  dateAdded?: string;
  visited?: boolean;
  country?: string;
  city?: string;
  cityId?: string;
  source?: RecommendationSource;
  context?: RecommendationContext;
}

export interface GroupedRecommendation {
  cityId: string;
  cityName: string;
  cityImage: string;
  country?: string;
  items: Recommendation[];
}

// Form related types
export interface StructuredFormValues {
  category: string;
  name: string;
  city: string;
  country?: string;
  description?: string;
  website?: string;
  source?: RecommendationSource;
  context?: RecommendationContext;
}

export interface FreeTextFormValues {
  city: string;
  recommendations: string;
}
