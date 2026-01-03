import React from "react";
import { motion } from "framer-motion";
import {
    MapPin,
    Folder,
    Map,
    Search,
    Plus,
    LucideIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { mediumHaptic } from "@/utils/ios/haptics";

export type EmptyStateVariant = 'no-places' | 'no-collections' | 'no-routes' | 'no-results';

interface EmptyStateProps {
    variant: EmptyStateVariant;
    onCtaClick?: () => void;
    ctaText?: string;
    title?: string;
    description?: string;
}

const variantConfig: Record<EmptyStateVariant, {
    icon: LucideIcon;
    title: string;
    description: string;
    ctaText?: string;
}> = {
    'no-places': {
        icon: MapPin,
        title: "No places yet",
        description: "Start adding your favorite travel recommendations to see them here.",
        ctaText: "Add Your First Place"
    },
    'no-collections': {
        icon: Folder,
        title: "No collections yet",
        description: "Create your first collection to organize your saved places.",
        ctaText: "Create Collection"
    },
    'no-routes': {
        icon: Map,
        title: "No routes yet",
        description: "Create a route to organize your trip itinerary.",
        ctaText: "Create Your First Route"
    },
    'no-results': {
        icon: Search,
        title: "No results found",
        description: "Try adjusting your filters or search terms to find what you're looking for.",
    }
};

const EmptyState: React.FC<EmptyStateProps> = ({
    variant,
    onCtaClick,
    ctaText,
    title,
    description
}) => {
    const config = variantConfig[variant];
    const Icon = config.icon;

    const handleCtaClick = () => {
        mediumHaptic();
        onCtaClick?.();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="liquid-glass-clear rounded-2xl p-8 text-center space-y-4 mx-4 my-6"
            style={{ boxShadow: 'none' }}
        >
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-[#667eea]/20 to-[#764ba2]/20 flex items-center justify-center mb-2">
                <Icon className="h-8 w-8 text-[#667eea]" />
            </div>

            <div>
                <h3 className="text-lg font-bold mb-1">{title || config.title}</h3>
                <p className="text-sm text-muted-foreground max-w-[240px] mx-auto">
                    {description || config.description}
                </p>
            </div>

            {(onCtaClick || ctaText || config.ctaText) && (
                <Button
                    onClick={handleCtaClick}
                    className="text-white font-semibold shadow-lg mt-4 w-full max-w-[200px]"
                    style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                    }}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    {ctaText || config.ctaText}
                </Button>
            )}
        </motion.div>
    );
};

export default EmptyState;
