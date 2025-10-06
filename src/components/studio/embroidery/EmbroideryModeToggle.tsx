import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EmbroideryModeToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export function EmbroideryModeToggle({ enabled, onChange }: EmbroideryModeToggleProps) {
  return (
    <div className="flex items-center justify-between space-x-2">
      <div className="flex items-center space-x-2">
        <Label htmlFor="embroidery-mode" className="cursor-pointer">
          Embroidery Mode
        </Label>
        {enabled && (
          <Badge variant="secondary" className="text-xs">
            Active
          </Badge>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">
                Embroidery Mode simplifies your design toolset and validates for
                thread-based production constraints (color limits, stitch density, etc.)
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <Switch
          id="embroidery-mode"
          checked={enabled}
          onCheckedChange={onChange}
        />
      </div>
    </div>
  );
}
