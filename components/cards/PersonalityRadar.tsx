'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import type { GeneratedCard } from '@/types/card';

interface PersonalityRadarProps {
  card: GeneratedCard;
  size?: number;
  color?: string;
}

const TRAITS = [
  { key: 'adventureScore', label: 'Adventure', icon: '🗺️' },
  { key: 'courageScore', label: 'Courage', icon: '⚔️' },
  { key: 'intelligenceScore', label: 'Intelligence', icon: '🧠' },
  { key: 'teamworkScore', label: 'Teamwork', icon: '🤝' },
  { key: 'creativityScore', label: 'Creativity', icon: '🎨' },
  { key: 'determinationScore', label: 'Determination', icon: '💪' },
] as const;

function polarToCartesian(cx: number, cy: number, r: number, angleIndex: number, total: number) {
  const angle = (Math.PI * 2 * angleIndex) / total - Math.PI / 2;
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  };
}

function buildPolygonPath(cx: number, cy: number, values: number[], maxR: number) {
  const n = values.length;
  return values
    .map((v, i) => {
      const r = (v / 100) * maxR;
      const pt = polarToCartesian(cx, cy, r, i, n);
      return `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(2)},${pt.y.toFixed(2)}`;
    })
    .join(' ') + ' Z';
}

export function PersonalityRadar({ card, size = 260, color = '#6366f1' }: PersonalityRadarProps) {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true });

  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 32;
  const n = TRAITS.length;

  // Normalize scores to 0-100
  const rawValues = TRAITS.map(({ key }) => {
    const raw = (card as unknown as Record<string, unknown>)[key];
    return typeof raw === 'number' ? Math.min(100, Math.max(0, raw)) : 50;
  });

  const rings = [0.25, 0.5, 0.75, 1.0];

  const dataPath = buildPolygonPath(cx, cy, rawValues, maxR);

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
      >
        <defs>
          <radialGradient id="radar-fill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </radialGradient>
          <filter id="radar-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background rings */}
        {rings.map((ring) => {
          const ringPath = buildPolygonPath(cx, cy, Array(n).fill(ring * 100), maxR);
          return (
            <path
              key={ring}
              d={ringPath}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />
          );
        })}

        {/* Axis lines */}
        {TRAITS.map((_, i) => {
          const pt = polarToCartesian(cx, cy, maxR, i, n);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={pt.x}
              y2={pt.y}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />
          );
        })}

        {/* Data area */}
        <motion.path
          d={dataPath}
          fill="url(#radar-fill)"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
          filter="url(#radar-glow)"
          initial={{ opacity: 0, scale: 0.3 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.3 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />

        {/* Data points */}
        {rawValues.map((v, i) => {
          const r = (v / 100) * maxR;
          const pt = polarToCartesian(cx, cy, r, i, n);
          return (
            <motion.circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r="4"
              fill={color}
              stroke="white"
              strokeWidth="1.5"
              initial={{ opacity: 0, scale: 0 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
              transition={{ duration: 0.4, delay: 0.6 + i * 0.08 }}
              style={{ transformOrigin: `${pt.x}px ${pt.y}px` }}
            />
          );
        })}

        {/* Labels */}
        {TRAITS.map((trait, i) => {
          const pt = polarToCartesian(cx, cy, maxR + 20, i, n);
          return (
            <g key={trait.key}>
              <text
                x={pt.x}
                y={pt.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="9"
                fill="rgba(255,255,255,0.5)"
                fontFamily="Space Grotesk, sans-serif"
              >
                {trait.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-2 w-full">
        {TRAITS.map(({ key, label, icon }, i) => {
          const v = rawValues[i];
          return (
            <motion.div
              key={key}
              className="flex items-center gap-1.5"
              initial={{ opacity: 0, x: -10 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
              transition={{ delay: 0.4 + i * 0.07 }}
            >
              <span className="text-sm">{icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] text-foreground/40 truncate">{label}</p>
                <div className="h-1 bg-foreground/10 rounded-full mt-0.5">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: color }}
                    initial={{ width: 0 }}
                    animate={isInView ? { width: `${v}%` } : { width: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 + i * 0.08 }}
                  />
                </div>
              </div>
              <span className="text-[9px] text-foreground/60 w-6 text-right">{v}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
