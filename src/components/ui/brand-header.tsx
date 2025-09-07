import React from 'react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/brand/Logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface BrandHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
  showThemeToggle?: boolean;
}

export const BrandHeader = ({ 
  title, 
  subtitle, 
  children, 
  className,
  showThemeToggle = true 
}: BrandHeaderProps) => {
  return (
    <header className={cn(
      "sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50",
      "shadow-sm rounded-b-3xl",
      className
    )}>
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo size={40} showWordmark={false} className="shrink-0" />
            <div className="min-w-0">
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {title}
              </h1>
              {subtitle && (
                <p className="text-lg text-muted-foreground font-light mt-1 leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {children}
            {showThemeToggle && (
              <ThemeToggle className="glass-effect border-border/20" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};