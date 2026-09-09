import { Router } from "express";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  twoFactorVerifySchema,
  twoFactorConfirmSchema,
  updateProfileSchema,
} from "@endlessbacklog/shared";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { authController } from "../controllers/authController.js";
import { authRateLimiter } from "../middleware/rateLimit.js";

export const authRouter = Router();

authRouter.post("/register", authRateLimiter, validate(registerSchema), authController.register);
authRouter.post("/login", authRateLimiter, validate(loginSchema), authController.login);
authRouter.post("/2fa/verify", authRateLimiter, validate(twoFactorVerifySchema), authController.verifyTwoFactorLogin);
authRouter.post("/refresh", validate(refreshSchema), authController.refresh);
authRouter.post("/logout", validate(refreshSchema), authController.logout);
authRouter.post("/logout-all", requireAuth, authController.logoutAllDevices);

authRouter.post("/verify-email", validate(verifyEmailSchema), authController.verifyEmail);
authRouter.post("/resend-verification", requireAuth, authController.resendVerification);
authRouter.post("/forgot-password", authRateLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
authRouter.post("/reset-password", authRateLimiter, validate(resetPasswordSchema), authController.resetPassword);
authRouter.post("/change-password", requireAuth, validate(changePasswordSchema), authController.changePassword);

authRouter.get("/me", requireAuth, authController.me);
authRouter.patch("/me", requireAuth, validate(updateProfileSchema), authController.updateProfile);

authRouter.post("/2fa/setup", requireAuth, authController.beginTwoFactorSetup);
authRouter.post("/2fa/confirm", requireAuth, validate(twoFactorConfirmSchema), authController.confirmTwoFactorSetup);
authRouter.post("/2fa/disable", requireAuth, validate(twoFactorConfirmSchema), authController.disableTwoFactor);
