import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { loginSchema, type LoginInput } from "@endlessbacklog/shared";
import { authApi } from "../api.js";
import { useAuth } from "../useAuth.js";
import { ApiError } from "../../../lib/apiClient.js";
import { Button } from "../../../components/ui/Button.js";
import { Input, Label, FieldError } from "../../../components/ui/Input.js";
import { AuthLayout } from "../components/AuthLayout.js";
import { OAuthButtons } from "../components/OAuthButtons.js";

export function LoginPage() {
  const navigate = useNavigate();
  const { establishSession } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    setFormError(null);
    try {
      const result = await authApi.login(data);
      if (authApi.isPending(result)) {
        navigate("/2fa-challenge", { state: { pendingToken: result.pendingToken } });
        return;
      }
      await establishSession(result);
      navigate("/workspaces");
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to your workspaces">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
          <FieldError>{errors.email?.message}</FieldError>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-primary-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
          <FieldError>{errors.password?.message}</FieldError>
        </div>
        {formError && <p className="text-sm text-danger">{formError}</p>}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Logging in…" : "Log in"}
        </Button>
      </form>
      <OAuthButtons />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link to="/register" className="font-medium text-primary-600 hover:underline">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}
