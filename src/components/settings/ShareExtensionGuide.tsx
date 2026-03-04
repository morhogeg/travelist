import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Share2,
    CheckCircle2,
    Sparkles,
    Globe,
    MapPin,
    Instagram,
    Music2,
    MessageSquare,
    MoreHorizontal,
    Inbox,
} from 'lucide-react';
import { OnboardingButton } from '../onboarding/components/OnboardingButton';
import { OnboardingProgress } from '../onboarding/components/OnboardingProgress';
import { lightHaptic, mediumHaptic } from '@/utils/ios/haptics';

interface ShareExtensionGuideProps {
    isOpen: boolean;
    onClose: () => void;
}

// ─── Reusable visuals ─────────────────────────────────────────────────────────

const GradientIcon = ({
    icon: Icon,
    badge,
}: {
    icon: React.ElementType;
    badge?: React.ReactNode;
}) => (
    <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 140, damping: 14, delay: 0.1 }}
        className="mb-6 relative"
    >
        <motion.div
            className="absolute inset-[-10px] rounded-[32px] pointer-events-none"
            style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', filter: 'blur(24px)', opacity: 0.3 }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 3, repeat: Infinity }}
        />
        <div
            className="w-20 h-20 rounded-[24px] flex items-center justify-center relative"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 12px 36px rgba(102,126,234,0.4)' }}
        >
            <Icon className="w-9 h-9 text-white" />
            {badge}
        </div>
    </motion.div>
);

const SOURCE_APPS = [
    { name: 'Instagram', icon: Instagram, color: 'text-pink-400' },
    { name: 'TikTok', icon: Music2, color: 'text-purple-400' },
    { name: 'Maps', icon: MapPin, color: 'text-red-400' },
    { name: 'Safari', icon: Globe, color: 'text-blue-400' },
    { name: 'Messages', icon: MessageSquare, color: 'text-green-400' },
];

const AppPills = () => (
    <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.48 }}
        className="flex flex-wrap justify-center gap-2"
    >
        {SOURCE_APPS.map(({ name, icon: Icon, color }, i) => (
            <motion.div
                key={name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.52 + i * 0.07, type: 'spring', stiffness: 200, damping: 18 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/50 bg-card/60 backdrop-blur-sm text-xs font-medium"
            >
                <Icon className={`w-3.5 h-3.5 ${color}`} />
                <span>{name}</span>
            </motion.div>
        ))}
    </motion.div>
);

const ShareSheetMockup = () => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.46, type: 'spring', stiffness: 100, damping: 16 }}
        className="w-full max-w-[280px] rounded-2xl border border-border/50 bg-card/70 backdrop-blur-md overflow-hidden shadow-xl"
    >
        <div className="px-4 py-2.5 border-b border-border/30 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-400/60" />
            <div className="w-2 h-2 rounded-full bg-amber-400/60" />
            <div className="w-2 h-2 rounded-full bg-green-400/60" />
            <div className="flex-1 mx-2 h-5 rounded-md bg-muted/50 flex items-center px-2">
                <span className="text-[9px] text-muted-foreground truncate">maps.app.goo.gl/cafe-review</span>
            </div>
        </div>
        <div className="p-4 flex items-center justify-between">
            <div className="space-y-1.5">
                <div className="h-2.5 w-28 rounded bg-muted/60" />
                <div className="h-2 w-20 rounded bg-muted/40" />
            </div>
            <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', boxShadow: '0 4px 14px rgba(102,126,234,0.45)' }}
            >
                <Share2 className="w-[18px] h-[18px] text-white" />
            </motion.div>
        </div>
    </motion.div>
);

