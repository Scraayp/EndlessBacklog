import { create } from "zustand";
import type { UserPublic } from "@endlessbacklog/shared";

interface AuthState {
  user: UserPublic | null;
  accessToken: string | null;
  /** True until the initial silent-refresh-on-load attempt has resolved. */
  isInitializing: boolean;
  setUser: (user: UserPublic | null) => void;
  setAccessToken: (token: string | null) => void;
  setInitializing: (v: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isInitializing: true,
  setUser: (user) => set({ user }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setInitializing: (isInitializing) => set({ isInitializing }),
  clear: () => set({ user: null, accessToken: null }),
}));
