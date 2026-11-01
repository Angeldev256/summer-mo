'use client';
import { useEffect } from 'react';

// Scroll and reveal animations for the home page, ported from the original single-file site.
export function SiteEffects() {
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const q = <T extends Element = HTMLElement>(s: string) => [...document.querySelectorAll<T & Element>(s)] as unknown as T[];
    const $ = (id: string) => document.getElementById(id);
    const timers: number[] = [];

    // reveal-on-scroll: only hide blocks that start off-screen
    let io: IntersectionObserver | null = null;
    if (!reduce && 'IntersectionObserver' in window) {
      io = new IntersectionObserver(es => es.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target as HTMLElement;
        const sibs = [...el.parentElement!.children].filter(c => c.classList.contains('rv'));
        el.style.transitionDelay = Math.min(sibs.indexOf(el), 7) * 70 + 'ms';
        el.classList.remove('pre'); io!.unobserve(el);
      }), { rootMargin: '0px 0px -8% 0px' });
      q<HTMLElement>('.rv').forEach(el => {
        if (el.getBoundingClientRect().top > innerHeight * 0.95) { el.classList.add('pre'); io!.observe(el); }
      });
    }

    const words = q<HTMLElement>('#rot span'); let wi = 0;
    if (!reduce && words.length) timers.push(window.setInterval(() => {
      const cur = words[wi]; wi = (wi + 1) % words.length; const nxt = words[wi];
      cur.classList.replace('on', 'out'); nxt.classList.remove('out'); nxt.classList.add('on');
      setTimeout(() => cur.classList.remove('out'), 800);
    }, 2400));
    if (!reduce) timers.push(window.setInterval(() =>
      q<HTMLElement>('.gc-art').forEach(g => g.children[Math.floor(Math.random() * 64)]?.classList.toggle('lit')), 500));

    const st = $('statement');
    const ws = q<HTMLElement>('#statement .w');
    const links = q<HTMLAnchorElement>('#links a');
    const secs = links.map(a => document.querySelector(a.getAttribute('href')!));
    const sLinks = q<HTMLAnchorElement>('#storyNav a');
    const chs = sLinks.map(a => document.querySelector(a.getAttribute('href')!));
    const heats = q<HTMLElement>('.heat-art .word');
    const stops = q<HTMLElement>('#stops .stop');

    let ticking = false, lastCur = -2;
    function frame() {
      ticking = false;
      const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
      const prog = $('progress'); if (prog) prog.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
      let cur = -1; secs.forEach((s, k) => { if (s && s.getBoundingClientRect().top < innerHeight * 0.4) cur = k; });
      links.forEach((a, k) => a.classList.toggle('on', k === cur));
      // On phones the nav row scrolls sideways: keep the current section's link in view.
      if (cur !== lastCur) {
        lastCur = cur;
        const a = links[cur], row = a?.parentElement;
        if (a && row && row.scrollWidth > row.clientWidth) row.scrollTo({ left: row.scrollLeft + a.getBoundingClientRect().left - row.getBoundingClientRect().left - (row.clientWidth - a.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' });
      }
      let sc = 0; chs.forEach((c, k) => { if (c && c.getBoundingClientRect().top < innerHeight * 0.45) sc = k; });
      sLinks.forEach((a, k) => a.classList.toggle('on', k === sc));
      if (st) {
        const sr = st.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (innerHeight * 0.85 - sr.top) / (sr.height + innerHeight * 0.35)));
        const lit = reduce ? ws.length : Math.round(p * ws.length);
        ws.forEach((w, k) => w.classList.toggle('on', k < lit));
      }
      if (!reduce) heats.forEach(hw => { const r = hw.parentElement!.getBoundingClientRect(); hw.style.transform = `translateX(${(r.top - innerHeight / 2) * -0.12}px)`; });
      const tl = $('timeline'), fill = $('fill');
      if (tl && fill) {
        const r = tl.getBoundingClientRect();
        fill.style.height = Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / r.height)) * 100 + '%';
      }
      stops.forEach(s => s.classList.toggle('on', s.getBoundingClientRect().top < innerHeight * 0.6));
    }
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', frame);
    frame();

    return () => {
      removeEventListener('scroll', onScroll); removeEventListener('resize', frame);
      timers.forEach(clearInterval); io?.disconnect();
    };
  }, []);
  return null;
}
