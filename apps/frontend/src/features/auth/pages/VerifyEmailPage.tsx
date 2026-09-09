import { useEffect, useState } from "react";
import { useLocation, useSearchParams, Link } from "react-router-dom";
import { MailCheck, CheckCircle2, XCircle } from "lucide-react";
import { authApi } from "../api.js";
import { ApiError } from "../../../lib/apiClient.js";
import { AuthLayout } from "../components/AuthLayout.js";
import { Spinner } from "../../../components/ui/Spinner.js";

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const location = useLocation() as { state?: { justRegistered?: boolean; email?: string } };
  const token = params.get("token");
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">(
    token ? "pending" : "idle",
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    authApi
      .verifyEmail(token)
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        setError(err instanceof ApiError ? err.message : "Verification failed");
      });
  }, [token]);

  if (status === "pending") {
    return (
      <AuthLayout title="Verifying your email…">
        <div className="flex justify-center py-4">
          <Spinner size={24} />
        </div>
      </AuthLayout>
    );
  }

  if (status === "success") {
    return (
      <AuthLayout title="Email verified">
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <CheckCircle2 className="text-primary-500" size={36} />
          <p className="text-sm text-muted-foreground">Your email is confirmed. You can now log in.</p>
          <Link to="/login" className="mt-2 font-medium text-primary-600 hover:underline">
            Go to login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (status === "error") {
    return (
      <AuthLayout title="Verification failed">
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <XCircle className="text-danger" size={36} />
          <p className="text-sm text-muted-foreground">{error}</p>
          <Link to="/login" className="mt-2 font-medium text-primary-600 hover:underline">
            Back to login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Check your inbox">
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <MailCheck className="text-primary-500" size={36} />
        <p className="text-sm text-muted-foreground">
          {location.state?.email
            ? `We sent a verification link to ${location.state.email}.`
            : "We sent you a verification link — click it to activate your account."}
        </p>
        <Link to="/login" className="mt-2 font-medium text-primary-600 hover:underline">
          Back to login
        </Link>
      </div>
    </AuthLayout>
  );
}
