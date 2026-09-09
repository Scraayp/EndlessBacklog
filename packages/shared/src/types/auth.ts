import type { WorkspaceRole } from "../constants/roles.js";

export type UserStatus = "active" | "disabled";
export type OAuthProvider = "google" | "github" | "microsoft" | "discord";

/** Public-safe user shape (never includes passwordHash / totpSecretEncrypted). */
export interface UserPublic {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  status: UserStatus;
  emailVerifiedAt: string | null;
  totpEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OAuthAccountPublic {
  id: string;
  userId: string;
  provider: OAuthProvider;
  createdAt: string;
}

export interface AuthTokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/** Returned by /auth/login when the account has 2FA enabled, instead of a token pair. */
export interface PendingTwoFactorChallenge {
  pendingToken: string;
  method: "totp";
}

export interface AuthenticatedUserContext {
  userId: string;
  email: string;
  /** Per-workspace roles resolved for the request, populated by rbac middleware as needed. */
  workspaceRoles?: Record<string, WorkspaceRole>;
}
