import type { Recommendation as RecommendationType } from "@/utils/recommendation/types";

export interface Recommendation extends RecommendationType {
  cityId?: string;
}

export interface CityGroupProps {
  cityId: string;
  cityName: string;
  cityImage: string;
  items: Recommendation[];
  index?: number;
  onEditClick?: (rec: any) => void;
  onViewDetails?: (rec: any) => void;
  onRefresh?: () => void; // ✅ NEW: used by ListView/GridView to reload data
  viewMode?: "grid" | "list";
}

export interface CityHeaderProps {
  cityName: string;
  cityId: string;
  onCityClick: (cityId: string) => void;
}

export interface GridViewProps {
  items: Recommendation[];
  onDeleteRecommendation: (recId: string, name: string) => void;
  onToggleVisited: (recId: string, name: string, visited: boolean) => void;
  onCityClick: (cityId: string) => void;
  onEditClick?: (item: Recommendation) => void;
  onViewDetails?: (item: Recommendation) => void;
  getCategoryPlaceholder: (category: string) => string;
}

export interface ListViewProps {
  items: Recommendation[];
  onDeleteRecommendation: (recId: string, name: string) => void;
  onToggleVisited: (recId: string, name: string, visited: boolean) => void;
  onEditClick?: (item: Recommendation) => void;
  onViewDetails?: (item: Recommendation) => void;
  onRefresh?: () => void; // ✅ NEW: allows reloading from ListView directly
}