import React, { useState } from 'react';
import { X, Heart, Star, Truck, ShoppingCart, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ProductWithDetails } from '@/lib/api/products';

interface ProductQuickViewModalProps {
  product: ProductWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: ProductWithDetails, variant?: any) => void;
  onSave: (productId: string) => void;
  onShare: (product: ProductWithDetails) => void;
  isSaved: boolean;
}

export const ProductQuickViewModal = ({ 
  product, 
  isOpen, 
  onClose, 
  onAddToCart,
  onSave, 
  onShare,
  isSaved
}: ProductQuickViewModalProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string>('');

  if (!product) return null;

  // Get images or fallback
  const images = product.images?.length ? product.images : [
    { id: '1', url: '/api/placeholder/600/800', display_order: 0, alt_text: product.name }
  ];

  const sortedImages = images.sort((a, b) => a.display_order - b.display_order);

  // Get variants or create default
  const variants = product.variants?.length ? product.variants : [
    { id: '1', size: 'M', color: 'Default', price: product.base_price, stock_quantity: 10 }
  ];

  const selectedVariantData = variants.find(v => v.id === selectedVariant) || variants[0];

  // Mock reviews data
  const reviews = [
    { id: 1, user: 'Sarah M.', rating: 5, comment: 'Great quality product!', date: '2 days ago' },
    { id: 2, user: 'Mike R.', rating: 4, comment: 'Good value for money.', date: '1 week ago' },
    { id: 3, user: 'Emma L.', rating: 5, comment: 'Exceeded my expectations.', date: '2 weeks ago' }
  ];

  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

  const handleAddToCart = () => {
    onAddToCart(product, selectedVariantData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-full h-[90vh] p-0 overflow-hidden">
        <DialogTitle className="sr-only">Product Details - {product.name}</DialogTitle>
        
        <div className="flex h-full">
          {/* Left Side - Images */}
          <div className="flex-1 bg-muted/20 relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white rounded-full h-8 w-8 p-0"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Main Image */}
            <div className="h-2/3 relative overflow-hidden">
              <img 
                src={sortedImages[selectedImageIndex]?.url} 
                alt={sortedImages[selectedImageIndex]?.alt_text || product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Image Navigation */}
              {sortedImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedImageIndex(prev => prev > 0 ? prev - 1 : sortedImages.length - 1)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full h-8 w-8 p-0"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedImageIndex(prev => prev < sortedImages.length - 1 ? prev + 1 : 0)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full h-8 w-8 p-0"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            <div className="h-1/3 p-4 flex gap-2 overflow-x-auto">
              {sortedImages.map((img, index) => (
                <div
                  key={img.id}
                  onClick={() => setSelectedImageIndex(index)}
                  className={cn(
                    "flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 cursor-pointer transition-all duration-200",
                    selectedImageIndex === index ? "border-primary" : "border-transparent hover:border-border"
                  )}
                >
                  <img src={img.url} alt={img.alt_text || `View ${index + 1}`} className="w-full h-full object-cover" />
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
                  <h1 className="text-2xl font-bold text-foreground mb-2">{product.name}</h1>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          S
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-foreground">Store</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{averageRating.toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground">({reviews.length} reviews)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-bold text-primary">
                      ${selectedVariantData?.price || product.base_price}
                    </span>
                    {product.category && (
                      <Badge variant="outline">{product.category.name}</Badge>
                    )}
                  </div>
                </div>

                {/* Variants Selection */}
                {variants.length > 1 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Select Option</h3>
                    <Select value={selectedVariant} onValueChange={setSelectedVariant}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose size and color" />
                      </SelectTrigger>
                      <SelectContent>
                        {variants.map((variant) => (
                          <SelectItem key={variant.id} value={variant.id}>
                            {variant.color} - {variant.size} (${variant.price})
                            {variant.stock_quantity === 0 && ' - Out of Stock'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-foreground mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {product.description || 'No description available.'}
                  </p>
                </div>

                {/* Details Tabs */}
                <Tabs defaultValue="details" className="mb-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details" className="space-y-4">
                    <div className="space-y-3">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Status</span>
                            <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                              {product.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {selectedVariantData && (
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Stock</span>
                              <span className="text-sm text-muted-foreground">
                                {selectedVariantData.stock_quantity} available
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      )}
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
                      Estimated delivery in 3-5 business days
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
                  onClick={() => onSave(product.id)}
                  aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
                  aria-pressed={isSaved}
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
                  onClick={() => onShare(product)}
                  className="flex items-center gap-2 rounded-xl"
                  aria-label="Share product"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
                <Button
                  onClick={handleAddToCart}
                  disabled={selectedVariantData?.stock_quantity === 0}
                  className="flex-1 bg-primary hover:bg-primary/90 rounded-xl"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {selectedVariantData?.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};