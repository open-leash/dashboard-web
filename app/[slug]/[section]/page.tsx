import { notFound } from "next/navigation";
import { DashboardPage } from "../../DashboardPage";
import type { DashboardTab } from "../../../components/DashboardShell";

const sectionTabs: Record<string, DashboardTab> = {
  agents: "agents",
  deployment: "deployment",
  "external-agents": "external-agents",
  identity: "identity",
  logs: "logs",
  mcps: "mcps",
  policies: "policies",
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
  if (slug === "skills") {
    return <DashboardPage initialTab="skills" skillsSearchParams={{ ...normalized, skillId: section }} />;
  }
  const initialTab = sectionTabs[section];
  if (!initialTab) notFound();
  return (
    <DashboardPage
      initialTab={initialTab}
      triggerSearchParams={initialTab === "triggers" ? normalized : undefined}
      logsSearchParams={initialTab === "logs" ? normalized : undefined}
      usageSearchParams={initialTab === "usage" ? normalized : undefined}
      skillsSearchParams={initialTab === "skills" ? normalized : undefined}
      settingsSearchParams={initialTab === "settings" || initialTab === "setup" ? normalized : undefined}
      tenantSlug={slug}
    />
  );
}
