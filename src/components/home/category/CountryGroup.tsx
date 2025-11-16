import React from "react";
import CityGroup from "./CityGroup";
import { useNavigate } from "react-router-dom";
import type { GroupedRecommendation } from "@/utils/recommendation/types";
import countryToCode from "@/utils/flags/countryToCode";

const getFlagEmoji = (countryName: string): string => {
  const code = countryToCode[countryName.trim()];
  if (!code || code.length !== 2) return "🏳️";
  return String.fromCodePoint(...[...code.toUpperCase()].map(char => 127397 + char.charCodeAt(0)));
};

interface CountryGroupProps {
  country: string;
  groups: GroupedRecommendation[];
  onEditClick?: (item: any) => void;
  onToggleVisited?: (recId: string, name: string, visited: boolean) => void;
  onDeleteRecommendation?: (recId: string, name: string) => void;
  onCityClick?: (cityId: string) => void;
  onRefresh?: () => void;
  viewMode?: "grid" | "list";
  hideCityHeader?: boolean;
  hideCountryHeader?: boolean; // ✅ NEW PROP
}

const CountryGroup: React.FC<CountryGroupProps> = ({
  country,
  groups,
  onEditClick,
  onToggleVisited,
  onDeleteRecommendation,
  onCityClick,
  onRefresh,
  viewMode = "grid",
  hideCityHeader = false,
  hideCountryHeader = false // ✅ default false
}) => {
  if (!groups || groups.length === 0) return null;

  const navigate = useNavigate();
  const flag = getFlagEmoji(country);

  const handleCountryClick = () => {
    navigate(`/country/${encodeURIComponent(country)}`);
  };

  return (
    <div className="mb-6 px-6 sm:px-8">
      {!hideCountryHeader && (
        <h2
          className="text-xl font-bold text-[#667eea] mb-3 ml-1 sm:ml-0 cursor-pointer hover:text-[#764ba2] transition-colors"
          onClick={handleCountryClick}
          style={{ textDecoration: "none" }}
        >
          <span className="mr-2">{flag}</span>{country}
        </h2>
      )}
      <div className="space-y-6">
        {groups.map((group, index) => (
          <div key={group.cityId} className="pl-[2px] sm:pl-0">
            <CityGroup
              cityId={group.cityId}
              cityName={group.cityName}
              cityImage={group.cityImage}
              items={group.items}
              index={index}
              onEditClick={onEditClick}
              onToggleVisited={onToggleVisited}
              onDeleteRecommendation={onDeleteRecommendation}
              onCityClick={onCityClick}
              onRefresh={onRefresh}
              viewMode={viewMode}
              hideCityHeader={hideCityHeader}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountryGroup;