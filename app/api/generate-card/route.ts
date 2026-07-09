import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getAllPokemon, getPokemonById } from '@/lib/pokemon';
import { matchPokemon } from '@/lib/personality-engine';
import { generateCard } from '@/lib/card-generator';
import { buildCardPrompt, generateFallbackAIData, AICardDataSchema } from '@/lib/ai/prompts';
import type { QuizAnswers } from '@/types/quiz';
import type { AICardData } from '@/types/card';

// Simple in-memory cache
export const cache = new Map<string, { card: ReturnType<typeof generateCard>; ts: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

function fingerprintAnswers(answers: QuizAnswers): string {
  return JSON.stringify([
    answers.name,
    answers.favoritePokemonId,
    answers.q1, answers.q2, answers.q3, answers.q4, answers.q5,
  ]);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const answers: QuizAnswers = body.answers;

    if (!answers?.name || !answers?.q1) {
      return NextResponse.json({ error: 'Invalid quiz answers' }, { status: 400 });
    }

    // Check cache
    const fingerprint = fingerprintAnswers(answers);
    const cached = cache.get(fingerprint);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return NextResponse.json({ card: cached.card, cached: true });
    }

    // Load Pokémon database
    const allPokemon = await getAllPokemon();
    if (!allPokemon.length) {
      return NextResponse.json({ error: 'Pokémon data not available' }, { status: 503 });
    }

    // Run personality matching
    const { profile, ranked, winner, favoriteWon } = matchPokemon(answers, allPokemon, 5);
    const matchScore = ranked[0].score;

    // Load buddy Pokémon
    const buddy = answers.favoritePokemonId
      ? await getPokemonById(answers.favoritePokemonId)
      : null;

    // Try AI generation (Gemini by default)
    let aiData: AICardData | null = null;
    const aiKey = process.env.GEMINI_API_KEY ?? process.env.OPENAI_API_KEY;

    if (aiKey) {
      try {
        const prompt = buildCardPrompt({ trainerName: answers.name, answers, profile, matchedPokemon: winner, buddy, favoriteWon });
        aiData = await callGemini(prompt, aiKey);
      } catch (e) {
        console.warn('AI generation failed, using fallback:', e);
      }
    }

    // Fallback
    if (!aiData) {
      aiData = generateFallbackAIData({ trainerName: answers.name, matchedPokemon: winner, buddy, profile, favoriteWon });
    }

    // Generate card
    const card = generateCard({
      trainerName: answers.name,
      answers,
      matchedPokemon: winner,
      buddy,
      profile,
      matchScore,
      favoriteWon,
      aiData,
      overrideRarity: aiData.rarity,
    });

    // Cache result
    cache.set(fingerprint, { card, ts: Date.now() });
    cache.set(card.id, { card, ts: Date.now() });

    return NextResponse.json({ card });
  } catch (error) {
    console.error('Generate card error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function callGemini(prompt: string, apiKey: string): Promise<AICardData> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json',
        },
      }),
    }
  );

  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  const parsed = JSON.parse(text);
  return AICardDataSchema.parse(parsed) as unknown as AICardData;
}
