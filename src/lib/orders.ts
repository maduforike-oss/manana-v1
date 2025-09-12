import { supabase } from '@/integrations/supabase/client';

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  currency: string;
  shipping_address?: any;
  billing_address?: any;
  payment_method?: any;
  notes?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id?: string;
  product_name: string;
  product_image?: string;
  size?: string;
  color?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

// Get user orders
export async function getUserOrders(): Promise<Order[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return [];
    }

    return data?.map(order => ({
      ...order,
      status: order.status as Order['status'],
      items: order.order_items || []
    })) || [];
  } catch (error) {
    console.error('Error getting user orders:', error);
    return [];
  }
}

// Get single order
export async function getOrder(orderId: string): Promise<Order | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching order:', error);
      return null;
    }

    return {
      ...data,
      status: data.status as Order['status'],
      items: data.order_items || []
    };
  } catch (error) {
    console.error('Error getting order:', error);
    return null;
  }
}

// Get order statistics for profile
export async function getOrderStats(): Promise<{
  total_orders: number;
  total_spent: number;
  pending_orders: number;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { total_orders: 0, total_spent: 0, pending_orders: 0 };

    const { data, error } = await supabase
      .from('orders')
      .select('total_amount, status')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching order stats:', error);
      return { total_orders: 0, total_spent: 0, pending_orders: 0 };
    }

    return {
      total_orders: data?.length || 0,
      total_spent: data?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0,
      pending_orders: data?.filter(order => order.status === 'pending').length || 0
    };
  } catch (error) {
    console.error('Error getting order stats:', error);
    return { total_orders: 0, total_spent: 0, pending_orders: 0 };
  }
}