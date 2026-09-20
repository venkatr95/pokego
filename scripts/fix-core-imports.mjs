import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'packages', 'pokemon-go-core', 'src');
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith('.ts')) continue;
  const p = path.join(dir, f);
  let s = fs.readFileSync(p, 'utf8');
  s = s.replaceAll('@/types/pokemon-go', './types');
  fs.writeFileSync(p, s);
  console.log('fixed', f);
}
