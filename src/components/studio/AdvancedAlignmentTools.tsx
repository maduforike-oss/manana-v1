import React from 'react';
import { Button } from '../ui/button';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignHorizontalSpaceAround,
  AlignHorizontalSpaceBetween,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  AlignVerticalSpaceAround,
  AlignVerticalSpaceBetween,
  Grid,
  Copy
} from 'lucide-react';
import { Separator } from '../ui/separator';
import { useStudioStore } from '../../lib/studio/store';
import { Node } from '../../lib/studio/types';

interface AdvancedAlignmentToolsProps {
  selectedNodes: Node[];
  onAlign: (type: AlignmentType) => void;
  onDistribute: (type: DistributeType) => void;
}

type AlignmentType = 
  | 'left' | 'center' | 'right' 
  | 'top' | 'middle' | 'bottom'
  | 'canvas-center-x' | 'canvas-center-y';

type DistributeType = 
  | 'horizontal' | 'vertical'
  | 'horizontal-spacing' | 'vertical-spacing';

export const AdvancedAlignmentTools: React.FC<AdvancedAlignmentToolsProps> = ({
  selectedNodes,
  onAlign,
  onDistribute
}) => {
  const { doc } = useStudioStore();
  const isMultipleSelected = selectedNodes.length > 1;
  const hasSelection = selectedNodes.length > 0;

  const alignmentButtons = [
    { type: 'left' as AlignmentType, icon: AlignLeft, tooltip: 'Align Left' },
    { type: 'center' as AlignmentType, icon: AlignCenter, tooltip: 'Align Center' },
    { type: 'right' as AlignmentType, icon: AlignRight, tooltip: 'Align Right' },
  ];

  const verticalAlignButtons = [
    { type: 'top' as AlignmentType, icon: AlignStartVertical, tooltip: 'Align Top' },
    { type: 'middle' as AlignmentType, icon: AlignCenterVertical, tooltip: 'Align Middle' },
    { type: 'bottom' as AlignmentType, icon: AlignEndVertical, tooltip: 'Align Bottom' },
  ];

  const distributeButtons = [
    { type: 'horizontal' as DistributeType, icon: AlignHorizontalSpaceBetween, tooltip: 'Distribute Horizontally' },
    { type: 'vertical' as DistributeType, icon: AlignVerticalSpaceBetween, tooltip: 'Distribute Vertically' },
    { type: 'horizontal-spacing' as DistributeType, icon: AlignHorizontalSpaceAround, tooltip: 'Equal Horizontal Spacing' },
    { type: 'vertical-spacing' as DistributeType, icon: AlignVerticalSpaceAround, tooltip: 'Equal Vertical Spacing' },
  ];

  const canvasAlignButtons = [
    { type: 'canvas-center-x' as AlignmentType, icon: AlignCenter, tooltip: 'Center to Canvas X' },
    { type: 'canvas-center-y' as AlignmentType, icon: AlignCenterVertical, tooltip: 'Center to Canvas Y' },
  ];

  return (
    <div className="flex flex-wrap gap-1 p-2 bg-background/80 backdrop-blur-sm border rounded-lg shadow-sm">
      {/* Horizontal Alignment */}
      <div className="flex gap-1">
        {alignmentButtons.map(({ type, icon: Icon, tooltip }) => (
          <Button
            key={type}
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onAlign(type)}
            disabled={!isMultipleSelected}
            title={tooltip}
          >
            <Icon className="h-3.5 w-3.5" />
          </Button>
        ))}
      </div>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Vertical Alignment */}
      <div className="flex gap-1">
        {verticalAlignButtons.map(({ type, icon: Icon, tooltip }) => (
          <Button
            key={type}
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onAlign(type)}
            disabled={!isMultipleSelected}
            title={tooltip}
          >
            <Icon className="h-3.5 w-3.5" />
          </Button>
        ))}
      </div>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Distribution */}
      <div className="flex gap-1">
        {distributeButtons.map(({ type, icon: Icon, tooltip }) => (
          <Button
            key={type}
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onDistribute(type)}
            disabled={selectedNodes.length < 3}
            title={tooltip}
          >
            <Icon className="h-3.5 w-3.5" />
          </Button>
        ))}
      </div>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Canvas Alignment */}
      <div className="flex gap-1">
        {canvasAlignButtons.map(({ type, icon: Icon, tooltip }) => (
          <Button
            key={type}
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onAlign(type)}
            disabled={!hasSelection}
            title={tooltip}
          >
            <Icon className="h-3.5 w-3.5" />
          </Button>
        ))}
      </div>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Grid Tools */}
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          disabled={!isMultipleSelected}
          title="Arrange in Grid"
        >
          <Grid className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          disabled={!hasSelection}
          title="Duplicate Selection"
        >
          <Copy className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};