
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
  const handleHeaderClick = (e: React.MouseEvent) => {
    if (onToggleCollapse) {
      e.stopPropagation();
      onToggleCollapse();
    } else {
      onCityClick(cityId);
    }
  };

  return (
    <motion.div
      className="flex items-center justify-between mb-2 cursor-pointer min-h-11 -mx-2 px-2 rounded-lg hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 ios26-transition-smooth"
      onClick={handleHeaderClick}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-2">
        <MapPin className="h-5 w-5 text-[#667eea]" />
        <h2 className="text-lg font-semibold">{cityName}</h2>
        <span className="text-sm text-muted-foreground">({itemCount})</span>
      </div>

      {onToggleCollapse && (
        <motion.div
          initial={false}
          animate={{ rotate: isCollapsed ? 0 : 180 }}
          transition={{ duration: 0.2 }}
          className="text-muted-foreground"
        >
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      )}
    </motion.div>
  );
};

export default CityHeader;
