import type { Metadata } from 'next';
import { Geist, Geist_Mono, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { Navbar } from '@/components/layout/Navbar';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });
const spaceGrotesk = Space_Grotesk({ variable: '--font-space-grotesk', subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] });

export const metadata: Metadata = {
  title: {
    default: 'PokéYou — Discover Your Pokémon Personality',
    template: '%s | PokéYou',
  },
  description:
    'Answer 5 personality questions and generate your own premium animated Pokémon trading card. Discover which Pokémon matches your unique personality.',
  keywords: ['Pokémon', 'personality quiz', 'trading card', 'Pokémon card generator', 'anime', 'personality test'],
  authors: [{ name: 'PokéYou' }],
  openGraph: {
    type: 'website',
    siteName: 'PokéYou',
    title: 'PokéYou — Discover Your Pokémon Personality',
    description: 'Answer 5 questions and generate your premium animated Pokémon trading card.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'PokéYou' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PokéYou — Discover Your Pokémon Personality',
    description: 'Answer 5 questions and generate your premium animated Pokémon trading card.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} antialiased bg-background text-foreground min-h-screen transition-colors duration-300`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Navbar />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
