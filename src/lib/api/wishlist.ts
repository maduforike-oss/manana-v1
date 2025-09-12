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
export async function add(productId: string): Promise<WishlistItem> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be logged in to add to wishlist');
    }

    // Check if already in wishlist
    const alreadyWished = await isWished(productId);
    if (alreadyWished) {
      throw new Error('Product is already in wishlist');
    }

    const { data, error } = await supabase
      .from('wishlists')
      .insert({
        user_id: user.id,
        product_id: productId
      })
      .select(`
        *,
        products (
          id,
          name,
          slug,
          base_price,
          status,
          product_images (
            url,
            alt_text
          )
        )
      `)
      .single();

    if (error) {
      console.error('Error adding to wishlist:', error);
      throw new Error(`Failed to add to wishlist: ${error.message}`);
    }

    return {
      id: (data as any).id,
      user_id: (data as any).user_id,
      product_id: (data as any).product_id,
      added_at: (data as any).added_at,
      created_at: ((data as any).added_at ?? new Date().toISOString()),
      product: (data as any).products ? {
        id: (data as any).products.id,
        name: (data as any).products.name,
        slug: (data as any).products.slug,
        base_price: (data as any).products.base_price,
        status: (data as any).products.status,
        images: ((data as any).products.product_images || []).map((img: any) => ({
          url: img.url,
          alt_text: img.alt_text
        }))
      } : undefined
    };
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

// List user's wishlist
export async function listMine(
  limit: number = 50,
  offset: number = 0
): Promise<WishlistItem[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('wishlists')
      .select(`
        *,
        products (
          id,
          name,
          slug,
          base_price,
          status,
          product_images (
            url,
            alt_text,
            display_order
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching wishlist:', error);
      throw new Error(`Failed to fetch wishlist: ${error.message}`);
    }

    return data?.map((item: any) => ({
      id: item.id,
      user_id: item.user_id,
      product_id: item.product_id,
      added_at: item.added_at,
      created_at: item.added_at ?? new Date().toISOString(),
      product: item.products ? {
        id: item.products.id,
        name: item.products.name,
        slug: item.products.slug,
        base_price: item.products.base_price,
        status: item.products.status,
        images: item.products.product_images
          ?.sort((a: any, b: any) => a.display_order - b.display_order)
          ?.map((img: any) => ({
            url: img.url,
            alt_text: img.alt_text
          })) || []
      } : undefined
    })) || [];
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