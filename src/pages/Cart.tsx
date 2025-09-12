import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, CreditCard, Truck, Package, CheckCircle, Clock, Calendar, Palette, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heading } from '@/components/ui/heading';
import { useCartStore } from '@/store/useCartStore';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/store/useAppStore';

export default function Cart() {
  const navigate = useNavigate();
  const { items, total, count, updateQuantity, removeItem, clearCart } = useCartStore();
  const { toast } = useToast();
  const { setActiveTab } = useAppStore();
  const [promoCode, setPromoCode] = useState('');
  const [activeTab, setActiveCartTab] = useState('cart');

  // Mock orders data (in real app, this would come from backend)
  const mockOrders = [
    {
      id: 'ORD-001',
      design: 'Sunset Vibes T-Shirt',
      status: 'delivered',
      date: '2024-01-15',
      total: 18.99,
      quantity: 1,
      tracking: 'TRK123456789',
    },
    {
      id: 'ORD-002',
      design: 'Urban Street Hoodie',
      status: 'shipped',
      date: '2024-01-18',
      total: 34.99,
      quantity: 2,
      tracking: 'TRK987654321',
    },
    {
      id: 'ORD-003',
      design: 'Minimal Logo Cap',
      status: 'processing',
      date: '2024-01-20',
      total: 22.99,
      quantity: 1,
      tracking: null,
    },
  ];

  const shipping = total > 50 ? 0 : 9.99;
  const tax = total * 0.08; // 8% tax
  const finalTotal = total + shipping + tax;

  const handleCheckout = () => {
    if (items.length === 0) {
      toast({ 
        title: "Cart is empty", 
        description: "Add some items to your cart first",
        variant: "destructive"
      });
      return;
    }
    
    navigate('/checkout');
  };

  const applyPromoCode = () => {
    if (promoCode.toLowerCase() === 'welcome10') {
      toast({ 
        title: "Promo code applied!", 
        description: "10% discount applied to your order"
      });
    } else {
      toast({ 
        title: "Invalid promo code", 
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'shipped':
        return <Truck className="w-4 h-4 text-blue-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Package className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'default';
      case 'shipped':
        return 'secondary';
      case 'processing':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const handleTrackOrder = (orderId: string, tracking: string) => {
    window.location.href = `/orders/${orderId}#tracking`;
  };

  const handleViewOrderDetails = (orderId: string) => {
    window.location.href = `/orders/${orderId}`;
  };

  const handleStartDesigning = () => {
    setActiveTab('studio');
  };

  const cartTabTitle = items.length > 0 ? `Cart (${count})` : 'Cart';
  const ordersTabTitle = mockOrders.length > 0 ? `Orders (${mockOrders.length})` : 'Orders';

  return (
    <div className="min-h-screen bg-background modern-scroll">
      {/* Consistent Manana Header */}
      <div className="sticky top-0 z-40 glass-nav">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/')}
              className="hover:-translate-y-0.5 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                <ShoppingBag className="h-4 w-4 text-white" />
              </div>
              <Heading as="h1" size="h3" variant="gradient">
                Cart & Orders
              </Heading>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        <Tabs value={activeTab} onValueChange={setActiveCartTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted/30 rounded-lg p-1">
            <TabsTrigger value="cart" className="flex items-center gap-2 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ShoppingBag className="h-4 w-4" />
              {cartTabTitle}
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Package className="h-4 w-4" />
              {ordersTabTitle}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cart" className="mt-4 animate-fade-in">
            {items.length === 0 ? (
              <div className="text-center py-12 animate-scale-in">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="h-10 w-10 text-primary" />
                </div>
                <Heading as="h2" size="h2" variant="default" className="mb-3">Your cart is empty</Heading>
                <p className="text-muted-foreground mb-6 text-sm">
                  Discover amazing designs and start creating your collection
                </p>
                <Button onClick={() => navigate('/')} className="hover:-translate-y-0.5 transition-all duration-200">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Explore Marketplace
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <Heading as="h2" size="h4" variant="default">Cart Items</Heading>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearCart}
                      className="text-destructive hover:text-destructive hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <Trash2 className="h-3 w-3 mr-1.5" />
                      Clear All
                    </Button>
                  </div>
                  {items.map((item, index) => (
                    <Card key={item.id} className="hover:shadow-md transition-all duration-200 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5">
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-medium text-sm">{item.name}</h3>
                                <p className="text-xs text-muted-foreground">Design #{item.id.slice(0, 8)}</p>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon"
                      onClick={() => {
                        removeItem(item.id);
                        toast({ 
                          title: "Removed from cart", 
                          description: `${item.name} has been removed`
                        });
                      }}
                                className="text-destructive hover:text-destructive h-8 w-8 hover:-translate-y-0.5 transition-all duration-200"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              <Badge variant="outline" className="text-xs px-2 py-0.5">Size: {item.size}</Badge>
                              <Badge variant="outline" className="text-xs px-2 py-0.5">Color: {item.color}</Badge>
                              <Badge variant="outline" className="text-xs px-2 py-0.5">{item.productId.includes('design') ? 'Design' : 'Product'}</Badge>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  onClick={() => {
                                    updateQuantity(item.id, item.quantity - 1);
                                    toast({ title: "Quantity updated" });
                                  }}
                                  className="h-7 w-7 hover:-translate-y-0.5 transition-all duration-200"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  onClick={() => {
                                    updateQuantity(item.id, item.quantity + 1);
                                    toast({ title: "Quantity updated" });
                                  }}
                                  className="h-7 w-7 hover:-translate-y-0.5 transition-all duration-200"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              
                              <div className="text-right">
                                <div className="font-semibold text-sm bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </div>
                                <div className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="space-y-4">
                  <Card className="glass-effect">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 bg-gradient-to-r from-primary to-secondary rounded-md flex items-center justify-center">
                          <CreditCard className="h-3 w-3 text-white" />
                        </div>
                        <Heading as="h3" size="h5" variant="default">Order Summary</Heading>
                      </div>
                      
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Subtotal ({count} items)</span>
                            <span className="font-medium">${total.toFixed(2)}</span>
                          </div>
                        
                        <div className="flex justify-between">
                          <span>Shipping</span>
                          <span>
                            {shipping === 0 ? (
                              <span className="text-emerald-600 font-medium">FREE</span>
                            ) : (
                              `$${shipping.toFixed(2)}`
                            )}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span>Tax</span>
                          <span className="font-medium">${tax.toFixed(2)}</span>
                        </div>
                        
                        <div className="border-t pt-2 mt-3">
                          <div className="flex justify-between font-semibold">
                            <span>Total</span>
                            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                              ${finalTotal.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {total < 50 && (
                        <div className="mt-3 p-3 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/20">
                          <div className="flex items-center gap-2 text-primary">
                            <Truck className="h-3 w-3" />
                            <span className="text-xs font-medium">
                              Add ${(50 - total).toFixed(2)} more for free shipping
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Promo Code */}
                  <Card className="glass-effect">
                    <CardContent className="p-4">
                      <Heading as="h3" size="h6" variant="default" className="mb-3">Promo Code</Heading>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Enter code"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          className="text-sm"
                        />
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            applyPromoCode();
                            if (promoCode.toLowerCase() === 'welcome10') {
                              setTimeout(() => setPromoCode(''), 2000);
                            }
                          }}
                          disabled={!promoCode}
                          className="hover:-translate-y-0.5 transition-all duration-200"
                        >
                          Apply
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Checkout Button */}
                  <Button 
                    onClick={() => {
                      handleCheckout();
                      toast({ 
                        title: "Proceeding to checkout", 
                        description: "Taking you to secure payment..."
                      });
                    }}
                    className="w-full h-10 bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Proceed to Checkout
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders" className="mt-4 animate-fade-in">
            <div className="space-y-4">
              {mockOrders.length === 0 ? (
                <Card className="border-0 shadow-xl bg-gradient-to-br from-card/50 to-card p-16 text-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-full blur-3xl" />
                    <div className="relative p-8 bg-background/80 backdrop-blur-sm rounded-2xl border border-primary/20">
                      <div className="p-4 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl w-fit mx-auto mb-6">
                        <Package className="w-12 h-12 text-primary" />
                      </div>
                      <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Your creative journey starts here! ✨
                      </h3>
                      <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto">
                        Ready to bring your ideas to life? Create your first custom design and watch the magic happen!
                      </p>
                      <Button 
                        onClick={handleStartDesigning}
                        size="lg"
                        className="gap-2 hover:scale-105 transition-all duration-200 shadow-lg"
                      >
                        <Palette className="w-5 h-5" />
                        Start Creating
                      </Button>
                    </div>
                  </div>
                </Card>
              ) : (
                mockOrders.map((order) => (
                  <Card key={order.id} className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-card/80 backdrop-blur-sm overflow-hidden">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative p-6">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          {/* Order Info */}
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg">
                                <Package className="w-5 h-5 text-primary" />
                              </div>
                              <h3 className="font-bold text-xl bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                                {order.design}
                              </h3>
                              <Badge 
                                variant={getStatusVariant(order.status)} 
                                className="flex items-center gap-1 px-3 py-1 rounded-full shadow-sm"
                              >
                                {getStatusIcon(order.status)}
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </Badge>
                            </div>
                            
                            <div className="flex flex-wrap gap-4 text-sm">
                              <span className="px-2 py-1 bg-muted/50 rounded-md font-medium">
                                #{order.id}
                              </span>
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                {new Date(order.date).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <ShoppingBag className="w-3 h-3" />
                                Qty: {order.quantity}
                              </span>
                              {order.tracking && (
                                <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-600 rounded-md text-xs font-mono">
                                  <Truck className="w-3 h-3" />
                                  {order.tracking}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Order Actions */}
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                                £{order.total}
                              </p>
                              <p className="text-xs text-muted-foreground">Total</p>
                            </div>
                            
                            <div className="flex gap-2">
                              {order.tracking && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="gap-2 hover:scale-105 transition-all duration-200 border-primary/20 hover:bg-primary/10"
                                  onClick={() => handleTrackOrder(order.id, order.tracking!)}
                                >
                                  <Truck className="w-4 h-4" />
                                  Track
                                </Button>
                              )}
                              <Button 
                                variant="default" 
                                size="sm"
                                className="gap-2 hover:scale-105 transition-all duration-200 shadow-md"
                                onClick={() => handleViewOrderDetails(order.id)}
                              >
                                <Package className="w-4 w-4" />
                                Details
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Order Progress */}
                        {order.status !== 'delivered' && (
                          <div className="mt-6 pt-4 border-t border-border/50">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-muted-foreground">Order Progress</span>
                              <span className="text-xs text-muted-foreground">
                                {order.status === 'processing' ? '25%' : order.status === 'shipped' ? '75%' : '100%'} Complete
                              </span>
                            </div>
                            <div className="relative">
                              <div className="flex items-center justify-between">
                                <div className="flex flex-col items-center gap-1">
                                  <div className="w-4 h-4 bg-primary rounded-full shadow-lg border-2 border-background" />
                                  <span className="text-xs font-medium text-primary">Placed</span>
                                </div>
                                
                                <div className={`flex-1 h-0.5 mx-2 ${
                                  order.status !== 'processing' ? 'bg-primary' : 'bg-border'
                                }`} />
                                
                                <div className="flex flex-col items-center gap-1">
                                  <div className={`w-4 h-4 rounded-full shadow-lg border-2 border-background ${
                                    order.status === 'processing' ? 'bg-amber-500' : order.status === 'shipped' || order.status === 'delivered' ? 'bg-primary' : 'bg-border'
                                  }`} />
                                  <span className={`text-xs font-medium ${
                                    order.status === 'processing' ? 'text-amber-500' : order.status === 'shipped' || order.status === 'delivered' ? 'text-primary' : 'text-muted-foreground'
                                  }`}>Process</span>
                                </div>
                                
                                <div className={`flex-1 h-0.5 mx-2 ${
                                  order.status === 'shipped' || order.status === 'delivered' ? 'bg-primary' : 'bg-border'
                                }`} />
                                
                                <div className="flex flex-col items-center gap-1">
                                  <div className={`w-4 h-4 rounded-full shadow-lg border-2 border-background ${
                                    order.status === 'shipped' ? 'bg-blue-500' : order.status === 'delivered' ? 'bg-primary' : 'bg-border'
                                  }`} />
                                  <span className={`text-xs font-medium ${
                                    order.status === 'shipped' ? 'text-blue-500' : order.status === 'delivered' ? 'text-primary' : 'text-muted-foreground'
                                  }`}>Shipped</span>
                                </div>
                                
                                <div className={`flex-1 h-0.5 mx-2 ${
                                  order.status === 'delivered' ? 'bg-primary' : 'bg-border'
                                }`} />
                                
                                <div className="flex flex-col items-center gap-1">
                                  <div className={`w-4 h-4 rounded-full shadow-lg border-2 border-background ${
                                    order.status === 'delivered' ? 'bg-primary' : 'bg-border'
                                  }`} />
                                  <span className={`text-xs font-medium ${
                                    order.status === 'delivered' ? 'text-primary' : 'text-muted-foreground'
                                  }`}>Delivered</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}