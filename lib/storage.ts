import 'server-only';
import { randomBytes } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const UPLOAD_DIR = path.join(process.cwd(), 'data', 'uploads');
// Vercel rejects request bodies over 4.5 MB, so cap uploads there. The editor shrinks big photos first.
export const MAX_BYTES = (process.env.VERCEL ? 4.4 : 10) * 1024 * 1024;

const TYPES: Record<string, string> = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif' };
export const contentType = (name: string) => TYPES[name.split('.').pop()!.toLowerCase()];

// Decide the type from the file's first bytes, not its name or the browser's claim.
function sniff(b: Buffer): keyof typeof TYPES | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg';
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (b.subarray(0, 4).toString('ascii') === 'RIFF' && b.subarray(8, 12).toString('ascii') === 'WEBP') return 'webp';
  if (b.subarray(0, 4).toString('ascii') === 'GIF8') return 'gif';
  return null;
}

export async function saveImage(file: File): Promise<{ url: string } | { error: string }> {
  if (file.size > MAX_BYTES) return { error: `That image is over ${process.env.VERCEL ? '4' : '10'} MB. Choose a smaller file.` };
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = sniff(buf);
  if (!ext) return { error: 'Use a JPG, PNG, WebP or GIF image.' };
  const name = `${Date.now().toString(36)}-${randomBytes(6).toString('hex')}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import('@vercel/blob');
    const blob = await put(`uploads/${name}`, buf, { access: 'public', contentType: TYPES[ext] });
    return { url: blob.url };
  }
  if (process.env.VERCEL) return { error: 'Image storage isn\'t connected. Add Vercel Blob to this project in the Vercel dashboard, then redeploy.' };
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, name), buf);
  return { url: `/uploads/${name}` };
}

export async function readImage(name: string) {
  if (!/^[A-Za-z0-9._-]+$/.test(name) || !contentType(name)) return null;
  try { return await readFile(path.join(UPLOAD_DIR, name)); } catch { return null; }
}
