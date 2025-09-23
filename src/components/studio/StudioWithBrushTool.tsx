import React from 'react';
import { useStudioStore } from '@/lib/studio/store';
import IntegratedBrushTool from './IntegratedBrushTool';
import { ProfessionalToolManager } from './ProfessionalToolManager';

export const StudioWithBrushTool = () => {
  const { activeTool } = useStudioStore();

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar - Tools and Settings */}
      <div className="w-64 border-r border-border p-4 overflow-y-auto">
        <ProfessionalToolManager />
      </div>
      
      {/* Main Canvas Area */}
      <div className="flex-1 relative">
        {activeTool === 'brush' && <IntegratedBrushTool />}
        {activeTool !== 'brush' && (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select the brush tool to start drawing
          </div>
        )}
      </div>
    </div>
  );
};