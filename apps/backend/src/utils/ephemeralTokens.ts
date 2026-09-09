import { redis } from "../config/redis.js";
import { randomToken, sha256 } from "./crypto.js";

/**
 * Generic helper for the short-lived, single-use tokens that live in Redis
 * rather than SQL (email verification, password reset, workspace invites,
 * OAuth exchange codes, 2FA pending challenges). Storing only a hash of the
 * token means a Redis dump alone can't be used to forge sessions.
 */
export async function issueToken(
  namespace: string,
  payload: Record<string, unknown>,
  ttlSeconds: number,
): Promise<string> {
  const token = randomToken();
  const key = `${namespace}:${sha256(token)}`;
  await redis.set(key, JSON.stringify(payload), "EX", ttlSeconds);
  return token;
}

export async function consumeToken<T = Record<string, unknown>>(
  namespace: string,
  token: string,
  { singleUse = true }: { singleUse?: boolean } = {},
): Promise<T | null> {
  const key = `${namespace}:${sha256(token)}`;
  const raw = await redis.get(key);
  if (!raw) return null;
  if (singleUse) await redis.del(key);
  return JSON.parse(raw) as T;
}

export async function peekToken<T = Record<string, unknown>>(
  namespace: string,
  token: string,
): Promise<T | null> {
  return consumeToken<T>(namespace, token, { singleUse: false });
}

export async function revokeToken(namespace: string, token: string): Promise<void> {
  await redis.del(`${namespace}:${sha256(token)}`);
}

export const TOKEN_NAMESPACES = {
  EMAIL_VERIFY: "tok:verify",
  PASSWORD_RESET: "tok:reset",
  WORKSPACE_INVITE: "tok:invite",
  OAUTH_EXCHANGE: "tok:oauth",
  TWO_FACTOR_PENDING: "tok:2fa-pending",
} as const;
