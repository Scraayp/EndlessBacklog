import { authenticator } from "otplib";
import QRCode from "qrcode";
import crypto from "node:crypto";
import { userRepository } from "../repositories/userRepository.js";
import { AppError } from "../utils/AppError.js";
import { encryptSecret, decryptSecret, sha256 } from "../utils/crypto.js";
import { issueToken, consumeToken, TOKEN_NAMESPACES } from "../utils/ephemeralTokens.js";

const ISSUER = "EndlessBacklog";
const BACKUP_CODE_COUNT = 8;

function generateBackupCodes(): string[] {
  return Array.from({ length: BACKUP_CODE_COUNT }, () =>
    crypto.randomBytes(5).toString("hex").toUpperCase(),
  );
}

export const twoFactorService = {
  /** Step 1 of enrollment: generate a secret (not yet persisted), return a QR code. */
  async beginSetup(userId: string, email: string): Promise<{ qrDataUrl: string; secret: string; setupToken: string }> {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(email, ISSUER, secret);
    const qrDataUrl = await QRCode.toDataURL(otpauthUrl);
    const setupToken = await issueToken(TOKEN_NAMESPACES.TWO_FACTOR_PENDING, { userId, secret }, 600);
    return { qrDataUrl, secret, setupToken };
  },

  /** Step 2: user proves they scanned it correctly by submitting a valid code. Persists the secret + backup codes. */
  async confirmSetup(userId: string, setupToken: string, code: string): Promise<{ backupCodes: string[] }> {
    const pending = await consumeToken<{ userId: string; secret: string }>(
      TOKEN_NAMESPACES.TWO_FACTOR_PENDING,
      setupToken,
    );
    if (!pending || pending.userId !== userId) throw AppError.badRequest("2FA setup session expired, please restart");
    if (!authenticator.check(code, pending.secret)) throw AppError.badRequest("Invalid code");

    const user = await userRepository.findById(userId);
    if (!user) throw AppError.notFound("User not found");

    const backupCodes = generateBackupCodes();
    user.totpEnabled = true;
    user.totpSecretEncrypted = encryptSecret(pending.secret);
    user.totpBackupCodesHash = backupCodes.map(sha256);
    await user.save();

    return { backupCodes };
  },

  async disable(userId: string, currentCode: string): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user?.totpEnabled || !user.totpSecretEncrypted) throw AppError.badRequest("2FA is not enabled");
    const ok = await twoFactorService.verifyCode(userId, currentCode);
    if (!ok) throw AppError.unauthorized("Invalid two-factor code");
    user.totpEnabled = false;
    user.totpSecretEncrypted = null;
    user.totpBackupCodesHash = null;
    await user.save();
  },

  /** Verifies a TOTP code OR a one-time backup code, for a user with 2FA already enabled. */
  async verifyCode(userId: string, code: string): Promise<boolean> {
    const user = await userRepository.findById(userId);
    if (!user?.totpEnabled || !user.totpSecretEncrypted) return false;

    const secret = decryptSecret(user.totpSecretEncrypted);
    if (authenticator.check(code, secret)) return true;

    const hashed = sha256(code.trim().toUpperCase());
    const backupCodes = user.totpBackupCodesHash ?? [];
    if (backupCodes.includes(hashed)) {
      user.totpBackupCodesHash = backupCodes.filter((c) => c !== hashed);
      await user.save();
      return true;
    }
    return false;
  },
};
