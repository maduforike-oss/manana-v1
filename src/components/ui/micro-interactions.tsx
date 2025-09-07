import React from 'react';
import { cn } from '@/lib/utils';

interface MicroInteractionProps {
  children: React.ReactNode;
  type?: 'hover' | 'click' | 'focus' | 'success' | 'error';
  className?: string;
  disabled?: boolean;
}

export const MicroInteraction = ({ 
  children, 
  type = 'hover', 
  className, 
  disabled = false 
}: MicroInteractionProps) => {
  const [isActive, setIsActive] = React.useState(false);

  const handleInteraction = () => {
    if (disabled) return;
    
    setIsActive(true);
    setTimeout(() => setIsActive(false), 300);
  };

  const getAnimationClass = () => {
    switch (type) {
      case 'success':
        return isActive ? 'animate-bounce-gentle' : '';
      case 'error':
        return isActive ? 'animate-shake' : '';
      case 'click':
        return isActive ? 'animate-scale-in' : '';
      default:
        return '';
    }
  };

  return (
    <div
      className={cn(
        'transition-all duration-200',
        !disabled && 'hover:-translate-y-0.5 hover:shadow-sm',
        getAnimationClass(),
        className
      )}
      onClick={handleInteraction}
      onFocus={handleInteraction}
    >
      {children}
    </div>
  );
};

// AI Integration placeholder for future
export const AIAssistantPlaceholder = () => {
  return (
    <div className="fixed bottom-20 right-4 z-40">
      <button
        className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 hidden"
        aria-label="AI Design Assistant (Coming Soon)"
        disabled
      >
        <svg className="w-6 h-6 mx-auto text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </button>
    </div>
  );
};