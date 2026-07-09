/**
 * Unit tests for the Personality Matching Engine
 */

import {
  buildPersonalityProfile,
  calculateRarity,
  calculateXP,
  calculateFriendship,
  calculateDerivedStats,
} from '../lib/personality-engine';
import type { QuizAnswers } from '../types/quiz';

// ── Test helpers ─────────────────────────────────────────────────────────────
const baseAnswers: QuizAnswers = {
  name: 'Ash',
  favoritePokemonId: null,
  favoritePokemonName: null,
  q1: null,
  q2: null,
  q3: null,
  q4: null,
  q5: null,
};

// ── buildPersonalityProfile tests ────────────────────────────────────────────
describe('buildPersonalityProfile', () => {
  test('returns zero traits for empty answers', () => {
    const profile = buildPersonalityProfile(baseAnswers);
    const traitSum = Object.values(profile.traits).reduce((a, b) => a + b, 0);
    expect(traitSum).toBe(0);
  });

  test('correctly accumulates brave traits from brave-heavy answers', () => {
    const answers: QuizAnswers = {
      ...baseAnswers,
      q1: 'instinctively', // brave+3, energetic+2, adventurous+2
      q2: 'sky',           // adventurous+3, brave+2, curious+2
      q3: 'adventure',     // adventurous+3, brave+2, curious+2
      q4: 'competitive',   // competitive+3, determined+2, powerful+2
      q5: 'brave',         // brave+3, determined+2, powerful+2
    };
    const profile = buildPersonalityProfile(answers);
    // brave: 3+2+2+3 = 10
    expect(profile.traits.brave).toBe(10);
    expect(profile.dominantTraits[0]).toBe('adventurous');
  });

  test('correctly identifies calm/strategic profile', () => {
    const answers: QuizAnswers = {
      ...baseAnswers,
      q1: 'carefully',  // strategic+3, calm+2, knowledgeable+2
      q2: 'ocean',      // calm+3, mysterious+2, adventurous+2
      q3: 'knowledge',  // knowledgeable+3, curious+2, strategic+2
      q4: 'calm',       // calm+3, stoic+2, strategic+2
      q5: 'reliable',   // reliable+3, loyal+2, protective+2
    };
    const profile = buildPersonalityProfile(answers);
    // calm: 2+3+3 = 8, strategic: 3+2+2 = 7
    expect(profile.traits.calm).toBe(8);
    expect(profile.traits.strategic).toBe(7);
    expect(profile.battleStyle).toBe('Defensive');
  });

  test('identifies social/kind profile', () => {
    const answers: QuizAnswers = {
      ...baseAnswers,
      q1: 'collaboratively', // social+3, loyal+2, kind+2
      q2: 'forest',          // protective+3, loyal+2, kind+2
      q3: 'friendship',      // loyal+3, kind+3, social+2
      q4: 'loyal',           // loyal+3, protective+2, reliable+2
      q5: 'kind',            // kind+3, social+2, loyal+2
    };
    const profile = buildPersonalityProfile(answers);
    // loyal: 2+2+3+3+2 = 12
    expect(profile.traits.loyal).toBeGreaterThanOrEqual(10);
    expect(profile.traits.kind).toBeGreaterThanOrEqual(8);
    expect(profile.battleStyle).toBe('Support');
  });

  test('dominantTraits has exactly 3 entries', () => {
    const profile = buildPersonalityProfile({ ...baseAnswers, q1: 'carefully' });
    expect(profile.dominantTraits).toHaveLength(3);
  });

  test('trainerArchetype is a non-empty string', () => {
    const profile = buildPersonalityProfile({ ...baseAnswers, q1: 'instinctively' });
    expect(typeof profile.trainerArchetype).toBe('string');
    expect(profile.trainerArchetype.length).toBeGreaterThan(0);
  });
});

