'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizStore } from '@/store/quiz-store';
import { QUIZ_QUESTIONS } from '@/types/quiz';
import { NameStep } from '@/components/quiz/NameStep';
import { PokemonSearchStep } from '@/components/quiz/PokemonSearchStep';
import { ChoiceStep } from '@/components/quiz/ChoiceStep';
import { QuizProgress } from '@/components/quiz/QuizProgress';
import type { QuizStep } from '@/types/quiz';

const STEP_COMPONENTS: Record<string, React.ComponentType<{ question: (typeof QUIZ_QUESTIONS)[0]; onNext: () => void; onBack: () => void }>> = {
  name:             NameStep as any,
  'favorite-pokemon': PokemonSearchStep as any,
  q1: ChoiceStep as any,
  q2: ChoiceStep as any,
  q3: ChoiceStep as any,
  q4: ChoiceStep as any,
  q5: ChoiceStep as any,
};

const STEPS: QuizStep[] = ['name', 'favorite-pokemon', 'q1', 'q2', 'q3', 'q4', 'q5'];

export default function QuizStepPage() {
  const params = useParams();
  const router = useRouter();
  const stepId = params?.step as string;
  const { setStep, nextStep, prevStep } = useQuizStore();

  const questionIndex = STEPS.indexOf(stepId as QuizStep);
  const question = QUIZ_QUESTIONS.find((q) => q.id === stepId);

  // Sync URL to store
  useEffect(() => {
    if (STEPS.includes(stepId as QuizStep)) {
      setStep(stepId as QuizStep);
    }
  }, [stepId, setStep]);

  if (!question || !STEPS.includes(stepId as QuizStep)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-foreground/60">Invalid step. <button onClick={() => router.push('/quiz')} className="text-brand-400 hover:underline">Restart</button></p>
      </div>
    );
  }

  const handleNext = () => {
    const nextIndex = questionIndex + 1;
    if (nextIndex >= STEPS.length) {
      // All questions answered — go to generating
      router.push('/generating');
    } else {
      router.push(`/quiz/${STEPS[nextIndex]}`);
    }
    nextStep();
  };

  const handleBack = () => {
    if (questionIndex > 0) {
      router.push(`/quiz/${STEPS[questionIndex - 1]}`);
      prevStep();
    } else {
      router.push('/');
    }
  };

  const Component = STEP_COMPONENTS[stepId];

  return (
    <div className="min-h-screen bg-[#0a0b0f] flex flex-col items-center justify-center px-6 pt-20">
      {/* Gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-brand-600/15 rounded-full blur-[80px]" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-purple-600/15 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 w-full max-w-xl">
        {/* Progress */}
        <QuizProgress
          current={questionIndex + 1}
          total={STEPS.length}
          stepId={stepId as QuizStep}
        />

        {/* Animated step */}
        <AnimatePresence mode="wait">
          <motion.div
            key={stepId}
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -60, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <Component
              question={question}
              onNext={handleNext}
              onBack={handleBack}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
