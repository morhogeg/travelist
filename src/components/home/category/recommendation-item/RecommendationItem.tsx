import React from "react";
import { motion } from "framer-motion";
import ItemImage from "./ItemImage";
import ItemHeader from "./ItemHeader";
import ItemActions from "./ItemActions";
import { RecommendationItemProps } from "./types";
import { ExternalLink } from "lucide-react";
import { formatUrl } from "@/utils/link-helpers";

const RecommendationItem: React.FC<RecommendationItemProps> = ({
  item,
  index,
  onDelete,
  onToggleVisited,
  onCityClick,
  onEditClick,
  getCategoryPlaceholder
}) => {
  return (
    <motion.div 
      key={item.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 * index }}
      className={`glass-card dark:glass-card-dark rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all scale-[0.85] ${item.visited ? 'ring-4 ring-green-500 dark:ring-green-400' : ''}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <ItemImage 
          item={item} 
          getCategoryPlaceholder={getCategoryPlaceholder} 
        />
        {item.website && (
          <div className="absolute top-3 right-3 z-10">
            <a 
              href={formatUrl(item.website)}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/80 hover:bg-white text-primary p-1.5 rounded-full shadow-sm transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        )}
      </div>

      <div className="px-4 py-3 space-y-2">
        <h3 className="text-base font-semibold leading-tight">{item.name}</h3>

        {item.description && (
          <p className="text-sm text-muted-foreground">{item.description}</p>
        )}

        <ItemHeader item={item} />

        <ItemActions 
          item={item}
          onDelete={onDelete}
          onToggleVisited={onToggleVisited}
          onEditClick={onEditClick}
        />
      </div>
    </motion.div>
  );
};

export default RecommendationItem;
