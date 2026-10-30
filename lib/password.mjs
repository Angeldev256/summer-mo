import { randomBytes, randomInt, scrypt, timingSafeEqual } from 'node:crypto';

const N = 16384, R = 8, P = 1, LEN = 64;

const scryptAsync = (pw, salt) =>
  new Promise((ok, fail) => scrypt(pw, salt, LEN, { N, r: R, p: P }, (e, k) => (e ? fail(e) : ok(k))));

export async function hashPassword(pw) {
  const salt = randomBytes(16);
  const key = await scryptAsync(pw, salt);
  return `scrypt$${salt.toString('base64')}$${key.toString('base64')}`;
}

export async function verifyPassword(pw, stored) {
  const [alg, salt, hash] = String(stored).split('$');
  if (alg !== 'scrypt' || !salt || !hash) return false;
  const want = Buffer.from(hash, 'base64');
  const got = await scryptAsync(pw, Buffer.from(salt, 'base64'));
  return want.length === got.length && timingSafeEqual(want, got);
}

// Readable random password, e.g. "kq7m-Hx3p-W9rt-c4Nz" (no 0/O/1/l/I to avoid mix-ups).
export function generatePassword() {
  const abc = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const group = () => Array.from({ length: 4 }, () => abc[randomInt(abc.length)]).join('');
  return [group(), group(), group(), group()].join('-');
}
