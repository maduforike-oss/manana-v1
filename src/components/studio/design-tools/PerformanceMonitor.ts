interface PerformanceMetrics {
  toolSwitchTime: number;
  memoryUsage: number;
  frameRate: number;
  eventLatency: number;
}

class DesignToolsPerformanceMonitor {
  private metrics: PerformanceMetrics = {
    toolSwitchTime: 0,
    memoryUsage: 0,
    frameRate: 60,
    eventLatency: 0
  };

  private frameCount = 0;
  private lastFrameTime = performance.now();
  private memoryCheckInterval?: NodeJS.Timeout;

  constructor() {
    this.startMonitoring();
  }

  private startMonitoring(): void {
    // Monitor frame rate
    this.monitorFrameRate();
    
    // Monitor memory usage every 30 seconds
    this.memoryCheckInterval = setInterval(() => {
      this.checkMemoryUsage();
    }, 30000);
  }

  private monitorFrameRate(): void {
    const frame = () => {
      const now = performance.now();
      const delta = now - this.lastFrameTime;
      
      if (delta >= 1000) {
        this.metrics.frameRate = Math.round((this.frameCount * 1000) / delta);
        this.frameCount = 0;
        this.lastFrameTime = now;
      }
      
      this.frameCount++;
      requestAnimationFrame(frame);
    };
    
    requestAnimationFrame(frame);
  }

  private checkMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024); // MB
      
      // Log warning if memory usage is high
      if (this.metrics.memoryUsage > 100) {
        console.warn(`High memory usage detected: ${this.metrics.memoryUsage}MB`);
      }
    }
  }

  trackToolSwitch(fromTool: string, toTool: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      this.metrics.toolSwitchTime = duration;
      
      // Log slow tool switches
      if (duration > 50) {
        console.warn(`Slow tool switch: ${fromTool} → ${toTool} (${duration.toFixed(2)}ms)`);
      }
      
      // Track in analytics if available
      if (typeof window !== 'undefined' && (window as any).analytics) {
        (window as any).analytics.track('tool_switch_performance', {
          from: fromTool,
          to: toTool,
          duration: duration,
          timestamp: Date.now()
        });
      }
    };
  }

  trackEventLatency(eventType: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const latency = performance.now() - startTime;
      this.metrics.eventLatency = latency;
      
      // Log high latency events
      if (latency > 16) { // > 1 frame at 60fps
        console.warn(`High event latency: ${eventType} (${latency.toFixed(2)}ms)`);
      }
    };
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  logPerformanceReport(): void {
    const report = {
      ...this.metrics,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
    
    console.table(report);
    
    // Send to analytics if available
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('performance_report', report);
    }
  }

  destroy(): void {
    if (this.memoryCheckInterval) {
      clearInterval(this.memoryCheckInterval);
    }
  }
}

// Singleton instance
export const performanceMonitor = new DesignToolsPerformanceMonitor();

// Log performance report every 5 minutes in development
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    performanceMonitor.logPerformanceReport();
  }, 5 * 60 * 1000);
}