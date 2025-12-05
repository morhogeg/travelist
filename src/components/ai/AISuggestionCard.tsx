/**
 * AISuggestionCard Component
 *
 * Displays a single AI-suggested place with category icon and description.
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  Utensils,
  Bed,
  Eye,
  ShoppingBag,
  Music,
  Palmtree,
  MapPin,
  Plus,
  Lightbulb,
  Navigation,
} from 'lucide-react';
import { AISuggestion, PlaceCategory } from '@/services/ai/types';
import { lightHaptic } from '@/utils/ios/haptics';
import { generateMapLink } from '@/utils/link-helpers';
import { getCategoryColor } from '@/components/recommendations/utils/category-data';

interface AISuggestionCardProps {
  suggestion: AISuggestion;
  cityName: string;
  countryName: string;
  onAdd?: (suggestion: AISuggestion) => void;
  index?: number;
  onSelect?: (suggestion: AISuggestion) => void;
}

const CATEGORY_ICONS: Record<PlaceCategory, React.ElementType> = {
  food: Utensils,
  lodging: Bed,
  attractions: Eye,
  shopping: ShoppingBag,
  nightlife: Music,
  outdoors: Palmtree,
  general: MapPin,
};

export const AISuggestionCard: React.FC<AISuggestionCardProps> = ({
  suggestion,
  cityName,
  countryName,
  onAdd,
  index = 0,
  onSelect,
}) => {
  const Icon = CATEGORY_ICONS[suggestion.category] || MapPin;
  const categoryColor = getCategoryColor(suggestion.category);

  const handleAdd = () => {
    lightHaptic();
    onAdd?.(suggestion);
  };

  const mapUrl = generateMapLink(suggestion.name, `${cityName}, ${countryName}`);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className="flex-shrink-0 flex-grow-0 basis-full"
      style={{
        width: 'min(620px, calc(100vw - 12px))',
        minWidth: 'min(620px, calc(100vw - 12px))',
        maxWidth: 'min(620px, calc(100vw - 12px))',
        scrollSnapAlign: 'start'
      }}
      onClick={() => onSelect?.(suggestion)}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : -1}
    >
      <div
        className="liquid-glass-clear rounded-2xl px-4 pt-4 pb-4 h-full border border-white/10 dark:border-white/5"
        style={{ boxShadow: 'none' }}
      >
        {/* Header with icon and name */}
        <div className="flex items-center gap-2 mb-2.5">
          <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center" style={{ color: categoryColor }}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-foreground truncate">
              {suggestion.name}
            </h4>
            <p className="text-xs text-muted-foreground capitalize">
              {suggestion.category}
              {suggestion.estimatedPriceRange && (
                <span className="ml-2 text-green-600 dark:text-green-400">
                  {suggestion.estimatedPriceRange}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-3 mb-2.5">
          {suggestion.description}
        </p>

        {/* Why recommended - matching tip style */}
        <p className="text-xs text-amber-600 dark:text-amber-400 line-clamp-4 mb-2.5 flex items-start gap-1.5">
          <Lightbulb className="w-3 h-3 flex-shrink-0 mt-0.5" />
          <span>{suggestion.whyRecommended}</span>
        </p>

        {/* Tags */}
        {suggestion.tags && suggestion.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {suggestion.tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Directions button - matching regular cards */}
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-full hover:bg-muted/60"
            aria-label="Open in Google Maps"
            onClick={(e) => e.stopPropagation()}
          >
            <Navigation className="w-4 h-4" />
          </a>

          {/* Add button */}
          {onAdd && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                handleAdd();
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white text-xs font-medium ios26-transition-smooth"
            >
              <Plus className="w-4 h-4" />
              Add to List
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AISuggestionCard;
