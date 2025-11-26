import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import { TravelStoryStats, getSourceIcon, getCountryFlag } from '@/utils/story/stats-calculator';

interface Props {
  stats: TravelStoryStats;
}

export function DiscoveryTimeline({ stats }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { discoveryTimeline, monthlyDiscoveries } = stats;

  if (discoveryTimeline.length === 0) {
    return null;
  }

  // Group discoveries by month
  const groupedByMonth = new Map<string, typeof discoveryTimeline>();
  discoveryTimeline.forEach(entry => {
    const date = new Date(entry.dateAdded);
    const key = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
    if (!groupedByMonth.has(key)) {
      groupedByMonth.set(key, []);
    }
    groupedByMonth.get(key)!.push(entry);
  });

  const monthGroups = Array.from(groupedByMonth.entries());
  const displayGroups = expanded ? monthGroups : monthGroups.slice(0, 2);

  return (
    <div className="mb-6">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">📅</span>
        <h3 className="text-lg font-semibold text-foreground">Discovery Timeline</h3>
      </div>

      {/* Monthly summary pills */}
      <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide mb-4">
        {monthlyDiscoveries.slice(0, 6).map((month, i) => (
          <motion.div
            key={month.monthYear}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="flex-shrink-0 px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800"
          >
            <p className="text-xs text-muted-foreground whitespace-nowrap">{month.monthYear}</p>
            <p className="text-lg font-bold text-foreground">{month.count}</p>
          </motion.div>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div
          className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500/50 to-transparent"
          style={{ height: expanded ? '100%' : '200px' }}
        />

        {displayGroups.map(([monthKey, entries], groupIndex) => (
          <div key={monthKey} className="mb-6">
            {/* Month header */}
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold z-10"
                style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
              >
                {entries.length}
              </div>
              <h4 className="font-semibold text-sm text-foreground">{monthKey}</h4>
            </div>

            {/* Entries */}
            <div className="space-y-2 ml-9">
              {entries.slice(0, expanded ? entries.length : 3).map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: groupIndex * 0.1 + i * 0.03 }}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/50"
                >
                  {/* Visited indicator */}
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      entry.visited
                        ? 'bg-green-500'
                        : 'bg-neutral-200 dark:bg-neutral-700'
                    }`}
                  >
                    {entry.visited && <Check className="w-3 h-3 text-white" />}
                  </div>

                  {/* Place info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{entry.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {getCountryFlag(entry.country)} {entry.city}
                    </p>
                  </div>

                  {/* Source badge */}
                  {entry.source && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800">
                      <span className="text-xs">{getSourceIcon(entry.source.type)}</span>
                      <span className="text-[10px] text-muted-foreground truncate max-w-[60px]">
                        {entry.source.name.split(' ')[0]}
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Show more for this month */}
              {!expanded && entries.length > 3 && (
                <p className="text-xs text-muted-foreground pl-2">
                  +{entries.length - 3} more this month
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Expand/collapse button */}
      {monthGroups.length > 2 && (
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setExpanded(!expanded)}
          className="w-full py-3 flex items-center justify-center gap-2 text-sm text-muted-foreground rounded-xl bg-neutral-100 dark:bg-neutral-800/50"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Show {monthGroups.length - 2} more months
            </>
          )}
        </motion.button>
      )}
    </div>
  );
}
