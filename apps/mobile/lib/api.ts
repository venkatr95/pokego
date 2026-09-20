import { WEB_URL } from './config';
import type { QuizAnswers } from './quiz-data';
import type { MobileCardResult } from '../store/quiz-store';

export interface PokemonSearchHit {
  id: number;
  name: string;
  displayName: string;
  types: string[];
  primaryType: string;
  sprite: string | null;
}

export async function searchPokemon(q: string, limit = 20): Promise<PokemonSearchHit[]> {
  const url = `${WEB_URL}/api/pokemon?q=${encodeURIComponent(q)}&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Pokémon search unavailable');
  const data = await res.json();
  return Array.isArray(data) ? data : data.results ?? [];
}

export async function generateCardFromAnswers(
  answers: QuizAnswers
): Promise<MobileCardResult> {
  const res = await fetch(`${WEB_URL}/api/generate-card`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Card generation failed (${res.status})`);
  }
  const data = await res.json();
  return data.card as MobileCardResult;
}
