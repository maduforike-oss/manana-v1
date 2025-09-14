import { Package, Truck, CheckCircle, Clock, Calendar, ShoppingBag, Palette, User } from 'lucide-react';
import { BrandHeader } from '@/components/ui/brand-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { OrderCardSkeleton } from '@/components/marketplace/OrderCardSkeleton';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/store/useAppStore';
import { useOrders } from '@/hooks/useOrders';
import { useState, useMemo } from 'react';

export const OrdersPage = () => {
  const { toast } = useToast();
  const { setActiveTab } = useAppStore();
  const { data: orders = [], isLoading, error } = useOrders();

  const getProgressStage = (status: string) => {
    switch (status) {
      case 'pending': return 1;
      case 'processing': return 2;
      case 'shipped': return 3;
      case 'delivered': return 4;
      default: return 1;
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

  return (
    <div className="h-full bg-background overflow-auto modern-scroll">
      <BrandHeader 
        title="Orders" 
        subtitle="Track your purchases and order history"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setActiveTab('profile')}
          className="glass-effect border-border/20 min-h-[48px] min-w-[48px] rounded-2xl"
          aria-label="View profile"
        >
          <User className="w-5 h-5" />
        </Button>
      </BrandHeader>

      <div className="container mx-auto py-4 px-4">
        {/* Brand-enhanced content */}
        <div className="mb-8">
          <div className="relative bg-gradient-to-r from-primary/5 via-background to-secondary/5 rounded-lg p-6 border border-primary/10">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-2 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <div>
                <Heading as="h2" size="h2" variant="gradient">
                  Your Creative Orders ✨
                </Heading>
                <p className="text-muted-foreground text-sm">Premium quality designs delivered fast</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 bg-primary/10 text-primary rounded-full border border-primary/20">
                {orders.length} Active Orders
              </span>
              <span className="px-2 py-1 bg-secondary/10 text-secondary rounded-full border border-secondary/20">
                Premium Quality ⭐
              </span>
              <span className="px-2 py-1 bg-emerald-500/10 text-emerald-600 rounded-full border border-emerald-500/20">
                Fast Shipping 🚀
              </span>
            </div>
          </div>
        </div>

        {/* Modern Orders List */}
        <div className="space-y-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <OrderCardSkeleton key={i} />
            ))
          ) : (
            orders.map((order) => (
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
                        <Heading as="h3" size="h4" variant="default">
                          Order {order.order_number}
                        </Heading>
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
                          #{order.order_number}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <ShoppingBag className="w-3 h-3" />
                          Items: {Array.isArray(order.items) ? order.items.length : 0}
                        </span>
                      </div>
                    </div>

                    {/* Order Actions */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                          {order.currency === 'USD' ? '$' : '£'}{order.total_amount}
                        </p>
                        <p className="text-xs text-muted-foreground">Total</p>
                      </div>
                      
                      <div className="flex gap-2">
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
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <div className="mt-6 pt-4 border-t border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground">Order Progress</span>
                        <span className="text-xs text-muted-foreground">
                          {getProgressStage(order.status) * 25}% Complete
                        </span>
                      </div>
                      <div className="relative">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-4 h-4 bg-primary rounded-full shadow-lg border-2 border-background" />
                            <span className="text-xs font-medium text-primary">Placed</span>
                          </div>
                          
                          <div className={`flex-1 h-0.5 mx-2 ${
                            getProgressStage(order.status) >= 2 ? 'bg-primary' : 'bg-border'
                          }`} />
                          
                          <div className="flex flex-col items-center gap-1">
                            <div className={`w-4 h-4 rounded-full shadow-lg border-2 border-background ${
                              getProgressStage(order.status) === 2 ? 'bg-amber-500' : 
                              getProgressStage(order.status) > 2 ? 'bg-primary' : 'bg-border'
                            }`} />
                            <span className={`text-xs font-medium ${
                              getProgressStage(order.status) === 2 ? 'text-amber-500' : 
                              getProgressStage(order.status) > 2 ? 'text-primary' : 'text-muted-foreground'
                            }`}>Process</span>
                          </div>
                          
                          <div className={`flex-1 h-0.5 mx-2 ${
                            getProgressStage(order.status) >= 3 ? 'bg-primary' : 'bg-border'
                          }`} />
                          
                          <div className="flex flex-col items-center gap-1">
                            <div className={`w-4 h-4 rounded-full shadow-lg border-2 border-background ${
                              getProgressStage(order.status) === 3 ? 'bg-blue-500' : 
                              getProgressStage(order.status) > 3 ? 'bg-primary' : 'bg-border'
                            }`} />
                            <span className={`text-xs font-medium ${
                              getProgressStage(order.status) === 3 ? 'text-blue-500' : 
                              getProgressStage(order.status) > 3 ? 'text-primary' : 'text-muted-foreground'
                            }`}>Shipped</span>
                          </div>
                          
                          <div className={`flex-1 h-0.5 mx-2 ${
                            getProgressStage(order.status) >= 4 ? 'bg-primary' : 'bg-border'
                          }`} />
                          
                          <div className="flex flex-col items-center gap-1">
                            <div className={`w-4 h-4 rounded-full shadow-lg border-2 border-background ${
                              getProgressStage(order.status) >= 4 ? 'bg-primary' : 'bg-border'
                            }`} />
                            <span className={`text-xs font-medium ${
                              getProgressStage(order.status) >= 4 ? 'text-primary' : 'text-muted-foreground'
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

        {/* Enhanced Empty State */}
        {orders.length === 0 && !isLoading && (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-card/50 to-card p-16 text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-full blur-3xl" />
              <div className="relative p-8 bg-background/80 backdrop-blur-sm rounded-2xl border border-primary/20">
                <div className="p-4 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl w-fit mx-auto mb-6">
                  <Package className="w-12 h-12 text-primary" />
                </div>
                <Heading as="h3" size="h2" variant="gradient">
                  Your creative journey starts here! ✨
                </Heading>
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