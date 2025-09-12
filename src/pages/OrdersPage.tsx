import { useState, useEffect } from 'react';
import { ArrowLeft, Package, Truck, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNavigate, useParams } from 'react-router-dom';
import { getUserOrders, getOrder, type Order } from '@/lib/orders';
import { BrandHeader } from '@/components/ui/brand-header';
import { useToast } from '@/hooks/use-toast';
import { ProductCardSkeleton } from '@/components/marketplace/ProductCardSkeleton';
import { formatDistanceToNow } from 'date-fns';

export function OrdersPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const ordersData = await getUserOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'processing':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <BrandHeader title="Your Orders" />
        <div className="container mx-auto px-4 py-6 space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <ProductCardSkeleton key={i} viewMode="list" />
          ))}
        </div>
      </div>
    );
  }

  const isEmpty = !orders.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <BrandHeader title="Your Orders">
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
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">
              When you place your first order, it will appear here
            </p>
            <Button onClick={() => navigate('/')}>
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Your Orders</h1>
              <Badge variant="secondary">
                {orders.length} order{orders.length !== 1 ? 's' : ''}
              </Badge>
            </div>

            <div className="space-y-4">
              {orders.map((order) => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  onViewDetails={() => navigate(`/orders/${order.id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface OrderCardProps {
  order: Order;
  onViewDetails: () => void;
}

function OrderCard({ order, onViewDetails }: OrderCardProps) {
  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'processing':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="p-6">
          {/* Order Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Order {order.order_number}</h3>
                <Badge className={getStatusColor(order.status)}>
                  {getStatusIcon(order.status)}
                  <span className="ml-1 capitalize">{order.status}</span>
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    Placed {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                  </span>
                </div>
                <span>•</span>
                <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-lg font-bold">${order.total_amount.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">
                Total: ${order.total_amount.toFixed(2)}
              </p>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Order Items Preview */}
          <div className="space-y-3">
            {order.items.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                {item.product_image && (
                  <img
                    src={item.product_image}
                    alt={item.product_name}
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.product_name}</p>
                  <p className="text-sm text-muted-foreground">
                    Qty: {item.quantity} × ${item.unit_price.toFixed(2)}
                  </p>
                </div>
                <p className="font-medium">${item.total_price.toFixed(2)}</p>
              </div>
            ))}
            
            {order.items.length > 3 && (
              <p className="text-sm text-muted-foreground">
                +{order.items.length - 3} more item{order.items.length - 3 !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <Separator className="my-4" />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1 min-h-[44px]"
              onClick={onViewDetails}
              aria-label={`View details for order ${order.order_number}`}
            >
              View Details
            </Button>
            
            {order.status === 'delivered' && (
              <Button
                variant="outline"
                className="flex-1 min-h-[44px]"
                onClick={() => {
                  // Navigate to review products
                  // This would open a review modal or page
                }}
              >
                Write Review
              </Button>
            )}
            
            {['pending', 'processing'].includes(order.status) && (
              <Button
                variant="destructive"
                className="flex-1 min-h-[44px]"
                onClick={() => {
                  // Handle order cancellation
                  // This would open a confirmation modal
                }}
              >
                Cancel Order
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Individual Order Detail Page
export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadOrder(id);
    }
  }, [id]);

  const loadOrder = async (orderId: string) => {
    setIsLoading(true);
    try {
      const orderData = await getOrder(orderId);
      setOrder(orderData);
    } catch (error) {
      console.error('Error loading order:', error);
      toast({
        title: "Error",
        description: "Failed to load order details",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <BrandHeader title="Order Details" />
        <div className="container mx-auto px-4 py-6">
          <ProductCardSkeleton viewMode="list" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <BrandHeader title="Order Details" />
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
            <h2 className="text-2xl font-bold mb-2">Order not found</h2>
            <p className="text-muted-foreground mb-6">
              The order you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button onClick={() => navigate('/orders')}>
              Back to Orders
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <BrandHeader title={`Order ${order.order_number}`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="min-h-[44px] min-w-[44px]"
          aria-label="Back to Orders"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </BrandHeader>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Order Status & Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Order {order.order_number}</span>
              <Badge variant="secondary">
                <span className="capitalize">{order.status}</span>
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Order Date</p>
                <p className="font-medium">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="font-bold text-lg">${order.total_amount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>Items ({order.items.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                {item.product_image && (
                  <img
                    src={item.product_image}
                    alt={item.product_name}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-medium">{item.product_name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    {item.size && (
                      <Badge variant="outline" className="text-xs">
                        Size: {item.size}
                      </Badge>
                    )}
                    {item.color && (
                      <Badge variant="outline" className="text-xs">
                        {item.color}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Qty: {item.quantity} × ${item.unit_price.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${item.total_price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Shipping & Billing */}
        {(order.shipping_address || order.billing_address) && (
          <div className="grid md:grid-cols-2 gap-6">
            {order.shipping_address && (
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    <p>{order.shipping_address.firstName} {order.shipping_address.lastName}</p>
                    <p>{order.shipping_address.address1}</p>
                    {order.shipping_address.address2 && <p>{order.shipping_address.address2}</p>}
                    <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zipCode}</p>
                    <p>{order.shipping_address.country}</p>
                    {order.shipping_address.phone && <p>Phone: {order.shipping_address.phone}</p>}
                  </div>
                </CardContent>
              </Card>
            )}

            {order.billing_address && (
              <Card>
                <CardHeader>
                  <CardTitle>Billing Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    <p>{order.billing_address.firstName} {order.billing_address.lastName}</p>
                    <p>{order.billing_address.address1}</p>
                    {order.billing_address.address2 && <p>{order.billing_address.address2}</p>}
                    <p>{order.billing_address.city}, {order.billing_address.state} {order.billing_address.zipCode}</p>
                    <p>{order.billing_address.country}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${order.total_amount.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}