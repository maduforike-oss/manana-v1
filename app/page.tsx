'use client';

import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Palette, Users, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Only show landing page for unauthenticated users
  if (user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center space-x-2">
            <Palette className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Manana
            </span>
          </div>
          <div className="space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/auth">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth">Get Started</Link>
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="text-center mb-20">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
            Design Your Vision
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Professional AI-powered garment design studio. Create, customize, and bring your fashion ideas to life with cutting-edge technology.
          </p>
          <div className="space-x-4">
            <Button size="lg" asChild className="text-lg px-8 py-6">
              <Link href="/auth">Start Creating</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
              <Link href="/auth">Join Community</Link>
            </Button>
          </div>
        </section>

        {/* Features Grid */}
        <section className="grid md:grid-cols-3 gap-8 mb-20">
          <Card className="glass-card border-0">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>AI-Powered Design</CardTitle>
              <CardDescription>
                Transform your ideas into professional garment designs using advanced AI technology
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass-card border-0">
            <CardHeader>
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                <Palette className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle>Professional Tools</CardTitle>
              <CardDescription>
                Access industry-standard design tools and templates for creating stunning apparel
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass-card border-0">
            <CardHeader>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Creative Community</CardTitle>
              <CardDescription>
                Connect with designers, share your work, and get inspired by the community
              </CardDescription>
            </CardHeader>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <Card className="glass-card border-0 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-3xl mb-4">Ready to Start Designing?</CardTitle>
              <CardDescription className="text-lg mb-6">
                Join thousands of creators who are already bringing their fashion visions to life
              </CardDescription>
              <Button size="lg" asChild className="text-lg px-8 py-6">
                <Link href="/auth">Create Your Account</Link>
              </Button>
            </CardHeader>
          </Card>
        </section>
      </div>
    </div>
  );
}