/**
 * Complete Product Management API
 * Handles CRUD operations, image management, and variant management
 */

import { supabase } from '@/integrations/supabase/client';

// Extended interfaces with creator information
export interface EnhancedMarketCard {
  product_id: string;
  slug?: string;
  title: string;
  description?: string;
  price_cents: number;
  currency: string;
  primary_image?: string;
  avg_rating: number;
  reviews_count: number;
  views: number;
  favorites: number;
  trend_score: number;
  created_at: string;
  status: string;
  has_badge_new?: boolean;
  has_badge_trending?: boolean;
  has_badge_low_stock?: boolean;
  // Creator information
  creator_id?: string;
  creator_username?: string;
  creator_display_name?: string;
  creator_avatar_url?: string;
}

export interface DetailedProduct {
  product_id: string;
  slug?: string;
  name: string;
  description?: string;
  base_price: number;
  status: string;
  created_at: string;
  updated_at: string;
  // Creator info
  creator_id?: string;
  creator_username?: string;
  creator_display_name?: string;
  creator_avatar_url?: string;
  creator_bio?: string;
  // Category info
  category_id?: string;
  category_name?: string;
  category_slug?: string;
  // Analytics
  total_views: number;
  total_favorites: number;
  avg_rating: number;
  total_reviews: number;
  // Structured data
  images: ProductImageView[];
  variants: ProductVariantView[];
  recent_reviews: ProductReview[];
}

export interface ProductImageView {
  id: string;
  url: string;
  alt_text?: string;
  display_order: number;
  variant_id?: string;
  view_type?: 'front' | 'back' | 'side' | 'detail';
  color_variant?: string;
}

export interface ProductVariantView {
  id: string;
  sku?: string;
  price: number;
  size?: string;
  color?: string;
  stock_quantity: number;
  image_url?: string;
}

export interface ProductReview {
  id: string;
  rating: number;
  title?: string;
  comment?: string;
  created_at: string;
  user_display_name?: string;
  user_avatar_url?: string;
}

