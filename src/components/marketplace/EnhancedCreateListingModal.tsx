import React, { useState } from 'react';
import { Plus, Upload, X, ArrowLeft, ArrowRight, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCategories } from '@/hooks/useProducts';
import { cn } from '@/lib/utils';
import { GarmentTemplateGallery } from './GarmentTemplateGallery';
import type { SupabaseTemplate } from '@/lib/studio/supabaseTemplates';

interface EnhancedCreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface SelectedTemplate extends SupabaseTemplate {
  selected: boolean;
}

type WizardStep = 'basic' | 'templates' | 'variants' | 'review';

const STEPS: { key: WizardStep; label: string; description: string }[] = [
  { key: 'basic', label: 'Basic Info', description: 'Product details' },
  { key: 'templates', label: 'Templates', description: 'Select garment images' },
  { key: 'variants', label: 'Variants', description: 'Sizes and colors' },
  { key: 'review', label: 'Review', description: 'Finalize listing' },
];

export function EnhancedCreateListingModal({ isOpen, onClose, onSuccess }: EnhancedCreateListingModalProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('basic');
  const [loading, setLoading] = useState(false);
  const [selectedTemplates, setSelectedTemplates] = useState<SelectedTemplate[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_price: '',
    category_id: '',
    status: 'active' as const,
    variants: [
      { size: 'S', color: 'White', price: '', stock: '10' },
      { size: 'M', color: 'White', price: '', stock: '10' },
      { size: 'L', color: 'White', price: '', stock: '10' },
    ]
  });

  const { toast } = useToast();
  const { data: categories = [] } = useCategories();

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
        return formData.variants.every(v => v.price && v.stock);
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

      // Create variants
      const variantInserts = formData.variants.map(variant => ({
        product_id: product.id,
        size: variant.size,
        color: variant.color,
        sku: `${product.id}-${variant.size.toLowerCase()}-${variant.color.toLowerCase()}`,
        price: parseFloat(variant.price || formData.base_price),
        stock_quantity: parseInt(variant.stock),
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
        status: 'active',
        variants: [
          { size: 'S', color: 'White', price: '', stock: '10' },
          { size: 'M', color: 'White', price: '', stock: '10' },
          { size: 'L', color: 'White', price: '', stock: '10' },
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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-background rounded-2xl shadow-2xl border border-border/50 w-full max-w-4xl max-h-[90vh] mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border/30 bg-gradient-to-r from-background to-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Create New Listing</h2>
                <p className="text-sm text-muted-foreground">
                  {STEPS[currentStepIndex].description}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Step {currentStepIndex + 1} of {STEPS.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Indicators */}
          <div className="flex items-center gap-2 mt-3">
            {STEPS.map((step, index) => (
              <div key={step.key} className="flex items-center">
                <div className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                  index <= currentStepIndex 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {index < currentStepIndex && <Check className="h-3 w-3" />}
                  {step.label}
                </div>
                {index < STEPS.length - 1 && (
                  <ChevronRight className="h-3 w-3 text-muted-foreground mx-1" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto max-h-[60vh]">
          <div className="p-6">
            {/* Basic Info Step */}
            {currentStep === 'basic' && (
              <div className="space-y-6">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Vintage Band T-Shirt"
                      className="text-base"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your product in detail..."
                      rows={4}
                      className="text-base"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="price">Base Price ($) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.base_price}
                        onChange={(e) => setFormData(prev => ({ ...prev, base_price: e.target.value }))}
                        placeholder="0.00"
                        className="text-base"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="category">Category</Label>
                      <Select 
                        value={formData.category_id} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Templates Step */}
            {currentStep === 'templates' && (
              <div>
                <div className="mb-4">
                  <h3 className="text-base font-medium mb-2">Select Garment Templates</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose from our collection of professional garment mockups to showcase your design
                  </p>
                </div>
                <GarmentTemplateGallery
                  selectedTemplates={selectedTemplates}
                  onTemplateSelect={handleTemplateSelect}
                  onTemplateDeselect={handleTemplateDeselect}
                />
              </div>
            )}

            {/* Variants Step */}
            {currentStep === 'variants' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-medium mb-2">Product Variants</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Define sizes, colors, and pricing for your product variants
                  </p>
                </div>

                <div className="space-y-3">
                  {formData.variants.map((variant, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-4 gap-4">
                          <div>
                            <Label className="text-xs">Size</Label>
                            <Input
                              value={variant.size}
                              onChange={(e) => {
                                const newVariants = [...formData.variants];
                                newVariants[index].size = e.target.value;
                                setFormData(prev => ({ ...prev, variants: newVariants }));
                              }}
                              placeholder="S"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Color</Label>
                            <Input
                              value={variant.color}
                              onChange={(e) => {
                                const newVariants = [...formData.variants];
                                newVariants[index].color = e.target.value;
                                setFormData(prev => ({ ...prev, variants: newVariants }));
                              }}
                              placeholder="White"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Price ($)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={variant.price}
                              onChange={(e) => {
                                const newVariants = [...formData.variants];
                                newVariants[index].price = e.target.value;
                                setFormData(prev => ({ ...prev, variants: newVariants }));
                              }}
                              placeholder={formData.base_price || "0.00"}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Stock</Label>
                            <Input
                              type="number"
                              value={variant.stock}
                              onChange={(e) => {
                                const newVariants = [...formData.variants];
                                newVariants[index].stock = e.target.value;
                                setFormData(prev => ({ ...prev, variants: newVariants }));
                              }}
                              placeholder="10"
                            />
                          </div>
                        </div>
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
                  <h3 className="text-base font-medium mb-2">Review Your Listing</h3>
                  <p className="text-sm text-muted-foreground">
                    Please review all details before publishing your listing
                  </p>
                </div>

                <div className="grid gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">Product Details</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-muted-foreground">Name:</span> {formData.name}</p>
                        <p><span className="text-muted-foreground">Description:</span> {formData.description}</p>
                        <p><span className="text-muted-foreground">Base Price:</span> ${formData.base_price}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">Selected Templates</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedTemplates.map(template => (
                          <Badge key={`${template.garmentType}-${template.name}`} variant="outline">
                            {template.garmentType} ({template.view})
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">Variants ({formData.variants.length})</h4>
                      <div className="space-y-1 text-sm">
                        {formData.variants.map((variant, index) => (
                          <p key={index}>
                            <span className="text-muted-foreground">{variant.size} {variant.color}:</span> 
                            ${variant.price || formData.base_price} (Stock: {variant.stock})
                          </p>
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
        <div className="px-6 py-4 border-t border-border/30 bg-muted/20">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={currentStepIndex === 0 ? onClose : handlePrevious}
              disabled={loading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {currentStepIndex === 0 ? 'Cancel' : 'Previous'}
            </Button>

            <div className="flex items-center gap-2">
              {currentStep !== 'review' ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceedFromStep(currentStep) || loading}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !canProceedFromStep('review')}
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