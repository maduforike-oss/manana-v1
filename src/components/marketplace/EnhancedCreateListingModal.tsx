import React, { useState } from 'react';
import { Plus, X, Check, ChevronRight, ArrowLeft, Package, Palette, Eye, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { GarmentTemplateGallery } from './GarmentTemplateGallery';
import type { SupabaseTemplate } from '@/lib/studio/supabaseTemplates';

interface SelectedTemplate extends SupabaseTemplate {
  selected: boolean;
}

interface EnhancedCreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type WizardStep = 'basic' | 'templates' | 'variants' | 'review';

const STEPS = [
  { key: 'basic' as const, label: 'Basic Info', description: 'Product name, description, and base price', icon: Package },
  { key: 'templates' as const, label: 'Templates', description: 'Select garment templates from our gallery', icon: Palette },
  { key: 'variants' as const, label: 'Variants', description: 'Configure sizes, colors, and inventory', icon: Sparkles },
  { key: 'review' as const, label: 'Review', description: 'Review and publish your listing', icon: Eye },
];

interface EnhancedVariant {
  size: string;
  color: string;
  price: string;
  stock: string;
  measurements?: {
    chest?: string;
    length?: string;
    sleeve?: string;
  };
}

export function EnhancedCreateListingModal({ isOpen, onClose, onSuccess }: EnhancedCreateListingModalProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('basic');
  const [loading, setLoading] = useState(false);
  const [selectedTemplates, setSelectedTemplates] = useState<SelectedTemplate[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_price: '',
    category_id: '',
    status: 'active' as 'active' | 'draft',
    variants: [
      { size: 'S', color: 'White', price: '', stock: '10', measurements: {} },
      { size: 'M', color: 'White', price: '', stock: '10', measurements: {} },
      { size: 'L', color: 'White', price: '', stock: '10', measurements: {} },
    ] as EnhancedVariant[]
  });

  const { toast } = useToast();

  const currentStepIndex = STEPS.findIndex(step => step.key === currentStep);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  const handleTemplateSelect = (template: SupabaseTemplate) => {
    setSelectedTemplates(prev => [...prev, { ...template, selected: true }]);
  };

  const handleTemplateDeselect = (template: SupabaseTemplate) => {
    setSelectedTemplates(prev => 
      prev.filter(t => !(t.name === template.name && t.garmentType === template.garmentType))
    );
  };

  const canProceedFromStep = (step: WizardStep): boolean => {
    switch (step) {
      case 'basic':
        return !!(formData.name && formData.description && formData.base_price);
      case 'templates':
        return selectedTemplates.length > 0;
      case 'variants':
        // Allow variants without individual prices (will default to base_price)
        return formData.variants.every(v => v.stock && parseInt(v.stock) >= 0);
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!canProceedFromStep(currentStep)) return;
    
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex].key);
    }
  };

  const handlePrevious = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].key);
    }
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { size: '', color: '', price: '', stock: '10', measurements: {} }]
    }));
  };

  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const updateVariant = (index: number, field: keyof EnhancedVariant, value: string) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        i === index ? { ...variant, [field]: value } : variant
      )
    }));
  };

  const updateVariantMeasurement = (index: number, measurement: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        i === index ? { 
          ...variant, 
          measurements: { ...variant.measurements, [measurement]: value }
        } : variant
      )
    }));
  };

  const handleSubmit = async () => {
    if (!canProceedFromStep('review')) return;

    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to create a listing",
          variant: "destructive",
        });
        return;
      }

      // Create slug from name
      const slug = formData.name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();

      // Create product
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          name: formData.name,
          description: formData.description,
          base_price: parseFloat(formData.base_price),
          category_id: formData.category_id || null,
          status: formData.status,
          slug: `${slug}-${Date.now()}`,
          owner_id: user.user.id,
        })
        .select()
        .single();

      if (productError) throw productError;

      // Create variants with proper defaults
      const variantInserts = formData.variants.map(variant => ({
        product_id: product.id,
        size: variant.size,
        color: variant.color,
        sku: `${product.id}-${variant.size.toLowerCase()}-${variant.color.toLowerCase()}`,
        price: parseFloat(variant.price || formData.base_price),
        stock_quantity: parseInt(variant.stock),
        measurements: variant.measurements && Object.keys(variant.measurements).length > 0 
          ? variant.measurements 
          : null,
      }));

      const { error: variantsError } = await supabase
        .from('product_variants')
        .insert(variantInserts);

      if (variantsError) throw variantsError;

      // Create product images from selected templates
      if (selectedTemplates.length > 0) {
        const imageInserts = selectedTemplates.map((template, index) => ({
          product_id: product.id,
          url: template.url,
          alt_text: `${formData.name} - ${template.garmentType} ${template.view}`,
          display_order: index,
        }));

        const { error: imagesError } = await supabase
          .from('product_images')
          .insert(imageInserts);

        if (imagesError) {
          console.warn('Failed to create product images:', imagesError);
        }
      }

      toast({
        title: "Listing created successfully!",
        description: `${formData.name} has been added to the marketplace`,
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        base_price: '',
        category_id: '',
        status: 'active' as 'active' | 'draft',
        variants: [
          { size: 'S', color: 'White', price: '', stock: '10', measurements: {} },
          { size: 'M', color: 'White', price: '', stock: '10', measurements: {} },
          { size: 'L', color: 'White', price: '', stock: '10', measurements: {} },
        ]
      });
      setSelectedTemplates([]);
      setCurrentStep('basic');
      onClose();
      onSuccess?.();
    } catch (error: any) {
      console.error('Error creating listing:', error);
      toast({
        title: "Error creating listing",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-xl"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-card/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-border/50 w-full max-w-5xl max-h-[95vh] mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-border/30 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Create New Listing
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {STEPS[currentStepIndex].description}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-full h-10 w-10 p-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Progress */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Step {currentStepIndex + 1} of {STEPS.length}</span>
              <span className="font-medium text-primary">{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2 bg-muted/50" />
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-between mt-6 gap-2">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <div 
                  key={step.key} 
                  className={cn(
                    "flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300",
                    index <= currentStepIndex 
                      ? "bg-primary/10 text-primary border border-primary/20" 
                      : "bg-muted/50 text-muted-foreground border border-transparent"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{step.label}</span>
                  {index < currentStepIndex && <Check className="h-3 w-3 ml-1" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto max-h-[55vh]">
          <div className="p-8">
            {/* Basic Info Step */}
            {currentStep === 'basic' && (
              <div className="space-y-8">
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="name" className="text-base font-medium">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Premium Cotton T-Shirt"
                      className="text-base h-12"
                    />
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="description" className="text-base font-medium">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your product's features, materials, and unique qualities..."
                      rows={4}
                      className="text-base resize-none"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="base_price" className="text-base font-medium">Base Price * ($)</Label>
                      <Input
                        id="base_price"
                        type="number"
                        step="0.01"
                        value={formData.base_price}
                        onChange={(e) => setFormData(prev => ({ ...prev, base_price: e.target.value }))}
                        placeholder="29.99"
                        className="text-base h-12"
                      />
                    </div>

                    <div className="grid gap-3">
                      <Label htmlFor="status" className="text-base font-medium">Status</Label>
                      <select
                        id="status"
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'draft' }))}
                        className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Templates Step */}
            {currentStep === 'templates' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Select Garment Templates</h3>
                  <p className="text-muted-foreground">
                    Choose from our collection of professionally photographed garment templates
                  </p>
                </div>
                <GarmentTemplateGallery
                  selectedTemplates={selectedTemplates}
                  onTemplateSelect={handleTemplateSelect}
                  onTemplateDeselect={handleTemplateDeselect}
                />
              </div>
            )}

            {/* Enhanced Variants Step */}
            {currentStep === 'variants' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Product Variants</h3>
                    <p className="text-muted-foreground">
                      Configure sizes, colors, pricing, and inventory for each variant
                    </p>
                  </div>
                  <Button onClick={addVariant} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Variant
                  </Button>
                </div>

                <div className="space-y-4">
                  {formData.variants.map((variant, index) => (
                    <Card key={index} className="relative">
                      <CardContent className="p-6">
                        {formData.variants.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeVariant(index)}
                            className="absolute top-4 right-4 h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Size *</Label>
                            <Input
                              value={variant.size}
                              onChange={(e) => updateVariant(index, 'size', e.target.value)}
                              placeholder="S, M, L, XL..."
                              className="h-10"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Color *</Label>
                            <Input
                              value={variant.color}
                              onChange={(e) => updateVariant(index, 'color', e.target.value)}
                              placeholder="White, Black, Navy..."
                              className="h-10"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Price ($)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={variant.price}
                              onChange={(e) => updateVariant(index, 'price', e.target.value)}
                              placeholder={`${formData.base_price || 'Base price'}`}
                              className="h-10"
                            />
                            <p className="text-xs text-muted-foreground">
                              Leave empty to use base price (${formData.base_price})
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Stock *</Label>
                            <Input
                              type="number"
                              min="0"
                              value={variant.stock}
                              onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                              placeholder="10"
                              className="h-10"
                            />
                          </div>
                        </div>

                        {/* Optional Measurements */}
                        <details className="mt-4">
                          <summary className="text-sm font-medium cursor-pointer text-primary hover:text-primary/80">
                            Add Measurements (Optional)
                          </summary>
                          <div className="grid sm:grid-cols-3 gap-4 mt-3 p-4 bg-muted/30 rounded-lg">
                            <div className="space-y-2">
                              <Label className="text-xs">Chest (inches)</Label>
                              <Input
                                type="number"
                                step="0.5"
                                value={variant.measurements?.chest || ''}
                                onChange={(e) => updateVariantMeasurement(index, 'chest', e.target.value)}
                                placeholder="20"
                                className="h-9 text-sm"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs">Length (inches)</Label>
                              <Input
                                type="number"
                                step="0.5"
                                value={variant.measurements?.length || ''}
                                onChange={(e) => updateVariantMeasurement(index, 'length', e.target.value)}
                                placeholder="28"
                                className="h-9 text-sm"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs">Sleeve (inches)</Label>
                              <Input
                                type="number"
                                step="0.5"
                                value={variant.measurements?.sleeve || ''}
                                onChange={(e) => updateVariantMeasurement(index, 'sleeve', e.target.value)}
                                placeholder="8"
                                className="h-9 text-sm"
                              />
                            </div>
                          </div>
                        </details>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Review Step */}
            {currentStep === 'review' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Review Your Listing</h3>
                  <p className="text-muted-foreground">
                    Please review all details before publishing your listing
                  </p>
                </div>

                <div className="grid gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Product Details
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Name:</span>
                          <span className="font-medium">{formData.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Base Price:</span>
                          <span className="font-medium text-primary">${formData.base_price}</span>
                        </div>
                        <div className="pt-2 border-t">
                          <span className="text-muted-foreground text-xs">Description:</span>
                          <p className="mt-1 text-sm">{formData.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Selected Templates ({selectedTemplates.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedTemplates.map(template => (
                          <Badge key={`${template.garmentType}-${template.name}`} variant="outline" className="px-3 py-1">
                            {template.garmentType} • {template.view} • {template.color}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Variants ({formData.variants.length})
                      </h4>
                      <div className="space-y-3">
                        {formData.variants.map((variant, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-4">
                              <Badge variant="secondary">{variant.size}</Badge>
                              <span className="text-sm">{variant.color}</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="font-medium text-primary">
                                ${variant.price || formData.base_price}
                              </span>
                              <span className="text-muted-foreground">
                                Stock: {variant.stock}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-border/30 bg-gradient-to-r from-muted/30 to-muted/10">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={currentStepIndex === 0 ? onClose : handlePrevious}
              disabled={loading}
              className="px-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {currentStepIndex === 0 ? 'Cancel' : 'Previous'}
            </Button>

            <div className="flex items-center gap-3">
              {currentStep !== 'review' ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceedFromStep(currentStep) || loading}
                  className="px-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                >
                  Next Step
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceedFromStep(currentStep) || loading}
                  className="px-8 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                >
                  {loading ? 'Creating...' : 'Create Listing'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}