import React from 'react';
import { Button } from '@/components/ui/button';
import { NotificationsBell } from '@/components/ui/NotificationsBell';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Menu } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

interface BrandHeaderProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  showNotifications?: boolean;
  showProfile?: boolean;
  onBackClick?: () => void;
  onMenuClick?: () => void;
  className?: string;
}

export const BrandHeader: React.FC<BrandHeaderProps> = ({
  title = "Manana",
  subtitle,
  showBackButton = false,
  showNotifications = true,
  showProfile = true,
  onBackClick,
  onMenuClick,
  className
}) => {
  const { user } = useAuth();

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      window.history.back();
    }
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      <div className="flex h-16 items-center justify-between px-4">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackClick}
              className="h-9 w-9 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Go back</span>
            </Button>
          )}
          
          {onMenuClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="h-9 w-9 p-0 lg:hidden"
            >
              <Menu className="h-4 w-4" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          )}

          <div className="flex flex-col">
            <h1 className="text-lg font-semibold text-foreground">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {showNotifications && user && (
            <NotificationsBell />
          )}
          
          {showProfile && user && (
            <Avatar className="h-8 w-8 ring-2 ring-border/20">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 font-medium text-sm">
                {user.user_metadata?.display_name?.slice(0, 2)?.toUpperCase() || 
                 user.email?.slice(0, 2)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </header>
  );
};