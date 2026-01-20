import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Share,
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    Smartphone,
    Instagram,
    MapPin,
    Music2,
    Sparkles,
    Globe,
    MessageSquare
} from 'lucide-react';
import { OnboardingButton } from '../onboarding/components/OnboardingButton';
import { OnboardingProgress } from '../onboarding/components/OnboardingProgress';
import { lightHaptic, mediumHaptic } from '@/utils/ios/haptics';

interface ShareExtensionGuideProps {
    isOpen: boolean;
    onClose: () => void;
}

// Floating particle component for consistency with onboarding
const Particle = ({ delay, duration, x, y, size }: { delay: number; duration: number; x: string; y: string; size: number }) => (
    <motion.div
        className="absolute rounded-full"
        style={{
            width: size,
            height: size,
            left: x,
            top: y,
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.4) 0%, rgba(118, 75, 162, 0.4) 100%)',
        }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{
            opacity: [0, 0.8, 0.4, 0.8, 0],
            scale: [0.5, 1.2, 1, 1.1, 0.5],
            y: [0, -30, -10, -25, 0],
        }}
        transition={{
            duration,
            delay,
            repeat: Infinity,
            ease: "easeInOut",
        }}
    />
);

const steps = [
    {
        title: "Find Inspiration",
        description: "Browse Instagram, TikTok, Google Maps, or even texts from friends for places you want to visit.",
        icon: <Sparkles className="h-10 w-10 text-yellow-400" />,
        apps: [
            { name: "Instagram", icon: <Instagram className="h-4 w-4" /> },
            { name: "TikTok", icon: <Music2 className="h-4 w-4" /> },
            { name: "Google Maps", icon: <MapPin className="h-4 w-4" /> },
            { name: "Texts", icon: <MessageSquare className="h-4 w-4" /> },
            { name: "Safari", icon: <Globe className="h-4 w-4" /> }
        ]
    },
    {
        title: "Tap Share",
        description: "Tap the share icon in the app. Look for the 'Share' button or the arrow icon.",
        icon: <Share className="h-10 w-10 text-blue-400" />
    },
    {
        title: "Select Travelist",
        description: "Find 'Travelist' in the share sheet. You might need to scroll to the end and tap 'More'.",
        icon: <Smartphone className="h-10 w-10 text-pink-400" />
    },
    {
        title: "AI Magic",
        description: "Travelist AI automatically creates a card for you to review in your inbox before it's added to your home screen!",
        icon: <CheckCircle2 className="h-10 w-10 text-green-400" />
    }
];

export const ShareExtensionGuide: React.FC<ShareExtensionGuideProps> = ({ isOpen, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        lightHaptic();
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            mediumHaptic();
            onClose();
        }
    };

    const handlePrev = () => {
        lightHaptic();
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-background flex flex-col pt-safe-area-top pb-safe-area-bottom"
                >
                    {/* Floating particles background for consistency */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
                        <Particle delay={0} duration={6} x="15%" y="20%" size={8} />
                        <Particle delay={1} duration={7} x="80%" y="15%" size={6} />
                        <Particle delay={2} duration={5} x="25%" y="70%" size={10} />
                        <Particle delay={0.5} duration={8} x="75%" y="60%" size={7} />
                    </div>

                    {/* Progress Bar */}
                    <div className="pt-4 px-6 relative z-10">
                        <OnboardingProgress currentStep={currentStep} totalSteps={steps.length} />
                    </div>

                    {/* Header */}
                    <div className="relative z-10 flex items-center justify-between px-8 pt-8 pb-4">
                        <div className="flex flex-col">
                            <h2 className="text-sm font-bold tracking-widest uppercase text-primary/60">Guide</h2>
                            <h1 className="text-xl font-bold">Saving from other apps</h1>
                        </div>
                        <button
                            onClick={() => { lightHaptic(); onClose(); }}
                            className="p-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
                        >
                            <X className="h-5 w-5 text-muted-foreground" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 text-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 1.1, y: -20 }}
                                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                                className="w-full max-w-sm flex flex-col items-center"
                            >
                                <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-center mb-8 shadow-2xl">
                                    {steps[currentStep].icon}
                                </div>

                                <h3 className="text-3xl font-bold mb-4 tracking-tight">
                                    {steps[currentStep].title}
                                </h3>

                                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                                    {steps[currentStep].description}
                                </p>

                                {steps[currentStep].apps && (
                                    <div className="flex flex-wrap justify-center gap-3 mb-4">
                                        {steps[currentStep].apps.map(app => (
                                            <div key={app.name} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium">
                                                {app.icon}
                                                {app.name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Footer */}
                    <div className="relative z-10 p-8 pb-10">
                        <div className="space-y-3">
                            <OnboardingButton
                                onClick={handleNext}
                                className="w-full"
                            >
                                {currentStep === steps.length - 1 ? "Start Exploring" : "Next Step"}
                            </OnboardingButton>

                            {currentStep > 0 && (
                                <OnboardingButton
                                    onClick={handlePrev}
                                    variant="ghost"
                                    className="w-full"
                                >
                                    Back
                                </OnboardingButton>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ShareExtensionGuide;
