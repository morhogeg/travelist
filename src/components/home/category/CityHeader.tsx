
import React from "react";
import { MapPin } from "lucide-react";
import { CityHeaderProps } from "./types";

const CityHeader: React.FC<CityHeaderProps> = ({ cityName, cityId, onCityClick }) => {
  return (
    <div 
      className="flex items-center gap-2 mb-4 cursor-pointer" 
      onClick={() => onCityClick(cityId)}
    >
      <MapPin className="h-5 w-5 text-[#667eea]" />
      <h2 className="text-lg font-semibold">{cityName}</h2>
    </div>
  );
};

export default CityHeader;
