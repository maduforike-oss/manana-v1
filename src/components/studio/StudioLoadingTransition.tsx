import React from 'react';
import { useAppStore } from '@/store/useAppStore';

interface StudioLoadingTransitionProps {
  isLoading: boolean;
}

export const StudioLoadingTransition = ({ isLoading }: StudioLoadingTransitionProps) => {
  const { currentDesign } = useAppStore();
  
  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-6 max-w-md text-center">
        {/* Loading spinner with elegant animation */}
        <div className="relative">
          <div className="w-12 h-12 border-2 border-primary/20 rounded-full" />
          <div className="absolute inset-0 w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        
        {/* Loading text with fade animation */}
        <div className="space-y-2 animate-fade-in">
          <h3 className="text-lg font-semibold text-foreground">
            Loading {currentDesign?.name || 'Design'}
          </h3>
          <p className="text-sm text-muted-foreground">
            Preparing {currentDesign?.garmentType?.replace('-', ' ') || 'garment'} canvas
          </p>
        </div>
        
        {/* Progress indicators */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse delay-75" />
          <div className="w-2 h-2 bg-primary/40 rounded-full animate-pulse delay-150" />
        </div>
      </div>
    </div>
  );
};