export interface CreateProductPayload {
  name: string;
  slug: string;
  description?: string;
  base_price: number;
  category_id?: string;
  variants?: Omit<ProductVariantView, 'id'>[];
  images?: Omit<ProductImageView, 'id'>[];
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {
  id: string;
}

// Enhanced marketplace listing with creator info
export async function listEnhancedMarketCards({
  tab = 'all',
  q,
  filters = {},
  limit = 24,
  offset = 0,
}: {
  tab?: string;
  q?: string;
  filters?: any;
  limit?: number;
  offset?: number;
} = {}): Promise<EnhancedMarketCard[]> {
  try {
    const { data, error } = await supabase.rpc('list_market_cards', {
      tab,
      q: q || null,
      filters: filters as any,
      lim: limit,
      off: offset,
    });

    if (error) {
      console.error('Error listing enhanced market cards:', error);
      throw error;
    }

    return (data || []) as EnhancedMarketCard[];
  } catch (error) {
    console.error('RPC not available yet:', error);
    return [];
  }
}

// Get detailed product information
export async function getDetailedProduct(productId: string): Promise<DetailedProduct | null> {
  try {
    const { data, error } = await supabase.rpc('get_product_detail', {
      pid: productId,
    });

    if (error) {
      console.error('Error getting detailed product:', error);
      throw error;
    }

    if (!data || (Array.isArray(data) && data.length === 0)) {
      return null;
    }

    const product = Array.isArray(data) ? data[0] : data;
    
    return {
      ...product,
      images: Array.isArray(product.images) ? (product.images as any[]).filter(Boolean) as ProductImageView[] : [],
      variants: Array.isArray(product.variants) ? (product.variants as any[]).filter(Boolean) as ProductVariantView[] : [],
      recent_reviews: Array.isArray(product.recent_reviews) ? (product.recent_reviews as any[]).filter(Boolean) as ProductReview[] : [],
    } as DetailedProduct;
  } catch (error) {
    console.error('Error in getDetailedProduct:', error);
    return null;
  }
}

// Get product images with view types (front/back/side)
export async function getProductImagesWithViews(productId: string): Promise<ProductImageView[]> {
  try {
    const { data, error } = await supabase.rpc('get_product_images_with_views', {
      pid: productId,
    });

    if (error) {
      console.error('Error getting product images with views:', error);
      throw error;
    }

    return (data || []).map((img: any) => ({
      id: img.image_id,
      url: img.url,
      alt_text: img.alt_text,
      display_order: img.display_order,
      variant_id: img.variant_id,
      view_type: img.view_type,
      color_variant: img.color_variant,
    })) as ProductImageView[];
  } catch (error) {
    console.error('Error in getProductImagesWithViews:', error);
    return [];
  }
}

// Create product with variants and images
export async function createProductWithVariants(payload: CreateProductPayload): Promise<string> {
  try {
    const { data, error } = await supabase.rpc('create_product_with_variants', {
      product_name: payload.name,
      product_slug: payload.slug,
      product_description: payload.description,
      base_price_val: payload.base_price,
      category_id_val: payload.category_id,
      variants_data: payload.variants || [],
      images_data: payload.images || [],
    });

    if (error) {
      console.error('Error creating product with variants:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createProductWithVariants:', error);
    throw error;
  }
}

// Update product basic information
export async function updateProduct(payload: UpdateProductPayload): Promise<void> {
  try {
    const updateData: any = {};
    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.slug !== undefined) updateData.slug = payload.slug;
    if (payload.description !== undefined) updateData.description = payload.description;
    if (payload.base_price !== undefined) updateData.base_price = payload.base_price;
    if (payload.category_id !== undefined) updateData.category_id = payload.category_id;

    const { error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', payload.id)
      .eq('owner_id', (await supabase.auth.getUser()).data.user?.id);

    if (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in updateProduct:', error);
    throw error;
  }
}

// Delete product
export async function deleteProduct(productId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)
      .eq('owner_id', (await supabase.auth.getUser()).data.user?.id);

    if (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    throw error;
  }
}

// Add product image
export async function addProductImage(
  productId: string,
  imageUrl: string,
  altText?: string,
  displayOrder?: number,
  variantId?: string
): Promise<void> {
  try {
    const { error } = await supabase.from('product_images').insert({
      product_id: productId,
      url: imageUrl,
      alt_text: altText,
      display_order: displayOrder || 0,
      variant_id: variantId,
    });

    if (error) {
      console.error('Error adding product image:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in addProductImage:', error);
    throw error;
  }
}

// Delete product image
export async function deleteProductImage(imageId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('product_images')
      .delete()
      .eq('id', imageId);

    if (error) {
      console.error('Error deleting product image:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteProductImage:', error);
    throw error;
  }
}

// Add product variant
export async function addProductVariant(
  productId: string,
  variant: Omit<ProductVariantView, 'id'>
): Promise<void> {
  try {
    const { error } = await supabase.from('product_variants').insert({
      product_id: productId,
      sku: variant.sku,
      price: variant.price,
      size: variant.size,
      color: variant.color,
      stock_quantity: variant.stock_quantity,
      image_url: variant.image_url,
    });

    if (error) {
      console.error('Error adding product variant:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in addProductVariant:', error);
    throw error;
  }
}

// Update product variant
export async function updateProductVariant(
  variantId: string,
  updates: Partial<Omit<ProductVariantView, 'id'>>
): Promise<void> {
  try {
    const { error } = await supabase
      .from('product_variants')
      .update(updates)
      .eq('id', variantId);

    if (error) {
      console.error('Error updating product variant:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in updateProductVariant:', error);
    throw error;
  }
}

// Delete product variant
export async function deleteProductVariant(variantId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('product_variants')
      .delete()
      .eq('id', variantId);

    if (error) {
      console.error('Error deleting product variant:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteProductVariant:', error);
    throw error;
  }
}

// Get user's products
export async function getUserProducts(userId?: string): Promise<EnhancedMarketCard[]> {
  try {
    const user = userId || (await supabase.auth.getUser()).data.user?.id;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        profiles!products_owner_id_fkey (
          id,
          username,
          display_name,
          avatar_url
        ),
        product_images (
          url,
          display_order
        )
      `)
      .eq('owner_id', user)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting user products:', error);
      throw error;
    }

    return (data || []).map((product: any) => ({
      product_id: product.id,
      slug: product.slug,
      title: product.name,
      description: product.description,
      price_cents: Math.round(product.base_price * 100),
      currency: 'USD',
      primary_image: product.product_images?.[0]?.url || '',
      avg_rating: 0,
      reviews_count: 0,
      views: 0,
      favorites: 0,
      trend_score: 0,
      created_at: product.created_at,
      status: product.status,
      creator_id: product.profiles?.id,
      creator_username: product.profiles?.username,
      creator_display_name: product.profiles?.display_name,
      creator_avatar_url: product.profiles?.avatar_url,
    })) as EnhancedMarketCard[];
  } catch (error) {
    console.error('Error in getUserProducts:', error);
    throw error;
  }
}