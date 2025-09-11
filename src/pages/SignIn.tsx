'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Eye, EyeOff, Mail } from 'lucide-react';
import { getErrorMessage } from '@/lib/errors';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);
    
    try {
      if (isSignUp) {
        if (!password || password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }
        
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
        if (!password) {
          throw new Error('Password is required');
        }
        
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        navigate('/');
      }
    } catch (error: any) {
      setErr(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const onMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/` }
      });
      if (error) throw error;
      setSent(true);
    } catch (error: any) {
      setErr(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </CardTitle>
          <CardDescription>
            {isSignUp 
              ? 'Join the Manana community and start creating' 
              : 'Sign in to access your designs and profile'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Check your email</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  We sent a magic link to <span className="font-medium">{email}</span>
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setSent(false)} 
                className="w-full"
              >
                Back to sign in
              </Button>
            </div>
          ) : (
            <>
              {/* Email + Password Form */}
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="h-11"
                    disabled={isLoading}
                  />
                </div>
                
                {(isSignUp || password) && (
                  <div className="space-y-2 relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      required={isSignUp}
                      placeholder={isSignUp ? "Create a password (min 6 chars)" : "Enter your password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="h-11 pr-10"
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-11 px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full h-11"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {isSignUp ? 'Creating account...' : 'Signing in...'}
                    </div>
                  ) : (
                    isSignUp ? 'Create account' : 'Sign in'
                  )}
                </Button>
              </form>
              
              {/* Toggle between sign in/up */}
              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setPassword('');
                    setErr(null);
                  }}
                  className="text-sm"
                  disabled={isLoading}
                >
                  {isSignUp 
                    ? 'Already have an account? Sign in' 
                    : "Don't have an account? Sign up"
                  }
                </Button>
              </div>
              
              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              
              {/* Magic Link */}
              <Button
                onClick={onMagicLink}
                variant="outline"
                className="w-full h-11"
                disabled={isLoading}
              >
                <Mail className="w-4 h-4 mr-2" />
                Send magic link
              </Button>
              
              {/* Error Display */}
              {err && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-destructive">{err}</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}