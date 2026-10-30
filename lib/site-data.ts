// Content shape, default copy and editor field definitions. Safe to import in client components.

export type Hero = { eyebrow: string; leadBold: string; lede: string; portrait: string | null };
export type Chapter = { title: string; body: string; quote: boolean };
export type Craft = { tag: string; title: string; body: string; image: string | null };
export type Photo = { image: string | null; caption: string };
export type Project = { title: string; label: string; body: string; tags: string; size: 'feature' | 'card'; status: string; image: string | null };
export type Milestone = { when: string; title: string; body: string };
export type Content = { hero: Hero; story: Chapter[]; work: Craft[]; gallery: Photo[]; projects: Project[]; journey: Milestone[] };

export type Post = {
  id: number; slug: string; title: string; excerpt: string; body: string;
  cover: string | null; published: boolean; publishedAt: string | null; updatedAt: string;
};

export const DEFAULTS: Content = {
  hero: {
    eyebrow: 'Host · Speaker · Creative · Youth Facilitator',
    leadBold: "A voice for a generation that's ready to move.",
    lede: 'Television, radio, stages and classrooms, with one mission running through all of it: young people stepping into their power.',
    portrait: null,
  },
  story: [
    { title: 'Biography', body: 'Summer Mo is a broadcaster, host and creative whose work moves between the studio, the stage and the community. Known for warm energy and sharp conversation, she builds spaces where people feel seen and young voices get the microphone.', quote: false },
    { title: 'My Beginnings', body: 'It started with a love for people and a habit of talking to everyone. School events, church programmes and community gatherings became the first stages, long before any studio light came on.', quote: false },
    { title: 'Turning Points', body: 'The first live show. The first room full of young people who leaned in. The moment hosting stopped being a job and became a responsibility.', quote: false },
    { title: 'My Philosophy', body: 'Every platform is a chance to hand someone else the mic.', quote: true },
    { title: 'My Vision', body: 'A generation of game changers who are confident, creative and connected. Stories from home told by the people living them, on screens and stages everywhere.', quote: false },
  ],
  work: [
    { tag: 'Broadcast', title: 'Television', body: 'Presenting with presence, on air and on cue.', image: null },
    { tag: 'Broadcast', title: 'Radio', body: 'Live shows driven by voice, timing and listeners.', image: null },
    { tag: 'Conversation', title: 'Interviews', body: 'Questions that get past the press-release answer.', image: null },
    { tag: 'Live', title: 'Event Hosting', body: 'MC for launches, galas, concerts and conferences.', image: null },
    { tag: 'Live', title: 'Public Speaking', body: 'Keynotes and panels on youth, creativity and purpose.', image: null },
    { tag: 'Digital', title: 'Content Creation', body: 'Short-form stories built for the feed and made to last.', image: null },
    { tag: 'Brands', title: 'Creative Strategy', body: "Campaign ideas that speak a young audience's language.", image: null },
    { tag: 'Community', title: 'Youth Facilitation', body: 'Workshops and dialogues where young people lead.', image: null },
  ],
  gallery: [],
  projects: [
    { title: 'MO HEAT', label: 'Flagship', body: "Summer's signature platform for bold conversations, new talent and the culture young people are actually living.", tags: 'Show, Culture, Talent', size: 'feature', status: '', image: null },
    { title: 'Summer School of Game Changers', label: 'Programme', body: 'A hands-on programme in leadership, communication and creative confidence for young people ready to change their game.', tags: 'Education, Leadership, Mentorship', size: 'feature', status: '', image: null },
    { title: 'Youth Initiatives', label: '', body: 'Outreach, dialogues and partnerships that put young people at the centre.', tags: '', size: 'card', status: 'Ongoing', image: null },
    { title: 'Creative Ventures', label: '', body: 'Collaborations across media, fashion, music and digital.', tags: '', size: 'card', status: 'Ongoing', image: null },
    { title: 'Future Projects', label: '', body: 'New formats in development. Partners welcome.', tags: '', size: 'card', status: 'In development', image: null },
  ],
  journey: [
    { when: 'The start', title: 'First mic', body: 'School and community stages where the love for hosting began.' },
    { when: 'On air', title: 'Radio', body: 'Finding the voice: live shows, call-ins and late-night conversations.' },
    { when: 'On screen', title: 'Television', body: 'Stepping in front of the camera and growing a wider audience.' },
    { when: 'On stage', title: 'Hosting & speaking', body: 'Leading events and keynotes across corporate, culture and youth spaces.' },
    { when: 'Building', title: 'MO HEAT & Game Changers', body: 'Turning the platform into platforms for others.' },
    { when: 'Next', title: "What's coming", body: 'New shows, new programmes and new partnerships.' },
  ],
};

