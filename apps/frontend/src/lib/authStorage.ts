import type { AuthTokenPair } from "@endlessbacklog/shared";

const REFRESH_KEY = "endlessbacklog:refreshToken";

/**
 * The access token lives only in memory (Zustand authStore) — never
 * persisted. The refresh token is written to localStorage so a page reload
 * doesn't force a re-login; this is the standard SPA tradeoff (XSS exposure
 * vs. UX) for a self-hosted internal tool with no server-rendered session.
 * Every refresh rotates the token (see backend utils/refreshTokens.ts), which
 * limits the blast radius of a leaked value.
 */
export const authStorage = {
  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(REFRESH_KEY);
    } catch {
      return null;
    }
  },
  setRefreshToken(token: string): void {
    try {
      localStorage.setItem(REFRESH_KEY, token);
    } catch {
      // ignore
    }
  },
  clear(): void {
    try {
      localStorage.removeItem(REFRESH_KEY);
    } catch {
      // ignore
    }
  },
  saveTokens(tokens: AuthTokenPair): void {
    authStorage.setRefreshToken(tokens.refreshToken);
  },
};
