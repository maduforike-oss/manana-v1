import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Image, DollarSign, Package, Palette, Info, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { GARMENT_TYPES } from '@/lib/studio/garments';

export default function AddListing() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    garmentType: '',
    listingType: 'design-only' as 'design-only' | 'print-design' | 'print-only',
    price: '',
    tags: [] as string[],
    sizes: [] as string[],
    colors: [] as string[],
    category: '',
    printMethods: [] as string[],
    designFiles: [] as File[],
    mockupImages: [] as File[],
    isExclusive: false,
    royaltyRate: '50',
    shippingTime: '3-5'
  });

  const [newTag, setNewTag] = useState('');
  const [currentStep, setCurrentStep] = useState(0);

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const availableColors = ['Black', 'White', 'Gray', 'Navy', 'Red', 'Blue', 'Green', 'Yellow'];
  const categories = ['Apparel', 'Accessories', 'Home & Living', 'Stationery', 'Art'];
  const printMethods = ['Digital Print', 'Screen Print', 'Embroidery', 'Heat Transfer', 'Sublimation'];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field: string, value: string) => {
    setFormData(prev => {
      const currentArray = prev[field as keyof typeof prev] as string[];
      return {
        ...prev,
        [field]: currentArray.includes(value)
          ? currentArray.filter((item: string) => item !== value)
          : [...currentArray, value]
      };
    });
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim()) && formData.tags.length < 10) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleFileUpload = (field: 'designFiles' | 'mockupImages', files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      setFormData(prev => ({ ...prev, [field]: [...prev[field], ...fileArray] }));
    }
  };

  const removeFile = (field: 'designFiles' | 'mockupImages', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!(formData.title && formData.description && formData.garmentType && formData.listingType);
      case 1:
        return !!(formData.price && formData.category);
      case 2:
        return formData.designFiles.length > 0 || formData.mockupImages.length > 0;
      default:
        return true;
    }
  };

  const handleSubmit = () => {
    // In a real app, this would submit to an API
    toast({
      title: "Listing created successfully!",
      description: "Your item is now live in the marketplace"
    });
    navigate('/');
  };

  const steps = [
    { title: 'Basic Info', icon: Info },
    { title: 'Pricing & Details', icon: DollarSign },
    { title: 'Files & Images', icon: Upload },
    { title: 'Review & Publish', icon: Package }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="font-semibold">Create New Listing</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep || (index === currentStep && validateStep(index));
              
              return (
                <div key={index} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                    ${isActive ? 'border-primary bg-primary text-primary-foreground' : 
                      isCompleted ? 'border-green-500 bg-green-500 text-white' : 
                      'border-muted-foreground bg-muted text-muted-foreground'}
                  `}>
                    <Icon className="h-4 w-4" />
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`
                      w-full h-0.5 mx-4 transition-all
                      ${index < currentStep ? 'bg-green-500' : 'bg-muted'}
                    `} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="text-center">
            <h2 className="font-semibold">{steps[currentStep].title}</h2>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Step 0: Basic Info */}
          {currentStep === 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="title">Listing Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Minimalist Typography T-Shirt Design"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your design, inspiration, and what makes it special..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label>Garment Type *</Label>
                  <Select value={formData.garmentType} onValueChange={(value) => handleInputChange('garmentType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select garment type" />
                    </SelectTrigger>
                    <SelectContent>
                      {GARMENT_TYPES.map((garment) => (
                        <SelectItem key={garment.id} value={garment.id}>
                          {garment.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Listing Type *</Label>
                  <div className="grid grid-cols-1 gap-3 mt-2">
                    {[
                      { value: 'design-only', label: 'Design Only', desc: 'Sell digital design files only' },
                      { value: 'print-design', label: 'Print + Design', desc: 'Sell both printed products and design files' },
                      { value: 'print-only', label: 'Print Only', desc: 'Sell printed products only' }
                    ].map((option) => (
                      <div 
                        key={option.value}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.listingType === option.value 
                            ? 'border-primary bg-primary/10' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => handleInputChange('listingType', option.value)}
                      >
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-muted-foreground">{option.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 1: Pricing & Details */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="price">Price (USD) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="0.00"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label>Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Available Sizes</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {availableSizes.map((size) => (
                      <Button
                        key={size}
                        variant={formData.sizes.includes(size) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleArrayToggle('sizes', size)}
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Available Colors</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {availableColors.map((color) => (
                      <Button
                        key={color}
                        variant={formData.colors.includes(color) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleArrayToggle('colors', color)}
                      >
                        {color}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Print Methods</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {printMethods.map((method) => (
                      <Button
                        key={method}
                        variant={formData.printMethods.includes(method) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleArrayToggle('printMethods', method)}
                      >
                        {method}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Tags</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button onClick={addTag} disabled={!newTag.trim()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                        {tag}
                        <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Files & Images */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Design Files</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">Upload Design Files</p>
                    <p className="text-muted-foreground mb-4">
                      Upload your design files (AI, PSD, PNG, SVG, etc.)
                    </p>
                    <input
                      type="file"
                      multiple
                      accept=".ai,.psd,.png,.svg,.jpg,.jpeg"
                      onChange={(e) => handleFileUpload('designFiles', e.target.files)}
                      className="hidden"
                      id="design-upload"
                    />
                    <Button asChild>
                      <label htmlFor="design-upload" className="cursor-pointer">
                        Choose Files
                      </label>
                    </Button>
                  </div>
                  {formData.designFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {formData.designFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <span className="text-sm">{file.name}</span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeFile('designFiles', index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mockup Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">Upload Mockup Images</p>
                    <p className="text-muted-foreground mb-4">
                      Upload mockup images to showcase your design
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleFileUpload('mockupImages', e.target.files)}
                      className="hidden"
                      id="mockup-upload"
                    />
                    <Button asChild>
                      <label htmlFor="mockup-upload" className="cursor-pointer">
                        Choose Images
                      </label>
                    </Button>
                  </div>
                  {formData.mockupImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {formData.mockupImages.map((file, index) => (
                        <div key={index} className="relative">
                          <img 
                            src={URL.createObjectURL(file)} 
                            alt={`Mockup ${index + 1}`}
                            className="w-full aspect-square object-cover rounded"
                          />
                          <Button 
                            variant="destructive" 
                            size="sm"
                            className="absolute top-1 right-1"
                            onClick={() => removeFile('mockupImages', index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Review & Publish */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Review & Publish</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Title</Label>
                    <p className="font-medium">{formData.title}</p>
                  </div>
                  <div>
                    <Label>Price</Label>
                    <p className="font-medium">${formData.price}</p>
                  </div>
                  <div>
                    <Label>Garment Type</Label>
                    <p className="font-medium">{formData.garmentType}</p>
                  </div>
                  <div>
                    <Label>Listing Type</Label>
                    <p className="font-medium">{formData.listingType}</p>
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <p className="text-muted-foreground">{formData.description}</p>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <Label>Make this an exclusive design</Label>
                    <p className="text-sm text-muted-foreground">Only you can sell this design</p>
                  </div>
                  <Switch 
                    checked={formData.isExclusive}
                    onCheckedChange={(checked) => handleInputChange('isExclusive', checked)}
                  />
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">Ready to publish?</h4>
                  <p className="text-sm text-blue-700">
                    Your listing will be reviewed and go live within 24 hours.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            
            {currentStep < steps.length - 1 ? (
              <Button 
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!validateStep(currentStep)}
              >
                Next
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={!validateStep(currentStep)}
              >
                Publish Listing
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}