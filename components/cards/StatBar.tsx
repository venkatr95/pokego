'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { getStatPercent, getStatColor } from '@/lib/pokemon';
import type { PokemonStat } from '@/types/pokemon';

interface StatBarProps {
  stat: PokemonStat;
  typeTheme: { primary: string; secondary: string; bg: string; text: string; glow: string };
  compact?: boolean;
  segmented?: boolean;
  dots?: boolean;
}

const STAT_LABELS: Record<string, string> = {
  hp: 'HP', attack: 'ATK', defense: 'DEF',
  'special-attack': 'SPC.ATK', 'special-defense': 'SPC.DEF', speed: 'SPD',
};

const SEGMENT_COUNT = 10;
const DOT_COUNT = 8;

export function StatBar({ stat, typeTheme, compact = false, segmented = false, dots = false }: StatBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const percent = getStatPercent(stat.base_stat);
  const color = getStatColor(stat.base_stat);
  const activeSegments = Math.round((percent / 100) * SEGMENT_COUNT);
  const activeDots = Math.round((percent / 100) * DOT_COUNT);

  return (
    <div ref={ref} className={`flex items-center gap-2 ${compact ? 'h-3.5' : 'h-5'}`}>
      {/* Label */}
      <span
        className="text-foreground/40 font-mono text-right flex-shrink-0"
        style={{ fontSize: compact ? '8px' : '10px', width: compact ? '42px' : '55px' }}
      >
        {STAT_LABELS[stat.name] ?? stat.name.toUpperCase()}
      </span>

      {/* Value */}
      <span
        className="text-foreground/70 font-semibold text-right flex-shrink-0"
        style={{ fontSize: compact ? '8px' : '10px', width: compact ? '22px' : '28px' }}
      >
        {stat.base_stat}
      </span>

      {/* Bar track — three modes */}
      {dots ? (
        <div className="flex gap-0.5 flex-1">
          {Array.from({ length: DOT_COUNT }).map((_, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-full"
              style={{ height: '6px' }}
              initial={{ opacity: 0, scale: 0 }}
              animate={isInView ? {
                opacity: 1,
                scale: 1,
                background: i < activeDots
                  ? `linear-gradient(90deg, ${typeTheme.primary}, ${color})`
                  : 'rgba(255,255,255,0.1)',
              } : { opacity: 0, scale: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            />
          ))}
        </div>
      ) : segmented ? (
        <div className="flex gap-0.5 flex-1">
          {Array.from({ length: SEGMENT_COUNT }).map((_, i) => (
            <motion.div
              key={i}
              className="flex-1"
              style={{ height: '6px', borderRadius: '2px' }}
              initial={{ scaleY: 0, opacity: 0 }}
              animate={isInView ? {
                scaleY: 1,
                opacity: 1,
                background: i < activeSegments
                  ? `linear-gradient(90deg, ${typeTheme.primary}, ${color})`
                  : 'rgba(255,255,255,0.1)',
              } : { scaleY: 0, opacity: 0 }}
              transition={{ duration: 0.2, delay: i * 0.04 }}
            />
          ))}
        </div>
      ) : (
        <div className="stat-bar-track flex-1">
          <motion.div
            className="stat-bar-fill"
            initial={{ width: '0%' }}
            animate={isInView ? { width: `${percent}%` } : { width: '0%' }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            style={{
              background: `linear-gradient(90deg, ${typeTheme.primary}, ${color})`,
              boxShadow: `0 0 6px ${typeTheme.glow}`,
            }}
          />
        </div>
      )}
    </div>
  );
}
