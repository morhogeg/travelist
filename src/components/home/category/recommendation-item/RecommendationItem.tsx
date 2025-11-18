import React from "react";
import { motion } from "framer-motion";
import ItemImage from "./ItemImage";
import ItemHeader from "./ItemHeader";
import ItemActions from "./ItemActions";
import { RecommendationItemProps } from "./types";
import { ExternalLink, UserCircle } from "lucide-react";
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
  // Check if item has attribution data
  const hasAttribution = !!(
    item.source?.name ||
    item.context?.specificTip ||
    item.context?.occasionTags?.length ||
    item.context?.personalNote ||
    item.context?.visitPriority
  );

  return (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 * index }}
      className={`liquid-glass-clear rounded-2xl overflow-hidden shadow-lg hover:shadow-xl ios26-transition-smooth ${
        item.visited ? 'ring-2 ring-success/30' : ''
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <ItemImage
          item={item}
          getCategoryPlaceholder={getCategoryPlaceholder}
        />
        {hasAttribution && (
          <div className="absolute top-3 left-3 z-10">
            <div className="bg-purple-500/90 hover:bg-purple-600 text-white p-1.5 rounded-full shadow-md transition-colors">
              <UserCircle className="h-4 w-4" />
            </div>
          </div>
        )}
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

      <div className="px-2.5 py-1.5 space-y-0.5">
        <h3 className="text-sm font-semibold leading-tight">{item.name}</h3>

        {item.description && (
          <p className="text-sm text-muted-foreground">{item.description}</p>
        )}

        {/* Attribution Info */}
        {item.source?.name && (
          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium flex items-center gap-1">
            <UserCircle className="h-3 w-3" />
            Recommended by {item.source.name}
          </p>
        )}

        {item.context?.specificTip && (
          <p className="text-xs text-amber-700 dark:text-amber-400 italic">
            💡 {item.context.specificTip}
          </p>
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