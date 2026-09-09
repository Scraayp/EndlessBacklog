import { useCallback } from "react";
import { authApi } from "./api.js";
import { authStorage } from "../../lib/authStorage.js";
import { useAuthStore } from "../../stores/authStore.js";
import { connectSocket, disconnectSocket } from "../../lib/socket.js";
import { queryClient } from "../../app/queryClient.js";
import type { AuthTokenPair } from "@endlessbacklog/shared";

/** Centralizes the side effects of "a token pair now exists" / "session
 *  ended" — storage, in-memory store, socket connection — so every call
 *  site (login, 2FA verify, OAuth exchange, silent refresh on load) stays
 *  a one-liner. */
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isInitializing = useAuthStore((s) => s.isInitializing);

  const establishSession = useCallback(async (tokens: AuthTokenPair) => {
    useAuthStore.getState().setAccessToken(tokens.accessToken);
    authStorage.saveTokens(tokens);
    const { user: me } = await authApi.me();
    useAuthStore.getState().setUser(me);
    connectSocket();
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = authStorage.getRefreshToken();
    disconnectSocket();
    useAuthStore.getState().clear();
    authStorage.clear();
    queryClient.clear();
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // best-effort — session is already cleared client-side
      }
    }
  }, []);

  return { user, isInitializing, establishSession, logout };
}
