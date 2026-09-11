import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema, twoFactorConfirmSchema, type TwoFactorVerifyInput } from "@endlessbacklog/shared";
import type { z } from "zod";
import { authApi } from "../features/auth/api.js";
import { useAuthStore } from "../stores/authStore.js";
import { useThemeStore, type ThemePreference } from "../stores/themeStore.js";
import { ApiError } from "../lib/apiClient.js";
import { Button } from "../components/ui/Button.js";
import { Input, Label, FieldError } from "../components/ui/Input.js";
import { clsx } from "clsx";

type PasswordForm = z.infer<typeof changePasswordSchema>;

function ThemeSection() {
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);
  const options: { value: ThemePreference; label: string }[] = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "system", label: "System" },
  ];
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-sm font-semibold text-foreground">Appearance</h2>
      <div className="inline-flex gap-1 rounded-full bg-[var(--sunken)] p-1">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => setPreference(o.value)}
            className={clsx(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              preference === o.value ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </section>
  );
}

function PasswordSection() {
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PasswordForm>({
    resolver: zodResolver(changePasswordSchema),
  });

  async function onSubmit(data: PasswordForm) {
    setFormError(null);
    setSuccess(false);
    try {
      await authApi.changePassword(data.currentPassword, data.newPassword);
      setSuccess(true);
      reset();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Could not change password.");
    }
  }

  return (
    <section className="mb-8">
      <h2 className="mb-3 text-sm font-semibold text-foreground">Password</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm space-y-3">
        <div>
          <Label htmlFor="currentPassword">Current password</Label>
          <Input id="currentPassword" type="password" {...register("currentPassword")} />
          <FieldError>{errors.currentPassword?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="newPassword">New password</Label>
          <Input id="newPassword" type="password" {...register("newPassword")} />
          <FieldError>{errors.newPassword?.message}</FieldError>
        </div>
        {formError && <p className="text-sm text-danger">{formError}</p>}
        {success && <p className="text-sm text-primary-600">Password updated.</p>}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Change password"}
        </Button>
      </form>
    </section>
  );
}

function TwoFactorSection() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [setup, setSetup] = useState<{ qrDataUrl: string; setupToken: string } | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, reset } = useForm<Pick<TwoFactorVerifyInput, "code">>({
    resolver: zodResolver(twoFactorConfirmSchema),
  });

  async function beginSetup() {
    setError(null);
    const result = await authApi.beginTwoFactorSetup();
    setSetup(result);
  }

  async function confirm(data: { code: string }) {
    if (!setup) return;
    setError(null);
    try {
      const { backupCodes: codes } = await authApi.confirmTwoFactorSetup(setup.setupToken, data.code);
      setBackupCodes(codes);
      setSetup(null);
      if (user) setUser({ ...user, totpEnabled: true });
      reset();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Invalid code.");
    }
  }

  async function disable(code: string) {
    setError(null);
    try {
      await authApi.disableTwoFactor(code);
      if (user) setUser({ ...user, totpEnabled: false });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not disable 2FA.");
    }
  }

  return (
    <section className="mb-8 max-w-sm">
      <h2 className="mb-3 text-sm font-semibold text-foreground">Two-factor authentication</h2>

      {backupCodes ? (
        <div className="glass rounded-[var(--r-md)] p-3">
          <p className="mb-2 text-sm text-foreground">Save these backup codes somewhere safe — each can be used once if you lose your device.</p>
          <div className="grid grid-cols-2 gap-1 font-mono text-xs text-foreground">
            {backupCodes.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
          <Button className="mt-3" size="sm" onClick={() => setBackupCodes(null)}>
            Done
          </Button>
        </div>
      ) : user?.totpEnabled ? (
        <TwoFactorDisableForm onDisable={disable} error={error} />
      ) : setup ? (
        <form onSubmit={handleSubmit(confirm)} className="space-y-3">
          <img src={setup.qrDataUrl} alt="2FA QR code" className="rounded-[var(--r-md)] border border-[var(--rule)]" width={180} height={180} />
          <div>
            <Label htmlFor="2fa-code">Enter the 6-digit code from your app</Label>
            <Input id="2fa-code" maxLength={6} inputMode="numeric" {...register("code")} />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit">Confirm & enable</Button>
        </form>
      ) : (
        <Button onClick={beginSetup} variant="secondary">
          Enable two-factor authentication
        </Button>
      )}
    </section>
  );
}

function TwoFactorDisableForm({ onDisable, error }: { onDisable: (code: string) => void; error: string | null }) {
  const [code, setCode] = useState("");
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">Two-factor authentication is enabled.</p>
      <Input placeholder="6-digit code to disable" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} />
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button variant="danger" size="sm" onClick={() => onDisable(code)} disabled={code.length !== 6}>
        Disable 2FA
      </Button>
    </div>
  );
}

export function ProfileSettingsPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-1 text-xl font-semibold text-foreground">Profile settings</h1>
      <p className="mb-6 text-sm text-muted-foreground">{user?.email}</p>

      <ThemeSection />
      <PasswordSection />
      <TwoFactorSection />
    </div>
  );
}
