'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already signed in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    
    try {
      if (isSignUp) {
        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl
          }
        });
        if (error) throw error;
        setSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        navigate('/');
      }
    } catch (error: any) {
      setErr(error.message);
    }
  };

  const onMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/` }
      });
      if (error) throw error;
      setSent(true);
    } catch (error: any) {
      setErr(error.message);
    }
  };

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold mb-4">
        {isSignUp ? 'Sign up' : 'Sign in'}
      </h1>
      
      {sent ? (
        <div className="text-sm">
          <p>Magic link sent to <b>{email}</b>. Check your inbox.</p>
          <button 
            onClick={() => setSent(false)} 
            className="mt-4 text-pink-600 hover:underline"
          >
            Back to sign in
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <form onSubmit={onSubmit} className="space-y-4">
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
            {(isSignUp || password) && (
              <input
                type="password"
                required={isSignUp}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded border px-3 py-2"
              />
            )}
            <button 
              type="submit" 
              className="w-full rounded bg-pink-600 text-white py-2 font-medium"
            >
              {isSignUp ? 'Sign up' : 'Sign in'}
            </button>
          </form>
          
          <div className="text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-pink-600 hover:underline"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>
          
          <button
            onClick={onMagicLink}
            className="w-full rounded border border-gray-300 bg-white py-2 font-medium text-gray-700 hover:bg-gray-50"
          >
            Send magic link
          </button>
          
          {err && <p className="text-sm text-red-600">{err}</p>}
        </div>
      )}
    </div>
  );
}