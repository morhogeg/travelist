import React from 'react';
import { motion } from 'framer-motion';
import { TravelStoryStats } from '@/utils/story/stats-calculator';
import { getCategoryIcon, getCategoryLabel } from '@/components/recommendations/utils/category-data';

interface Props {
  stats: TravelStoryStats;
}

const categoryColors: Record<string, string> = {
  food: '#F97316',
  restaurant: '#F97316',
  restaurants: '#F97316',
  cafe: '#B45309',
  coffee: '#B45309',
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
  outdoors: '#10B981',
  shopping: '#F472B6',
  shop: '#F472B6',
  general: '#667eea',
};

function getColor(category: string): string {
  return categoryColors[category.toLowerCase()] || '#667eea';
}

export function CategoryChart({ stats }: Props) {
  const { categoryBreakdown, totalPlaces } = stats;

  if (categoryBreakdown.length === 0) return null;

  const topCategories = categoryBreakdown.slice(0, 6);
  const maxCount = topCategories[0]?.count || 1;

  return (
    <div className="mb-3">
      <div className="bg-neutral-50 dark:bg-neutral-900/60 rounded-2xl overflow-hidden">
        <div className="px-5 pt-5 pb-1">
          <p className="text-muted-foreground/60 font-semibold uppercase" style={{ fontSize: '10px', letterSpacing: '0.14em' }}>
            What You Love
          </p>
        </div>

        <div className="px-5 pt-4 pb-5 space-y-4">
          {topCategories.map((cat, i) => {
            const color = getColor(cat.category);
            const totalBarW = (cat.count / maxCount) * 100;
            const visitedBarW = (cat.visitedCount / maxCount) * 100;
            const categoryLabel = getCategoryLabel(cat.category);
            const categoryIcon = getCategoryIcon(cat.category);
            const pct = Math.round((cat.count / totalPlaces) * 100);

            return (
              <motion.div
                key={cat.category}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span style={{ color }}>{categoryIcon}</span>
                    <span className="text-sm font-semibold text-foreground">{categoryLabel}</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 text-xs">
                    <span className="text-muted-foreground/60">{cat.visitedCount}/{cat.count}</span>
                    <span className="font-bold" style={{ color }}>{pct}%</span>
                  </div>
                </div>

                {/* Bar track */}
                <div className="relative h-1.5 rounded-full overflow-hidden bg-neutral-200 dark:bg-white/[0.07]">
                  {/* Total (ghost) */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${totalBarW}%` }}
                    transition={{ duration: 0.55, delay: i * 0.08 }}
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ backgroundColor: `${color}35` }}
                  />
                  {/* Visited (solid) */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${visitedBarW}%` }}
                    transition={{ duration: 0.55, delay: i * 0.08 + 0.18 }}
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 pb-4 pt-1 flex items-center justify-between border-t border-neutral-200 dark:border-white/[0.06]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-1.5 rounded-full bg-neutral-300 dark:bg-white/20" />
              <span className="text-muted-foreground/50" style={{ fontSize: '10px' }}>Total saved</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-1.5 rounded-full" style={{ background: 'linear-gradient(90deg, #667eea, #764ba2)' }} />
              <span className="text-muted-foreground/50" style={{ fontSize: '10px' }}>Visited</span>
            </div>
          </div>
          {categoryBreakdown.length > 6 && (
            <span className="text-muted-foreground/40" style={{ fontSize: '10px' }}>
              +{categoryBreakdown.length - 6} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
