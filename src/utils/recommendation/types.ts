
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
  country?: string;  // Added country property
}

export interface GroupedRecommendation {
  cityId: string;
  cityName: string;
  cityImage: string;
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
}

export interface FreeTextFormValues {
  city: string;
  recommendations: string;
}
