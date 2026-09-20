import type { Metadata } from 'next';
import { PokemonGoSubNav } from '@/components/pokemon-go/SubNav';

export const metadata: Metadata = {
  title: 'Pokémon GO Collector & Goals',
  description:
    'Track your Pokémon GO Pokédex, evolutions, forms, and next goals. Collection data stays on your device.',
};

export default function PokemonGoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background pt-16 pb-16">
      <PokemonGoSubNav />
      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-6">{children}</div>
    </div>
  );
}
