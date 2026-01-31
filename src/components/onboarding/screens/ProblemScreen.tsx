import React from 'react';
import { motion } from 'framer-motion';
import { Search, MessageSquare, Image, XCircle } from 'lucide-react';
import { OnboardingButton } from '../components/OnboardingButton';
import { OnboardingScreenProps } from '../types';

// Floating "Noise" component
const NoiseItem = ({ delay, duration, x, y, children }: { delay: number; duration: number; x: string; y: string; children: React.ReactNode }) => (
    <motion.div
        className="absolute text-muted-foreground/40"
        style={{
            left: x,
            top: y,
        }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{
            opacity: [0, 0.4, 0.2, 0.4, 0],
            scale: [0.8, 1.1, 1, 1.05, 0.8],
            y: [0, -20, -10, -15, 0],
        }}
        transition={{
            duration,
            delay,
            repeat: Infinity,
            ease: "easeInOut",
        }}
    >
        {children}
    </motion.div>
);

export const ProblemScreen: React.FC<OnboardingScreenProps> = ({ onNext, onSkip }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col h-full px-8 pt-16 pb-10 relative overflow-hidden"
        >
            {/* Background "Noise" items */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <NoiseItem delay={0} duration={6} x="10%" y="25%"><Search className="w-8 h-8" /></NoiseItem>
                <NoiseItem delay={1} duration={7} x="85%" y="20%"><MessageSquare className="w-10 h-10" /></NoiseItem>
                <NoiseItem delay={2} duration={5} x="20%" y="75%"><Image className="w-12 h-12" /></NoiseItem>
                <NoiseItem delay={0.5} duration={8} x="80%" y="65%"><Search className="w-6 h-6" /></NoiseItem>
                <NoiseItem delay={3} duration={6} x="5%" y="55%"><Image className="w-9 h-9" /></NoiseItem>
                <NoiseItem delay={1.5} duration={7} x="75%" y="45%"><MessageSquare className="w-7 h-7" /></NoiseItem>
                <NoiseItem delay={2.5} duration={5} x="45%" y="85%"><Search className="w-10 h-10" /></NoiseItem>
            </div>

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
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                        type: 'spring',
                        stiffness: 150,
                        damping: 12,
                        delay: 0.2
                    }}
                    className="mb-12 relative"
                >
                    {/* Muted background glow */}
                    <motion.div
                        className="absolute inset-0 rounded-[28px]"
                        style={{
                            background: 'rgba(100, 116, 139, 0.1)',
                            filter: 'blur(20px)',
                        }}
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.2, 0.4, 0.2],
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />

                    <div
                        className="w-28 h-28 rounded-[28px] border-2 border-dashed border-muted-foreground/30 flex items-center justify-center relative bg-muted/50"
                    >
                        <XCircle className="w-14 h-14 text-muted-foreground/50" />

                        {/* "Buried" items visual */}
                        <motion.div
                            className="absolute -bottom-2 -right-2 bg-background rounded-lg border border-border p-1 shadow-sm"
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <div className="w-6 h-1 bg-muted rounded-full mb-1" />
                            <div className="w-4 h-1 bg-muted/60 rounded-full" />
                        </motion.div>
                    </div>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        type: 'spring',
                        stiffness: 100,
                        damping: 12,
                        delay: 0.4
                    }}
                    className="text-[34px] font-bold text-foreground leading-tight mb-4"
                >
                    Lost in<br />the noise?
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55, duration: 0.5 }}
                    className="text-[17px] text-muted-foreground leading-relaxed max-w-[280px]"
                >
                    Great places shouldn't get buried in screenshots, notes, or open tabs.
                </motion.p>
            </div>

            {/* CTA */}
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
                <OnboardingButton onClick={onNext} variant="secondary">
                    Tell me more
                </OnboardingButton>
            </motion.div>
        </motion.div>
    );
};
