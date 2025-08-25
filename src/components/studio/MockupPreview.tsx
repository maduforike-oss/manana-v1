"use client";

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useStudioStore } from '../../lib/studio/store';

export const MockupPreview = () => {
  const { mockup, setMockup } = useStudioStore();

  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="text-sm font-medium">Mockup Type</label>
        <Select value={mockup.type} onValueChange={(value: any) => setMockup({ type: value })}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="front">T-Shirt Front</SelectItem>
            <SelectItem value="back">T-Shirt Back</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium">Color</label>
        <Select value={mockup.color} onValueChange={(value: any) => setMockup({ color: value })}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium">Opacity: {Math.round(mockup.opacity * 100)}%</label>
        <Slider
          value={[mockup.opacity]}
          onValueChange={([value]) => setMockup({ opacity: value })}
          min={0}
          max={1}
          step={0.1}
          className="mt-2"
        />
      </div>
    </div>
  );
};