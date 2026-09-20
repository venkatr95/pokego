export type QuizStep =
  | 'name'
  | 'favorite-pokemon'
  | 'q1'
  | 'q2'
  | 'q3'
  | 'q4'
  | 'q5'
  | 'complete';

export interface QuizOption {
  id: string;
  label: string;
  icon?: string;
}

export interface QuizAnswers {
  name: string;
  favoritePokemonId: number | null;
  favoritePokemonName: string | null;
  q1: string | null;
  q2: string | null;
  q3: string | null;
  q4: string | null;
  q5: string | null;
}

export const QUIZ_STEPS: QuizStep[] = [
  'name',
  'favorite-pokemon',
  'q1',
  'q2',
  'q3',
  'q4',
  'q5',
  'complete',
];

export const QUIZ_COPY: Record<
  Exclude<QuizStep, 'complete'>,
  { question: string; type: 'text' | 'pokemon-search' | 'choice'; options?: QuizOption[] }
> = {
  name: { question: "What's your Trainer name?", type: 'text' },
  'favorite-pokemon': { question: 'Choose your Buddy Pokémon', type: 'pokemon-search' },
  q1: {
    question: 'How do you solve problems?',
    type: 'choice',
    options: [
      { id: 'carefully', label: 'Carefully', icon: '🧠' },
      { id: 'instinctively', label: 'Instinctively', icon: '⚡' },
      { id: 'collaboratively', label: 'Collaboratively', icon: '🤝' },
      { id: 'experimentally', label: 'Experimentally', icon: '🔬' },
    ],
  },
  q2: {
    question: 'Where would you rather live?',
    type: 'choice',
    options: [
      { id: 'ocean', label: 'Ocean', icon: '🌊' },
      { id: 'mountains', label: 'Mountains', icon: '🏔️' },
      { id: 'forest', label: 'Forest', icon: '🌲' },
      { id: 'city', label: 'City', icon: '🏙️' },
      { id: 'sky', label: 'Sky', icon: '☁️' },
    ],
  },
  q3: {
    question: 'What motivates you most?',
    type: 'choice',
    options: [
      { id: 'adventure', label: 'Adventure', icon: '🗺️' },
      { id: 'knowledge', label: 'Knowledge', icon: '📚' },
      { id: 'friendship', label: 'Friendship', icon: '💞' },
      { id: 'power', label: 'Power', icon: '💪' },
      { id: 'protecting', label: 'Protecting others', icon: '🛡️' },
    ],
  },
  q4: {
    question: 'Which personality fits you best?',
    type: 'choice',
    options: [
      { id: 'calm', label: 'Calm', icon: '😌' },
      { id: 'energetic', label: 'Energetic', icon: '⚡' },
      { id: 'curious', label: 'Curious', icon: '🔍' },
      { id: 'loyal', label: 'Loyal', icon: '🤝' },
      { id: 'competitive', label: 'Competitive', icon: '🏆' },
    ],
  },
  q5: {
    question: 'Your friends would describe you as...',
    type: 'choice',
    options: [
      { id: 'funny', label: 'Funny', icon: '😄' },
      { id: 'brave', label: 'Brave', icon: '⚔️' },
      { id: 'reliable', label: 'Reliable', icon: '🔒' },
      { id: 'creative', label: 'Creative', icon: '🎨' },
      { id: 'kind', label: 'Kind', icon: '💖' },
    ],
  },
};

export const initialAnswers: QuizAnswers = {
  name: '',
  favoritePokemonId: null,
  favoritePokemonName: null,
  q1: null,
  q2: null,
  q3: null,
  q4: null,
  q5: null,
};
