import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug } from '@/lib/content';
import { Footer, Nav, fmtDate } from '@/components/Chrome';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug((await params).slug);
  return post ? { title: post.title, description: post.excerpt || undefined } : { title: 'Post not found' };
}

export default async function PostPage({ params }: Props) {
  const post = await getPostBySlug((await params).slug);
  if (!post) notFound();
  // Body is plain text: blank lines start a new paragraph, single line breaks are kept.
  const paras = post.body.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  return (
    <>
      <Nav />
      <main>
        <article className="post">
          <div className="wrap narrow">
            <Link href="/blog" className="eyebrow back">← All posts</Link>
            <span className="eyebrow">{fmtDate(post.publishedAt)}</span>
            <h1>{post.title}</h1>
            {post.excerpt && <p className="lede">{post.excerpt}</p>}
          </div>
          {post.cover && <div className="wrap"><div className="post-cover"><img src={post.cover} alt="" /></div></div>}
          <div className="wrap narrow post-body">
            {paras.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
