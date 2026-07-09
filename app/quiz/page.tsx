'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuizStore } from '@/store/quiz-store';

export default function QuizIndexPage() {
  const router = useRouter();
  const { currentStep } = useQuizStore();

  useEffect(() => {
    if (currentStep === 'complete') {
      router.replace('/card');
    } else {
      router.replace(`/quiz/${currentStep}`);
    }
  }, [currentStep, router]);

  return null;
}
