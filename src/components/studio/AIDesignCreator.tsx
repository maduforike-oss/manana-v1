import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/store/useAppStore';
import { useStudioStore } from '../../lib/studio/store';
import { GARMENT_TYPES } from '@/lib/studio/garments';
import { 
  analyzeDesignPrompt, 
  generateDesignElements, 
  elementsToNodes,
  analyzeImageForDesign
} from '@/lib/studio/aiDesignGenerator';
import { cn } from '@/lib/utils';
import { 
  Brain, 
  Upload, 
  Type, 
  Palette, 
  Sparkles, 
  ImageIcon,
  Shirt,
  ArrowLeft,
  Loader2,
  Wand2,
  Camera,
  FileImage
} from 'lucide-react';

interface AIDesignCreatorProps {
  onBack?: () => void;
}

export const AIDesignCreator = ({ onBack }: AIDesignCreatorProps) => {
  const [mode, setMode] = useState<'prompt' | 'image' | null>(null);
  const [prompt, setPrompt] = useState('');
  const [selectedGarment, setSelectedGarment] = useState('');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const { createDesign, setActiveTab } = useAppStore();
  const { initializeFromGarment, addNode } = useStudioStore();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setUploadedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const generateDesign = async () => {
    if (!selectedGarment || (!prompt && !uploadedImage)) return;
    
    setIsGenerating(true);
    
    try {
      // Create the design first
      const success = createDesign(selectedGarment);
      if (!success) {
        alert('Design limit reached! Upgrade to create more designs.');
        return;
      }

      // Initialize studio with garment
      initializeFromGarment(selectedGarment, 'white');

      // Simulate AI generation delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate design elements based on mode
      if (mode === 'prompt') {
        await generateFromPrompt();
      } else if (mode === 'image') {
        await generateFromImage();
      }

      // Navigate to studio
      setActiveTab('studio');
    } catch (error) {
      console.error('Design generation failed:', error);
      alert('Failed to generate design. Please try again.');
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

  if (mode === null) {
    return (
      <div className="h-full bg-background overflow-auto">
        <div className="container mx-auto py-8 px-4 max-w-4xl">
          {onBack && (
            <Button
              onClick={onBack}
              variant="ghost"
              className="mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Hub
            </Button>
          )}

          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Brain className="w-10 h-10 text-primary" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
                AI Design Creator
              </h1>
              <Wand2 className="w-10 h-10 text-secondary" />
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Let AI create the perfect design for your apparel. Choose your approach and watch as intelligent algorithms craft professional designs tailored to your vision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50"
              onClick={() => setMode('prompt')}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
                  <Type className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Text Prompt</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-6">
                  Describe your vision and let AI create a design that matches your imagination. Perfect for bringing ideas to life.
                </p>
                <div className="space-y-2">
                  <Badge variant="outline" className="mr-2">Natural Language</Badge>
                  <Badge variant="outline" className="mr-2">Style Analysis</Badge>
                  <Badge variant="outline">Smart Layout</Badge>
                </div>
                <Button className="w-full mt-6">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create from Prompt
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-secondary/50"
              onClick={() => setMode('image')}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-secondary/10 rounded-full w-fit">
                  <Camera className="w-8 h-8 text-secondary" />
                </div>
                <CardTitle className="text-2xl">Image Analysis</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-6">
                  Upload an image and AI will analyze it to create appropriate apparel designs. Great for inspiration and adaptation.
                </p>
                <div className="space-y-2">
                  <Badge variant="outline" className="mr-2">Image Recognition</Badge>
                  <Badge variant="outline" className="mr-2">Color Extraction</Badge>
                  <Badge variant="outline">Style Adaptation</Badge>
                </div>
                <Button className="w-full mt-6" variant="secondary">
                  <FileImage className="w-4 h-4 mr-2" />
                  Upload & Analyze
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-16 text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="p-6 bg-card border border-border rounded-xl">
                <Brain className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Intelligent Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced AI analyzes your input and generates contextually appropriate designs
                </p>
              </div>
              <div className="p-6 bg-card border border-border rounded-xl">
                <Palette className="w-8 h-8 text-secondary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Smart Composition</h3>
                <p className="text-sm text-muted-foreground">
                  Automatically creates balanced layouts with proper sizing and positioning
                </p>
              </div>
              <div className="p-6 bg-card border border-border rounded-xl">
                <Shirt className="w-8 h-8 text-green-500 mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Apparel Optimized</h3>
                <p className="text-sm text-muted-foreground">
                  Designs are created specifically for apparel with print-ready specifications
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-background overflow-auto">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Button
          onClick={() => setMode(null)}
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
                {GARMENT_TYPES.slice(0, 8).map((garment) => (
                  <Button
                    key={garment.id}
                    onClick={() => setSelectedGarment(garment.id)}
                    variant={selectedGarment === garment.id ? "default" : "outline"}
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <Shirt className="w-6 h-6" />
                    <span className="text-xs capitalize">
                      {garment.name.replace('-', ' ')}
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

// This file now uses the advanced AI design generator system
// All AI analysis functions have been moved to @/lib/studio/aiDesignGenerator