export type Field = { k: string; label: string; type: 'text' | 'area' | 'check' | 'select' | 'image'; options?: [string, string][] };
export type Section = { label: string; single?: boolean; item?: string; title?: string; blank?: Record<string, unknown>; empty?: string; fields: Field[] };

export const SECTIONS: Record<keyof Content, Section> = {
  hero: { label: 'Home', single: true, fields: [
    { k: 'eyebrow', label: 'Roles line', type: 'text' },
    { k: 'leadBold', label: 'Headline sentence', type: 'text' },
    { k: 'lede', label: 'Intro', type: 'area' },
    { k: 'portrait', label: 'Portrait photo', type: 'image' } ] },
  story: { label: 'My Story', item: 'chapter', title: 'title', blank: { title: 'New chapter', body: '', quote: false }, fields: [
    { k: 'title', label: 'Title', type: 'text' }, { k: 'body', label: 'Text', type: 'area' }, { k: 'quote', label: 'Show as a large quote', type: 'check' } ] },
  work: { label: 'My Work', item: 'craft', title: 'title', blank: { tag: 'Category', title: 'New craft', body: '', image: null }, fields: [
    { k: 'title', label: 'Title', type: 'text' }, { k: 'tag', label: 'Category', type: 'text' }, { k: 'body', label: 'Description', type: 'area' }, { k: 'image', label: 'Image', type: 'image' } ] },
  gallery: { label: 'Gallery', item: 'photo', title: 'caption', blank: { image: null, caption: '' }, empty: 'No photos yet. The gallery stays hidden on the site until you add one.', fields: [
    { k: 'image', label: 'Photo', type: 'image' }, { k: 'caption', label: 'Caption', type: 'text' } ] },
  projects: { label: 'Projects', item: 'project', title: 'title', blank: { title: 'New project', label: '', body: '', tags: '', size: 'card', status: '', image: null }, fields: [
    { k: 'title', label: 'Title', type: 'text' }, { k: 'size', label: 'Layout', type: 'select', options: [['feature', 'Large feature'], ['card', 'Small card']] },
    { k: 'label', label: 'Label (large only)', type: 'text' }, { k: 'body', label: 'Description', type: 'area' },
    { k: 'tags', label: 'Tags, comma separated (large only)', type: 'text' }, { k: 'status', label: 'Status (small only)', type: 'text' }, { k: 'image', label: 'Image', type: 'image' } ] },
  journey: { label: 'Journey', item: 'milestone', title: 'title', blank: { when: '', title: 'New milestone', body: '' }, fields: [
    { k: 'when', label: 'When (e.g. 2019)', type: 'text' }, { k: 'title', label: 'Title', type: 'text' }, { k: 'body', label: 'Text', type: 'area' } ] },
};

// Only accept images we host (local uploads) or https URLs (Vercel Blob), never other schemes.
export const safeImage = (v: unknown): string | null =>
  typeof v === 'string' && (/^\/uploads\/[A-Za-z0-9._-]+$/.test(v) || /^https:\/\/[^\s"'<>]+$/.test(v)) ? v : null;

// Coerce untrusted JSON into the Content shape, field by field, falling back to defaults.
export function normalizeContent(raw: unknown): Content {
  const d = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const out = JSON.parse(JSON.stringify(DEFAULTS)) as Content;
  const str = (v: unknown, max = 5000) => (typeof v === 'string' ? v.slice(0, max) : '');
  const coerce = (sec: Section, src: unknown) => {
    const o = (src && typeof src === 'object' ? src : {}) as Record<string, unknown>;
    const r: Record<string, unknown> = {};
    for (const f of sec.fields) {
      const v = o[f.k];
      r[f.k] = f.type === 'check' ? Boolean(v)
        : f.type === 'image' ? safeImage(v)
        : f.type === 'select' ? (f.options!.some(([x]) => x === v) ? v : f.options![0][0])
        : str(v);
    }
    return r;
  };
  for (const key of Object.keys(SECTIONS) as (keyof Content)[]) {
    const sec = SECTIONS[key];
    if (d[key] === undefined) continue;
    if (sec.single) (out as Record<string, unknown>)[key] = coerce(sec, d[key]);
    else if (Array.isArray(d[key])) (out as Record<string, unknown>)[key] = (d[key] as unknown[]).slice(0, 100).map(x => coerce(sec, x));
  }
  return out;
}
