import React from 'react';
import { motion } from 'framer-motion';
import { Map, ExternalLink, Navigation } from 'lucide-react';
import { OnboardingButton } from '../components/OnboardingButton';
import { OnboardingScreenProps } from '../types';

export const NavigateScreen: React.FC<OnboardingScreenProps> = ({ onNext, onBack, onSkip }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: 'spring', stiffness: 80, damping: 18 }}
            className="flex flex-col h-full px-8 pt-16 pb-10 relative overflow-hidden"
        >
            {/* Animated path lines in background */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.1 }}>
                <motion.path
                    d="M 50 100 Q 150 200 100 350 Q 50 500 200 600"
                    stroke="url(#gradient)"
                    strokeWidth="3"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.path
                    d="M 350 80 Q 250 200 300 350 Q 350 500 200 650"
                    stroke="url(#gradient)"
                    strokeWidth="3"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 3.5, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}
                />
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#667eea" />
                        <stop offset="100%" stopColor="#764ba2" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Large ambient glow */}
            <motion.div
                className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, rgba(102, 126, 234, 0.2) 0%, transparent 60%)',
                }}
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.6, 1, 0.6],
                }}
                transition={{ duration: 4, repeat: Infinity }}
            />

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
                {/* Animated map icon with launch indicator */}
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 150, damping: 12, delay: 0.1 }}
                    className="mb-12 relative"
                >
                    {/* Ripple effect */}
                    <motion.div
                        className="absolute inset-[-15px] rounded-[36px] border-2 border-[#667eea]/30"
                        animate={{
                            scale: [1, 1.5, 1.5],
                            opacity: [0.6, 0, 0],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                        className="absolute inset-[-15px] rounded-[36px] border-2 border-[#667eea]/30"
                        animate={{
                            scale: [1, 1.5, 1.5],
                            opacity: [0.6, 0, 0],
                        }}
                        transition={{ duration: 2, delay: 0.5, repeat: Infinity }}
                    />

                    {/* Glow */}
                    <motion.div
                        className="absolute inset-0 rounded-3xl"
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            filter: 'blur(30px)',
                        }}
                        animate={{
                            scale: [1, 1.4, 1],
                            opacity: [0.5, 0.8, 0.5],
                        }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                    />

                    <motion.div
                        className="w-24 h-24 rounded-3xl flex items-center justify-center relative"
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            boxShadow: '0 20px 50px rgba(102, 126, 234, 0.35)',
                        }}
                        whileHover={{ scale: 1.05 }}
                    >
                        {/* Shimmer */}
                        <motion.div className="absolute inset-0 rounded-3xl overflow-hidden">
                            <motion.div
                                className="absolute inset-0"
                                style={{
                                    background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)',
                                }}
                                animate={{ x: ['-150%', '150%'] }}
                                transition={{ duration: 2, delay: 0.8, repeat: Infinity, repeatDelay: 3 }}
                            />
                        </motion.div>
                        <Map className="w-12 h-12 text-white" />
                    </motion.div>

                    {/* Launch indicator */}
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                        className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-xl"
                    >
                        <motion.div
                            animate={{ y: [-2, 2, -2] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            <Navigation className="w-5 h-5 text-[#667eea] rotate-45" />
                        </motion.div>
                    </motion.div>
                </motion.div>

                {/* Title */}
                <motion.h1
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 100, damping: 12, delay: 0.25 }}
                    className="text-[34px] font-bold text-foreground leading-tight mb-4"
                >
                    One tap.<br />Start navigating.
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="text-[17px] text-muted-foreground leading-relaxed"
                >
                    Export your route directly to<br />
                    <span className="text-foreground font-medium">Google Maps</span> or <span className="text-foreground font-medium">Apple Maps</span>.<br />
                    Ready to go the moment you are.
                </motion.p>

                {/* Map badges with bounce */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-10 flex items-center gap-4"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.6 }}
                        whileHover={{ scale: 1.1, y: -5 }}
                        className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 backdrop-blur-md cursor-pointer border border-white/10 hover:bg-white/10 transition-colors shadow-lg"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4.5 10.3524C4.5 6.22158 7.85786 2.86371 11.9887 2.86371C16.1195 2.86371 19.4774 6.22158 19.4774 10.3524C19.4774 13.0645 18.0264 15.4377 15.8654 16.7402L11.9887 21.1364L8.11197 16.7402C5.95101 15.4377 4.5 13.0645 4.5 10.3524Z" fill="#34A853" />
                            <path d="M15.8654 16.7402C13.7045 18.0427 11.9887 21.1364 11.9887 21.1364L8.11197 16.7402C10.2729 18.0427 11.9887 21.1364 11.9887 21.1364" fill="#EA4335" />
                            <path d="M11.9887 13.4831C13.7171 13.4831 15.1193 12.0809 15.1193 10.3526C15.1193 8.62419 13.7171 7.22198 11.9887 7.22198C10.2604 7.22198 8.85815 8.62419 8.85815 10.3526C8.85815 12.0809 10.2604 13.4831 11.9887 13.4831Z" fill="#FBBC04" />
                            <path d="M11.9887 2.86371C7.85786 2.86371 4.5 6.22158 4.5 10.3524C4.5 11.8315 4.93122 13.2098 5.67156 14.3672L11.9887 2.86371Z" fill="#4285F4" />
                        </svg>
                        <span className="text-[15px] font-semibold text-white tracking-tight">Google Maps</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.7 }}
                        whileHover={{ scale: 1.1, y: -5 }}
                        className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 backdrop-blur-md cursor-pointer border border-white/10 hover:bg-white/10 transition-colors shadow-lg"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.05 20.28c-.96.95-2.12 1.43-3.08 1.43-1.03 0-2-.45-2.88-.45s-1.85.45-2.88.45c-.96 0-2.12-.48-3.08-1.43-2.13-2.13-3.2-5.48-3.2-8.31 0-2.83 1.07-5.59 3.2-7.72C6.17 3.12 7.33 2.64 8.29 2.64c1.03 0 2 .45 2.88.45.88 0 1.85-.45 2.88-.45.96 0 2.12.48 3.08 1.43 2.13 2.13 3.2 4.89 3.2 7.72 0 2.83-1.07 6.36-3.2 8.49zM12.01 5.48c-.01-1.42 1.14-2.58 2.56-2.59.01 1.42-1.14 2.58-2.56 2.59z" />
                        </svg>
                        <span className="text-[15px] font-semibold text-white tracking-tight">Apple Maps</span>
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
