import type { Metadata } from 'next';
import { getUser, hasAnyUser } from '@/lib/auth';
import { getContent, listPosts } from '@/lib/content';
import { dbMissingOnVercel } from '@/lib/db';
import { LoginForm } from './LoginForm';
import { Editor } from './Editor';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'My account', robots: { index: false, follow: false } };

export default async function MyAccount() {
  if (dbMissingOnVercel()) {
    return (
      <main className="login-page">
        <div className="login-box">
          <a href="/" className="brand">SUMMER MO</a>
          <h1>Almost there</h1>
          <p className="hint">The editor needs a database, and Vercel can&apos;t keep a local SQLite file. To finish setup:</p>
          <ol className="hint setup-steps">
            <li>Create a free database at turso.tech and copy its URL (<code>libsql://…</code>) and an auth token.</li>
            <li>In Vercel → this project → Settings → Environment Variables, add <code>DATABASE_URL</code> and <code>DATABASE_AUTH_TOKEN</code>.</li>
            <li>In Vercel → Storage, create a Blob store and connect it to this project (for image uploads).</li>
            <li>Redeploy.</li>
            <li>On your computer, put the same two variables in <code>.env.local</code> and run <code>npm run setup</code> to get your login.</li>
          </ol>
        </div>
      </main>
    );
  }
  let user, setUp;
  try {
    user = await getUser();
    setUp = user ? true : await hasAnyUser();
  } catch (e) {
    console.error('[my-account]', e);
    return (
      <main className="login-page">
        <div className="login-box">
          <a href="/" className="brand">SUMMER MO</a>
          <h1>Can&apos;t reach the database</h1>
          <p className="hint">
            Check <code>DATABASE_URL</code> and <code>DATABASE_AUTH_TOKEN</code> in your hosting settings, then redeploy.
            The public site keeps showing the default content until the database is back.
          </p>
        </div>
      </main>
    );
  }
  if (!user) {
    return (
      <main className="login-page">
        <div className="login-box">
          <a href="/" className="brand">SUMMER MO</a>
          <h1>My account</h1>
          {setUp ? <LoginForm /> : (
            <p className="hint">
              No account has been created yet. In the project folder, run <code>npm run setup</code>.
              It creates the admin account and prints a generated password.
            </p>
          )}
        </div>
      </main>
    );
  }
  const [content, posts] = await Promise.all([getContent(), listPosts({ includeDrafts: true })]);
  return <Editor username={user.username} initialContent={content} initialPosts={posts} />;
}
