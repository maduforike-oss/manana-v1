import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { BrandHeader } from '@/components/ui/brand-header';
import { getProduct, type ProductWithDetails } from '@/lib/api/products';
import { ProductCardSkeleton } from '@/components/marketplace/ProductCardSkeleton';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Heart, ShoppingCart, Share2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useCartStore } from '@/store/useCartStore';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const cart = useCartStore();
  const [product, setProduct] = useState<ProductWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      try {
        const result = await getProduct(id);
        setProduct(result);
        if (result?.variants && result.variants.length > 0) {
          setSelectedVariant(result.variants[0]);
        }
      } catch (error) {
        console.error('Error loading product:', error);
        toast({
          title: "Error",
          description: "Failed to load product",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, toast]);

  const handleAddToCart = () => {
    if (!product) return;
    
    cart.addItem({
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      image: product.images?.[0]?.url || "/api/placeholder/300/400",
      price: selectedVariant?.price || product.base_price,
    });
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  const handleShare = async () => {
    if (!product) return;
    
    const url = `${window.location.origin}/product/${product.slug || product.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out this product: ${product.name}`,
          url,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(url);
      toast({
        title: "Link copied",
        description: "Product link copied to clipboard",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <BrandHeader title="Loading..." />
        <div className="container mx-auto px-4 py-6">
          <ProductCardSkeleton viewMode="list" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <BrandHeader title="Product Not Found" />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-xl mb-6">Product not found.</p>
          <Button 
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate('/');
              }
            }} 
            className="min-h-[44px] min-w-[44px]"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <BrandHeader title={product.name}>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              navigate('/');
            }
          }} 
          className="min-h-[44px] min-w-[44px]"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </BrandHeader>
      
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0].url}
                  alt={product.images[0].alt_text || product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📦</div>
                    <div>No image available</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {product.category && (
                  <Badge variant="secondary">{product.category.name}</Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
              <div className="text-3xl font-bold text-primary mb-4">
                ${selectedVariant?.price?.toFixed(2) || product.base_price.toFixed(2)}
              </div>
            </div>

            {product.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Variants Display */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Available Options</h3>
                <div className="grid grid-cols-2 gap-2">
                  {product.variants.map((variant) => (
                    <Button
                      key={variant.id}
                      variant={selectedVariant?.id === variant.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedVariant(variant)}
                      className="h-auto p-3 justify-start"
                    >
                      <div className="text-left">
                        <div className="font-medium">{variant.color} - {variant.size}</div>
                        <div className="text-sm opacity-75">${variant.price.toFixed(2)}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={handleAddToCart} 
                className="w-full h-12 text-lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              
              <div className="flex space-x-3">
                <Button variant="outline" className="flex-1 h-12">
                  <Heart className="w-5 h-5 mr-2" />
                  Save
                </Button>
                <Button variant="outline" onClick={handleShare} className="flex-1 h-12">
                  <Share2 className="w-5 h-5 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}