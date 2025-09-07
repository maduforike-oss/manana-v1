import { useState, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface UseCacheOptions {
  defaultTTL?: number; // Time to live in milliseconds
  maxSize?: number;
}

export const useCache = <T,>({ defaultTTL = 5 * 60 * 1000, maxSize = 100 }: UseCacheOptions = {}) => {
  const cache = useRef(new Map<string, CacheEntry<T>>());

  const get = useCallback((key: string): T | null => {
    const entry = cache.current.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      cache.current.delete(key);
      return null;
    }

    return entry.data;
  }, []);

  const set = useCallback((key: string, data: T, ttl: number = defaultTTL) => {
    // Implement LRU eviction if cache is full
    if (cache.current.size >= maxSize) {
      const firstKey = cache.current.keys().next().value;
      if (firstKey) {
        cache.current.delete(firstKey);
      }
    }

    cache.current.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }, [defaultTTL, maxSize]);

  const clear = useCallback(() => {
    cache.current.clear();
  }, []);

  const remove = useCallback((key: string) => {
    cache.current.delete(key);
  }, []);

  const has = useCallback((key: string): boolean => {
    const entry = cache.current.get(key);
    if (!entry) return false;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      cache.current.delete(key);
      return false;
    }

    return true;
  }, []);

  return {
    get,
    set,
    clear,
    remove,
    has,
  };
};