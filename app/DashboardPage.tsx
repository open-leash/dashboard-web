import { DashboardShell, type DashboardExtensionTab, type DashboardTab, type LogsData, type McpServersData, type Overview, type SkillsData } from "../components/DashboardShell";
import { DashboardAuthGate } from "../components/DashboardAuth";
import { apiFetch } from "../lib/api-client";
import { cookies } from "next/headers";

async function getOverview(tenantSlug?: string, authToken?: string): Promise<Overview | null> {
  const api = process.env.OPENLEASH_API_URL ?? "http://localhost:9319";
  try {
    const response = await apiFetch(`${api}/admin/overview${tenantQuery(tenantSlug)}`, "adminOverview", requestOptions(authToken));
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

async function getTriggers(searchParams?: Record<string, string | undefined>, tenantSlug?: string, authToken?: string) {
  const api = process.env.OPENLEASH_API_URL ?? "http://localhost:9319";
  const query = new URLSearchParams();
  if (tenantSlug) query.set("organizationSlug", tenantSlug);
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (value) query.set(key, value);
  }
  try {
    const response = await apiFetch(`${api}/admin/triggers?${query.toString()}`, "adminTriggers", requestOptions(authToken));
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

async function getTriggerDetail(id?: string, tenantSlug?: string, authToken?: string) {
  if (!id) return null;
  const api = process.env.OPENLEASH_API_URL ?? "http://localhost:9319";
  try {
    const response = await apiFetch(`${api}/admin/triggers/${id}${tenantQuery(tenantSlug)}`, "adminTriggerDetail", requestOptions(authToken));
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

async function getLogs(searchParams?: Record<string, string | undefined>, tenantSlug?: string, authToken?: string): Promise<LogsData | null> {
  const api = process.env.OPENLEASH_API_URL ?? "http://localhost:9319";
  const query = new URLSearchParams();
  if (tenantSlug) query.set("organizationSlug", tenantSlug);
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (value) query.set(key, value);
  }
  try {
    const response = await apiFetch(`${api}/admin/logs?${query.toString()}`, "adminLogs", requestOptions(authToken));
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

async function getLogDetail(id?: string, tenantSlug?: string, authToken?: string): Promise<LogsData["logDetail"] | null> {
  if (!id) return null;
  const api = process.env.OPENLEASH_API_URL ?? "http://localhost:9319";
  try {
    const response = await apiFetch(`${api}/admin/logs/${id}${tenantQuery(tenantSlug)}`, "adminLogDetail", requestOptions(authToken));
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

async function getExternalAgents(tenantSlug?: string, authToken?: string) {
  const api = process.env.OPENLEASH_API_URL ?? "http://localhost:9319";
  try {
    const response = await apiFetch(`${api}/admin/external-agents${tenantQuery(tenantSlug)}`, "adminExternalAgents", requestOptions(authToken));
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

async function getMcpServers(tenantSlug?: string, authToken?: string): Promise<McpServersData | null> {
  const api = process.env.OPENLEASH_API_URL ?? "http://localhost:9319";
  try {
    const response = await apiFetch(`${api}/admin/mcp-servers${tenantQuery(tenantSlug)}`, "adminMcpServers", requestOptions(authToken));
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

async function getSkills(tenantSlug?: string, authToken?: string): Promise<SkillsData | null> {
  const api = process.env.OPENLEASH_API_URL ?? "http://localhost:9319";
  try {
    const response = await apiFetch(`${api}/admin/skills${tenantQuery(tenantSlug)}`, "adminSkills", requestOptions(authToken));
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

async function getOnboarding(tenantSlug?: string) {
  const api = process.env.OPENLEASH_API_URL ?? "http://localhost:9319";
  try {
    const query = tenantSlug ? `?organizationSlug=${encodeURIComponent(tenantSlug)}` : "";
    const response = await apiFetch(`${api}/admin/onboarding${query}`, "adminOnboardingRead", { cache: "no-store" });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export async function DashboardPage({
  initialTab = "overview",
  triggerId,
  logId,
  triggerSearchParams,
  logsSearchParams,
  usageSearchParams,
  skillsSearchParams,
  settingsSearchParams,
  tenantSlug,
  extensionTabs = []
}: {
  initialTab?: DashboardTab;
  triggerId?: string;
  logId?: string;
  triggerSearchParams?: Record<string, string | undefined>;
  logsSearchParams?: Record<string, string | undefined>;
  usageSearchParams?: Record<string, string | undefined>;
  skillsSearchParams?: Record<string, string | undefined>;
  settingsSearchParams?: Record<string, string | undefined>;
  tenantSlug?: string;
  extensionTabs?: DashboardExtensionTab[];
}) {
  const apiUrl = process.env.OPENLEASH_API_URL ?? "http://localhost:9319";
  const deploymentMode = (process.env.OPENLEASH_DEPLOYMENT_MODE ?? process.env.OPENLEASH_EDITION ?? "cloud").toLowerCase().includes("private") || (process.env.OPENLEASH_DEPLOYMENT_MODE ?? "").toLowerCase().includes("onprem") ? "private" : "cloud";
  const tenantDomain = process.env.OPENLEASH_TENANT_DOMAIN ?? "openleash.com";
  const authToken = await dashboardSessionCookie();
  const [data, triggerData, triggerDetail, logsData, logDetail, externalAgents, mcpServers, skills, onboardingData] = await Promise.all([
    getOverview(tenantSlug, authToken),
    initialTab === "triggers" ? getTriggers(triggerSearchParams, tenantSlug, authToken) : Promise.resolve(null),
    triggerId ? getTriggerDetail(triggerId, tenantSlug, authToken) : Promise.resolve(null),
    initialTab === "logs" ? getLogs(logsSearchParams, tenantSlug, authToken) : Promise.resolve(null),
    logId ? getLogDetail(logId, tenantSlug, authToken) : Promise.resolve(null),
    initialTab === "external-agents" ? getExternalAgents(tenantSlug, authToken) : Promise.resolve(null),
    initialTab === "mcps" ? getMcpServers(tenantSlug, authToken) : Promise.resolve(null),
    initialTab === "skills" ? getSkills(tenantSlug, authToken) : Promise.resolve(null),
    getOnboarding(tenantSlug)
  ]);
  const shell = (
    <DashboardShell
      apiUrl={apiUrl}
      data={data}
      initialTab={initialTab}
      triggerData={triggerData}
      triggerDetail={triggerDetail}
      logsData={logDetail ? { logs: [], logDetail } : logsData}
      triggerSearchParams={triggerSearchParams}
      logsSearchParams={logsSearchParams}
      usageSearchParams={usageSearchParams}
      skillsSearchParams={skillsSearchParams}
      settingsSearchParams={settingsSearchParams}
      externalAgents={externalAgents}
      mcpServers={mcpServers}
      skills={skills}
      onboardingData={onboardingData}
      deploymentMode={deploymentMode}
      tenantDomain={tenantDomain}
      tenantSlug={tenantSlug}
      dashboardMode={dashboardModeFor(onboardingData, tenantSlug)}
      extensionTabs={extensionTabs}
    />
  );
  if (onboardingData && dashboardModeFor(onboardingData, tenantSlug) === "organization") {
    return (
      <DashboardAuthGate apiUrl={apiUrl} organizationSlug={tenantSlug ?? onboardingData.organization.slug ?? "openleash"}>
        {shell}
      </DashboardAuthGate>
    );
  }
  return shell;
}

function tenantQuery(tenantSlug?: string) {
  return tenantSlug ? `?organizationSlug=${encodeURIComponent(tenantSlug)}` : "";
}

function requestOptions(authToken?: string): RequestInit {
  return {
    cache: "no-store",
    headers: authToken ? { authorization: `Bearer ${authToken}` } : undefined
  };
}

async function dashboardSessionCookie() {
  try {
    return (await cookies()).get("openleash_dashboard_token")?.value;
  } catch {
    return undefined;
  }
}

function dashboardModeFor(onboardingData: Awaited<ReturnType<typeof getOnboarding>>, tenantSlug?: string) {
  const slug = (tenantSlug ?? onboardingData?.organization?.slug ?? "").toLowerCase();
  const name = (onboardingData?.organization?.name ?? "").toLowerCase();
  if (slug.startsWith("personal-") || name.endsWith("'s openleash")) return "personal" as const;
  return "organization" as const;
}
