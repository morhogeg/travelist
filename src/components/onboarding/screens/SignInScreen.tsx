import React from 'react';
import { motion } from 'framer-motion';
import { Cloud, Sparkles } from 'lucide-react';
import { OnboardingButton } from '../components/OnboardingButton';
import { OnboardingScreenProps } from '../types';

// Floating sparkle
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

export const SignInScreen: React.FC<OnboardingScreenProps> = ({ onNext, onBack }) => {
  const handleSkip = () => {
    onNext();
  };

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
        {/* Cloud icon with sync animation */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 150, damping: 12, delay: 0.1 }}
          className="mb-12 relative"
        >
          {/* Orbiting dots */}
          <motion.div
            className="absolute inset-[-25px]"
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          >
            <motion.div
              className="absolute w-2 h-2 rounded-full bg-[#667eea]"
              style={{ top: 0, left: '50%', marginLeft: -4 }}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute w-2 h-2 rounded-full bg-[#764ba2]"
              style={{ bottom: 0, left: '50%', marginLeft: -4 }}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, delay: 0.5, repeat: Infinity }}
            />
          </motion.div>

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
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Cloud className="w-12 h-12 text-[#667eea]" />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 12, delay: 0.25 }}
          className="text-[34px] font-bold text-foreground leading-tight mb-4"
        >
          Sync across<br />all devices.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-[17px] text-muted-foreground leading-relaxed"
        >
          Keep your places backed up.<br />
          Works offline, always.
        </motion.p>

        {/* Coming soon badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          className="mt-8"
        >
          <motion.span
            className="px-4 py-2 rounded-full text-xs font-semibold text-[#667eea] uppercase tracking-wider inline-flex items-center gap-2"
            style={{ background: 'rgba(102, 126, 234, 0.1)' }}
            animate={{
              boxShadow: [
                '0 0 0 rgba(102, 126, 234, 0)',
                '0 0 20px rgba(102, 126, 234, 0.2)',
                '0 0 0 rgba(102, 126, 234, 0)',
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            <motion.div animate={{ rotate: [0, 20, -20, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <Sparkles className="w-3 h-3" />
            </motion.div>
            Cloud sync coming soon
          </motion.span>
        </motion.div>
      </div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 80, damping: 12 }}
        className="space-y-3 relative z-10"
      >
        {/* Skip */}
        <OnboardingButton onClick={handleSkip} variant="ghost">
          Continue without account
        </OnboardingButton>

        {/* Back */}
        <OnboardingButton onClick={onBack} variant="ghost">
          Back
        </OnboardingButton>
      </motion.div>
    </motion.div>
  );
};
