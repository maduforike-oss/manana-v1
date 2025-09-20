import React, { memo } from 'react';
import { ProductCard } from '../marketplace/ProductCard';
import { MarketProductCard } from '../marketplace/MarketProductCard';
import { EnhancedProductCard } from '../marketplace/EnhancedProductCard';

// Memoized product cards to prevent unnecessary re-renders
export const MemoizedProductCard = memo(ProductCard, (prevProps, nextProps) => {
  return (
    prevProps.design?.id === nextProps.design?.id &&
    prevProps.design?.name === nextProps.design?.name &&
    prevProps.isSaved === nextProps.isSaved &&
    prevProps.isUnlocked === nextProps.isUnlocked
  );
});

export const MemoizedMarketProductCard = memo(MarketProductCard, (prevProps, nextProps) => {
  return (
    prevProps.product?.id === nextProps.product?.id &&
    prevProps.product?.name === nextProps.product?.name &&
    prevProps.isSaved === nextProps.isSaved
  );
});

export const MemoizedEnhancedProductCard = memo(EnhancedProductCard, (prevProps, nextProps) => {
  return (
    prevProps.product === nextProps.product &&
    prevProps.isSaved === nextProps.isSaved
  );
});

// Generic memoized wrapper for any component
export function withMemo<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  areEqual?: (prevProps: T, nextProps: T) => boolean
) {
  return memo(Component, areEqual);
}

// Higher-order component for performance monitoring
export function withPerformanceMonitoring<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  componentName: string
) {
  return memo((props: T) => {
    const renderStart = performance.now();
    
    React.useEffect(() => {
      const renderTime = performance.now() - renderStart;
      if (process.env.NODE_ENV === 'development' && renderTime > 16.67) {
        console.warn(`${componentName} slow render: ${renderTime.toFixed(2)}ms`);
      }
    });

    return <Component {...props} />;
  });
}