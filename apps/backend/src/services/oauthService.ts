import { userRepository } from "../repositories/userRepository.js";
import { issueToken, consumeToken, TOKEN_NAMESPACES } from "../utils/ephemeralTokens.js";
import { signAccessToken } from "../utils/jwt.js";
import { issueRefreshFamily } from "../utils/refreshTokens.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import type { OAuthProvider, AuthTokenPair } from "@endlessbacklog/shared";

export interface OAuthProfile {
  provider: OAuthProvider;
  providerAccountId: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
}

export const oauthService = {
  /** Finds an existing user linked to this OAuth identity, or links/creates one
   *  by verified email, then mints a one-time exchange code (Redis, 60s TTL)
   *  so the token pair never rides through a browser redirect URL. */
  async handleCallback(profile: OAuthProfile): Promise<string> {
    const existingLink = await userRepository.findByOAuthAccount(profile.provider, profile.providerAccountId);
    let userId: string;

    if (existingLink) {
      userId = existingLink.userId;
    } else {
      let user = await userRepository.findByEmail(profile.email);
      if (!user) {
        user = await userRepository.create({
          email: profile.email,
          passwordHash: null,
          displayName: profile.displayName,
        });
        user.emailVerifiedAt = new Date();
        await user.save();
      }
      await userRepository.linkOAuthAccount(user.id, profile.provider, profile.providerAccountId);
      userId = user.id;
    }

    return issueToken(TOKEN_NAMESPACES.OAUTH_EXCHANGE, { userId }, 60);
  },

  buildRedirectUrl(exchangeCode: string): string {
    return `${env.FRONTEND_URL}/auth/oauth-callback?code=${encodeURIComponent(exchangeCode)}`;
  },

  async exchange(code: string): Promise<AuthTokenPair> {
    const payload = await consumeToken<{ userId: string }>(TOKEN_NAMESPACES.OAUTH_EXCHANGE, code);
    if (!payload) throw AppError.unauthorized("Invalid or expired exchange code");
    const user = await userRepository.findById(payload.userId);
    if (!user) throw AppError.unauthorized("Invalid session");
    const accessToken = signAccessToken({ sub: user.id, email: user.email });
    const { token: refreshToken } = await issueRefreshFamily(user.id);
    return { accessToken, refreshToken, expiresIn: env.JWT_ACCESS_TTL_SECONDS };
  },
};
