import React from 'react';
import { motion } from 'framer-motion';
import { Share2, Compass, Instagram, MapPin, ArrowUpRight } from 'lucide-react';
import { OnboardingButton } from '../components/OnboardingButton';
import { OnboardingScreenProps } from '../types';

export const ShareExtensionScreen: React.FC<OnboardingScreenProps> = ({ onNext, onBack, onSkip }) => {
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
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center mb-8 shadow-xl"
                >
                    <Share2 className="w-10 h-10 text-white" />
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[34px] font-bold text-foreground leading-tight mb-4"
                >
                    Save from<br />Anywhere.
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-[17px] text-muted-foreground mb-12"
                >
                    Found a place in Safari or Instagram?<br />
                    Save it instantly without leaving the app.
                </motion.p>

                {/* Share Sheet Mockup */}
                <div className="relative w-full max-w-[260px] bg-muted/30 rounded-3xl p-4 border border-border/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">iOS Share Sheet</span>
                        <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                        <div className="flex flex-col items-center gap-1.5">
                            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white">
                                <Compass className="w-6 h-6" />
                            </div>
                            <span className="text-[9px] text-muted-foreground">Safari</span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 flex items-center justify-center text-white">
                                <Instagram className="w-6 h-6" />
                            </div>
                            <span className="text-[9px] text-muted-foreground">Instagram</span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5">
                            <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center text-white">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <span className="text-[9px] text-muted-foreground">Maps</span>
                        </div>

                        {/* Travelist App Icon */}
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="flex flex-col items-center gap-1.5"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                                <span className="text-lg font-black">T</span>
                            </div>
                            <span className="text-[9px] font-bold text-foreground">Travelist</span>
                        </motion.div>
                    </div>

                    <div className="mt-6 bg-background/50 rounded-xl p-3 flex items-center justify-between border border-border/30">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-purple-500/20 flex items-center justify-center">
                                <ArrowUpRight className="w-3.5 h-3.5 text-purple-500" />
                            </div>
                            <span className="text-[11px] font-medium">Enable in "More..."</span>
                        </div>
                        <div className="w-4 h-4 rounded-full border border-purple-500 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-purple-500" />
                        </div>
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
                    Continue
                </OnboardingButton>
                <OnboardingButton onClick={onBack} variant="ghost">
                    Back
                </OnboardingButton>
            </motion.div>
        </motion.div>
    );
};
