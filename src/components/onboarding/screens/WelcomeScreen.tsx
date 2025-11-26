import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Compass, Heart } from 'lucide-react';
import { OnboardingButton } from '../components/OnboardingButton';
import { OnboardingScreenProps } from '../types';

export const WelcomeScreen: React.FC<OnboardingScreenProps> = ({ onNext, onSkip }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full px-6 pt-12 pb-8"
    >
      {/* Skip link at top */}
      <div className="flex justify-end">
        <button
          onClick={onSkip}
          className="text-muted-foreground text-sm font-medium py-2 px-4"
        >
          Skip
        </button>
      </div>

      {/* Main content - positioned higher */}
      <div className="flex-1 flex flex-col items-center justify-start pt-12 text-center">
        {/* Animated icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 20,
            delay: 0.2,
          }}
          className="w-24 h-24 rounded-3xl flex items-center justify-center mb-8"
          style={{ backgroundColor: 'rgba(102, 126, 234, 0.1)' }}
        >
          <Compass className="w-12 h-12" style={{ color: '#667eea' }} />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-large-title font-bold text-foreground mb-4"
        >
          Your Personal Travel Guide
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-body text-muted-foreground max-w-sm"
        >
          Save recommendations, plan routes, and never forget a great place again
        </motion.p>

        {/* Feature highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-6 mt-10"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
              <MapPin className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="text-caption text-muted-foreground">Save Places</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
              <Heart className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="text-caption text-muted-foreground">Organize</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
              <Compass className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="text-caption text-muted-foreground">Explore</span>
          </div>
        </motion.div>
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-3"
      >
        <OnboardingButton onClick={onNext}>
          Get Started
        </OnboardingButton>
      </motion.div>
    </motion.div>
  );
};
