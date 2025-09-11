'use client';

import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined }
    });
    if (error) setErr(error.message);
    else setSent(true);
  };

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
      {sent ? (
        <p className="text-sm">Magic link sent to <b>{email}</b>. Check your inbox.</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full rounded border px-3 py-2"
          />
          <button type="submit" className="w-full rounded bg-pink-600 text-white py-2 font-medium">
            Send magic link
          </button>
          {err && <p className="text-sm text-red-600">{err}</p>}
        </form>
      )}
      <p className="text-xs text-gray-500 mt-6">You'll be redirected back here after sign-in.</p>
    </div>
  );
}