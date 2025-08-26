import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStudioStore } from '@/lib/studio/store';
import { MaterialConfig } from '@/lib/studio/types';
import { FABRIC_PROPERTIES, getFabricType } from '@/lib/studio/fabricTypes';
import { Shirt, Droplets, Zap, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const MATERIAL_CONFIGS: MaterialConfig[] = [
  {
    id: 'cotton-premium',
    name: 'Premium Cotton',
    type: 'cotton',
    printMethods: ['screen-print', 'dtg', 'vinyl'],
    basePrice: 18.00,
    colorMultiplier: 1.0,
    properties: {
      roughness: 0.8,
      metalness: 0.0,
      thickness: 0.5,
      texture: 'soft, breathable'
    }
  },
  {
    id: 'cotton-organic',
    name: 'Organic Cotton',
    type: 'cotton',
    printMethods: ['screen-print', 'dtg'],
    basePrice: 22.00,
    colorMultiplier: 1.1,
    properties: {
      roughness: 0.85,
      metalness: 0.0,
      thickness: 0.6,
      texture: 'eco-friendly, soft'
    }
  },
  {
    id: 'polyester-performance',
    name: 'Performance Polyester',
    type: 'performance',
    printMethods: ['sublimation', 'dtg', 'vinyl'],
    basePrice: 16.00,
    colorMultiplier: 0.9,
    properties: {
      roughness: 0.3,
      metalness: 0.1,
      thickness: 0.3,
      texture: 'moisture-wicking, athletic'
    }
  },
  {
    id: 'blend-comfort',
    name: 'Cotton-Poly Blend',
    type: 'blend',
    printMethods: ['screen-print', 'dtg', 'vinyl'],
    basePrice: 19.00,
    colorMultiplier: 1.0,
    properties: {
      roughness: 0.6,
      metalness: 0.0,
      thickness: 0.4,
      texture: 'durable, comfortable'
    }
  },
  {
    id: 'fleece-heavyweight',
    name: 'Heavyweight Fleece',
    type: 'fleece',
    printMethods: ['screen-print', 'embroidery', 'vinyl'],
    basePrice: 28.00,
    colorMultiplier: 1.2,
    properties: {
      roughness: 0.9,
      metalness: 0.0,
      thickness: 1.0,
      texture: 'warm, brushed interior'
    }
  }
];

const PRINT_METHODS = [
  {
    id: 'screen-print',
    name: 'Screen Print',
    description: 'Best for bold designs with few colors',
    icon: <Shirt className="w-4 h-4" />,
    maxColors: 6,
    recommended: ['cotton', 'blend']
  },
  {
    id: 'dtg',
    name: 'Direct-to-Garment',
    description: 'Perfect for detailed, multi-color designs',
    icon: <Droplets className="w-4 h-4" />,
    maxColors: 16,
    recommended: ['cotton']
  },
  {
    id: 'sublimation',
    name: 'Sublimation',
    description: 'Vibrant, full-color printing on polyester',
    icon: <Zap className="w-4 h-4" />,
    maxColors: 'unlimited',
    recommended: ['performance', 'polyester']
  },
  {
    id: 'embroidery',
    name: 'Embroidery',
    description: 'Premium, textured finish',
    icon: <Shield className="w-4 h-4" />,
    maxColors: 8,
    recommended: ['cotton', 'fleece']
  }
];

interface MaterialSelectorProps {
  className?: string;
}

export const MaterialSelector: React.FC<MaterialSelectorProps> = ({ className }) => {
  const { doc, updateCanvas, updateMaterialConfig } = useStudioStore();
  
  const currentGarmentType = doc.canvas.garmentType || 't-shirt';
  const currentFabricType = getFabricType(currentGarmentType);
  const currentMaterial = MATERIAL_CONFIGS.find(m => m.type === currentFabricType) || MATERIAL_CONFIGS[0];

  const [selectedPrintMethod, setSelectedPrintMethod] = React.useState('screen-print');

  const handleMaterialChange = (materialId: string) => {
    const material = MATERIAL_CONFIGS.find(m => m.id === materialId);
    if (material) {
      updateMaterialConfig?.(material);
    }
  };

  const handlePrintMethodChange = (method: string) => {
    setSelectedPrintMethod(method);
    // Update canvas with print method info
    updateCanvas({ 
      printMethod: method 
    } as any);
  };

  const getCompatibleMaterials = () => {
    return MATERIAL_CONFIGS.filter(material => {
      const printMethod = PRINT_METHODS.find(pm => pm.id === selectedPrintMethod);
      return !printMethod || printMethod.recommended.includes(material.type);
    });
  };

  const getRecommendedPrintMethods = (materialType: string) => {
    return PRINT_METHODS.filter(method => 
      method.recommended.includes(materialType)
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Material Selection */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-foreground">Material</Label>
          <Select 
            value={currentMaterial.id}
            onValueChange={handleMaterialChange}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {getCompatibleMaterials().map((material) => (
                <SelectItem key={material.id} value={material.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{material.name}</span>
                    <Badge variant="outline" className="ml-2">
                      ${material.basePrice}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Material Properties */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">{currentMaterial.name}</h4>
              <p className="text-xs text-muted-foreground">
                {currentMaterial.properties.texture}
              </p>
              <div className="flex gap-2 flex-wrap">
                {currentMaterial.printMethods.map((method) => (
                  <Badge key={method} variant="secondary" className="text-xs">
                    {method}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Print Method Selection */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-foreground">Print Method</Label>
          <p className="text-xs text-muted-foreground">
            Choose the best printing method for your design
          </p>
        </div>

        <div className="space-y-2">
          {getRecommendedPrintMethods(currentMaterial.type).map((method) => (
            <Card 
              key={method.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md",
                selectedPrintMethod === method.id 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => handlePrintMethodChange(method.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-md",
                    selectedPrintMethod === method.id 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {method.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{method.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {typeof method.maxColors === 'number' 
                          ? `${method.maxColors} colors`
                          : method.maxColors
                        }
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {method.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Fabric Properties Display */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-foreground">Fabric Properties</Label>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-1">
            <span className="text-muted-foreground">Weight</span>
            <div className="font-medium">
              {FABRIC_PROPERTIES[currentMaterial.type]?.displayName || 'Standard'}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground">Print Quality</span>
            <div className="font-medium">
              {FABRIC_PROPERTIES[currentMaterial.type]?.printQuality || 'Good'}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground">Durability</span>
            <div className="font-medium">
              {FABRIC_PROPERTIES[currentMaterial.type]?.durability || 'High'}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground">Base Price</span>
            <div className="font-medium text-primary">
              ${currentMaterial.basePrice.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};