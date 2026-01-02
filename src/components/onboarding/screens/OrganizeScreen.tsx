import React from 'react';
import { motion } from 'framer-motion';
import { Folder, Route } from 'lucide-react';
import { OnboardingButton } from '../components/OnboardingButton';
import { OnboardingScreenProps } from '../types';

export const OrganizeScreen: React.FC<OnboardingScreenProps> = ({ onNext, onBack, onSkip }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ type: 'spring', stiffness: 80, damping: 18 }}
      className="flex flex-col h-full px-8 pt-16 pb-10 relative overflow-hidden"
    >
      {/* Ambient gradient orbs */}
      <motion.div
        className="absolute top-20 -left-20 w-60 h-60 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(102, 126, 234, 0.12) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.2, 1], x: [0, 20, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-40 -right-20 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(118, 75, 162, 0.1) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.3, 1], y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      {/* Skip */}
      <motion.div
        className="flex justify-end relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <button
          onClick={onSkip}
          className="text-muted-foreground text-sm font-medium py-2 px-4"
        >
          Skip
        </button>
      </motion.div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10">
        {/* Animated icons - bounce in from sides */}
        <motion.div className="flex items-center gap-6 mb-12">
          {/* Collections icon */}
          <motion.div
            initial={{ opacity: 0, x: -80, rotate: -30 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 12, delay: 0.15 }}
            className="relative"
          >
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{ background: 'rgba(102, 126, 234, 0.3)', filter: 'blur(15px)' }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
            <motion.div
              className="w-20 h-20 rounded-2xl flex items-center justify-center relative"
              style={{ background: 'rgba(102, 126, 234, 0.15)' }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Folder className="w-10 h-10 text-[#667eea]" />
            </motion.div>
          </motion.div>

          {/* Connector line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="w-8 h-0.5 bg-gradient-to-r from-[#667eea] to-[#764ba2] rounded-full"
          />

          {/* Routes icon */}
          <motion.div
            initial={{ opacity: 0, x: 80, rotate: 30 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 12, delay: 0.25 }}
            className="relative"
          >
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{ background: 'rgba(118, 75, 162, 0.3)', filter: 'blur(15px)' }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
            />
            <motion.div
              className="w-20 h-20 rounded-2xl flex items-center justify-center relative"
              style={{ background: 'rgba(118, 75, 162, 0.15)' }}
              whileHover={{ scale: 1.1, rotate: -5 }}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            >
              <Route className="w-10 h-10 text-[#764ba2]" />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Title with staggered words */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4"
        >
          <motion.span
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, type: 'spring', stiffness: 100 }}
            className="text-[34px] font-bold text-[#667eea] block"
          >
            Collections.
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, type: 'spring', stiffness: 100 }}
            className="text-[34px] font-bold text-[#764ba2] block"
          >
            Routes.
          </motion.span>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="text-lg text-muted-foreground max-w-[300px] leading-relaxed"
        >
          Group places by theme. Build day-by-day itineraries. Your trips, beautifully organized.
        </motion.p>
      </div>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, type: 'spring', stiffness: 80, damping: 12 }}
        className="space-y-3 relative z-10"
      >
        <OnboardingButton onClick={onNext}>
          Continue
        </OnboardingButton>
        <OnboardingButton onClick={onBack} variant="ghost">
          Back
        </OnboardingButton>
      </motion.div>
    </motion.div>
  );
};
