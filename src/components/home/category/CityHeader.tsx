
import React from "react";
import { ChevronDown } from "lucide-react";
import { CityHeaderProps } from "./types";
import { motion } from "framer-motion";
import { calculateVisitedStats } from "@/utils/recommendation/stats-helpers";
import { CheckCircle2 } from "lucide-react";

interface ExtendedCityHeaderProps extends CityHeaderProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  itemCount?: number;
  showCount?: boolean;
  items?: any[];
}

const CityHeader: React.FC<ExtendedCityHeaderProps> = ({
  cityName,
  cityId,
  onCityClick,
  isCollapsed = false,
  onToggleCollapse,
  itemCount = 0,
  showCount = true,
  items = []
}) => {
  const stats = calculateVisitedStats(items);
  const handleCityNameClick = () => {
    onCityClick(cityId);
  };

  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleCollapse) {
      onToggleCollapse();
    }
  };

  return (
    <div className="flex items-center justify-between mb-1 min-h-10 -mx-2 px-2">
      <motion.div
        className="flex items-center gap-2 cursor-pointer flex-1 rounded-lg hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 ios26-transition-smooth py-[6px] -ml-1 pl-7"
        onClick={handleCityNameClick}
        whileTap={{ scale: 0.98 }}
      >
        <h2 className="text-sm font-semibold opacity-85">{cityName}</h2>
        {showCount && (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] opacity-70">({itemCount})</span>
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
          </div>
        )}
      </motion.div>

      {onToggleCollapse && (
        <motion.button
          onClick={handleChevronClick}
          initial={false}
          animate={{ rotate: isCollapsed ? 0 : 180 }}
          transition={{ duration: 0.2 }}
          className="text-muted-foreground p-2 rounded-lg hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 ios26-transition-smooth"
          whileTap={{ scale: 0.95 }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.button>
      )}
    </div>
  );
};

export default CityHeader;
