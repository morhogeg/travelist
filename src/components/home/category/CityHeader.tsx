
import React from "react";
import { MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { CityHeaderProps } from "./types";
import { motion } from "framer-motion";

interface ExtendedCityHeaderProps extends CityHeaderProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  itemCount?: number;
}

const CityHeader: React.FC<ExtendedCityHeaderProps> = ({
  cityName,
  cityId,
  onCityClick,
  isCollapsed = false,
  onToggleCollapse,
  itemCount = 0
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
    <div className="flex items-center justify-between mb-2 min-h-11 -mx-2 px-2">
      <motion.div
        className="flex items-center gap-2 cursor-pointer flex-1 rounded-lg hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 ios26-transition-smooth py-1 -ml-1 pl-1"
        onClick={handleCityNameClick}
        whileTap={{ scale: 0.98 }}
      >
        <MapPin className="h-5 w-5 text-[#667eea]" />
        <h2 className="text-lg font-semibold">{cityName}</h2>
        <span className="text-sm text-muted-foreground">({itemCount})</span>
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
          <ChevronDown className="h-5 w-5" />
        </motion.button>
      )}
    </div>
  );
};

export default CityHeader;
