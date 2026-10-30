import type { Metadata } from 'next';
import { listPosts } from '@/lib/content';
import { Footer, Nav } from '@/components/Chrome';
import { PostCard } from '@/components/PostCard';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Blog' };

export default async function BlogIndex() {
  const posts = await listPosts();
  return (
    <>
      <Nav />
      <main>
        <section className="blog-page">
          <div className="wrap">
            <div className="head">
              <div><span className="eyebrow">Blog</span><h2>What&apos;s<br />new.</h2></div>
              <p className="lede">Shows, events, programmes and the stories behind them.</p>
            </div>
            {posts.length
              ? <div className="posts">{posts.map(p => <PostCard key={p.id} post={p} />)}</div>
              : <p className="empty-note">No posts yet. Check back soon.</p>}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
