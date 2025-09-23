import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  fps: number;
  latency: number;
  memoryUsage: number;
  updateCount: number;
}

class CursorPerformanceTracker {
  private frameCount = 0;
  private lastFrameTime = 0;
  private startTime = Date.now();
  private updateTimes: number[] = [];
  private maxSamples = 60; // Track last 60 updates

  public trackUpdate(): void {
    const now = performance.now();
    this.updateTimes.push(now);
    
    // Keep only recent samples
    if (this.updateTimes.length > this.maxSamples) {
      this.updateTimes.shift();
    }
    
    this.frameCount++;
  }

  public getMetrics(): PerformanceMetrics {
    const now = performance.now();
    
    // Calculate FPS from recent samples only
    let fps = 0;
    if (this.updateTimes.length > 1) {
      const timeSpan = (this.updateTimes[this.updateTimes.length - 1] - this.updateTimes[0]) / 1000;
      fps = timeSpan > 0 ? (this.updateTimes.length - 1) / timeSpan : 0;
    }
    
    // Calculate average latency between updates
    let latency = 0;
    if (this.updateTimes.length > 1) {
      const intervals = [];
      for (let i = 1; i < this.updateTimes.length; i++) {
        intervals.push(this.updateTimes[i] - this.updateTimes[i - 1]);
      }
      latency = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    }

    // Memory usage (if available)
    const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;

    return {
      fps: Math.round(fps),
      latency: Math.round(latency * 100) / 100, // Round to 2 decimals
      memoryUsage: Math.round(memoryUsage / 1024 / 1024), // Convert to MB
      updateCount: this.frameCount
    };
  }

  public reset(): void {
    this.frameCount = 0;
    this.startTime = Date.now();
    this.updateTimes = [];
  }
}

// Global performance tracker instance
const cursorPerformanceTracker = new CursorPerformanceTracker();

export const useCursorPerformanceMonitor = (enabled: boolean = false) => {
  const metricsRef = useRef<PerformanceMetrics | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let rafId: number;
    let logInterval: NodeJS.Timeout;

    const trackFrame = () => {
      cursorPerformanceTracker.trackUpdate();
      rafId = requestAnimationFrame(trackFrame);
    };

    const logMetrics = () => {
      const metrics = cursorPerformanceTracker.getMetrics();
      metricsRef.current = metrics;
      
      // Only log performance warnings when issues occur
      if (metrics.fps < 30) {
        console.warn(`[Cursor Performance] Low FPS detected: ${metrics.fps}fps`);
      }
      
      if (metrics.latency > 32) {
        console.warn(`[Cursor Performance] High latency detected: ${metrics.latency}ms`);
      }
    };

    // Start tracking
    rafId = requestAnimationFrame(trackFrame);
    logInterval = setInterval(logMetrics, 30000); // Log every 30 seconds, only if there are issues

    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(logInterval);
    };
  }, [enabled]);

  return metricsRef.current;
};

// Export the tracker for manual use
export { cursorPerformanceTracker };

// Performance optimization utilities
export const optimizeCursorUpdates = {
  // Throttle cursor updates to 60fps max
  throttleUpdate: (() => {
    let lastUpdate = 0;
    const targetFPS = 60;
    const frameTime = 1000 / targetFPS;
    
    return (callback: () => void) => {
      const now = Date.now();
      if (now - lastUpdate >= frameTime) {
        callback();
        lastUpdate = now;
        cursorPerformanceTracker.trackUpdate();
      }
    };
  })(),

  // Debounce expensive cursor operations
  debounce: (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  }
};
