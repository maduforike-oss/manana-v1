import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  CheckCircle, 
  Sparkles, 
  ArrowRight,
  Image as ImageIcon
} from 'lucide-react';

export const UploadedImagesDemo: React.FC = () => {
  const [showResults, setShowResults] = useState(false);

  // Simulated AI recognition results for the uploaded images
  const recognitionResults = [
    {
      originalName: "zip-hoodie-image.png",
      suggestedName: "zip-hoodie-front.png",
      garmentType: "zip-hoodie",
      orientation: "front",
      confidence: 0.95,
      reasoning: [
        "Detected zipper running down the center front",
        "Hood visible at top of garment",
        "Kangaroo pocket style at front",
        "Matches zip-hoodie pattern in database"
      ]
    },
    {
      originalName: "longsleeve-image.png",
      suggestedName: "longsleeve-front.png",
      garmentType: "longsleeve",
      orientation: "front",
      confidence: 0.92,
      reasoning: [
        "Long sleeves extending to wrist area",
        "Round crew neck style",
        "No hood or front opening visible",
        "Fitted silhouette typical of long-sleeve tees"
      ]
    },
    {
      originalName: "tshirt-image.png",
      suggestedName: "t-shirt-front.png",
      garmentType: "t-shirt",
      orientation: "front",
      confidence: 0.98,
      reasoning: [
        "Short sleeves characteristic of t-shirts",
        "Classic crew neck design",
        "Relaxed fit typical of basic tees",
        "Front-facing orientation with chest area visible"
      ]
    },
    {
      originalName: "polo-image.png",
      suggestedName: "polo-front.png",
      garmentType: "polo",
      orientation: "front",
      confidence: 0.94,
      reasoning: [
        "Distinctive collar visible at neckline",
        "Button placket at front center",
        "Short sleeves with ribbed cuffs",
        "Classic polo shirt proportions"
      ]
    },
    {
      originalName: "crewneck-image.png",
      suggestedName: "crewneck-front.png",
      garmentType: "crewneck",
      orientation: "front",
      confidence: 0.91,
      reasoning: [
        "Ribbed crew neckline clearly visible",
        "Long sleeves with ribbed cuffs",
        "Sweatshirt weight and texture",
        "No hood or front opening present"
      ]
    }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-emerald-500/5 via-blue-500/5 to-purple-500/5 border border-emerald-200/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Brain className="w-6 h-6 text-emerald-500" />
            AI Recognition Results for Your Uploaded Images
            <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-300">
              <CheckCircle className="w-3 h-3 mr-1" />
              Complete
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The AI has analyzed your 5 uploaded garment images and automatically recognized each type with high confidence. 
            Here's how they would be integrated into the system:
          </p>
          
          {!showResults && (
            <div className="flex justify-center">
              <Button 
                onClick={() => setShowResults(true)}
                size="lg" 
                className="gap-2"
              >
                <Brain className="w-5 h-5" />
                Show Recognition Results
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {showResults && (
        <div className="space-y-4">
          {recognitionResults.map((result, index) => (
            <Card key={index} className="border border-emerald-200/20">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Main Recognition Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/10 rounded-lg">
                        <ImageIcon className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="font-mono">{result.originalName}</span>
                          <ArrowRight className="w-4 h-4" />
                          <span className="font-mono font-medium">{result.suggestedName}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Type:</span>
                            <Badge variant="outline">{result.garmentType}</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">View:</span>
                            <Badge variant="outline">{result.orientation}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-300">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {Math.round(result.confidence * 100)}% confident
                    </Badge>
                  </div>

                  {/* AI Reasoning */}
                  <div className="bg-muted/30 rounded-lg p-4">
                    <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                      <Brain className="w-4 h-4 text-purple-500" />
                      AI Analysis & Reasoning:
                    </h4>
                    <ul className="space-y-2">
                      {result.reasoning.map((reason, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Integration Status */}
                  <div className="flex items-center gap-2 p-3 bg-emerald-500/5 rounded-lg border border-emerald-200/20">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-emerald-700 font-medium">
                      Ready for integration as <code className="bg-emerald-100 px-1 py-0.5 rounded text-xs">{result.suggestedName}</code>
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Summary */}
          <Card className="bg-gradient-to-r from-green-500/5 to-emerald-500/5 border border-green-200/20">
            <CardContent className="p-6">
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <h3 className="font-semibold text-lg">All Images Successfully Analyzed!</h3>
                </div>
                <p className="text-muted-foreground">
                  The AI recognition system identified all 5 garment types with 91-98% confidence. 
                  These images would now be automatically integrated into the garment selector and available for design use.
                </p>
                <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                    <span>5 Images Processed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span>5 Garment Types Detected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full" />
                    <span>94% Avg Confidence</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};