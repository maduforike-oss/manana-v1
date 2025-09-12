import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  base_price: number;
  category_id: string;
  brand_id?: string;
  status: 'active' | 'inactive' | 'draft';
  created_at: string;
  updated_at: string;
  category?: Category;
  images?: ProductImage[];
  variants?: ProductVariant[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string;
  image_url?: string;
  created_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  variant_id?: string;
  url: string;
  display_order: number;
  alt_text?: string;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  price: number;
  size: string;
  color: string;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
  image_url?: string;
}

// Get all categories
export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting categories:', error);
    return [];
  }
}

// Get products with optional filtering
export async function getProducts(options: {
  categoryId?: string;
  limit?: number;
  offset?: number;
  search?: string;
  status?: string;
} = {}): Promise<Product[]> {
  try {
    let query = supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name,
          slug,
          created_at
        ),
        product_images!product_images_product_id_fkey (
          id,
          product_id,
          variant_id,
          url,
          display_order,
          alt_text,
          created_at
        ),
        product_variants (
          id,
          product_id,
          sku,
          price,
          size,
          color,
          stock_quantity,
          created_at,
          updated_at
        )
      `)
      .eq('status', options.status || 'active')
      .order('created_at', { ascending: false });

    if (options.categoryId) {
      query = query.eq('category_id', options.categoryId);
    }

    if (options.search) {
      query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%`);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    return data?.map((product: any) => ({
      ...product,
      status: product.status as 'active' | 'inactive' | 'draft',
      category: product.categories || undefined,
      images: product.product_images?.sort((a: any, b: any) => a.display_order - b.display_order) || [],
      variants: product.product_variants || []
    })) || [];
  } catch (error) {
    console.error('Error getting products:', error);
    return [];
  }
}

// Get single product by ID or slug
export async function getProduct(identifier: string): Promise<Product | null> {
  try {
    let query = supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name,
          slug,
          created_at
        ),
        product_images!product_images_product_id_fkey (
          id,
          product_id,
          variant_id,
          url,
          display_order,
          alt_text,
          created_at
        ),
        product_variants (
          id,
          product_id,
          sku,
          price,
          size,
          color,
          stock_quantity,
          created_at,
          updated_at
        )
      `);

    // Check if identifier is UUID or slug
    if (identifier.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      query = query.eq('id', identifier);
    } else {
      query = query.eq('slug', identifier);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error('Error fetching product:', error);
      return null;
    }

    if (!data) return null;

    return {
      ...data,
      status: data.status as 'active' | 'inactive' | 'draft',
      category: data.categories || undefined,
      images: data.product_images?.sort((a: any, b: any) => a.display_order - b.display_order) || [],
      variants: data.product_variants || []
    };
  } catch (error) {
    console.error('Error getting product:', error);
    return null;
  }
}

// Get product variants
export async function getProductVariants(productId: string): Promise<ProductVariant[]> {
  try {
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .order('size');

    if (error) {
      console.error('Error fetching variants:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting variants:', error);
    return [];
  }
}

// Track product analytics (views, clicks, conversions)
export async function trackProductAnalytics(
  productId: string, 
  type: 'view' | 'click' | 'conversion'
): Promise<boolean> {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Get or create today's analytics record
    const { data: existing } = await supabase
      .from('product_analytics')
      .select('*')
      .eq('product_id', productId)
      .eq('day', today)
      .maybeSingle();

    if (existing) {
      // Update existing record
      const updates: any = {};
      switch (type) {
        case 'view':
          updates.views = existing.views + 1;
          break;
        case 'click':
          updates.clicks = existing.clicks + 1;
          break;
        case 'conversion':
          updates.conversions = existing.conversions + 1;
          break;
      }

      const { error } = await supabase
        .from('product_analytics')
        .update(updates)
        .eq('id', existing.id);

      if (error) {
        console.error('Error updating product analytics:', error);
        return false;
      }
    } else {
      // Create new record
      const newRecord: any = {
        product_id: productId,
        day: today,
        views: type === 'view' ? 1 : 0,
        clicks: type === 'click' ? 1 : 0,
        conversions: type === 'conversion' ? 1 : 0
      };

      const { error } = await supabase
        .from('product_analytics')
        .insert(newRecord);

      if (error) {
        console.error('Error creating product analytics:', error);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error tracking product analytics:', error);
    return false;
  }
}

// Track search analytics
export async function trackSearchAnalytics(
  query: string, 
  resultsCount: number, 
  userId?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('search_analytics')
      .insert({
        query: query.toLowerCase().trim(),
        results_count: resultsCount,
        user_id: userId
      });

    if (error) {
      console.error('Error tracking search analytics:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error tracking search analytics:', error);
    return false;
  }
}

// Get trending products based on analytics
export async function getTrendingProducts(limit: number = 10): Promise<Product[]> {
  try {
    // Get products with high view/click ratios in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: analytics } = await supabase
      .from('product_analytics')
      .select('product_id, views, clicks')
      .gte('day', sevenDaysAgo.toISOString().split('T')[0])
      .order('views', { ascending: false })
      .limit(limit * 2); // Get more to account for inactive products

    if (!analytics?.length) {
      // Fallback to newest products
      return getProducts({ limit });
    }

    // Calculate trending scores and get product IDs
    const productScores = analytics.reduce((acc: any, item) => {
      const score = item.views + (item.clicks * 2); // Weight clicks more
      if (!acc[item.product_id] || acc[item.product_id] < score) {
        acc[item.product_id] = score;
      }
      return acc;
    }, {});

    const trendingProductIds = Object.entries(productScores)
      .sort(([, a]: any, [, b]: any) => b - a)
      .slice(0, limit)
      .map(([productId]) => productId);

    if (!trendingProductIds.length) {
      return getProducts({ limit });
    }

    // Get the actual products
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name,
          slug
        ),
        product_images!product_images_product_id_fkey (
          id,
          url,
          display_order,
          alt_text
        ),
        product_variants (
          id,
          price,
          size,
          color,
          stock_quantity
        )
      `)
      .in('id', trendingProductIds)
      .eq('status', 'active');

    if (error) {
      console.error('Error fetching trending products:', error);
      return getProducts({ limit });
    }

    return data?.map((product: any) => ({
      ...product,
      category: product.categories ? {
        ...product.categories,
        created_at: product.categories.created_at || new Date().toISOString()
      } : undefined,
      images: product.product_images?.sort((a: any, b: any) => a.display_order - b.display_order).map((img: any) => ({
        ...img,
        product_id: product.id,
        variant_id: img.variant_id || undefined,
        created_at: img.created_at || new Date().toISOString()
      })) || [],
      variants: product.product_variants?.map((variant: any) => ({
        ...variant,
        product_id: product.id,
        created_at: variant.created_at || new Date().toISOString(),
        updated_at: variant.updated_at || new Date().toISOString()
      })) || []
    })) || [];
  } catch (error) {
    console.error('Error getting trending products:', error);
    return getProducts({ limit });
  }
}