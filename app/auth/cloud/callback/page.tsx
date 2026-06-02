import { apiVersionHeaders } from "@openleash/shared";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CloudGoogleCallback } from "../../../../components/CloudGoogleCallback";

export default async function CloudCallbackPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const apiUrl = process.env.OPENLEASH_API_URL ?? "http://localhost:9319";
  const params = await searchParams;
  if (first(params.desktop) === "1") return <CloudGoogleCallback apiUrl={apiUrl} />;
  const error = first(params.error_description) || first(params.error);
  const code = first(params.code);
  const exchangeRedirectUri = first(params.exchangeRedirectUri);
  if (error) return <CloudCallbackError message={error} />;
  if (!code || !exchangeRedirectUri) return <CloudCallbackError message="Google sign-in did not return a usable authorization code." />;
  const response = await fetch(`${apiUrl}/v1/mobile/auth/exchange`, {
    method: "POST",
    headers: { "content-type": "application/json", ...apiVersionHeaders("mobileAuthExchange") },
    cache: "no-store",
    body: JSON.stringify({
      redirectUri: exchangeRedirectUri,
      authorizationCode: code,
      providerType: first(params.provider) === "microsoft" ? "azure_ad" : "google",
      audience: "organization",
      organizationSlug: first(params.organizationSlug) || undefined
    })
  }).catch((err) => err instanceof Error ? err : new Error("OpenLeash could not finish sign-in."));
  if (response instanceof Error) return <CloudCallbackError message={response.message} />;
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) return <CloudCallbackError message={payload.message || payload.error || "OpenLeash could not finish sign-in."} />;
  const token = payload.token || payload.sessionToken || payload.session?.token || payload.tokens?.accessToken;
  if (!token) return <CloudCallbackError message="OpenLeash did not return a dashboard session token." />;
  const jar = await cookies();
  jar.set("openleash_dashboard_token", token, { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 14 });
  const slug = payload.organization?.slug || first(params.organizationSlug) || "openleash";
  const setupCompleted = payload.organization?.setupCompleted ?? payload.organization?.setup_completed ?? false;
  if (!setupCompleted) jar.set("openleash_onboarding_org", slug, { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 });
  redirect((safeLocalPath(first(params.next)) || (setupCompleted ? `/${encodeURIComponent(slug)}` : "/onboarding")) as any);
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function safeLocalPath(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "";
  return value;
}

function CloudCallbackError({ message }: { message: string }) {
  return (
    <main className="tenantLoginShell">
      <section className="tenantLoginCard">
        <div className="tenantLoginBrand">
          <div className="tenantLoginMark"><img src="/openleash-icon.png" alt="" /></div>
          <span>OpenLeash</span>
        </div>
        <div>
          <h1>Sign-in needs attention</h1>
          <p>{message}</p>
        </div>
        <a className="tenantLoginEmpty" href="/">Try again</a>
      </section>
    </main>
  );
}
