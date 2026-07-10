import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Global Trainer Leaderboard | PokéYou',
  description: 'See the top-ranked Pokémon trainers from around the world. Compete for the highest XP, compare your unique generated cards, and climb the ranks!',
};

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
