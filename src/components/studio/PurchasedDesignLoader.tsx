import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, Shirt, Palette, Layers, Zap } from 'lucide-react';

export const PurchasedDesignLoader = () => {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
      <Card className="w-96 glass-effect border-border/20 rounded-3xl overflow-hidden">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Animated Icon */}
            <div className="relative">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <Shirt className="w-10 h-10 text-primary animate-pulse" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center animate-spin">
                <Loader2 className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Loading Your Design
              </h2>
              <p className="text-muted-foreground">
                Preparing full studio with professional tools
              </p>
            </div>

            {/* Progress */}
            <div className="space-y-3">
              <Progress 
                value={progress} 
                className="h-2 bg-muted/50"
              />
              <p className="text-sm text-muted-foreground">
                {Math.round(progress)}% complete
              </p>
            </div>

            {/* Feature List */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <Palette className="w-3 h-3 text-primary" />
                </div>
                <span className="text-muted-foreground">Full Toolset</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="p-1.5 bg-secondary/10 rounded-lg">
                  <Layers className="w-3 h-3 text-secondary" />
                </div>
                <span className="text-muted-foreground">Layer Control</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="p-1.5 bg-green-500/10 rounded-lg">
                  <Zap className="w-3 h-3 text-green-500" />
                </div>
                <span className="text-muted-foreground">Auto-Save</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="p-1.5 bg-purple-500/10 rounded-lg">
                  <Shirt className="w-3 h-3 text-purple-500" />
                </div>
                <span className="text-muted-foreground">Print Rules</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};