const ChooseTravelistMockup = () => {
    const sheetApps = [
        { label: 'Safari', bg: 'bg-sky-500/20', icon: <Globe className="w-5 h-5 text-sky-400" /> },
        { label: 'Maps', bg: 'bg-red-500/20', icon: <MapPin className="w-5 h-5 text-red-400" /> },
        { label: 'More', bg: 'bg-muted/40', icon: <MoreHorizontal className="w-5 h-5 text-muted-foreground" /> },
    ];
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.46, type: 'spring', stiffness: 100, damping: 16 }}
            className="w-full max-w-[280px] rounded-2xl border border-border/50 bg-card/70 backdrop-blur-md shadow-xl"
        >
            <div className="px-4 pt-4 pb-2 text-[11px] text-muted-foreground font-medium text-center tracking-wide uppercase">
                Share via
            </div>
            <div className="flex items-center justify-around px-4 pb-4">
                {sheetApps.map(({ label, bg, icon }) => (
                    <div key={label} className="flex flex-col items-center gap-1.5">
                        <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center`}>{icon}</div>
                        <span className="text-[10px] text-muted-foreground">{label}</span>
                    </div>
                ))}
                <div className="flex flex-col items-center gap-1.5">
                    <motion.div
                        animate={{ scale: [1, 1.12, 1] }}
                        transition={{ duration: 1.8, repeat: Infinity }}
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                        style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', boxShadow: '0 6px 18px rgba(102,126,234,0.5)' }}
                    >
                        <MapPin className="w-5 h-5 text-white" />
                    </motion.div>
                    <span className="text-[10px] font-semibold" style={{ color: '#667eea' }}>Travelist</span>
                </div>
            </div>
        </motion.div>
    );
};

const InboxCardMockup = () => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.46, type: 'spring', stiffness: 100, damping: 16 }}
        className="w-full max-w-[280px] rounded-2xl border border-border/50 bg-card/70 backdrop-blur-md shadow-xl overflow-hidden"
    >
        <div className="px-4 py-3 border-b border-border/30 flex items-center gap-2">
            <Inbox className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-primary">Inbox</span>
            <div className="ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium"
                style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white' }}>
                <Sparkles className="w-3 h-3" />
                Ready to Review
            </div>
        </div>
        <div className="px-4 py-3 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
                <div className="h-2.5 w-32 rounded bg-foreground/30" />
                <div className="h-2 w-20 rounded bg-muted/50" />
                <div className="flex gap-1 mt-1.5">
                    <div className="h-4 w-12 rounded-full bg-muted/40" />
                    <div className="h-4 w-16 rounded-full bg-muted/40" />
                </div>
            </div>
        </div>
        <div className="px-4 pb-3 flex gap-2">
            <div className="flex-1 h-8 rounded-xl border border-border/50 flex items-center justify-center">
                <span className="text-[10px] text-muted-foreground">Edit</span>
            </div>
            <div
                className="flex-1 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
            >
                <span className="text-[10px] text-white font-semibold">Save</span>
            </div>
        </div>
    </motion.div>
);

// ─── Step content (visual only — no buttons) ──────────────────────────────────

const STEPS = [
    {
        title: 'Find it anywhere.',
        subtitle: 'Spotted a place on Instagram, TikTok, or Maps? Save it to Travelist in one tap — from any app.',
        icon: Sparkles,
        Visual: AppPills,
    },
    {
        title: <>Tap the<br />Share button.</>,
        subtitle: 'In any app, look for the arrow-up icon. It opens the iOS share sheet.',
        icon: Share2,
        badge: (
            <motion.div
                className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center shadow-lg"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                <Sparkles className="w-4 h-4 text-white" />
            </motion.div>
        ),
        Visual: ShareSheetMockup,
    },
    {
        title: <>Choose<br />Travelist.</>,
        subtitle: "Find Travelist in the share sheet. Scroll right or tap More if it's not visible yet.",
        icon: MapPin,
        Visual: ChooseTravelistMockup,
    },
    {
        title: <>AI does<br />the rest.</>,
        subtitle: 'AI fills in the details. Your card waits in your Inbox — you review it and decide when to save.',
        icon: CheckCircle2,
        badge: (
            <motion.div
                className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center shadow-lg"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            >
                <Sparkles className="w-4 h-4 text-white" />
            </motion.div>
        ),
        Visual: InboxCardMockup,
    },
];

const TOTAL_STEPS = STEPS.length;

// ─── Floating particle ────────────────────────────────────────────────────────

const Particle = ({ delay, duration, x, y, size }: { delay: number; duration: number; x: string; y: string; size: number }) => (
    <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{ width: size, height: size, left: x, top: y, background: 'linear-gradient(135deg, rgba(102,126,234,0.4) 0%, rgba(118,75,162,0.4) 100%)' }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 0.7, 0.3, 0.7, 0], scale: [0.5, 1.2, 1, 1.1, 0.5], y: [0, -30, -10, -25, 0] }}
        transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
);

// ─── Main component ───────────────────────────────────────────────────────────

export const ShareExtensionGuide: React.FC<ShareExtensionGuideProps> = ({ isOpen, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        lightHaptic();
        if (currentStep < TOTAL_STEPS - 1) {
            setCurrentStep(s => s + 1);
        } else {
            mediumHaptic();
            onClose();
            setCurrentStep(0);
        }
    };

    const handleBack = () => {
        lightHaptic();
        if (currentStep > 0) setCurrentStep(s => s - 1);
    };

    const handleClose = () => {
        lightHaptic();
        onClose();
        setCurrentStep(0);
    };

    const step = STEPS[currentStep];
    const { Visual } = step;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 60 }}
                    transition={{ type: 'spring', stiffness: 80, damping: 18 }}
                    className="fixed inset-0 z-[100] bg-background flex flex-col"
                >
                    {/* Ambient particles */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
                        <Particle delay={0} duration={6} x="15%" y="20%" size={8} />
                        <Particle delay={1} duration={7} x="80%" y="15%" size={6} />
                        <Particle delay={2} duration={5} x="25%" y="70%" size={10} />
                        <Particle delay={0.5} duration={8} x="75%" y="60%" size={7} />
                    </div>

                    {/* Top bar: progress + close — sits below the notch */}
                    <div className="relative z-10 flex items-center justify-between px-6 pt-14 pb-3">
                        <div className="flex-1">
                            <OnboardingProgress currentStep={currentStep} totalSteps={TOTAL_STEPS} />
                        </div>
                        <button
                            onClick={handleClose}
                            className="ml-4 p-2 rounded-full bg-white/10 border border-white/15 backdrop-blur-md"
                        >
                            <X className="h-5 w-5 text-foreground" />
                        </button>
                    </div>

                    {/* Step visual content — flex-1 centers it */}
                    <div className="flex-1 relative overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 60 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -40 }}
                                transition={{ type: 'spring', stiffness: 80, damping: 18 }}
                                className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
                            >
                                {/* Background glow */}
                                <div
                                    className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full pointer-events-none"
                                    style={{ background: 'radial-gradient(circle, rgba(102,126,234,0.1) 0%, transparent 70%)' }}
                                />

                                <GradientIcon icon={step.icon} badge={step.badge} />

                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2, type: 'spring', stiffness: 100, damping: 14 }}
                                    className="text-[34px] font-bold text-foreground leading-tight mb-3"
                                >
                                    {step.title}
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-[16px] text-muted-foreground mb-8 max-w-[270px]"
                                >
                                    {step.subtitle}
                                </motion.p>

                                <Visual />
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Fixed CTA — always 2 buttons so layout never shifts */}
                    <div className="relative z-10 px-6 pb-10 pt-2 space-y-2">
                        <OnboardingButton onClick={handleNext}>
                            {currentStep === TOTAL_STEPS - 1 ? 'Start Exploring' : currentStep === 0 ? 'Show me how' : 'Next'}
                        </OnboardingButton>
                        <OnboardingButton
                            onClick={handleBack}
                            variant="ghost"
                            className={currentStep === 0 ? 'invisible' : ''}
                        >
                            Back
                        </OnboardingButton>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ShareExtensionGuide;
