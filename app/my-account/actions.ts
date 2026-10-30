'use server';
import { revalidatePath } from 'next/cache';
import { changeCredentials, login, logout, requireUser } from '@/lib/auth';
import { createPost, deletePost, saveContent, updatePost, type PostInput } from '@/lib/content';

// Every action re-checks the session; Next.js also rejects cross-origin action calls.

export async function loginAction(_prev: string | null, form: FormData) {
  const username = String(form.get('username') ?? '').trim();
  const password = String(form.get('password') ?? '');
  if (!username || !password) return 'Enter your username and password.';
  const res = await login(username, password);
  if (!res.ok) return res.error;
  revalidatePath('/my-account');
  return null;
}

export async function logoutAction() {
  await logout();
  revalidatePath('/my-account');
}

export async function saveContentAction(draft: unknown) {
  await requireUser();
  const saved = await saveContent(draft);
  revalidatePath('/');
  return saved;
}

export async function savePostAction(id: number | null, input: PostInput) {
  await requireUser();
  const post = id == null ? await createPost(input) : await updatePost(id, input);
  revalidatePath('/'); revalidatePath('/blog');
  if (post) revalidatePath(`/blog/${post.slug}`);
  return post;
}

export async function deletePostAction(id: number) {
  await requireUser();
  await deletePost(id);
  revalidatePath('/'); revalidatePath('/blog');
}

export async function accountAction(input: { current: string; username: string; password: string }) {
  const user = await requireUser();
  const err = await changeCredentials(user, input.current, { username: input.username, password: input.password });
  return err;
}
