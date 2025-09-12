import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { getCart, updateCartItemQuantity, removeFromCart, type Cart, type CartItem } from '@/lib/cart';
import { BrandHeader } from '@/components/ui/brand-header';
import { useToast } from '@/hooks/use-toast';
import { ProductCardSkeleton } from '@/components/marketplace/ProductCardSkeleton';

export function CartPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    setIsLoading(true);
    try {
      const cartData = await getCart();
      setCart(cartData);
    } catch (error) {
      console.error('Error loading cart:', error);
      toast({
        title: "Error",
        description: "Failed to load cart",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdatingItems(prev => new Set(prev).add(itemId));
    
    try {
      const success = await updateCartItemQuantity(itemId, newQuantity);
      if (success) {
        await loadCart();
        toast({
          title: "Updated",
          description: "Cart updated successfully"
        });
      } else {
        throw new Error('Failed to update quantity');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive"
      });
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setUpdatingItems(prev => new Set(prev).add(itemId));
    
    try {
      const success = await removeFromCart(itemId);
      if (success) {
        await loadCart();
        toast({
          title: "Removed",
          description: "Item removed from cart"
        });
      } else {
        throw new Error('Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive"
      });
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleBulkRemove = async () => {
    if (selectedItems.size === 0) return;

    const itemsToRemove = Array.from(selectedItems);
    setUpdatingItems(new Set(itemsToRemove));

    try {
      const promises = itemsToRemove.map(itemId => removeFromCart(itemId));
      await Promise.all(promises);
      await loadCart();
      setSelectedItems(new Set());
      toast({
        title: "Removed",
        description: `${itemsToRemove.length} items removed from cart`
      });
    } catch (error) {
      console.error('Error removing items:', error);
      toast({
        title: "Error",
        description: "Failed to remove items",
        variant: "destructive"
      });
    } finally {
      setUpdatingItems(new Set());
    }
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const selectAllItems = () => {
    if (selectedItems.size === cart?.items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cart?.items.map(item => item.id) || []));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <BrandHeader title="Shopping Cart" />
        <div className="container mx-auto px-4 py-6 space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <ProductCardSkeleton key={i} viewMode="list" />
          ))}
        </div>
      </div>
    );
  }

  const isEmpty = !cart?.items?.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <BrandHeader title="Shopping Cart">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="min-h-[44px] min-w-[44px]"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </BrandHeader>

      <div className="container mx-auto px-4 py-6">
        {isEmpty ? (
          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Start shopping to add items to your cart
            </p>
            <Button onClick={() => navigate('/')}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {/* Bulk Actions */}
              {cart.items.length > 1 && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={selectAllItems}
                          className="min-h-[44px]"
                        >
                          {selectedItems.size === cart.items.length ? 'Deselect All' : 'Select All'}
                        </Button>
                        {selectedItems.size > 0 && (
                          <Badge variant="secondary">
                            {selectedItems.size} selected
                          </Badge>
                        )}
                      </div>
                      {selectedItems.size > 0 && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleBulkRemove}
                          className="min-h-[44px]"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove Selected
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Items List */}
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex h-32 sm:h-36">
                        {/* Selection Checkbox */}
                        {cart.items.length > 1 && (
                          <div className="flex items-center p-4">
                            <input
                              type="checkbox"
                              checked={selectedItems.has(item.id)}
                              onChange={() => toggleItemSelection(item.id)}
                              className="w-4 h-4 rounded border-border"
                            />
                          </div>
                        )}

                        {/* Product Image */}
                        <div className="w-32 h-32 sm:w-36 sm:h-36 flex-shrink-0">
                          <img
                            src={item.product_image || item.variant?.image_url}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 p-4 flex justify-between">
                          <div className="space-y-2">
                            <h3 className="font-semibold text-foreground line-clamp-2">
                              {item.product_name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {item.variant?.size && (
                                <Badge variant="outline" className="text-xs">
                                  Size: {item.variant.size}
                                </Badge>
                              )}
                              {item.variant?.color && (
                                <Badge variant="outline" className="text-xs">
                                  {item.variant.color}
                                </Badge>
                              )}
                            </div>
                            <p className="text-lg font-bold text-primary">
                              ${(item.variant?.price || 0).toFixed(2)}
                            </p>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                disabled={updatingItems.has(item.id) || item.quantity <= 1}
                                className="h-8 w-8 p-0 min-h-[44px] min-w-[44px] md:min-h-[32px] md:min-w-[32px]"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => {
                                  const newQty = parseInt(e.target.value);
                                  if (newQty > 0) {
                                    handleQuantityChange(item.id, newQty);
                                  }
                                }}
                                className="w-16 h-8 text-center"
                                disabled={updatingItems.has(item.id)}
                              />
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                disabled={updatingItems.has(item.id)}
                                className="h-8 w-8 p-0 min-h-[44px] min-w-[44px] md:min-h-[32px] md:min-w-[32px]"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={updatingItems.has(item.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 min-h-[44px]"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold">Order Summary</h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Items ({cart.total_items})</span>
                      <span>${cart.total_amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>{cart.total_amount >= 50 ? 'FREE' : '$5.99'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax (estimated)</span>
                      <span>${(cart.total_amount * 0.08).toFixed(2)}</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>
                        ${(
                          cart.total_amount + 
                          (cart.total_amount >= 50 ? 0 : 5.99) + 
                          (cart.total_amount * 0.08)
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Button 
                    className="w-full h-12 text-base"
                    onClick={() => navigate('/checkout')}
                  >
                    Proceed to Checkout
                  </Button>

                  {cart.total_amount < 50 && (
                    <p className="text-xs text-muted-foreground text-center">
                      Add ${(50 - cart.total_amount).toFixed(2)} more for free shipping
                    </p>
                  )}
                </CardContent>
              </Card>

              <Button
                variant="outline"
                className="w-full min-h-[44px]"
                onClick={() => navigate('/')}
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}