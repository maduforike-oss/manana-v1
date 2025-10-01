import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PrintMethod } from "@/lib/print-ready/printMethods";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PrintMethodSelectorProps {
  value: PrintMethod;
  onChange: (method: PrintMethod) => void;
}

const methodDescriptions: Record<PrintMethod, string> = {
  DTG: "Direct-to-Garment: Full color, photorealistic prints with gradients",
  Embroidery: "Embroidered design: 15 color max, solid fills, minimum line width",
  Screen: "Screen printing: 6 color max, solid colors, crisp edges",
  Sublimation: "Dye sublimation: Full color on polyester, vibrant and durable",
  Vinyl: "Heat transfer vinyl: Single color, vector designs, bold graphics",
};

export function PrintMethodSelector({ value, onChange }: PrintMethodSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label>Print Method</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">{methodDescriptions[value]}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <Select value={value} onValueChange={(v) => onChange(v as PrintMethod)}>
        <SelectTrigger className="bg-background">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-popover z-[100]">
          <SelectItem value="DTG">DTG (Direct-to-Garment)</SelectItem>
          <SelectItem value="Embroidery">Embroidery</SelectItem>
          <SelectItem value="Screen">Screen Print</SelectItem>
          <SelectItem value="Sublimation">Sublimation</SelectItem>
          <SelectItem value="Vinyl">Vinyl Transfer</SelectItem>
        </SelectContent>
      </Select>

      <p className="text-xs text-muted-foreground">
        {methodDescriptions[value]}
      </p>
    </div>
  );
}
