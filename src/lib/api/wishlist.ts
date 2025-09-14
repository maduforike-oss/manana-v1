import { supabase } from '@/integrations/supabase/client';

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  added_at: string;
  created_at: string;
  product?: {
    id: string;
    name: string;
    slug?: string;
    base_price: number;
    status: string;
    images?: Array<{
      url: string;
      alt_text?: string;
    }>;
  };
}

// Check if a product is in user's wishlist
export async function isWished(productId: string): Promise<boolean> {
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
    console.error('Error in isWished:', error);
    return false;
  }
}

// Add product to wishlist
export async function add(productId: string): Promise<void> {
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

    if (error && error.code !== '23505') {
      // Ignore duplicate errors (item already in wishlist)
      console.error('Error adding to wishlist:', error);
      throw new Error(`Failed to add to wishlist: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in add:', error);
    throw error;
  }
}

// Remove product from wishlist
export async function remove(productId: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be logged in to remove from wishlist');
    }

    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);

    if (error) {
      console.error('Error removing from wishlist:', error);
      throw new Error(`Failed to remove from wishlist: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in remove:', error);
    throw error;
  }
}

// Toggle product in wishlist
export async function toggle(productId: string): Promise<boolean> {
  try {
    const wished = await isWished(productId);
    
    if (wished) {
      await remove(productId);
      return false;
    } else {
      await add(productId);
      return true;
    }
  } catch (error) {
    console.error('Error in toggle:', error);
    throw error;
  }
}

// List user's wishlist items with product details
export async function listMine(limit: number = 24, offset: number = 0): Promise<{ items: any[]; total: number }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { items: [], total: 0 };

    // Get total count
    const { count } = await supabase
      .from('wishlists')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Get paginated items with product details
    const { data, error } = await supabase
      .from('wishlists')
      .select(`
        *,
        products (
          id,
          name,
          slug,
          description,
          base_price,
          status,
          created_at,
          owner_id,
          product_images (
            url,
            alt_text,
            display_order
          )
        )
      `)
      .eq('user_id', user.id)
      .order('added_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching wishlist:', error);
      throw new Error(`Failed to fetch wishlist: ${error.message}`);
    }

    // Transform to match expected product format
    const items = data?.map((item: any) => {
      const product = item.products;
      return {
        id: item.product_id,
        name: product?.name || 'Unknown Product',
        slug: product?.slug,
        description: product?.description,
        base_price: product?.base_price || 0,
        price: product?.base_price || 0,
        status: product?.status,
        created_at: product?.created_at,
        owner_id: product?.owner_id,
        images: product?.product_images?.sort((a: any, b: any) => 
          (a.display_order || 0) - (b.display_order || 0)
        ).map((img: any) => ({ url: img.url, alt_text: img.alt_text })) || [],
        wishlist_added_at: item.added_at,
        tags: [], // TODO: Add tags from products table if needed
        rating: 4.5, // Mock rating for now
        views: Math.floor(Math.random() * 1000) + 100,
        likes: Math.floor(Math.random() * 50) + 10,
        featured: false,
        creator: 'Creator', // TODO: Join with profiles table
        avatar: 'C'
      };
    }) || [];

    return { 
      items, 
      total: count || 0 
    };
  } catch (error) {
    console.error('Error in listMine:', error);
    throw error;
  }
}

// Get wishlist count for user
export async function getCount(): Promise<number> {
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
    console.error('Error in getCount:', error);
    return 0;
  }
}

// Clear entire wishlist
export async function clear(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be logged in to clear wishlist');
    }

    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Error clearing wishlist:', error);
      throw new Error(`Failed to clear wishlist: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in clear:', error);
    throw error;
  }
}

// Move wishlist item to cart
export async function moveToCart(productId: string, variantId: string, quantity: number = 1): Promise<void> {
  try {
    // Import cart functions dynamically to avoid circular dependencies
    const { addToCart } = await import('../cart');
    
    // Add to cart
    const success = await addToCart(variantId, quantity);
    
    if (success) {
      // Remove from wishlist
      await remove(productId);
    } else {
      throw new Error('Failed to add item to cart');
    }
  } catch (error) {
    console.error('Error in moveToCart:', error);
    throw error;
  }
}