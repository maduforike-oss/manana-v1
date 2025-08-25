import { Package, Truck, CheckCircle, Clock, Calendar, ShoppingBag, Palette } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import { useAppStore } from '@/store/useAppStore';

export const OrdersPage = () => {
  const { toast } = useToast();
  const { setActiveTab } = useAppStore();
  
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

  return (
    <div className="h-full bg-gradient-to-br from-background via-background to-primary/5 overflow-auto">
      <div className="container mx-auto py-8 px-4">
        {/* Modern Header */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-3xl blur-3xl -z-10" />
          <div className="relative bg-card/80 backdrop-blur-sm border border-primary/20 rounded-2xl p-8 shadow-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl">
                <Package className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                  Your Orders ✨
                </h1>
                <p className="text-muted-foreground text-lg">Track your creative journey & custom pieces</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full border border-primary/20">
                {mockOrders.length} Active Orders
              </span>
              <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full border border-secondary/20">
                Premium Quality ⭐
              </span>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full border border-emerald-500/20">
                Fast Shipping 🚀
              </span>
            </div>
          </div>
        </div>

        {/* Modern Orders List */}
        <div className="space-y-6">
          {mockOrders.map((order) => (
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
                          <Package className="w-4 h-4" />
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
          ))}
        </div>

        {/* Enhanced Empty State */}
        {mockOrders.length === 0 && (
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
        )}
      </div>
    </div>
  );
};