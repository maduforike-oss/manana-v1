import { create } from 'zustand';
import { getMyProfile, setMyProfile, type MyProfile } from '@/lib/profile-api';

type State = {
  profile: MyProfile | null;
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  refresh: () => Promise<void>;
  patch: (fields: Partial<Omit<MyProfile,'user_id'|'total_designs'|'followers'|'following'|'metrics_updated_at'>>) => Promise<void>;
  setLocal: (p: MyProfile | null) => void;
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
      await setMyProfile(fields);
      // re-fetch canonical row to avoid stale optimistic state
      const p = await getMyProfile();
      set({ profile: p, loading: false });
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to save profile', loading: false });
      throw e;
    }
  },
}));