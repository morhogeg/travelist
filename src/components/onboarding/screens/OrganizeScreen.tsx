import React from 'react';
import { motion } from 'framer-motion';
import { Folder, Route, CheckCircle2, Calendar } from 'lucide-react';
import { OnboardingButton } from '../components/OnboardingButton';
import { OnboardingScreenProps } from '../types';

export const OrganizeScreen: React.FC<OnboardingScreenProps> = ({ onNext, onBack, onSkip }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex flex-col h-full px-6 pt-16 pb-8"
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

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="text-title-1 font-bold text-foreground mb-2">
            Stay Organized
          </h1>
          <p className="text-body text-muted-foreground">
            Group places into collections or plan trip itineraries
          </p>
        </motion.div>

        {/* Feature cards - side by side */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-4 mb-8"
        >
          {/* Collections card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-muted/50 rounded-2xl p-4 flex flex-col items-center text-center"
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: 'rgba(102, 126, 234, 0.1)' }}>
              <Folder className="w-7 h-7" style={{ color: '#667eea' }} />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Collections</h3>
            <p className="text-xs text-muted-foreground">
              Group places by theme, trip, or however you like
            </p>
          </motion.div>

          {/* Routes card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-muted/50 rounded-2xl p-4 flex flex-col items-center text-center"
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: 'rgba(102, 126, 234, 0.1)' }}>
              <Route className="w-7 h-7" style={{ color: '#667eea' }} />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Routes</h3>
            <p className="text-xs text-muted-foreground">
              Plan day-by-day itineraries with progress tracking
            </p>
          </motion.div>
        </motion.div>

        {/* Feature highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4 flex-1"
        >
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Track visited places</h3>
              <p className="text-sm text-muted-foreground">
                Mark places as visited and see your progress
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(102, 126, 234, 0.1)' }}>
              <Calendar className="w-5 h-5" style={{ color: '#667eea' }} />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Plan your days</h3>
              <p className="text-sm text-muted-foreground">
                Organize places into specific days for your trip
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-3"
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
