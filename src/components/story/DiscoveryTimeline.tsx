import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import { TravelStoryStats, getCountryFlag } from '@/utils/story/stats-calculator';

interface Props {
  stats: TravelStoryStats;
}

export function DiscoveryTimeline({ stats }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { discoveryTimeline } = stats;

  if (discoveryTimeline.length === 0) return null;

  // Group by month
  const groups: { key: string; label: string; entries: typeof discoveryTimeline }[] = [];
  const seen = new Map<string, number>();

  discoveryTimeline.forEach(entry => {
    const date = new Date(entry.dateAdded);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const label = `${date.toLocaleString('default', { month: 'long' }).toUpperCase()}  ${date.getFullYear()}`;
    if (!seen.has(key)) {
      seen.set(key, groups.length);
      groups.push({ key, label, entries: [] });
    }
    groups[seen.get(key)!].entries.push(entry);
  });

  const visibleGroups = expanded ? groups : groups.slice(0, 2);
  const hiddenMonths = groups.length - 2;

  return (
    <div className="mb-3">
      <div className="bg-neutral-50 dark:bg-neutral-900/60 rounded-2xl overflow-hidden">
        <div className="px-5 pt-5 pb-4">
          <p className="text-muted-foreground/60 font-semibold uppercase" style={{ fontSize: '10px', letterSpacing: '0.14em' }}>
            Your Journey
          </p>
        </div>

        <AnimatePresence initial={false}>
          {visibleGroups.map((group, groupIndex) => (
            <motion.div
              key={group.key}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
            >
              {/* Month header */}
              <div className="px-5 py-2.5 flex items-center justify-between border-t border-neutral-200 dark:border-white/[0.06]">
                <p className="text-foreground/80 font-semibold" style={{ fontSize: '12px', letterSpacing: '0.06em' }}>
                  {group.label}
                </p>
                <span className="text-muted-foreground/50 tabular-nums" style={{ fontSize: '11px' }}>
                  {group.entries.length} {group.entries.length === 1 ? 'place' : 'places'}
                </span>
              </div>

              {/* Entries */}
              <div>
                {group.entries.slice(0, expanded ? group.entries.length : 3).map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: groupIndex * 0.05 + i * 0.03 }}
                    className="flex items-center gap-3 px-5 py-3 border-t border-neutral-100 dark:border-white/[0.04]"
                  >
                    {/* Visited dot */}
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        entry.visited
                          ? 'bg-emerald-500'
                          : 'bg-neutral-200 dark:bg-white/10'
                      }`}
                    >
                      {entry.visited && <Check className="w-3 h-3 text-white" strokeWidth={2.5} />}
                    </div>

                    {/* Place info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate leading-tight">{entry.name}</p>
                      <p className="text-muted-foreground/60 truncate mt-0.5" style={{ fontSize: '11px' }}>
                        {getCountryFlag(entry.country)} {entry.city}
                      </p>
                    </div>
                  </motion.div>
                ))}

                {!expanded && group.entries.length > 3 && (
                  <p className="px-5 py-2.5 text-muted-foreground/45 border-t border-neutral-100 dark:border-white/[0.04]" style={{ fontSize: '11px' }}>
                    +{group.entries.length - 3} more this month
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Expand / collapse */}
        {groups.length > 2 && (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-1.5 py-3.5 border-t border-neutral-200 dark:border-white/[0.06] text-muted-foreground/60"
            style={{ fontSize: '12px' }}
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                {hiddenMonths} more {hiddenMonths === 1 ? 'month' : 'months'}
              </>
            )}
          </motion.button>
        )}
      </div>
    </div>
  );
}
