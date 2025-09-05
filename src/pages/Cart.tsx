import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, CreditCard, Truck, Package, CheckCircle, Clock, Calendar, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/store/useAppStore';

export default function Cart() {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
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

  const shipping = cart.total > 50 ? 0 : 9.99;
  const tax = cart.total * 0.08; // 8% tax
  const finalTotal = cart.total + shipping + tax;

  const handleCheckout = () => {
    if (cart.items.length === 0) {
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

  const cartTabTitle = cart.items.length > 0 ? `Cart (${cart.itemCount})` : 'Cart';
  const ordersTabTitle = mockOrders.length > 0 ? `Orders (${mockOrders.length})` : 'Orders';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="font-semibold">Cart & Orders</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveCartTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cart" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              {cartTabTitle}
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              {ordersTabTitle}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cart" className="mt-6">
            {cart.items.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
                <p className="text-muted-foreground mb-6">
                  Start shopping to add items to your cart
                </p>
                <Button onClick={() => navigate('/')}>
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Cart Items</h2>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearCart}
                      className="text-destructive hover:text-destructive"
                    >
                      Clear All
                    </Button>
                  </div>
                  {cart.items.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted">
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-medium">{item.name}</h3>
                                <p className="text-sm text-muted-foreground">by {item.creator}</p>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => removeFromCart(item.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge variant="outline">Size: {item.size}</Badge>
                              <Badge variant="outline">Color: {item.color}</Badge>
                              <Badge variant="outline">{item.listingType}</Badge>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              
                              <div className="text-right">
                                <div className="font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                                <div className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-4">Order Summary</h3>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Subtotal ({cart.itemCount} items)</span>
                          <span>${cart.total.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span>Shipping</span>
                          <span>
                            {shipping === 0 ? (
                              <span className="text-green-600 font-medium">FREE</span>
                            ) : (
                              `$${shipping.toFixed(2)}`
                            )}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span>Tax</span>
                          <span>${tax.toFixed(2)}</span>
                        </div>
                        
                        <div className="border-t pt-3">
                          <div className="flex justify-between font-semibold text-lg">
                            <span>Total</span>
                            <span>${finalTotal.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {cart.total < 50 && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2 text-blue-700">
                            <Truck className="h-4 w-4" />
                            <span className="text-sm">
                              Add ${(50 - cart.total).toFixed(2)} more for free shipping
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Promo Code */}
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-4">Promo Code</h3>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Enter code"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                        />
                        <Button 
                          variant="outline" 
                          onClick={applyPromoCode}
                          disabled={!promoCode}
                        >
                          Apply
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Checkout Button */}
                  <Button 
                    onClick={handleCheckout}
                    className="w-full h-12"
                    size="lg"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Proceed to Checkout
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <div className="space-y-6">
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