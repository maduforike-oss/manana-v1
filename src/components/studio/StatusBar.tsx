import React from 'react';
import { useStudioStore } from '@/lib/studio/store';
import { useIsMobile } from '@/hooks/use-mobile';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui/button';
import { Settings, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatusBarProps {
  className?: string;
  onSettingsClick?: () => void;
}

export const StatusBar = ({ className, onSettingsClick }: StatusBarProps) => {
  const { zoom, panOffset, doc } = useStudioStore();
  const isMobile = useIsMobile();
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const nodeCount = doc?.nodes?.length || 0;
  const canvasSize = doc?.canvas || { width: 800, height: 600 };

  return (
    <div className={cn(
      "flex items-center justify-between h-8 px-4 text-xs",
      "bg-muted/30 border-t border-border/50",
      "text-muted-foreground",
      className
    )}>
      {/* Left Status */}
      <div className="flex items-center gap-4">
        <span className="hidden sm:inline">
          Zoom: {Math.round(zoom * 100)}%
        </span>
        <span className="hidden md:inline">
          Pan: {Math.round(panOffset.x)}, {Math.round(panOffset.y)}
        </span>
        <span className="hidden lg:inline">
          Objects: {nodeCount}
        </span>
        <span className="hidden xl:inline">
          Canvas: {canvasSize.width} × {canvasSize.height}
        </span>
      </div>

      {/* Center Status - Mobile priority */}
      {isMobile && (
        <div className="flex items-center gap-2">
          <span>Objects: {nodeCount}</span>
          <span>{Math.round(zoom * 100)}%</span>
        </div>
      )}

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Connection Status */}
        <div className="flex items-center gap-1">
          {isOnline ? (
            <Wifi className="h-3 w-3 text-green-500" />
          ) : (
            <WifiOff className="h-3 w-3 text-destructive" />
          )}
          <span className="hidden sm:inline">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle size="sm" className="h-6 w-6 min-h-[24px] min-w-[24px] p-0" />

        {/* Settings */}
        {onSettingsClick && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSettingsClick}
            className="h-6 w-6 min-h-[24px] min-w-[24px] p-0"
          >
            <Settings className="h-3 w-3" />
            <span className="sr-only">Settings</span>
          </Button>
        )}

        {/* App Version */}
        <span className="hidden lg:inline text-[10px] opacity-60">
          v2.0.0
        </span>
      </div>
    </div>
  );
};