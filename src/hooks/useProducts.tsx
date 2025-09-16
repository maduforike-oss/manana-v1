import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listProducts, getProduct, searchProducts, listCategories } from '@/lib/api/products';
import { getTrendingProducts } from '@/lib/products';
import { supabase } from '@/integrations/supabase/client';
import { MarketQueryState } from './useMarketQueryState';

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

export function useProducts(queryState?: MarketQueryState) {
  return useQuery({
    queryKey: ['products', queryState],
    queryFn: async () => {
      if (!queryState) {
        return { items: await listProducts(), total: 0 };
      }

      const { q, tab, sort, filters } = queryState;
      const parsedFilters = {
        category_id: filters.categories[0] || undefined,
        min_price: filters.price_min,
        max_price: filters.price_max,
        sizes: filters.sizes.length > 0 ? filters.sizes : undefined,
        colors: filters.colors.length > 0 ? filters.colors : undefined,
      };

      // Handle special tabs
      if (tab === 'trending') {
        const trendingProducts = await getTrendingProducts(24);
        return { items: trendingProducts, total: trendingProducts.length };
      }

      if (tab === 'new') {
        const items = await listProducts({
          limit: 24,
          offset: (queryState.page - 1) * 24,
        });
        
        // Sort by created_at desc to show newest first
        const sortedItems = items.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        return { items: sortedItems, total: sortedItems.length };
      }

      if (tab === 'saved') {
        // For saved items, we need to join with wishlists
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) {
          return { items: [], total: 0 };
        }

        const { data: wishlistData, error } = await supabase
          .from('wishlists')
          .select(`
            products (
              *,
              categories (id, name, slug),
              product_images (id, url, display_order, alt_text),
              product_variants (id, price, size, color, stock_quantity)
            )
          `)
          .eq('user_id', user.user.id);

        if (error) throw error;

        return {
          items: (wishlistData || [])
            .filter(w => w.products)
            .map(w => ({
              ...(w.products as any),
              category: (w.products as any).categories,
              images: (w.products as any).product_images?.sort((a: any, b: any) => a.display_order - b.display_order) || [],
              variants: (w.products as any).product_variants || []
            })),
          total: wishlistData?.length || 0
        };
      }

      // For search with filters
      if (q || Object.values(parsedFilters).some(v => v !== undefined)) {
        const result = await searchProducts(q, parsedFilters, 24, (queryState.page - 1) * 24);
        let items = result.products;

        // Apply sorting
        if (sort === 'newest') {
          items = items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        } else if (sort === 'price_asc') {
          items = items.sort((a, b) => a.base_price - b.base_price);
        } else if (sort === 'price_desc') {
          items = items.sort((a, b) => b.base_price - a.base_price);
        }

        return { items, total: result.total };
      }

      // Regular listing with sorting
      let orderBy: { column: string; ascending: boolean } = { column: 'created_at', ascending: false };
      
      if (sort === 'newest') {
        orderBy = { column: 'created_at', ascending: false };
      } else if (sort === 'price_asc') {
        orderBy = { column: 'base_price', ascending: true };
      } else if (sort === 'price_desc') {
        orderBy = { column: 'base_price', ascending: false };
      } else if (sort === 'trending') {
        // For trending, we'll use created_at as fallback
        // In a real app, you'd join with analytics table
        orderBy = { column: 'created_at', ascending: false };
      }

      const items = await listProducts({
        limit: 24,
        offset: (queryState.page - 1) * 24,
      });

      // Sort the items
      const sortedItems = items.sort((a, b) => {
        if (orderBy.column === 'created_at') {
          const aTime = new Date(a.created_at).getTime();
          const bTime = new Date(b.created_at).getTime();
          return orderBy.ascending ? aTime - bTime : bTime - aTime;
        } else if (orderBy.column === 'base_price') {
          return orderBy.ascending ? a.base_price - b.base_price : b.base_price - a.base_price;
        }
        return 0;
      });

      return { items: sortedItems, total: sortedItems.length };
    },
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

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: listCategories,
    staleTime: 10 * 60 * 1000, // 10 minutes
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