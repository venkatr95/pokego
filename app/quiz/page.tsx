'use client';

import Link from 'next/link';
import { QuizForm } from '@/components/quiz/QuizForm';

export default function QuizPage() {
  return (
    <div className="min-h-screen bg-background pt-20 sm:pt-24 pb-4 sm:pb-16 px-3 sm:px-6">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-48 sm:w-64 h-48 sm:h-64 bg-brand-600/15 rounded-full blur-[80px]" />
        <div className="absolute bottom-1/4 right-1/4 w-48 sm:w-64 h-48 sm:h-64 bg-purple-600/15 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto space-y-4 sm:space-y-6">
        <header className="text-center space-y-1.5 sm:space-y-2 px-1">
          <p className="text-sm text-muted-foreground">
            <Link
              href="/"
              className="inline-flex min-h-10 items-center hover:text-foreground transition-colors"
            >
              ← Home
            </Link>
          </p>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-tight">
            Pokémon Personality Quiz
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
            Answer everything on this page — then generate your custom card.
          </p>
        </header>

        <QuizForm />
      </div>
    </div>
  );
}
