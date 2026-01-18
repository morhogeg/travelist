import React from 'react';
import { motion } from 'framer-motion';
import { Bell, MapPin, Navigation, Smartphone } from 'lucide-react';
import { OnboardingButton } from '../components/OnboardingButton';
import { OnboardingScreenProps } from '../types';

export const ProximityAlertsScreen: React.FC<OnboardingScreenProps> = ({ onNext, onBack, onSkip }) => {
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
                className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
                }}
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.4, 0.7, 0.4],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
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
                    className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center mb-8 shadow-xl"
                >
                    <Bell className="w-10 h-10 text-white" />
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[34px] font-bold text-foreground leading-tight mb-4"
                >
                    Never Miss<br />a Spot.
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-[17px] text-muted-foreground mb-12"
                >
                    Get a gentle nudge when you're<br />
                    <span className="text-foreground font-medium">near a place you saved</span>.<br />
                    Perfect for exploring on the go.
                </motion.p>

                {/* Proximity Mockup */}
                <div className="relative w-full max-w-[280px] h-[200px]">
                    {/* Map Background Mockup */}
                    <div className="absolute inset-0 bg-muted/20 rounded-3xl border border-border/50 overflow-hidden">
                        <svg className="w-full h-full opacity-20" viewBox="0 0 100 100">
                            <path d="M0 20 L100 20 M0 50 L100 50 M0 80 L100 80 M20 0 L20 100 M50 0 L50 100 M80 0 L80 100" stroke="currentColor" strokeWidth="0.5" fill="none" />
                        </svg>

                        {/* User Location */}
                        <motion.div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                            animate={{
                                x: [-20, 20, -20],
                                y: [10, -10, 10],
                            }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg relative">
                                <motion.div
                                    className="absolute inset-0 rounded-full bg-blue-500"
                                    animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                            </div>
                        </motion.div>

                        {/* Place Pin */}
                        <div className="absolute top-1/3 right-1/4">
                            <motion.div
                                animate={{ y: [0, -5, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <MapPin className="w-6 h-6 text-emerald-500 fill-emerald-500/20" />
                            </motion.div>
                        </div>
                    </div>

                    {/* Notification Pop-up */}
                    <motion.div
                        initial={{ y: 50, opacity: 0, scale: 0.9 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        transition={{ delay: 1.2, type: 'spring', stiffness: 100 }}
                        className="absolute -bottom-4 left-4 right-4 bg-background/95 backdrop-blur-md border border-border shadow-2xl rounded-2xl p-3 flex items-center gap-3 z-20"
                    >
                        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shrink-0">
                            <Navigation className="w-5 h-5 rotate-45" />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-0.5">Nearby Alert</p>
                            <p className="text-sm font-bold truncate">Luigi's Pizza is 200m away!</p>
                        </div>
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
