import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SourcePillProps {
    label: string;
    icon?: React.ReactNode;
    isActive?: boolean;
    onClick?: (e: React.MouseEvent) => void;
    className?: string;
}

const SourcePill = ({
    label,
    icon,
    isActive = false,
    onClick,
    className,
}: SourcePillProps) => {
    return (
        <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onClick}
            className={cn(
                "flex items-center gap-1.5 min-h-[36px] py-1.5 px-3 rounded-full text-[13px] font-semibold ios26-transition-spring relative shadow-none outline-none select-none",
                isActive
                    ? "text-white"
                    : "border border-border text-foreground dark:text-white hover:bg-muted/20 dark:hover:bg-muted/30 bg-muted/10 dark:bg-transparent",
                className
            )}
            style={isActive ? {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                boxShadow: 'none',
                WebkitTapHighlightColor: 'transparent'
            } : {
                border: 'none',
                boxShadow: 'none',
                WebkitTapHighlightColor: 'transparent'
            }}
        >
            <span className={isActive ? "opacity-100" : "opacity-80"}>
                {icon}
            </span>
            <span>{label}</span>
            {isActive && (
                <motion.div
                    layoutId="activeSourcePill"
                    className="absolute inset-0 rounded-full bg-white/20"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
            )}
        </motion.button>
    );
};

export default SourcePill;
