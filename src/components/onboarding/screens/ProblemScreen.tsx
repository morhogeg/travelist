import React from 'react';
import { motion } from 'framer-motion';
import { Camera, MessageCircle, Bookmark } from 'lucide-react';
import { OnboardingButton } from '../components/OnboardingButton';
import { OnboardingScreenProps } from '../types';

const chaosCards = [
  { icon: Camera, label: 'Screenshot', color: 'text-pink-400', rotate: -10, x: -24, y: -8 },
  { icon: MessageCircle, label: 'DM from friend', color: 'text-blue-400', rotate: 6, x: 20, y: 4 },
  { icon: Bookmark, label: 'Saved post', color: 'text-amber-400', rotate: -2, x: -6, y: 20 },
];

export const ProblemScreen: React.FC<OnboardingScreenProps> = ({ onNext, onSkip }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col h-full px-6 pt-14 pb-10 relative overflow-hidden"
    >
      {/* Subtle background glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(102,126,234,0.08) 0%, transparent 70%)' }}
      />

      {/* Skip */}
      <motion.div
        className="flex justify-end relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <button onClick={onSkip} className="text-muted-foreground text-sm font-medium py-2 px-3">
          Skip
        </button>
      </motion.div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10">

        {/* Chaos pile visual */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.15 }}
          className="relative w-[220px] h-[140px] mb-10"
        >
          {chaosCards.map((card, i) => (
            <motion.div
              key={card.label}
              className="absolute inset-0 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm shadow-lg px-4 py-3 flex items-center gap-3"
              style={{ rotate: card.rotate, translateX: card.x, translateY: card.y }}
              initial={{ opacity: 0, scale: 0.85, rotate: card.rotate - 5 }}
              animate={{ opacity: 1, scale: 1, rotate: card.rotate }}
              transition={{ delay: 0.2 + i * 0.12, type: 'spring', stiffness: 140, damping: 16 }}
            >
              <div className="w-8 h-8 rounded-xl bg-muted/60 flex items-center justify-center shrink-0">
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <div className="text-left">
                <div className="h-2.5 w-20 bg-muted rounded-full mb-1.5" />
                <div className="h-2 w-14 bg-muted/50 rounded-full" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 14, delay: 0.42 }}
          className="text-[34px] font-bold text-foreground leading-tight mb-4"
        >
          Great places<br />keep getting lost.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.54, duration: 0.45 }}
          className="text-[17px] text-muted-foreground leading-relaxed max-w-[270px]"
        >
          Screenshots, DMs, saved posts — buried and forgotten before you ever visit.
        </motion.p>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 80, damping: 14, delay: 0.68 }}
        className="relative z-10"
      >
        <OnboardingButton onClick={onNext} variant="secondary">
          There's a better way →
        </OnboardingButton>
      </motion.div>
    </motion.div>
  );
};
