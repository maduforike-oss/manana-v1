import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  base_price: number;
  category_id?: string;
  brand_id?: string;
  status: 'active' | 'draft' | 'archived';
  created_at: string;
  updated_at?: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku?: string;
  price: number;
  size?: string;
  color?: string;
  stock_quantity: number;
  created_at: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string;
  image_url?: string;
  created_at: string;
}

export interface ProductWithDetails extends Product {
  category?: Category;
  images?: ProductImage[];
  variants?: ProductVariant[];
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

export interface ProductListParams {
  category_id?: string;
  search?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

// List products with filtering and pagination
export async function listProducts(params: ProductListParams = {}): Promise<Product[]> {
  try {
    let query = supabase
      .from('products')
      .select('*')
      .eq('status', params.status || 'active')
      .order('created_at', { ascending: false });

    if (params.category_id) {
      query = query.eq('category_id', params.category_id);
    }

    if (params.search) {
      query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`);
    }

    if (params.limit) {
      query = query.limit(params.limit);
    }

    if (params.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    return (data || []).map((p: any) => ({
      ...p,
      status: ((["active","draft","archived"] as const).includes(p.status) ? p.status : "active") as Product["status"]
    }));
  } catch (error) {
    console.error('Error in listProducts:', error);
    throw error;
  }
}

// Get single product by ID or slug with full details
export async function getProduct(identifier: string): Promise<ProductWithDetails | null> {
  try {
    let query = supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name,
          slug,
          parent_id,
          image_url,
          created_at
        ),
        product_images (
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
      throw new Error(`Failed to fetch product: ${error.message}`);
    }

    if (!data) return null;

    return {
      ...(data as any),
      status: ((["active","draft","archived"] as const).includes((data as any).status) ? (data as any).status : "active") as Product["status"],
      category: (data as any).categories || undefined,
      images: (data as any).product_images?.sort((a: any, b: any) => a.display_order - b.display_order) || [],
      variants: (data as any).product_variants || []
    };
  } catch (error) {
    console.error('Error in getProduct:', error);
    throw error;
  }
}

// List product variants for a specific product
export async function listVariants(productId: string): Promise<ProductVariant[]> {
  try {
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .order('size')
      .order('color');

    if (error) {
      console.error('Error fetching variants:', error);
      throw new Error(`Failed to fetch variants: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error in listVariants:', error);
    throw error;
  }
}

// List all categories
export async function listCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error in listCategories:', error);
    throw error;
  }
}

// Get category by ID or slug
export async function getCategory(identifier: string): Promise<Category | null> {
  try {
    let query = supabase.from('categories').select('*');

    // Check if identifier is UUID or slug
    if (identifier.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      query = query.eq('id', identifier);
    } else {
      query = query.eq('slug', identifier);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error('Error fetching category:', error);
      throw new Error(`Failed to fetch category: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in getCategory:', error);
    throw error;
  }
}

// Search products with advanced filtering
export async function searchProducts(
  searchQuery: string,
  filters: {
    category_id?: string;
    min_price?: number;
    max_price?: number;
    sizes?: string[];
    colors?: string[];
  } = {},
  limit: number = 20,
  offset: number = 0
): Promise<{
  products: ProductWithDetails[];
  total: number;
}> {
  try {
    let query = supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name,
          slug
        ),
        product_images (
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
      `, { count: 'exact' })
      .eq('status', 'active');

    // Apply search query
    if (searchQuery.trim()) {
      query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }

    // Apply filters
    if (filters.category_id) {
      query = query.eq('category_id', filters.category_id);
    }

    if (filters.min_price !== undefined) {
      query = query.gte('base_price', filters.min_price);
    }

    if (filters.max_price !== undefined) {
      query = query.lte('base_price', filters.max_price);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error searching products:', error);
      throw new Error(`Failed to search products: ${error.message}`);
    }

    const products = (data || []).map((product: any) => ({
      ...product,
      category: product.categories,
      images: product.product_images?.sort((a: any, b: any) => a.display_order - b.display_order) || [],
      variants: product.product_variants || []
    }));

    return {
      products: products as ProductWithDetails[],
      total: count || 0
    };
  } catch (error) {
    console.error('Error in searchProducts:', error);
    throw error;
  }
}