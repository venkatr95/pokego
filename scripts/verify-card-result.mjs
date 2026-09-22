/**
 * Verify /card result page: theme-aware chrome, theme-independent card ink, mobile layout.
 */
import { chromium } from 'playwright';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const __dirname = dirname(fileURLToPath(import.meta.url));
const pokemon = JSON.parse(readFileSync(join(__dirname, '../data/pokemon.json'), 'utf8'));
const raichu = pokemon.find((p) => p.id === 26);

function buildCard() {
  return {
    id: 'verify-card-001',
    cardNumber: 'PY-VER-001',
    generatedAt: new Date().toISOString(),
    trainerName: 'Venkat',
    buddy: null,
    matchedPokemon: raichu,
    matchScore: 92,
    favoriteWon: true,
    personality: {
      traits: { bravery: 70, kindness: 60, curiosity: 80, strategy: 75, energy: 90 },
      dominantTraits: ['energetic', 'curious'],
      typeAffinity: { electric: 0.9 },
      rarityBias: 0.4,
    },
    answers: {
      name: 'Venkat',
      favoritePokemonId: 26,
      favoritePokemonName: 'Raichu',
      q1: 'a', q2: 'b', q3: 'a', q4: 'c', q5: 'b',
    },
    xpLevel: 78,
    friendshipLevel: 200,
    powerScore: 4200,
    adventureScore: 70,
    courageScore: 75,
    intelligenceScore: 80,
    teamworkScore: 65,
    creativityScore: 85,
    determinationScore: 78,
    rarity: 'Rare',
    signatureMove: {
      name: 'Thunderbolt',
      type: 'electric',
      power: 90,
      accuracy: 100,
      category: 'Special',
      description: 'A strong electric blast.',
    },
    aiData: {
      trainerTitle: 'Thunder Ace',
      trainerDescription: 'Crackling with confidence.',
      personalitySummary: 'A high-voltage trainer who charges into adventure with wit and heart.',
      pokemonReasoning: 'Raichu mirrors your electric energy and curiosity.',
      battleStyle: 'Blitz Striker',
      signatureMove: 'Thunderbolt',
      signatureMoveReasoning: 'Fits your speed.',
      motivationalQuote: 'Spark first. Ask questions later.',
      cardFlavorText: 'When the sky flashes, this trainer is already moving.',
      career: 'Gym Challenger',
      region: 'Kanto',
      rarity: 'Rare',
      rarityReasoning: 'Strong match.',
      story: 'You met Raichu under a summer storm.',
      backgroundPrompt: 'electric storm',
      strengths: ['Speed', 'Courage', 'Creativity'],
      growthAreas: ['Patience'],
      recommendedTeam: [{ name: 'Jolteon', reason: 'Synergizes with your speed.' }],
      achievements: ['First Spark'],
    },
  };
}

