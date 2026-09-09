import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { authApi } from "../api.js";
import { useAuth } from "../useAuth.js";
import { ApiError } from "../../../lib/apiClient.js";
import { AuthLayout } from "../components/AuthLayout.js";
import { Spinner } from "../../../components/ui/Spinner.js";

export function OAuthCallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { establishSession } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const code = params.get("code");
    if (!code) {
      setError("Missing OAuth exchange code.");
      return;
    }

    authApi
      .oauthExchange(code)
      .then(async (tokens) => {
        await establishSession(tokens);
        navigate("/workspaces", { replace: true });
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "OAuth sign-in failed.");
      });
  }, [params, navigate, establishSession]);

  if (error) {
    return (
      <AuthLayout title="Sign-in failed">
        <p className="text-center text-sm text-danger">{error}</p>
        <Link to="/login" className="mt-4 block text-center font-medium text-primary-600 hover:underline">
          Back to login
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Signing you in…">
      <div className="flex justify-center py-4">
        <Spinner size={24} />
      </div>
    </AuthLayout>
  );
}
