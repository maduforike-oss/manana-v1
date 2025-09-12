import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from '../components/ui/toast';

type Mode = 'password' | 'magic';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Where to go after successful sign-in
  const redirectTo = useMemo(() => {
    const redirect = router.query.redirect as string;
    if (redirect && redirect.startsWith('/')) return redirect;
    return '/'; // default home
  }, [router.query.redirect]);

  // If already signed in, bounce away
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) router.replace(redirectTo);
    })();
  }, [redirectTo, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'password') {
        // email + password flow (no email clicks)
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({
          title: "Welcome back!",
          description: "You've been signed in successfully.",
        });
        router.replace(redirectTo);
      } else {
        // magic link flow
        const url = typeof window !== 'undefined'
          ? `${window.location.origin}${redirectTo === '/' ? '' : redirectTo}`
          : undefined;

        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: url, shouldCreateUser: true },
        });
        if (error) throw error;
        setSent(true);
        toast({
          title: "Magic link sent!",
          description: `Check your email at ${email} for the sign-in link.`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error?.message ?? 'Please try again.',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
          <CardDescription>
            {mode === 'password'
              ? 'Use your email and password to continue.'
              : 'Enter your email and we\'ll send you a magic link.'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Mode switch */}
          <div className="flex rounded-lg border p-1 bg-muted">
            <Button
              type="button"
              variant={mode === 'password' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('password')}
              className="flex-1"
            >
              Email + Password
            </Button>
            <Button
              type="button"
              variant={mode === 'magic' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('magic')}
              className="flex-1"
            >
              Magic Link
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            {mode === 'password' && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Please wait…' : mode === 'password' ? 'Sign in' : 'Send magic link'}
            </Button>

            {mode === 'magic' && sent && (
              <div className="text-center text-sm text-muted-foreground">
                Magic link sent to <strong>{email}</strong>. Check your inbox and click the link to sign in.
              </div>
            )}
          </form>

          {/* Helper note */}
          <div className="text-xs text-muted-foreground text-center">
            After sign-in you'll be redirected to {redirectTo}.
            Add <code className="bg-muted px-1 rounded">?redirect=/profile</code> to the URL to change that.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}