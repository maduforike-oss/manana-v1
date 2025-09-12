import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { BrandHeader } from '@/components/ui/brand-header';
import { Heart, ShoppingCart, Share2, Star, ChevronLeft, Truck, Shield, RotateCcw } from 'lucide-react';
import { Product, getProduct, trackProductAnalytics } from '@/lib/products';
import { addToCart, getProductVariants, ProductVariant } from '@/lib/cart';
import { toggleWishlist, isInWishlist } from '@/lib/wishlist';
import { trackProductView } from '@/lib/recentlyViewed';
import { getProductReviews, getReviewSummary, ProductReview, ReviewSummary } from '@/lib/reviews';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isInWishlistState, setIsInWishlistState] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      loadProductData();
    }
  }, [id]);

  useEffect(() => {
    if (variants.length > 0 && selectedSize && selectedColor) {
      const variant = variants.find(v => v.size === selectedSize && v.color === selectedColor);
      setSelectedVariant(variant || null);
    }
  }, [variants, selectedSize, selectedColor]);

  const loadProductData = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      // Load product data
      const productData = await getProduct(id);
      if (!productData) {
        toast({
          title: "Product not found",
          description: "The product you're looking for doesn't exist.",
          variant: "destructive"
        });
        return;
      }

      setProduct(productData);

      // Load variants
      const variantsData = await getProductVariants(productData.id);
      setVariants(variantsData);

      // Set default selections
      if (variantsData.length > 0) {
        const availableColors = [...new Set(variantsData.map(v => v.color))];
        const availableSizes = [...new Set(variantsData.map(v => v.size))];
        setSelectedColor(availableColors[0]);
        setSelectedSize(availableSizes[0]);
      }

      // Load reviews
      const reviewsData = await getProductReviews(productData.id);
      setReviews(reviewsData);

      // Load review summary
      const summaryData = await getReviewSummary(productData.id);
      setReviewSummary(summaryData);

      // Check wishlist status
      const wishlistStatus = await isInWishlist(productData.id);
      setIsInWishlistState(wishlistStatus);

      // Track product view
      await trackProductView(productData.id);
      await trackProductAnalytics(productData.id, 'view');
    } catch (error) {
      console.error('Error loading product:', error);
      toast({
        title: "Error",
        description: "Failed to load product data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast({
        title: "Please select options",
        description: "Please select size and color before adding to cart.",
        variant: "destructive"
      });
      return;
    }

    if (selectedVariant.stock_quantity < quantity) {
      toast({
        title: "Insufficient stock",
        description: `Only ${selectedVariant.stock_quantity} items available.`,
        variant: "destructive"
      });
      return;
    }

    const success = await addToCart(selectedVariant.id, quantity);
    if (success) {
      toast({
        title: "Added to cart",
        description: `${quantity} ${quantity === 1 ? 'item' : 'items'} added to your cart.`
      });
      
      if (product) {
        await trackProductAnalytics(product.id, 'click');
      }
    } else {
      toast({
        title: "Error",
        description: "Failed to add item to cart.",
        variant: "destructive"
      });
    }
  };

  const handleWishlistToggle = async () => {
    if (!product) return;

    const success = await toggleWishlist(product.id);
    if (success) {
      setIsInWishlistState(!isInWishlistState);
      toast({
        title: isInWishlistState ? "Removed from wishlist" : "Added to wishlist",
        description: isInWishlistState ? "Item removed from your wishlist." : "Item added to your wishlist."
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update wishlist.",
        variant: "destructive"
      });
    }
  };

  const availableColors = variants.length > 0 ? [...new Set(variants.map(v => v.color))] : [];
  const availableSizes = variants.length > 0 ? [...new Set(variants.map(v => v.size))] : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <BrandHeader title="Product Details" />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="aspect-square bg-muted animate-pulse rounded-lg" />
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="h-8 bg-muted animate-pulse rounded" />
              <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-16 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <BrandHeader title="Product Not Found" />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist.</p>
          <Link to="/market">
            <Button>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Market
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <BrandHeader title={product.name} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
          <Link to="/market" className="hover:text-foreground">Market</Link>
          <span>/</span>
          <Link to={`/market?category=${product.category?.slug}`} className="hover:text-foreground">
            {product.category?.name}
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[selectedImageIndex]?.url}
                  alt={product.images[selectedImageIndex]?.alt_text || product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No image available
                </div>
              )}
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      selectedImageIndex === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.alt_text || `${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                {reviewSummary && reviewSummary.total_reviews > 0 && (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.round(reviewSummary.average_rating)
                              ? 'text-yellow-500 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({reviewSummary.total_reviews} reviews)
                    </span>
                  </div>
                )}
                <Badge variant="secondary">{product.category?.name}</Badge>
              </div>
              <p className="text-2xl font-bold text-primary">
                ${selectedVariant ? selectedVariant.price.toFixed(2) : product.base_price.toFixed(2)}
              </p>
            </div>

            {product.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{product.description}</p>
              </div>
            )}

            {/* Color Selection */}
            {availableColors.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Color</h3>
                <div className="flex space-x-2">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-md border ${
                        selectedColor === color
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-input hover:border-primary'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {availableSizes.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Size</h3>
                <div className="flex space-x-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-md border min-w-[3rem] ${
                        selectedSize === size
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-input hover:border-primary'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="font-semibold mb-3">Quantity</h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-input rounded-md flex items-center justify-center hover:border-primary"
                >
                  -
                </button>
                <span className="w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border border-input rounded-md flex items-center justify-center hover:border-primary"
                  disabled={selectedVariant && quantity >= selectedVariant.stock_quantity}
                >
                  +
                </button>
              </div>
              {selectedVariant && (
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedVariant.stock_quantity} items available
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={handleAddToCart} 
                className="w-full"
                disabled={!selectedVariant || selectedVariant.stock_quantity === 0}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {selectedVariant?.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              
              <div className="flex space-x-3">
                <Button variant="outline" onClick={handleWishlistToggle} className="flex-1">
                  <Heart className={`w-4 h-4 mr-2 ${isInWishlistState ? 'fill-current text-red-500' : ''}`} />
                  {isInWishlistState ? 'Remove from Wishlist' : 'Add to Wishlist'}
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Product Features */}
            <div className="grid grid-cols-1 gap-4 pt-6 border-t">
              <div className="flex items-center space-x-3">
                <Truck className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">Free shipping on orders over $50</span>
              </div>
              <div className="flex items-center space-x-3">
                <RotateCcw className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">30-day return policy</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">1-year warranty</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <div className="mt-16">
            <Separator className="mb-8" />
            <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
            
            {reviewSummary && (
              <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex items-center space-x-4">
                  <div className="text-4xl font-bold">{reviewSummary.average_rating.toFixed(1)}</div>
                  <div>
                    <div className="flex items-center mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.round(reviewSummary.average_rating)
                              ? 'text-yellow-500 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Based on {reviewSummary.total_reviews} reviews
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center space-x-2">
                      <span className="text-sm w-2">{rating}</span>
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{
                            width: `${(reviewSummary.rating_distribution[rating as keyof typeof reviewSummary.rating_distribution] / reviewSummary.total_reviews) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-8">
                        {reviewSummary.rating_distribution[rating as keyof typeof reviewSummary.rating_distribution]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-6">
              {reviews.slice(0, 5).map((review) => (
                <Card key={review.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold">{review.user_name}</span>
                          {review.verified_purchase && (
                            <Badge variant="secondary" className="text-xs">Verified Purchase</Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {review.title && <h4 className="font-medium mb-2">{review.title}</h4>}
                    {review.comment && <p className="text-muted-foreground">{review.comment}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}