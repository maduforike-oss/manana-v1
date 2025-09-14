import React, { useState, useEffect } from 'react';
import { Heart, ShoppingBag, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductGridView } from './ProductGridView';
import { ProductListView } from './ProductListView';
import { ProductCardSkeleton } from './ProductCardSkeleton';
import { useMyWishlist } from '@/hooks/useWishlist';
import { supabase } from '@/integrations/supabase/client';

interface SavedTabContentProps {
  query: any;
  onSaveProduct: (productId: string) => void;
  onAddToCart: (product: any) => void;
  onShare: (product: any) => void;
  onQuickView: (product: any) => void;
}

export function SavedTabContent({
  query,
  onSaveProduct,
  onAddToCart,
  onShare,
  onQuickView,
}: SavedTabContentProps) {
  const [user, setUser] = useState<any>(null);
  
  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  const limit = 24;
  const offset = (query.page - 1) * limit;

  const { 
    data: wishlistData, 
    isLoading, 
    isError 
  } = useMyWishlist({ 
    limit, 
    offset,
    sort: query.sort 
  });

  // Not authenticated - show sign-in prompt
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Heart className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Save Your Favorites</h3>
          <p className="text-muted-foreground mb-6">
            Sign in to save designs and access them anywhere, anytime.
          </p>
          <Button 
            onClick={() => window.location.href = '/auth'}
            className="bg-primary hover:bg-primary/90"
          >
            Sign In to Save Designs
          </Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Error Loading Saved Items</h3>
          <p className="text-muted-foreground mb-4">
            We couldn't load your saved designs. Please try again.
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const products = wishlistData?.items || [];
  const totalResults = wishlistData?.total || 0;

  // Empty state
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Heart className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Nothing saved yet</h3>
          <p className="text-muted-foreground mb-6">
            Tap the heart on any design to keep it here and access it anytime.
          </p>
          <Button 
            onClick={() => {
              // Update query to switch to 'all' tab
              const url = new URL(window.location.href);
              url.searchParams.set('tab', 'all');
              window.history.pushState({}, '', url.toString());
              window.location.reload();
            }}
            variant="outline"
            className="mr-2"
          >
            <Search className="h-4 w-4 mr-2" />
            Discover Designs
          </Button>
        </div>
      </div>
    );
  }

  // Mark all products as saved since this is the saved tab
  const savedProductIds = new Set(products.map(p => p.id));

  // Render products based on view mode
  if (query.view === 'list') {
    return (
      <ProductListView
        products={products}
        isLoading={false}
        onSave={onSaveProduct}
        onAddToCart={onAddToCart}
        onQuickView={onQuickView}
        onShare={onShare}
        isSaved={(id) => savedProductIds.has(id)}
      />
    );
  }

  return (
    <ProductGridView
      products={products}
      isLoading={false}
      onSave={onSaveProduct}
      onAddToCart={onAddToCart}
      onQuickView={onQuickView}
      onShare={onShare}
      isSaved={(id) => savedProductIds.has(id)}
    />
  );
}