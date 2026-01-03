import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { haptics } from '@/utils/ios/haptics';

interface CoachMarkProps {
    targetRef: React.RefObject<HTMLElement>;
    message: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
    storageKey: string;
    onDismiss?: () => void;
}

export const CoachMark: React.FC<CoachMarkProps> = ({
    targetRef,
    message,
    position = 'bottom',
    storageKey,
    onDismiss,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const coachMarkRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const hasSeen = localStorage.getItem(storageKey);
        if (!hasSeen && targetRef.current) {
            const updatePosition = () => {
                if (!targetRef.current) return;
                const rect = targetRef.current.getBoundingClientRect();

                let top = 0;
                let left = 0;

                switch (position) {
                    case 'top':
                        top = rect.top - 10;
                        left = rect.left + rect.width / 2;
                        break;
                    case 'bottom':
                        top = rect.bottom + 10;
                        left = rect.left + rect.width / 2;
                        break;
                    case 'left':
                        top = rect.top + rect.height / 2;
                        left = rect.left - 10;
                        break;
                    case 'right':
                        top = rect.top + rect.height / 2;
                        left = rect.right + 10;
                        break;
                }

                setCoords({ top, left });
            };

            updatePosition();
            setIsVisible(true);
            window.addEventListener('resize', updatePosition);
            window.addEventListener('scroll', updatePosition, true);

            return () => {
                window.removeEventListener('resize', updatePosition);
                window.removeEventListener('scroll', updatePosition, true);
            };
        }
    }, [targetRef, storageKey, position]);

    const handleDismiss = () => {
        haptics.light();
        setIsVisible(false);
        localStorage.setItem(storageKey, 'true');
        onDismiss?.();
    };

    if (!isVisible) return null;

    const getArrowStyle = () => {
        switch (position) {
            case 'top': return 'bottom-[-6px] left-1/2 -translate-x-1/2 border-t-black/80 border-x-transparent border-b-transparent';
            case 'bottom': return 'top-[-6px] left-1/2 -translate-x-1/2 border-b-black/80 border-x-transparent border-t-transparent';
            case 'left': return 'right-[-6px] top-1/2 -translate-y-1/2 border-l-black/80 border-y-transparent border-r-transparent';
            case 'right': return 'left-[-6px] top-1/2 -translate-y-1/2 border-r-black/80 border-y-transparent border-l-transparent';
        }
    };

    const getTranslate = () => {
        switch (position) {
            case 'top': return '-50% -100%';
            case 'bottom': return '-50% 0';
            case 'left': return '-100% -50%';
            case 'right': return '0 -50%';
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[100] pointer-events-none">
                    <motion.div
                        ref={coachMarkRef}
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="absolute pointer-events-auto"
                        style={{
                            top: coords.top,
                            left: coords.left,
                            transform: `translate(${getTranslate()})`,
                        }}
                    >
                        <div className="relative bg-black/80 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl max-w-[240px] border border-white/10">
                            {/* Arrow */}
                            <div className={`absolute w-0 h-0 border-[6px] ${getArrowStyle()}`} />

                            <div className="flex flex-col gap-3">
                                <p className="text-sm font-medium leading-relaxed">
                                    {message}
                                </p>
                                <button
                                    onClick={handleDismiss}
                                    className="bg-white/20 hover:bg-white/30 active:bg-white/40 ios26-transition-smooth rounded-xl py-2 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                                >
                                    Got it
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
