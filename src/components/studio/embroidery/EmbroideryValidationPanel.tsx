import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { validateDesignForEmbroidery } from "@/lib/embroidery";
import { Node } from "@/lib/studio/types";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EmbroideryValidationPanelProps {
  nodes: Node[];
}

export function EmbroideryValidationPanel({ nodes }: EmbroideryValidationPanelProps) {
  const validation = useMemo(() => {
    return validateDesignForEmbroidery(nodes);
  }, [nodes]);

  const hasIssues = validation.errors.length > 0 || validation.warnings.length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {validation.isValid ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-destructive" />
            )}
            Design Validation
          </CardTitle>
          {validation.isValid && (
            <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">
              Ready
            </Badge>
          )}
        </div>
        <CardDescription>
          Embroidery production requirements
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasIssues && validation.info.length === 0 ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Your design meets all embroidery requirements. Ready for production!
            </AlertDescription>
          </Alert>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-3 pr-4">
              {/* Errors */}
              {validation.errors.map((error, index) => (
                <Alert key={`error-${index}`} variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              ))}

              {/* Warnings */}
              {validation.warnings.map((warning, index) => (
                <Alert key={`warning-${index}`}>
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <AlertDescription className="text-sm">{warning}</AlertDescription>
                </Alert>
              ))}

              {/* Info */}
              {validation.info.map((info, index) => (
                <Alert key={`info-${index}`} className="border-blue-500/20 bg-blue-500/10">
                  <Info className="h-4 w-4 text-blue-500" />
                  <AlertDescription className="text-sm">{info}</AlertDescription>
                </Alert>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
