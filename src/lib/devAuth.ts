import { supabase } from '@/integrations/supabase/client';

let tried = false;

export async function devAutoSignIn() {
  if (import.meta.env.MODE !== 'development') return;
  if (tried) return; // avoid loops on hot reload
  tried = true;

  const email = import.meta.env.VITE_DEV_EMAIL;
  const password = import.meta.env.VITE_DEV_PASSWORD;

  if (!email || !password) {
    console.warn('[devAuth] Set VITE_DEV_EMAIL and VITE_DEV_PASSWORD in .env');
    return;
  }

  // if already signed in, skip
  const { data: { user } } = await supabase.auth.getUser();
  if (user) return;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) console.warn('[devAuth] Dev sign-in failed:', error.message);
  else console.log('[devAuth] Auto-signed in for development');
}