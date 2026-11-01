import 'server-only';
import { mkdirSync } from 'node:fs';
import type { Client, InValue } from '@libsql/client';
import { SCHEMA, dbConfig } from './schema.mjs';
import { hashPassword } from './password.mjs';

let client: Promise<Client> | null = null;
let ready: Promise<void> | null = null;

// Vercel's filesystem is read-only and not kept between requests, so a local SQLite file can't work there.
export const dbMissingOnVercel = () => Boolean(process.env.VERCEL) && dbConfig().url.startsWith('file:');

export class DbNotConfigured extends Error {
  constructor() { super('No database is connected. On Vercel, add a Turso database (see README).'); }
}

// Remote databases (Turso) use the pure-HTTP client. The default client always loads SQLite's native
// binary, which serverless bundles like Vercel's don't include, so it's only imported for local files.
async function createClient(): Promise<Client> {
  if (dbMissingOnVercel()) throw new DbNotConfigured();
  const cfg = dbConfig();
  if (!cfg.url.startsWith('file:')) return (await import('@libsql/client/web')).createClient(cfg);
  mkdirSync('data', { recursive: true });
  return (await import('@libsql/client')).createClient(cfg);
}

function getClient() {
  client ??= createClient().catch(e => { client = null; throw e; });
  return client;
}

async function init() {
  const c = await getClient();
  await c.execute('PRAGMA foreign_keys = ON');
  for (const sql of SCHEMA) await c.execute(sql);
  await bootstrapAdmin(c);
}

// On hosts where you can't run `npm run setup` (like Vercel), set ADMIN_PASSWORD (and optionally
// ADMIN_USERNAME) in the project settings. The account is created once, only while no account exists.
async function bootstrapAdmin(c: Client) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return;
  const username = (process.env.ADMIN_USERNAME || 'admin').trim();
  if (password.length < 10) { console.error('[setup] ADMIN_PASSWORD must be at least 10 characters. No account created.'); return; }
  const any = await c.execute('SELECT 1 FROM users LIMIT 1');
  if (any.rows.length) return;
  await c.execute({ sql: 'INSERT OR IGNORE INTO users (username, password_hash) VALUES (?, ?)', args: [username, await hashPassword(password)] });
  console.log(`[setup] Created the "${username}" account from ADMIN_PASSWORD.`);
}

export async function db() {
  ready ??= init().catch(e => { ready = null; throw e; });
  await ready;
  return getClient();
}

export async function query<T = Record<string, unknown>>(sql: string, args: InValue[] = []) {
  const res = await (await db()).execute({ sql, args });
  return res.rows as unknown as T[];
}

export async function run(sql: string, args: InValue[] = []) {
  return (await db()).execute({ sql, args });
}
