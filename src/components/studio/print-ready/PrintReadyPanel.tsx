import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState } from "react";
import { PrintMethodSelector } from "./PrintMethodSelector";
import { PrintMethod } from "@/lib/print-ready/printMethods";
import { GarmentSize } from "@/lib/print-ready/garmentSizes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PrintReadyPanelProps {
  onExportPOD?: () => void;
}

export function PrintReadyPanel({ onExportPOD }: PrintReadyPanelProps) {
  const [printMethod, setPrintMethod] = useState<PrintMethod>("DTG");
  const [garmentSize, setGarmentSize] = useState<GarmentSize>("M");
  const [showSafeZone, setShowSafeZone] = useState(true);
  const [showBleedZone, setShowBleedZone] = useState(true);
  const [showMargins, setShowMargins] = useState(false);

  return (
    <Card className="p-4 space-y-4">
      <div>
        <h3 className="font-semibold mb-4">Print-Ready Settings</h3>
        
        <PrintMethodSelector value={printMethod} onChange={setPrintMethod} />
      </div>

      <Separator />

      <div className="space-y-2">
        <Label>Garment Size</Label>
        <Select value={garmentSize} onValueChange={(v) => setGarmentSize(v as GarmentSize)}>
          <SelectTrigger className="bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover z-[100]">
            <SelectItem value="XS">XS</SelectItem>
            <SelectItem value="S">S</SelectItem>
            <SelectItem value="M">M (Standard)</SelectItem>
            <SelectItem value="L">L</SelectItem>
            <SelectItem value="XL">XL</SelectItem>
            <SelectItem value="XXL">XXL</SelectItem>
            <SelectItem value="XXXL">XXXL</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div className="space-y-3">
        <h4 className="text-sm font-medium">Zone Overlays</h4>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="safe-zone" className="text-sm">Safe Zone</Label>
          <Switch
            id="safe-zone"
            checked={showSafeZone}
            onCheckedChange={setShowSafeZone}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="bleed-zone" className="text-sm">Bleed Zone</Label>
          <Switch
            id="bleed-zone"
            checked={showBleedZone}
            onCheckedChange={setShowBleedZone}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="margins" className="text-sm">Margin Guides</Label>
          <Switch
            id="margins"
            checked={showMargins}
            onCheckedChange={setShowMargins}
          />
        </div>
      </div>

      <Separator />

      <Button 
        className="w-full" 
        onClick={onExportPOD}
        variant="default"
      >
        <Download className="mr-2 h-4 w-4" />
        Export POD Package
      </Button>
    </Card>
  );
}
