import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useStudioStore } from '../../lib/studio/store';
import { CheckCircle, AlertTriangle, XCircle, Settings, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

type PrintMethod = 'DTG' | 'Screen' | 'Vinyl';

const PRINT_METHOD_RULES = {
  DTG: {
    maxColors: Infinity,
    minSize: 1,
    maxSize: 14,
    supportsGradients: true,
    supportsPhotos: true,
    costPerColor: 0,
    setupFee: 0,
    description: 'Direct-to-Garment printing offers unlimited colors and photo-quality prints',
    tips: [
      'Perfect for detailed designs with many colors',
      'Great for small quantities',
      'Excellent for photographic images',
      'No setup fees'
    ]
  },
  Screen: {
    maxColors: 6,
    minSize: 2,
    maxSize: 16,
    supportsGradients: false,
    supportsPhotos: false,
    costPerColor: 2.50,
    setupFee: 25,
    description: 'Screen printing provides vibrant colors and durability for simple designs',
    tips: [
      'Best for orders over 12 pieces',
      'Use solid colors without gradients',
      'Keep design elements separated',
      'Limit to 4 colors for best value'
    ]
  },
  Vinyl: {
    maxColors: 4,
    minSize: 1,
    maxSize: 12,
    supportsGradients: false,
    supportsPhotos: false,
    costPerColor: 1.50,
    setupFee: 0,
    description: 'Heat transfer vinyl offers precision cutting for simple, bold designs',
    tips: [
      'Perfect for text and simple shapes',
      'Each color must be a separate layer',
      'No complex details or fine lines',
      'Great for personalization'
    ]
  }
};

export const PrintMethodValidator = () => {
  const { doc } = useStudioStore();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PrintMethod>('DTG');
  const [violations, setViolations] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    analyzeDesign();
  }, [doc, selectedMethod]);

  const analyzeDesign = () => {
    const rules = PRINT_METHOD_RULES[selectedMethod];
    const newViolations: string[] = [];
    const newWarnings: string[] = [];

    // Count unique colors
    const colors = new Set<string>();
    doc.nodes.forEach(node => {
      if ('fill' in node && node.fill) {
        if (node.fill.type === 'solid' && node.fill.color) {
          colors.add(node.fill.color);
        } else if (node.fill.type === 'linear' && node.fill.stops) {
          node.fill.stops.forEach(stop => colors.add(stop.color));
        }
      }
      if ('stroke' in node && node.stroke) {
        colors.add(node.stroke.color);
      }
    });

    // Check color count
    if (colors.size > rules.maxColors) {
      newViolations.push(`Too many colors: ${colors.size} used, ${rules.maxColors} maximum allowed`);
    } else if (colors.size > rules.maxColors * 0.8) {
      newWarnings.push(`Approaching color limit: ${colors.size}/${rules.maxColors} colors used`);
    }

    // Check for gradients
    if (!rules.supportsGradients) {
      const hasGradients = doc.nodes.some(node => 
        'fill' in node && node.fill?.type === 'linear'
      );
      if (hasGradients) {
        newViolations.push('Gradients not supported with this print method');
      }
    }

    // Check for photo elements
    if (!rules.supportsPhotos) {
      const hasImages = doc.nodes.some(node => node.type === 'image');
      if (hasImages) {
        newViolations.push('Photo/image elements not recommended for this print method');
      }
    }

    // Check design complexity for screen printing
    if (selectedMethod === 'Screen') {
      const complexElements = doc.nodes.filter(node => {
        if (node.type === 'text' && 'fontSize' in node) {
          return node.fontSize < 12;
        }
        return false;
      });

      if (complexElements.length > 0) {
        newWarnings.push('Small text may not print clearly with screen printing');
      }
    }

    // Check for vinyl compatibility
    if (selectedMethod === 'Vinyl') {
      const fineDetails = doc.nodes.filter(node => {
        if (node.width < 10 || node.height < 10) return true;
        if (node.type === 'path') return true;
        return false;
      });

      if (fineDetails.length > 0) {
        newViolations.push('Fine details and complex paths not suitable for vinyl cutting');
      }
    }

    setViolations(newViolations);
    setWarnings(newWarnings);
  };

  const getStatusIcon = () => {
    if (violations.length > 0) {
      return <XCircle className="w-4 h-4 text-red-500" />;
    } else if (warnings.length > 0) {
      return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    } else {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getStatusText = () => {
    if (violations.length > 0) return 'Issues';
    if (warnings.length > 0) return 'Warnings';
    return 'Compatible';
  };

  const getStatusColor = () => {
    if (violations.length > 0) return 'border-red-200 bg-red-50 text-red-700';
    if (warnings.length > 0) return 'border-orange-200 bg-orange-50 text-orange-700';
    return 'border-green-200 bg-green-50 text-green-700';
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={cn("h-8 gap-2 transition-all duration-200", getStatusColor())}
        >
          {getStatusIcon()}
          {getStatusText()}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-96" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Print Method Analysis
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Method Selection */}
            <div className="flex gap-2">
              {(Object.keys(PRINT_METHOD_RULES) as PrintMethod[]).map((method) => (
                <Button
                  key={method}
                  variant={selectedMethod === method ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMethod(method)}
                  className="flex-1"
                >
                  {method}
                </Button>
              ))}
            </div>

            {/* Current Method Info */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-1">{selectedMethod} Printing</h4>
              <p className="text-sm text-muted-foreground">
                {PRINT_METHOD_RULES[selectedMethod].description}
              </p>
            </div>

            {/* Violations */}
            {violations.length > 0 && (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-700">
                  <div className="font-medium mb-1">Design Issues:</div>
                  {violations.map((violation, index) => (
                    <div key={index} className="text-sm">• {violation}</div>
                  ))}
                </AlertDescription>
              </Alert>
            )}

            {/* Warnings */}
            {warnings.length > 0 && (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <AlertDescription className="text-orange-700">
                  <div className="font-medium mb-1">Considerations:</div>
                  {warnings.map((warning, index) => (
                    <div key={index} className="text-sm">• {warning}</div>
                  ))}
                </AlertDescription>
              </Alert>
            )}

            {/* Success State */}
            {violations.length === 0 && warnings.length === 0 && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-700">
                  <div className="font-medium">Design is compatible with {selectedMethod} printing!</div>
                </AlertDescription>
              </Alert>
            )}

            {/* Method Tips */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Lightbulb className="w-4 h-4 text-blue-500" />
                Tips for {selectedMethod} Printing:
              </div>
              {PRINT_METHOD_RULES[selectedMethod].tips.map((tip, index) => (
                <div key={index} className="text-sm text-muted-foreground pl-6">
                  • {tip}
                </div>
              ))}
            </div>

            {/* Cost Information */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Setup Fee:</span>
                  <span className="font-medium">
                    ${PRINT_METHOD_RULES[selectedMethod].setupFee}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Cost per Color:</span>
                  <span className="font-medium">
                    ${PRINT_METHOD_RULES[selectedMethod].costPerColor}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Max Colors:</span>
                  <span className="font-medium">
                    {PRINT_METHOD_RULES[selectedMethod].maxColors === Infinity ? 'Unlimited' : PRINT_METHOD_RULES[selectedMethod].maxColors}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};