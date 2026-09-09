import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export interface AccessTokenPayload {
  sub: string; // userId
  email: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_TTL_SECONDS });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

/** Short-lived token used only to carry "this user passed step 1 (password)"
 *  into the 2FA challenge step, without granting API access. */
export interface PendingTwoFactorPayload {
  sub: string;
  purpose: "2fa-pending";
}

export function signPendingTwoFactorToken(userId: string): string {
  return jwt.sign(
    { sub: userId, purpose: "2fa-pending" } satisfies PendingTwoFactorPayload,
    env.JWT_ACCESS_SECRET,
    { expiresIn: 300 },
  );
}

export function verifyPendingTwoFactorToken(token: string): PendingTwoFactorPayload {
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as PendingTwoFactorPayload;
  if (payload.purpose !== "2fa-pending") throw new Error("Invalid token purpose");
  return payload;
}
