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
  Camera,
  ShoppingBag,
  Moon,
  TreePine,
  MapPin,
  Plus,
  Sparkles,
} from 'lucide-react';
import { AISuggestion, PlaceCategory } from '@/services/ai/types';
import { lightHaptic } from '@/utils/ios/haptics';

interface AISuggestionCardProps {
  suggestion: AISuggestion;
  onAdd?: (suggestion: AISuggestion) => void;
  index?: number;
}

const CATEGORY_ICONS: Record<PlaceCategory, React.ElementType> = {
  food: Utensils,
  lodging: Bed,
  attractions: Camera,
  shopping: ShoppingBag,
  nightlife: Moon,
  outdoors: TreePine,
  general: MapPin,
};

const CATEGORY_COLORS: Record<PlaceCategory, string> = {
  food: 'from-orange-500 to-red-500',
  lodging: 'from-blue-500 to-indigo-500',
  attractions: 'from-purple-500 to-pink-500',
  shopping: 'from-pink-500 to-rose-500',
  nightlife: 'from-violet-500 to-purple-500',
  outdoors: 'from-green-500 to-emerald-500',
  general: 'from-gray-500 to-slate-500',
};

export const AISuggestionCard: React.FC<AISuggestionCardProps> = ({
  suggestion,
  onAdd,
  index = 0,
}) => {
  const Icon = CATEGORY_ICONS[suggestion.category] || MapPin;
  const gradientColor = CATEGORY_COLORS[suggestion.category] || CATEGORY_COLORS.general;

  const handleAdd = () => {
    lightHaptic();
    onAdd?.(suggestion);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className="min-w-[260px] max-w-[280px] flex-shrink-0"
    >
      <div className="liquid-glass-clear rounded-2xl p-4 h-full border border-white/10 dark:border-white/5">
        {/* Header with icon and name */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradientColor} flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-5 h-5 text-white" />
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
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {suggestion.description}
        </p>

        {/* Why recommended - with AI badge */}
        <div className="flex items-start gap-2 mb-3 p-2 rounded-lg bg-primary/5 dark:bg-primary/10">
          <Sparkles className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-[11px] text-primary dark:text-primary/90 leading-relaxed">
            {suggestion.whyRecommended}
          </p>
        </div>

        {/* Tags */}
        {suggestion.tags && suggestion.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
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

        {/* Add button */}
        {onAdd && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAdd}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white text-xs font-medium ios26-transition-smooth"
          >
            <Plus className="w-4 h-4" />
            Add to List
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default AISuggestionCard;
