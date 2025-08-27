import React, { useState, useEffect, useCallback } from 'react';
import { useStudioStore } from '../../../lib/studio/store';
import { useAppStore } from '../../../store/useAppStore';
import { StudioLoadingTransition } from '../StudioLoadingTransition';

interface AsyncStudioInitializerProps {
  children: React.ReactNode;
  onInitialized?: () => void;
}

// Async studio initialization to prevent blocking UI
export const AsyncStudioInitializer = ({ children, onInitialized }: AsyncStudioInitializerProps) => {
  const [initState, setInitState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  
  const { currentDesign } = useAppStore();
  const { initializeFromGarment, loadStudioFromAppDesign } = useStudioStore();

  const initializeStudio = useCallback(async () => {
    if (!currentDesign || initState !== 'idle') return;

    setInitState('loading');
    setError(null);

    try {
      // Use requestIdleCallback for non-blocking initialization
      await new Promise(resolve => {
        const initialize = async () => {
          try {
            if (loadStudioFromAppDesign) {
              await loadStudioFromAppDesign(currentDesign);
            } else {
              // Fallback initialization
              initializeFromGarment(currentDesign.garmentType || 'tshirt-white', 'white');
            }
            
            // Allow UI to update
            await new Promise(r => setTimeout(r, 100));
            resolve(void 0);
          } catch (err) {
            console.error('Studio initialization failed:', err);
            // Graceful fallback
            initializeFromGarment(currentDesign.garmentType || 'tshirt-white', 'white');
            resolve(void 0);
          }
        };

        if (window.requestIdleCallback) {
          window.requestIdleCallback(() => initialize(), { timeout: 2000 });
        } else {
          setTimeout(() => initialize(), 16); // Fallback for browsers without requestIdleCallback
        }
      });

      setInitState('ready');
      onInitialized?.();
    } catch (err) {
      console.error('Critical studio initialization error:', err);
      setError(err instanceof Error ? err.message : 'Unknown initialization error');
      setInitState('error');
    }
  }, [currentDesign, initState, loadStudioFromAppDesign, initializeFromGarment, onInitialized]);

  // Initialize when design changes
  useEffect(() => {
    if (currentDesign && initState === 'idle') {
      initializeStudio();
    }
  }, [currentDesign, initState, initializeStudio]);

  // Reset when design changes
  useEffect(() => {
    setInitState('idle');
    setError(null);
  }, [currentDesign?.id]);

  // Error state
  if (initState === 'error') {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md p-6">
          <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Studio Initialization Failed
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {error || 'Failed to load the design studio. Please try refreshing the page.'}
          </p>
          <button 
            onClick={() => {
              setInitState('idle');
              setError(null);
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (initState === 'loading') {
    return <StudioLoadingTransition isLoading={true} />;
  }

  // Ready state
  return <>{children}</>;
};