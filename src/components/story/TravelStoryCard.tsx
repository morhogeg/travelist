import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStoryStats } from '@/hooks/useStoryStats';
import { getCountryFlag } from '@/utils/story/stats-calculator';

export function TravelStoryCard() {
  const navigate = useNavigate();
  const { stats, isLoading } = useStoryStats();

  if (isLoading || !stats) {
    return (
      <div className="mx-3 mb-4 h-32 rounded-2xl bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
    );
  }

  // Don't show card if no places saved yet
  if (stats.totalPlaces === 0) {
    return null;
  }

  // Get top 3 country flags
  const topFlags = stats.countries.slice(0, 3).map(c => c.flag);

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate('/story')}
      className="w-full mx-3 mb-4 relative overflow-hidden rounded-2xl text-left"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      {/* Glass overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
        }}
      />

      {/* Decorative circles */}
      <div
        className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-20"
        style={{ background: 'rgba(255,255,255,0.3)' }}
      />
      <div
        className="absolute -right-4 -bottom-12 w-24 h-24 rounded-full opacity-10"
        style={{ background: 'rgba(255,255,255,0.3)' }}
      />

      <div className="relative p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-[15px]">Your Travel Story</h3>
              <p className="text-white/70 text-xs">Discover your journey</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/60" />
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4">
          {/* Country flags */}
          <div className="flex items-center -space-x-1">
            {topFlags.map((flag, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1, type: 'spring', bounce: 0.5 }}
                className="text-xl"
              >
                {flag}
              </motion.span>
            ))}
            {stats.countriesCount > 3 && (
              <span className="ml-2 text-xs text-white/70">
                +{stats.countriesCount - 3} more
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-white/20" />

          {/* Quick stats */}
          <div className="flex gap-4 text-white">
            <div className="text-center">
              <motion.p
                className="text-xl font-bold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {stats.totalPlaces}
              </motion.p>
              <p className="text-[10px] text-white/70">Places</p>
            </div>
            <div className="text-center">
              <motion.p
                className="text-xl font-bold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {stats.completionRate}%
              </motion.p>
              <p className="text-[10px] text-white/70">Visited</p>
            </div>
            {stats.topRecommenders[0] && (
              <div className="text-center">
                <motion.p
                  className="text-xl font-bold truncate max-w-[60px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  title={stats.topRecommenders[0].name}
                >
                  {stats.topRecommenders[0].count}
                </motion.p>
                <p className="text-[10px] text-white/70 truncate max-w-[60px]" title={stats.topRecommenders[0].name}>
                  from {stats.topRecommenders[0].name.split(' ')[0]}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  );
}
