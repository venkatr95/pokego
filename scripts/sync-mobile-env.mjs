/**
 * Copy public Supabase keys from root .env.local into apps/mobile/.env
 * (never copies DATABASE_URL).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, '.env.local');
const dest = path.join(root, 'apps', 'mobile', '.env');

if (!fs.existsSync(src)) {
  console.error('Missing .env.local at repo root');
  process.exit(1);
}

const wanted = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];
const map = {};
for (const line of fs.readFileSync(src, 'utf8').split(/\r?\n/)) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const eq = t.indexOf('=');
  if (eq < 0) continue;
  const k = t.slice(0, eq).trim();
  let v = t.slice(eq + 1).trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1);
  }
  map[k] = v;
}

const webUrl =
  map.NEXT_PUBLIC_SITE_URL ||
  map.EXPO_PUBLIC_WEB_URL ||
  'http://localhost:3000';

const lines = [
  `EXPO_PUBLIC_SUPABASE_URL=${map.NEXT_PUBLIC_SUPABASE_URL ?? ''}`,
  `EXPO_PUBLIC_SUPABASE_ANON_KEY=${map.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''}`,
  `EXPO_PUBLIC_WEB_URL=${webUrl}`,
];
fs.writeFileSync(dest, lines.join('\n') + '\n');
console.log(
  'Wrote apps/mobile/.env',
  map.NEXT_PUBLIC_SUPABASE_URL ? '(url set)' : '(url MISSING)',
  map.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '(anon set)' : '(anon MISSING)'
);
