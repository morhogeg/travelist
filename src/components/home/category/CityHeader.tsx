
import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { CityHeaderProps } from "./types";
import { motion } from "framer-motion";

interface ExtendedCityHeaderProps extends CityHeaderProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  itemCount?: number;
  showCount?: boolean;
}

const CityHeader: React.FC<ExtendedCityHeaderProps> = ({
  cityName,
  cityId,
  onCityClick,
  isCollapsed = false,
  onToggleCollapse,
  itemCount = 0,
  showCount = true
}) => {
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
        className="flex items-center gap-2 cursor-pointer flex-1 rounded-lg hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 ios26-transition-smooth py-[6px] -ml-1 pl-6"
        onClick={handleCityNameClick}
        whileTap={{ scale: 0.98 }}
      >
        <h2 className="text-sm font-semibold opacity-85">{cityName}</h2>
        {showCount && <span className="text-[11px] opacity-70">({itemCount})</span>}
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
