import React from "react";
import { motion } from "framer-motion";

interface SkeletonCardProps {
    count?: number;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ count = 1 }) => {
    const skeletons = Array.from({ length: count });

    return (
        <div className="space-y-4">
            {skeletons.map((_, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="liquid-glass-clear rounded-2xl overflow-hidden relative h-[100px] w-full"
                    style={{
                        borderLeft: "4px solid rgba(102, 126, 234, 0.3)",
                        boxShadow: "none",
                    }}
                >
                    <div className="px-3 py-2.5 space-y-2.5 h-full flex flex-col justify-center">
                        {/* Header shimmer */}
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-muted/40 animate-pulse" />
                            <div className="h-4 w-1/3 bg-muted/40 rounded animate-pulse" />
                        </div>

                        {/* Content shimmer */}
                        <div className="space-y-2">
                            <div className="h-3 w-3/4 bg-muted/20 rounded animate-pulse" />
                            <div className="h-3 w-1/2 bg-muted/20 rounded animate-pulse" />
                        </div>
                    </div>

                    {/* Shimmer overlay */}
                    <div className="absolute inset-0 ios26-shimmer pointer-events-none" />
                </motion.div>
            ))}
        </div>
    );
};

export default SkeletonCard;
