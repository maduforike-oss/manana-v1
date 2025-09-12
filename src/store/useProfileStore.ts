import { create } from 'zustand';
import { getMyProfile, updateMyProfile, type Profile } from '@/lib/profile';

type State = {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  refresh: () => Promise<void>;
  patch: (fields: Partial<Omit<Profile,'id'|'created_at'>>) => Promise<void>;
  setLocal: (p: Profile | null) => void;
};

export const useProfileStore = create<State>((set, get) => ({
  profile: null,
  loading: false,
  error: null,
  setLocal: (p) => set({ profile: p }),
  load: async () => {
    set({ loading: true, error: null });
    try {
      const p = await getMyProfile();
      set({ profile: p, loading: false });
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to load profile', loading: false });
    }
  },
  refresh: async () => {
    try {
      const p = await getMyProfile();
      set({ profile: p });
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to refresh profile' });
    }
  },
  patch: async (fields) => {
    set({ loading: true, error: null });
    try {
      await updateMyProfile(fields);
      // re-fetch canonical row to avoid stale optimistic state
      const p = await getMyProfile();
      set({ profile: p, loading: false });
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to save profile', loading: false });
      throw e;
    }
  },
}));