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
          <p className="hint">The public site is live. The editor needs a database and image storage, because Vercel can&apos;t keep files. In your Vercel project:</p>
          <ol className="hint setup-steps">
            <li><b>Storage → Create Database → Turso</b>, and connect it to this project. (Or add your own <code>DATABASE_URL</code> and <code>DATABASE_AUTH_TOKEN</code>.)</li>
            <li><b>Storage → Create → Blob</b>, and connect it to this project. This stores uploaded photos.</li>
            <li><b>Settings → Environment Variables</b>: add <code>ADMIN_PASSWORD</code> (at least 10 characters). Optionally add <code>ADMIN_USERNAME</code>; it defaults to <code>admin</code>.</li>
            <li><b>Deployments → Redeploy</b>, then come back here and sign in.</li>
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
            Check the database settings (<code>DATABASE_URL</code> and <code>DATABASE_AUTH_TOKEN</code>, or <code>TURSO_DATABASE_URL</code> and <code>TURSO_AUTH_TOKEN</code>) in your hosting settings, then redeploy.
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
              No account has been created yet. On Vercel, add an <code>ADMIN_PASSWORD</code> environment variable
              (at least 10 characters) and redeploy. On your own server, run <code>npm run setup</code> in the project
              folder; it prints a generated password.
            </p>
          )}
        </div>
      </main>
    );
  }
  const [content, posts] = await Promise.all([getContent(), listPosts({ includeDrafts: true })]);
  return <Editor username={user.username} initialContent={content} initialPosts={posts} />;
}
