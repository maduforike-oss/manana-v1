import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { PrintMethod, MethodRules } from './types';
import { useStudioStore } from './store';

const METHOD_RULES: MethodRules = {
  DTG: {
    minLineWidthMm: 0.5,
    allowGradients: true
  },
  Screen: {
    maxSpotColors: 6,
    allowGradients: false,
    setupFee: 25,
    colorFee: 3
  },
  Vinyl: {
    solidsOnly: true,
    minCurveRadius: 2,
    minTextSizeMm: 3
  }
};

export const MaterialTab: React.FC = () => {
  const [selectedMethod, setSelectedMethod] = useState<PrintMethod>('DTG');
  const { nodes } = useStudioStore();

  // Analyze current design for violations
  const analyzeDesign = () => {
    const violations: string[] = [];
    const warnings: string[] = [];
    
    if (selectedMethod === 'DTG') {
      // Check for minimum line width
      const thinLines = nodes.some(node => 
        node.type === 'shape' && (node as any).strokeWidth < METHOD_RULES.DTG.minLineWidthMm * 3.543
      );
      if (thinLines) {
        violations.push(`Lines must be at least ${METHOD_RULES.DTG.minLineWidthMm}mm thick`);
      }
    }
    
    if (selectedMethod === 'Screen') {
      // Count unique colors (simplified)
      const colors = new Set();
      nodes.forEach(node => {
        if ((node as any).fill) colors.add((node as any).fill);
        if ((node as any).stroke) colors.add((node as any).stroke);
      });
      
      if (colors.size > METHOD_RULES.Screen.maxSpotColors) {
        violations.push(`Too many colors (${colors.size}). Screen printing allows max ${METHOD_RULES.Screen.maxSpotColors} spot colors`);
      }
      
      // Check for gradients
      const hasGradients = nodes.some(node => 
        (node as any).fill && (node as any).fill.includes('gradient')
      );
      if (hasGradients) {
        violations.push('Gradients are not allowed in screen printing');
      }
    }
    
    if (selectedMethod === 'Vinyl') {
      // Check for complex shapes
      const hasComplexShapes = nodes.some(node => 
        node.type === 'path' || (node.type === 'text' && (node as any).fontSize < METHOD_RULES.Vinyl.minTextSizeMm * 3.543)
      );
      if (hasComplexShapes) {
        violations.push(`Text must be at least ${METHOD_RULES.Vinyl.minTextSizeMm}mm high. Avoid complex curves`);
      }
    }
    
    return { violations, warnings };
  };

  const { violations, warnings } = analyzeDesign();

  const autoFixDesign = () => {
    if (selectedMethod === 'Screen' && violations.some(v => v.includes('Too many colors'))) {
      // Implement color reduction logic here
      console.log('Auto-fixing color palette...');
      // This would reduce the design to 6 or fewer colors
    }
  };

  const getMethodDescription = (method: PrintMethod) => {
    switch (method) {
      case 'DTG':
        return 'Direct-to-Garment printing offers photographic quality with unlimited colors and gradients. Best for detailed designs.';
      case 'Screen':
        return 'Screen printing provides vibrant, durable colors. Perfect for bold designs with limited color palette.';
      case 'Vinyl':
        return 'Heat transfer vinyl creates crisp, solid designs. Ideal for text and simple graphics with long-lasting durability.';
    }
  };

  const getMethodTips = (method: PrintMethod) => {
    switch (method) {
      case 'DTG':
        return [
          'No color limits - use as many colors as needed',
          'Gradients and photo-realistic designs supported',
          'Fine details reproduce accurately',
          `Minimum line width: ${METHOD_RULES.DTG.minLineWidthMm}mm`,
          'Best on 100% cotton garments'
        ];
      case 'Screen':
        return [
          `Maximum ${METHOD_RULES.Screen.maxSpotColors} spot colors`,
          'No gradients - use solid colors only',
          'Bold, high-contrast designs work best',
          `Setup fee: £${METHOD_RULES.Screen.setupFee} + £${METHOD_RULES.Screen.colorFee} per color`,
          'Most cost-effective for large quantities'
        ];
      case 'Vinyl':
        return [
          'Solid colors and shapes only',
          `Minimum text size: ${METHOD_RULES.Vinyl.minTextSizeMm}mm`,
          `Avoid curves smaller than ${METHOD_RULES.Vinyl.minCurveRadius}mm radius`,
          'Perfect for names, numbers, and simple logos',
          'Excellent durability and wash resistance'
        ];
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Print Method Selection</h2>
        <p className="text-muted-foreground">
          Choose the best printing method for your design. Each method has specific requirements and characteristics.
        </p>
      </div>

      {/* Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Print Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={selectedMethod} 
            onValueChange={(value) => setSelectedMethod(value as PrintMethod)}
            className="space-y-4"
          >
            {(['DTG', 'Screen', 'Vinyl'] as PrintMethod[]).map((method) => (
              <div key={method} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/20">
                <RadioGroupItem value={method} id={method} className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor={method} className="text-base font-medium cursor-pointer">
                    {method === 'DTG' ? 'Direct-to-Garment (DTG)' : 
                     method === 'Screen' ? 'Screen Printing' : 
                     'Heat Transfer Vinyl'}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {getMethodDescription(method)}
                  </p>
                  
                  {selectedMethod === method && (
                    <div className="mt-3">
                      <h4 className="text-sm font-medium mb-2">Key Features & Requirements:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {getMethodTips(method).map((tip, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Design Validation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Design Validation</span>
            <Badge variant={violations.length > 0 ? 'destructive' : 'default'}>
              {violations.length > 0 ? `${violations.length} Issues` : 'Valid'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {violations.length === 0 && warnings.length === 0 && (
            <Alert>
              <CheckCircle className="w-4 h-4" />
              <AlertDescription>
                Your design meets all requirements for {selectedMethod} printing.
              </AlertDescription>
            </Alert>
          )}

          {violations.map((violation, index) => (
            <Alert key={index} variant="destructive">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>{violation}</AlertDescription>
            </Alert>
          ))}

          {warnings.map((warning, index) => (
            <Alert key={index}>
              <Info className="w-4 h-4" />
              <AlertDescription>{warning}</AlertDescription>
            </Alert>
          ))}

          {violations.length > 0 && (
            <div className="pt-4">
              <Button onClick={autoFixDesign} className="w-full">
                Auto-fix Issues
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Automatically adjust your design to meet {selectedMethod} requirements
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing Information */}
      {selectedMethod === 'Screen' && (
        <Card>
          <CardHeader>
            <CardTitle>Screen Printing Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Setup Fee (one-time)</span>
                <span className="font-medium">£{METHOD_RULES.Screen.setupFee}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Per Color Fee</span>
                <span className="font-medium">£{METHOD_RULES.Screen.colorFee} each</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between items-center font-medium">
                  <span>Total Screen Fees</span>
                  <span>
                    £{METHOD_RULES.Screen.setupFee + (Math.min(6, nodes.length) * METHOD_RULES.Screen.colorFee)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on estimated {Math.min(6, nodes.length)} colors in your design
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};