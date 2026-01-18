import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, MessageSquareText, Lightbulb, ArrowDown } from 'lucide-react';
import { OnboardingButton } from '../components/OnboardingButton';
import { OnboardingScreenProps } from '../types';

export const AIMagicScreen: React.FC<OnboardingScreenProps> = ({ onNext, onBack, onSkip }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: 'spring', stiffness: 80, damping: 18 }}
            className="flex flex-col h-full px-8 pt-16 pb-10 relative overflow-hidden"
        >
            {/* Ambient glow */}
            <motion.div
                className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)',
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
                transition={{ delay: 0.5 }}
            >
                <button onClick={onSkip} className="text-muted-foreground text-sm font-medium py-2 px-4">
                    Skip
                </button>
            </motion.div>

            {/* Main content */}
            <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-8 shadow-xl"
                >
                    <Sparkles className="w-10 h-10 text-white" />
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[34px] font-bold text-foreground leading-tight mb-4"
                >
                    AI Magic.
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-[17px] text-muted-foreground mb-12"
                >
                    Just type what you heard.<br />
                    Travelist turns your notes into<br />
                    <span className="text-foreground font-medium">beautifully organized cards</span>.
                </motion.p>

                {/* AI Input Mockup */}
                <div className="relative w-full max-w-[300px] space-y-4">
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="bg-muted/40 backdrop-blur-md rounded-2xl p-4 border border-border/50 text-left"
                    >
                        <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                            <MessageSquareText className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Your Note</span>
                        </div>
                        <p className="text-sm italic text-foreground/80">
                            "Sarah said the pizza at <span className="text-amber-500 font-medium">Luigi's in Paris</span> is a must-try!"
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="flex justify-center"
                    >
                        <motion.div
                            animate={{ y: [0, 5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            <ArrowDown className="w-6 h-6 text-amber-500" />
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.9 }}
                        className="bg-card rounded-2xl p-4 border-l-4 border-amber-500 shadow-xl text-left relative overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-amber-500/10 flex items-center justify-center text-amber-600">
                                    <Sparkles className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-bold">Luigi's Pizza</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">Paris, France</span>
                        </div>
                        <div className="flex items-start gap-2 text-amber-600">
                            <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <p className="text-xs font-medium italic">"Must-try pizza - recommended by Sarah"</p>
                        </div>

                        {/* Shimmer effect */}
                        <motion.div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                background: 'linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.05), transparent)',
                            }}
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                    </motion.div>
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
                    Continue
                </OnboardingButton>
                <OnboardingButton onClick={onBack} variant="ghost">
                    Back
                </OnboardingButton>
            </motion.div>
        </motion.div>
    );
};
