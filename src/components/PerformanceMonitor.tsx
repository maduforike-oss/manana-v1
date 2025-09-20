import React, { useEffect, useState } from 'react';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';

interface PerformanceStats {
  fps: number;
  memory: number;
  loadTime: number;
  renderTime: number;
}

export const PerformanceMonitor = () => {
  const [stats, setStats] = useState<PerformanceStats>({
    fps: 0,
    memory: 0,
    loadTime: 0,
    renderTime: 0
  });
  const [isVisible, setIsVisible] = useState(process.env.NODE_ENV === 'development');

  useEffect(() => {
    if (!isVisible) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        setStats(prev => ({
          ...prev,
          fps,
          memory: 'memory' in performance ? 
            Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024) : 0,
          loadTime: Math.round(currentTime - (performance.timing?.loadEventStart || 0)),
          renderTime: Math.round(currentTime - lastTime)
        }));

        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(measureFPS);
    };

    measureFPS();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-48 opacity-80 hover:opacity-100 transition-opacity">
      <CardContent className="p-3">
        <div className="text-xs space-y-2">
          <div className="font-semibold text-xs">Performance</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-muted-foreground">FPS</div>
              <Badge variant={stats.fps < 30 ? 'destructive' : stats.fps < 50 ? 'secondary' : 'default'}>
                {stats.fps}
              </Badge>
            </div>
            <div>
              <div className="text-muted-foreground">Memory</div>
              <Badge variant={stats.memory > 100 ? 'destructive' : 'outline'}>
                {stats.memory}MB
              </Badge>
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Hide
          </button>
        </div>
      </CardContent>
    </Card>
  );
};