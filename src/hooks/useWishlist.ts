import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import * as wishlistApi from '@/lib/api/wishlist';

export function useIsWished(productId: string) {
  return useQuery({
    queryKey: ['wishlist', 'check', productId],
    queryFn: () => wishlistApi.isWished(productId),
    enabled: !!productId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useMyWishlist(params?: { 
  limit?: number; 
  offset?: number; 
  sort?: string;
}) {
  return useQuery({
    queryKey: ['wishlist', 'mine', params],
    queryFn: () => wishlistApi.listMine(params?.limit, params?.offset),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useToggleWish(productId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: () => wishlistApi.toggle(productId),
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['wishlist', 'check', productId] });
      await queryClient.cancelQueries({ queryKey: ['wishlist', 'mine'] });
      
      // Snapshot previous value
      const previousIsWished = queryClient.getQueryData<boolean>(['wishlist', 'check', productId]);
      
      // Optimistically update
      queryClient.setQueryData(['wishlist', 'check', productId], (old: boolean | undefined) => !old);
      
      // Optimistically update wishlist items
      queryClient.setQueriesData(
        { queryKey: ['wishlist', 'mine'] },
        (old: any) => {
          if (!old) return old;
          
          const isCurrentlyWished = previousIsWished;
          if (isCurrentlyWished) {
            // Remove from list
            return {
              ...old,
              items: old.items?.filter((item: any) => item.product_id !== productId) || [],
              total: Math.max(0, (old.total || 0) - 1)
            };
          } else {
            // Would need product data to add to list - this will be handled by refetch
            return old;
          }
        }
      );
      
      return { previousIsWished };
    },
    onError: (err, variables, context) => {
      // Rollback optimistic updates
      if (context?.previousIsWished !== undefined) {
        queryClient.setQueryData(['wishlist', 'check', productId], context.previousIsWished);
      }
      
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      
      toast({
        title: "Error",
        description: "Failed to update wishlist. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: (isNowWished) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      
      toast({
        title: isNowWished ? "Saved to wishlist" : "Removed from wishlist",
        description: isNowWished 
          ? "You can find this item in your Saved tab" 
          : "Item removed from your wishlist",
      });
    },
  });
}

export function useWishlistCount() {
  return useQuery({
    queryKey: ['wishlist', 'count'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { count } = await supabase
        .from('wishlists')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      return count || 0;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Helper hook for authenticated wishlist operations
export function useAuthenticatedWishlist() {
  const [user, setUser] = useState<any>(null);
  
  const checkAuth = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    return !!user;
  }, []);
  
  const requireAuth = useCallback(() => {
    if (!user) {
      // This could trigger a sign-in modal/redirect
      return false;
    }
    return true;
  }, [user]);
  
  return {
    user,
    checkAuth,
    requireAuth,
    isAuthenticated: !!user
  };
}