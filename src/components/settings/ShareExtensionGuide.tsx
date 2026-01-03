import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Share,
    ExternalLink,
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    Smartphone,
    Globe,
    Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerFooter,
    DrawerClose
} from '@/components/ui/drawer';
import { lightHaptic, mediumHaptic } from '@/utils/ios/haptics';

interface ShareExtensionGuideProps {
    isOpen: boolean;
    onClose: () => void;
}

const steps = [
    {
        title: "Find a Place",
        description: "Open any app like Instagram, TikTok, or Safari and find a place you want to save.",
        icon: <Smartphone className="h-8 w-8 text-blue-500" />,
        image: "https://images.unsplash.com/photo-1512428559083-a40ce12044a5?auto=format&fit=crop&w=400&q=80"
    },
    {
        title: "Tap Share",
        description: "Tap the share icon (usually a square with an arrow) in that app.",
        icon: <Share className="h-8 w-8 text-purple-500" />,
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80"
    },
    {
        title: "Select Travelist",
        description: "Find 'Travelist' in the list of apps. You might need to tap 'More' to find it.",
        icon: <Plus className="h-8 w-8 text-pink-500" />,
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80"
    },
    {
        title: "AI Does the Rest",
        description: "Travelist AI will automatically extract the name, location, and details for you!",
        icon: <CheckCircle2 className="h-8 w-8 text-green-500" />,
        image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=400&q=80"
    }
];

export const ShareExtensionGuide: React.FC<ShareExtensionGuideProps> = ({ isOpen, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        lightHaptic();
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
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
        <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DrawerContent className="bg-background dark:bg-background text-foreground dark:text-foreground border-t border-border transition-all duration-300 ease-in-out" style={{ height: 'auto', minHeight: '60vh', maxHeight: '85vh' }}>
                <div className="flex flex-col h-full">
                    <DrawerHeader className="shrink-0">
                        <div className="flex items-center justify-between">
                            <DrawerTitle className="text-xl font-bold">Share Extension Guide</DrawerTitle>
                            <DrawerClose asChild>
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <X className="h-5 w-5" />
                                </Button>
                            </DrawerClose>
                        </div>
                    </DrawerHeader>

                    <div className="flex-1 overflow-y-auto px-6 pb-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                <div className="flex flex-col items-center text-center space-y-4">
                                    <div className="p-4 rounded-2xl bg-primary/10">
                                        {steps[currentStep].icon}
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-semibold">{steps[currentStep].title}</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {steps[currentStep].description}
                                        </p>
                                    </div>
                                    <div className="w-full aspect-video rounded-2xl overflow-hidden border border-border bg-muted">
                                        <img
                                            src={steps[currentStep].image}
                                            alt={steps[currentStep].title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Step Indicators */}
                        <div className="flex justify-center gap-2 mt-8">
                            {steps.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? "w-8 bg-primary" : "w-2 bg-muted"
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    <DrawerFooter className="shrink-0 border-t border-border p-6">
                        <div className="flex gap-3">
                            {currentStep > 0 && (
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={handlePrev}
                                >
                                    Back
                                </Button>
                            )}
                            <Button
                                className="flex-1 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white"
                                onClick={handleNext}
                            >
                                {currentStep === steps.length - 1 ? "Got it!" : "Next"}
                            </Button>
                        </div>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
};

export default ShareExtensionGuide;
