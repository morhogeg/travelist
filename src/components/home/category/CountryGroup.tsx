import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import CityGroup from "./CityGroup";
import { useNavigate } from "react-router-dom";
import type { GroupedRecommendation } from "@/utils/recommendation/types";
import countryToCode from "@/utils/flags/countryToCode";
import { calculateVisitedStats } from "@/utils/recommendation/stats-helpers";
import { CheckCircle2 } from "lucide-react";

// Helper functions to persist collapsed state
const COLLAPSED_COUNTRIES_KEY = "travelist_collapsed_countries";

const getCollapsedCountries = (): Set<string> => {
  try {
    const stored = localStorage.getItem(COLLAPSED_COUNTRIES_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
};

const setCollapsedCountry = (country: string, collapsed: boolean) => {
  const current = getCollapsedCountries();
  if (collapsed) {
    current.add(country);
  } else {
    current.delete(country);
  }
  localStorage.setItem(COLLAPSED_COUNTRIES_KEY, JSON.stringify([...current]));
};

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
  showCounts?: boolean;
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
  isLastCountry = false,
  showCounts = true
}) => {
  // Initialize collapsed state from localStorage
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return getCollapsedCountries().has(country);
  });

  if (!groups || groups.length === 0) return null;

  const navigate = useNavigate();
  const flag = getFlagEmoji(country);

  // Count total items across all cities
  const allItems = groups.flatMap(group => group.items);
  const totalItems = allItems.length;
  const stats = calculateVisitedStats(allItems);

  const handleCountryClick = () => {
    navigate(`/country/${encodeURIComponent(country)}`);
  };

  const toggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    setCollapsedCountry(country, newCollapsed);
  };

  return (
    <div className="mb-1" id={`country-${country}`}>
      <div className="px-4">
        {!hideCountryHeader && (
          <motion.div
            className="flex items-center justify-between mb-1 cursor-pointer min-h-[38px] -mx-2 px-3 py-[6px] rounded-xl hover:bg-[#667eea]/5 dark:hover:bg-[#667eea]/10 ios26-transition-smooth"
            onClick={toggleCollapse}
            whileTap={{ scale: 0.98 }}
          >
            <h2
              className="text-sm font-semibold tracking-[0.06em] uppercase flex items-center gap-2 opacity-75"
              onClick={(e) => {
                e.stopPropagation();
                handleCountryClick();
              }}
            >
              <span>{flag}</span>
              <span className="truncate">{country}</span>
              {showCounts && (
                <span className="flex items-center gap-1.5 ml-1">
                  <span className="text-[11px] font-medium opacity-70">({totalItems})</span>
                  {stats.visited > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${stats.isComplete
                        ? "bg-success/10 text-success border border-success/20"
                        : "bg-neutral-100 dark:bg-neutral-800 text-muted-foreground"
                      }`}>
                      {stats.isComplete ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <span>{stats.visited}/{stats.total}</span>
                      )}
                    </span>
                  )}
                </span>
              )}
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
              <div className="space-y-1">
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
                      showCounts={showCounts}
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
        <div className="h-px w-full bg-gradient-to-r from-neutral-300/60 via-neutral-200/30 to-transparent dark:from-neutral-600/60 dark:via-neutral-700/30" />
      )}
    </div>
  );
};

export default CountryGroup;
