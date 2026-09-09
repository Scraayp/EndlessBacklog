import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { forgotPasswordSchema } from "@endlessbacklog/shared";
import type { z } from "zod";
import { authApi } from "../api.js";
import { Button } from "../../../components/ui/Button.js";
import { Input, Label, FieldError } from "../../../components/ui/Input.js";
import { AuthLayout } from "../components/AuthLayout.js";

type FormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(data: FormValues) {
    await authApi.forgotPassword(data.email);
    setSent(true);
  }

  if (sent) {
    return (
      <AuthLayout title="Check your inbox">
        <p className="text-center text-sm text-muted-foreground">
          If an account exists for that email, we've sent a link to reset your password.
        </p>
        <Link to="/login" className="mt-4 block text-center font-medium text-primary-600 hover:underline">
          Back to login
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset your password" subtitle="We'll email you a reset link">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
          <FieldError>{errors.email?.message}</FieldError>
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Sending…" : "Send reset link"}
        </Button>
      </form>
      <Link to="/login" className="mt-4 block text-center text-sm text-muted-foreground hover:underline">
        Back to login
      </Link>
    </AuthLayout>
  );
}
