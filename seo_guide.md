# SEO Verification & QA Guide

Follow this step-by-step guide to verify all the SEO enhancements and Core Web Vitals on your local machine.

## Prerequisites
1. Open your terminal in the project directory (`d:\ai_proj\pokeyou`).
2. Run `npm run build` to ensure the optimized production bundles are generated.
3. Start the production server locally by running `npm run start` (this runs the site on `http://localhost:3000`).
4. Open the site in Google Chrome.

---

## 1. Automated Tests & Build Verification
- [ ] **Build Success:** Verify that `npm run build` completed without any TypeScript or Turbopack errors. 

---

## 2. Manual Verification: Routing & Slugs
Navigate to the Quiz (`http://localhost:3000/quiz`), complete it, and generate a card.
- [ ] **Human-Readable Slugs:** Look at the URL in your browser. It should follow the format: `http://localhost:3000/card/pokemonname-uuid` (e.g., `/card/pikachu-123e4567-...`).
- [ ] **Passport Links:** Go to the Passport page (`/passport`) and verify that downloading or sharing the card still points to the new SEO-friendly slug.

---

## 3. Manual Verification: Metadata & `<head>` Inspection
On the home page (`/`) and a generated card page (`/card/[slug]`), right-click the page and select **"Inspect"**, then go to the **Elements** tab and expand the `<head>` section.

### Home Page (`/`)
- [ ] **Title Tag:** Check for `<title>PokéYou — Discover Your Pokémon Personality Profile | PokéYou</title>`.
- [ ] **Meta Description:** Check for `<meta name="description" content="Take the ultimate Pokémon personality test...">`.
- [ ] **Canonical URL:** Verify `<link rel="canonical" href="http://localhost:3000/">`.
- [ ] **Organization JSON-LD:** Look for a `<script type="application/ld+json">` containing `@type: "Organization"` and the PokéYou brand details.

### Generated Card Page (`/card/[slug]`)
- [ ] **Dynamic Title:** Check for a customized title like `<title>TrainerName's Pikachu Card | PokéYou</title>`.
- [ ] **Open Graph Image:** Verify `<meta property="og:image" content="...">` points to an image.
- [ ] **Product JSON-LD:** Find the `<script type="application/ld+json">` containing `@type: "Product"` mapping the card to a product schema.

---

## 4. Validate Sitemap and Robots.txt
Open the following URLs directly in your browser:
- [ ] **Robots.txt:** Go to `http://localhost:3000/robots.txt`. 
  - Ensure `User-Agent: *` is present.
  - Verify `/api/`, `/dashboard/`, and `/generating/` are `Disallow`ed.
  - Ensure the `Sitemap:` directive points to `sitemap.xml`.
  - **Bot Protection Check:** Ensure that a `Crawl-delay: 10` is present, and aggressive AI scrapers (e.g. `GPTBot`, `CCBot`) are blocked.
- [ ] **Sitemap.xml:** Go to `http://localhost:3000/sitemap.xml`.
  - Check that static routes like `/`, `/quiz`, `/leaderboard`, and `/booster` are listed in standard XML format.

---

## 5. Core Web Vitals (Lighthouse Check)
To test performance accurately, ensure you test the production server (`npm run start`), **not** the development server (`npm run dev`).

1. Open `http://localhost:3000/leaderboard` in Chrome.
2. Open Chrome DevTools (F12) and navigate to the **Lighthouse** tab.
3. Select **Navigation (Default)**, check **Performance** and **SEO**, and select **Desktop** or **Mobile**.
4. Click **Analyze page load**.

### Verify Targets:
- [ ] **SEO Score:** Should be 95-100.
- [ ] **Largest Contentful Paint (LCP):** Target < 2.5 seconds.
- [ ] **Cumulative Layout Shift (CLS):** Target < 0.1. 
  - *Note: Check that the `AdUnit` placeholders on the leaderboard effectively reserve space, preventing layout shifts when they load.*

---

## Troubleshooting Tips
- **Missing JSON-LD?** Ensure you are viewing the raw DOM (via Elements tab) and not just page source (Ctrl+U), as Next.js injects some scripts dynamically based on hydration.
- **Bad LCP?** Check if large images (like the hero banner or Pokémon artwork) are missing the `priority` prop in the `next/image` component.
