/**
 * Market API - typed wrappers for the marketplace RPC functions
 */

import { supabase } from '@/integrations/supabase/client';

export interface MarketCard {
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

export interface MarketFilters {
  min_price_cents?: number;
  max_price_cents?: number;
  min_rating?: number;
  has_badge_new?: boolean;
  has_badge_trending?: boolean;
  has_badge_low_stock?: boolean;
}

/**
 * List marketplace cards with tab filtering, search, and pagination
 */
export async function listMarketCards({
  tab = 'all',
  q,
  filters = {},
  limit = 24,
  offset = 0,
}: {
  tab?: string;
  q?: string;
  filters?: MarketFilters;
  limit?: number;
  offset?: number;
} = {}) {
  try {
    const { data, error } = await supabase.rpc('list_market_cards' as any, {
      tab,
      q: q || null,
      filters: filters as any,
      lim: limit,
      off: offset,
    });

    if (error) {
      console.error('Error listing market cards:', error);
      throw error;
    }

    return (data || []) as MarketCard[];
  } catch (error) {
    console.error('RPC not available yet, returning empty array:', error);
    return [];
  }
}

/**
 * Get product detail by ID
 */
export async function getProductDetail(productId: string) {
  try {
    const { data, error } = await supabase.rpc('get_product_detail' as any, {
      pid: productId,
    });

    if (error) {
      console.error('Error getting product detail:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('RPC not available yet:', error);
    return null;
  }
}

/**
 * Toggle favorite status for a product
 */
export async function toggleFavorite(productId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('toggle_favorite' as any, {
      pid: productId,
    });

    if (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }

    return data || false;
  } catch (error) {
    console.error('RPC not available yet:', error);
    return false;
  }
}

/**
 * Mark a product as viewed (analytics)
 */
export async function markProductView(productId: string): Promise<void> {
  try {
    const { error } = await supabase.rpc('mark_product_view' as any, {
      pid: productId,
    });

    if (error) {
      console.error('Error marking product view:', error);
      throw error;
    }
  } catch (error) {
    console.error('RPC not available yet:', error);
  }
}

/**
 * Add a review for a product
 */
export async function addReview(
  productId: string,
  rating: number,
  body?: string
): Promise<void> {
  try {
    const { error } = await supabase.rpc('add_review' as any, {
      pid: productId,
      rating,
      body: body || null,
    });

    if (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  } catch (error) {
    console.error('RPC not available yet:', error);
  }
}

/**
 * List reviews for a product
 */
export async function listReviews(
  productId: string,
  limit = 20,
  offset = 0
) {
  try {
    const { data, error } = await supabase.rpc('list_reviews' as any, {
      pid: productId,
      lim: limit,
      off: offset,
    });

    if (error) {
      console.error('Error listing reviews:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('RPC not available yet:', error);
    return [];
  }
}

/**
 * Check if current user has favorited a product
 */
export async function isFavorited(productId: string): Promise<boolean> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return false;

  const { data, error } = await supabase
    .from('favorites')
    .select('product_id')
    .eq('user_id', user.user.id)
    .eq('product_id', productId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking favorite status:', error);
    return false;
  }

  return !!data;
}