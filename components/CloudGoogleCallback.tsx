"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { apiFetch } from "../lib/api-client";

export function CloudGoogleCallback({ apiUrl }: { apiUrl: string }) {
  const [error, setError] = useState("");

  useEffect(() => {
    async function finish() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const exchangeRedirectUri = params.get("exchangeRedirectUri");
      const organizationSlug = params.get("organizationSlug") || undefined;
      const provider = params.get("provider") === "microsoft" ? "azure_ad" : "google";
      const providerError = params.get("error_description") || params.get("error");
      if (providerError) {
        setError(providerError);
        return;
      }
      if (!code || !exchangeRedirectUri) {
        setError("Google sign-in did not return a usable authorization code.");
        return;
      }
      try {
        const response = await apiFetch(`${apiUrl}/v1/mobile/auth/exchange`, "mobileAuthExchange", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            redirectUri: exchangeRedirectUri,
            authorizationCode: code,
            providerType: provider,
            audience: "organization",
            organizationSlug
          })
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.message || payload.error || "OpenLeash could not finish Google sign-in.");
        const token = payload.token || payload.sessionToken || payload.session?.token || payload.tokens?.accessToken;
        if (!token) throw new Error("OpenLeash did not return a dashboard session token.");
        localStorage.setItem("openleash_dashboard_token", token);
        document.cookie = `openleash_dashboard_token=${encodeURIComponent(token)}; Path=/; SameSite=Lax; Max-Age=1209600`;
        if (payload.tokens?.expiresAt) localStorage.setItem("openleash_dashboard_expires_at", payload.tokens.expiresAt);
        if (payload.user) localStorage.setItem("openleash_dashboard_user", JSON.stringify(payload.user));
        if (payload.organization) localStorage.setItem("openleash_dashboard_organization", JSON.stringify(payload.organization));
        const slug = payload.organization?.slug || "openleash-cloud";
        document.cookie = `openleash_onboarding_org=${encodeURIComponent(slug)}; Path=/; SameSite=Lax; Max-Age=86400`;
        const next = safeLocalPath(params.get("next"));
        const destination = next || `/${encodeURIComponent(slug)}`;
        if (params.get("desktop") === "1") {
          const desktop = new URL("openleash://auth/callback");
          desktop.searchParams.set("dashboard_token", token);
          desktop.searchParams.set("api_url", apiUrl);
          if (payload.tokens?.expiresAt) desktop.searchParams.set("expires_at", payload.tokens.expiresAt);
          if (payload.organization?.slug) desktop.searchParams.set("organization_slug", payload.organization.slug);
          if (payload.organization?.name) desktop.searchParams.set("organization_name", payload.organization.name);
          if (payload.user?.email) desktop.searchParams.set("user_email", payload.user.email);
          if (payload.user?.display_name || payload.user?.name) desktop.searchParams.set("user_name", payload.user.display_name || payload.user.name);
          window.location.href = desktop.toString();
          window.setTimeout(() => window.location.replace(destination), 1200);
          return;
        }
        window.location.replace(destination);
      } catch (err) {
        setError(err instanceof Error ? err.message : "OpenLeash could not finish Google sign-in.");
      }
    }
    void finish();
  }, [apiUrl]);

  return (
    <main className="tenantLoginShell">
      <section className="tenantLoginCard">
        <div className="tenantLoginBrand">
          <div className="tenantLoginMark"><img src="/openleash-icon.png" alt="" /></div>
          <span>OpenLeash</span>
        </div>
        <div>
          <h1>{error ? "Sign-in needs attention" : "Signing you in"}</h1>
          <p>{error || "Finishing work sign-in and preparing your dashboard."}</p>
        </div>
        {!error ? <Loader2 className="spin" size={28} /> : <a className="tenantLoginEmpty" href="/auth/cloud/start">Try again</a>}
      </section>
    </main>
  );
}

function safeLocalPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "";
  return value;
}
