import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Zap, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StudioGarmentData } from '@/lib/studio/marketData';

interface PurchaseGateModalProps {
  design: StudioGarmentData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PurchaseGateModal({ design, open, onOpenChange }: PurchaseGateModalProps) {
  const navigate = useNavigate();

  if (!design) return null;

  const handleAddToCart = () => {
    // Mock add to cart - could integrate with actual cart system
    console.log('Added to cart:', design.id);
    onOpenChange(false);
    // Could show toast notification here
  };

  const handleBuyNow = () => {
    // Navigate to mock checkout with design ID
    navigate(`/checkout?design=${design.id}&price=${design.price}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Purchase Required
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <img 
              src={design.thumbSrc} 
              alt={design.name}
              className="w-full h-48 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <Lock className="w-12 h-12 text-white/80" />
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg">{design.name}</h3>
            <p className="text-muted-foreground">by {design.creator}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-2xl font-bold text-primary">${design.price}</span>
              {design.tags && design.tags.slice(0, 2).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-3">
              Purchase this design to unlock customization in Studio. You'll be able to:
            </p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Edit text and colors</li>
              <li>• Add your own elements</li>
              <li>• Export high-resolution files</li>
              <li>• Use for commercial purposes</li>
            </ul>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleAddToCart} className="flex-1">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
            <Button onClick={handleBuyNow} className="flex-1">
              <Zap className="w-4 h-4 mr-2" />
              Buy Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}