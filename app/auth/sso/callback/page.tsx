"use client";

import { useEffect, useState } from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ShieldCheck } from "lucide-react";
import { apiFetch } from "../../../../lib/api-client";

export default function SsoCallbackPage() {
  return (
    <Suspense fallback={<CallbackShell status="Opening secure sign in..." />}>
      <SsoCallback />
    </Suspense>
  );
}

function SsoCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Finishing sign in...");

  useEffect(() => {
    async function finishSignIn() {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const oauthError = searchParams.get("error_description") || searchParams.get("error");
      if (oauthError) {
        setError(oauthError);
        return;
      }
      if (!code) {
        setError("No authorization code was returned by the identity provider.");
        return;
      }
      if (state !== sessionStorage.getItem("openleash_sso_state")) {
        setError("This sign-in request expired or does not match this browser.");
        return;
      }
      const providerType = sessionStorage.getItem("openleash_sso_provider");
      const organizationId = sessionStorage.getItem("openleash_sso_org");
      if (!providerType || !organizationId) {
        setError("Missing sign-in context. Please start again from your company login page.");
        return;
      }

      try {
        setStatus("Checking your company identity...");
        const response = await apiFetch(`${process.env.NEXT_PUBLIC_OPENLEASH_API_URL ?? "http://localhost:9319"}/auth/sso/callback`, "authSsoCallback", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            organizationId,
            providerType,
            authorizationCode: code,
            redirectUri: `${window.location.origin}/auth/sso/callback`,
            state
          })
        });
        const payload = await response.json();
        if (!response.ok || !payload.success) throw new Error(payload.message ?? "Sign in failed.");

        localStorage.setItem("openleash_dashboard_token", payload.tokens.accessToken);
        document.cookie = `openleash_dashboard_token=${encodeURIComponent(payload.tokens.accessToken)}; Path=/; SameSite=Lax; Max-Age=1209600`;
        localStorage.setItem("openleash_dashboard_expires_at", payload.tokens.expiresAt);
        localStorage.setItem("openleash_dashboard_user", JSON.stringify(payload.user));
        localStorage.setItem("openleash_dashboard_organization", JSON.stringify(payload.organization));

        sessionStorage.removeItem("openleash_sso_state");
        sessionStorage.removeItem("openleash_sso_provider");
        sessionStorage.removeItem("openleash_sso_org");
        const redirectTo = sessionStorage.getItem("openleash_auth_redirect") || "/";
        sessionStorage.removeItem("openleash_auth_redirect");

        setStatus("You are signed in. Opening OpenLeash...");
        setTimeout(() => router.replace(redirectTo as any), 350);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Sign in failed.");
      }
    }

    finishSignIn();
  }, [router, searchParams]);

  return <CallbackShell error={error} status={status} />;
}

function CallbackShell({ error, status }: { error?: string; status: string }) {
  return (
    <main className="tenantLoginShell">
      <section className="tenantLoginCard">
        <div className="tenantLoginBrand">
          <div className="tenantLoginMark">{error ? <AlertCircle size={34} /> : <ShieldCheck size={34} />}</div>
          <span>OpenLeash</span>
        </div>
        {error ? (
          <>
            <div>
              <h1>Sign in failed</h1>
              <p>{error}</p>
            </div>
            <a className="tenantLoginRetry" href="/">Back to OpenLeash</a>
          </>
        ) : (
          <>
            <div>
              <h1>Signing you in</h1>
              <p>{status}</p>
            </div>
            <div className="authSpinner" />
          </>
        )}
      </section>
    </main>
  );
}
