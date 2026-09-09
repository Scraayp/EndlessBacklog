import type { Request, Response } from "express";
import { authService } from "../services/authService.js";
import { twoFactorService } from "../services/twoFactorService.js";
import { AppError } from "../utils/AppError.js";

export const authController = {
  async register(req: Request, res: Response) {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  },

  async login(req: Request, res: Response) {
    const result = await authService.login(req.body);
    res.status(200).json(result);
  },

  async verifyTwoFactorLogin(req: Request, res: Response) {
    const { pendingToken, code } = req.body;
    const result = await authService.verifyTwoFactorLogin(
      pendingToken,
      (userId, c) => twoFactorService.verifyCode(userId, c),
      code,
    );
    res.status(200).json(result);
  },

  async refresh(req: Request, res: Response) {
    const result = await authService.refresh(req.body.refreshToken);
    res.status(200).json(result);
  },

  async logout(req: Request, res: Response) {
    await authService.logout(req.body.refreshToken);
    res.status(204).send();
  },

  async logoutAllDevices(req: Request, res: Response) {
    if (!req.user) throw AppError.unauthorized();
    await authService.logoutAllDevices(req.user.id);
    res.status(204).send();
  },

  async verifyEmail(req: Request, res: Response) {
    await authService.verifyEmail(req.body.token);
    res.status(204).send();
  },

  async resendVerification(req: Request, res: Response) {
    if (!req.user) throw AppError.unauthorized();
    await authService.resendVerification(req.user.id);
    res.status(204).send();
  },

  async forgotPassword(req: Request, res: Response) {
    await authService.forgotPassword(req.body.email);
    res.status(204).send();
  },

  async resetPassword(req: Request, res: Response) {
    await authService.resetPassword(req.body.token, req.body.password);
    res.status(204).send();
  },

  async changePassword(req: Request, res: Response) {
    if (!req.user) throw AppError.unauthorized();
    await authService.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
    res.status(204).send();
  },

  async me(req: Request, res: Response) {
    if (!req.user) throw AppError.unauthorized();
    const user = await authService.me(req.user.id);
    res.status(200).json({ user });
  },

  async updateProfile(req: Request, res: Response) {
    if (!req.user) throw AppError.unauthorized();
    const user = await authService.updateProfile(req.user.id, req.body);
    res.status(200).json({ user });
  },

  async beginTwoFactorSetup(req: Request, res: Response) {
    if (!req.user) throw AppError.unauthorized();
    const result = await twoFactorService.beginSetup(req.user.id, req.user.email);
    res.status(200).json({ qrDataUrl: result.qrDataUrl, setupToken: result.setupToken });
  },

  async confirmTwoFactorSetup(req: Request, res: Response) {
    if (!req.user) throw AppError.unauthorized();
    const { setupToken, code } = req.body;
    const result = await twoFactorService.confirmSetup(req.user.id, setupToken, code);
    res.status(200).json(result);
  },

  async disableTwoFactor(req: Request, res: Response) {
    if (!req.user) throw AppError.unauthorized();
    await twoFactorService.disable(req.user.id, req.body.code);
    res.status(204).send();
  },
};
