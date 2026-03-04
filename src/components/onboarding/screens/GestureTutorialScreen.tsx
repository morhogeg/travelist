import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, FolderPlus, MapPin, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { OnboardingButton } from '../components/OnboardingButton';
import { OnboardingScreenProps } from '../types';
import { haptics } from '@/utils/ios/haptics';

export const GestureTutorialScreen: React.FC<OnboardingScreenProps> = ({ onNext, onBack, onSkip }) => {
  const [swipeState, setSwipeState] = useState<'none' | 'left' | 'right'>('none');
  const [exitDir, setExitDir] = useState<'left' | 'right'>('left');

  const handleSwipe = (dir: 'left' | 'right') => {
    haptics.medium();
    setExitDir(dir);
    setSwipeState(dir);
    setTimeout(() => setSwipeState('none'), 1600);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 80 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ type: 'spring', stiffness: 80, damping: 18 }}
      className="flex flex-col h-full px-6 pt-4 pb-2 relative overflow-hidden"
    >
      {/* Background glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(102,126,234,0.08) 0%, transparent 70%)' }}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10">

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 100, damping: 14 }}
          className="text-[34px] font-bold text-foreground leading-tight mb-3 text-center"
        >
          Quick actions,<br />no menus.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-[16px] text-muted-foreground text-center mb-8 max-w-[260px]"
        >
          Swipe cards to organize your places instantly. Try it below.
        </motion.p>

        {/* Swipe action labels */}
        <motion.div
          className="flex w-full max-w-[300px] justify-between mb-3 px-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <div className="flex items-center gap-1.5">
            <ChevronsLeft className="w-4 h-4 text-red-400" />
            <div className="text-left">
              <p className="text-xs font-bold text-red-400">Swipe left</p>
              <p className="text-[10px] text-muted-foreground">to delete</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="text-right">
              <p className="text-xs font-bold text-[#667eea]">Swipe right</p>
              <p className="text-[10px] text-muted-foreground">to collect</p>
            </div>
            <ChevronsRight className="w-4 h-4 text-[#667eea]" />
          </div>
        </motion.div>

        {/* Interactive card */}
        <motion.div
          className="w-full max-w-[300px] h-[100px] relative"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.42, type: 'spring', stiffness: 120 }}
        >
          <AnimatePresence mode="wait">
            {swipeState === 'none' ? (
              <motion.div
                key="card"
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ x: exitDir === 'left' ? -320 : 320, opacity: 0, transition: { duration: 0.25 } }}
                className="absolute inset-0 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm shadow-lg px-4 py-3 flex items-center gap-3 cursor-pointer select-none"
              >
                <div className="w-10 h-10 rounded-xl bg-[#667eea]/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-[#667eea]" />
                </div>
                <div className="flex-1 text-left">
                  <div className="h-3 w-28 bg-muted rounded-full mb-2" />
                  <div className="h-2.5 w-20 bg-muted/60 rounded-full mb-1.5" />
                  <div className="h-2 w-16 bg-muted/40 rounded-full" />
                </div>

                {/* Animated swipe hint */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  animate={{ x: [-24, 24, -24], opacity: [0, 0.5, 0] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center">
                    <ChevronsLeft className="w-5 h-5 text-foreground/30" />
                  </div>
                </motion.div>

                {/* Invisible tap zones */}
                <div className="absolute inset-0 flex">
                  <div className="flex-1" onClick={() => handleSwipe('left')} />
                  <div className="flex-1" onClick={() => handleSwipe('right')} />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`absolute inset-0 rounded-2xl flex items-center justify-center gap-3 ${
                  swipeState === 'left'
                    ? 'bg-red-500/10 border border-red-500/20'
                    : 'bg-[#667eea]/10 border border-[#667eea]/20'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  swipeState === 'left' ? 'bg-red-500/15' : 'bg-[#667eea]/15'
                }`}>
                  {swipeState === 'left'
                    ? <Trash2 className="w-5 h-5 text-red-500" />
                    : <FolderPlus className="w-5 h-5 text-[#667eea]" />
                  }
                </div>
                <p className={`font-semibold text-sm ${swipeState === 'left' ? 'text-red-500' : 'text-[#667eea]'}`}>
                  {swipeState === 'left' ? 'Deleted' : 'Added to Collection'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xs text-muted-foreground mt-4"
        >
          Tap left or right half of the card to try it
        </motion.p>
      </div>

    </motion.div>
  );
};
