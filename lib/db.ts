import 'server-only';
import { mkdirSync } from 'node:fs';
import { createClient, type Client, type InValue } from '@libsql/client';
import { SCHEMA, dbConfig } from './schema.mjs';

let client: Client | null = null;
let ready: Promise<void> | null = null;

function getClient() {
  if (!client) {
    const cfg = dbConfig();
    if (cfg.url.startsWith('file:')) mkdirSync('data', { recursive: true });
    client = createClient(cfg);
  }
  return client;
}

async function init() {
  const c = getClient();
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
