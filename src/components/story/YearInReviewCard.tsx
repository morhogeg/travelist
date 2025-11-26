import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, Star, Users } from 'lucide-react';
import { TravelStoryStats, getSourceIcon, getCountryFlag } from '@/utils/story/stats-calculator';

interface Props {
  stats: TravelStoryStats;
}

export function YearInReviewCard({ stats }: Props) {
  const { yearStats, countries, topCategory, completionRate, visitedCount, totalPlaces } = stats;

  // If no year stats or no data, don't render
  if (!yearStats || yearStats.totalAdded === 0) {
    return null;
  }

  // Get top 4 country flags for this year
  const topCountries = countries.slice(0, 4);

  return (
    <div className="mb-6">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">✨</span>
        <h3 className="text-lg font-semibold text-foreground">Year in Review</h3>
      </div>

      {/* Main card - Screenshot worthy! */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-3xl"
        style={{
          background: 'linear-gradient(165deg, #667eea 0%, #764ba2 50%, #1a1a2e 100%)',
          aspectRatio: '9/16',
          maxHeight: '500px',
        }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -right-20 -top-20 w-64 h-64 rounded-full opacity-15"
          style={{ background: 'rgba(255,255,255,0.3)' }}
        />
        <div
          className="absolute -left-16 top-1/3 w-48 h-48 rounded-full opacity-10"
          style={{ background: 'rgba(255,255,255,0.3)' }}
        />
        <div
          className="absolute right-8 bottom-32 w-32 h-32 rounded-full opacity-10"
          style={{ background: 'rgba(255,255,255,0.3)' }}
        />

        <div className="relative h-full flex flex-col p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 mb-3"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-white/90 text-sm font-medium">My {yearStats.year}</span>
            </motion.div>

            <h2 className="text-white text-2xl font-bold mb-1">Travel Story</h2>
            <p className="text-white/60 text-sm">A year of discovery</p>
          </div>

          {/* Country flags */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center gap-2 mb-6"
          >
            {topCountries.map((country, i) => (
              <motion.div
                key={country.country}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex flex-col items-center"
              >
                <span className="text-4xl mb-1">{country.flag}</span>
                <span className="text-white/50 text-[10px]">{country.count}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats grid */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Places discovered */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm"
              >
                <Calendar className="w-5 h-5 text-white/60 mb-2" />
                <p className="text-3xl font-bold text-white">{yearStats.totalAdded}</p>
                <p className="text-white/60 text-xs">Places discovered</p>
              </motion.div>

              {/* Completion */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
                className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm"
              >
                <Star className="w-5 h-5 text-white/60 mb-2" />
                <p className="text-3xl font-bold text-white">{completionRate}%</p>
                <p className="text-white/60 text-xs">Visited</p>
              </motion.div>
            </div>

            {/* Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              {/* Most active month */}
              {yearStats.mostActiveMonth && (
                <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/10">
                  <span className="text-white/70 text-sm">Most active month</span>
                  <span className="text-white font-medium text-sm">{yearStats.mostActiveMonth}</span>
                </div>
              )}

              {/* Top category */}
              {yearStats.topCategory && (
                <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/10">
                  <span className="text-white/70 text-sm">Favorite type</span>
                  <span className="text-white font-medium text-sm">{yearStats.topCategory}</span>
                </div>
              )}

              {/* Top recommender */}
              {yearStats.topSource && (
                <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/10">
                  <span className="text-white/70 text-sm">Top recommender</span>
                  <div className="flex items-center gap-1.5">
                    <span>{getSourceIcon(yearStats.topSource.type)}</span>
                    <span className="text-white font-medium text-sm truncate max-w-[100px]">
                      {yearStats.topSource.name}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Watermark */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-4"
          >
            <div className="flex items-center justify-center gap-2 text-white/40">
              <span className="text-xs font-medium tracking-wider">TRAVELIST</span>
              <span className="w-1 h-1 rounded-full bg-white/40" />
              <span className="text-[10px]">My Travel Story</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Hint text */}
      <p className="text-center text-xs text-muted-foreground mt-3">
        Screenshot to share your travel journey
      </p>
    </div>
  );
}
