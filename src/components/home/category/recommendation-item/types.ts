
export interface RecommendationItemProps {
  item: {
    id: string;
    recId?: string;
    name: string;
    category: string;
    description?: string;
    image?: string;
    visited?: boolean;
    website?: string;
    country?: string;
    location?: string;
    cityId?: string;
    dateAdded?: string;  // Added dateAdded property
  };
  index: number;
  onDelete: (recId: string, name: string) => void;
  onToggleVisited: (recId: string, name: string, visited: boolean) => void;
  onCityClick?: (cityId: string) => void;
  onEditClick?: (item: any) => void;
  onViewDetails?: (item: any) => void;
  getCategoryPlaceholder: (category: string) => string;
}
