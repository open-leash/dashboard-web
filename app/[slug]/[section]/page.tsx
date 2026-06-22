import { notFound, redirect } from "next/navigation";
import { DashboardPage } from "../../DashboardPage";
import type { DashboardTab } from "../../../components/DashboardShell";

const sectionTabs: Record<string, DashboardTab> = {
  agents: "agents",
  compression: "compression",
  dlp: "dlp",
  deployment: "deployment",
  events: "triggers",
  "external-agents": "external-agents",
  identity: "identity",
  logs: "logs",
  mcps: "mcps",
  policies: "policies",
  security: "security",
  settings: "settings",
  setup: "setup",
  skills: "skills",
  tokens: "tokens",
  triggers: "triggers",
  usage: "usage",
  users: "users"
};

export default async function TenantSection({
  params,
  searchParams
}: {
  params: Promise<{ slug: string; section: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug, section } = await params;
  const query = await searchParams;
  const normalized = Object.fromEntries(
    Object.entries(query ?? {}).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
  );
  if (section === "triggers") {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(normalized)) {
      if (value) params.set(key, value);
    }
    redirect(`/${encodeURIComponent(slug)}/events${params.size ? `?${params.toString()}` : ""}`);
  }
  if (slug === "skills") {
    return <DashboardPage initialTab="skills" skillsSearchParams={{ ...normalized, skillId: section }} />;
  }
  if (slug === "users") {
    return <DashboardPage initialTab="users" usersSearchParams={{ ...normalized, userId: section }} />;
  }
  const initialTab = sectionTabs[section];
  if (!initialTab) notFound();
  return (
    <DashboardPage
      initialTab={initialTab}
      triggerSearchParams={initialTab === "triggers" ? normalized : undefined}
      logsSearchParams={initialTab === "logs" ? normalized : undefined}
      usageSearchParams={initialTab === "usage" ? normalized : undefined}
      securitySearchParams={initialTab === "security" ? normalized : undefined}
      skillsSearchParams={initialTab === "skills" ? normalized : undefined}
      settingsSearchParams={initialTab === "settings" || initialTab === "setup" ? normalized : undefined}
      tenantSlug={slug}
    />
  );
}
