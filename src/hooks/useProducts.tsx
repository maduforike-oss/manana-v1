import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listProducts, getProduct } from '@/lib/api/products';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  name: string;
  description: string;
  base_price: number;
  slug: string;
  status: 'active' | 'draft' | 'archived';
  category_id?: string;
  images?: Array<{
    id: string;
    url: string;
    display_order: number;
    alt_text?: string;
  }>;
  variants?: Array<{
    id: string;
    size: string;
    color: string;
    price: number;
    stock_quantity: number;
  }>;
}

const QUERY_KEYS = {
  products: ['products'] as const,
  productById: (id: string) => ['products', id] as const,
  productsByCategory: (categoryId: string) => ['products', 'category', categoryId] as const,
} as const;

export function useProducts() {
  return useQuery({
    queryKey: QUERY_KEYS.products,
    queryFn: () => listProducts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.productById(id),
    queryFn: () => getProduct(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useProductsByCategory(categoryId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.productsByCategory(categoryId),
    queryFn: () => listProducts({ category_id: categoryId }),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });
}

export function useProductMutations() {
  const queryClient = useQueryClient();

  const invalidateProducts = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products });
  };

  const createProduct = useMutation({
    mutationFn: async (productData: Omit<Product, 'id'>) => {
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateProducts();
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Product> & { id: string }) => {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.productById(data.id), data);
      invalidateProducts();
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: QUERY_KEYS.productById(id) });
      invalidateProducts();
    },
  });

  return {
    createProduct,
    updateProduct,
    deleteProduct,
    invalidateProducts,
  };
}