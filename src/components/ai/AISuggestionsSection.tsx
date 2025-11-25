/**
 * AISuggestionsSection Component
 *
 * Horizontal scrollable section displaying AI-powered place suggestions.
 * Shows when user has saved enough places in a city.
 */

import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, ChevronRight, Info } from 'lucide-react';
import { AISuggestion } from '@/services/ai/types';
import { useAISuggestions } from '@/hooks/useAISuggestions';
import { AISuggestionCard } from './AISuggestionCard';
import { lightHaptic, mediumHaptic } from '@/utils/ios/haptics';
import { DEFAULT_AI_CONFIG } from '@/services/ai';

interface AISuggestionsSectionProps {
  cityName: string;
  countryName: string;
  onAddSuggestion?: (suggestion: AISuggestion) => void;
}

export const AISuggestionsSection: React.FC<AISuggestionsSectionProps> = ({
  cityName,
  countryName,
  onAddSuggestion,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    suggestions,
    isLoading,
    error,
    hasEnoughPlaces,
    savedPlacesCount,
    refresh,
  } = useAISuggestions(cityName, countryName);

  const minPlaces = DEFAULT_AI_CONFIG.minPlacesForSuggestions;
  const placesNeeded = minPlaces - savedPlacesCount;

  const handleRefresh = async () => {
    mediumHaptic();
    await refresh();
  };

  const scrollRight = () => {
    lightHaptic();
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
  };

  // Don't show if not enough places
  if (!hasEnoughPlaces) {
    // Show teaser if they have at least 1 place
    if (savedPlacesCount > 0) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 mb-6"
        >
          <div className="liquid-glass-clear rounded-2xl p-4 border border-white/10 dark:border-white/5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-foreground mb-1">
                  AI Suggestions Coming Soon
                </h4>
                <p className="text-xs text-muted-foreground">
                  Add {placesNeeded} more place{placesNeeded !== 1 ? 's' : ''} to unlock personalized recommendations for {cityName}.
                </p>
              </div>
            </div>
            {/* Progress indicator */}
            <div className="mt-3 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(savedPlacesCount / minPlaces) * 100}%` }}
                className="h-full bg-gradient-to-r from-[#667eea] to-[#764ba2] rounded-full"
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5 text-right">
              {savedPlacesCount} / {minPlaces} places saved
            </p>
          </div>
        </motion.div>
      );
    }
    return null;
  }

  // Error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="px-4 mb-6"
      >
        <div className="liquid-glass-clear rounded-2xl p-4 border border-destructive/20">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-destructive" />
            <p className="text-sm text-muted-foreground flex-1">{error}</p>
            <button
              onClick={handleRefresh}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <h3 className="font-semibold text-sm text-foreground">
            You might also like
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${isLoading ? 'animate-spin' : ''}`} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={scrollRight}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </motion.button>
        </div>
      </div>

      {/* Suggestions carousel */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-2"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        <AnimatePresence mode="popLayout">
          {isLoading && suggestions.length === 0 ? (
            // Loading skeletons
            <>
              {[0, 1, 2].map((i) => (
                <div
                  key={`skeleton-${i}`}
                  className="min-w-[260px] max-w-[280px] flex-shrink-0"
                >
                  <div className="liquid-glass-clear rounded-2xl p-4 animate-pulse">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-neutral-700" />
                      <div className="flex-1">
                        <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2" />
                      </div>
                    </div>
                    <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded mb-3" />
                    <div className="h-12 bg-neutral-200 dark:bg-neutral-700 rounded mb-3" />
                    <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded" />
                  </div>
                </div>
              ))}
            </>
          ) : (
            suggestions.map((suggestion, index) => (
              <AISuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                onAdd={onAddSuggestion}
                index={index}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AISuggestionsSection;
