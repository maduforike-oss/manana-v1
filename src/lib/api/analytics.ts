import { supabase } from '@/integrations/supabase/client';

export interface ProductAnalytics {
  id: string;
  product_id: string;
  views: number;
  clicks: number;
  conversions: number;
  day: string;
  created_at: string;
}

export interface SearchAnalytics {
  id: string;
  query: string;
  results_count: number;
  user_id?: string;
  created_at: string;
}

export interface AnalyticsSummary {
  total_views: number;
  total_clicks: number;
  total_conversions: number;
  conversion_rate: number;
  click_through_rate: number;
}

// Track product view
export async function trackProductView(productId: string): Promise<void> {
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
      const { error } = await supabase
        .from('product_analytics')
        .update({ views: existing.views + 1 })
        .eq('id', existing.id);

      if (error) {
        console.error('Error updating product view:', error);
        throw new Error(`Failed to update product view: ${error.message}`);
      }
    } else {
      // Create new record
      const { error } = await supabase
        .from('product_analytics')
        .insert({
          product_id: productId,
          day: today,
          views: 1,
          clicks: 0,
          conversions: 0
        });

      if (error) {
        console.error('Error creating product view:', error);
        throw new Error(`Failed to create product view: ${error.message}`);
      }
    }
  } catch (error) {
    console.error('Error in trackProductView:', error);
    // Don't throw error for analytics - it should be non-blocking
  }
}

// Track product click
export async function trackProductClick(productId: string): Promise<void> {
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
      const { error } = await supabase
        .from('product_analytics')
        .update({ clicks: existing.clicks + 1 })
        .eq('id', existing.id);

      if (error) {
        console.error('Error updating product click:', error);
        throw new Error(`Failed to update product click: ${error.message}`);
      }
    } else {
      // Create new record
      const { error } = await supabase
        .from('product_analytics')
        .insert({
          product_id: productId,
          day: today,
          views: 0,
          clicks: 1,
          conversions: 0
        });

      if (error) {
        console.error('Error creating product click:', error);
        throw new Error(`Failed to create product click: ${error.message}`);
      }
    }
  } catch (error) {
    console.error('Error in trackProductClick:', error);
    // Don't throw error for analytics - it should be non-blocking
  }
}

// Track product conversion (purchase)
export async function trackProductConversion(productId: string): Promise<void> {
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
      const { error } = await supabase
        .from('product_analytics')
        .update({ conversions: existing.conversions + 1 })
        .eq('id', existing.id);

      if (error) {
        console.error('Error updating product conversion:', error);
        throw new Error(`Failed to update product conversion: ${error.message}`);
      }
    } else {
      // Create new record
      const { error } = await supabase
        .from('product_analytics')
        .insert({
          product_id: productId,
          day: today,
          views: 0,
          clicks: 0,
          conversions: 1
        });

      if (error) {
        console.error('Error creating product conversion:', error);
        throw new Error(`Failed to create product conversion: ${error.message}`);
      }
    }
  } catch (error) {
    console.error('Error in trackProductConversion:', error);
    // Don't throw error for analytics - it should be non-blocking
  }
}

// Track search query
export async function trackSearch(query: string, resultsCount: number, userId?: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('search_analytics')
      .insert({
        query: query.toLowerCase().trim(),
        results_count: resultsCount,
        user_id: userId || user?.id
      });

    if (error) {
      console.error('Error tracking search:', error);
      throw new Error(`Failed to track search: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in trackSearch:', error);
    // Don't throw error for analytics - it should be non-blocking
  }
}

// Get product analytics for a specific product
export async function getProductAnalytics(
  productId: string,
  startDate?: string,
  endDate?: string
): Promise<ProductAnalytics[]> {
  try {
    let query = supabase
      .from('product_analytics')
      .select('*')
      .eq('product_id', productId)
      .order('day', { ascending: false });

    if (startDate) {
      query = query.gte('day', startDate);
    }

    if (endDate) {
      query = query.lte('day', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching product analytics:', error);
      throw new Error(`Failed to fetch product analytics: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error in getProductAnalytics:', error);
    throw error;
  }
}

// Get analytics summary for a product
export async function getProductAnalyticsSummary(
  productId: string,
  days: number = 30
): Promise<AnalyticsSummary> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('product_analytics')
      .select('views, clicks, conversions')
      .eq('product_id', productId)
      .gte('day', startDateStr);

    if (error) {
      console.error('Error fetching analytics summary:', error);
      throw new Error(`Failed to fetch analytics summary: ${error.message}`);
    }

    const summary = (data || []).reduce(
      (acc, curr) => ({
        total_views: acc.total_views + curr.views,
        total_clicks: acc.total_clicks + curr.clicks,
        total_conversions: acc.total_conversions + curr.conversions
      }),
      { total_views: 0, total_clicks: 0, total_conversions: 0 }
    );

    return {
      ...summary,
      click_through_rate: summary.total_views > 0 ? (summary.total_clicks / summary.total_views) * 100 : 0,
      conversion_rate: summary.total_clicks > 0 ? (summary.total_conversions / summary.total_clicks) * 100 : 0
    };
  } catch (error) {
    console.error('Error in getProductAnalyticsSummary:', error);
    throw error;
  }
}

// Get popular search queries
export async function getPopularSearches(
  limit: number = 10,
  days: number = 30
): Promise<Array<{ query: string; count: number; avg_results: number }>> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('search_analytics')
      .select('query, results_count')
      .gte('created_at', startDateStr)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching search analytics:', error);
      throw new Error(`Failed to fetch search analytics: ${error.message}`);
    }

    // Aggregate by query
    const queryStats = (data || []).reduce((acc: any, curr) => {
      if (!acc[curr.query]) {
        acc[curr.query] = { count: 0, totalResults: 0 };
      }
      acc[curr.query].count += 1;
      acc[curr.query].totalResults += curr.results_count;
      return acc;
    }, {});

    // Convert to array and sort by count
    return Object.entries(queryStats)
      .map(([query, stats]: [string, any]) => ({
        query,
        count: stats.count,
        avg_results: stats.totalResults / stats.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  } catch (error) {
    console.error('Error in getPopularSearches:', error);
    throw error;
  }
}

// Get trending products based on analytics
export async function getTrendingProducts(
  limit: number = 10,
  days: number = 7
): Promise<Array<{ product_id: string; score: number; views: number; clicks: number }>> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('product_analytics')
      .select('product_id, views, clicks, conversions')
      .gte('day', startDateStr);

    if (error) {
      console.error('Error fetching trending products:', error);
      throw new Error(`Failed to fetch trending products: ${error.message}`);
    }

    // Aggregate by product and calculate trending score
    const productStats = (data || []).reduce((acc: any, curr) => {
      if (!acc[curr.product_id]) {
        acc[curr.product_id] = { views: 0, clicks: 0, conversions: 0 };
      }
      acc[curr.product_id].views += curr.views;
      acc[curr.product_id].clicks += curr.clicks;
      acc[curr.product_id].conversions += curr.conversions;
      return acc;
    }, {});

    // Convert to array, calculate score, and sort
    return Object.entries(productStats)
      .map(([productId, stats]: [string, any]) => ({
        product_id: productId,
        views: stats.views,
        clicks: stats.clicks,
        score: stats.views + (stats.clicks * 2) + (stats.conversions * 5) // Weighted score
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  } catch (error) {
    console.error('Error in getTrendingProducts:', error);
    throw error;
  }
}