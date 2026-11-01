import Link from 'next/link';
import { getContent, listPosts } from '@/lib/content';
import { Footer, Nav } from '@/components/Chrome';
import { PostCard } from '@/components/PostCard';
import { SiteEffects } from '@/components/SiteEffects';
import { ContactForm } from '@/components/ContactForm';

export const dynamic = 'force-dynamic';

const GC_LIT = new Set([9, 10, 11, 12, 13, 17, 25, 33, 34, 35, 36, 41, 49, 50, 51, 52, 53, 46, 38, 30, 22]);
const NUM = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'];
const chapters = (n: number) => `${NUM[n] ?? n} chapter${n === 1 ? '' : 's'}.`;
const STATEMENT = "The mic matters most when it's handed to someone new.";

export default async function Home() {
  const [c, posts] = await Promise.all([getContent(), listPosts({ limit: 3 })]);
  const feats = c.projects.filter(p => p.size === 'feature');
  const cards = c.projects.filter(p => p.size !== 'feature');
  const shots = c.gallery.filter(g => g.image);

  return (
    <>
      <div className="progress" id="progress" />
      <Nav home />
      <main>
        <header className="hero" id="home">
          <div className="wrap">
            <span className="eyebrow">{c.hero.eyebrow}</span>
            <div className="hero-top">
              <h1><span className="line"><span>Summer</span></span><span className="line"><span className="sun">Mo.</span></span></h1>
              {c.hero.portrait && <div className="portrait"><img src={c.hero.portrait} alt="Portrait of Summer Mo" /></div>}
            </div>
            <div className="hero-foot">
              <p className="lede"><b>{c.hero.leadBold}</b> {c.hero.lede}</p>
              <div className="cta">
                <a className="btn solid" href="#work">See the work <span className="arr">→</span></a>
                <a className="btn ghost" href="#contact">Book Summer</a>
              </div>
            </div>
            <div className="roles" aria-live="polite">
              <span className="static">You&apos;ll find her</span>
              <span className="rot" id="rot">
                <span className="on">on television.</span><span>on the radio.</span><span>on the stage.</span><span>in the room.</span>
              </span>
            </div>
          </div>
        </header>

        <div className="marquee" aria-hidden="true">
          <div className="track">{[...c.work, ...c.work].map((w, i) => <span key={i}>{w.title}</span>)}</div>
        </div>

        <section id="story">
          <div className="wrap">
            <div className="head rv">
              <div><span className="eyebrow">My Story</span><h2>{chapters(c.story.length)}<br />One voice.</h2></div>
              <p className="lede">Where it started, what changed, and where it&apos;s all heading.</p>
            </div>
            <div className="story">
              <aside className="story-nav" id="storyNav">
                {c.story.map((s, i) => <a key={i} href={`#ch-${i}`}>{s.title}</a>)}
              </aside>
              <div className="chapters">
                {c.story.map((s, i) => (
                  <article className="chapter rv" id={`ch-${i}`} key={i}>
                    <span className="n">Ch. {i + 1}</span>
                    <div><h3>{s.title}</h3>{s.quote ? <blockquote>{s.body}</blockquote> : <p>{s.body}</p>}</div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="work">
          <div className="wrap">
            <div className="head rv">
              <div><span className="eyebrow">My Work</span><h2>Every craft.<br />Every format.</h2></div>
              <p className="lede">From a live broadcast to a workshop of thirty, the craft is the same: <b>connection.</b></p>
            </div>
            <div className="grid">
              {c.work.map((w, i) => (
                <a className="cell rv" href="#contact" key={i}>
                  {w.image ? <div className="ph"><img src={w.image} alt={w.title} loading="lazy" /></div> : <span className="eyebrow">{w.tag}</span>}
                  <div>{w.image && <span className="eyebrow">{w.tag}</span>}<h3>{w.title}</h3><p>{w.body}</p></div>
                </a>
              ))}
            </div>
            {shots.length > 0 && (
              <div className="gallery">
                <div className="gallery-head"><h3>In the frame</h3><span className="eyebrow">Swipe →</span></div>
                <div className="strip">
                  {shots.map((g, i) => (
                    <figure className="shot" key={i}>
                      <div className="frame"><img src={g.image!} alt={g.caption || 'Summer Mo'} loading="lazy" /></div>
                      {g.caption && <figcaption>{g.caption}</figcaption>}
                    </figure>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <section id="projects">
          <div className="wrap">
            <div className="head rv">
              <div><span className="eyebrow">My Projects</span><h2>Built from<br />scratch.</h2></div>
              <p className="lede">Ideas that started as conversations and grew into platforms.</p>
            </div>
            {feats.map((p, i) => {
              const tags = p.tags.split(',').map(t => t.trim()).filter(Boolean);
              return (
                <article className={`feature rv${i % 2 ? ' flip' : ''}`} key={i}>
                  {p.image
                    ? <div className="art photo"><img src={p.image} alt={p.title} loading="lazy" /></div>
                    : i % 2 === 0
                      ? <div className="art heat-art"><span className="word">{(p.title.split(' ').pop() || '').toUpperCase().slice(0, 6)}</span></div>
                      : <div className="art gc-art" aria-hidden="true">{Array.from({ length: 64 }, (_, n) => <i key={n} className={GC_LIT.has(n) ? 'lit' : undefined} />)}</div>}
                  <div className="copy">
                    <div>{p.label && <span className="eyebrow">{p.label}</span>}<h3 style={{ marginTop: 14 }}>{p.title}</h3><p>{p.body}</p></div>
                    {tags.length > 0 && <div className="tags">{tags.map(t => <span className="tag" key={t}>{t}</span>)}</div>}
                  </div>
                </article>
              );
            })}
            <div className={'minis' + (cards.length === 1 ? ' c1' : cards.length === 2 || cards.length === 4 ? ' c2' : '')}>
              {cards.map((p, i) => (
                <article className="mini rv" key={i}>
                  {p.image && <div className="ph"><img src={p.image} alt={p.title} loading="lazy" /></div>}
                  <div><h3>{p.title}</h3><p>{p.body}</p></div>
                  {p.status && <span className="status">{p.status}</span>}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="impact">
          <div className="wrap">
            <p className="statement rv" id="statement">
              {STATEMENT.split(' ').map((w, i) => <span className="w" key={i}>{w} </span>)}
            </p>
            <div className="impact rv" style={{ marginTop: 'clamp(64px,9vw,112px)' }}>
              <div className="pillar"><span className="eyebrow">Impact</span><h3>Youth Empowerment</h3><p>Training young people to speak, lead and build with confidence.</p><ul><li>Mentorship</li><li>Leadership workshops</li><li>School &amp; campus talks</li></ul></div>
              <div className="pillar"><span className="eyebrow">Impact</span><h3>Creative Community</h3><p>Connecting creatives with platforms, brands and each other.</p><ul><li>Talent showcases</li><li>Creator meetups</li><li>Collaborations</li></ul></div>
              <div className="pillar"><span className="eyebrow">Impact</span><h3>Community Service</h3><p>Showing up beyond the spotlight, where it counts most.</p><ul><li>Outreach drives</li><li>Charity hosting</li><li>Local partnerships</li></ul></div>
            </div>
          </div>
        </section>

        <section id="journey">
          <div className="wrap">
            <div className="head rv">
              <div><span className="eyebrow">The Journey</span><h2>Timeline.</h2></div>
              <p className="lede">The road so far, one milestone at a time.</p>
            </div>
            <div className="timeline" id="timeline">
              <span className="fill" id="fill" />
              <div id="stops">
                {c.journey.map((s, i) => (
                  <div className="stop rv" key={i}><span className="when">{s.when}</span><div><h3>{s.title}</h3><p>{s.body}</p></div></div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="blog">
          <div className="wrap">
            <div className="head rv">
              <div><span className="eyebrow">Blog</span><h2>What&apos;s<br />new.</h2></div>
              <p className="lede">Shows, events, programmes and the stories behind them.</p>
            </div>
            {posts.length ? (
              <>
                <div className="posts">{posts.map(p => <PostCard key={p.id} post={p} />)}</div>
                <div style={{ marginTop: 40 }}><Link className="btn ghost" href="/blog">All posts <span className="arr">→</span></Link></div>
              </>
            ) : <p className="empty-note">New posts are on the way. Check back soon.</p>}
          </div>
        </section>

        <section className="contact" id="contact">
          <div className="wrap contact-grid">
            <div className="rv">
              <span className="eyebrow">Bookings &amp; partnerships</span>
              <h2 style={{ marginTop: 18 }}>Let&apos;s<br /><span className="sun">work.</span></h2>
              <p className="lede" style={{ marginTop: 28 }}>Hosting, speaking, brand campaigns or youth programmes. Tell Summer&apos;s team what you&apos;re planning.</p>
            </div>
            <ContactForm />
          </div>
        </section>
      </main>
      <Footer />
      <SiteEffects />
    </>
  );
}
