'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QuizAnswers, QuizStep } from '@/types/quiz';
import type { GeneratedCard } from '@/types/card';
import type { Pokemon } from '@/types/pokemon';
import type { CardThemeId } from '@/components/cards/themes';
import type { EnvironmentTheme } from '@/components/cards/themes/backgrounds';

interface QuizState {
  currentStep: QuizStep;
  answers: QuizAnswers;
  generatedCard: GeneratedCard | null;
  isGenerating: boolean;
  error: string | null;
  selectedTheme: CardThemeId;
  selectedEnvironment: EnvironmentTheme | null;

  // Actions
  setStep: (step: QuizStep) => void;
  setName: (name: string) => void;
  setFavoritePokemon: (pokemon: Pokemon | null) => void;
  setAnswer: (question: keyof Pick<QuizAnswers, 'q1' | 'q2' | 'q3' | 'q4' | 'q5'>, answer: string) => void;
  setGeneratedCard: (card: GeneratedCard) => void;
  setGenerating: (generating: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedTheme: (theme: CardThemeId) => void;
  setSelectedEnvironment: (env: EnvironmentTheme | null) => void;
  resetQuiz: () => void;
  nextStep: () => void;
  prevStep: () => void;
}

const STEPS: QuizStep[] = ['name', 'favorite-pokemon', 'q1', 'q2', 'q3', 'q4', 'q5', 'complete'];

const initialAnswers: QuizAnswers = {
  name: '',
  favoritePokemonId: null,
  favoritePokemonName: null,
  q1: null,
  q2: null,
  q3: null,
  q4: null,
  q5: null,
};

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      currentStep: 'name',
      answers: initialAnswers,
      generatedCard: null,
      isGenerating: false,
      error: null,
      selectedTheme: 'ex',
      selectedEnvironment: null,

      setStep: (step) => set({ currentStep: step }),

      setName: (name) =>
        set((state) => ({ answers: { ...state.answers, name } })),

      setFavoritePokemon: (pokemon) =>
        set((state) => ({
          answers: {
            ...state.answers,
            favoritePokemonId: pokemon?.id ?? null,
            favoritePokemonName: pokemon?.displayName ?? null,
          },
        })),

      setAnswer: (question, answer) =>
        set((state) => ({ answers: { ...state.answers, [question]: answer } })),

      setGeneratedCard: (card) => set({ generatedCard: card }),

      setGenerating: (isGenerating) => set({ isGenerating }),

      setError: (error) => set({ error }),

      setSelectedTheme: (selectedTheme) => set({ selectedTheme }),

      setSelectedEnvironment: (selectedEnvironment) => set({ selectedEnvironment }),

      resetQuiz: () =>
        set({
          currentStep: 'name',
          answers: initialAnswers,
          generatedCard: null,
          isGenerating: false,
          error: null,
          selectedTheme: 'ex',
          selectedEnvironment: null,
        }),

      nextStep: () => {
        const { currentStep } = get();
        const idx = STEPS.indexOf(currentStep);
        if (idx < STEPS.length - 1) {
          set({ currentStep: STEPS[idx + 1] });
        }
      },

      prevStep: () => {
        const { currentStep } = get();
        const idx = STEPS.indexOf(currentStep);
        if (idx > 0) {
          set({ currentStep: STEPS[idx - 1] });
        }
      },
    }),
    {
      name: 'pokeyou-quiz-store',
      partialize: (state) => ({
        answers: state.answers,
        generatedCard: state.generatedCard,
        currentStep: state.currentStep,
        selectedTheme: state.selectedTheme,
        selectedEnvironment: state.selectedEnvironment,
      }),
    }
  )
);
