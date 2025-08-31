import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Sparkles, Upload, Wand2, ArrowLeft, Loader2, Shirt, Brain, Type, Camera, FileImage, Palette } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useStudioStore } from '@/lib/studio/store';
import { useNavigation } from '@/hooks/useNavigation';
import { GARMENTS } from '@/lib/studio/garments';
import { analyzeDesignPrompt, generateDesignElements, elementsToNodes, analyzeImageForDesign } from '@/lib/studio/aiDesignGenerator';
import { garmentGenerator, GenerationOptions } from '@/lib/studio/garmentImageGenerator';
import { getGarmentSpec } from '@/lib/studio/garmentSpecs';
import { toast } from 'sonner';

interface AIDesignCreatorProps {
  onBack?: () => void;
}

export const AIDesignCreator: React.FC<AIDesignCreatorProps> = ({ onBack }) => {
  const [mode, setMode] = useState<'select' | 'prompt' | 'image' | 'garment'>('select');
  const [prompt, setPrompt] = useState('');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [selectedGarment, setSelectedGarment] = useState<string>('tshirt');
  const [selectedOrientation, setSelectedOrientation] = useState<'front' | 'back'>('front');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  
  const { createDesign, setCurrentTab } = useAppStore();
  const { initializeStudio, addNode, setDoc } = useStudioStore();
  const { navigateToStudio } = useNavigation();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setUploadedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const generateGarmentBase = async () => {
    if (!selectedGarment) {
      toast.error('Please select a garment type');
      return;
    }

    setIsGenerating(true);
    setGenerationStep('Generating garment template...');

    try {
      // Generate garment base image
      const generationOptions: GenerationOptions = {
        garmentId: selectedGarment,
        orientation: selectedOrientation,
        color: 'white',
        material: 'cotton',
        style: 'minimal'
      };

      const result = await garmentGenerator.generateGarment(generationOptions);
      
      setGenerationStep('Setting up canvas...');

      // Create a new design
      const design = createDesign({
        name: `${result.spec.name} Design`,
        garmentType: selectedGarment as any
      });

      // Initialize studio with generated garment
      initializeStudio();
      
      // Update canvas configuration with garment specs
      const canvasSize = { width: result.spec.canvasWidth, height: result.spec.canvasHeight };
      setDoc(prev => ({
        ...prev,
        canvas: {
          ...prev.canvas,
          width: canvasSize.width,
          height: canvasSize.height,
          garmentType: selectedGarment,
          baseImageUrl: result.imageUrl
        }
      }));

      setGenerationStep('');
      toast.success('Garment template ready!');

      // Navigate to studio
      setCurrentTab('studio');
      if (navigateToStudio) {
        navigateToStudio();
      }
    } catch (error) {
      console.error('Garment generation failed:', error);
      toast.error('Failed to generate garment template. Please try again.');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const generateDesign = async () => {
    if (!selectedGarment) {
      toast.error('Please select a garment type');
      return;
    }

    if (mode === 'prompt' && !prompt.trim()) {
      toast.error('Please enter a design prompt');
      return;
    }

    if (mode === 'image' && !uploadedImage) {
      toast.error('Please upload an image');
      return;
    }

    setIsGenerating(true);

    try {
      // First generate garment base
      await generateGarmentBase();

      // Then add design elements
      if (mode === 'prompt') {
        await generateFromPrompt();
      } else if (mode === 'image') {
        await generateFromImage();
      }
    } catch (error) {
      console.error('Design generation failed:', error);
      toast.error('Failed to generate design. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFromPrompt = async () => {
    // Analyze prompt using AI system
    const analysis = analyzeDesignPrompt(prompt);
    const elements = generateDesignElements(analysis, selectedGarment);
    const nodes = elementsToNodes(elements);
    
    // Add nodes to canvas
    for (const node of nodes) {
      addNode(node);
    }
  };

  const generateFromImage = async () => {
    if (!uploadedImage) return;
    
    // Analyze image using AI system
    const elements = await analyzeImageForDesign(uploadedImage);
    const nodes = elementsToNodes(elements);
    
    // Add the original image as a node
    const imageUrl = URL.createObjectURL(uploadedImage);
    addNode({
      id: `ai_image_${Date.now()}`,
      type: 'image',
      name: 'AI Extracted Image',
      x: 150,
      y: 100,
      width: 300,
      height: 200,
      rotation: 0,
      opacity: 1,
      src: imageUrl
    });
    
    // Add extracted design elements
    for (const node of nodes) {
      if (node.type !== 'image') { // Don't duplicate the image
        addNode(node);
      }
    }
  };

  if (mode === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              {onBack && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="absolute left-6 top-6"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <Sparkles className="w-8 h-8 text-primary animate-pulse" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                AI Design Creator
              </h1>
              <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Create stunning apparel designs using AI. Choose your preferred method to get started.
            </p>
          </div>

          {/* Mode Selection Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Quick Garment Generation */}
            <Card 
              className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 hover:border-primary/50"
              onClick={() => setMode('garment')}
            >
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-accent to-accent/60 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shirt className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">Quick Start</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Generate a clean garment template and start designing immediately.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="secondary">Fast</Badge>
                  <Badge variant="secondary">Clean Base</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Text Prompt Mode */}
            <Card 
              className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 hover:border-primary/50"
              onClick={() => setMode('prompt')}
            >
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Wand2 className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">From Text Prompt</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Describe your design idea and let AI create it for you.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="secondary">Smart Layouts</Badge>
                  <Badge variant="secondary">Typography</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Image Upload Mode */}
            <Card 
              className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 hover:border-primary/50"
              onClick={() => setMode('image')}
            >
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-secondary to-secondary/60 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">From Image</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Upload an image and AI will analyze it to create design elements.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="secondary">Color Extraction</Badge>
                  <Badge variant="secondary">Style Transfer</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feature Highlights */}
          <div className="mt-16 text-center">
            <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-muted-foreground">Apparel-Optimized</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-muted-foreground">Print-Ready Output</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-muted-foreground">Professional Quality</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-muted-foreground">Instant Generation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'garment') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMode('select')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Quick Garment Setup</h1>
              <p className="text-muted-foreground">Generate a clean template to start designing</p>
            </div>
          </div>

          {/* Garment Selection */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Select Garment Type & Orientation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Garment Type Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Garment Type</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {Object.entries(GARMENTS).map(([key, garment]) => (
                    <Button
                      key={key}
                      variant={selectedGarment === key ? "default" : "outline"}
                      onClick={() => setSelectedGarment(key)}
                      className="p-4 h-auto flex flex-col gap-2"
                    >
                      <Shirt className="w-6 h-6" />
                      <span className="text-sm">{garment.name}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Orientation Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Orientation</label>
                <div className="flex gap-3">
                  <Button
                    variant={selectedOrientation === 'front' ? "default" : "outline"}
                    onClick={() => setSelectedOrientation('front')}
                  >
                    Front
                  </Button>
                  <Button
                    variant={selectedOrientation === 'back' ? "default" : "outline"}
                    onClick={() => setSelectedOrientation('back')}
                  >
                    Back
                  </Button>
                </div>
              </div>

              {/* Garment Spec Preview */}
              {selectedGarment && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Template Specifications</h4>
                  {(() => {
                    const spec = getGarmentSpec(selectedGarment);
                    return spec ? (
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>Canvas: {spec.canvasWidth} × {spec.canvasHeight}px</div>
                        <div>DPI: {spec.dpi}</div>
                        <div>Print Area: {spec.printAreas[selectedOrientation]?.width || 'N/A'} × {spec.printAreas[selectedOrientation]?.height || 'N/A'}px</div>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">Specifications not available</div>
                    );
                  })()}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generate Button */}
          <div className="flex justify-center">
            <Button
              onClick={generateGarmentBase}
              disabled={isGenerating || !selectedGarment}
              size="lg"
              className="px-8"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {generationStep || 'Generating...'}
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate Template
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Prompt and Image modes (existing functionality)
  return (
    <div className="h-full bg-background overflow-auto">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Button
          onClick={() => setMode('select')}
          variant="ghost"
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Options
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {mode === 'prompt' ? 'Describe Your Vision' : 'Upload Your Inspiration'}
          </h1>
          <p className="text-muted-foreground">
            {mode === 'prompt' 
              ? 'Tell AI what you want to create and it will generate the perfect design'
              : 'Upload an image and AI will create a design inspired by it'
            }
          </p>
        </div>

        <div className="space-y-8">
          {/* Garment Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shirt className="w-5 h-5" />
                Select Garment Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(GARMENTS).slice(0, 8).map(([key, garment]) => (
                  <Button
                    key={key}
                    onClick={() => setSelectedGarment(key)}
                    variant={selectedGarment === key ? "default" : "outline"}
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <Shirt className="w-6 h-6" />
                    <span className="text-xs capitalize">
                      {garment.name}
                    </span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Input Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {mode === 'prompt' ? (
                  <Type className="w-5 h-5" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
                {mode === 'prompt' ? 'Design Prompt' : 'Upload Image'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mode === 'prompt' ? (
                <div className="space-y-4">
                  <Textarea
                    placeholder="Describe your design idea... e.g., 'A minimalist mountain landscape in blue and white colors for a hiking t-shirt' or 'Vintage-style typography saying Welcome to the Future with retro colors'"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-32"
                  />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-2">AI understands:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <span>• Style preferences</span>
                      <span>• Color schemes</span>
                      <span>• Text content</span>
                      <span>• Graphic elements</span>
                      <span>• Layout composition</span>
                      <span>• Target audience</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    {previewUrl ? (
                      <div className="space-y-4">
                        <img 
                          src={previewUrl} 
                          alt="Preview" 
                          className="max-w-64 max-h-64 mx-auto rounded-lg"
                        />
                        <p className="text-sm text-muted-foreground">
                          {uploadedImage?.name}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                        <div>
                          <p className="text-foreground font-medium">Upload an image</p>
                          <p className="text-sm text-muted-foreground">
                            JPG, PNG, or GIF up to 10MB
                          </p>
                        </div>
                      </div>
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="mt-4"
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-2">AI will analyze:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <span>• Color palette</span>
                      <span>• Visual style</span>
                      <span>• Composition</span>
                      <span>• Key elements</span>
                      <span>• Text content</span>
                      <span>• Overall mood</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Button
            onClick={generateDesign}
            disabled={!selectedGarment || (!prompt && !uploadedImage) || isGenerating}
            size="lg"
            className="w-full h-14 text-lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Design...
              </>
            ) : (
              <>
                <Brain className="w-5 h-5 mr-2" />
                Generate AI Design
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};