'use client';

import { motion } from 'framer-motion';
import type { QuizStep } from '@/types/quiz';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface QuizProgressProps {
  current: number;
  total: number;
  stepId: QuizStep;
}

const STEP_LABELS: Record<QuizStep, string> = {
  'name':             'Your Name',
  'favorite-pokemon': 'Buddy Pokémon',
  'q1':               'Problem Solving',
  'q2':               'Your World',
  'q3':               'Motivation',
  'q4':               'Personality',
  'q5':               'Your Friends',
  'complete':         'Complete',
};

export function QuizProgress({ current, total, stepId }: QuizProgressProps) {
  const percent = (current / total) * 100;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <Link
          href="/"
          className="flex items-center gap-1 text-sm text-foreground/40 hover:text-foreground/70 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          PokéYou
        </Link>
        <div className="text-sm text-foreground/40">
          <span className="text-brand-400 font-semibold">{current}</span>
          <span> / {total}</span>
          <span className="ml-2 text-foreground/30">— {STEP_LABELS[stepId]}</span>
        </div>
      </div>

      <div className="quiz-progress">
        <motion.div
          className="quiz-progress-fill"
          initial={{ width: `${((current - 1) / total) * 100}%` }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {/* Step dots */}
      <div className="flex justify-between mt-3">
        {Array.from({ length: total }, (_, i) => (
          <motion.div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
              i < current ? 'bg-brand-400' : 'bg-foreground/20'
            }`}
            animate={i === current - 1 ? { scale: [1, 1.5, 1] } : {}}
            transition={{ duration: 0.4 }}
          />
        ))}
      </div>
    </div>
  );
}
