import { User, OAuthAccount } from "../models/index.js";
import type { OAuthProvider } from "@endlessbacklog/shared";

export const userRepository = {
  findByEmail(email: string) {
    return User.findOne({ where: { email: email.trim().toLowerCase() } });
  },
  findById(id: string) {
    return User.findByPk(id);
  },
  findByIds(ids: string[]) {
    return User.findAll({ where: { id: ids } });
  },
  create(data: { email: string; passwordHash: string | null; displayName: string }) {
    return User.create(data);
  },
  findByOAuthAccount(provider: OAuthProvider, providerAccountId: string) {
    return OAuthAccount.findOne({
      where: { provider, providerAccountId },
      include: [{ model: User, as: "user" }],
    });
  },
  linkOAuthAccount(userId: string, provider: OAuthProvider, providerAccountId: string) {
    return OAuthAccount.create({ userId, provider, providerAccountId });
  },
  listOAuthAccounts(userId: string) {
    return OAuthAccount.findAll({ where: { userId } });
  },
};
