import { Recommendation } from "@/utils/recommendation/types";

export interface VisitedStats {
    total: number;
    visited: number;
    ratio: number;
    isComplete: boolean;
}

/**
 * Calculates visited statistics for a given set of recommendations.
 */
export const calculateVisitedStats = (items: any[]): VisitedStats => {
    if (!items || items.length === 0) {
        return { total: 0, visited: 0, ratio: 0, isComplete: false };
    }

    const total = items.length;
    const visited = items.filter((item) => item.visited).length;
    const ratio = visited / total;
    const isComplete = visited === total && total > 0;

    return { total, visited, ratio, isComplete };
};
