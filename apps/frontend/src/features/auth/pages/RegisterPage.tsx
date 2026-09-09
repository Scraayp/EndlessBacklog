import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { registerSchema, type RegisterInput } from "@endlessbacklog/shared";
import { authApi } from "../api.js";
import { ApiError } from "../../../lib/apiClient.js";
import { Button } from "../../../components/ui/Button.js";
import { Input, Label, FieldError } from "../../../components/ui/Input.js";
import { AuthLayout } from "../components/AuthLayout.js";
import { OAuthButtons } from "../components/OAuthButtons.js";

export function RegisterPage() {
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(data: RegisterInput) {
    setFormError(null);
    try {
      await authApi.register(data);
      navigate("/verify-email", { state: { justRegistered: true, email: data.email } });
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="Start planning in minutes">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="displayName">Name</Label>
          <Input id="displayName" autoComplete="name" {...register("displayName")} />
          <FieldError>{errors.displayName?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
          <FieldError>{errors.email?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
          <FieldError>{errors.password?.message}</FieldError>
        </div>
        {formError && <p className="text-sm text-danger">{formError}</p>}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
      <OAuthButtons />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-primary-600 hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
