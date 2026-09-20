/**
 * Apply go_collections migration using DATABASE_URL from .env.local
 * Usage: node scripts/apply-go-migration.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function loadEnvLocal() {
  const envPath = path.join(root, '.env.local');
  if (!fs.existsSync(envPath)) {
    throw new Error('.env.local not found. Add DATABASE_URL first.');
  }
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
  const url = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  if (!url) {
    throw new Error('Set DATABASE_URL (or SUPABASE_DB_URL) in .env.local');
  }
  if (url.includes('[YOUR-PASSWORD]') || url.includes('YOUR-PASSWORD')) {
    throw new Error('Replace [YOUR-PASSWORD] with your real database password in .env.local');
  }

  const bootstrapPath = path.join(
    root,
    'supabase',
    'migrations',
    '20260913_00_users_bootstrap.sql'
  );
  const sqlPath = path.join(root, 'supabase', 'migrations', '20260913_go_collections.sql');
  const bootstrap = fs.readFileSync(bootstrapPath, 'utf8');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const client = new pg.Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });

  console.log('Connecting…');
  await client.connect();
  try {
    console.log('Applying users bootstrap (if needed)…');
    await client.query('begin');
    await client.query(bootstrap);
    console.log('Applying 20260913_go_collections.sql…');
    await client.query(sql);
    await client.query('commit');

    const check = await client.query(`
      select table_name
      from information_schema.tables
      where table_schema = 'public'
        and table_name in ('go_collections', 'go_collection_entries')
      order by table_name
    `);
    console.log(
      'OK tables:',
      check.rows.map((r) => r.table_name).join(', ') || '(none found)'
    );

    const rls = await client.query(`
      select c.relname as table_name, c.relrowsecurity as rls
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relname in ('go_collections', 'go_collection_entries')
      order by c.relname
    `);
    for (const row of rls.rows) {
      console.log(`RLS ${row.table_name}: ${row.rls ? 'enabled' : 'DISABLED'}`);
    }
  } catch (e) {
    try {
      await client.query('rollback');
    } catch {
      // ignore
    }
    throw e;
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error('FAILED:', e.message || e);
  process.exit(1);
});
