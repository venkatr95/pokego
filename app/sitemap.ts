import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pokeuu.com';

  // We could fetch dynamic routes here if we want to index all public cards.
  // For now, we index the static pages.
  const routes = [
    '',
    '/quiz',
    '/leaderboard',
    '/community',
    '/team',
    '/achievements',
    '/story',
    '/booster'
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  return routes;
}
