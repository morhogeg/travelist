import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useStoryStats } from '@/hooks/useStoryStats';
import {
  StatsHeroCard,
  SourceBreakdown,
  DiscoveryTimeline,
  CategoryChart,
} from '@/components/story';

const TravelStory = () => {
  const navigate = useNavigate();
  const { stats, isLoading } = useStoryStats();

  // Empty state
  if (!isLoading && (!stats || stats.totalPlaces === 0)) {
    return (
      <Layout>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-4 pt-3 pb-24"
        >
          <div className="text-center mb-6">
            <h1 className="text-[28px] font-semibold tracking-[-0.01em] bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              My Travel Story
            </h1>
          </div>

          <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-6"
            >
              <span className="text-5xl">✨</span>
            </motion.div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Your journey awaits
            </h2>
            <p className="text-muted-foreground mb-6">
              Start adding places to see your travel story unfold. Your discoveries,
              recommendations, and adventures will appear here.
            </p>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-full text-white font-medium"
              style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
            >
              Add your first place
            </motion.button>
          </div>
        </motion.div>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="px-4 pt-3 pb-24"
      >
        {/* Loading state */}
        {isLoading && (
          <div className="space-y-3">
            <div className="h-56 rounded-3xl bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
            <div className="h-40 rounded-2xl bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
            <div className="h-56 rounded-2xl bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
          </div>
        )}

        {/* Main content */}
        {!isLoading && stats && (
          <>
            <StatsHeroCard stats={stats} />
            <SourceBreakdown stats={stats} />
            <CategoryChart stats={stats} />
            <DiscoveryTimeline stats={stats} />

            <div className="text-center pt-2 pb-2">
              <p className="text-muted-foreground/40" style={{ fontSize: '11px' }}>
                Updates as you add places
              </p>
            </div>
          </>
        )}
      </motion.div>
    </Layout>
  );
};

export default TravelStory;
