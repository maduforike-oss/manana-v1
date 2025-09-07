import React, { useEffect, useState } from 'react';

interface AccessibilityAnnouncerProps {
  message: string;
  priority?: 'polite' | 'assertive';
  clearAfter?: number;
}

export const AccessibilityAnnouncer = ({ 
  message, 
  priority = 'polite', 
  clearAfter = 5000 
}: AccessibilityAnnouncerProps) => {
  const [currentMessage, setCurrentMessage] = useState(message);

  useEffect(() => {
    setCurrentMessage(message);
    
    if (clearAfter > 0) {
      const timer = setTimeout(() => {
        setCurrentMessage('');
      }, clearAfter);
      
      return () => clearTimeout(timer);
    }
  }, [message, clearAfter]);

  return (
    <div
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
      role="status"
    >
      {currentMessage}
    </div>
  );
};

// Global announcer hook
let globalAnnounceFn: ((message: string, priority?: 'polite' | 'assertive') => void) | null = null;

export const useAccessibilityAnnouncer = () => {
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'polite' | 'assertive'>('polite');

  useEffect(() => {
    globalAnnounceFn = (msg: string, prio: 'polite' | 'assertive' = 'polite') => {
      setMessage(msg);
      setPriority(prio);
    };

    return () => {
      globalAnnounceFn = null;
    };
  }, []);

  return {
    announcer: (
      <AccessibilityAnnouncer 
        message={message} 
        priority={priority} 
        clearAfter={5000} 
      />
    ),
    announce: (msg: string, prio: 'polite' | 'assertive' = 'polite') => {
      setMessage(msg);
      setPriority(prio);
    }
  };
};

// Global announce function
export const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  if (globalAnnounceFn) {
    globalAnnounceFn(message, priority);
  }
};