import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

async function waitForServer() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`${BASE}/quiz`);
      if (res.ok) return;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error('Server not ready');
}

async function checkViewport(browser, width, height, label) {
  const context = await browser.newContext({
    viewport: { width, height },
    isMobile: width < 500,
    hasTouch: width < 500,
  });
  const page = await context.newPage();
  await page.goto(`${BASE}/quiz`, { waitUntil: 'networkidle', timeout: 60000 });

  await page.getByRole('heading', { name: /Pokémon Personality Quiz/i }).waitFor();
  await page.getByText(/Your progress/i).waitFor();
  await page.getByRole('button', { name: /Generate my Pokémon card/i }).waitFor();

  const sticky = page.getByRole('button', { name: /Generate my Pokémon card/i });
  const box = await sticky.boundingBox();
  if (!box) throw new Error(`${label}: CTA missing box`);

  // On mobile, CTA should sit near the bottom of the viewport
  if (width < 500) {
    const nearBottom = box.y + box.height > height - 120;
    if (!nearBottom) {
      throw new Error(`${label}: sticky CTA not near bottom (y=${box.y})`);
    }
  }

  // Choice options should be large enough to tap
  const option = page.getByRole('button', { name: /Carefully/i }).first();
  const optBox = await option.boundingBox();
  if (!optBox || optBox.height < 44) {
    throw new Error(`${label}: choice touch target too small (${optBox?.height})`);
  }

  console.log(`PASS ${label}: CTA y=${Math.round(box.y)} optH=${Math.round(optBox.height)}`);
  await context.close();
}

async function main() {
  await waitForServer();
  const browser = await chromium.launch({ headless: true });
  try {
    await checkViewport(browser, 390, 844, 'mobile');
    await checkViewport(browser, 1280, 800, 'desktop');
  } finally {
    await browser.close();
  }
  console.log('All responsive quiz checks passed');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
