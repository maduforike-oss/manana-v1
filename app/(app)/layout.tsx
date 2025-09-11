'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-6 md:gap-10">
            <a href="/dashboard" className="flex items-center space-x-2">
              <span className="inline-block text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Manana</span>
            </a>
          </div>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <a href="/dashboard" className="transition-colors hover:text-foreground/80">Dashboard</a>
            <a href="/designs" className="transition-colors hover:text-foreground/80">Designs</a>
            <a href="/orders" className="transition-colors hover:text-foreground/80">Orders</a>
            <a href="/profile" className="transition-colors hover:text-foreground/80">Profile</a>
          </nav>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="hidden lg:block glass-card h-fit sticky top-6">
            <div className="text-base font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Sections</div>
            <nav className="space-y-3">
              <a href="/dashboard" className="flex items-center px-4 py-3 rounded-xl hover:bg-glass-light/50 transition-all duration-300 hover:scale-105 font-medium">Dashboard</a>
              <a href="/designs" className="flex items-center px-4 py-3 rounded-xl hover:bg-glass-light/50 transition-all duration-300 hover:scale-105 font-medium">Designs</a>
              <a href="/orders" className="flex items-center px-4 py-3 rounded-xl hover:bg-glass-light/50 transition-all duration-300 hover:scale-105 font-medium">Orders</a>
              <a href="/profile" className="flex items-center px-4 py-3 rounded-xl hover:bg-glass-light/50 transition-all duration-300 hover:scale-105 font-medium">Profile</a>
            </nav>
          </aside>
          <section className="min-w-0">{children}</section>
        </div>
      </div>
    </div>
  );
}