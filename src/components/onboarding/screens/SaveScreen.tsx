import React from 'react';
import { motion } from 'framer-motion';
import { Share2, ArrowRight } from 'lucide-react';
import { OnboardingButton } from '../components/OnboardingButton';
import { OnboardingScreenProps } from '../types';

// Floating orb
const FloatingOrb = ({ delay, x, y, size, color }: { delay: number; x: string; y: string; size: number; color: string }) => (
    <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
            width: size,
            height: size,
            left: x,
            top: y,
            background: color,
            filter: 'blur(1px)',
        }}
        animate={{
            y: [0, -20, 0],
            opacity: [0.6, 1, 0.6],
            scale: [1, 1.1, 1],
        }}
        transition={{
            duration: 3 + Math.random() * 2,
            delay,
            repeat: Infinity,
            ease: "easeInOut",
        }}
    />
);

const apps = [
    { name: 'Safari', emoji: '🧭' },
    { name: 'Instagram', emoji: '📸' },
    { name: 'Maps', emoji: '🗺️' },
    { name: 'TikTok', emoji: '🎵' },
];

export const SaveScreen: React.FC<OnboardingScreenProps> = ({ onNext, onBack, onSkip }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: 'spring', stiffness: 80, damping: 18 }}
            className="flex flex-col h-full px-8 pt-16 pb-10 relative overflow-hidden"
        >
            {/* Floating orbs */}
            <div className="absolute inset-0 pointer-events-none">
                <FloatingOrb delay={0} x="10%" y="25%" size={12} color="rgba(102, 126, 234, 0.5)" />
                <FloatingOrb delay={1} x="85%" y="20%" size={8} color="rgba(118, 75, 162, 0.5)" />
                <FloatingOrb delay={0.5} x="20%" y="65%" size={10} color="rgba(102, 126, 234, 0.4)" />
                <FloatingOrb delay={1.5} x="80%" y="70%" size={14} color="rgba(118, 75, 162, 0.4)" />
            </div>

            {/* Skip */}
            <motion.div
                className="flex justify-end relative z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
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
                {/* Animated share icon with orbital effect */}
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 150, damping: 12, delay: 0.1 }}
                    className="mb-10 relative"
                >
                    {/* Orbiting ring */}
                    <motion.div
                        className="absolute inset-[-20px] rounded-full border-2 border-dashed border-[#667eea]/30"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    />

                    {/* Glowing backdrop */}
                    <motion.div
                        className="absolute inset-0 rounded-3xl"
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            filter: 'blur(30px)',
                        }}
                        animate={{
                            scale: [1, 1.4, 1],
                            opacity: [0.4, 0.7, 0.4],
                        }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                    />

                    <motion.div
                        className="w-24 h-24 rounded-3xl flex items-center justify-center relative"
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            boxShadow: '0 20px 50px rgba(102, 126, 234, 0.35)',
                        }}
                        whileHover={{ scale: 1.05, rotate: 5 }}
                    >
                        {/* Shimmer */}
                        <motion.div
                            className="absolute inset-0 rounded-3xl overflow-hidden"
                        >
                            <motion.div
                                className="absolute inset-0"
                                style={{
                                    background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)',
                                }}
                                animate={{ x: ['-150%', '150%'] }}
                                transition={{ duration: 2, delay: 0.8, repeat: Infinity, repeatDelay: 3 }}
                            />
                        </motion.div>
                        <Share2 className="w-12 h-12 text-white" />
                    </motion.div>
                </motion.div>

                {/* Title */}
                <motion.h1
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 100, damping: 12, delay: 0.25 }}
                    className="text-[34px] font-bold text-foreground leading-tight mb-4"
                >
                    Save from<br />any app.
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="text-[17px] text-muted-foreground leading-relaxed"
                >
                    Found a place you love?<br />
                    Tap <span className="text-foreground font-medium">Share → Travelist</span>.
                </motion.p>

                {/* Animated app flow */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-10 flex items-center gap-2"
                >
                    {apps.map((app, i) => (
                        <motion.div
                            key={app.name}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                                type: 'spring',
                                stiffness: 200,
                                damping: 15,
                                delay: 0.6 + i * 0.1
                            }}
                            whileHover={{ scale: 1.15, y: -5 }}
                            className="w-12 h-12 rounded-xl bg-muted/30 flex items-center justify-center text-xl"
                        >
                            {app.emoji}
                        </motion.div>
                    ))}

                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1 }}
                    >
                        <ArrowRight className="w-5 h-5 text-[#667eea] mx-2" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                            type: 'spring',
                            stiffness: 200,
                            delay: 1.1
                        }}
                        whileHover={{ scale: 1.15, y: -5 }}
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                    >
                        <span className="text-white text-lg font-bold">T</span>
                    </motion.div>
                </motion.div>
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
