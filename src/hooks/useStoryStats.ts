import { useState, useEffect, useCallback } from 'react';
import { calculateTravelStats, TravelStoryStats } from '@/utils/story/stats-calculator';

export function useStoryStats() {
  const [stats, setStats] = useState<TravelStoryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    setIsLoading(true);
    // Small delay to allow UI to show loading state
    requestAnimationFrame(() => {
      const calculated = calculateTravelStats();
      setStats(calculated);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    refresh();

    // Listen for data changes
    const handleDataChange = () => refresh();

    window.addEventListener('recommendationAdded', handleDataChange);
    window.addEventListener('recommendationDeleted', handleDataChange);
    window.addEventListener('recommendationUpdated', handleDataChange);
    window.addEventListener('recommendationVisited', handleDataChange);
    window.addEventListener('collectionUpdated', handleDataChange);
    window.addEventListener('routeUpdated', handleDataChange);

    return () => {
      window.removeEventListener('recommendationAdded', handleDataChange);
      window.removeEventListener('recommendationDeleted', handleDataChange);
      window.removeEventListener('recommendationUpdated', handleDataChange);
      window.removeEventListener('recommendationVisited', handleDataChange);
      window.removeEventListener('collectionUpdated', handleDataChange);
      window.removeEventListener('routeUpdated', handleDataChange);
    };
  }, [refresh]);

  return { stats, isLoading, refresh };
}
