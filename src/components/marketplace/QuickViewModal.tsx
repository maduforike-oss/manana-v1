import React, { useState } from 'react';
import { X, Heart, Star, Truck, Info, Palette, Eye, Download, Share2, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { StudioGarmentData } from '@/lib/studio/marketData';

interface QuickViewModalProps {
  design: StudioGarmentData | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenInStudio: (design: StudioGarmentData) => void;
  onSave: (designId: string) => void;
  isSaved: boolean;
  isUnlocked: boolean;
}

export const QuickViewModal = ({ 
  design, 
  isOpen, 
  onClose, 
  onOpenInStudio, 
  onSave, 
  isSaved,
  isUnlocked
}: QuickViewModalProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColorVariant, setSelectedColorVariant] = useState(0);

  if (!design) return null;

  // Mock additional images for the gallery
  const additionalImages = [
    design.thumbSrc,
    design.thumbSrc, // In a real app, these would be different angles/colors
    design.thumbSrc,
    design.thumbSrc
  ];

  const colorVariants = [
    { name: 'Original', color: design.baseColor, price: design.price },
    { name: 'Black', color: '#000000', price: design.price },
    { name: 'White', color: '#FFFFFF', price: design.price + 2 },
    { name: 'Navy', color: '#1E3A8A', price: design.price + 1 }
  ];

  // Mock reviews data
  const reviews = [
    { id: 1, user: 'Sarah M.', rating: 5, comment: 'Amazing quality! The design looks exactly as shown.', date: '2 days ago' },
    { id: 2, user: 'Mike R.', rating: 4, comment: 'Great fit and the print quality is excellent.', date: '1 week ago' },
    { id: 3, user: 'Emma L.', rating: 5, comment: 'Love this design! Got so many compliments.', date: '2 weeks ago' }
  ];

  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-full h-[90vh] p-0 overflow-hidden">
        <DialogTitle className="sr-only">Product Details - {design.name}</DialogTitle>
        
        <div className="flex h-full">
          {/* Left Side - Images */}
          <div className="flex-1 bg-muted/20 relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white rounded-full h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Main Image */}
            <div className="h-2/3 relative overflow-hidden">
              <img 
                src={additionalImages[selectedImageIndex]} 
                alt={design.name}
                className="w-full h-full object-cover"
              />
              
              {/* Image Navigation */}
              {additionalImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedImageIndex(prev => prev > 0 ? prev - 1 : additionalImages.length - 1)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedImageIndex(prev => prev < additionalImages.length - 1 ? prev + 1 : 0)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            <div className="h-1/3 p-4 flex gap-2 overflow-x-auto">
              {additionalImages.map((img, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={cn(
                    "flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 cursor-pointer transition-all duration-200",
                    selectedImageIndex === index ? "border-primary" : "border-transparent hover:border-border"
                  )}
                >
                  <img src={img} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Details */}
          <div className="w-1/2 flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-foreground mb-2">{design.name}</h1>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {design.creator.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-foreground">{design.creator}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{averageRating.toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground">({reviews.length} reviews)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-bold text-primary">
                      ${colorVariants[selectedColorVariant].price}
                    </span>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      <span>{design.views.toLocaleString()} views</span>
                    </div>
                  </div>
                </div>

                {/* Color Variants */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Available Colors</h3>
                  <div className="flex gap-2">
                    {colorVariants.map((variant, index) => (
                      <div
                        key={index}
                        onClick={() => setSelectedColorVariant(index)}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all duration-200",
                          selectedColorVariant === index 
                            ? "border-primary bg-primary/10" 
                            : "border-border/30 hover:border-primary/30"
                        )}
                      >
                        <div 
                          className="w-6 h-6 rounded-full border border-border/50"
                          style={{ backgroundColor: variant.color }}
                        />
                        <span className="text-sm font-medium">{variant.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Details Tabs */}
                <Tabs defaultValue="details" className="mb-6">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="sizing">Sizing</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Palette className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">Material</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{design.fabric}</span>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Info className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">Print Area</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {design.printArea.width} x {design.printArea.height}mm
                          </span>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {design.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="sizing">
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold">Size Guide</h4>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div className="font-medium p-2 bg-muted rounded">Size</div>
                        <div className="font-medium p-2 bg-muted rounded">Chest</div>
                        <div className="font-medium p-2 bg-muted rounded">Length</div>
                        <div className="font-medium p-2 bg-muted rounded">Sleeve</div>
                        
                        {['S', 'M', 'L', 'XL'].map((size) => (
                          <React.Fragment key={size}>
                            <div className="p-2 border rounded">{size}</div>
                            <div className="p-2 border rounded">{18 + ['S', 'M', 'L', 'XL'].indexOf(size) * 2}"</div>
                            <div className="p-2 border rounded">{26 + ['S', 'M', 'L', 'XL'].indexOf(size) * 1}"</div>
                            <div className="p-2 border rounded">{8 + ['S', 'M', 'L', 'XL'].indexOf(size) * 0.5}"</div>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="reviews">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
                        <div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={cn("h-4 w-4", i < Math.floor(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")} 
                              />
                            ))}
                          </div>
                          <div className="text-sm text-muted-foreground">{reviews.length} reviews</div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <div key={review.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{review.user}</span>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={cn("h-3 w-3", i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")} 
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-muted-foreground">{review.date}</span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Delivery Info */}
                <Card className="mb-6">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Delivery</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Estimated delivery in {design.shippingDays || '3-5'} business days
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-border/30 bg-muted/10">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => onSave(design.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl",
                    isSaved ? "bg-primary/10 border-primary text-primary" : ""
                  )}
                >
                  <Heart className={cn("h-4 w-4", isSaved ? "fill-current" : "")} />
                  {isSaved ? 'Saved' : 'Save'}
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 rounded-xl"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
                <Button
                  onClick={() => onOpenInStudio(design)}
                  className="flex-1 bg-primary hover:bg-primary/90 rounded-xl"
                >
                  {isUnlocked ? (
                    <>
                      <Palette className="h-4 w-4 mr-2" />
                      Customize in Studio
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Purchase to Customize
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};