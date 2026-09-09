import argon2 from "argon2";
import { userRepository } from "../repositories/userRepository.js";
import { toPublicUser } from "../mappers/userMapper.js";
import { AppError } from "../utils/AppError.js";
import { signAccessToken, signPendingTwoFactorToken, verifyPendingTwoFactorToken } from "../utils/jwt.js";
import { issueRefreshFamily, rotateRefreshToken, revokeFamily, revokeAllFamiliesForUser } from "../utils/refreshTokens.js";
import { issueToken, consumeToken, TOKEN_NAMESPACES } from "../utils/ephemeralTokens.js";
import { emailQueue } from "../jobs/queues.js";
import { verifyEmailTemplate, passwordResetTemplate } from "../jobs/emailTemplates.js";
import { env } from "../config/env.js";
import type { RegisterInput, LoginInput, UserPublic, AuthTokenPair, PendingTwoFactorChallenge } from "@endlessbacklog/shared";

async function issueTokenPair(userId: string, email: string): Promise<AuthTokenPair> {
  const accessToken = signAccessToken({ sub: userId, email });
  const { token: refreshToken } = await issueRefreshFamily(userId);
  return { accessToken, refreshToken, expiresIn: env.JWT_ACCESS_TTL_SECONDS };
}

export const authService = {
  async register(input: RegisterInput): Promise<{ user: UserPublic }> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) throw AppError.conflict("An account with that email already exists");

    const passwordHash = await argon2.hash(input.password);
    const user = await userRepository.create({
      email: input.email,
      passwordHash,
      displayName: input.displayName,
    });

    const verifyToken = await issueToken(TOKEN_NAMESPACES.EMAIL_VERIFY, { userId: user.id }, 60 * 60 * 24);
    const { subject, html } = verifyEmailTemplate(verifyToken);
    await emailQueue.add("verify-email", { to: user.email, subject, html });

    return { user: toPublicUser(user) };
  },

  async login(input: LoginInput): Promise<AuthTokenPair | PendingTwoFactorChallenge> {
    const user = await userRepository.findByEmail(input.email);
    if (!user?.passwordHash) throw AppError.unauthorized("Invalid email or password");

    const valid = await argon2.verify(user.passwordHash, input.password);
    if (!valid) throw AppError.unauthorized("Invalid email or password");
    if (user.status === "disabled") throw AppError.forbidden("This account has been disabled");

    if (user.totpEnabled) {
      return { pendingToken: signPendingTwoFactorToken(user.id), method: "totp" };
    }
    return issueTokenPair(user.id, user.email);
  },

  async verifyTwoFactorLogin(pendingToken: string, verifyCode: (userId: string, code: string) => Promise<boolean>, code: string): Promise<AuthTokenPair> {
    const { sub: userId } = verifyPendingTwoFactorToken(pendingToken);
    const user = await userRepository.findById(userId);
    if (!user) throw AppError.unauthorized("Invalid session");

    const ok = await verifyCode(userId, code);
    if (!ok) throw AppError.unauthorized("Invalid two-factor code");

    return issueTokenPair(user.id, user.email);
  },

  async refresh(refreshToken: string): Promise<AuthTokenPair> {
    const result = await rotateRefreshToken(refreshToken);
    if (result.status === "reused") {
      throw AppError.unauthorized("Session revoked — please sign in again");
    }
    if (result.status === "invalid") {
      throw AppError.unauthorized("Invalid refresh token");
    }
    const user = await userRepository.findById(result.userId);
    if (!user) throw AppError.unauthorized("Invalid session");
    const accessToken = signAccessToken({ sub: user.id, email: user.email });
    return { accessToken, refreshToken: result.token, expiresIn: env.JWT_ACCESS_TTL_SECONDS };
  },

  async logout(refreshToken: string): Promise<void> {
    const result = await rotateRefreshToken(refreshToken);
    if (result.status === "ok") await revokeFamily(result.familyId);
  },

  async logoutAllDevices(userId: string): Promise<void> {
    await revokeAllFamiliesForUser(userId);
  },

  async verifyEmail(token: string): Promise<void> {
    const payload = await consumeToken<{ userId: string }>(TOKEN_NAMESPACES.EMAIL_VERIFY, token);
    if (!payload) throw AppError.badRequest("Invalid or expired verification token");
    const user = await userRepository.findById(payload.userId);
    if (!user) throw AppError.notFound("User not found");
    user.emailVerifiedAt = new Date();
    await user.save();
  },

  async resendVerification(userId: string): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) throw AppError.notFound("User not found");
    if (user.emailVerifiedAt) return;
    const verifyToken = await issueToken(TOKEN_NAMESPACES.EMAIL_VERIFY, { userId: user.id }, 60 * 60 * 24);
    const { subject, html } = verifyEmailTemplate(verifyToken);
    await emailQueue.add("verify-email", { to: user.email, subject, html });
  },

  async forgotPassword(email: string): Promise<void> {
    const user = await userRepository.findByEmail(email);
    // Deliberately no error on unknown email — avoids account enumeration.
    if (!user || !user.passwordHash) return;
    const resetToken = await issueToken(TOKEN_NAMESPACES.PASSWORD_RESET, { userId: user.id }, 60 * 60);
    const { subject, html } = passwordResetTemplate(resetToken);
    await emailQueue.add("reset-password", { to: user.email, subject, html });
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const payload = await consumeToken<{ userId: string }>(TOKEN_NAMESPACES.PASSWORD_RESET, token);
    if (!payload) throw AppError.badRequest("Invalid or expired reset token");
    const user = await userRepository.findById(payload.userId);
    if (!user) throw AppError.notFound("User not found");
    user.passwordHash = await argon2.hash(newPassword);
    await user.save();
    await revokeAllFamiliesForUser(user.id);
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user?.passwordHash) throw AppError.badRequest("This account has no password set (OAuth-only)");
    const valid = await argon2.verify(user.passwordHash, currentPassword);
    if (!valid) throw AppError.unauthorized("Current password is incorrect");
    user.passwordHash = await argon2.hash(newPassword);
    await user.save();
  },

  async me(userId: string): Promise<UserPublic> {
    const user = await userRepository.findById(userId);
    if (!user) throw AppError.notFound("User not found");
    return toPublicUser(user);
  },

  async updateProfile(userId: string, data: { displayName?: string; avatarUrl?: string | null }): Promise<UserPublic> {
    const user = await userRepository.findById(userId);
    if (!user) throw AppError.notFound("User not found");
    if (data.displayName !== undefined) user.displayName = data.displayName;
    if (data.avatarUrl !== undefined) user.avatarUrl = data.avatarUrl;
    await user.save();
    return toPublicUser(user);
  },
};
