'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SECTIONS, type Content, type Field, type Post } from '@/lib/site-data';
import { accountAction, deletePostAction, logoutAction, saveContentAction, savePostAction } from './actions';

type Tab = keyof Content | 'blog' | 'account';
const clone = <T,>(o: T): T => JSON.parse(JSON.stringify(o));

// ---------- Small building blocks ----------
function ImageField({ label, value, onChange, onStatus }: { label: string; value: string | null; onChange: (v: string | null) => void; onStatus: (s: string) => void }) {
  const [busy, setBusy] = useState(false);
  async function upload(file: File) {
    if (file.size > 10 * 1024 * 1024) { onStatus('That image is over 10 MB. Choose a smaller file.'); return; }
    setBusy(true); onStatus(`Uploading ${file.name}…`);
    try {
      const fd = new FormData(); fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed.');
      onChange(data.url); onStatus(`Uploaded ${file.name}. Remember to save.`);
    } catch (e) { onStatus(e instanceof Error ? e.message : 'Upload failed.'); }
    finally { setBusy(false); }
  }
  return (
    <div className="af"><span>{label}</span>
      <div className="imgf">
        <div className="th">{value ? <img src={value} alt="" /> : 'No image'}</div>
        <div className="acts">
          <label className="abtn sm">{busy ? 'Uploading…' : value ? 'Replace' : 'Upload'}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={busy}
              onChange={e => { const f = e.target.files?.[0]; e.target.value = ''; if (f) upload(f); }} />
          </label>
          {value && <button type="button" className="abtn sm danger" onClick={() => onChange(null)}>Remove</button>}
        </div>
      </div>
    </div>
  );
}

function FieldInput({ f, value, onChange, onStatus }: { f: Field; value: unknown; onChange: (v: unknown) => void; onStatus: (s: string) => void }) {
  if (f.type === 'image') return <ImageField label={f.label} value={(value as string) ?? null} onChange={onChange} onStatus={onStatus} />;
  if (f.type === 'check') return <label className="af check"><input type="checkbox" checked={Boolean(value)} onChange={e => onChange(e.target.checked)} />{f.label}</label>;
  if (f.type === 'select') return (
    <label className="af"><span>{f.label}</span>
      <select value={String(value)} onChange={e => onChange(e.target.value)}>{f.options!.map(([o, l]) => <option key={o} value={o}>{l}</option>)}</select>
    </label>);
  if (f.type === 'area') return <label className="af"><span>{f.label}</span><textarea value={String(value ?? '')} onChange={e => onChange(e.target.value)} /></label>;
  return <label className="af"><span>{f.label}</span><input type="text" value={String(value ?? '')} onChange={e => onChange(e.target.value)} /></label>;
}

function DeleteButton({ onConfirm, label = 'Delete' }: { onConfirm: () => void; label?: string }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => { if (!armed) return; const t = setTimeout(() => setArmed(false), 4000); return () => clearTimeout(t); }, [armed]);
  return <button type="button" className="abtn sm danger" onClick={() => (armed ? onConfirm() : setArmed(true))}>{armed ? 'Confirm delete' : label}</button>;
}

// ---------- Blog ----------
const BLANK_POST = { title: '', excerpt: '', body: '', cover: null as string | null, published: false };

