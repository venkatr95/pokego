'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';
import { useQuizStore } from '@/store/quiz-store';
import type { QuizQuestion } from '@/types/quiz';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(32, 'Name too long'),
});

type Form = z.infer<typeof schema>;

interface NameStepProps {
  question: QuizQuestion;
  onNext: () => void;
  onBack: () => void;
}

export function NameStep({ question, onNext, onBack }: NameStepProps) {
  const { answers, setName } = useQuizStore();

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { name: answers.name },
  });

  const onSubmit = ({ name }: Form) => {
    setName(name);
    onNext();
  };

  return (
    <div className="glass-card rounded-3xl p-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-16 h-16 rounded-2xl bg-brand-500/20 flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-brand-400" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">{question.question}</h2>
        <p className="text-foreground/50 text-sm">This will appear on your card</p>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <input
            {...register('name')}
            type="text"
            id="trainer-name"
            placeholder="Enter your trainer name..."
            autoComplete="given-name"
            autoFocus
            className="w-full bg-foreground/5 border border-white/10 rounded-xl px-5 py-4 text-foreground text-lg placeholder:text-foreground/30 focus:outline-none focus:border-brand-500/50 focus:bg-foreground/8 transition-all"
          />
          {errors.name && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm mt-2 ml-1"
            >
              {errors.name.message}
            </motion.p>
          )}
        </div>

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
            type="submit"
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            Continue
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
