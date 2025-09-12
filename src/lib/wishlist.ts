import { supabase } from '@/integrations/supabase/client';

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  added_at: string;
  product_name?: string;
  product_image?: string;
  product_price?: number;
}

// Get user's wishlist
export async function getWishlist(): Promise<WishlistItem[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('wishlists')
      .select('*')
      .eq('user_id', user.id)
      .order('added_at', { ascending: false });

    if (error) {
      console.error('Error fetching wishlist:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting wishlist:', error);
    return [];
  }
}

// Add item to wishlist
export async function addToWishlist(productId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be logged in to add to wishlist');
    }

    const { error } = await supabase
      .from('wishlists')
      .insert({
        user_id: user.id,
        product_id: productId
      });

    if (error) {
      // Check if it's a duplicate error
      if (error.code === '23505') {
        return true; // Item already in wishlist
      }
      console.error('Error adding to wishlist:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return false;
  }
}

// Remove item from wishlist
export async function removeFromWishlist(productId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);

    if (error) {
      console.error('Error removing from wishlist:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return false;
  }
}

// Check if item is in wishlist
export async function isInWishlist(productId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .maybeSingle();

    if (error) {
      console.error('Error checking wishlist:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking wishlist:', error);
    return false;
  }
}

// Toggle wishlist item
export async function toggleWishlist(productId: string): Promise<boolean> {
  try {
    const inWishlist = await isInWishlist(productId);
    
    if (inWishlist) {
      return await removeFromWishlist(productId);
    } else {
      return await addToWishlist(productId);
    }
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    return false;
  }
}

// Get wishlist count
export async function getWishlistCount(): Promise<number> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const { count, error } = await supabase
      .from('wishlists')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error getting wishlist count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error getting wishlist count:', error);
    return 0;
  }
}

// Clear entire wishlist
export async function clearWishlist(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Error clearing wishlist:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    return false;
  }
}

// Move wishlist item to cart
export async function moveToCart(productId: string, variantId: string, quantity: number = 1): Promise<boolean> {
  try {
    const { addToCart } = await import('./cart');
    
    // Add to cart
    const success = await addToCart(variantId, quantity);
    
    if (success) {
      // Remove from wishlist
      await removeFromWishlist(productId);
    }
    
    return success;
  } catch (error) {
    console.error('Error moving to cart:', error);
    return false;
  }
}