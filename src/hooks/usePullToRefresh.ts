import { useState, useCallback, useEffect } from 'react';
import { haptics } from '@/utils/ios/haptics';

interface UsePullToRefreshProps {
    onRefresh: () => Promise<void>;
    threshold?: number;
}

export const usePullToRefresh = ({
    onRefresh,
    threshold = 80
}: UsePullToRefreshProps) => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullProgress, setPullProgress] = useState(0);
    const [startY, setStartY] = useState(0);
    const [isPulling, setIsPulling] = useState(false);

    const handleTouchStart = useCallback((e: TouchEvent) => {
        // Only allow pull to refresh if at the top of the page
        if (window.scrollY === 0) {
            setStartY(e.touches[0].pageY);
            setIsPulling(true);
        }
    }, []);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (!isPulling || isRefreshing) return;

        const currentY = e.touches[0].pageY;
        const diff = currentY - startY;

        if (diff > 0) {
            // Apply resistance
            const progress = Math.min(diff / threshold, 1.5);
            setPullProgress(progress);

            // Prevent scrolling while pulling
            if (diff > 10 && e.cancelable) {
                e.preventDefault();
            }
        } else {
            setIsPulling(false);
            setPullProgress(0);
        }
    }, [isPulling, isRefreshing, startY, threshold]);

    const handleTouchEnd = useCallback(async () => {
        if (!isPulling || isRefreshing) return;

        if (pullProgress >= 1) {
            setIsRefreshing(true);
            haptics.medium();

            try {
                await onRefresh();
            } finally {
                setIsRefreshing(false);
                setPullProgress(0);
            }
        } else {
            setPullProgress(0);
        }

        setIsPulling(false);
    }, [isPulling, isRefreshing, pullProgress, onRefresh]);

    useEffect(() => {
        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd);

        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

    return { isRefreshing, pullProgress };
};
