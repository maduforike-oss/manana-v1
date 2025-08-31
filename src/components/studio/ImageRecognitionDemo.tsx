import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { SmartImageUploadDialog } from './SmartImageUploadDialog';
import { 
  Brain, 
  Sparkles, 
  Eye, 
  FileText, 
  Zap, 
  CheckCircle,
  Upload,
  ArrowRight
} from 'lucide-react';

export const ImageRecognitionDemo: React.FC = () => {
  const [demoResults, setDemoResults] = useState<any[]>([]);

  const handleDemoUpload = (results: { original: string; suggested: string; recognition: any }[]) => {
    setDemoResults(results);
  };

  const demoFeatures = [
    {
      icon: <Brain className="w-5 h-5 text-purple-500" />,
      title: "Smart Garment Detection",
      description: "AI analyzes image content to identify garment types (t-shirt, hoodie, polo, etc.)",
      color: "purple"
    },
    {
      icon: <Eye className="w-5 h-5 text-emerald-500" />,
      title: "Orientation Recognition", 
      description: "Automatically determines if image shows front, back, or side view",
      color: "emerald"
    },
    {
      icon: <FileText className="w-5 h-5 text-blue-500" />,
      title: "Auto Filename Generation",
      description: "Creates proper filenames following garment-orientation.ext convention",
      color: "blue"
    },
    {
      icon: <Zap className="w-5 h-5 text-amber-500" />,
      title: "Instant Integration",
      description: "Seamlessly integrates recognized images into the garment system",
      color: "amber"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-500/5 via-emerald-500/5 to-blue-500/5 border border-purple-200/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Brain className="w-6 h-6 text-purple-500" />
            Automated Image Recognition System
            <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-300">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Simply upload any garment image and our AI will automatically recognize the type, orientation, 
            and generate the perfect filename for seamless integration.
          </p>
          
          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {demoFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-card/50 rounded-lg border">
                <div className={`p-2 rounded-lg bg-${feature.color}-500/10`}>
                  {feature.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm">{feature.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Demo Upload Button */}
          <div className="flex justify-center">
            <SmartImageUploadDialog
              onUploadComplete={handleDemoUpload}
              trigger={
                <Button size="lg" className="gap-2">
                  <Brain className="w-5 h-5" />
                  Try Smart Recognition
                  <ArrowRight className="w-4 h-4" />
                </Button>
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Demo Results */}
      {demoResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Recognition Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {demoResults.map((result, index) => (
                <div key={index} className="p-4 bg-card border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      <span className="font-mono text-sm">{result.original}</span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      <span className="font-mono text-sm font-medium">{result.suggested}</span>
                    </div>
                    <Badge className="bg-green-500/10 text-green-700 border-green-300">
                      {Math.round(result.recognition.confidence * 100)}% confident
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Type:</span>
                      <Badge variant="outline">{result.recognition.garmentType}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">View:</span>
                      <Badge variant="outline">{result.recognition.orientation}</Badge>
                    </div>
                    {result.recognition.detectedColor && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Color:</span>
                        <Badge variant="outline">{result.recognition.detectedColor}</Badge>
                      </div>
                    )}
                  </div>

                  {result.recognition.reasoning && (
                    <div className="bg-muted/30 rounded p-3">
                      <p className="text-xs font-medium mb-2">AI Reasoning:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {result.recognition.reasoning.map((reason: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-emerald-500 mt-0.5">•</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6 text-purple-500" />
              </div>
              <h4 className="font-medium text-sm">1. Upload Image</h4>
              <p className="text-xs text-muted-foreground">Drag & drop any garment image</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                <Brain className="w-6 h-6 text-emerald-500" />
              </div>
              <h4 className="font-medium text-sm">2. AI Analysis</h4>
              <p className="text-xs text-muted-foreground">Computer vision recognizes garment</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6 text-blue-500" />
              </div>
              <h4 className="font-medium text-sm">3. Auto Naming</h4>
              <p className="text-xs text-muted-foreground">Generates proper filename</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6 text-amber-500" />
              </div>
              <h4 className="font-medium text-sm">4. Integration</h4>
              <p className="text-xs text-muted-foreground">Ready to use in garment selector</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};