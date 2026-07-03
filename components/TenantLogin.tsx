"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Shield } from "lucide-react";
import { siGooglecloud, siOkta } from "simple-icons";
import { apiFetch } from "../lib/api-client";

type SsoProvider = {
  id: string;
  organizationId: string;
  providerType: string;
  providerName: string;
  enabled: boolean;
  isPrimary: boolean;
};

export function TenantLogin({
  apiUrl,
  slug,
  organizationName,
  providers,
  hostedAuthStartPath
}: {
  apiUrl: string;
  slug: string;
  organizationName: string;
  providers: SsoProvider[];
  hostedAuthStartPath?: string;
}) {
  const searchParams = useSearchParams();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function signIn(provider: SsoProvider) {
    setLoadingProvider(provider.id);
    setError("");
    try {
      const response = await apiFetch(`${apiUrl}/auth/sso/authorize`, "authSsoAuthorize", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ organizationId: provider.organizationId, providerType: provider.providerType })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Could not start sign in.");
      sessionStorage.setItem("openleash_sso_state", payload.state);
      sessionStorage.setItem("openleash_sso_provider", payload.providerType);
      sessionStorage.setItem("openleash_sso_org", payload.organizationId);
      sessionStorage.setItem("openleash_auth_redirect", searchParams.get("redirect") || "/");
      window.location.href = payload.authorizationUrl;
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not start sign in.");
      setLoadingProvider(null);
    }
  }

  function cloudOwnerHref(provider: "google" | "microsoft") {
    const redirect = searchParams.get("redirect") || `/${slug}`;
    const params = new URLSearchParams({
      provider,
      organizationSlug: slug,
      next: redirect
    });
    return `${hostedAuthStartPath}?${params.toString()}`;
  }

  return (
    <main className="tenantLoginShell">
      <section className="tenantLoginCard">
        <div className="tenantLoginBrand">
          <div className="tenantLoginMark"><img src="/openleash-icon.png" alt="" /></div>
          <span>OpenLeash</span>
        </div>
        <div>
          <h1>{organizationName || slug}</h1>
          <p>{providers.length === 0 ? "Sign in as the organization owner who created this workspace." : "Sign in with your organization identity provider."}</p>
        </div>
        {error && <div className="setupNotice danger">{error}</div>}
        <div className="tenantLoginProviders">
          {providers.length === 0 && hostedAuthStartPath ? (
            <>
              <a className="tenantLoginProviderButton" href={cloudOwnerHref("google")}>
                <ProviderMark providerType="google_workspace" />
                <span>Continue with Google Workspace</span>
              </a>
              <a className="tenantLoginProviderButton" href={cloudOwnerHref("microsoft")}>
                <ProviderMark providerType="azure_ad" />
                <span>Continue with Microsoft 365</span>
              </a>
              <div className="tenantLoginEmpty">Identity provider setup can be finished later from Settings.</div>
            </>
          ) : providers.length === 0 ? (
            <div className="tenantLoginEmpty">No identity provider is enabled yet. Finish identity setup from the admin dashboard or use a deployment session.</div>
          ) : (
            providers.map((provider) => (
              <button type="button" key={provider.id} onClick={() => signIn(provider)} disabled={Boolean(loadingProvider)}>
                {loadingProvider === provider.id ? <Loader2 size={20} className="spin" /> : <ProviderMark providerType={provider.providerType} />}
                <span>Sign in with {provider.providerName}</span>
              </button>
            ))
          )}
        </div>
        <p className="tenantLoginHelp">Tenant: <strong>{slug}</strong></p>
      </section>
    </main>
  );
}

function ProviderMark({ providerType }: { providerType: string }) {
  if (providerType === "okta") return <SimpleIcon path={siOkta.path} color={`#${siOkta.hex}`} />;
  if (providerType === "google_workspace") return <SimpleIcon path={siGooglecloud.path} color={`#${siGooglecloud.hex}`} />;
  if (providerType === "azure_ad") return <span className="microsoftMark small"><i /><i /><i /><i /></span>;
  return <Shield size={20} />;
}

function SimpleIcon({ path, color }: { path: string; color: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill={color} d={path} />
    </svg>
  );
}
