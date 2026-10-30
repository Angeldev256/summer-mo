import Link from 'next/link';
import type { Post } from '@/lib/site-data';
import { fmtDate } from './Chrome';

export function PostCard({ post }: { post: Post }) {
  return (
    <Link className="post-card rv" href={`/blog/${post.slug}`}>
      <div className="ph">
        {post.cover
          ? <img src={post.cover} alt="" loading="lazy" />
          : <span className="ph-word" aria-hidden="true">{post.title.split(' ')[0]}</span>}
      </div>
      <div className="post-copy">
        <span className="eyebrow">{fmtDate(post.publishedAt)}</span>
        <h3>{post.title}</h3>
        {post.excerpt && <p>{post.excerpt}</p>}
        <span className="more">Read <span className="arr">→</span></span>
      </div>
    </Link>
  );
}
