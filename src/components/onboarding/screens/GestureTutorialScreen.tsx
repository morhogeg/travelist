import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hand, Trash2, FolderPlus, MapPin, Lightbulb } from 'lucide-react';
import { OnboardingButton } from '../components/OnboardingButton';
import { OnboardingScreenProps } from '../types';
import { haptics } from '@/utils/ios/haptics';

export const GestureTutorialScreen: React.FC<OnboardingScreenProps> = ({ onNext, onBack, onSkip }) => {
    const [swipeState, setSwipeState] = useState<'none' | 'left' | 'right'>('none');
    const [exitDirection, setExitDirection] = useState<'left' | 'right'>('left');

    const handleSwipe = (direction: 'left' | 'right') => {
        haptics.medium();
        setExitDirection(direction);
        setSwipeState(direction);
        setTimeout(() => setSwipeState('none'), 1500);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: 'spring', stiffness: 80, damping: 18 }}
            className="flex flex-col h-full px-8 pt-16 pb-10 relative overflow-hidden"
        >
            {/* Skip */}
            <motion.div
                className="flex justify-end relative z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <button onClick={onSkip} className="text-muted-foreground text-sm font-medium py-2 px-4">
                    Skip
                </button>
            </motion.div>

            {/* Main content */}
            <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[34px] font-bold text-foreground leading-tight mb-4"
                >
                    Master the<br />Gestures.
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-[17px] text-muted-foreground mb-12"
                >
                    Swipe cards to quickly organize<br />your travel finds.
                </motion.p>

                {/* Interactive Demo Area */}
                <div className="relative w-full max-w-[280px] h-[180px] flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        {swipeState === 'none' ? (
                            <motion.div
                                key="card"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ x: exitDirection === 'left' ? -300 : 300, opacity: 0 }}
                                className="w-full bg-card border border-border rounded-2xl p-4 shadow-xl relative overflow-hidden"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div className="text-left">
                                        <div className="h-4 w-24 bg-muted rounded-full mb-2" />
                                        <div className="h-3 w-16 bg-muted/60 rounded-full" />
                                    </div>
                                </div>

                                {/* Hand Animation */}
                                <motion.div
                                    animate={{
                                        x: [-40, 40, -40],
                                        opacity: [0, 1, 0],
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                    className="absolute bottom-4 right-4 text-foreground/40"
                                >
                                    <Hand className="w-12 h-12 rotate-[-20deg]" />
                                </motion.div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="action"
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className={`flex flex-col items-center gap-3 ${swipeState === 'left' ? 'text-red-500' : 'text-purple-500'
                                    }`}
                            >
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${swipeState === 'left' ? 'bg-red-500/10' : 'bg-purple-500/10'
                                    }`}>
                                    {swipeState === 'left' ? <Trash2 className="w-8 h-8" /> : <FolderPlus className="w-8 h-8" />}
                                </div>
                                <span className="font-bold uppercase tracking-widest text-[10px]">
                                    {swipeState === 'left' ? 'Removed' : 'Added to Collection'}
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Invisible triggers for "Try it yourself" */}
                    <div className="absolute inset-0 flex">
                        <div
                            className="flex-1 cursor-pointer"
                            onClick={() => handleSwipe('left')}
                            title="Swipe Left"
                        />
                        <div
                            className="flex-1 cursor-pointer"
                            onClick={() => handleSwipe('right')}
                            title="Swipe Right"
                        />
                    </div>
                </div>

                <div className="mt-8 flex gap-8 text-[13px] font-medium text-muted-foreground">
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-red-500/70 font-bold">← Swipe Left</span>
                        <span>to Remove</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-purple-500 font-bold">Swipe Right →</span>
                        <span>to Collect</span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, type: 'spring', stiffness: 80, damping: 12 }}
                className="space-y-3 relative z-10"
            >
                <OnboardingButton onClick={onNext}>
                    Got it, Continue
                </OnboardingButton>
                <OnboardingButton onClick={onBack} variant="ghost">
                    Back
                </OnboardingButton>
            </motion.div>
        </motion.div>
    );
};
