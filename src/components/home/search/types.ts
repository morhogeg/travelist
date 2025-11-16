
export interface SearchResult {
  id: string;
  name: string;
  type: 'place' | 'recommendation';
  cityId?: string;
  city?: string;
  country?: string;
  category?: string;
  placeId?: string;
}

export interface SearchHeaderProps {
  heading?: string;
  viewMode?: "grid" | "list";
  onToggleViewMode?: () => void;
}