function luminance(rgb) {
  const m = String(rgb).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return -1;
  const [r, g, b] = [m[1], m[2], m[3]].map(Number);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

async function seedAndOpen(page, theme, viewport) {
  await page.setViewportSize(viewport);
  await page.addInitScript(({ themeName, card }) => {
    localStorage.setItem('theme', themeName);
    if (themeName === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem(
      'pokeyou-quiz-store',
      JSON.stringify({
        state: {
          answers: card.answers,
          generatedCard: card,
          currentStep: 'complete',
          selectedTheme: 'classic-tcg',
          selectedEnvironment: null,
        },
        version: 0,
      })
    );
  }, { themeName: theme, card: buildCard() });

  await page.goto(`${BASE}/card`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  // Card mounts after persist hydration; heading appears after a 400ms reveal delay.
  await page.waitForSelector('#pokemon-card', { timeout: 25000 });
  await page.getByText(/Your Pokémon is/i).waitFor({ timeout: 15000 });
}

async function sample(page) {
  return page.evaluate(() => {
    const pageRoot = document.querySelector('main')?.parentElement || document.body;
    // The card page root is the min-h-screen div
    const shell = document.querySelector('.min-h-screen.bg-background') || document.querySelector('.min-h-screen');
    const card = document.getElementById('pokemon-card');
    const cardFace = card?.querySelector('.card-front-face') || card;
    const trainer = [...(card?.querySelectorAll('p') || [])].find((p) => p.textContent?.includes('Venkat'));
    const name = [...(card?.querySelectorAll('h2') || [])].find((h) => h.textContent?.includes('Raichu'));
    const heading = [...document.querySelectorAll('h1')].find((h) => /Your Pokémon is/i.test(h.textContent || ''));
    const glass = document.querySelector('.glass-card');
    const cs = (el) => (el ? getComputedStyle(el) : null);

    const shellCs = cs(shell);
    const cardCs = cs(cardFace);
    const trainerCs = cs(trainer);
    const nameCs = cs(name);
    const glassCs = cs(glass);
    const headingCs = cs(heading);

    return {
      hasCard: !!card,
      hasHeading: !!heading,
      shellBg: shellCs?.backgroundColor,
      shellColor: shellCs?.color,
      glassBg: glassCs?.backgroundColor,
      glassColor: glassCs?.color,
      cardColor: cardCs?.color,
      trainerColor: trainerCs?.color,
      nameColor: nameCs?.color,
      cardBox: card ? card.getBoundingClientRect() : null,
      overflowX: document.documentElement.scrollWidth > window.innerWidth + 2,
      pageRootTag: pageRoot?.tagName,
    };
  });
}

async function runCase(browser, c) {
  const context = await browser.newContext({
    colorScheme: c.theme === 'dark' ? 'dark' : 'light',
    viewport: c.viewport,
  });
  const page = await context.newPage();
  try {
    await seedAndOpen(page, c.theme, c.viewport);
    const result = await sample(page);
    const shellLum = luminance(result.shellBg);
    const glassLum = luminance(result.glassBg);
    const trainerLum = luminance(result.trainerColor);
    const cardW = result.cardBox?.width ?? 0;
    const failures = [];

    console.log(
      `${c.label}: card=${result.hasCard} heading=${result.hasHeading} shellLum=${shellLum.toFixed(2)} glassLum=${glassLum.toFixed(2)} trainerLum=${trainerLum.toFixed(2)} cardW=${cardW.toFixed(0)} overflowX=${result.overflowX}`
    );
    console.log(`  colors: shell=${result.shellBg} glass=${result.glassBg} cardInk=${result.cardColor} trainer=${result.trainerColor} name=${result.nameColor}`);

    if (!result.hasCard) failures.push(`${c.label}: missing #pokemon-card`);
    if (!result.hasHeading) failures.push(`${c.label}: missing heading`);
    if (result.overflowX) failures.push(`${c.label}: horizontal overflow`);

    // Page chrome should follow theme (skip glass bgColor in dark — gradient reports transparent)
    if (c.theme === 'light' && glassLum < 0.55) {
      failures.push(`${c.label}: glass-card too dark for light mode (${glassLum})`);
    }
    if (c.theme === 'light' && shellLum < 0.6) {
      failures.push(`${c.label}: page shell still forced-dark (${shellLum})`);
    }
    if (c.theme === 'dark' && shellLum > 0.35) {
      failures.push(`${c.label}: page shell too light for dark mode (${shellLum})`);
    }

    // Card ink must stay light (theme-independent) in both themes
    if (trainerLum >= 0 && trainerLum < 0.55) {
      failures.push(`${c.label}: card trainer text too dark (theme-linked?) lum=${trainerLum}`);
    }

    if (c.viewport.width < 500 && cardW > c.viewport.width - 8) {
      failures.push(`${c.label}: card wider than viewport (${cardW} > ${c.viewport.width})`);
    }

    await page.screenshot({
      path: join(__dirname, `../.tmp-card-${c.label}.png`),
      fullPage: true,
    });
    return failures;
  } finally {
    await context.close();
  }
}

async function main() {
  if (!raichu) throw new Error('Raichu not found in pokemon.json');
  const browser = await chromium.launch({ headless: true });
  const failures = [];

  // Warm up Next compile so the first themed case does not flake.
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
    await ctx.close();
  }

  const cases = [
    { theme: 'light', viewport: { width: 1280, height: 800 }, label: 'desktop-light' },
    { theme: 'dark', viewport: { width: 1280, height: 800 }, label: 'desktop-dark' },
    { theme: 'light', viewport: { width: 390, height: 844 }, label: 'mobile-light' },
    { theme: 'dark', viewport: { width: 390, height: 844 }, label: 'mobile-dark' },
  ];

  for (const c of cases) {
    let lastErr = null;
    let ok = false;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const caseFailures = await runCase(browser, c);
        failures.push(...caseFailures);
        ok = true;
        break;
      } catch (e) {
        lastErr = e;
        console.error(`FAIL ${c.label} attempt ${attempt}`, e instanceof Error ? e.message : e);
      }
    }
    if (!ok && lastErr) {
      failures.push(`${c.label}: ${lastErr instanceof Error ? lastErr.message : String(lastErr)}`);
    }
  }

  await browser.close();
  if (failures.length) {
    console.error('\nFAILURES:\n' + failures.join('\n'));
    process.exit(1);
  }
  console.log('\nAll card result checks passed.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
