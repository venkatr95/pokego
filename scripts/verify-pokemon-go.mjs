/**
 * Browser smoke test for Pokémon GO collector (Playwright).
 * Requires: dev server on :3000, playwright chromium installed.
 */
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.BASE_URL || 'http://localhost:3000';
const sample = path.join(__dirname, '..', 'data', 'pokemon-go', 'sample-collection.json');

const failures = [];

function ok(label) {
  console.log(`PASS ${label}`);
}
function fail(label, err) {
  console.error(`FAIL ${label}: ${err}`);
  failures.push(label);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  try {
    await page.goto(`${BASE}/pokemon-go/pokedex`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.getByRole('heading', { name: /Pokémon GO Pokédex/i }).waitFor({ timeout: 30000 });
    ok('pokedex loads');

    // Import sample collection via Connect → Choose file
    await page.goto(`${BASE}/pokemon-go/collection`, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: /Connect collection/i }).waitFor();
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(sample);
    await page.getByText(/Imported .* successfully/i).waitFor({ timeout: 15000 });
    ok('collection import');

    // Companion paste path
    await page.getByPlaceholder(/importedAt/i).fill(
      JSON.stringify({
        importedAt: new Date().toISOString(),
        pokemon: [{ speciesId: 6, formId: 0, caught: true, shiny: true }],
      })
    );
    await page.getByRole('button', { name: /Paste import/i }).click();
    await page.getByText(/Companion JSON imported/i).waitFor({ timeout: 15000 });
    ok('companion paste import');

    // Official stub visible and disabled when unset
    await page.getByRole('heading', { name: /Official Pokémon GO/i }).waitFor();
    const officialBtn = page.getByRole('button', { name: /^Connect$/i });
    const disabled = await officialBtn.isDisabled();
    if (!disabled && !process.env.NEXT_PUBLIC_POGO_OFFICIAL_API_URL) {
      fail('official stub', 'Connect should be disabled without official API URL');
    } else {
      ok('official stub card');
    }

    // Cloud sync panel present
    await page.getByRole('heading', { name: /Cloud sync/i }).waitFor();
    ok('cloud sync panel');

    await page.goto(`${BASE}/pokemon-go/goals`, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: /Your Goals/i }).waitFor();
    await page.getByText(/Next Goals/i).waitFor();
    ok('goals after import');

    await page.goto(`${BASE}/pokemon-go/evolutions?view=ready`, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: /Evolutions/i }).waitFor();
    ok('evolutions ready view');

    await page.goto(`${BASE}/pokemon-go/missing?filter=missing`, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: /^Missing$/i }).waitFor();
    ok('missing page');

    await page.goto(`${BASE}/pokemon/25`, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: /Your Collection/i }).waitFor({ timeout: 20000 });
    ok('species page GO section');

    // Mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE}/pokemon-go/pokedex`, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: /Pokémon GO Pokédex/i }).waitFor();
    const cards = page.locator('[role="list"] [role="listitem"]');
    await cards.first().waitFor({ timeout: 20000 });
    ok('mobile pokedex virtualized list');

    // Filter interaction
    await page.getByRole('option', { name: 'Caught' }).click();
    await page.waitForTimeout(500);
    ok('filter chip click');
  } catch (e) {
    fail('smoke flow', e instanceof Error ? e.message : String(e));
  } finally {
    await browser.close();
  }

  if (failures.length) {
    console.error(`\n${failures.length} failure(s)`);
    process.exit(1);
  }
  console.log('\nAll browser checks passed');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
