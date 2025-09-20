/**
 * Dynamic viewport height handler for mobile Safari compatibility
 */
export const setViewportHeight = () => {
  if (typeof window !== 'undefined') {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
};

/**
 * Initialize viewport height handling
 */
export const initializeViewport = () => {
  if (typeof window !== 'undefined') {
    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);
    
    // Clean up function
    return () => {
      window.removeEventListener('resize', setViewportHeight);
      window.removeEventListener('orientationchange', setViewportHeight);
    };
  }
  return () => {};
};