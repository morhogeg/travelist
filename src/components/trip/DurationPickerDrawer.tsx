/**
 * Duration Picker Drawer
 *
 * Bottom drawer for selecting trip duration before AI generation.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, Loader2 } from 'lucide-react';
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mediumHaptic } from '@/utils/ios/haptics';

interface DurationPickerDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    cityName: string;
    onSelectDuration: (days: number) => void;
    isGenerating?: boolean;
    progress?: string;
}

const QUICK_OPTIONS = [3, 5, 7];

const DurationPickerDrawer: React.FC<DurationPickerDrawerProps> = ({
    isOpen,
    onClose,
    cityName,
    onSelectDuration,
    isGenerating = false,
    progress = '',
}) => {
    const [customDays, setCustomDays] = useState('');

    const handleQuickSelect = (days: number) => {
        mediumHaptic();
        onSelectDuration(days);
    };

    const handleCustomSelect = () => {
        const days = parseInt(customDays, 10);
        if (days >= 1 && days <= 14) {
            mediumHaptic();
            onSelectDuration(days);
        }
    };

    return (
        <Drawer open={isOpen} onOpenChange={onClose}>
            <DrawerContent className="max-h-[60vh]">
                <DrawerHeader className="text-center pb-2">
                    <DrawerTitle className="flex items-center justify-center gap-2">
                        <Sparkles className="h-5 w-5 text-[#667eea]" />
                        <span>Plan Your Trip</span>
                    </DrawerTitle>
                    <DrawerDescription>
                        Travelist AI will organize your <strong>saved {cityName} places</strong> into an optimized itinerary and suggest additional spots you might love
                    </DrawerDescription>
                </DrawerHeader>

                {isGenerating ? (
                    <div className="flex flex-col items-center justify-center py-12 px-6">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                            <Loader2 className="h-10 w-10 text-[#667eea]" />
                        </motion.div>
                        <p className="mt-4 text-sm text-muted-foreground text-center">
                            {progress || 'Generating your trip...'}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground/70">
                            This may take a few seconds
                        </p>
                    </div>
                ) : (
                    <div className="px-6 pb-6 space-y-6">
                        {/* Quick duration options */}
                        <div className="space-y-3">
                            <p className="text-sm font-medium text-muted-foreground">
                                How many days?
                            </p>
                            <div className="grid grid-cols-3 gap-3">
                                {QUICK_OPTIONS.map((days) => (
                                    <motion.button
                                        key={days}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleQuickSelect(days)}
                                        className="flex flex-col items-center justify-center py-4 px-3 rounded-2xl 
                               border-2 border-border hover:border-[#667eea] 
                               transition-colors liquid-glass-clear"
                                    >
                                        <Calendar className="h-5 w-5 text-[#667eea] mb-1" />
                                        <span className="text-lg font-bold">{days}</span>
                                        <span className="text-xs text-muted-foreground">days</span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Custom duration */}
                        <div className="space-y-3">
                            <p className="text-sm font-medium text-muted-foreground">
                                Or choose custom duration
                            </p>
                            <div className="flex gap-3">
                                <Input
                                    type="number"
                                    min={1}
                                    max={14}
                                    placeholder="1-14 days"
                                    value={customDays}
                                    onChange={(e) => setCustomDays(e.target.value)}
                                    className="flex-1"
                                />
                                <Button
                                    onClick={handleCustomSelect}
                                    disabled={!customDays || parseInt(customDays, 10) < 1 || parseInt(customDays, 10) > 14}
                                    style={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    }}
                                    className="text-white px-6"
                                >
                                    Generate
                                </Button>
                            </div>
                        </div>

                        {/* Info text */}
                        <p className="text-xs text-muted-foreground text-center">
                            📍 Uses your <strong>saved places</strong> • Considers distances & timing<br />
                            ✨ Plus suggests hidden gems you haven't saved yet
                        </p>
                    </div>
                )}
            </DrawerContent>
        </Drawer>
    );
};

export default DurationPickerDrawer;
