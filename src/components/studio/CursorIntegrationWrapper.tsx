import React, { useRef } from 'react';
import { CursorIntegration } from './CursorIntegration';
import { BrushSettings } from '../../lib/studio/brushEngine';

interface CursorIntegrationWrapperProps {
  brushSettings: BrushSettings;
  activeTool: string;
  containerRef: React.RefObject<HTMLDivElement>;
  onFocus: () => void;
  onBlur: () => void;
  onMouseDown: (e: any) => void;
  onMouseUp: (e: any) => void;
  onClick: (e: any) => void;
  children: React.ReactNode;
}

export const CursorIntegrationWrapper: React.FC<CursorIntegrationWrapperProps> = ({
  brushSettings,
  activeTool,
  containerRef,
  onFocus,
  onBlur,
  onMouseDown,
  onMouseUp,
  onClick,
  children
}) => {
  return (
    <div
      ref={containerRef}
      className="relative flex-1 overflow-hidden bg-workspace focus:outline-none"
      tabIndex={0}
      onFocus={onFocus}
      onBlur={onBlur}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onClick={onClick}
    >
      <CursorIntegration
        brushSettings={brushSettings}
        activeTool={activeTool}
        containerRef={containerRef}
      />
      {children}
    </div>
  );
};