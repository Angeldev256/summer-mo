import { NextResponse, type NextRequest } from 'next/server';
import { getUser } from '@/lib/auth';
import { saveImage } from '@/lib/storage';

export async function POST(req: NextRequest) {
  // Cookie auth + same-origin check, so another site can't post uploads with the editor's cookie.
  const origin = req.headers.get('origin');
  if (!origin || new URL(origin).host !== req.headers.get('host')) {
    return NextResponse.json({ error: 'Bad origin' }, { status: 403 });
  }
  if (!(await getUser())) return NextResponse.json({ error: 'Sign in again to upload images.' }, { status: 401 });

  const file = (await req.formData()).get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'No file received.' }, { status: 400 });
  const res = await saveImage(file);
  return NextResponse.json(res, { status: 'error' in res ? 400 : 200 });
}
