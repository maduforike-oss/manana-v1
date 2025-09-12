import { supabase } from './supabaseClient';

let tried = false;

export async function devAutoSignIn() {
  if (process.env.NODE_ENV !== 'development') return;
  if (tried) return; // avoid loops on hot reload
  tried = true;

  const email = process.env.NEXT_PUBLIC_DEV_EMAIL;
  const password = process.env.NEXT_PUBLIC_DEV_PASSWORD;

  if (!email || !password) {
    console.warn('[devAuth] Set NEXT_PUBLIC_DEV_EMAIL and NEXT_PUBLIC_DEV_PASSWORD in .env.local');
    return;
  }

  // if already signed in, skip
  const { data: { user } } = await supabase.auth.getUser();
  if (user) return;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) console.warn('[devAuth] Dev sign-in failed:', error.message);
  else console.log('[devAuth] Auto-signed in for development');
}