import React from 'react';
import { cn } from '@/lib/utils';

interface FeedbackToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  className?: string;
}

export const useFeedback = () => {
  const showFeedback = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = cn(
      'fixed top-4 right-4 z-50 p-3 rounded-lg shadow-lg transform translate-x-full transition-all duration-300',
      type === 'success' && 'bg-emerald-500 text-white',
      type === 'error' && 'bg-red-500 text-white',
      type === 'info' && 'bg-primary text-primary-foreground'
    );
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.classList.remove('translate-x-full');
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
      toast.classList.add('translate-x-full');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  };

  return { showFeedback };
};