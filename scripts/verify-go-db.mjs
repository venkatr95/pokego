/**
 * Verify GO collection tables + RLS after migration.
 * Uses DATABASE_URL from .env.local (no secrets printed).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function loadEnvLocal() {
  const envPath = path.join(root, '.env.local');
  const text = fs.readFileSync(envPath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

async function main() {
  loadEnvLocal();
  const url = process.env.DATABASE_URL;
  const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    const tables = await client.query(`
      select table_name from information_schema.tables
      where table_schema='public'
        and table_name in ('users','go_collections','go_collection_entries')
      order by 1
    `);
    console.log('tables:', tables.rows.map((r) => r.table_name).join(', '));

    const cols = await client.query(`
      select column_name from information_schema.columns
      where table_schema='public' and table_name='go_collection_entries'
      order by ordinal_position
    `);
    console.log('go_collection_entries columns:', cols.rows.length);

    const policies = await client.query(`
      select tablename, policyname from pg_policies
      where schemaname='public'
        and tablename in ('go_collections','go_collection_entries')
      order by 1,2
    `);
    console.log('policies:', policies.rows.length);
    for (const p of policies.rows) {
      console.log(` - ${p.tablename}: ${p.policyname}`);
    }

    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasAnon = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    console.log(`app_env NEXT_PUBLIC_SUPABASE_URL=${hasUrl ? 'set' : 'MISSING'}`);
    console.log(`app_env NEXT_PUBLIC_SUPABASE_ANON_KEY=${hasAnon ? 'set' : 'MISSING'}`);
    if (!hasUrl || !hasAnon) {
      console.log(
        'NOTE: Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local, then restart npm run dev to use cloud sync in the UI.'
      );
    } else {
      console.log('App env looks ready for browser sync UI.');
    }
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error('FAILED:', e.message || e);
  process.exit(1);
});