function PostEditor({ post, onSaved, onDeleted, onClose, onStatus }: {
  post: Post | null; onSaved: (p: Post) => void; onDeleted: (id: number) => void; onClose: () => void; onStatus: (s: string) => void;
}) {
  const [d, setD] = useState(post ? { title: post.title, excerpt: post.excerpt, body: post.body, cover: post.cover, published: post.published } : BLANK_POST);
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof d, v: unknown) => setD(x => ({ ...x, [k]: v }));

  async function save(publish?: boolean) {
    if (!d.title.trim()) { onStatus('Give the post a title first.'); return; }
    setSaving(true); onStatus('Saving post…');
    try {
      const saved = await savePostAction(post?.id ?? null, { ...d, published: publish ?? d.published });
      if (saved) { onSaved(saved); setD(x => ({ ...x, published: saved.published })); onStatus(saved.published ? 'Post saved and live on the site.' : 'Draft saved. Only you can see it.'); }
    } catch { onStatus('Couldn\'t save the post. Check you are still signed in and try again.'); }
    finally { setSaving(false); }
  }

  return (
    <div className="item">
      <div className="item-head">
        <button type="button" className="abtn sm" onClick={onClose}>← All posts</button>
        <div className="acts">
          {post?.published && <a className="abtn sm" href={`/blog/${post.slug}`} target="_blank" rel="noreferrer">View</a>}
          {post && <DeleteButton onConfirm={async () => { await deletePostAction(post.id); onDeleted(post.id); onStatus('Post deleted.'); }} />}
        </div>
      </div>
      <label className="af"><span>Title</span><input type="text" value={d.title} onChange={e => set('title', e.target.value)} placeholder="What happened?" /></label>
      <label className="af"><span>Summary (shown on the blog cards)</span><textarea value={d.excerpt} onChange={e => set('excerpt', e.target.value)} style={{ minHeight: 64 }} /></label>
      <ImageField label="Cover image" value={d.cover} onChange={v => set('cover', v)} onStatus={onStatus} />
      <label className="af"><span>Post (leave an empty line between paragraphs)</span><textarea value={d.body} onChange={e => set('body', e.target.value)} style={{ minHeight: 260 }} /></label>
      <div className="post-acts">
        <span className={`pill${d.published ? ' live' : ''}`}>{d.published ? 'Published' : 'Draft'}</span>
        <div className="acts">
          {d.published
            ? <button type="button" className="abtn" disabled={saving} onClick={() => save(false)}>Unpublish</button>
            : <button type="button" className="abtn" disabled={saving} onClick={() => save(false)}>Save draft</button>}
          <button type="button" className="abtn primary" disabled={saving} onClick={() => save(true)}>{d.published ? 'Save changes' : 'Publish'}</button>
        </div>
      </div>
    </div>
  );
}

function BlogTab({ posts, setPosts, onStatus }: { posts: Post[]; setPosts: (f: (p: Post[]) => Post[]) => void; onStatus: (s: string) => void }) {
  const [open, setOpen] = useState<number | 'new' | null>(null);
  if (open !== null) {
    const post = open === 'new' ? null : posts.find(p => p.id === open) ?? null;
    return <PostEditor key={String(open)} post={post} onStatus={onStatus} onClose={() => setOpen(null)}
      onSaved={p => { setPosts(ps => ps.some(x => x.id === p.id) ? ps.map(x => x.id === p.id ? p : x) : [p, ...ps]); setOpen(p.id); }}
      onDeleted={id => { setPosts(ps => ps.filter(x => x.id !== id)); setOpen(null); }} />;
  }
  return (
    <>
      <div><button type="button" className="abtn primary" onClick={() => setOpen('new')}>+ New post</button></div>
      {!posts.length && <p className="hint">No posts yet. When something new happens, add a post and publish it. It shows up in the Blog section of the site.</p>}
      {posts.map(p => (
        <button type="button" key={p.id} className="item post-row" onClick={() => setOpen(p.id)}>
          <div className="th">{p.cover ? <img src={p.cover} alt="" /> : null}</div>
          <div className="post-row-copy"><b>{p.title}</b><span>{p.published ? `Published ${p.publishedAt?.slice(0, 10) ?? ''}` : 'Draft'}</span></div>
          <span className={`pill${p.published ? ' live' : ''}`}>{p.published ? 'Live' : 'Draft'}</span>
        </button>
      ))}
    </>
  );
}

// ---------- Account ----------
function AccountTab({ username, onStatus }: { username: string; onStatus: (s: string) => void }) {
  const router = useRouter();
  const [name, setName] = useState(username);
  const [current, setCurrent] = useState(''), [pw, setPw] = useState(''), [pw2, setPw2] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw !== pw2) { onStatus('The two new passwords don\'t match.'); return; }
    setBusy(true);
    const err = await accountAction({ current, username: name, password: pw }).catch(() => 'Couldn\'t save. Try again.');
    setBusy(false);
    if (err) { onStatus(err); return; }
    setCurrent(''); setPw(''); setPw2('');
    onStatus(pw ? 'Saved. Your password changed and other devices were signed out.' : 'Saved.');
    router.refresh();
  }

  return (
    <form className="item" onSubmit={submit}>
      <label className="af"><span>Username</span><input type="text" value={name} onChange={e => setName(e.target.value)} autoComplete="username" /></label>
      <label className="af"><span>New password (leave empty to keep the current one)</span><input type="password" value={pw} onChange={e => setPw(e.target.value)} autoComplete="new-password" minLength={10} /></label>
      <label className="af"><span>Repeat new password</span><input type="password" value={pw2} onChange={e => setPw2(e.target.value)} autoComplete="new-password" /></label>
      <label className="af"><span>Current password (required)</span><input type="password" value={current} onChange={e => setCurrent(e.target.value)} autoComplete="current-password" required /></label>
      <div><button className="abtn primary" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save account'}</button></div>
      <p className="hint">Forgot the password? On the server, run <code>npm run reset-password</code> to generate a new one.</p>
    </form>
  );
}

