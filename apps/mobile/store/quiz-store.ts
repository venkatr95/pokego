import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  initialAnswers,
  QUIZ_STEPS,
  type QuizAnswers,
  type QuizStep,
} from '../lib/quiz-data';

export interface MobileCardResult {
  id: string;
  cardNumber: string;
  trainerName: string;
  rarity: string;
  matchedPokemon: {
    id: number;
    name: string;
    displayName: string;
    types: string[];
    sprites?: { official_artwork?: string | null; front_default?: string | null };
    isLegendary?: boolean;
    isMythical?: boolean;
  };
  buddy?: { id: number; displayName: string } | null;
  matchScore: number;
  favoriteWon: boolean;
  xpLevel: number;
  personality?: {
    dominantTraits: string[];
    battleStyle: string;
    trainerArchetype: string;
  };
  aiData?: {
    personalitySummary?: string;
    motivationalQuote?: string;
    trainerTitle?: string;
  } | null;
  generatedAt: string;
}

interface QuizState {
  currentStep: QuizStep;
  answers: QuizAnswers;
  isGenerating: boolean;
  error: string | null;
  card: MobileCardResult | null;

  setName: (name: string) => void;
  setFavorite: (id: number | null, name: string | null) => void;
  setAnswer: (q: 'q1' | 'q2' | 'q3' | 'q4' | 'q5', value: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  setStep: (step: QuizStep) => void;
  setGenerating: (v: boolean) => void;
  setError: (e: string | null) => void;
  setCard: (card: MobileCardResult | null) => void;
  reset: () => void;
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      currentStep: 'name',
      answers: initialAnswers,
      isGenerating: false,
      error: null,
      card: null,

      setName: (name) => set((s) => ({ answers: { ...s.answers, name } })),
      setFavorite: (id, name) =>
        set((s) => ({
          answers: {
            ...s.answers,
            favoritePokemonId: id,
            favoritePokemonName: name,
          },
        })),
      setAnswer: (q, value) => set((s) => ({ answers: { ...s.answers, [q]: value } })),
      setStep: (currentStep) => set({ currentStep }),
      nextStep: () => {
        const idx = QUIZ_STEPS.indexOf(get().currentStep);
        if (idx < QUIZ_STEPS.length - 1) set({ currentStep: QUIZ_STEPS[idx + 1] });
      },
      prevStep: () => {
        const idx = QUIZ_STEPS.indexOf(get().currentStep);
        if (idx > 0) set({ currentStep: QUIZ_STEPS[idx - 1] });
      },
      setGenerating: (isGenerating) => set({ isGenerating }),
      setError: (error) => set({ error }),
      setCard: (card) => set({ card }),
      reset: () =>
        set({
          currentStep: 'name',
          answers: initialAnswers,
          isGenerating: false,
          error: null,
          card: null,
        }),
    }),
    {
      name: 'pokeyou-mobile-quiz',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        currentStep: s.currentStep,
        answers: s.answers,
        card: s.card,
      }),
    }
  )
);
