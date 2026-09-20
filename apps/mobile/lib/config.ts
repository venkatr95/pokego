export const WEB_URL =
  process.env.EXPO_PUBLIC_WEB_URL?.replace(/\/$/, '') ||
  'https://pokeuu.com';

export function webPath(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${WEB_URL}${p}`;
}
