import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
// @ts-expect-error -- passport-microsoft has no published types
import { Strategy as MicrosoftStrategy } from "passport-microsoft";
// @ts-expect-error -- passport-discord has no published types
import { Strategy as DiscordStrategy } from "passport-discord";
import { env } from "./env.js";
import { oauthService, type OAuthProfile } from "../services/oauthService.js";

const callbackUrl = (provider: string) => `${env.BASE_URL}/api/auth/oauth/${provider}/callback`;

/** Registers whichever OAuth strategies have credentials configured. Providers
 *  without OAUTH_*_CLIENT_ID/SECRET set are simply skipped (and their login
 *  buttons hidden client-side) — self-hosters only need to configure the ones
 *  they want. Session-less: passport is used purely for the provider redirect
 *  dance, never for cookie sessions (see oauthService's exchange-code flow). */
export function configurePassport(): void {
  if (env.OAUTH_GOOGLE_CLIENT_ID && env.OAUTH_GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: env.OAUTH_GOOGLE_CLIENT_ID,
          clientSecret: env.OAUTH_GOOGLE_CLIENT_SECRET,
          callbackURL: callbackUrl("google"),
          scope: ["profile", "email"],
        },
        async (_at: string, _rt: string, profile: any, done: any) => {
          try {
            const oauthProfile: OAuthProfile = {
              provider: "google",
              providerAccountId: profile.id,
              email: profile.emails?.[0]?.value ?? "",
              displayName: profile.displayName ?? profile.emails?.[0]?.value ?? "Google User",
              avatarUrl: profile.photos?.[0]?.value ?? null,
            };
            done(null, oauthProfile);
          } catch (err) {
            done(err);
          }
        },
      ),
    );
  }

  if (env.OAUTH_GITHUB_CLIENT_ID && env.OAUTH_GITHUB_CLIENT_SECRET) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: env.OAUTH_GITHUB_CLIENT_ID,
          clientSecret: env.OAUTH_GITHUB_CLIENT_SECRET,
          callbackURL: callbackUrl("github"),
          scope: ["user:email"],
        },
        async (_at: string, _rt: string, profile: any, done: any) => {
          try {
            const oauthProfile: OAuthProfile = {
              provider: "github",
              providerAccountId: String(profile.id),
              email: profile.emails?.[0]?.value ?? `${profile.username}@users.noreply.github.com`,
              displayName: profile.displayName ?? profile.username ?? "GitHub User",
              avatarUrl: profile.photos?.[0]?.value ?? null,
            };
            done(null, oauthProfile);
          } catch (err) {
            done(err);
          }
        },
      ),
    );
  }

  if (env.OAUTH_MICROSOFT_CLIENT_ID && env.OAUTH_MICROSOFT_CLIENT_SECRET) {
    passport.use(
      new MicrosoftStrategy(
        {
          clientID: env.OAUTH_MICROSOFT_CLIENT_ID,
          clientSecret: env.OAUTH_MICROSOFT_CLIENT_SECRET,
          callbackURL: callbackUrl("microsoft"),
          scope: ["user.read"],
        },
        async (_at: string, _rt: string, profile: any, done: any) => {
          try {
            const oauthProfile: OAuthProfile = {
              provider: "microsoft",
              providerAccountId: profile.id,
              email: profile.emails?.[0]?.value ?? profile._json?.userPrincipalName ?? "",
              displayName: profile.displayName ?? "Microsoft User",
              avatarUrl: null,
            };
            done(null, oauthProfile);
          } catch (err) {
            done(err);
          }
        },
      ),
    );
  }

  if (env.OAUTH_DISCORD_CLIENT_ID && env.OAUTH_DISCORD_CLIENT_SECRET) {
    passport.use(
      new DiscordStrategy(
        {
          clientID: env.OAUTH_DISCORD_CLIENT_ID,
          clientSecret: env.OAUTH_DISCORD_CLIENT_SECRET,
          callbackURL: callbackUrl("discord"),
          scope: ["identify", "email"],
        },
        async (_at: string, _rt: string, profile: any, done: any) => {
          try {
            const avatarUrl = profile.avatar
              ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
              : null;
            const oauthProfile: OAuthProfile = {
              provider: "discord",
              providerAccountId: profile.id,
              email: profile.email ?? "",
              displayName: profile.global_name ?? profile.username ?? "Discord User",
              avatarUrl,
            };
            done(null, oauthProfile);
          } catch (err) {
            done(err);
          }
        },
      ),
    );
  }
}

export const configuredOAuthProviders = (): string[] =>
  [
    env.OAUTH_GOOGLE_CLIENT_ID && "google",
    env.OAUTH_GITHUB_CLIENT_ID && "github",
    env.OAUTH_MICROSOFT_CLIENT_ID && "microsoft",
    env.OAUTH_DISCORD_CLIENT_ID && "discord",
  ].filter((p): p is string => Boolean(p));

export { oauthService };
export default passport;
