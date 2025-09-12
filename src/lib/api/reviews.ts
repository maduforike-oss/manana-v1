import { supabase } from '@/integrations/supabase/client';

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title?: string;
  comment?: string;
  review_text?: string;
  verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  user?: {
    username?: string;
    display_name?: string;
    avatar_url?: string;
  };
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

export interface CreateReviewParams {
  rating: number;
  title?: string;
  comment?: string;
  review_text?: string;
}

// List reviews for a product
export async function listReviews(
  productId: string,
  limit: number = 20,
  offset: number = 0
): Promise<ProductReview[]> {
  try {
    const { data, error } = await supabase
      .from('product_reviews')
      .select(`
        *,
        profiles (
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching reviews:', error);
      throw new Error(`Failed to fetch reviews: ${error.message}`);
    }

    return data?.map((review: any) => ({
      ...review,
      user: review.profiles ? {
        username: review.profiles.username,
        display_name: review.profiles.display_name,
        avatar_url: review.profiles.avatar_url
      } : undefined
    })) || [];
  } catch (error) {
    console.error('Error in listReviews:', error);
    throw error;
  }
}

// Add a new review
export async function addReview(
  productId: string,
  reviewData: CreateReviewParams
): Promise<ProductReview> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be logged in to create review');
    }

    // Check if user has already reviewed this product
    const { data: existingReview } = await supabase
      .from('product_reviews')
      .select('id')
      .eq('product_id', productId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingReview) {
      throw new Error('You have already reviewed this product');
    }

    // Check if user has purchased this product (for verified purchase flag)
    const { data: orderItem } = await supabase
      .from('order_items')
      .select(`
        id,
        orders!inner (
          user_id,
          status
        )
      `)
      .eq('product_id', productId)
      .eq('orders.user_id', user.id)
      .in('orders.status', ['processing', 'shipped', 'delivered'])
      .maybeSingle();

    const verifiedPurchase = !!orderItem;

    const { data, error } = await supabase
      .from('product_reviews')
      .insert({
        product_id: productId,
        user_id: user.id,
        rating: reviewData.rating,
        title: reviewData.title,
        comment: reviewData.comment,
        review_text: reviewData.review_text,
        verified_purchase: verifiedPurchase
      })
      .select(`
        *,
        profiles (
          username,
          display_name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Error creating review:', error);
      throw new Error(`Failed to create review: ${error.message}`);
    }

    return {
      ...(data as any),
      user: (data as any)?.profiles ? {
        username: (data as any).profiles.username,
        display_name: (data as any).profiles.display_name,
        avatar_url: (data as any).profiles.avatar_url
      } : undefined
    };
  } catch (error) {
    console.error('Error in addReview:', error);
    throw error;
  }
}

// Update a review
export async function updateReview(
  reviewId: string,
  reviewData: Partial<CreateReviewParams>
): Promise<ProductReview> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be logged in to update review');
    }

    const { data, error } = await supabase
      .from('product_reviews')
      .update({
        ...reviewData,
        updated_at: new Date().toISOString()
      })
      .eq('id', reviewId)
      .eq('user_id', user.id)
      .select(`
        *,
        profiles (
          username,
          display_name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Error updating review:', error);
      throw new Error(`Failed to update review: ${error.message}`);
    }

    return {
      ...(data as any),
      user: (data as any)?.profiles ? {
        username: (data as any).profiles.username,
        display_name: (data as any).profiles.display_name,
        avatar_url: (data as any).profiles.avatar_url
      } : undefined
    };
  } catch (error) {
    console.error('Error in updateReview:', error);
    throw error;
  }
}

// Delete a review
export async function deleteReview(reviewId: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be logged in to delete review');
    }

    const { error } = await supabase
      .from('product_reviews')
      .delete()
      .eq('id', reviewId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting review:', error);
      throw new Error(`Failed to delete review: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in deleteReview:', error);
    throw error;
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
      throw new Error(`Failed to fetch review summary: ${error.message}`);
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
    console.error('Error in getReviewSummary:', error);
    throw error;
  }
}

// Mark review as helpful
export async function markReviewHelpful(reviewId: string): Promise<void> {
  try {
    // First get the current helpful count
    const { data: review, error: fetchError } = await supabase
      .from('product_reviews')
      .select('helpful_count')
      .eq('id', reviewId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch review: ${fetchError.message}`);
    }

    // Increment the count
    const { error } = await supabase
      .from('product_reviews')
      .update({ helpful_count: review.helpful_count + 1 })
      .eq('id', reviewId);

    if (error) {
      console.error('Error marking review helpful:', error);
      throw new Error(`Failed to mark review helpful: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in markReviewHelpful:', error);
    throw error;
  }
}

// Get user's review for a product
export async function getUserReview(productId: string): Promise<ProductReview | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('product_reviews')
      .select(`
        *,
        profiles (
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('product_id', productId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user review:', error);
      throw new Error(`Failed to fetch user review: ${error.message}`);
    }

    if (!data) return null;

    return {
      ...(data as any),
      user: (data as any)?.profiles ? {
        username: (data as any).profiles.username,
        display_name: (data as any).profiles.display_name,
        avatar_url: (data as any).profiles.avatar_url
      } : undefined
    };
  } catch (error) {
    console.error('Error in getUserReview:', error);
    throw error;
  }
}

// Check if user has reviewed a product
export async function hasUserReviewed(productId: string): Promise<boolean> {
  try {
    const review = await getUserReview(productId);
    return !!review;
  } catch (error) {
    console.error('Error in hasUserReviewed:', error);
    return false;
  }
}