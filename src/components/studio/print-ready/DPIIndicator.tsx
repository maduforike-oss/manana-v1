import { AlertCircle, CheckCircle, Info } from "lucide-react";
import { DPIInfo } from "@/lib/print-ready/physicalUnits";
import { cn } from "@/lib/utils";

interface DPIIndicatorProps {
  dpiInfo: DPIInfo;
  className?: string;
}

export function DPIIndicator({ dpiInfo, className }: DPIIndicatorProps) {
  const getIcon = () => {
    if (!dpiInfo.isValid) {
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
    if (dpiInfo.current < dpiInfo.target) {
      return <Info className="h-4 w-4 text-warning" />;
    }
    return <CheckCircle className="h-4 w-4 text-success" />;
  };

  const getColor = () => {
    if (!dpiInfo.isValid) return "text-destructive";
    if (dpiInfo.current < dpiInfo.target) return "text-warning";
    return "text-success";
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-md bg-background/80 border",
        className
      )}
      title={dpiInfo.warning}
    >
      {getIcon()}
      <span className={cn("text-sm font-medium", getColor())}>
        {Math.round(dpiInfo.current)} DPI
      </span>
      {dpiInfo.warning && (
        <span className="text-xs text-muted-foreground max-w-[200px] truncate">
          {dpiInfo.warning}
        </span>
      )}
    </div>
  );
}
