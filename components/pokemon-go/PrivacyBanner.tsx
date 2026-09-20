'use client';

export function PrivacyBanner() {
  return (
    <div
      className="glass rounded-xl px-4 py-3 text-sm text-foreground/70"
      role="note"
    >
      Your collection is stored locally on this device. If you enable cloud sync, a copy is
      saved to your PokéYou account with row-level security. PokéYou never asks for your
      Pokémon GO password, never uses unofficial Niantic login, and a Trainer ID is not
      authentication.
    </div>
  );
}
