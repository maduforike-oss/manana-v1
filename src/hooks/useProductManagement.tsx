/**
 * Hooks for comprehensive product management
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  listEnhancedMarketCards,
  getDetailedProduct,
  createProductWithVariants,
  updateProduct,
  deleteProduct,
  getUserProducts,
  addProductImage,
  deleteProductImage,
  addProductVariant,
  updateProductVariant,
  deleteProductVariant,
  getProductImagesWithViews,
  type EnhancedMarketCard,
  type DetailedProduct,
  type CreateProductPayload,
  type UpdateProductPayload,
} from '@/lib/api/product-management';

// Query keys
export const PRODUCT_QUERY_KEYS = {
  marketCards: 'market-cards',
  productDetail: 'product-detail',
  userProducts: 'user-products',
  productImages: 'product-images',
} as const;

/**
 * Hook for enhanced marketplace listing with creator info
 */
export function useEnhancedMarketplace({
  tab = 'all',
  searchQuery,
  filters = {},
  limit = 24,
  offset = 0,
}: {
  tab?: string;
  searchQuery?: string;
  filters?: any;
  limit?: number;
  offset?: number;
} = {}) {
  return useQuery({
    queryKey: [PRODUCT_QUERY_KEYS.marketCards, tab, searchQuery, filters, limit, offset],
    queryFn: () => listEnhancedMarketCards({
      tab,
      q: searchQuery,
      filters,
      limit,
      offset,
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for detailed product information
 */
export function useProductDetail(productId: string) {
  return useQuery({
    queryKey: [PRODUCT_QUERY_KEYS.productDetail, productId],
    queryFn: () => getDetailedProduct(productId),
    enabled: !!productId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for user's products
 */
export function useUserProducts(userId?: string) {
  return useQuery({
    queryKey: [PRODUCT_QUERY_KEYS.userProducts, userId],
    queryFn: () => getUserProducts(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for product images with view types
 */
export function useProductImages(productId: string) {
  return useQuery({
    queryKey: [PRODUCT_QUERY_KEYS.productImages, productId],
    queryFn: () => getProductImagesWithViews(productId),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for product CRUD operations
 */
export function useProductMutations() {
  const queryClient = useQueryClient();

  const createProduct = useMutation({
    mutationFn: createProductWithVariants,
    onSuccess: (productId) => {
      queryClient.invalidateQueries({ queryKey: [PRODUCT_QUERY_KEYS.marketCards] });
      queryClient.invalidateQueries({ queryKey: [PRODUCT_QUERY_KEYS.userProducts] });
      toast.success('Product created successfully!');
      return productId;
    },
    onError: (error) => {
      console.error('Error creating product:', error);
      toast.error('Failed to create product');
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [PRODUCT_QUERY_KEYS.marketCards] });
      queryClient.invalidateQueries({ queryKey: [PRODUCT_QUERY_KEYS.userProducts] });
      queryClient.invalidateQueries({ queryKey: [PRODUCT_QUERY_KEYS.productDetail, variables.id] });
      toast.success('Product updated successfully!');
    },
    onError: (error) => {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRODUCT_QUERY_KEYS.marketCards] });
      queryClient.invalidateQueries({ queryKey: [PRODUCT_QUERY_KEYS.userProducts] });
      toast.success('Product deleted successfully!');
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    },
  });

  return {
    createProduct,
    updateProduct: updateProductMutation,
    deleteProduct: deleteProductMutation,
  };
}

/**
 * Hook for image management operations
 */
export function useImageManagement() {
  const queryClient = useQueryClient();

  const addImage = useMutation({
    mutationFn: ({ 
      productId, 
      imageUrl, 
      altText, 
      displayOrder, 
      variantId 
    }: {
      productId: string;
      imageUrl: string;
      altText?: string;
      displayOrder?: number;
      variantId?: string;
    }) => addProductImage(productId, imageUrl, altText, displayOrder, variantId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [PRODUCT_QUERY_KEYS.productImages, variables.productId] });
      queryClient.invalidateQueries({ queryKey: [PRODUCT_QUERY_KEYS.productDetail, variables.productId] });
      toast.success('Image added successfully!');
    },
    onError: (error) => {
      console.error('Error adding image:', error);
      toast.error('Failed to add image');
    },
  });

  const deleteImage = useMutation({
    mutationFn: ({ imageId, productId }: { imageId: string; productId: string }) => {
      return deleteProductImage(imageId).then(() => productId);
    },
    onSuccess: (productId) => {
      queryClient.invalidateQueries({ queryKey: [PRODUCT_QUERY_KEYS.productImages, productId] });
      queryClient.invalidateQueries({ queryKey: [PRODUCT_QUERY_KEYS.productDetail, productId] });
      toast.success('Image deleted successfully!');
    },
    onError: (error) => {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    },
  });

  return {
    addImage,
    deleteImage,
  };
}

/**
 * Hook for variant management operations
 */
export function useVariantManagement() {
  const queryClient = useQueryClient();

  const addVariant = useMutation({
    mutationFn: ({ 
      productId, 
      variant 
    }: {
      productId: string;
      variant: any;
    }) => addProductVariant(productId, variant),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [PRODUCT_QUERY_KEYS.productDetail, variables.productId] });
      toast.success('Variant added successfully!');
    },
    onError: (error) => {
      console.error('Error adding variant:', error);
      toast.error('Failed to add variant');
    },
  });

  const updateVariant = useMutation({
    mutationFn: ({ 
      variantId, 
      updates,
      productId 
    }: {
      variantId: string;
      updates: any;
      productId: string;
    }) => updateProductVariant(variantId, updates).then(() => productId),
    onSuccess: (productId) => {
      queryClient.invalidateQueries({ queryKey: [PRODUCT_QUERY_KEYS.productDetail, productId] });
      toast.success('Variant updated successfully!');
    },
    onError: (error) => {
      console.error('Error updating variant:', error);
      toast.error('Failed to update variant');
    },
  });

  const deleteVariant = useMutation({
    mutationFn: ({ variantId, productId }: { variantId: string; productId: string }) => {
      return deleteProductVariant(variantId).then(() => productId);
    },
    onSuccess: (productId) => {
      queryClient.invalidateQueries({ queryKey: [PRODUCT_QUERY_KEYS.productDetail, productId] });
      toast.success('Variant deleted successfully!');
    },
    onError: (error) => {
      console.error('Error deleting variant:', error);
      toast.error('Failed to delete variant');
    },
  });

  return {
    addVariant,
    updateVariant,
    deleteVariant,
  };
}

/**
 * Hook for managing product favorites
 */
export function useProductFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const toggleFavorite = useCallback(async (productId: string) => {
    try {
      const { toggleFavorite: toggleFav } = await import('@/lib/market/api');
      const isFavorited = await toggleFav(productId);
      
      setFavorites(prev => {
        const newFavorites = new Set(prev);
        if (isFavorited) {
          newFavorites.add(productId);
        } else {
          newFavorites.delete(productId);
        }
        return newFavorites;
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [PRODUCT_QUERY_KEYS.marketCards] });
      
      toast.success(isFavorited ? 'Added to favorites' : 'Removed from favorites');
      return isFavorited;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
      return false;
    }
  }, [queryClient]);

  return {
    favorites,
    toggleFavorite,
    isFavorited: (productId: string) => favorites.has(productId),
  };
}