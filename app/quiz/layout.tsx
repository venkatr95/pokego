import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Take the Pokémon Personality Quiz | PokéYou',
  description: 'Answer 5 fun questions to discover your Pokémon match. Get a customized, AI-generated Pokémon trading card featuring your personality profile.',
};

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
