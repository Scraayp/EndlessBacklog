import { api } from "../../lib/apiClient.js";
import type {
  RegisterInput,
  LoginInput,
  AuthTokenPair,
  PendingTwoFactorChallenge,
  UserPublic,
  TwoFactorVerifyInput,
} from "@endlessbacklog/shared";

function isPending(x: AuthTokenPair | PendingTwoFactorChallenge): x is PendingTwoFactorChallenge {
  return "pendingToken" in x;
}

export const authApi = {
  register: (input: RegisterInput) => api.post<{ user: UserPublic }>("/auth/register", input, { skipAuth: true }),

  login: (input: LoginInput) =>
    api.post<AuthTokenPair | PendingTwoFactorChallenge>("/auth/login", input, { skipAuth: true }),

  verifyTwoFactor: (input: TwoFactorVerifyInput) =>
    api.post<AuthTokenPair>("/auth/2fa/verify", input, { skipAuth: true }),

  verifyEmail: (token: string) => api.post<void>("/auth/verify-email", { token }, { skipAuth: true }),
  resendVerification: () => api.post<void>("/auth/resend-verification"),

  forgotPassword: (email: string) => api.post<void>("/auth/forgot-password", { email }, { skipAuth: true }),
  resetPassword: (token: string, password: string) =>
    api.post<void>("/auth/reset-password", { token, password }, { skipAuth: true }),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post<void>("/auth/change-password", { currentPassword, newPassword }),

  me: () => api.get<{ user: UserPublic }>("/auth/me"),
  updateProfile: (data: { displayName?: string; avatarUrl?: string | null }) =>
    api.patch<{ user: UserPublic }>("/auth/me", data),

  logout: (refreshToken: string) => api.post<void>("/auth/logout", { refreshToken }, { skipAuth: true }),
  logoutAll: () => api.post<void>("/auth/logout-all"),

  beginTwoFactorSetup: () => api.post<{ qrDataUrl: string; setupToken: string }>("/auth/2fa/setup"),
  confirmTwoFactorSetup: (setupToken: string, code: string) =>
    api.post<{ backupCodes: string[] }>("/auth/2fa/confirm", { setupToken, code }),
  disableTwoFactor: (code: string) => api.post<void>("/auth/2fa/disable", { code }),

  oauthProviders: () => api.get<{ providers: string[] }>("/auth/oauth/providers"),
  oauthExchange: (code: string) => api.post<AuthTokenPair>("/auth/oauth/exchange", { code }, { skipAuth: true }),

  isPending,
};
