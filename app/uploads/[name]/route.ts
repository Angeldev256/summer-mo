import { contentType, readImage } from '@/lib/storage';

// Serves images saved to data/uploads (used when not storing images in Vercel Blob).
export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const buf = await readImage(name);
  if (!buf) return new Response('Not found', { status: 404 });
  return new Response(new Uint8Array(buf), {
    headers: {
      'Content-Type': contentType(name),
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
