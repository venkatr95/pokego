import { Metadata, ResolvingMetadata } from 'next';
import { parseCardSlug } from '@/lib/utils/seo';
import SharedCardClient from './SharedCardClient';
import { headers } from 'next/headers';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const id = parseCardSlug(slug);

  try {
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;

    const res = await fetch(`${baseUrl}/api/cards/${id}`);
    if (res.ok) {
      const data = await res.json();
      if (data.card) {
        const card = data.card;
        const title = `${card.trainerName}'s ${card.matchedPokemon.name} Card | PokéYou`;
        const description = `Discover your Pokémon personality! ${card.trainerName} matched with ${card.matchedPokemon.name}.`;
        
        return {
          title,
          description,
          openGraph: {
            title,
            description,
            // Assuming dynamic OG image routing if supported, fallback to default if not.
            images: [`/og-image.png`], 
          },
          alternates: {
            canonical: `${baseUrl}/card/${slug}`,
          },
        };
      }
    }
  } catch (error) {
    console.error('Error generating metadata for card:', error);
  }

  return {
    title: 'Custom Pokémon Card | PokéYou',
    description: 'Check out this custom Pokémon personality card.',
  };
}

export default async function SharedCardPage({ params }: Props) {
  const { slug } = await params;
  const id = parseCardSlug(slug);
  
  return (
    <>
      <SharedCardClient id={id} />
      {/* Product Schema injected here */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "Custom Pokémon Personality Card",
            "description": "A generated custom Pokémon trading card based on a personality test.",
            "image": "https://pokeuu.com/og-image.png", // fallback image
            "offers": {
              "@type": "Offer",
              "price": "0.00",
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock"
            }
          })
        }}
      />
    </>
  );
}