// ── calculateRarity tests ────────────────────────────────────────────────────
describe('calculateRarity', () => {
  const mockProfile = buildPersonalityProfile({
    ...baseAnswers,
    q1: 'instinctively',
    q2: 'sky',
    q3: 'adventure',
    q4: 'competitive',
    q5: 'brave',
  });

  test('returns Legendary for legendary Pokémon with high score', () => {
    const rarity = calculateRarity(190, mockProfile, true, false);
    expect(rarity).toBe('Legendary');
  });

  test('returns Mythic for legendary with very high score', () => {
    const rarity = calculateRarity(200, mockProfile, true, false);
    expect(rarity).toBe('Mythic');
  });

  test('returns Secret Rare for mythical with extreme score', () => {
    const rarity = calculateRarity(210, mockProfile, false, true);
    expect(rarity).toBe('Secret Rare');
  });

  test('returns Common for low score', () => {
    const lowProfile = buildPersonalityProfile(baseAnswers);
    const rarity = calculateRarity(30, lowProfile, false, false);
    expect(rarity).toBe('Common');
  });

  test('returns Rare for moderate score', () => {
    const rarity = calculateRarity(110, mockProfile, false, false);
    expect(['Rare', 'Epic']).toContain(rarity);
  });
});

// ── calculateXP tests ────────────────────────────────────────────────────────
describe('calculateXP', () => {
  test('returns a value between 1 and 100', () => {
    const profile = buildPersonalityProfile({
      ...baseAnswers,
      q1: 'carefully',
      q2: 'mountains',
      q3: 'power',
      q4: 'competitive',
      q5: 'brave',
    });
    const xp = calculateXP(profile);
    expect(xp).toBeGreaterThanOrEqual(1);
    expect(xp).toBeLessThanOrEqual(100);
  });

  test('returns higher XP for more trait diversity', () => {
    const fullProfile = buildPersonalityProfile({
      ...baseAnswers,
      q1: 'instinctively',
      q2: 'sky',
      q3: 'adventure',
      q4: 'energetic',
      q5: 'brave',
    });
    const emptyProfile = buildPersonalityProfile(baseAnswers);
    expect(calculateXP(fullProfile)).toBeGreaterThan(calculateXP(emptyProfile));
  });
});

// ── calculateFriendship tests ─────────────────────────────────────────────────
describe('calculateFriendship', () => {
  test('returns value between 0 and 255', () => {
    const profile = buildPersonalityProfile({
      ...baseAnswers,
      q1: 'collaboratively',
      q3: 'friendship',
      q5: 'kind',
    });
    const friendship = calculateFriendship(baseAnswers, profile);
    expect(friendship).toBeGreaterThanOrEqual(0);
    expect(friendship).toBeLessThanOrEqual(255);
  });

  test('higher social/kind answers give higher friendship', () => {
    const social = buildPersonalityProfile({ ...baseAnswers, q1: 'collaboratively', q3: 'friendship', q5: 'kind' });
    const loner  = buildPersonalityProfile({ ...baseAnswers, q1: 'carefully', q3: 'power', q5: 'brave' });
    expect(calculateFriendship(baseAnswers, social)).toBeGreaterThan(calculateFriendship(baseAnswers, loner));
  });
});

// ── calculateDerivedStats tests ──────────────────────────────────────────────
describe('calculateDerivedStats', () => {
  test('all derived stats are between 0 and 100', () => {
    const profile = buildPersonalityProfile({
      ...baseAnswers,
      q1: 'experimentally',
      q2: 'forest',
      q3: 'knowledge',
      q4: 'curious',
      q5: 'creative',
    });
    const stats = calculateDerivedStats(profile);
    for (const value of Object.values(stats)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    }
  });

  test('curious/creative profile has high intelligenceScore and creativityScore', () => {
    const profile = buildPersonalityProfile({
      ...baseAnswers,
      q1: 'experimentally', // curious+3, creative+3
      q3: 'knowledge',      // knowledgeable+3, curious+2
      q4: 'curious',        // curious+3, knowledgeable+2
      q5: 'creative',       // creative+3, curious+2
    });
    const stats = calculateDerivedStats(profile);
    expect(stats.intelligenceScore).toBeGreaterThan(50);
    expect(stats.creativityScore).toBeGreaterThan(50);
  });
});
