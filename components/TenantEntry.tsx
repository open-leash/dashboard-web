"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, Building2, Loader2 } from "lucide-react";
import { apiFetch } from "../lib/api-client";

export function TenantEntry({
  apiUrl,
  tenantDomain,
  hostedAuthStartPath
}: {
  apiUrl: string;
  tenantDomain: string;
  hostedAuthStartPath?: string;
}) {
  const [organizationUrl, setOrganizationUrl] = useState("");
  const [busy, setBusy] = useState<"signin" | "google" | "microsoft" | null>(null);
  const [error, setError] = useState("");
  const [finishingClientSetup, setFinishingClientSetup] = useState(false);

  useEffect(() => {
    const clientSetup = new URLSearchParams(window.location.search).get("client_setup") === "complete";
    if (clientSetup) return;
    localStorage.removeItem("openleash_dashboard_token");
    localStorage.removeItem("openleash_dashboard_expires_at");
    localStorage.removeItem("openleash_dashboard_user");
    localStorage.removeItem("openleash_dashboard_organization");
    clearTransientAuthState();
  }, []);

  useEffect(() => {
    async function finishClientSetup() {
      const query = new URLSearchParams(window.location.search);
      const clientSetup = query.get("client_setup") === "complete";
      if (!clientSetup) return;

      setFinishingClientSetup(true);
      setBusy("signin");
      setError("");
      const handoff = fragmentParams(window.location.hash);
      const token = handoff.get("dashboard_token") || handoff.get("token") || localStorage.getItem("openleash_dashboard_token");
      const expiresAt = handoff.get("expires_at");
      const handoffSlug = slugify(handoff.get("organization_slug") ?? "");
      const handoffEmail = handoff.get("user_email") ?? "";
      if (token) localStorage.setItem("openleash_dashboard_token", token);
      if (token) document.cookie = `openleash_dashboard_token=${encodeURIComponent(token)}; Path=/; SameSite=Lax; Max-Age=1209600`;
      if (expiresAt) localStorage.setItem("openleash_dashboard_expires_at", expiresAt);
      if (handoffEmail) {
        localStorage.setItem("openleash_dashboard_user", JSON.stringify({
          id: "desktop-handoff",
          email: handoffEmail,
          display_name: handoffEmail,
          role: "admin"
        }));
      }
      if (handoffSlug) {
        localStorage.setItem("openleash_dashboard_organization", JSON.stringify({
          id: "desktop-handoff",
          name: handoffSlug,
          slug: handoffSlug
        }));
      }
      clearTransientAuthState();
      window.history.replaceState(null, "", window.location.pathname || "/");

      if (!token) {
        setError("Desktop setup finished, but the browser did not receive a dashboard session. Sign in once to continue.");
        setBusy(null);
        setFinishingClientSetup(false);
        return;
      }
      if (handoffSlug) {
        window.location.replace(`/${encodeURIComponent(handoffSlug)}`);
        return;
      }

      try {
        const response = await apiFetch(`${apiUrl}/auth/session`, "authSession", {
          headers: { authorization: `Bearer ${token}` }
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || "Your dashboard session is no longer valid.");
        if (payload.user) localStorage.setItem("openleash_dashboard_user", JSON.stringify(payload.user));
        if (payload.organization) localStorage.setItem("openleash_dashboard_organization", JSON.stringify(payload.organization));
        const slug = payload.organization?.slug;
        if (!slug) throw new Error("OpenLeash could not find your organization workspace.");
        window.location.replace(`/${encodeURIComponent(slug)}`);
      } catch (err) {
        localStorage.removeItem("openleash_dashboard_token");
        document.cookie = "openleash_dashboard_token=; Path=/; SameSite=Lax; Max-Age=0";
        localStorage.removeItem("openleash_dashboard_expires_at");
        localStorage.removeItem("openleash_dashboard_user");
        localStorage.removeItem("openleash_dashboard_organization");
        setError(errorMessageForSetupFinish(err));
        setBusy(null);
        setFinishingClientSetup(false);
      }
    }

    void finishClientSetup();
  }, [apiUrl]);

  function clearTransientAuthState() {
    sessionStorage.removeItem("openleash_auth_redirect");
    sessionStorage.removeItem("openleash_sso_state");
    sessionStorage.removeItem("openleash_sso_provider");
    sessionStorage.removeItem("openleash_sso_org");
  }

  function signIn(event: FormEvent) {
    event.preventDefault();
    const target = organizationSlugFromUrl(organizationUrl, tenantDomain);
    if (!target) {
      setError("Enter your organization URL first.");
      return;
    }
    setBusy("signin");
    window.location.href = `/${encodeURIComponent(target)}/auth/login?redirect=${encodeURIComponent(`/${target}`)}`;
  }

  function startWorkSignIn(provider: "google" | "microsoft") {
    if (!hostedAuthStartPath) return;
    setError("");
    setBusy(provider);
    window.location.href = `${hostedAuthStartPath}?provider=${provider}`;
  }

  return (
    <main className="tenantEntryShell">
      <section className="tenantEntryCard">
        <div className="tenantLoginBrand">
          <div className="tenantLoginMark"><img src="/openleash-icon.png" alt="" /></div>
          <span>OpenLeash</span>
        </div>
        <div>
          <h1>{finishingClientSetup ? "Opening your workspace" : "Open your organization"}</h1>
          <p>{finishingClientSetup ? "Finishing desktop setup and taking you to the right OpenLeash workspace." : hostedAuthStartPath ? "Use your work Google Workspace or Microsoft 365 account, or enter an existing workspace URL." : "Enter your self-hosted OpenLeash workspace URL to continue."}</p>
        </div>
        {error ? <div className="setupNotice danger">{error}</div> : null}
        {finishingClientSetup && !error ? <Loader2 className="spin" size={28} /> : null}
        {!finishingClientSetup || error ? (
          <>
            {hostedAuthStartPath ? <div className="tenantEntryForm">
              <button type="button" disabled={busy !== null} onClick={() => startWorkSignIn("google")}>
                {busy === "google" ? <Loader2 size={18} className="spin" /> : <>Continue with Google Workspace <ArrowRight size={18} /></>}
              </button>
              <button type="button" disabled={busy !== null} onClick={() => startWorkSignIn("microsoft")}>
                {busy === "microsoft" ? <Loader2 size={18} className="spin" /> : <>Continue with Microsoft 365 <ArrowRight size={18} /></>}
              </button>
            </div> : null}
            {hostedAuthStartPath ? <div className="setupNotice">
              <Building2 size={18} />
              <span>If your organization already exists, you will be signed in. If it does not, onboarding starts automatically for your company domain.</span>
            </div> : null}
            {hostedAuthStartPath ? <div className="tenantEntryDivider"><span>or</span></div> : null}
            <form className="tenantEntryForm" onSubmit={signIn}>
              <label>
                <span>Already have an OpenLeash workspace URL?</span>
                <input value={organizationUrl} onChange={(event) => setOrganizationUrl(event.target.value)} placeholder={`https://company.${tenantDomain}`} autoFocus />
              </label>
              <button type="submit" disabled={busy !== null}>
                {busy === "signin" ? <Loader2 size={18} className="spin" /> : <>Continue <ArrowRight size={18} /></>}
              </button>
            </form>
          </>
        ) : null}
      </section>
    </main>
  );
}

function fragmentParams(hash: string) {
  return new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);
}

function errorMessageForSetupFinish(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  if (!message || message.toLowerCase().includes("fetch")) {
    return "Desktop setup finished, but the dashboard API is not reachable from this browser. Start the OpenLeash dashboard API and reload the workspace.";
  }
  return message;
}

function organizationSlugFromUrl(value: string, tenantDomain: string) {
  const raw = value.trim();
  if (!raw) return "";
  const normalizedTenantDomain = tenantDomain.replace(/^https?:\/\//, "").replace(/\/+$/, "").toLowerCase();
  const withProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(withProtocol);
    const host = url.hostname.toLowerCase();
    const pathSlug = url.pathname.split("/").filter(Boolean)[0];
    if (host === "localhost" || host === "127.0.0.1" || host === "::1") return slugify(pathSlug ?? "");
    if (host === normalizedTenantDomain && pathSlug) return slugify(pathSlug);
    if (host.endsWith(`.${normalizedTenantDomain}`)) {
      const subdomain = host.slice(0, -(normalizedTenantDomain.length + 1)).split(".").pop() ?? "";
      return slugify(subdomain);
    }
    return slugify(pathSlug || host.split(".")[0] || raw);
  } catch {
    return slugify(raw);
  }
}
