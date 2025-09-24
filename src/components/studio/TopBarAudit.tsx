import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, AlertTriangle } from 'lucide-react';

interface ToolbarItem {
  name: string;
  status: 'working' | 'broken' | 'partial';
  description: string;
}

export const TopBarAudit = () => {
  const toolbarItems: ToolbarItem[] = [
    {
      name: 'Back to Hub',
      status: 'working',
      description: 'Navigation button works correctly'
    },
    {
      name: 'Design Studio Title',
      status: 'working',
      description: 'Static title display works'
    },
    {
      name: 'Design Name',
      status: 'working',
      description: 'Shows current design name correctly'
    },
    {
      name: 'Undo Button',
      status: 'working',
      description: 'History undo functionality works'
    },
    {
      name: 'Redo Button',
      status: 'working',
      description: 'History redo functionality works'
    },
    {
      name: 'Save Button',
      status: 'working',
      description: 'Design save functionality works'
    },
    {
      name: 'Export Button',
      status: 'working',
      description: 'Export dropdown and functions work'
    },
    {
      name: 'Grid Toggle',
      status: 'partial',
      description: 'Grid visibility works but may have rendering issues'
    },
    {
      name: 'Rulers Toggle',
      status: 'broken',
      description: 'Excessive ruler ticks causing visual chaos'
    },
    {
      name: 'Smart Guides Toggle',
      status: 'partial',
      description: 'Toggle works but functionality may be incomplete'
    },
    {
      name: 'Settings Button',
      status: 'broken',
      description: 'Button present but no functionality connected'
    },
    {
      name: 'Theme Toggle',
      status: 'working',
      description: 'Dark/light mode toggle works correctly'
    },
    {
      name: '3D Mode Toggle',
      status: 'broken',
      description: 'Known issue - 3D functionality incomplete'
    }
  ];

  const getStatusIcon = (status: ToolbarItem['status']) => {
    switch (status) {
      case 'working':
        return <Check className="w-4 h-4 text-success" />;
      case 'broken':
        return <X className="w-4 h-4 text-destructive" />;
      case 'partial':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
    }
  };

  const getStatusBadge = (status: ToolbarItem['status']) => {
    const variants = {
      working: 'default',
      broken: 'destructive',
      partial: 'secondary'
    } as const;

    return (
      <Badge variant={variants[status]} className="ml-2">
        {status}
      </Badge>
    );
  };

  return (
    <div className="p-6 bg-card rounded-lg border">
      <h2 className="text-xl font-semibold mb-4">Top Toolbar Audit</h2>
      <div className="space-y-3">
        {toolbarItems.map((item) => (
          <div key={item.name} className="flex items-center justify-between p-3 bg-background rounded border">
            <div className="flex items-center gap-3">
              {getStatusIcon(item.status)}
              <div>
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
            {getStatusBadge(item.status)}
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-muted rounded">
        <h3 className="font-medium mb-2">Summary</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-success">
              {toolbarItems.filter(item => item.status === 'working').length}
            </div>
            <div className="text-sm text-muted-foreground">Working</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-warning">
              {toolbarItems.filter(item => item.status === 'partial').length}
            </div>
            <div className="text-sm text-muted-foreground">Partial</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-destructive">
              {toolbarItems.filter(item => item.status === 'broken').length}
            </div>
            <div className="text-sm text-muted-foreground">Broken</div>
          </div>
        </div>
      </div>
    </div>
  );
};