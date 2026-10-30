import Link from 'next/link';

const LINKS = [
  ['story', 'My Story'], ['work', 'My Work'], ['projects', 'Projects'], ['impact', 'Impact'],
  ['journey', 'The Journey'], ['blog', 'Blog'], ['contact', 'Contact'],
];

// On the home page links scroll to sections; elsewhere they go back to the home page section.
export function Nav({ home = false }: { home?: boolean }) {
  const pre = home ? '' : '/';
  return (
    <nav aria-label="Main">
      <div className="wrap">
        <Link href={home ? '#home' : '/'} className="brand">SUMMER MO</Link>
        <div className="links" id="links">
          {LINKS.map(([id, label]) => <a key={id} href={`${pre}#${id}`}>{label}</a>)}
        </div>
      </div>
    </nav>
  );
}

export function Footer() {
  return (
    <footer>
      <div className="wrap">
        <span>© {new Date().getFullYear()} Summer Mo</span>
        <span>Host · Speaker · Creative</span>
      </div>
    </footer>
  );
}

export const fmtDate = (s: string | null) =>
  s ? new Date(s.replace(' ', 'T') + 'Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) : '';
