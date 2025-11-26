import React from 'react';
import { motion } from 'framer-motion';
import { TravelStoryStats } from '@/utils/story/stats-calculator';

interface Props {
  stats: TravelStoryStats;
}

// Animated counter component
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', bounce: 0.5, duration: 0.6 }}
    >
      {value}{suffix}
    </motion.span>
  );
}

// Circular progress ring
function ProgressRing({ progress, size = 80 }: { progress: number; size?: number }) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
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
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white text-lg font-bold">{progress}%</span>
      </div>
    </div>
  );
}

export function StatsHeroSection({ stats }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl mb-6"
      style={{
        background: 'linear-gradient(165deg, #667eea 0%, #764ba2 50%, #1a1a2e 100%)',
      }}
    >
      {/* Decorative elements */}
      <div
        className="absolute -right-16 -top-16 w-48 h-48 rounded-full opacity-20"
        style={{ background: 'rgba(255,255,255,0.2)' }}
      />
      <div
        className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full opacity-10"
        style={{ background: 'rgba(255,255,255,0.2)' }}
      />

      <div className="relative p-6">
        {/* Title */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-white text-xl font-bold mb-1">Your Journey</h2>
            <p className="text-white/60 text-sm">Travel statistics at a glance</p>
          </div>
          <ProgressRing progress={stats.completionRate} />
        </div>

        {/* Country flags row */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {stats.countries.slice(0, 8).map((country, i) => (
            <motion.div
              key={country.country}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, type: 'spring', bounce: 0.5 }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10"
            >
              <span className="text-lg">{country.flag}</span>
              <span className="text-white/80 text-xs font-medium">{country.count}</span>
            </motion.div>
          ))}
          {stats.countriesCount > 8 && (
            <span className="text-white/50 text-xs">+{stats.countriesCount - 8} more</span>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center p-3 rounded-xl bg-white/10"
          >
            <p className="text-2xl font-bold text-white">
              <AnimatedCounter value={stats.totalPlaces} />
            </p>
            <p className="text-white/60 text-[10px] mt-0.5">Places</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-center p-3 rounded-xl bg-white/10"
          >
            <p className="text-2xl font-bold text-white">
              <AnimatedCounter value={stats.visitedCount} />
            </p>
            <p className="text-white/60 text-[10px] mt-0.5">Visited</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center p-3 rounded-xl bg-white/10"
          >
            <p className="text-2xl font-bold text-white">
              <AnimatedCounter value={stats.countriesCount} />
            </p>
            <p className="text-white/60 text-[10px] mt-0.5">Countries</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-center p-3 rounded-xl bg-white/10"
          >
            <p className="text-2xl font-bold text-white">
              <AnimatedCounter value={stats.citiesCount} />
            </p>
            <p className="text-white/60 text-[10px] mt-0.5">Cities</p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
