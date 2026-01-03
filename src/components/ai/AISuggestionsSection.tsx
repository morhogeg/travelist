/**
 * AISuggestionsSection Component
 *
 * Horizontal scrollable section displaying AI-powered place suggestions.
 * Shows when user has saved enough places in a city.
 */

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, ChevronRight, ChevronLeft, ChevronDown, Info, Lightbulb } from 'lucide-react';
import { AISuggestion } from '@/services/ai/types';
import { useAISuggestions } from '@/hooks/useAISuggestions';
import { AISuggestionCard } from './AISuggestionCard';
import { lightHaptic, mediumHaptic } from '@/utils/ios/haptics';
import { DEFAULT_AI_CONFIG } from '@/services/ai';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const AI_HIDDEN_KEY = 'travelist-ai-suggestions-hidden';

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
  const [isHidden, setIsHidden] = useState(() => {
    try {
      return localStorage.getItem(AI_HIDDEN_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const {
    suggestions,
    isLoading,
    error,
    hasEnoughPlaces,
    savedPlacesCount,
    refresh,
  } = useAISuggestions(cityName, countryName);
  const [visibleSuggestions, setVisibleSuggestions] = useState<AISuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<AISuggestion | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);

  const minPlaces = DEFAULT_AI_CONFIG.minPlacesForSuggestions;
  const placesNeeded = minPlaces - savedPlacesCount;

  // Keep a local list so we can optimistically remove added items
  useEffect(() => {
    setVisibleSuggestions(suggestions);
  }, [suggestions]);

  const handleRefresh = async () => {
    mediumHaptic();
    await refresh();
  };

  const scrollRight = () => {
    lightHaptic();
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: scrollRef.current.clientWidth * 0.95, behavior: 'smooth' });
    }
  };

  const scrollLeft = () => {
    lightHaptic();
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -scrollRef.current.clientWidth * 0.95, behavior: 'smooth' });
    }
  };

  const toggleHidden = () => {
    lightHaptic();
    const newValue = !isHidden;
    setIsHidden(newValue);
    try {
      localStorage.setItem(AI_HIDDEN_KEY, String(newValue));
    } catch {
      // Ignore storage errors
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
          <div className="mx-4 mb-6">
            <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl p-3 border border-neutral-100 dark:border-neutral-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-neutral-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                  Add {placesNeeded} more place{placesNeeded !== 1 ? 's' : ''} to unlock AI suggestions
                </p>
                {/* Tiny progress bar */}
                <div className="mt-1.5 h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden w-full max-w-[120px]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(savedPlacesCount / minPlaces) * 100}%` }}
                    className="h-full bg-neutral-400 dark:bg-neutral-600 rounded-full"
                  />
                </div>
              </div>
            </div>
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
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 mb-3">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={toggleHidden}
            className="flex items-center gap-2"
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <h3 className="font-semibold text-sm text-foreground">
              You might also like
            </h3>
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isHidden ? '-rotate-90' : ''}`}
            />
          </motion.button>
          {!isHidden && (
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleRefresh}
                disabled={isLoading}
                className="p-2 rounded-lg disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 text-muted-foreground ${isLoading ? 'animate-spin' : ''}`} />
              </motion.button>
              {canScrollLeft && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={scrollLeft}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                </motion.button>
              )}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={scrollRight}
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </motion.button>
            </div>
          )}
        </div>

        {/* Suggestions carousel - collapsible */}
        <AnimatePresence>
          {!isHidden && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div
                ref={scrollRef}
                className="flex gap-2 overflow-x-auto scrollbar-hide px-2 pb-2"
                style={{ scrollSnapType: 'x mandatory' }}
                onScroll={() => {
                  if (!scrollRef.current) return;
                  setCanScrollLeft(scrollRef.current.scrollLeft > 4);
                }}
              >
                <AnimatePresence mode="popLayout">
                  {isLoading && suggestions.length === 0 ? (
                    // Loading skeletons
                    <>
                      {[0, 1, 2].map((i) => (
                        <div
                          key={`skeleton-${i}`}
                          className="flex-shrink-0 w-full"
                          style={{
                            width: 'min(560px, calc(100vw - 40px))',
                            minWidth: 'min(560px, calc(100vw - 40px))',
                            maxWidth: 'min(560px, calc(100vw - 40px))',
                            scrollSnapAlign: 'start'
                          }}
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
                    visibleSuggestions.map((suggestion, index) => (
                      <div key={suggestion.id || suggestion.name + index} className="relative">
                        <AISuggestionCard
                          suggestion={suggestion}
                          cityName={cityName}
                          countryName={countryName}
                          onAdd={(s) => {
                            onAddSuggestion?.(s);
                            setVisibleSuggestions((prev) =>
                              prev.filter((p) => (p.id || p.name) !== (s.id || s.name))
                            );
                            refresh(); // fetch next suggestions immediately
                          }}
                          index={index}
                          onSelect={(s) => {
                            setSelectedSuggestion(s);
                            window.dispatchEvent(new CustomEvent("fab:hide"));
                          }}
                        />
                        {index !== suggestions.length - 1 && (
                          <div className="absolute right-[-10px] top-4 bottom-4 w-px bg-gradient-to-b from-neutral-200/60 via-neutral-200/30 to-transparent dark:from-neutral-700/60 dark:via-neutral-700/30" />
                        )}
                      </div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {!!selectedSuggestion && (
        <Drawer
          open={!!selectedSuggestion}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedSuggestion(null);
              window.dispatchEvent(new CustomEvent("fab:show"));
            }
          }}
        >
          <DrawerContent className="max-h-[80vh]">
            <DrawerHeader className="pb-2">
              <DrawerTitle>{selectedSuggestion?.name}</DrawerTitle>
              <DrawerDescription className="flex flex-wrap gap-2 text-sm">
                {selectedSuggestion?.category && <span className="capitalize">{selectedSuggestion.category}</span>}
                {selectedSuggestion?.estimatedPriceRange && (
                  <span className="text-green-600 dark:text-green-400 font-semibold">
                    {selectedSuggestion.estimatedPriceRange}
                  </span>
                )}
              </DrawerDescription>
            </DrawerHeader>
            <ScrollArea className="px-4 pb-4 max-h-[60vh]">
              <div className="space-y-3 text-sm pr-2">
                {selectedSuggestion?.description && (
                  <p className="text-foreground leading-relaxed">{selectedSuggestion.description}</p>
                )}
                {selectedSuggestion?.whyRecommended && (
                  <div className="flex items-start gap-2 text-amber-600 dark:text-amber-400">
                    <Lightbulb className="w-4 h-4 mt-0.5" />
                    <span>{selectedSuggestion.whyRecommended}</span>
                  </div>
                )}
                {selectedSuggestion?.tags?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedSuggestion.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
                <div className="flex gap-2 pt-2">
                  {onAddSuggestion && selectedSuggestion && (
                    <Button
                      className="flex-1 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white"
                      onClick={() => {
                        onAddSuggestion(selectedSuggestion);
                        setSelectedSuggestion(null);
                      }}
                    >
                      Add to List
                    </Button>
                  )}
                  <DrawerClose asChild>
                    <Button variant="outline" className="flex-1">
                      Close
                    </Button>
                  </DrawerClose>
                </div>
              </div>
            </ScrollArea>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
};

export default AISuggestionsSection;
