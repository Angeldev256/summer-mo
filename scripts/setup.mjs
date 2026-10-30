// Creates the database tables and the admin account with a generated password.
//   npm run setup                       -> first-time setup (username "admin")
//   npm run setup -- --user summer      -> pick the username
//   npm run reset-password              -> new generated password for an existing user
import { mkdirSync, readFileSync, existsSync } from 'node:fs';
import { createClient } from '@libsql/client';
import { SCHEMA, dbConfig } from '../lib/schema.mjs';
import { generatePassword, hashPassword } from '../lib/password.mjs';

// Load .env / .env.local so the script talks to the same database as the app.
for (const f of ['.env', '.env.local']) {
  if (!existsSync(f)) continue;
  for (const line of readFileSync(f, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && m[2] !== '' && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const args = process.argv.slice(2);
const reset = args.includes('--reset');
const ui = args.indexOf('--user');
const username = (ui >= 0 && args[ui + 1]) || 'admin';

const cfg = dbConfig();
if (cfg.url.startsWith('file:')) mkdirSync('data', { recursive: true });
const db = createClient(cfg);
for (const sql of SCHEMA) await db.execute(sql);

const existing = await db.execute({ sql: 'SELECT id FROM users WHERE username = ?', args: [username] });
const password = generatePassword();
const hash = await hashPassword(password);

if (existing.rows.length) {
  if (!reset) {
    console.log(`User "${username}" already exists. Run "npm run reset-password${username === 'admin' ? '' : ` -- --user ${username}`}" to generate a new password.`);
    process.exit(0);
  }
  await db.execute({ sql: 'UPDATE users SET password_hash = ? WHERE username = ?', args: [hash, username] });
  await db.execute({ sql: 'DELETE FROM sessions WHERE user_id = ?', args: [existing.rows[0].id] });
  console.log('\nPassword reset. Everyone signed in as this user has been signed out.');
} else {
  if (reset) { console.log(`No user called "${username}". Run "npm run setup" first.`); process.exit(1); }
  await db.execute({ sql: 'INSERT INTO users (username, password_hash) VALUES (?, ?)', args: [username, hash] });
  console.log('\nAdmin account created.');
}

console.log(`
  Sign in at:  /my-account
  Username:    ${username}
  Password:    ${password}

  This password is shown only once. Save it in a password manager.
  You can change it after signing in, under the Account tab.
`);
