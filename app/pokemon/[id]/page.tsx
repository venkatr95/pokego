import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPokemonById } from '@/lib/pokemon';
import { PokemonGoSection } from '@/components/pokemon-go/PokemonGoSection';
import { formatDexNumber, spriteUrl } from '@/lib/pokemon-go/format';
import { TYPE_COLORS } from '@/types/pokemon';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const pokemon = await getPokemonById(Number(id));
  const name = pokemon?.displayName ?? `Pokémon #${id}`;
  return {
    title: `${name} — Pokémon GO Collection`,
    description: `View ${name} Pokédex info and your local Pokémon GO collection progress.`,
  };
}

export default async function PokemonDetailPage({ params }: Props) {
  const { id } = await params;
  const speciesId = Number(id);
  if (!Number.isFinite(speciesId) || speciesId <= 0) notFound();

  const pokemon = await getPokemonById(speciesId);
  const name = pokemon?.displayName ?? `Pokémon #${speciesId}`;
  const types = pokemon?.types ?? [];
  const primary = types[0];
  const theme = primary ? TYPE_COLORS[primary] : null;
  const art =
    pokemon?.sprites.official_artwork ??
    pokemon?.sprites.front_default ??
    spriteUrl(speciesId);

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-4 md:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href="/pokemon-go/pokedex"
          className="text-sm text-foreground/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
        >
          ← Pokémon GO Pokédex
        </Link>

        <header className="flex gap-4 items-start">
          <div
            className="relative w-28 h-28 rounded-2xl overflow-hidden shrink-0"
            style={{ background: theme?.bg ?? 'rgba(255,255,255,0.05)' }}
          >
            <Image
              src={art}
              alt=""
              width={112}
              height={112}
              className="object-contain"
              unoptimized
            />
          </div>
          <div>
            <p className="font-mono text-foreground/50">{formatDexNumber(speciesId)}</p>
            <h1 className="text-3xl font-display font-bold">{name}</h1>
            <p className="text-sm text-foreground/60 capitalize mt-1">
              {types.join(' · ') || '—'}
            </p>
            {pokemon?.description && (
              <p className="text-sm text-foreground/50 mt-3 leading-relaxed">
                {pokemon.description}
              </p>
            )}
          </div>
        </header>

        <PokemonGoSection speciesId={speciesId} />
      </div>
    </div>
  );
}
