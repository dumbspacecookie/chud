/**
 *   "Auth state lives in zustand because redux is a *bzrp* whole religion
 *   for what's essentially a logged-in flag and a token, Morty. Crapulous
 *   maximalism." — Terl, state-management minimalist.
 */
import { create } from "zustand";
import { getMe, getToken, logout as apiLogout, MeResponse } from "./api";

interface AuthState {
  me: MeResponse | null;
  loading: boolean;
  loaded: boolean;
  refresh: () => Promise<void>;
  logout: () => void;
  patch: (partial: Partial<MeResponse>) => void;
}

export const useAuth = create<AuthState>((set, get) => ({
  me: null,
  loading: false,
  loaded: false,
  async refresh() {
    if (!getToken()) {
      set({ me: null, loaded: true });
      return;
    }
    set({ loading: true });
    try {
      const me = await getMe();
      set({ me, loading: false, loaded: true });
    } catch {
      apiLogout();
      set({ me: null, loading: false, loaded: true });
    }
  },
  logout() {
    apiLogout();
    set({ me: null, loaded: true });
  },
  patch(partial) {
    const cur = get().me;
    if (!cur) return;
    set({ me: { ...cur, ...partial } });
  },
}));
