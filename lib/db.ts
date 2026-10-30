import 'server-only';
import { mkdirSync } from 'node:fs';
import type { Client, InValue } from '@libsql/client';
import { SCHEMA, dbConfig } from './schema.mjs';

let client: Promise<Client> | null = null;
let ready: Promise<void> | null = null;

// Vercel's filesystem is read-only and not kept between requests, so a local SQLite file can't work there.
export const dbMissingOnVercel = () => Boolean(process.env.VERCEL) && dbConfig().url.startsWith('file:');

export class DbNotConfigured extends Error {
  constructor() { super('DATABASE_URL is not set. On Vercel, connect a Turso database (see README).'); }
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
