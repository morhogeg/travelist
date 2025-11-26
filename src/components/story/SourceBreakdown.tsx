import React from 'react';
import { motion } from 'framer-motion';
import { TravelStoryStats, getSourceIcon, formatSourceType } from '@/utils/story/stats-calculator';

interface Props {
  stats: TravelStoryStats;
}

export function SourceBreakdown({ stats }: Props) {
  const { topRecommenders, sourceTypeDistribution } = stats;

  if (topRecommenders.length === 0 && sourceTypeDistribution.length === 0) {
    return null;
  }

  const totalFromSources = sourceTypeDistribution.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="mb-6">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">👥</span>
        <h3 className="text-lg font-semibold text-foreground">Your Taste Network</h3>
      </div>

      {/* Source type distribution bar */}
      {sourceTypeDistribution.length > 0 && totalFromSources > 0 && (
        <div className="mb-5">
          <div className="flex h-3 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-800">
            {sourceTypeDistribution.map((source, i) => {
              const percentage = (source.count / totalFromSources) * 100;
              const colors = [
                '#667eea', // purple
                '#EC4899', // pink
                '#F97316', // orange
                '#10B981', // green
                '#3B82F6', // blue
                '#8B5CF6', // violet
                '#F59E0B', // amber
                '#EF4444', // red
              ];
              return (
                <motion.div
                  key={source.type}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  style={{ backgroundColor: colors[i % colors.length] }}
                  className="h-full"
                />
              );
            })}
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-3">
            {sourceTypeDistribution.slice(0, 5).map((source, i) => {
              const colors = ['#667eea', '#EC4899', '#F97316', '#10B981', '#3B82F6'];
              return (
                <div key={source.type} className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: colors[i % colors.length] }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {getSourceIcon(source.type)} {formatSourceType(source.type)} ({source.count})
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top recommenders */}
      {topRecommenders.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground mb-3">Top Recommenders</p>
          {topRecommenders.map((rec, i) => (
            <motion.div
              key={`${rec.type}:${rec.name}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-xl liquid-glass-clear"
            >
              {/* Rank badge */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{
                  background: i === 0
                    ? 'linear-gradient(135deg, #667eea, #764ba2)'
                    : i === 1
                    ? 'linear-gradient(135deg, #6B7280, #9CA3AF)'
                    : 'linear-gradient(135deg, #9CA3AF, #D1D5DB)',
                }}
              >
                {i + 1}
              </div>

              {/* Source icon */}
              <span className="text-lg">{getSourceIcon(rec.type)}</span>

              {/* Name and type */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">{rec.name}</p>
                <p className="text-xs text-muted-foreground">{formatSourceType(rec.type)}</p>
              </div>

              {/* Count */}
              <div className="text-right">
                <p className="font-semibold text-sm" style={{ color: '#667eea' }}>
                  {rec.count}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {rec.visitedCount} visited
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
