import React from 'react';
import { cn } from '@/lib/utils';

interface BrandHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const BrandHeader = ({ title, subtitle, icon, children, className }: BrandHeaderProps) => {
  return (
    <div className={cn("sticky top-0 z-40 glass-nav", className)}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                {icon}
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>
          {children && (
            <div className="flex items-center gap-2">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};