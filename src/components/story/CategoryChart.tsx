import React from 'react';
import { motion } from 'framer-motion';
import { TravelStoryStats } from '@/utils/story/stats-calculator';

interface Props {
  stats: TravelStoryStats;
}

export function CategoryChart({ stats }: Props) {
  const { categoryBreakdown, totalPlaces } = stats;

  if (categoryBreakdown.length === 0) {
    return null;
  }

  // Take top 6 categories
  const topCategories = categoryBreakdown.slice(0, 6);
  const maxCount = topCategories[0]?.count || 1;

  // Category colors
  const categoryColors: Record<string, string> = {
    restaurant: '#F97316',
    restaurants: '#F97316',
    food: '#F97316',
    cafe: '#92400E',
    coffee: '#92400E',
    bar: '#8B5CF6',
    bars: '#8B5CF6',
    nightlife: '#6366F1',
    hotel: '#3B82F6',
    lodging: '#3B82F6',
    museum: '#EC4899',
    museums: '#EC4899',
    attraction: '#EC4899',
    attractions: '#EC4899',
    park: '#10B981',
    parks: '#10B981',
    nature: '#10B981',
    shopping: '#F472B6',
    shop: '#F472B6',
  };

  const getColor = (category: string) => {
    const normalized = category.toLowerCase();
    return categoryColors[normalized] || '#667eea';
  };

  return (
    <div className="mb-6">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">📊</span>
        <h3 className="text-lg font-semibold text-foreground">Categories</h3>
      </div>

      {/* Category bars */}
      <div className="space-y-3">
        {topCategories.map((cat, i) => {
          const percentage = (cat.count / totalPlaces) * 100;
          const barWidth = (cat.count / maxCount) * 100;
          const visitedPercentage = cat.count > 0
            ? Math.round((cat.visitedCount / cat.count) * 100)
            : 0;

          return (
            <motion.div
              key={cat.category}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative"
            >
              {/* Label row */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{cat.emoji}</span>
                  <span className="text-sm font-medium text-foreground">{cat.category}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">
                    {cat.visitedCount}/{cat.count}
                  </span>
                  <span
                    className="font-medium"
                    style={{ color: getColor(cat.category) }}
                  >
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative h-2.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                {/* Total bar */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ backgroundColor: `${getColor(cat.category)}30` }}
                />
                {/* Visited portion */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(cat.visitedCount / maxCount) * 100}%` }}
                  transition={{ duration: 0.5, delay: i * 0.1 + 0.2 }}
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ backgroundColor: getColor(cat.category) }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Show more hint */}
      {categoryBreakdown.length > 6 && (
        <p className="text-xs text-muted-foreground text-center mt-4">
          +{categoryBreakdown.length - 6} more categories
        </p>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-purple-500" />
          <span>Visited</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-purple-500/30" />
          <span>Total saved</span>
        </div>
      </div>
    </div>
  );
}
