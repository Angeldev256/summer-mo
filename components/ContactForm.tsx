'use client';
import { useRef, useState } from 'react';

const KINDS = ['Event hosting', 'Speaking', 'Brand partnership', 'Youth programme'];

export function ContactForm() {
  const [note, setNote] = useState('');
  const nameRef = useRef<HTMLInputElement>(null), emailRef = useRef<HTMLInputElement>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const n = nameRef.current!, em = emailRef.current!;
    if (!n.value.trim()) { setNote('Add your name so the team knows who to reply to.'); n.focus(); return; }
    if (!/^\S+@\S+\.\S+$/.test(em.value)) { setNote('Enter a valid email address, like you@company.com.'); em.focus(); return; }
    setNote(`Thanks, ${n.value.trim().split(' ')[0]}. This form isn't connected to an inbox yet.`);
  }

  return (
    <form className="rv" noValidate onSubmit={submit}>
      <div className="field"><label htmlFor="name">Name</label><input ref={nameRef} id="name" type="text" autoComplete="name" placeholder="Your full name" /></div>
      <div className="field"><label htmlFor="email">Email</label><input ref={emailRef} id="email" type="email" autoComplete="email" placeholder="you@company.com" /></div>
      <div className="field"><label>I&apos;m interested in</label>
        <div className="chips">
          {KINDS.map((k, i) => (
            <span key={k} style={{ display: 'contents' }}>
              <input type="radio" name="kind" id={`k${i}`} defaultChecked={i === 0} /><label htmlFor={`k${i}`}>{k}</label>
            </span>
          ))}
        </div>
      </div>
      <div className="field"><label htmlFor="msg">Details</label><textarea id="msg" rows={3} placeholder="Date, location, audience…" /></div>
      <div><button className="btn solid" type="submit" style={{ cursor: 'pointer', font: 'inherit' }}>Send enquiry <span className="arr">→</span></button></div>
      <p className="note" role="status">{note}</p>
    </form>
  );
}
