
import React from "react";
import { MapPin } from "lucide-react";

interface SavedPlaceHeaderProps {
  name: string;
  country?: string;
  onClick?: () => void;
}

const SavedPlaceHeader: React.FC<SavedPlaceHeaderProps> = ({ 
  name, 
  country, 
  onClick 
}) => {
  return (
    <div 
      className="absolute bottom-0 left-0 right-0 p-4 cursor-pointer"
      onClick={onClick}
    >
      <h3 className="text-white text-lg font-semibold truncate">
        {name}
      </h3>
      {country && (
        <div className="flex items-center text-white/80 text-sm mt-1">
          <MapPin className="h-3.5 w-3.5 mr-1" />
          <span>{country}</span>
        </div>
      )}
    </div>
  );
};

export default SavedPlaceHeader;
