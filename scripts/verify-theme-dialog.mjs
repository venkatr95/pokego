/**
 * Verify dialog styling in light + dark themes.
 */
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

async function sampleDialog(page, theme) {
  await page.emulateMedia({ colorScheme: theme === 'dark' ? 'dark' : 'light' });
  await page.addInitScript((t) => {
    localStorage.setItem('theme', t);
  }, theme);

  await page.goto(`${BASE}/pokemon-go/collection`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.evaluate((t) => {
    document.documentElement.classList.toggle('dark', t === 'dark');
    localStorage.setItem('theme', t);
  }, theme);

  // Prefer navbar Sign In if present; Collection Cloud sync also has one
  const signIn = page.getByRole('button', { name: /^Sign In$/i }).first();
  await signIn.click();
  const dialog = page.getByRole('dialog');
  await dialog.waitFor({ timeout: 10000 });

  const styles = await dialog.evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      bg: cs.backgroundColor,
      color: cs.color,
      radius: cs.borderRadius,
      border: cs.borderColor,
    };
  });

  const title = await dialog.getByRole('heading', { name: /Sign in to PokéYou/i }).count();
  const close = await dialog.getByRole('button', { name: /Close/i }).count();
  await page.keyboard.press('Escape');

  return { theme, title, close, styles };
}

function luminance(rgb) {
  const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return 0;
  const [r, g, b] = [m[1], m[2], m[3]].map(Number);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const failures = [];

  for (const theme of ['light', 'dark']) {
    const context = await browser.newContext({
      colorScheme: theme === 'dark' ? 'dark' : 'light',
      viewport: { width: 1280, height: 800 },
    });
    const page = await context.newPage();
    try {
      const result = await sampleDialog(page, theme);
      const lum = luminance(result.styles.bg);
      console.log(
        `PASS ${theme}: title=${result.title} close=${result.close} bg=${result.styles.bg} lum=${lum.toFixed(2)} radius=${result.styles.radius}`
      );
      if (result.title < 1) failures.push(`${theme}: missing title`);
      if (theme === 'light' && lum < 0.6) failures.push(`${theme}: dialog bg too dark (${lum})`);
      if (theme === 'dark' && lum > 0.35) failures.push(`${theme}: dialog bg too light (${lum})`);
    } catch (e) {
      failures.push(`${theme}: ${e instanceof Error ? e.message : String(e)}`);
      console.error(`FAIL ${theme}`, e);
    } finally {
      await context.close();
    }
  }

  await browser.close();
  if (failures.length) {
    console.error(failures.join('\n'));
    process.exit(1);
  }
  console.log('All theme/dialog checks passed');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
