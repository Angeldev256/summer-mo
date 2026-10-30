import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { cookies, headers } from 'next/headers';
import { query, run } from './db';
import { hashPassword, verifyPassword } from './password.mjs';

const COOKIE = 'sm_session';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const MAX_FAILS = 5, LOCK_MS = 15 * 60 * 1000;

export type User = { id: number; username: string };

const sha = (s: string) => createHash('sha256').update(s).digest('hex');

async function clientIp() {
  const h = await headers();
  return (h.get('x-forwarded-for')?.split(',')[0] || h.get('x-real-ip') || 'local').trim();
}

export async function hasAnyUser() {
  return (await query('SELECT 1 FROM users LIMIT 1')).length > 0;
}

export async function getUser(): Promise<User | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const rows = await query<User>(
    'SELECT u.id, u.username FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ?',
    [sha(token), Date.now()]);
  return rows[0] ? { id: Number(rows[0].id), username: String(rows[0].username) } : null;
}

export async function requireUser() {
  const u = await getUser();
  if (!u) throw new Error('Not signed in');
  return u;
}

export type LoginResult = { ok: true } | { ok: false; error: string };

export async function login(username: string, password: string): Promise<LoginResult> {
  const key = `${await clientIp()}|${username.toLowerCase()}`;
  const now = Date.now();
  const att = (await query<{ count: number; first_at: number }>('SELECT count, first_at FROM login_attempts WHERE key = ?', [key]))[0];
  const fresh = att && now - Number(att.first_at) < LOCK_MS;
  if (fresh && Number(att.count) >= MAX_FAILS) {
    const mins = Math.ceil((LOCK_MS - (now - Number(att.first_at))) / 60000);
    return { ok: false, error: `Too many wrong attempts. Try again in ${mins} minute${mins === 1 ? '' : 's'}.` };
  }

  const row = (await query<{ id: number; password_hash: string }>('SELECT id, password_hash FROM users WHERE username = ?', [username]))[0];
  // Hash even when the user doesn't exist so response time doesn't reveal valid usernames.
  const ok = await verifyPassword(password, row?.password_hash ?? 'scrypt$AAAAAAAAAAAAAAAAAAAAAA==$AAAA');
  if (!row || !ok) {
    if (fresh) await run('UPDATE login_attempts SET count = count + 1 WHERE key = ?', [key]);
    else await run('INSERT OR REPLACE INTO login_attempts (key, count, first_at) VALUES (?, 1, ?)', [key, now]);
    return { ok: false, error: 'That username and password don\'t match.' };
  }

  await run('DELETE FROM login_attempts WHERE key = ?', [key]);
  await run('DELETE FROM sessions WHERE expires_at <= ?', [now]);
  const token = randomBytes(32).toString('base64url');
  await run('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)', [sha(token), Number(row.id), now + MAX_AGE * 1000]);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: MAX_AGE,
  });
  return { ok: true };
}

export async function logout() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await run('DELETE FROM sessions WHERE token_hash = ?', [sha(token)]);
  jar.delete(COOKIE);
}

export async function changeCredentials(user: User, current: string, next: { username: string; password: string }) {
  const row = (await query<{ password_hash: string }>('SELECT password_hash FROM users WHERE id = ?', [user.id]))[0];
  if (!row || !(await verifyPassword(current, row.password_hash))) return 'Your current password is wrong.';
  const name = next.username.trim();
  if (!/^[A-Za-z0-9._-]{3,32}$/.test(name)) return 'Usernames are 3 to 32 letters, numbers, dots, dashes or underscores.';
  if (next.password && next.password.length < 10) return 'Use at least 10 characters for the new password.';
  const taken = await query('SELECT 1 FROM users WHERE username = ? AND id != ?', [name, user.id]);
  if (taken.length) return 'That username is taken.';
  if (next.password) {
    await run('UPDATE users SET username = ?, password_hash = ? WHERE id = ?', [name, await hashPassword(next.password), user.id]);
    // Sign out every other device; keep this one.
    const token = (await cookies()).get(COOKIE)?.value ?? '';
    await run('DELETE FROM sessions WHERE user_id = ? AND token_hash != ?', [user.id, sha(token)]);
  } else {
    await run('UPDATE users SET username = ? WHERE id = ?', [name, user.id]);
  }
  return null;
}
