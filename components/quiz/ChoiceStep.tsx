'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuizStore } from '@/store/quiz-store';
import type { QuizQuestion, QuizAnswers } from '@/types/quiz';

interface ChoiceStepProps {
  question: QuizQuestion;
  onNext: () => void;
  onBack: () => void;
}

const QUESTION_ICONS: Record<string, string> = {
  q1: '🧩', q2: '🌍', q3: '⭐', q4: '🎭', q5: '💬',
};

export function ChoiceStep({ question, onNext, onBack }: ChoiceStepProps) {
  const { answers, setAnswer } = useQuizStore();
  const currentValue = answers[question.id as keyof Pick<QuizAnswers, 'q1' | 'q2' | 'q3' | 'q4' | 'q5'>];
  const [selected, setSelected] = useState<string | null>(currentValue);
  const [error, setError] = useState('');

  const handleSelect = (optionId: string) => {
    setSelected(optionId);
    setError('');
    setAnswer(
      question.id as keyof Pick<QuizAnswers, 'q1' | 'q2' | 'q3' | 'q4' | 'q5'>,
      optionId,
    );
  };

  const handleNext = () => {
    if (!selected) {
      setError('Please select an option to continue');
      return;
    }
    onNext();
  };

  return (
    <div className="glass-card rounded-3xl p-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-16 h-16 rounded-2xl bg-brand-500/20 flex items-center justify-center mx-auto mb-4 text-3xl">
          {QUESTION_ICONS[question.id] ?? '❓'}
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">{question.question}</h2>
        <p className="text-foreground/50 text-sm">Choose the one that feels most like you</p>
      </motion.div>

      <div className="space-y-3 mb-6">
        {question.options?.map((option, i) => (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            onClick={() => handleSelect(option.id)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border text-left transition-all duration-200 group ${
              selected === option.id
                ? 'bg-brand-500/20 border-brand-500/60 shadow-[0_0_20px_rgba(91,110,247,0.25)]'
                : 'glass border-white/10 hover:border-white/20 hover:bg-foreground/5'
            }`}
          >
            {/* Icon */}
            <span className="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
              {option.icon}
            </span>

            {/* Label */}
            <span className={`font-semibold text-base transition-colors ${
              selected === option.id ? 'text-foreground' : 'text-foreground/70 group-hover:text-foreground'
            }`}>
              {option.label}
            </span>

            {/* Selection indicator */}
            <div className="ml-auto flex-shrink-0">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                selected === option.id
                  ? 'border-brand-400 bg-brand-400'
                  : 'border-white/20'
              }`}>
                {selected === option.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 bg-foreground rounded-full"
                  />
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-sm mb-4 ml-1"
        >
          {error}
        </motion.p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 px-5 py-3 rounded-xl glass border border-white/10 text-foreground/60 hover:text-foreground hover:border-white/20 transition-all text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
          disabled={!selected}
        >
          Continue
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
