import { useEffect, useState } from 'react';
import { getMyProfile, updateMyProfile, type Profile } from '@/lib/profile';
import { supabase } from '@/lib/supabaseClient';

export default function ProfileTest() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    (async () => {
      const p = await getMyProfile();
      setProfile(p);
      setUsername(p?.username ?? '');
    })();
  }, []);

  const save = async () => {
    setStatus('Saving…');
    await updateMyProfile({ username });
    const p = await getMyProfile();
    setProfile(p);
    setStatus('Saved ✔');
    setTimeout(() => setStatus(''), 1200);
  };

  const signIn = async () => {
    const email = prompt('Enter your email for magic link sign-in');
    if (!email) return;
    const { error } = await supabase.auth.signInWithOtp({ email });
    alert(error ? `Sign-in error: ${error.message}` : 'Check your email for the magic link.');
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    alert('Signed out');
  };

  return (
    <div style={{ padding: 24, maxWidth: 520 }}>
      <h1>Profile Test</h1>
      <p style={{ color: '#666' }}>Route: /ProfileTest</p>

      {!profile ? (
        <div>
          <p>No profile loaded (not signed in yet?).</p>
          <button onClick={signIn}>Sign in with magic link</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          <div><strong>User ID:</strong> {profile.id}</div>
          <label>
            <div>Username</div>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your name"
              style={{ padding: 8, width: '100%' }}
            />
          </label>
          <button onClick={save}>Save</button>
          <div style={{ height: 20 }}>{status}</div>
          <button onClick={signOut}>Sign out</button>
        </div>
      )}
    </div>
  );
}