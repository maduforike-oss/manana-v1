import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStudioStore } from '@/lib/studio/store';
import { Bug, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface DiagnosticTest {
  name: string;
  status: 'pass' | 'warning' | 'fail';
  message: string;
  details?: string;
}

interface StudioDiagnosticsProps {
  enabled?: boolean;
}

export const StudioDiagnostics: React.FC<StudioDiagnosticsProps> = ({ enabled = false }) => {
  const { doc, zoom, panOffset, activeTool, getBrushStrokes } = useStudioStore();
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [tests, setTests] = useState<DiagnosticTest[]>([]);

  const runDiagnostics = () => {
    const diagnosticTests: DiagnosticTest[] = [];

    // Test 1: Canvas element availability
    const canvasElements = document.querySelectorAll('canvas');
    diagnosticTests.push({
      name: 'Canvas Elements',
      status: canvasElements.length > 0 ? 'pass' : 'fail',
      message: `Found ${canvasElements.length} canvas elements`,
      details: canvasElements.length === 0 ? 'No canvas elements found in DOM' : undefined
    });

    // Test 2: Coordinate system integrity
    try {
      const testElement = document.querySelector('canvas');
      if (testElement) {
        const rect = testElement.getBoundingClientRect();
        const hasValidRect = rect.width > 0 && rect.height > 0;
        diagnosticTests.push({
          name: 'Canvas Bounds',
          status: hasValidRect ? 'pass' : 'fail',
          message: hasValidRect ? `Canvas bounds: ${rect.width}x${rect.height}` : 'Invalid canvas bounds',
          details: `Rect: ${JSON.stringify(rect)}`
        });
      }
    } catch (error) {
      diagnosticTests.push({
        name: 'Canvas Bounds',
        status: 'fail',
        message: 'Error getting canvas bounds',
        details: String(error)
      });
    }

    // Test 3: Brush stroke persistence
    const brushStrokes = getBrushStrokes();
    diagnosticTests.push({
      name: 'Brush Strokes',
      status: 'pass',
      message: `${brushStrokes.length} brush strokes in store`,
      details: `Active tool: ${activeTool}`
    });

    // Test 4: Performance metrics
    const nodeCount = doc.nodes.length;
    let performanceStatus: 'pass' | 'warning' | 'fail' = 'pass';
    if (nodeCount > 1000) performanceStatus = 'warning';
    if (nodeCount > 5000) performanceStatus = 'fail';

    diagnosticTests.push({
      name: 'Performance',
      status: performanceStatus,
      message: `${nodeCount} nodes in document`,
      details: `Zoom: ${zoom.toFixed(2)}x, Pan: (${panOffset.x}, ${panOffset.y})`
    });

    // Test 5: Memory usage (if available)
    if ((performance as any).memory) {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / 1048576;
      const limitMB = memory.jsHeapSizeLimit / 1048576;
      const usagePercent = (usedMB / limitMB) * 100;

      let memoryStatus: 'pass' | 'warning' | 'fail' = 'pass';
      if (usagePercent > 70) memoryStatus = 'warning';
      if (usagePercent > 90) memoryStatus = 'fail';

      diagnosticTests.push({
        name: 'Memory Usage',
        status: memoryStatus,
        message: `${usedMB.toFixed(1)}MB / ${limitMB.toFixed(1)}MB (${usagePercent.toFixed(1)}%)`,
        details: `Heap: ${memory.totalJSHeapSize / 1048576} MB`
      });
    }

    // Test 6: Event listeners
    const hasPointerSupport = 'PointerEvent' in window;
    diagnosticTests.push({
      name: 'Pointer Events',
      status: hasPointerSupport ? 'pass' : 'warning',
      message: hasPointerSupport ? 'Pointer events supported' : 'Using fallback mouse events',
      details: `User agent: ${navigator.userAgent.substring(0, 50)}...`
    });

    setTests(diagnosticTests);
    setShowDiagnostics(true);
  };

  if (!enabled) return null;

  const getStatusIcon = (status: DiagnosticTest['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'fail':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: DiagnosticTest['status']) => {
    switch (status) {
      case 'pass':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'fail':
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={runDiagnostics}
        className="fixed top-4 left-4 z-50"
      >
        <Bug className="w-4 h-4 mr-2" />
        Diagnostics
      </Button>

      {showDiagnostics && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Studio Diagnostics
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDiagnostics(false)}
                >
                  Close
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tests.map((test, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    {getStatusIcon(test.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{test.name}</span>
                        <Badge className={getStatusColor(test.status)}>
                          {test.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{test.message}</p>
                      {test.details && (
                        <p className="text-xs text-muted-foreground mt-1 font-mono">
                          {test.details}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};