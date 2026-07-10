import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pokeuu.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/generating/'],
        crawlDelay: 10, // Prevent aggressive crawling
      },
      {
        // Block AI scrapers and aggressive bots to save server load
        userAgent: ['GPTBot', 'CCBot', 'anthropic-ai', 'Claude-Web', 'Bytespider', 'Omgilibot', 'Amazonbot', 'Applebot-Extended'],
        disallow: ['/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
