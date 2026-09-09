import { redis } from "../config/redis.js";
import { env } from "../config/env.js";
import { randomToken, sha256 } from "./crypto.js";

/**
 * Opaque refresh tokens, rotated on every use, tracked in Redis by "family".
 * Each login starts a new family; every /auth/refresh call rotates the
 * token within that family. If a token is presented that no longer matches
 * the family's current pointer, it's a replay of a stale token (theft
 * signal) and the whole family is revoked, forcing re-login on every device
 * sharing that family.
 */

interface FamilyRecord {
  userId: string;
}

const TTL = env.JWT_REFRESH_TTL_SECONDS;

function tokenKey(hash: string): string {
  return `refresh:token:${hash}`;
}
function familyKey(familyId: string): string {
  return `refresh:family:${familyId}`;
}
function userFamiliesKey(userId: string): string {
  return `refresh:user:${userId}:families`;
}

export interface IssuedRefreshToken {
  token: string;
  familyId: string;
}

export async function issueRefreshFamily(userId: string): Promise<IssuedRefreshToken> {
  const familyId = randomToken(16);
  const token = randomToken();
  const hash = sha256(token);

  await redis
    .multi()
    .set(tokenKey(hash), familyId, "EX", TTL)
    .set(familyKey(familyId), JSON.stringify({ userId } satisfies FamilyRecord), "EX", TTL)
    .set(`refresh:family:${familyId}:current`, hash, "EX", TTL)
    .sadd(userFamiliesKey(userId), familyId)
    .expire(userFamiliesKey(userId), TTL)
    .exec();

  return { token, familyId };
}

export type RotateResult =
  | { status: "ok"; token: string; familyId: string; userId: string }
  | { status: "invalid" }
  | { status: "reused" };

export async function rotateRefreshToken(presentedToken: string): Promise<RotateResult> {
  const hash = sha256(presentedToken);
  const familyId = await redis.get(tokenKey(hash));
  if (!familyId) return { status: "invalid" };

  const [recordRaw, currentHash] = await Promise.all([
    redis.get(familyKey(familyId)),
    redis.get(`refresh:family:${familyId}:current`),
  ]);
  if (!recordRaw) return { status: "invalid" };
  const record = JSON.parse(recordRaw) as FamilyRecord;

  if (currentHash !== hash) {
    // Reuse of a rotated-out token: possible theft. Revoke the family entirely.
    await revokeFamily(familyId);
    return { status: "reused" };
  }

  const newToken = randomToken();
  const newHash = sha256(newToken);

  await redis
    .multi()
    .del(tokenKey(hash))
    .set(tokenKey(newHash), familyId, "EX", TTL)
    .set(`refresh:family:${familyId}:current`, newHash, "EX", TTL)
    .expire(familyKey(familyId), TTL)
    .exec();

  return { status: "ok", token: newToken, familyId, userId: record.userId };
}

export async function revokeFamily(familyId: string): Promise<void> {
  const recordRaw = await redis.get(familyKey(familyId));
  const currentHash = await redis.get(`refresh:family:${familyId}:current`);
  const multi = redis.multi();
  if (currentHash) multi.del(tokenKey(currentHash));
  multi.del(familyKey(familyId));
  multi.del(`refresh:family:${familyId}:current`);
  if (recordRaw) {
    const record = JSON.parse(recordRaw) as FamilyRecord;
    multi.srem(userFamiliesKey(record.userId), familyId);
  }
  await multi.exec();
}

/** "Sign out everywhere": revoke every refresh family for a user. */
export async function revokeAllFamiliesForUser(userId: string): Promise<void> {
  const familyIds = await redis.smembers(userFamiliesKey(userId));
  await Promise.all(familyIds.map((id) => revokeFamily(id)));
  await redis.del(userFamiliesKey(userId));
}
