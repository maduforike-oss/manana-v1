import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Palette, Download, Star } from 'lucide-react';
import { useUnlockedDesigns } from '@/hooks/useUnlockedDesigns';
import { useToast } from '@/hooks/use-toast';

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { unlockDesign } = useUnlockedDesigns();
  
  const designId = searchParams.get('design');

  useEffect(() => {
    if (designId) {
      // Unlock the design
      unlockDesign(designId);
      
      toast({
        title: "Design Unlocked!",
        description: "You can now customize this design in Studio.",
      });
    }
  }, [designId, unlockDesign, toast]);

  const handleOpenStudio = () => {
    if (designId) {
      // Navigate to studio with the unlocked design
      navigate(`/studio?design=${designId}`);
    }
  };

  const handleBackToMarket = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            <p className="text-muted-foreground">
              Your design has been unlocked and is ready for customization.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-medium mb-3">What's Next?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex flex-col items-center gap-2">
                  <Palette className="w-6 h-6 text-primary" />
                  <span className="font-medium">Customize</span>
                  <span className="text-muted-foreground text-xs">Edit colors, text, and elements</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Download className="w-6 h-6 text-primary" />
                  <span className="font-medium">Export</span>
                  <span className="text-muted-foreground text-xs">High-resolution downloads</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Star className="w-6 h-6 text-primary" />
                  <span className="font-medium">Commercial Use</span>
                  <span className="text-muted-foreground text-xs">Full licensing rights</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleOpenStudio} className="flex-1">
                <Palette className="w-4 h-4 mr-2" />
                Customize in Studio
              </Button>
              <Button variant="outline" onClick={handleBackToMarket} className="flex-1">
                Back to Market
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground">
              <p>Order confirmation sent to your email.</p>
              <p>Need help? Contact support or check our tutorials.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}