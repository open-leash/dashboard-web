import { TenantLogin } from "../../../../components/TenantLogin";
import { redirect } from "next/navigation";
import { apiFetch } from "../../../../lib/api-client";

async function fetchJson<T>(url: string, functionName: "organizationsRead" | "organizationSsoProviders"): Promise<T | null> {
  try {
    const response = await apiFetch(url, functionName, { cache: "no-store" });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export default async function TenantLoginPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const apiUrl = process.env.OPENLEASH_API_URL ?? "http://localhost:9319";
  const [organization, sso] = await Promise.all([
    fetchJson<{ name: string; slug: string; setupCompleted?: boolean }>(`${apiUrl}/organizations/${encodeURIComponent(slug)}`, "organizationsRead"),
    fetchJson<{ providers: Array<{ id: string; organizationId: string; providerType: string; providerName: string; enabled: boolean; isPrimary: boolean }> }>(`${apiUrl}/organizations/${encodeURIComponent(slug)}/sso-providers`, "organizationSsoProviders")
  ]);
  if (!organization) redirect("/");
  if (!organization.setupCompleted && (sso?.providers ?? []).length === 0) redirect(`/${encodeURIComponent(slug)}`);
  return <TenantLogin apiUrl={apiUrl} slug={slug} organizationName={organization?.name ?? slug} providers={sso?.providers ?? []} />;
}
