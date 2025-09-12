import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingCart, Share2, Star, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { BreadcrumbNavigation } from '@/components/marketplace/BreadcrumbNavigation';
import { useProductRouter } from '@/hooks/useProductRouter';
import { generateStudioMarketData, StudioGarmentData } from '@/lib/studio/marketData';
import { cn } from '@/lib/utils';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { navigateBack } = useProductRouter();
  const [product, setProduct] = useState<StudioGarmentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (!id) return;

    // Simulate API call
    const timer = setTimeout(() => {
      const allProducts = generateStudioMarketData();
      const foundProduct = allProducts.find(p => p.id === id);
      setProduct(foundProduct || null);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [id]);

  const breadcrumbItems = [
    { label: 'Marketplace', onClick: navigateBack },
    { label: product?.name || 'Product', isActive: true }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-6 space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-4 w-48" />
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Skeleton className="aspect-square w-full" />
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="w-20 h-20" />
                ))}
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-destructive mb-2">Product Not Found</h1>
            <p className="text-muted-foreground mb-4">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={navigateBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Marketplace
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const images = [
    product.thumbSrc,
    product.thumbSrc, // In real app, these would be different variants
    product.thumbSrc,
    product.thumbSrc,
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={navigateBack}
              className="min-h-[44px] min-w-[44px]"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <BreadcrumbNavigation items={breadcrumbItems} />
          </div>
        </div>

        {/* Product Content */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <div className="aspect-square">
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </Card>
            
            <div className="flex gap-2 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={cn(
                    "flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all min-h-[44px] min-w-[44px]",
                    selectedImage === index 
                      ? "border-primary ring-2 ring-primary/20" 
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <img
                    src={image}
                    alt={`${product.name} variant ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold">{product.name}</h1>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {product.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-muted-foreground">by {product.creator}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">${product.price}</p>
                  {product.featured && (
                    <Badge className="mt-2">Featured</Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{product.rating.toFixed(1)} rating</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{product.views.toLocaleString()} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  <span>{product.likes.toLocaleString()} likes</span>
                </div>
                <div className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  <span>{product.downloads.toLocaleString()} downloads</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <div className="flex gap-3">
                <Button className="flex-1 h-12 text-base">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart - ${product.price}
                </Button>
                <Button variant="outline" size="icon" className="h-12 w-12 min-h-[44px] min-w-[44px]">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" className="h-12 w-12 min-h-[44px] min-w-[44px]">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
              
              <Button variant="outline" className="w-full h-12 text-base">
                Customize in Studio
              </Button>
            </div>

            {/* Product Details */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold">Product Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Type</p>
                    <p className="font-medium capitalize">{product.garmentId}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Color</p>
                    <p className="font-medium capitalize">{product.baseColor}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Print Area</p>
                    <p className="font-medium">{product.printArea.width}" × {product.printArea.height}"</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Resolution</p>
                    <p className="font-medium">{product.dpi} DPI</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Info */}
            <Card>
              <CardContent className="p-6 space-y-2">
                <h3 className="font-semibold">Shipping</h3>
                <p className="text-sm text-muted-foreground">
                  Estimated delivery: {product.shippingDays} business days
                </p>
                <p className="text-sm text-muted-foreground">
                  Free shipping on orders over $50
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}