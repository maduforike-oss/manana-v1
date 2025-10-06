import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, Clock, DollarSign, Layers } from "lucide-react";
import { calculateDesignStitches, getStitchComplexity } from "@/lib/embroidery";
import { Node } from "@/lib/studio/types";

interface StitchCalculatorPanelProps {
  nodes: Node[];
  dpi?: number;
}

export function StitchCalculatorPanel({ nodes, dpi = 300 }: StitchCalculatorPanelProps) {
  const estimate = useMemo(() => {
    return calculateDesignStitches(nodes, dpi);
  }, [nodes, dpi]);

  const complexity = useMemo(() => {
    return getStitchComplexity(estimate);
  }, [estimate]);

  const getComplexityColor = (level: string) => {
    switch (level) {
      case "Low":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
      case "Medium":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
      case "High":
        return "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20";
      case "Very High":
        return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Stitch Estimate
        </CardTitle>
        <CardDescription>
          Calculated based on design area and complexity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Complexity Badge */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Complexity</span>
          <Badge variant="outline" className={getComplexityColor(complexity.level)}>
            {complexity.level}
          </Badge>
        </div>
        
        <p className="text-xs text-muted-foreground">{complexity.description}</p>

        <Separator />

        {/* Stitch Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Fill Stitches</span>
            </div>
            <span className="text-sm font-mono">{estimate.fillStitches.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Satin Stitches</span>
            </div>
            <span className="text-sm font-mono">{estimate.satinStitches.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Running Stitches</span>
            </div>
            <span className="text-sm font-mono">{estimate.runningStitches.toLocaleString()}</span>
          </div>
        </div>

        <Separator />

        {/* Total */}
        <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
          <span className="text-sm font-semibold">Total Stitches</span>
          <span className="text-lg font-bold font-mono">{estimate.totalStitches.toLocaleString()}</span>
        </div>

        {/* Time & Cost Estimates */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-xs">Est. Time</span>
            </div>
            <p className="text-sm font-semibold">{estimate.estimatedTime} min</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <DollarSign className="h-3.5 w-3.5" />
              <span className="text-xs">Cost Factor</span>
            </div>
            <p className="text-sm font-semibold">${estimate.estimatedCost.toFixed(2)}</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground pt-2">
          * Estimates are approximate. Actual production may vary based on machine settings and material.
        </p>
      </CardContent>
    </Card>
  );
}
