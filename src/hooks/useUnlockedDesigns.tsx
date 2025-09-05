import { useState, useCallback } from 'react';

export function useUnlockedDesigns() {
  const [unlockedIds, setUnlockedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('unlockedDesigns') || '[]');
    } catch {
      return [];
    }
  });

  const unlockDesign = useCallback((designId: string) => {
    setUnlockedIds(prev => {
      if (prev.includes(designId)) return prev;
      const next = [...prev, designId];
      localStorage.setItem('unlockedDesigns', JSON.stringify(next));
      return next;
    });
  }, []);

  const isUnlocked = useCallback((designId: string) => {
    return unlockedIds.includes(designId);
  }, [unlockedIds]);

  const clearUnlocked = useCallback(() => {
    setUnlockedIds([]);
    localStorage.removeItem('unlockedDesigns');
  }, []);

  return {
    unlockedIds,
    unlockDesign,
    isUnlocked,
    clearUnlocked
  };
}