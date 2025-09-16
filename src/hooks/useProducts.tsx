import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listProducts, getProduct, searchProducts, listCategories } from '@/lib/api/products';
import { getTrendingProducts } from '@/lib/products';
import { supabase } from '@/integrations/supabase/client';
import { MarketQueryState } from './useMarketQueryState';
import { listMarketCards, toggleFavorite, markProductView, type MarketCard } from '@/lib/market/api';

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
        // Default to listing all products
        const items = await listMarketCards();
        return { items: items.map(transformMarketCard), total: items.length };
      }

      const { q, tab, sort, filters } = queryState;
      
      // Build filters for market API
      const marketFilters = {
        min_price_cents: filters.price_min ? filters.price_min * 100 : undefined,
        max_price_cents: filters.price_max ? filters.price_max * 100 : undefined,
      };

      try {
        // Use the new market API
        const items = await listMarketCards({
          tab,
          q,
          filters: marketFilters,
          limit: 24,
          offset: (queryState.page - 1) * 24,
        });

        return { 
          items: items.map(transformMarketCard), 
          total: items.length 
        };
      } catch (error) {
        console.error('Market API error, falling back to legacy:', error);
        
        // Fallback to legacy API
        if (tab === 'trending') {
          const trendingProducts = await getTrendingProducts(24);
          return { items: trendingProducts, total: trendingProducts.length };
        }

        if (tab === 'new') {
          const items = await listProducts({
            limit: 24,
            offset: (queryState.page - 1) * 24,
          });
          
          const sortedItems = items.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          
          return { items: sortedItems, total: sortedItems.length };
        }

        if (tab === 'saved') {
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

        // Default fallback
        const items = await listProducts({
          limit: 24,
          offset: (queryState.page - 1) * 24,
        });

        return { items, total: items.length };
      }
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

// Transform MarketCard to Product interface for compatibility
function transformMarketCard(card: MarketCard): Product {
  return {
    id: card.product_id,
    name: card.title,
    description: card.description || '',
    base_price: card.price_cents / 100,
    slug: card.slug || card.product_id,
    status: card.status as any,
    images: card.primary_image ? [{
      id: '1',
      url: card.primary_image,
      display_order: 0,
      alt_text: card.title
    }] : [],
    variants: []
  };
}

// New hooks for market features
export function useToggleFavorite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: toggleFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useMarkProductView() {
  return useMutation({
    mutationFn: markProductView,
  });
}