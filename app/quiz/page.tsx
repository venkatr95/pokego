'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuizStore } from '@/store/quiz-store';

export default function QuizIndexPage() {
  const router = useRouter();
  const { currentStep, resetQuiz } = useQuizStore();

  useEffect(() => {
    if (currentStep === 'complete') {
      resetQuiz();
      router.replace('/quiz/name');
    } else {
      router.replace(`/quiz/${currentStep}`);
    }
  }, [currentStep, resetQuiz, router]);

  return null;
}
