export function generateCardSlug(pokemonName: string, cardId: string): string {
  const slugifiedName = pokemonName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  return `${slugifiedName}-${cardId}`;
}

export function parseCardSlug(slug: string): string {
  // UUIDs are 36 characters long and have the format xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  const uuidRegex = /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i;
  const match = slug.match(uuidRegex);
  
  if (match) {
    return match[1];
  }
  
  // Fallback: If for some reason it's not a UUID, try getting the last part (not recommended for general use, but safe fallback)
  const parts = slug.split('-');
  return parts[parts.length - 1];
}
