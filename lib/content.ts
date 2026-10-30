import 'server-only';
import { query, run } from './db';
import { normalizeContent, safeImage, type Content, type Post } from './site-data';

// Public pages keep working (with the default copy) if the database is missing or down.
async function orFallback<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn(); } catch (e) { console.error('[db]', e instanceof Error ? e.message : e); return fallback; }
}

export async function getContent(): Promise<Content> {
  const row = await orFallback(async () => (await query<{ data: string }>('SELECT data FROM site_content WHERE id = 1'))[0], undefined);
  if (!row) return normalizeContent(null);
  try { return normalizeContent(JSON.parse(row.data)); } catch { return normalizeContent(null); }
}

export async function saveContent(raw: unknown) {
  const clean = normalizeContent(raw);
  await run(
    `INSERT INTO site_content (id, data, updated_at) VALUES (1, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`,
    [JSON.stringify(clean)]);
  return clean;
}

// ---------- Blog ----------
type PostRow = { id: number; slug: string; title: string; excerpt: string; body: string; cover: string | null; published: number; published_at: string | null; updated_at: string };
const toPost = (r: PostRow): Post => ({
  id: Number(r.id), slug: r.slug, title: r.title, excerpt: r.excerpt, body: r.body, cover: r.cover,
  published: Number(r.published) === 1, publishedAt: r.published_at, updatedAt: r.updated_at,
});

export async function listPosts({ includeDrafts = false, limit = 100 } = {}) {
  const sql = `SELECT * FROM posts ${includeDrafts ? '' : 'WHERE published = 1'}
     ORDER BY COALESCE(published_at, created_at) DESC, id DESC LIMIT ?`;
  // The editor needs to see real errors; public pages just show no posts.
  const rows = includeDrafts ? await query<PostRow>(sql, [limit]) : await orFallback(() => query<PostRow>(sql, [limit]), []);
  return rows.map(toPost);
}

export async function getPostBySlug(slug: string) {
  const r = await orFallback(async () => (await query<PostRow>('SELECT * FROM posts WHERE slug = ? AND published = 1', [slug]))[0], undefined);
  return r ? toPost(r) : null;
}

const slugify = (s: string) =>
  s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70) || 'post';

async function uniqueSlug(title: string, id?: number) {
  const base = slugify(title);
  for (let n = 1; ; n++) {
    const s = n === 1 ? base : `${base}-${n}`;
    const hit = await query('SELECT 1 FROM posts WHERE slug = ? AND id != ?', [s, id ?? -1]);
    if (!hit.length) return s;
  }
}

export type PostInput = { title: string; excerpt: string; body: string; cover: string | null; published: boolean };

function cleanPost(p: PostInput): PostInput {
  return {
    title: String(p.title ?? '').trim().slice(0, 200) || 'Untitled post',
    excerpt: String(p.excerpt ?? '').slice(0, 600),
    body: String(p.body ?? '').slice(0, 100_000),
    cover: safeImage(p.cover),
    published: Boolean(p.published),
  };
}

async function getPostById(id: number) {
  const r = (await query<PostRow>('SELECT * FROM posts WHERE id = ?', [id]))[0];
  return r ? toPost(r) : null;
}

export async function createPost(input: PostInput) {
  const p = cleanPost(input);
  const res = await run(
    `INSERT INTO posts (slug, title, excerpt, body, cover, published, published_at)
     VALUES (?, ?, ?, ?, ?, ?, CASE WHEN ? = 1 THEN datetime('now') END)`,
    [await uniqueSlug(p.title), p.title, p.excerpt, p.body, p.cover, p.published ? 1 : 0, p.published ? 1 : 0]);
  return getPostById(Number(res.lastInsertRowid));
}

export async function updatePost(id: number, input: PostInput) {
  const p = cleanPost(input);
  const cur = await getPostById(id);
  if (!cur) return null;
  // Slug follows the title until the post is first published, then stays fixed so links don't break.
  const slug = cur.publishedAt ? cur.slug : await uniqueSlug(p.title, id);
  await run(
    `UPDATE posts SET slug = ?, title = ?, excerpt = ?, body = ?, cover = ?, published = ?,
       published_at = CASE WHEN ? = 1 AND published_at IS NULL THEN datetime('now') ELSE published_at END,
       updated_at = datetime('now')
     WHERE id = ?`,
    [slug, p.title, p.excerpt, p.body, p.cover, p.published ? 1 : 0, p.published ? 1 : 0, id]);
  return getPostById(id);
}

export async function deletePost(id: number) {
  await run('DELETE FROM posts WHERE id = ?', [id]);
}
