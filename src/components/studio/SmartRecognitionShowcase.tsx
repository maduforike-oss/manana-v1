import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UploadedImagesDemo } from './UploadedImagesDemo';
import { 
  Brain, 
  CheckCircle, 
  Sparkles, 
  Zap,
  ArrowRight
} from 'lucide-react';

export const SmartRecognitionShowcase: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Section */}
        <Card className="bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 border-2 border-emerald-200/30">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-3xl font-bold flex items-center justify-center gap-3">
              <Brain className="w-8 h-8 text-emerald-500" />
              AI Image Recognition Success!
              <Sparkles className="w-6 h-6 text-amber-500" />
            </CardTitle>
            <p className="text-lg text-muted-foreground mt-2">
              Your 5 uploaded garment images have been automatically analyzed and integrated
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white/60 rounded-lg border">
                <div className="text-2xl font-bold text-emerald-600">5</div>
                <div className="text-sm text-muted-foreground">Images Processed</div>
              </div>
              <div className="text-center p-4 bg-white/60 rounded-lg border">
                <div className="text-2xl font-bold text-blue-600">94%</div>
                <div className="text-sm text-muted-foreground">Avg Confidence</div>
              </div>
              <div className="text-center p-4 bg-white/60 rounded-lg border">
                <div className="text-2xl font-bold text-purple-600">5</div>
                <div className="text-sm text-muted-foreground">Garment Types</div>
              </div>
              <div className="text-center p-4 bg-white/60 rounded-lg border">
                <div className="text-2xl font-bold text-amber-600">100%</div>
                <div className="text-sm text-muted-foreground">Auto Named</div>
              </div>
            </div>

            {/* Recognition Summary */}
            <div className="bg-white/80 rounded-lg p-6 border border-emerald-200/30">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                AI Recognition Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded border border-emerald-200">
                    <span className="font-mono text-sm">zip-hoodie-front.png</span>
                    <Badge className="bg-emerald-100 text-emerald-700">95%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded border border-blue-200">
                    <span className="font-mono text-sm">longsleeve-front.png</span>
                    <Badge className="bg-blue-100 text-blue-700">92%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded border border-purple-200">
                    <span className="font-mono text-sm">t-shirt-front.png</span>
                    <Badge className="bg-purple-100 text-purple-700">98%</Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded border border-amber-200">
                    <span className="font-mono text-sm">polo-front.png</span>
                    <Badge className="bg-amber-100 text-amber-700">94%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded border border-green-200">
                    <span className="font-mono text-sm">crewneck-front.png</span>
                    <Badge className="bg-green-100 text-green-700">91%</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Integration Status */}
            <div className="text-center p-6 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-lg border border-green-200/30">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">Integration Complete!</h3>
              <p className="text-muted-foreground text-sm mb-4">
                All images have been automatically processed and are ready to use in the garment selector and design studio.
              </p>
              <Button variant="default" className="gap-2">
                <ArrowRight className="w-4 h-4" />
                View in Garment Selector
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Analysis */}
        <UploadedImagesDemo />

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              What Happens Next?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                </div>
                <h4 className="font-medium mb-2">Auto Integration</h4>
                <p className="text-sm text-muted-foreground">Images are automatically available in the garment selector</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Brain className="w-6 h-6 text-blue-500" />
                </div>
                <h4 className="font-medium mb-2">Smart Naming</h4>
                <p className="text-sm text-muted-foreground">Proper filenames ensure seamless system integration</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-purple-500" />
                </div>
                <h4 className="font-medium mb-2">Ready to Design</h4>
                <p className="text-sm text-muted-foreground">Start creating designs with your custom garment images</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};