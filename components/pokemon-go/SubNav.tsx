'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/pokemon-go/pokedex', label: 'Pokédex' },
  { href: '/pokemon-go/collection', label: 'Collection' },
  { href: '/pokemon-go/goals', label: 'Goals' },
  { href: '/pokemon-go/evolutions', label: 'Evolutions' },
  { href: '/pokemon-go/forms', label: 'Forms' },
  { href: '/pokemon-go/missing', label: 'Missing' },
];

export function PokemonGoSubNav() {
  const pathname = usePathname();

  return (
    <nav
      className="sticky top-16 z-40 -mx-4 md:-mx-6 px-4 md:px-6 py-3 bg-background/90 backdrop-blur-md border-b border-border"
      aria-label="Pokémon GO sections"
    >
      <div className="max-w-6xl mx-auto flex gap-2 overflow-x-auto pb-1">
        {LINKS.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'shrink-0 rounded-full px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                active
                  ? 'bg-brand-500 text-white'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
