import React, { useEffect, useRef, useState } from 'react';
import { useStudioStore } from '@/lib/studio/store';

interface PerformanceMetrics {
  fps: number;
  renderTime: number;
  nodeCount: number;
  memoryUsage: number;
  lastUpdate: number;
}

interface PerformanceOptimizerProps {
  children: React.ReactNode;
  enableDebug?: boolean;
}

export const PerformanceOptimizer: React.FC<PerformanceOptimizerProps> = ({ 
  children, 
  enableDebug = false 
}) => {
  const { doc } = useStudioStore();
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(Date.now());
  const renderTimeRef = useRef(0);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    renderTime: 0,
    nodeCount: 0,
    memoryUsage: 0,
    lastUpdate: Date.now()
  });

  // Monitor performance metrics
  useEffect(() => {
    let animationFrame: number;
    
    const measurePerformance = () => {
      const now = Date.now();
      frameCountRef.current++;
      
      // Calculate FPS every second
      if (now - lastTimeRef.current >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current));
        
        // Get memory usage if available
        const memoryUsage = (performance as any).memory 
          ? (performance as any).memory.usedJSHeapSize / 1048576 // Convert to MB
          : 0;

        setMetrics({
          fps,
          renderTime: renderTimeRef.current,
          nodeCount: doc.nodes.length,
          memoryUsage,
          lastUpdate: now
        });

        frameCountRef.current = 0;
        lastTimeRef.current = now;
        renderTimeRef.current = 0;
      }
      
      animationFrame = requestAnimationFrame(measurePerformance);
    };

    measurePerformance();
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [doc.nodes.length]);

  // Performance optimization suggestions
  useEffect(() => {
    if (metrics.fps < 30) {
      console.warn('Low FPS detected:', metrics.fps, 'Consider reducing node count or complexity');
    }
    
    if (metrics.nodeCount > 1000) {
      console.warn('High node count:', metrics.nodeCount, 'Consider implementing virtualization');
    }
    
    if (metrics.memoryUsage > 100) {
      console.warn('High memory usage:', metrics.memoryUsage, 'MB');
    }
  }, [metrics]);

  return (
    <>
      {children}
      {enableDebug && (
        <div className="fixed top-4 right-4 bg-background/95 backdrop-blur border rounded-lg p-3 text-sm font-mono z-50">
          <div className="space-y-1">
            <div className={metrics.fps < 30 ? 'text-red-500' : 'text-green-500'}>
              FPS: {metrics.fps}
            </div>
            <div>Render: {metrics.renderTime.toFixed(2)}ms</div>
            <div>Nodes: {metrics.nodeCount}</div>
            <div>Memory: {metrics.memoryUsage.toFixed(1)}MB</div>
          </div>
        </div>
      )}
    </>
  );
};