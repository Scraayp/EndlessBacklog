import { useQuery } from "@tanstack/react-query";
import { authApi } from "../api.js";
import { queryKeys } from "../../../lib/queryKeys.js";
import { API_URL } from "../../../lib/env.js";
import { Button } from "../../../components/ui/Button.js";

const PROVIDER_LABELS: Record<string, string> = {
  google: "Continue with Google",
  github: "Continue with GitHub",
  microsoft: "Continue with Microsoft",
  discord: "Continue with Discord",
};

export function OAuthButtons() {
  const { data } = useQuery({
    queryKey: queryKeys.oauthProviders,
    queryFn: () => authApi.oauthProviders(),
    staleTime: Infinity,
  });

  const providers = data?.providers ?? [];
  if (providers.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--rule)]" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[var(--surface)] px-2 text-muted-foreground">or</span>
        </div>
      </div>
      <div className="space-y-2">
        {providers.map((p) => (
          <Button
            key={p}
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => {
              window.location.href = `${API_URL}/api/auth/oauth/${p}`;
            }}
          >
            {PROVIDER_LABELS[p] ?? `Continue with ${p}`}
          </Button>
        ))}
      </div>
    </div>
  );
}
