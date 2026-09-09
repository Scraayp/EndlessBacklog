import { Redis } from "ioredis";
import { env } from "./env.js";
import { logger } from "./logger.js";

/**
 * Separate connections per role, per ioredis/BullMQ/Socket.io-redis-adapter
 * best practice (a connection used for blocking commands, pub/sub, or the
 * BullMQ scheduler cannot also be used for regular commands).
 */
export const redis = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });
export const redisSubscriber = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });

/** Dedicated connection factory for BullMQ queues/workers (each needs its own). */
export function createBullMQConnection(): Redis {
  return new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });
}

redis.on("error", (err: Error) => logger.error({ err }, "redis connection error"));
redis.on("connect", () => logger.info("redis connected"));
