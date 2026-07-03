import { DashboardShell, type DashboardExtensionTab, type DashboardTab, type DebugLogsData, type LogsData, type McpServersData, type Overview, type ProviderUsageData, type SecurityData, type SkillsData } from "../components/DashboardShell";
import { DashboardAuthGate } from "../components/DashboardAuth";
import { apiFetch } from "../lib/api-client";
import { cookies } from "next/headers";

type DashboardAuthSession = {
  user?: { id?: string; email?: string; display_name?: string; role?: string };
  organization?: { id?: string; name?: string; slug?: string; region?: string | null };
  account?: { audience?: "individual" | "organization"; packageId?: string | null };
};

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

async function getDebugLogs(searchParams?: Record<string, string | undefined>, tenantSlug?: string, authToken?: string): Promise<DebugLogsData | null> {
  const api = process.env.OPENLEASH_API_URL ?? "http://localhost:9319";
  const query = new URLSearchParams();
  if (tenantSlug) query.set("organizationSlug", tenantSlug);
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (value) query.set(key, value);
  }
  try {
    const response = await apiFetch(`${api}/admin/debug?${query.toString()}`, "adminLogs", requestOptions(authToken));
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

async function getProviderUsage(searchParams?: Record<string, string | undefined>, tenantSlug?: string, authToken?: string): Promise<ProviderUsageData | null> {
  const api = process.env.OPENLEASH_API_URL ?? "http://localhost:9319";
  const query = new URLSearchParams();
  if (tenantSlug) query.set("organizationSlug", tenantSlug);
  if (searchParams?.range === "7d") query.set("days", "7");
  if (searchParams?.range === "30d") query.set("days", "30");
  if (searchParams?.range === "all") query.set("days", "180");
  try {
    const response = await apiFetch(`${api}/admin/provider-usage?${query.toString()}`, "adminProviderUsageRead", requestOptions(authToken));
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

async function getSecurity(searchParams?: Record<string, string | undefined>, tenantSlug?: string, authToken?: string): Promise<SecurityData | null> {
  const api = process.env.OPENLEASH_API_URL ?? "http://localhost:9319";
  const query = new URLSearchParams();
  if (tenantSlug) query.set("organizationSlug", tenantSlug);
  if (searchParams?.range === "7d") query.set("days", "7");
  if (searchParams?.range === "30d") query.set("days", "30");
  if (searchParams?.range === "all") query.set("days", "180");
  const outcomeQuery = new URLSearchParams(query);
  outcomeQuery.set("domain", "security");
  try {
    const [response, outcomesResponse] = await Promise.all([
      apiFetch(`${api}/admin/security?${query.toString()}`, "adminSecurity", requestOptions(authToken)),
      apiFetch(`${api}/admin/outcomes?${outcomeQuery.toString()}`, "adminOutcomes", requestOptions(authToken))
    ]);
    if (!response.ok) return null;
    const data = await response.json();
    if (outcomesResponse.ok) {
      const outcomes = await outcomesResponse.json().catch(() => ({}));
      data.outcomes = Array.isArray(outcomes.outcomes) ? outcomes.outcomes : [];
      data.viewModel = outcomes.viewModel;
    }
    return data;
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

async function getAuthSession(authToken?: string): Promise<DashboardAuthSession | null> {
  if (!authToken) return null;
  const api = process.env.OPENLEASH_API_URL ?? "http://localhost:9319";
  try {
    const response = await apiFetch(`${api}/auth/session`, "authSession", requestOptions(authToken));
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
  debugSearchParams,
  usageSearchParams,
  securitySearchParams,
  usersSearchParams,
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
  debugSearchParams?: Record<string, string | undefined>;
  usageSearchParams?: Record<string, string | undefined>;
  securitySearchParams?: Record<string, string | undefined>;
  usersSearchParams?: Record<string, string | undefined>;
  skillsSearchParams?: Record<string, string | undefined>;
  settingsSearchParams?: Record<string, string | undefined>;
  tenantSlug?: string;
  extensionTabs?: DashboardExtensionTab[];
}) {
  const apiUrl = process.env.OPENLEASH_API_URL ?? "http://localhost:9319";
  const clientApiUrl = process.env.OPENLEASH_CLIENT_API_URL ?? process.env.NEXT_PUBLIC_CLOUD_CLIENT_API_URL ?? "http://localhost:9318";
  const deploymentMode = (process.env.OPENLEASH_DEPLOYMENT_MODE ?? process.env.OPENLEASH_EDITION ?? "cloud").toLowerCase().includes("private") || (process.env.OPENLEASH_DEPLOYMENT_MODE ?? "").toLowerCase().includes("onprem") ? "private" : "cloud";
  const tenantDomain = process.env.OPENLEASH_TENANT_DOMAIN ?? "openleash.com";
  const authToken = await dashboardSessionCookie();
  const authSession = await getAuthSession(authToken);
  const dashboardMode = dashboardModeFor(authSession, tenantSlug);
  const safeInitialTab = tabForDashboardMode(initialTab, dashboardMode);
  const [data, triggerData, triggerDetail, logsData, debugLogsData, logDetail, externalAgents, providerUsage, securityData, mcpServers, skills, onboardingData] = await Promise.all([
    getOverview(tenantSlug, authToken),
    safeInitialTab === "triggers" ? getTriggers(triggerSearchParams, tenantSlug, authToken) : Promise.resolve(null),
    safeInitialTab === "triggers" && triggerId ? getTriggerDetail(triggerId, tenantSlug, authToken) : Promise.resolve(null),
    safeInitialTab === "logs" ? getLogs(logsSearchParams, tenantSlug, authToken) : Promise.resolve(null),
    safeInitialTab === "debug" || safeInitialTab === "log" ? getDebugLogs(debugSearchParams, tenantSlug, authToken) : Promise.resolve(null),
    safeInitialTab === "logs" && logId ? getLogDetail(logId, tenantSlug, authToken) : Promise.resolve(null),
    safeInitialTab === "external-agents" ? getExternalAgents(tenantSlug, authToken) : Promise.resolve(null),
    safeInitialTab === "usage" ? getProviderUsage(usageSearchParams, tenantSlug, authToken) : Promise.resolve(null),
    safeInitialTab === "security" ? getSecurity(securitySearchParams, tenantSlug, authToken) : Promise.resolve(null),
    safeInitialTab === "mcps" ? getMcpServers(tenantSlug, authToken) : Promise.resolve(null),
    safeInitialTab === "skills" ? getSkills(tenantSlug, authToken) : Promise.resolve(null),
    getOnboarding(tenantSlug)
  ]);
  const shell = (
    <DashboardShell
      apiUrl={apiUrl}
      clientApiUrl={clientApiUrl}
      data={data}
      initialTab={safeInitialTab}
      triggerData={triggerData}
      triggerDetail={triggerDetail}
      logsData={logDetail ? { logs: [], logDetail } : logsData}
      debugLogsData={debugLogsData}
      triggerSearchParams={triggerSearchParams}
      logsSearchParams={logsSearchParams}
      debugSearchParams={debugSearchParams}
      usageSearchParams={usageSearchParams}
      securitySearchParams={securitySearchParams}
      usersSearchParams={usersSearchParams}
      skillsSearchParams={skillsSearchParams}
      settingsSearchParams={settingsSearchParams}
      externalAgents={externalAgents}
      providerUsage={providerUsage}
      securityData={securityData}
      mcpServers={mcpServers}
      skills={skills}
      onboardingData={onboardingData}
      deploymentMode={deploymentMode}
      tenantDomain={tenantDomain}
      tenantSlug={tenantSlug}
      dashboardMode={dashboardMode}
      extensionTabs={extensionTabs}
    />
  );
  return (
    <DashboardAuthGate apiUrl={apiUrl} organizationSlug={tenantSlug ?? authSession?.organization?.slug ?? onboardingData?.organization.slug ?? "openleash"} requireAdmin={dashboardMode === "organization"}>
      {shell}
    </DashboardAuthGate>
  );
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
    const value = (await cookies()).get("openleash_dashboard_token")?.value;
    return value ? decodeURIComponent(value) : undefined;
  } catch {
    return undefined;
  }
}

function dashboardModeFor(authSession: DashboardAuthSession | null, tenantSlug?: string) {
  if (!authSession) return tenantSlug ? "organization" as const : "personal" as const;
  if (authSession.account?.audience === "individual") return "personal" as const;
  if (!isDashboardRole(authSession.user?.role)) return "personal" as const;
  return "organization" as const;
}

function tabForDashboardMode(tab: DashboardTab, mode: "organization" | "personal"): DashboardTab {
  if (mode === "organization") return tab;
  const allowed = new Set<DashboardTab>(["overview", "agents", "usage", "triggers", "logs", "debug", "log", "skills", "mcps", "policies", "tokens", "settings"]);
  return allowed.has(tab) ? tab : "overview";
}

function isDashboardRole(role: unknown) {
  return ["owner", "admin", "ciso", "security_admin"].includes(String(role ?? "").toLowerCase());
}
