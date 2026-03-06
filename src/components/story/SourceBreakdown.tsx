import React from 'react';
import { motion } from 'framer-motion';
import { TravelStoryStats, getSourceIcon, formatSourceType } from '@/utils/story/stats-calculator';

interface Props {
  stats: TravelStoryStats;
}

export function SourceBreakdown({ stats }: Props) {
  const { topRecommenders } = stats;

  if (topRecommenders.length === 0) return null;

  const maxCount = topRecommenders[0].count;

  return (
    <div className="mb-3">
      <div className="bg-neutral-50 dark:bg-neutral-900/60 rounded-2xl overflow-hidden">
        <div className="px-5 pt-5 pb-1">
          <p className="text-muted-foreground/60 font-semibold uppercase" style={{ fontSize: '10px', letterSpacing: '0.14em' }}>
            Who Inspires You
          </p>
        </div>

        <div className="px-5 pb-5 pt-4 space-y-5">
          {topRecommenders.map((rec, i) => {
            const barWidth = (rec.count / maxCount) * 100;
            return (
              <motion.div
                key={`${rec.type}:${rec.name}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <div className="flex items-baseline justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base flex-shrink-0">{getSourceIcon(rec.type)}</span>
                    <span className="text-sm font-semibold text-foreground truncate">{rec.name}</span>
                    <span className="text-muted-foreground/50 flex-shrink-0" style={{ fontSize: '11px' }}>
                      {formatSourceType(rec.type)}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 flex-shrink-0 ml-3">
                    <span className="text-sm font-bold text-foreground">{rec.count}</span>
                    {rec.visitedCount > 0 && (
                      <span className="text-muted-foreground/50" style={{ fontSize: '10px' }}>
                        · {rec.visitedCount} visited
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-neutral-200 dark:bg-white/[0.07] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{ duration: 0.65, delay: i * 0.08, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #667eea, #764ba2)' }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
