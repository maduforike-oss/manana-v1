/**
 * Product Creation Flow - Seamless integration from Studio to Marketplace
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Package, 
  Image, 
  Palette, 
  DollarSign, 
  Tag, 
  Plus, 
  X, 
  Upload,
  Eye,
  Loader2
} from 'lucide-react';
import { useProductMutations } from '@/hooks/useProductManagement';
import { 
  generateGarmentImage, 
  generateGarmentImageBatch,
  getAvailableGarmentTypes,
  getAvailableColors,
  type GarmentImageRequest 
} from '@/lib/api/image-generation';
import { CreateProductPayload } from '@/lib/api/product-management';

interface ProductCreationFlowProps {
  isOpen: boolean;
  onClose: () => void;
  initialDesign?: {
    name?: string;
    garmentType?: string;
    colors?: string[];
    designData?: any;
  };
}

interface ProductVariant {
  sku: string;
  size: string;
  color: string;
  price: number;
  stock_quantity: number;
}

interface ProductImage {
  url: string;
  alt_text: string;
  display_order: number;
  view_type?: 'front' | 'back' | 'side' | 'detail';
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export function ProductCreationFlow({
  isOpen,
  onClose,
  initialDesign,
}: ProductCreationFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [productData, setProductData] = useState<Partial<CreateProductPayload>>({
    name: initialDesign?.name || '',
    description: '',
    base_price: 25.00,
  });
  
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [selectedGarmentType, setSelectedGarmentType] = useState(
    initialDesign?.garmentType || 'tshirt'
  );
  const [selectedColors, setSelectedColors] = useState<string[]>(
    initialDesign?.colors || ['#FFFFFF']
  );

  const { createProduct } = useProductMutations();
  const garmentTypes = getAvailableGarmentTypes();
  const availableColors = getAvailableColors();

  useEffect(() => {
    if (initialDesign) {
      setProductData(prev => ({
        ...prev,
        name: initialDesign.name || '',
      }));
    }
  }, [initialDesign]);

  const steps = [
    { id: 'basic', title: 'Basic Info', icon: Package },
    { id: 'garment', title: 'Garment & Colors', icon: Palette },
    { id: 'images', title: 'Images', icon: Image },
    { id: 'variants', title: 'Variants & Pricing', icon: DollarSign },
    { id: 'review', title: 'Review', icon: Eye },
  ];

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleGenerateImages = async () => {
    if (!selectedGarmentType || selectedColors.length === 0) {
      toast.error('Please select garment type and colors first');
      return;
    }

    setIsGeneratingImages(true);
    try {
      // Generate front and back views for each color
      const colorObjects = selectedColors.map(hex => {
        const colorInfo = availableColors.find(c => c.hex === hex);
        return { name: colorInfo?.name || 'custom', hex };
      });

      const batchRequest = {
        garmentType: selectedGarmentType,
        orientations: ['front', 'back'] as Array<'front' | 'back' | 'side'>,
        colors: colorObjects,
        mode: 'auto' as const,
      };

      const result = await generateGarmentImageBatch(batchRequest);
      
      if (result.success && result.results.length > 0) {
        const newImages: ProductImage[] = result.results
          .filter(r => r.imageUrl)
          .map((r, index) => ({
            url: r.imageUrl!,
            alt_text: `${productData.name} - ${r.color} ${r.orientation}`,
            display_order: index,
            view_type: r.orientation as 'front' | 'back',
          }));

        setImages(newImages);
        toast.success(`Generated ${result.totalGenerated} images successfully!`);
      } else {
        toast.error('Failed to generate images');
      }
    } catch (error) {
      console.error('Error generating images:', error);
      toast.error('Failed to generate images');
    } finally {
      setIsGeneratingImages(false);
    }
  };

  const generateVariants = () => {
    const newVariants: ProductVariant[] = [];
    
    selectedColors.forEach(color => {
      const colorInfo = availableColors.find(c => c.hex === color);
      const colorName = colorInfo?.name || 'Custom';
      
      SIZES.forEach(size => {
        newVariants.push({
          sku: `${generateSlug(productData.name || 'product')}-${colorName.toLowerCase()}-${size.toLowerCase()}`,
          size,
          color: colorName,
          price: productData.base_price || 25.00,
          stock_quantity: 10,
        });
      });
    });
    
    setVariants(newVariants);
  };

  const handleCreateProduct = async () => {
    if (!productData.name || variants.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    const payload: CreateProductPayload = {
      name: productData.name,
      slug: generateSlug(productData.name),
      description: productData.description,
      base_price: productData.base_price || 25.00,
      variants,
      images,
    };

    try {
      const productId = await createProduct.mutateAsync(payload);
      toast.success('Product created successfully!');
      onClose();
      // Navigate to product or marketplace
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="product-name">Product Name *</Label>
              <Input
                id="product-name"
                value={productData.name || ''}
                onChange={(e) => setProductData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter product name"
              />
            </div>
            
            <div>
              <Label htmlFor="product-description">Description</Label>
              <Textarea
                id="product-description"
                value={productData.description || ''}
                onChange={(e) => setProductData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your product..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="base-price">Base Price ($)</Label>
              <Input
                id="base-price"
                type="number"
                step="0.01"
                min="0"
                value={productData.base_price || ''}
                onChange={(e) => setProductData(prev => ({ 
                  ...prev, 
                  base_price: parseFloat(e.target.value) || 0 
                }))}
                placeholder="25.00"
              />
            </div>
          </div>
        );

      case 1: // Garment & Colors
        return (
          <div className="space-y-6">
            <div>
              <Label>Garment Type</Label>
              <Select value={selectedGarmentType} onValueChange={setSelectedGarmentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select garment type" />
                </SelectTrigger>
                <SelectContent>
                  {garmentTypes.map((garment) => (
                    <SelectItem key={garment.id} value={garment.id}>
                      {garment.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Colors</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {availableColors.map((color) => (
                  <div
                    key={color.hex}
                    className={`
                      relative w-12 h-12 rounded-lg cursor-pointer border-2 transition-all
                      ${selectedColors.includes(color.hex) 
                        ? 'border-primary ring-2 ring-primary/20' 
                        : 'border-border hover:border-primary/50'
                      }
                    `}
                    style={{ backgroundColor: color.hex }}
                    onClick={() => {
                      if (selectedColors.includes(color.hex)) {
                        setSelectedColors(prev => prev.filter(c => c !== color.hex));
                      } else {
                        setSelectedColors(prev => [...prev, color.hex]);
                      }
                    }}
                  >
                    {selectedColors.includes(color.hex) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Selected: {selectedColors.length} color(s)
              </p>
            </div>
          </div>
        );

      case 2: // Images
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label>Product Images</Label>
              <Button
                onClick={handleGenerateImages}
                disabled={isGeneratingImages || !selectedGarmentType || selectedColors.length === 0}
              >
                {isGeneratingImages ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Palette className="h-4 w-4 mr-2" />
                )}
                Generate Images
              </Button>
            </div>

            {images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <Card key={index}>
                    <CardContent className="p-2">
                      <img
                        src={image.url}
                        alt={image.alt_text}
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                      <p className="text-xs text-muted-foreground mt-1 text-center">
                        {image.alt_text}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No images generated yet. Click "Generate Images" to create product visuals.
                </p>
              </div>
            )}
          </div>
        );

      case 3: // Variants
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label>Product Variants</Label>
              <Button onClick={generateVariants} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Generate Variants
              </Button>
            </div>

            {variants.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {variants.map((variant, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-center">
                        <div>
                          <Label className="text-xs">SKU</Label>
                          <p className="text-sm font-mono">{variant.sku}</p>
                        </div>
                        <div>
                          <Label className="text-xs">Size</Label>
                          <p className="text-sm">{variant.size}</p>
                        </div>
                        <div>
                          <Label className="text-xs">Color</Label>
                          <p className="text-sm">{variant.color}</p>
                        </div>
                        <div>
                          <Label className="text-xs">Price</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={variant.price}
                            onChange={(e) => {
                              const newVariants = [...variants];
                              newVariants[index].price = parseFloat(e.target.value) || 0;
                              setVariants(newVariants);
                            }}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Stock</Label>
                          <Input
                            type="number"
                            value={variant.stock_quantity}
                            onChange={(e) => {
                              const newVariants = [...variants];
                              newVariants[index].stock_quantity = parseInt(e.target.value) || 0;
                              setVariants(newVariants);
                            }}
                            className="h-8"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No variants created yet. Click "Generate Variants" to create size/color combinations.
                </p>
              </div>
            )}
          </div>
        );

      case 4: // Review
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Product Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <Label className="text-sm text-muted-foreground">Name</Label>
                      <p className="font-medium">{productData.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Description</Label>
                      <p className="text-sm">{productData.description || 'No description'}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Base Price</Label>
                      <p className="font-medium">${productData.base_price?.toFixed(2)}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Product Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <Label className="text-sm text-muted-foreground">Garment Type</Label>
                      <p className="font-medium capitalize">{selectedGarmentType}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Images</Label>
                      <p className="font-medium">{images.length} images</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Variants</Label>
                      <p className="font-medium">{variants.length} variants</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Product Listing</DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                  ${index <= currentStep 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : 'border-border text-muted-foreground'
                  }
                `}
              >
                <step.icon className="h-5 w-5" />
              </div>
              {index < steps.length - 1 && (
                <div 
                  className={`
                    w-16 h-0.5 mx-2 transition-colors
                    ${index < currentStep ? 'bg-primary' : 'bg-border'}
                  `} 
                />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="min-h-[400px]">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
          >
            Previous
          </Button>

          <div className="flex gap-2">
            {currentStep < steps.length - 1 ? (
              <Button
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={
                  (currentStep === 0 && !productData.name) ||
                  (currentStep === 1 && (selectedColors.length === 0 || !selectedGarmentType)) ||
                  (currentStep === 3 && variants.length === 0)
                }
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleCreateProduct}
                disabled={createProduct.isPending || !productData.name || variants.length === 0}
              >
                {createProduct.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Create Product
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}