// ---------- Editor shell ----------
export function Editor({ username, initialContent, initialPosts }: { username: string; initialContent: Content; initialPosts: Post[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('hero');
  const [draft, setDraft] = useState<Content>(() => clone(initialContent));
  const [posts, setPosts] = useState(initialPosts);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('Edit any section, then save to publish your changes.');

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    addEventListener('beforeunload', warn);
    return () => removeEventListener('beforeunload', warn);
  }, [dirty]);

  const update = (fn: (c: Content) => void) => {
    setDraft(d => { const n = clone(d); fn(n); return n; });
    setDirty(true); setStatus('Unsaved changes. Visitors still see the last saved version.');
  };

  async function save() {
    setSaving(true); setStatus('Saving…');
    try { const saved = await saveContentAction(draft); setDraft(saved); setDirty(false); setStatus('Saved. Everyone now sees this version.'); }
    catch { setStatus('Couldn\'t save. Check you are still signed in and try again.'); }
    finally { setSaving(false); }
  }

  async function signOut() {
    if (dirty && !confirm('You have unsaved changes. Sign out anyway?')) return;
    await logoutAction(); router.refresh();
  }

  const isContentTab = tab in SECTIONS;
  const tabs: [Tab, string][] = [...(Object.keys(SECTIONS) as (keyof Content)[]).map(k => [k, SECTIONS[k].label] as [Tab, string]), ['blog', 'Blog'], ['account', 'Account']];

  function sectionBody(key: keyof Content) {
    const s = SECTIONS[key];
    if (s.single) {
      const obj = draft[key] as Record<string, unknown>;
      return <div className="item">{s.fields.map(f => (
        <FieldInput key={f.k} f={f} value={obj[f.k]} onStatus={setStatus}
          onChange={v => update(c => { (c[key] as Record<string, unknown>)[f.k] = v; })} />))}</div>;
    }
    const list = draft[key] as Record<string, unknown>[];
    return (
      <>
        {!list.length && <p className="hint">{s.empty || 'Nothing here yet.'}</p>}
        {list.map((it, i) => (
          <div className="item" key={i}>
            <div className="item-head">
              <b>{String(it[s.title!] || `Untitled ${s.item}`)}</b>
              <div className="acts">
                <button type="button" className="abtn sm" disabled={i === 0} aria-label="Move up"
                  onClick={() => update(c => { const l = c[key] as unknown[]; [l[i - 1], l[i]] = [l[i], l[i - 1]]; })}>↑</button>
                <button type="button" className="abtn sm" disabled={i === list.length - 1} aria-label="Move down"
                  onClick={() => update(c => { const l = c[key] as unknown[]; [l[i + 1], l[i]] = [l[i], l[i + 1]]; })}>↓</button>
                <DeleteButton onConfirm={() => update(c => { (c[key] as unknown[]).splice(i, 1); })} />
              </div>
            </div>
            {s.fields.map(f => (
              <FieldInput key={f.k} f={f} value={it[f.k]} onStatus={setStatus}
                onChange={v => update(c => { (c[key] as Record<string, unknown>[])[i][f.k] = v; })} />))}
          </div>
        ))}
        <div><button type="button" className="abtn" onClick={() => update(c => { (c[key] as unknown[]).push(clone(s.blank)); })}>+ Add {s.item}</button></div>
      </>
    );
  }

  return (
    <div className="editor">
      <header className="editor-top">
        <div className="wrap">
          <div className="admin-row">
            <div><a href="/" className="brand">SUMMER MO</a> <span className="who">· Signed in as {username}</span></div>
            <div className="acts">
              <a className="abtn" href="/" target="_blank" rel="noreferrer">View site</a>
              <button type="button" className="abtn" onClick={signOut}>Sign out</button>
            </div>
          </div>
          <div className="tabs" role="tablist">
            {tabs.map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={k === tab} className={k === tab ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}
          </div>
        </div>
      </header>
      <div className="wrap editor-body">
        <div className="editor-bar">
          <p className="admin-status" role="status">{status}</p>
          {isContentTab && <button type="button" className="abtn primary" disabled={!dirty || saving} onClick={save}>{saving ? 'Saving…' : 'Save changes'}</button>}
        </div>
        {isContentTab && sectionBody(tab as keyof Content)}
        {tab === 'blog' && <BlogTab posts={posts} setPosts={setPosts} onStatus={setStatus} />}
        {tab === 'account' && <AccountTab username={username} onStatus={setStatus} />}
      </div>
    </div>
  );
}
