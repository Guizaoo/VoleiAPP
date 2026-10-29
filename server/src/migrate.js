import pg from 'pg';
import { readdir, readFile } from 'node:fs/promises';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
if (!process.env.DATABASE_URL) throw new Error('Configure DATABASE_URL.');
const client = await pool.connect();
try {
 await client.query('BEGIN');
 await client.query("SELECT pg_advisory_xact_lock(740192)");
 await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz DEFAULT now())');
 const dir = new URL('../migrations/', import.meta.url);
 for (const name of (await readdir(dir)).filter(n => n.endsWith('.sql')).sort()) {
  if ((await client.query('SELECT 1 FROM schema_migrations WHERE name=$1', [name])).rowCount) continue;
  await client.query(await readFile(new URL(name, dir), 'utf8'));
  await client.query('INSERT INTO schema_migrations(name) VALUES($1)', [name]);
  console.log(`Aplicada: ${name}`);
 }
 await client.query('COMMIT');
} catch (error) { await client.query('ROLLBACK'); throw error; }
finally { client.release(); await pool.end(); }
