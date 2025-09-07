import React from 'react';
import { Button } from '@/components/ui/button';

export const SkipToContent = () => {
  const skipToMain = () => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView();
    }
  };

  return (
    <Button
      onClick={skipToMain}
      variant="secondary"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[100] bg-primary text-primary-foreground"
      onFocus={(e) => {
        e.target.classList.remove('sr-only');
      }}
      onBlur={(e) => {
        e.target.classList.add('sr-only');
      }}
    >
      Skip to main content
    </Button>
  );
};