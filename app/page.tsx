import { Hero } from '@/components/landing/Hero';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PokéYou — Discover Your Pokémon Personality Profile',
  description: 'Take the ultimate Pokémon personality test. Answer questions, find your match, and generate a customized trading card based on your traits.',
};

export default function HomePage() {
  return <Hero />;
}
