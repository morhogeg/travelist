import React from 'react';
import { motion } from 'framer-motion';
import { Share2, Compass, Instagram, MapPin, Sparkles, ArrowRight } from 'lucide-react';
import { OnboardingButton } from '../components/OnboardingButton';
import { OnboardingScreenProps } from '../types';

const apps = [
    { name: 'Safari', icon: Compass, color: 'text-blue-500' },
    { name: 'Instagram', icon: Instagram, color: 'text-pink-500' },
    { name: 'Maps', icon: MapPin, color: 'text-green-500' },
];

export const ShareToSaveScreen: React.FC<OnboardingScreenProps> = ({ onNext, onBack, onSkip }) => {
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
                    className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center mb-8 shadow-xl relative"
                >
                    <Share2 className="w-10 h-10 text-white" />
                    <motion.div
                        className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white shadow-lg"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <Sparkles className="w-5 h-5" />
                    </motion.div>
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
                    className="text-[17px] text-muted-foreground mb-10"
                >
                    See a place you love online? Just share it to<br />
                    <span className="text-foreground font-medium">Travelist</span> and our AI will instantly<br />
                    save all the details for you.
                </motion.p>

                {/* Visual Flow Mockup */}
                <div className="relative w-full max-w-[300px] py-4">
                    <div className="flex items-center justify-between relative">
                        {/* App Icons */}
                        <div className="flex -space-x-3">
                            {apps.map((app, i) => (
                                <motion.div
                                    key={app.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + i * 0.1 }}
                                    className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center shadow-lg border-2 border-background z-[10]"
                                >
                                    <app.icon className={`w-6 h-6 ${app.color}`} />
                                </motion.div>
                            ))}
                        </div>

                        {/* Arrow */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.7 }}
                            className="flex-1 flex justify-center"
                        >
                            <ArrowRight className="w-6 h-6 text-muted-foreground" />
                        </motion.div>

                        {/* Travelist Icon */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.9 }}
                            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-white shadow-xl z-[10]"
                        >
                            <span className="text-2xl font-black">T</span>
                        </motion.div>

                        {/* Connection Line */}
                        <div className="absolute top-1/2 left-12 right-12 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2 -z-0" />
                    </div>

                    {/* AI Parsing Preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2 }}
                        className="mt-8 bg-card rounded-2xl p-4 border border-border shadow-lg text-left relative overflow-hidden"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="h-3 w-24 bg-muted rounded-full mb-1.5" />
                                <div className="h-2 w-16 bg-muted/60 rounded-full" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                            <Sparkles className="w-3 h-3" />
                            <span>AI Pulling Details...</span>
                        </div>

                        {/* Shimmer effect */}
                        <motion.div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
                            }}
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
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
