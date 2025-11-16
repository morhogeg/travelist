import React from "react";
import { Button } from "@/components/ui/button";
import { MapPin, LayoutGrid, List } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Place {
  id: string;
  name: string;
  image?: string;
  country?: string;
}

interface PlaceDetailHeaderProps {
  id?: string;
  name?: string;
  image?: string;
  country?: string;
  place?: Place;
  onBackClick?: () => void;
  onToggleViewMode?: () => void;
  viewMode?: "grid" | "list";
}

const PlaceDetailHeader: React.FC<PlaceDetailHeaderProps> = ({
  id,
  name,
  image,
  country,
  place,
  onBackClick,
  onToggleViewMode,
  viewMode = "grid",
}) => {
  const navigate = useNavigate();

  const placeId = place?.id || id;
  const placeName = place?.name || name || '';
  const placeCountry = place?.country || country;

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="px-6 sm:px-8 pt-4 pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between">
      {/* Left side: back + name + country */}
      <div className="flex items-start sm:items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="rounded-full"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground leading-snug">
            {placeName}
          </h1>
          {placeCountry && (
            <div className="flex items-center text-muted-foreground mt-0.5">
              <MapPin className="mr-1 h-4 w-4" />
              <span>{placeCountry}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right side: view mode toggle */}
      <div className="mt-4 sm:mt-0 flex justify-end">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleViewMode}
          className="h-9 w-9 rounded-full liquid-glass-clear hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60"
          aria-label={viewMode === "grid" ? "Switch to list view" : "Switch to gallery view"}
        >
          {viewMode === "grid" ? (
            <List className="h-5 w-5" />
          ) : (
            <LayoutGrid className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default PlaceDetailHeader;