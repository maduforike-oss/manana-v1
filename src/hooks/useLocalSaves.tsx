import { useState, useEffect } from 'react';

export function useLocalSaves() {
  const [ids, setIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("marketplace-saves") || "[]");
    } catch {
      return [];
    }
  });

  const toggle = (id: string) => {
    setIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem("marketplace-saves", JSON.stringify(next));
      return next;
    });
  };

  const clear = () => {
    setIds([]);
    localStorage.removeItem("marketplace-saves");
  };

  return { ids, toggle, clear, isLiked: (id: string) => ids.includes(id) };
}

export function useLocalSearchHistory() {
  const [searches, setSearches] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("marketplace-search-history") || "[]");
    } catch {
      return [];
    }
  });

  const addSearch = (query: string) => {
    if (query.trim() && !searches.includes(query.trim())) {
      const updated = [query.trim(), ...searches.slice(0, 9)]; // Keep only 10 recent
      setSearches(updated);
      localStorage.setItem("marketplace-search-history", JSON.stringify(updated));
    }
  };

  const clearHistory = () => {
    setSearches([]);
    localStorage.removeItem("marketplace-search-history");
  };

  return { searches, addSearch, clearHistory };
}