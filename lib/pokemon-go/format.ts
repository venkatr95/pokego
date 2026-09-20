export function spriteUrl(speciesId: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${speciesId}.png`;
}

export function formatDexNumber(id: number): string {
  return `#${String(id).padStart(3, '0')}`;
}
