import { supabase } from '@/integrations/supabase/client';

export interface RecentlyViewed {
  id: string;
  user_id?: string;
  session_id?: string;
  product_id: string;
  viewed_at: string;
}

// Get session ID for guest users (same as cart system)
function getSessionId(): string {
  let sessionId = localStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('session_id', sessionId);
  }
  return sessionId;
}

// Track product view
export async function trackProductView(productId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Remove old entry if it exists
    let deleteQuery = supabase
      .from('recently_viewed')
      .delete()
      .eq('product_id', productId);

    if (user) {
      deleteQuery = deleteQuery.eq('user_id', user.id);
    } else {
      const sessionId = getSessionId();
      deleteQuery = deleteQuery.eq('session_id', sessionId);
    }

    await deleteQuery;

    // Add new entry
    const viewData = user 
      ? { user_id: user.id, product_id: productId }
      : { session_id: getSessionId(), product_id: productId };

    const { error } = await supabase
      .from('recently_viewed')
      .insert(viewData);

    if (error) {
      console.error('Error tracking product view:', error);
      return false;
    }

    // Keep only last 20 items
    await cleanupRecentlyViewed();

    return true;
  } catch (error) {
    console.error('Error tracking product view:', error);
    return false;
  }
}

// Get recently viewed products
export async function getRecentlyViewed(limit: number = 10): Promise<string[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    let query = supabase
      .from('recently_viewed')
      .select('product_id')
      .order('viewed_at', { ascending: false })
      .limit(limit);

    if (user) {
      query = query.eq('user_id', user.id);
    } else {
      const sessionId = getSessionId();
      query = query.eq('session_id', sessionId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching recently viewed:', error);
      return [];
    }

    return data?.map(item => item.product_id) || [];
  } catch (error) {
    console.error('Error getting recently viewed:', error);
    return [];
  }
}

// Clear recently viewed
export async function clearRecentlyViewed(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    let deleteQuery = supabase.from('recently_viewed').delete();

    if (user) {
      deleteQuery = deleteQuery.eq('user_id', user.id);
    } else {
      const sessionId = getSessionId();
      deleteQuery = deleteQuery.eq('session_id', sessionId);
    }

    const { error } = await deleteQuery;

    if (error) {
      console.error('Error clearing recently viewed:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error clearing recently viewed:', error);
    return false;
  }
}

// Cleanup old entries (keep only last 20)
async function cleanupRecentlyViewed(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    let query = supabase
      .from('recently_viewed')
      .select('id')
      .order('viewed_at', { ascending: false })
      .range(20, 1000); // Get items beyond the first 20

    if (user) {
      query = query.eq('user_id', user.id);
    } else {
      const sessionId = getSessionId();
      query = query.eq('session_id', sessionId);
    }

    const { data } = await query;

    if (data && data.length > 0) {
      const idsToDelete = data.map(item => item.id);
      await supabase
        .from('recently_viewed')
        .delete()
        .in('id', idsToDelete);
    }
  } catch (error) {
    console.error('Error cleaning up recently viewed:', error);
  }
}

// Merge guest recently viewed with user account on login
export async function mergeGuestRecentlyViewed(userId: string): Promise<boolean> {
  try {
    const sessionId = getSessionId();
    
    // Get guest recently viewed
    const { data: guestViewed } = await supabase
      .from('recently_viewed')
      .select('product_id, viewed_at')
      .eq('session_id', sessionId)
      .order('viewed_at', { ascending: false });

    if (!guestViewed?.length) return true;

    // Convert to user entries (avoiding duplicates)
    for (const item of guestViewed) {
      // Remove existing user entry for this product
      await supabase
        .from('recently_viewed')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', item.product_id);

      // Add as user entry
      await supabase
        .from('recently_viewed')
        .insert({
          user_id: userId,
          product_id: item.product_id,
          viewed_at: item.viewed_at
        });
    }

    // Delete guest entries
    await supabase
      .from('recently_viewed')
      .delete()
      .eq('session_id', sessionId);

    return true;
  } catch (error) {
    console.error('Error merging recently viewed:', error);
    return false;
  }
}
