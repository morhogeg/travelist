// This file contains shared types for recommendation components

export interface RecommendationDrawerProps {
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  initialCity?: string;
  initialCountry?: string;
  editRecommendation?: any | null;
}

export interface InputModeToggleProps {
  isStructuredInput: boolean;
  toggleInputMode: () => void;
}

export interface DrawerActionsProps {
  isAnalyzing: boolean;
  onClose: () => void;
}

// Types for hooks and state management
export interface Recommendation {
  id: string;
  name: string;
  category: string;
  image?: string;
  visited?: boolean;
  website?: string;
}

export interface Place {
  id: string;
  name: string;
  image: string;
  country?: string;
  categories: string[];
  recommendations: Recommendation[];
}
