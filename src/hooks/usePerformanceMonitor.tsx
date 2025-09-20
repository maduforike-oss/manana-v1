import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  componentMountTime: number;
}

export const usePerformanceMonitor = (componentName: string) => {
  const mountTime = useRef(performance.now());
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current++;
    const renderTime = performance.now() - lastRenderTime.current;
    lastRenderTime.current = performance.now();

    // Log slow renders in development
    if (process.env.NODE_ENV === 'development' && renderTime > 16.67) {
      console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
    }

    // Monitor memory usage if available
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      if (memory.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB threshold
        console.warn(`High memory usage detected: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
      }
    }
  });

  useEffect(() => {
    const componentMountTime = performance.now() - mountTime.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} mounted in ${componentMountTime.toFixed(2)}ms`);
    }

    return () => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} unmounted after ${renderCount.current} renders`);
      }
    };
  }, [componentName]);

  const getMetrics = (): PerformanceMetrics => ({
    renderTime: performance.now() - lastRenderTime.current,
    memoryUsage: 'memory' in performance ? (performance as any).memory.usedJSHeapSize : undefined,
    componentMountTime: performance.now() - mountTime.current,
  });

  return { getMetrics, renderCount: renderCount.current };
};