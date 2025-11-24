import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
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
  onViewDetails?: (item: any) => void;
  onToggleVisited?: (recId: string, name: string, visited: boolean) => void;
  onDeleteRecommendation?: (recId: string, name: string) => void;
  onCityClick?: (cityId: string) => void;
  onRefresh?: () => void;
  viewMode?: "grid" | "list";
  hideCityHeader?: boolean;
  hideCountryHeader?: boolean; // ✅ NEW PROP
  hideCountry?: boolean;
  isLastCountry?: boolean;
}

const CountryGroup: React.FC<CountryGroupProps> = ({
  country,
  groups,
  onEditClick,
  onViewDetails,
  onToggleVisited,
  onDeleteRecommendation,
  onCityClick,
  onRefresh,
  viewMode = "grid",
  hideCityHeader = false,
  hideCountryHeader = false, // ✅ default false
  hideCountry = false,
  isLastCountry = false
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!groups || groups.length === 0) return null;

  const navigate = useNavigate();
  const flag = getFlagEmoji(country);

  // Count total items across all cities
  const totalItems = groups.reduce((sum, group) => sum + group.items.length, 0);

  const handleCountryClick = () => {
    navigate(`/country/${encodeURIComponent(country)}`);
  };

  const toggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="mb-6">
      <div className="px-4">
      {!hideCountryHeader && (
        <motion.div
          className="flex items-center justify-between mb-3 cursor-pointer min-h-11 -mx-2 px-3 py-2 rounded-xl bg-neutral-50/50 dark:bg-neutral-900/30 hover:bg-[#667eea]/5 dark:hover:bg-[#667eea]/10 ios26-transition-smooth mt-2"
          onClick={toggleCollapse}
          whileTap={{ scale: 0.98 }}
        >
          <h2
            className="text-[17px] font-semibold flex items-center gap-2"
            onClick={(e) => {
              e.stopPropagation();
              handleCountryClick();
            }}
          >
            <span>{flag}</span>
            <span>{country}</span>
            <span className="text-sm font-normal text-muted-foreground">({totalItems})</span>
          </h2>

          <motion.div
            initial={false}
            animate={{ rotate: isCollapsed ? 0 : 180 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        </motion.div>
      )}

      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-3">
              {groups.map((group, index) => (
                <div key={group.cityId}>
                  <CityGroup
                    cityId={group.cityId}
                    cityName={group.cityName}
                    cityImage={group.cityImage}
                    items={group.items}
                    index={index}
                    onEditClick={onEditClick}
                    onViewDetails={onViewDetails}
                    onToggleVisited={onToggleVisited}
                    onDeleteRecommendation={onDeleteRecommendation}
                    onCityClick={onCityClick}
                    onRefresh={onRefresh}
                    viewMode={viewMode}
                    hideCityHeader={hideCityHeader}
                    hideCountry={hideCountry}
                    isLastInCountry={index === groups.length - 1}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      {/* Gradient divider between countries - only show if NOT the last country */}
      {!isLastCountry && (
        <div className="h-px w-full bg-gradient-to-r from-neutral-300/60 via-neutral-200/30 to-transparent dark:from-neutral-600/60 dark:via-neutral-700/30 mt-6" />
      )}
    </div>
  );
};

export default CountryGroup;