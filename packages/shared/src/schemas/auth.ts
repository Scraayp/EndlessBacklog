import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email().max(255);

/** Minimum 10 chars, at least one letter and one number — deliberately not overly strict
 *  (long passphrases should be welcomed), enforced further with a zxcvbn-style strength
 *  meter client-side only, not blocked server-side beyond these basics. */
export const passwordSchema = z
  .string()
  .min(10, "Password must be at least 10 characters")
  .max(128)
  .regex(/[A-Za-z]/, "Password must contain a letter")
  .regex(/[0-9]/, "Password must contain a number");

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: z.string().trim().min(1).max(80),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});
export type RefreshInput = z.infer<typeof refreshSchema>;

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
});

export const twoFactorVerifySchema = z.object({
  pendingToken: z.string().min(1),
  code: z.string().regex(/^\d{6}$/, "Must be a 6-digit code"),
});
export type TwoFactorVerifyInput = z.infer<typeof twoFactorVerifySchema>;

export const twoFactorConfirmSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Must be a 6-digit code"),
});

export const oauthExchangeSchema = z.object({
  code: z.string().min(1),
});

export const updateProfileSchema = z.object({
  displayName: z.string().trim().min(1).max(80).optional(),
  avatarUrl: z.string().url().nullable().optional(),
});
