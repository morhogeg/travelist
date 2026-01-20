import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, BookOpen, Mail, ArrowLeft } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useNavigate } from "react-router-dom";
import ShareExtensionGuide from "@/components/settings/ShareExtensionGuide";
import { resetOnboarding } from "@/components/onboarding";
import { lightHaptic } from "@/utils/ios/haptics";

const Guides = () => {
    const navigate = useNavigate();
    const [showShareGuide, setShowShareGuide] = useState(false);

    const handleBack = () => {
        lightHaptic();
        navigate(-1);
    };

    const handleStartTour = () => {
        lightHaptic();
        resetOnboarding();
        window.dispatchEvent(new CustomEvent('resetOnboarding'));
    };

    const handleOpenShareGuide = () => {
        lightHaptic();
        setShowShareGuide(true);
    };

    const GuideRow = ({
        icon: Icon,
        title,
        subtitle,
        onClick
    }: {
        icon: React.ElementType;
        title: string;
        subtitle: string;
        onClick: () => void;
    }) => (
        <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="w-full py-4 px-4 liquid-glass-clear border-white/10 rounded-2xl flex items-center gap-4 mb-3 text-left"
        >
            <div className="p-3 rounded-xl bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base">{title}</h3>
                <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </motion.button>
    );

    return (
        <Layout>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 pt-6 pb-24"
            >
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={handleBack}
                        className="p-2 rounded-full hover:bg-muted transition-colors"
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <h1 className="text-2xl font-bold">Guides & Tutorials</h1>
                </div>

                <div className="space-y-2">
                    <GuideRow
                        icon={BookOpen}
                        title="Welcome Tour"
                        subtitle="Take a quick tour of the app's main features."
                        onClick={handleStartTour}
                    />

                    <GuideRow
                        icon={Mail}
                        title="Saving from other apps"
                        subtitle="Learn how to save places from Instagram, TikTok, and more."
                        onClick={handleOpenShareGuide}
                    />
                </div>

                {/* Share Extension Guide Modal */}
                <ShareExtensionGuide
                    isOpen={showShareGuide}
                    onClose={() => setShowShareGuide(false)}
                />
            </motion.div>
        </Layout>
    );
};

export default Guides;
