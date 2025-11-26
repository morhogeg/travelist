import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Compass, MapPin } from 'lucide-react';
import { TravelStoryStats, getSourceIcon } from '@/utils/story/stats-calculator';

interface Props {
  stats: TravelStoryStats;
}

// Circular progress ring
function ProgressRing({ progress, size = 72 }: { progress: number; size?: number }) {
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="white"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white text-sm font-bold">{progress}%</span>
      </div>
    </div>
  );
}

export function StatsHeroCard({ stats }: Props) {
  const { yearStats, countries, totalPlaces, visitedCount, countriesCount, citiesCount, completionRate } = stats;

  // Get top 4 country flags
  const topCountries = countries.slice(0, 4);
  const currentYear = yearStats?.year || new Date().getFullYear();

  return (
    <div className="mb-6">
      {/* Main unified card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl w-full"
        style={{
          background: 'linear-gradient(165deg, #667eea 0%, #764ba2 50%, #1a1a2e 100%)',
        }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -right-16 -top-16 w-48 h-48 rounded-full opacity-15"
          style={{ background: 'rgba(255,255,255,0.3)' }}
        />
        <div
          className="absolute -left-12 bottom-24 w-40 h-40 rounded-full opacity-10"
          style={{ background: 'rgba(255,255,255,0.3)' }}
        />

        <div className="relative p-5">
          {/* Header with year badge and progress ring */}
          <div className="flex items-center justify-between mb-4">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span className="text-white/90 text-xs font-medium">{currentYear} Journey</span>
              </div>
              <h2 className="text-white text-xl font-bold">Your Travel Story</h2>
            </motion.div>
            <ProgressRing progress={completionRate} />
          </div>

          {/* Country flags row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2 mb-4"
          >
            {topCountries.map((country, i) => (
              <motion.div
                key={country.country}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + i * 0.05, type: 'spring', bounce: 0.5 }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10"
              >
                <span className="text-lg">{country.flag}</span>
                <span className="text-white/80 text-xs font-medium">{country.count}</span>
              </motion.div>
            ))}
            {countriesCount > 4 && (
              <span className="text-white/50 text-xs">+{countriesCount - 4}</span>
            )}
          </motion.div>

          {/* Stats row - 4 compact stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-4 gap-2 mb-4"
          >
            <div className="text-center p-2.5 rounded-xl bg-white/10">
              <p className="text-xl font-bold text-white">{totalPlaces}</p>
              <p className="text-white/60 text-[10px]">Places</p>
            </div>
            <div className="text-center p-2.5 rounded-xl bg-white/10">
              <p className="text-xl font-bold text-white">{visitedCount}</p>
              <p className="text-white/60 text-[10px]">Visited</p>
            </div>
            <div className="text-center p-2.5 rounded-xl bg-white/10">
              <p className="text-xl font-bold text-white">{countriesCount}</p>
              <p className="text-white/60 text-[10px]">Countries</p>
            </div>
            <div className="text-center p-2.5 rounded-xl bg-white/10">
              <p className="text-xl font-bold text-white">{citiesCount}</p>
              <p className="text-white/60 text-[10px]">Cities</p>
            </div>
          </motion.div>

          {/* Year highlights - unique insights */}
          {yearStats && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-1.5"
            >
              {yearStats.mostActiveMonth && (
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/10">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-white/60" />
                    <span className="text-white/70 text-xs">Peak month</span>
                  </div>
                  <span className="text-white font-medium text-xs">{yearStats.mostActiveMonth}</span>
                </div>
              )}

              {yearStats.topSource && (
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{getSourceIcon(yearStats.topSource.type)}</span>
                    <span className="text-white/70 text-xs">Top recommender</span>
                  </div>
                  <span className="text-white font-medium text-xs truncate max-w-[80px]">
                    {yearStats.topSource.name}
                  </span>
                </div>
              )}
            </motion.div>
          )}

          {/* Watermark */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-2 text-white/30 mt-4"
          >
            <span className="text-[10px] font-medium tracking-wider">TRAVELIST</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span className="text-[9px]">{currentYear}</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Hint text */}
      <p className="text-center text-xs text-muted-foreground mt-2">
        Screenshot to share your journey
      </p>
    </div>
  );
}
