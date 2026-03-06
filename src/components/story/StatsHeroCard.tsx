import React from 'react';
import { motion } from 'framer-motion';
import { TravelStoryStats } from '@/utils/story/stats-calculator';

interface Props {
  stats: TravelStoryStats;
}

function ProgressRing({ progress, size = 60 }: { progress: number; size?: number }) {
  const strokeWidth = 3.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.85)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.3, ease: 'easeOut', delay: 0.4 }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-white font-bold leading-none" style={{ fontSize: '13px' }}>{progress}%</span>
        <span className="text-white/40 leading-none mt-0.5" style={{ fontSize: '8px' }}>visited</span>
      </div>
    </div>
  );
}

export function StatsHeroCard({ stats }: Props) {
  const { yearStats, countries, totalPlaces, visitedCount, countriesCount, citiesCount, completionRate } = stats;

  const topCountries = countries.slice(0, 6);
  const currentYear = yearStats?.year || new Date().getFullYear();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl mb-3"
      style={{ background: 'linear-gradient(155deg, #4f46e5 0%, #7c3aed 55%, #1e1b4b 100%)' }}
    >
      {/* Radial glow — top left */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 65% 55% at 10% 15%, rgba(167,139,250,0.35) 0%, transparent 70%)',
        }}
      />

      <div className="relative p-6">
        {/* Label row */}
        <div className="flex items-start justify-between mb-7">
          <div>
            <p className="text-white/40 font-semibold uppercase" style={{ fontSize: '10px', letterSpacing: '0.15em' }}>
              Your Travel Story
            </p>
            <p className="text-white/30 mt-0.5" style={{ fontSize: '11px' }}>{currentYear}</p>
          </div>
          <ProgressRing progress={completionRate} />
        </div>

        {/* Hero number */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p
            className="text-white font-bold leading-none mb-1"
            style={{ fontSize: '68px', letterSpacing: '-0.03em' }}
          >
            {totalPlaces}
          </p>
          <p className="text-white/40 font-medium" style={{ fontSize: '14px' }}>
            {totalPlaces === 1 ? 'place saved' : 'places saved'}
          </p>
        </motion.div>

        {/* Supporting stats */}
        <motion.div
          className="flex items-center gap-6 mb-7"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div>
            <p className="text-white font-semibold leading-none" style={{ fontSize: '22px' }}>{visitedCount}</p>
            <p className="text-white/40 mt-0.5" style={{ fontSize: '11px' }}>visited</p>
          </div>
          <div className="w-px h-7 bg-white/10" />
          <div>
            <p className="text-white font-semibold leading-none" style={{ fontSize: '22px' }}>{countriesCount}</p>
            <p className="text-white/40 mt-0.5" style={{ fontSize: '11px' }}>{countriesCount === 1 ? 'country' : 'countries'}</p>
          </div>
          <div className="w-px h-7 bg-white/10" />
          <div>
            <p className="text-white font-semibold leading-none" style={{ fontSize: '22px' }}>{citiesCount}</p>
            <p className="text-white/40 mt-0.5" style={{ fontSize: '11px' }}>{citiesCount === 1 ? 'city' : 'cities'}</p>
          </div>
        </motion.div>

        {/* Country flags */}
        {topCountries.length > 0 && (
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {topCountries.map((country, i) => (
              <motion.span
                key={country.country}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.05, type: 'spring', bounce: 0.4 }}
                className="text-[26px]"
                title={country.country}
              >
                {country.flag}
              </motion.span>
            ))}
            {countriesCount > 6 && (
              <span className="text-white/35 ml-1" style={{ fontSize: '12px' }}>+{countriesCount - 6}</span>
            )}
          </motion.div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="relative flex items-center justify-between px-6 py-3 border-t border-white/[0.07]">
        <span className="text-white/20 font-semibold uppercase" style={{ fontSize: '9px', letterSpacing: '0.2em' }}>
          Travelist
        </span>
        {yearStats?.mostActiveMonth && (
          <span className="text-white/25" style={{ fontSize: '9px' }}>
            Peak month · {yearStats.mostActiveMonth}
          </span>
        )}
      </div>
    </motion.div>
  );
}
