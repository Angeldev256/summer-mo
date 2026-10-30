import type { Metadata } from 'next';
import { getUser, hasAnyUser } from '@/lib/auth';
import { getContent, listPosts } from '@/lib/content';
import { LoginForm } from './LoginForm';
import { Editor } from './Editor';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'My account', robots: { index: false, follow: false } };

export default async function MyAccount() {
  const user = await getUser();
  if (!user) {
    const setUp = await hasAnyUser();
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
