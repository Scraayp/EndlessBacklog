import { Router } from "express";
import passport, { oauthService, configuredOAuthProviders } from "../config/passport.js";
import { validate } from "../middleware/validate.js";
import { oauthExchangeSchema } from "@endlessbacklog/shared";
import { AppError } from "../utils/AppError.js";
import type { OAuthProfile } from "../services/oauthService.js";

export const oauthRouter = Router();

oauthRouter.get("/providers", (_req, res) => {
  res.json({ providers: configuredOAuthProviders() });
});

const PROVIDERS = ["google", "github", "microsoft", "discord"] as const;

for (const provider of PROVIDERS) {
  oauthRouter.get(`/${provider}`, (req, res, next) => {
    if (!configuredOAuthProviders().includes(provider)) {
      next(AppError.notFound(`OAuth provider "${provider}" is not configured on this server`));
      return;
    }
    passport.authenticate(provider, { session: false })(req, res, next);
  });

  oauthRouter.get(
    `/${provider}/callback`,
    (req, res, next) => {
      passport.authenticate(provider, { session: false, failureRedirect: "/login?oauth_error=1" }, async (err: unknown, profile: OAuthProfile | false) => {
        try {
          if (err || !profile) throw AppError.unauthorized("OAuth authentication failed");
          const code = await oauthService.handleCallback(profile);
          res.redirect(oauthService.buildRedirectUrl(code));
        } catch (e) {
          next(e);
        }
      })(req, res, next);
    },
  );
}

oauthRouter.post("/exchange", validate(oauthExchangeSchema), async (req, res) => {
  const tokens = await oauthService.exchange(req.body.code);
  res.status(200).json(tokens);
});
