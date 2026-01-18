import React from 'react';
import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';
import { OnboardingButton } from '../components/OnboardingButton';
import { OnboardingScreenProps } from '../types';

// Floating particle component
const Particle = ({ delay, duration, x, y, size }: { delay: number; duration: number; x: string; y: string; size: number }) => (
  <motion.div
    className="absolute rounded-full"
    style={{
      width: size,
      height: size,
      left: x,
      top: y,
      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.4) 0%, rgba(118, 75, 162, 0.4) 100%)',
    }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 0.8, 0.4, 0.8, 0],
      scale: [0.5, 1.2, 1, 1.1, 0.5],
      y: [0, -30, -10, -25, 0],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

export const WelcomeScreen: React.FC<OnboardingScreenProps> = ({ onNext, onSkip }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col h-full px-8 pt-16 pb-10 relative overflow-hidden"
    >
      {/* Floating particles background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <Particle delay={0} duration={6} x="15%" y="20%" size={8} />
        <Particle delay={1} duration={7} x="80%" y="15%" size={6} />
        <Particle delay={2} duration={5} x="25%" y="70%" size={10} />
        <Particle delay={0.5} duration={8} x="75%" y="60%" size={7} />
        <Particle delay={3} duration={6} x="10%" y="45%" size={5} />
        <Particle delay={1.5} duration={7} x="85%" y="40%" size={8} />
        <Particle delay={2.5} duration={5} x="50%" y="80%" size={6} />
      </div>

      {/* Ambient glow */}
      <motion.div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(102, 126, 234, 0.15) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Skip */}
      <motion.div
        className="flex justify-end relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
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
        {/* App icon with glow */}
        <motion.div
          initial={{ scale: 0, rotate: -180, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{
            type: 'spring',
            stiffness: 150,
            damping: 12,
            delay: 0.2
          }}
          className="mb-12 relative"
        >
          {/* Pulsing glow ring */}
          <motion.div
            className="absolute inset-0 rounded-[28px]"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              filter: 'blur(25px)',
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            className="w-28 h-28 rounded-[28px] flex items-center justify-center relative"
            style={{
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
              boxShadow: '0 20px 50px rgba(102, 126, 234, 0.25), inset 0 1px 0 rgba(255,255,255,0.3)',
            }}
            whileHover={{ scale: 1.05 }}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 rounded-[28px] overflow-hidden"
            >
              <motion.div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)',
                }}
                animate={{ x: ['-150%', '150%'] }}
                transition={{ duration: 2, delay: 0.5, repeat: Infinity, repeatDelay: 3 }}
              />
            </motion.div>

            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Compass className="w-14 h-14 text-[#667eea]" />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Title with dramatic entrance */}
        <motion.h1
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 12,
            delay: 0.4
          }}
          className="text-[34px] font-bold text-foreground leading-tight mb-4"
        >
          Your Personal<br />Travel Memory.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="text-[17px] text-muted-foreground leading-relaxed"
        >
          Travelist is the smartest way to<br />
          <span className="text-foreground font-medium">Save</span>, <span className="text-foreground font-medium">Organize</span>, and <span className="text-foreground font-medium">Navigate</span><br />
          every place you discover.
        </motion.p>
      </div>

      {/* CTA with glow */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: 'spring',
          stiffness: 80,
          damping: 12,
          delay: 0.7
        }}
        className="relative z-10"
      >
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            filter: 'blur(20px)',
            opacity: 0.4,
          }}
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <OnboardingButton onClick={onNext}>
          Get Started
        </OnboardingButton>
      </motion.div>
    </motion.div>
  );
};
