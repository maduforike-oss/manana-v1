import { supabase } from '@/integrations/supabase/client';

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title?: string;
  comment?: string;
  verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_avatar?: string;
}

export interface ReviewSummary {
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

// Get reviews for a product
export async function getProductReviews(productId: string, limit: number = 20, offset: number = 0): Promise<ProductReview[]> {
  try {
    const { data, error } = await supabase
      .from('product_reviews')
      .select(`
        *,
        profiles (
          display_name,
          avatar_url
        )
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }

    return data?.map((review: any) => ({
      ...review,
      user_name: review.profiles?.display_name || 'Anonymous',
      user_avatar: review.profiles?.avatar_url
    })) || [];
  } catch (error) {
    console.error('Error getting product reviews:', error);
    return [];
  }
}

// Get review summary for a product
export async function getReviewSummary(productId: string): Promise<ReviewSummary> {
  try {
    const { data, error } = await supabase
      .from('product_reviews')
      .select('rating')
      .eq('product_id', productId);

    if (error) {
      console.error('Error fetching review summary:', error);
      return {
        average_rating: 0,
        total_reviews: 0,
        rating_distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }

    const reviews = data || [];
    const totalReviews = reviews.length;

    if (totalReviews === 0) {
      return {
        average_rating: 0,
        total_reviews: 0,
        rating_distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }

    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
    
    const ratingDistribution = reviews.reduce((dist, review) => {
      dist[review.rating as keyof typeof dist]++;
      return dist;
    }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });

    return {
      average_rating: Math.round(averageRating * 10) / 10,
      total_reviews: totalReviews,
      rating_distribution: ratingDistribution
    };
  } catch (error) {
    console.error('Error getting review summary:', error);
    return {
      average_rating: 0,
      total_reviews: 0,
      rating_distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };
  }
}

// Create a new review
export async function createReview(
  productId: string,
  rating: number,
  title?: string,
  comment?: string
): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be logged in to create review');
    }

    // Check if user has purchased this product
    const { data: orderItem } = await supabase
      .from('order_items')
      .select(`
        id,
        orders!inner (
          user_id,
          payment_status
        )
      `)
      .eq('product_id', productId)
      .eq('orders.user_id', user.id)
      .eq('orders.payment_status', 'paid')
      .maybeSingle();

    const verifiedPurchase = !!orderItem;

    const { error } = await supabase
      .from('product_reviews')
      .insert({
        product_id: productId,
        user_id: user.id,
        rating,
        title,
        comment,
        verified_purchase: verifiedPurchase
      });

    if (error) {
      // Check if it's a duplicate error (user already reviewed this product)
      if (error.code === '23505') {
        throw new Error('You have already reviewed this product');
      }
      console.error('Error creating review:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
}

// Update a review
export async function updateReview(
  reviewId: string,
  rating: number,
  title?: string,
  comment?: string
): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('product_reviews')
      .update({
        rating,
        title,
        comment
      })
      .eq('id', reviewId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating review:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating review:', error);
    return false;
  }
}

// Delete a review
export async function deleteReview(reviewId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('product_reviews')
      .delete()
      .eq('id', reviewId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting review:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting review:', error);
    return false;
  }
}

// Check if user has reviewed a product
export async function hasUserReviewed(productId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('product_reviews')
      .select('id')
      .eq('product_id', productId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error checking user review:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking user review:', error);
    return false;
  }
}

// Get user's review for a product
export async function getUserReview(productId: string): Promise<ProductReview | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user review:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting user review:', error);
    return null;
  }
}

// Mark review as helpful
export async function markReviewHelpful(reviewId: string): Promise<boolean> {
  try {
    // First get the current helpful count
    const { data: review } = await supabase
      .from('product_reviews')
      .select('helpful_count')
      .eq('id', reviewId)
      .single();

    if (!review) return false;

    // Increment the count
    const { error } = await supabase
      .from('product_reviews')
      .update({ helpful_count: review.helpful_count + 1 })
      .eq('id', reviewId);

    if (error) {
      console.error('Error marking review helpful:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error marking review helpful:', error);
    return false;
  }
}

// Get recommendations based on highly rated products
export async function getRecommendedProducts(productId: string, limit: number = 6): Promise<string[]> {
  try {
    // Get products with high ratings (4+ stars) that are similar to current product
    // This is a simplified recommendation based on ratings
    const { data, error } = await supabase
      .from('product_reviews')
      .select('product_id')
      .gte('rating', 4)
      .neq('product_id', productId)
      .limit(limit * 2); // Get more to account for duplicates

    if (error) {
      console.error('Error fetching recommendations:', error);
      return [];
    }

    // Get unique product IDs and limit results
    const productIds = [...new Set(data?.map(review => review.product_id) || [])];
    return productIds.slice(0, limit);
  } catch (error) {
    console.error('Error getting recommended products:', error);
    return [];
  }
}