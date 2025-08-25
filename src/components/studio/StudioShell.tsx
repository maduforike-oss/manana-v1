import React from 'react';

export const StudioShell = () => {
  return (
    <div className="flex h-screen bg-workspace text-workspace-foreground">
      {/* Left Panel - Tools */}
      <div className="w-16 bg-card border-r border-workspace-border flex flex-col items-center py-4 space-y-2">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
          ◯
        </div>
        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
          ▢
        </div>
        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
          T
        </div>
      </div>

      {/* Center - Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-12 bg-card border-b border-workspace-border flex items-center px-4">
          <h1 className="text-lg font-semibold">Design Studio</h1>
        </div>
        
        {/* Canvas Area */}
        <div className="flex-1 bg-workspace p-8">
          <div className="w-full h-full bg-background rounded-lg border border-workspace-border flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4">🎨</div>
              <h2 className="text-xl font-semibold text-foreground">Canvas Ready</h2>
              <p className="text-muted-foreground">Your design studio is now working!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Properties */}
      <div className="w-80 bg-card border-l border-workspace-border">
        <div className="p-4 border-b border-workspace-border">
          <h3 className="font-semibold">Properties</h3>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Width</label>
              <div className="mt-1 p-2 bg-input rounded border">800px</div>
            </div>
            <div>
              <label className="text-sm font-medium">Height</label>
              <div className="mt-1 p-2 bg-input rounded border">600px</div>
            </div>
            <div>
              <label className="text-sm font-medium">Background</label>
              <div className="mt-1 p-2 bg-input rounded border">#FFFFFF</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};