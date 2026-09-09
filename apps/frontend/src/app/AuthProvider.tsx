import { useEffect, type ReactNode } from "react";
import { API_URL } from "../lib/env.js";
import { authApi } from "../features/auth/api.js";
import { authStorage } from "../lib/authStorage.js";
import { useAuthStore } from "../stores/authStore.js";
import { connectSocket } from "../lib/socket.js";
import { FullPageSpinner } from "../components/ui/Spinner.js";
import type { AuthTokenPair } from "@endlessbacklog/shared";

/** On mount, attempts a silent session restore from the persisted refresh
 *  token (see lib/authStorage.ts) before rendering the app — avoids a
 *  flash of the login page on every reload for an already-authenticated
 *  user. Renders children once that attempt has resolved either way. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const isInitializing = useAuthStore((s) => s.isInitializing);

  useEffect(() => {
    async function restore() {
      const refreshToken = authStorage.getRefreshToken();
      if (!refreshToken) {
        useAuthStore.getState().setInitializing(false);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) throw new Error("refresh failed");
        const tokens = (await res.json()) as AuthTokenPair;
        useAuthStore.getState().setAccessToken(tokens.accessToken);
        authStorage.saveTokens(tokens);

        const { user } = await authApi.me();
        useAuthStore.getState().setUser(user);
        connectSocket();
      } catch {
        useAuthStore.getState().clear();
        authStorage.clear();
      } finally {
        useAuthStore.getState().setInitializing(false);
      }
    }

    void restore();
  }, []);

  if (isInitializing) return <FullPageSpinner />;
  return <>{children}</>;
}
