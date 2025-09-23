/**
 * @deprecated This component has been replaced by UnifiedBrushPanel in design-tools/
 * 
 * MIGRATION GUIDE:
 * 
 * Old usage:
 * ```tsx
 * import { BrushControlsPanel } from './BrushControlsPanel';
 * 
 * <BrushControlsPanel
 *   brushSettings={settings}
 *   onBrushSettingsChange={handleChange}
 *   activeTool={tool}
 *   onToolChange={handleToolChange}
 * />
 * ```
 * 
 * New usage:
 * ```tsx
 * import { UnifiedBrushPanel } from './design-tools/UnifiedBrushPanel';
 * 
 * <UnifiedBrushPanel isVisible={true} />
 * ```
 * 
 * Benefits of migration:
 * - Automatic tool manager integration
 * - Unified brush/eraser switching
 * - Preset management
 * - Mobile-friendly floating controls
 * - Better performance and consistency
 * 
 * This file will be removed in the next major version.
 */

// Re-export the new component for temporary compatibility
export { UnifiedBrushPanel as BrushControlsPanel } from './design-tools/UnifiedBrushPanel';

// Legacy interface for migration assistance
export interface LegacyBrushControlsPanelProps {
  /** @deprecated Use UnifiedBrushPanel instead */
  brushSettings?: any;
  /** @deprecated Handled automatically by ToolManager */
  onBrushSettingsChange?: (settings: any) => void;
  /** @deprecated Handled automatically by ToolManager */
  activeTool?: string;
  /** @deprecated Use toolManager.activateTool() instead */
  onToolChange?: (tool: string) => void;
  className?: string;
}

/**
 * @deprecated Legacy wrapper - use UnifiedBrushPanel directly
 * 
 * This wrapper will be removed in the next version.
 * Please migrate to the new design-tools system.
 */
export const LegacyBrushControlsPanel = (props: LegacyBrushControlsPanelProps) => {
  console.warn(
    'BrushControlsPanel is deprecated. Please migrate to UnifiedBrushPanel from design-tools/. ' +
    'See MIGRATION_PHASE_3_COMPLETE.md for details.'
  );
  
  // For now, just return null to prevent errors
  return null;
};