import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { twoFactorVerifySchema, type TwoFactorVerifyInput } from "@endlessbacklog/shared";
import { authApi } from "../api.js";
import { useAuth } from "../useAuth.js";
import { ApiError } from "../../../lib/apiClient.js";
import { Button } from "../../../components/ui/Button.js";
import { Input, Label, FieldError } from "../../../components/ui/Input.js";
import { AuthLayout } from "../components/AuthLayout.js";

export function TwoFactorChallengePage() {
  const location = useLocation() as { state?: { pendingToken?: string } };
  const navigate = useNavigate();
  const { establishSession } = useAuth();
  const pendingToken = location.state?.pendingToken;
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TwoFactorVerifyInput>({
    resolver: zodResolver(twoFactorVerifySchema),
    defaultValues: { pendingToken: pendingToken ?? "" },
  });

  if (!pendingToken) return <Navigate to="/login" replace />;

  async function onSubmit(data: TwoFactorVerifyInput) {
    setFormError(null);
    try {
      const tokens = await authApi.verifyTwoFactor(data);
      await establishSession(tokens);
      navigate("/workspaces");
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Invalid code, please try again.");
    }
  }

  return (
    <AuthLayout title="Two-factor authentication" subtitle="Enter the 6-digit code from your authenticator app">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...register("pendingToken")} />
        <div>
          <Label htmlFor="code">Verification code</Label>
          <Input
            id="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            className="text-center text-lg tracking-[0.5em]"
            {...register("code")}
          />
          <FieldError>{errors.code?.message}</FieldError>
        </div>
        {formError && <p className="text-sm text-danger">{formError}</p>}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Verifying…" : "Verify"}
        </Button>
      </form>
    </AuthLayout>
  );
}
