import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redis } from "../config/redis.js";

/** Shared Redis-backed store so rate limits hold across multiple backend replicas. */
function redisStore(prefix: string) {
  return new RedisStore({
    prefix,
    sendCommand: (...args: string[]) => redis.call(...(args as [string, ...string[]])) as Promise<any>,
  });
}

/** Tighter limit for auth endpoints (login/register/password reset) — these
 *  are the most attractive targets for credential stuffing / brute force. */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore("rl:auth:"),
  message: { error: { code: "TOO_MANY_REQUESTS", message: "Too many attempts, please try again later" } },
});

/** General API rate limit, applied globally. */
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore("rl:api:"),
  message: { error: { code: "TOO_MANY_REQUESTS", message: "Too many requests" } },
});
