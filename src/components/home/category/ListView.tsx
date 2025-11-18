import React from "react";
import { CheckCircle2, MoreHorizontal, Navigation, MapPin, ExternalLink, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { ListViewProps } from "./types";
import { markRecommendationVisited } from "@/utils/recommendation-parser";
import { motion } from "framer-motion";
import { formatUrl } from "@/utils/link-helpers";
import countryToCode from "@/utils/flags/countryToCode";
import { categories } from "@/components/recommendations/utils/category-data";

const ListView: React.FC<ListViewProps & { onRefresh?: () => void }> = ({
  items,
  onDeleteRecommendation,
  onEditClick,
  onRefresh
}) => {
  const { toast } = useToast();

  const toggle = (recId: string, name: string, visited: boolean) => {
    markRecommendationVisited(recId, name, !visited);
    onRefresh?.();
    toast({
      title: `Marked as ${visited ? "not visited" : "visited"}`,
      description: `"${name}" has been marked as ${visited ? "not visited" : "visited"}.`,
      action: (
        <ToastAction altText="Undo" onClick={() => {
          markRecommendationVisited(recId, name, visited);
          onRefresh?.();
        }}>Undo</ToastAction>
      )
    });
  };

  const getFlag = (country: string | null): string => {
    if (!country) return "";
    const code = countryToCode[country];
    if (!code) return "";
    return String.fromCodePoint(...[...code.toUpperCase()].map(c => 127397 + c.charCodeAt(0)));
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id.toLowerCase() === category?.toLowerCase());
    return cat?.icon || "📍";
  };

  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, string> = {
      food: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
      lodging: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      attractions: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
      shopping: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
      nightlife: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
    };
    return colorMap[category?.toLowerCase()] || "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300";
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const isVisited = !!item.visited;

        return (
          <motion.div
            key={item.recId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 * index }}
            className={`liquid-glass-clear rounded-xl overflow-hidden shadow-md hover:shadow-lg ios26-transition-smooth ${
              isVisited ? 'ring-2 ring-success/30' : ''
            }`}
          >
            <div className="flex gap-3 p-3">
              {/* Image */}
              <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                <img
                  src={item.image || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4"}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                {item.category && (
                  <div className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-xs font-medium ${getCategoryColor(item.category)}`}>
                    {getCategoryIcon(item.category)}
                  </div>
                )}
                {isVisited && (
                  <div className="absolute bottom-1 right-1 bg-success/90 text-white px-1.5 py-0.5 rounded text-xs font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-base leading-tight flex-1">{item.name}</h3>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-1.5 rounded-full hover:bg-muted transition-colors shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditClick?.(item)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggle(item.recId, item.name, isVisited)}>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Mark as {isVisited ? "not visited" : "visited"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDeleteRecommendation(item.recId, item.name)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {(item.city || item.country) && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1 mb-2">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">
                      {item.city && item.country
                        ? `${item.city}, ${getFlag(item.country)} ${item.country}`
                        : item.city || `${getFlag(item.country)} ${item.country}`}
                    </span>
                  </div>
                )}

                {item.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {item.description}
                  </p>
                )}

                <div className="flex items-center gap-3 mt-2">
                  {item.website && (
                    <a
                      href={formatUrl(item.website)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-3 w-3" />
                      Website
                    </a>
                  )}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + ', ' + (item.city || item.country))}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Navigation className="h-3 w-3" />
                    Directions
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ListView;
