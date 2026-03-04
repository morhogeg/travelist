import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, MapPin, Lightbulb, Users } from 'lucide-react';
import { OnboardingButton } from '../components/OnboardingButton';
import { OnboardingScreenProps } from '../types';

export const AIMagicScreen: React.FC<OnboardingScreenProps> = ({ onNext, onBack, onSkip }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 80 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ type: 'spring', stiffness: 80, damping: 18 }}
      className="flex flex-col h-full px-6 pt-4 pb-2 relative overflow-hidden"
    >
      {/* Ambient glow */}
      <motion.div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(102,126,234,0.12) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 4.5, repeat: Infinity }}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10">

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 100, damping: 14 }}
          className="text-[34px] font-bold text-foreground leading-tight mb-3 text-center"
        >
          Just tell us<br />what you heard.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-[16px] text-muted-foreground text-center mb-8 max-w-[260px]"
        >
          No forms. Type naturally — Travelist AI extracts the place, tip, and source.
        </motion.p>

        {/* Input → Card demo */}
        <div className="w-full max-w-[300px] space-y-3">

          {/* Input box mockup */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, type: 'spring', stiffness: 120 }}
            className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur-sm px-4 py-3"
          >
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">What did you hear?</p>
            <p className="text-sm text-foreground/90 leading-relaxed italic">
              "Sarah said the pizza at <span className="text-[#667eea] font-medium not-italic">Luigi's in Paris</span> is a must-try!"
            </p>
          </motion.div>

          {/* Animated arrow + sparkles */}
          <motion.div
            className="flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.52 }}
          >
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              className="flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-[#667eea]" />
              <span className="text-xs font-semibold text-[#667eea]">AI organizing…</span>
              <Sparkles className="w-4 h-4 text-[#667eea]" />
            </motion.div>
          </motion.div>

          {/* Result card */}
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.72, type: 'spring', stiffness: 120, damping: 16 }}
            className="rounded-2xl border-l-4 bg-card/80 backdrop-blur-sm shadow-lg overflow-hidden relative"
            style={{ borderLeftColor: '#667eea' }}
          >
            {/* Shimmer */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(102,126,234,0.06), transparent)' }}
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
            />

            <div className="px-4 py-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🍕</span>
                  <div>
                    <p className="text-sm font-bold text-foreground">Luigi's Pizza</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>Paris, France</span>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#667eea]/10 text-[#667eea]">Food</span>
              </div>
              <div className="flex items-start gap-2 mt-2 pt-2 border-t border-border/40">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-600 dark:text-amber-400 italic font-medium">"Must-try pizza"</p>
                <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="w-3 h-3" />
                  <span>Sarah</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

    </motion.div>
  );
};
