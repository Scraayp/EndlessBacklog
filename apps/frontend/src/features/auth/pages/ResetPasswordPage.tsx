import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { passwordSchema } from "@endlessbacklog/shared";
import { authApi } from "../api.js";
import { ApiError } from "../../../lib/apiClient.js";
import { Button } from "../../../components/ui/Button.js";
import { Input, Label, FieldError } from "../../../components/ui/Input.js";
import { AuthLayout } from "../components/AuthLayout.js";

const formSchema = z.object({ password: passwordSchema });
type FormValues = z.infer<typeof formSchema>;

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) });

  async function onSubmit(data: FormValues) {
    if (!token) return;
    setFormError(null);
    try {
      await authApi.resetPassword(token, data.password);
      navigate("/login", { state: { passwordReset: true } });
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "That reset link is invalid or has expired.");
    }
  }

  if (!token) {
    return (
      <AuthLayout title="Invalid link">
        <p className="text-center text-sm text-muted-foreground">
          This password reset link is missing its token.
        </p>
        <Link to="/forgot-password" className="mt-4 block text-center font-medium text-primary-600 hover:underline">
          Request a new link
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Choose a new password">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="password">New password</Label>
          <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
          <FieldError>{errors.password?.message}</FieldError>
        </div>
        {formError && <p className="text-sm text-danger">{formError}</p>}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Reset password"}
        </Button>
      </form>
    </AuthLayout>
  );
}
