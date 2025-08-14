import { Package, Truck, CheckCircle, Clock } from 'lucide-react';
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
    toast({ title: "Tracking Order", description: `Tracking ${tracking} for order ${orderId}` });
  };

  const handleViewOrderDetails = (orderId: string) => {
    toast({ title: "Order Details", description: `Details for order ${orderId} will open here` });
  };

  const handleStartDesigning = () => {
    setActiveTab('studio');
  };

  return (
    <div className="h-full bg-background overflow-auto">
      <div className="container mx-auto py-6 px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Your Orders</h1>
          <p className="text-muted-foreground">Track your custom clothing orders</p>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {mockOrders.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Order Info */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{order.design}</h3>
                    <Badge variant={getStatusVariant(order.status)} className="flex items-center gap-1">
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span>Order #{order.id}</span>
                    <span>•</span>
                    <span>{new Date(order.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Quantity: {order.quantity}</span>
                    {order.tracking && (
                      <>
                        <span>•</span>
                        <span>Tracking: {order.tracking}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Order Actions */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-bold text-lg">£{order.total}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    {order.tracking && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleTrackOrder(order.id, order.tracking!)}
                      >
                        Track Order
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewOrderDetails(order.id)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>

              {/* Order Progress */}
              {order.status !== 'delivered' && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <span className="text-sm">Order Placed</span>
                    </div>
                    
                    <div className="flex-1 h-px bg-border" />
                    
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        order.status === 'processing' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <span className="text-sm">Processing</span>
                    </div>
                    
                    <div className="flex-1 h-px bg-border" />
                    
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        order.status === 'shipped' ? 'bg-blue-500' : 'bg-gray-300'
                      }`} />
                      <span className="text-sm">Shipped</span>
                    </div>
                    
                    <div className="flex-1 h-px bg-border" />
                    
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-300 rounded-full" />
                      <span className="text-sm">Delivered</span>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {mockOrders.length === 0 && (
          <Card className="p-12 text-center">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first design and place an order to see it here
            </p>
            <Button onClick={handleStartDesigning}>Start Designing</Button>
          </Card>
        )}
      </div>
    </div>
  );
};