import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Sparkles } from 'lucide-react';
import { OnboardingButton } from '../components/OnboardingButton';
import { OnboardingScreenProps } from '../types';

const FloatingSparkle = ({ delay, x, y }: { delay: number; x: string; y: string }) => (
  <motion.div
    className="absolute pointer-events-none"
    style={{ left: x, top: y }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 1, 0],
      scale: [0.5, 1, 0.5],
      rotate: [0, 180, 360],
    }}
    transition={{
      duration: 3,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  >
    <Sparkles className="w-4 h-4 text-[#667eea]" />
  </motion.div>
);

export const SignInScreen: React.FC<OnboardingScreenProps> = ({ onNext }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ type: 'spring', stiffness: 80, damping: 18 }}
      className="flex flex-col h-full px-8 pt-16 pb-10 relative overflow-hidden"
    >
      {/* Floating sparkles */}
      <FloatingSparkle delay={0} x="15%" y="20%" />
      <FloatingSparkle delay={1} x="80%" y="25%" />
      <FloatingSparkle delay={0.5} x="25%" y="60%" />
      <FloatingSparkle delay={1.5} x="75%" y="55%" />
      <FloatingSparkle delay={2} x="50%" y="75%" />

      {/* Ambient glow */}
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(102, 126, 234, 0.12) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      {/* Spacer */}
      <div className="h-10" />

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10">
        {/* Checkmark icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 150, damping: 12, delay: 0.1 }}
          className="mb-12 relative"
        >
          {/* Glow */}
          <motion.div
            className="absolute inset-0 rounded-3xl"
            style={{
              background: 'rgba(102, 126, 234, 0.3)',
              filter: 'blur(25px)',
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          <motion.div
            className="w-24 h-24 rounded-3xl flex items-center justify-center relative"
            style={{ background: 'rgba(102, 126, 234, 0.12)' }}
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <CheckCircle className="w-12 h-12 text-[#667eea]" strokeWidth={1.5} />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 12, delay: 0.25 }}
          className="text-[34px] font-bold text-foreground leading-tight mb-4"
        >
          You're all set.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-[17px] text-muted-foreground leading-relaxed max-w-[280px]"
        >
          Start saving places you discover — restaurants, hidden gems, tips from friends.{' '}
          <span className="font-medium text-foreground">Just tap + and tell us what you heard.</span>
        </motion.p>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 80, damping: 12 }}
        className="relative z-10"
      >
        <OnboardingButton onClick={onNext} variant="primary">
          Start Exploring
        </OnboardingButton>
      </motion.div>
    </motion.div>
  );
};
