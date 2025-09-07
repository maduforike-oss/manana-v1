import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Loader2, XCircle, Cloud } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutoSaveIndicatorProps {
  status: 'saved' | 'saving' | 'error';
}

export const AutoSaveIndicator = ({ status }: AutoSaveIndicatorProps) => {
  const getIcon = () => {
    switch (status) {
      case 'saved':
        return <CheckCircle className="w-3 h-3" />;
      case 'saving':
        return <Loader2 className="w-3 h-3 animate-spin" />;
      case 'error':
        return <XCircle className="w-3 h-3" />;
    }
  };

  const getVariant = () => {
    switch (status) {
      case 'saved':
        return 'secondary';
      case 'saving':
        return 'outline';
      case 'error':
        return 'destructive';
    }
  };

  const getText = () => {
    switch (status) {
      case 'saved':
        return 'Saved';
      case 'saving':
        return 'Saving...';
      case 'error':
        return 'Error';
    }
  };

  return (
    <Badge 
      variant={getVariant()} 
      className={cn(
        "flex items-center gap-1 text-xs transition-all duration-200",
        status === 'saved' && "text-green-600 bg-green-50 border-green-200",
        status === 'saving' && "text-blue-600 bg-blue-50 border-blue-200",
        status === 'error' && "text-red-600 bg-red-50 border-red-200"
      )}
    >
      {getIcon()}
      {getText()}
    </Badge>
  );
};