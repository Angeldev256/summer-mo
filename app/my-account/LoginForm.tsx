'use client';
import { useActionState } from 'react';
import { loginAction } from './actions';

export function LoginForm() {
  const [error, action, pending] = useActionState(loginAction, null);
  return (
    <form action={action} className="login-form">
      <label className="af"><span>Username</span>
        <input type="text" name="username" autoComplete="username" required autoFocus />
      </label>
      <label className="af"><span>Password</span>
        <input type="password" name="password" autoComplete="current-password" required />
      </label>
      <p className="note" role="alert">{error}</p>
      <button className="abtn primary" type="submit" disabled={pending}>{pending ? 'Signing in…' : 'Sign in'}</button>
    </form>
  );
}
