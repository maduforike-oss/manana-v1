import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
  items: any[];
  shipping_address?: any;
  billing_address?: any;
  payment_method?: any;
  notes?: string;
}

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          user_id,
          status,
          total_amount,
          currency,
          created_at,
          updated_at,
          items,
          shipping_address,
          billing_address,
          payment_method,
          notes
        `)
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data as Order[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
}

export function useCreateOrder() {
  return async (orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>) => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('orders')
      .insert({
        ...orderData,
        user_id: user.user.id,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  };
}