import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  Ban,
  Bell,
  Bot,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  Code2,
  Database,
  FileClock,
  GitBranch,
  Home,
  MonitorDown,
  KeyRound,
  Laptop,
  Lock,
  Moon,
  Package,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users
} from "lucide-react";
import { PolicyManager } from "./PolicyManager";
import { DeploymentTokenIssuer } from "./DeploymentTokenIssuer";
import { TokenIssuer } from "./TokenIssuer";
import { EnterpriseOnboarding, IdentityManager, type OnboardingData } from "./EnterpriseOnboarding";
import { DashboardSignOutButton, DashboardUserChip } from "./DashboardAuth";

export type Overview = {
  metrics: {
    computers: string;
    agents: string;
    events: string;
    denied: string;
    questions: string;
    session_time?: {
      today_seconds?: string | number;
      today_sessions?: string | number;
      last24h_seconds?: string | number;
      last24h_sessions?: string | number;
      week_seconds?: string | number;
      week_sessions?: string | number;
      month_seconds?: string | number;
      month_sessions?: string | number;
    };
  };
  agents: Array<{
    id: string;
    kind: string;
    display_name: string;
    version?: string;
    hostname: string;
    user_name?: string;
    last_seen_at: string;
    sessions?: Array<{
      id: string;
      title?: string;
      summary?: string;
      project_path?: string;
      last_activity_at?: string;
      duration_seconds?: string | number;
      event_count?: string | number;
    }>;
  }>;
  usage?: {
    sessions?: UsageSession[];
  };
  users?: Array<{
    id: string;
    email: string;
    display_name: string;
    role: string;
    created_at: string;
    endpoint_count?: string | number;
    agent_count?: string | number;
    last_seen_at?: string | null;
    agents?: string[];
    hostnames?: string[];
  }>;
  recent: Array<{
    id: string;
    decision: "allow" | "deny" | "ask";
    summary: string;
    question?: string;
    prompt?: string | null;
    created_at: string;
    event_name: string;
    tool_name?: string;
    project_path?: string;
    agent_name: string;
    hostname: string;
    user_name?: string;
    triggered_policies?: Array<{
      policy_name: string;
      status: "failed" | "needs_question";
      severity: string;
      explanation: string;
      evidence?: string[] | string;
    }>;
  }>;
  policies: Array<{
    id: string;
    name: string;
    category?: string;
    description: string;
    severity: string;
    natural_language_rule: string;
    enabled: boolean;
    locked?: boolean;
    trigger_count?: string | number;
    deny_count?: string | number;
    question_count?: string | number;
    last_triggered_at?: string | null;
    last_agent_name?: string | null;
    last_project_path?: string | null;
  }>;
};

type UsageSession = {
  id: string;
  session_id?: string;
  title?: string;
  summary?: string;
  project_path?: string | null;
  started_at?: string;
  last_activity_at?: string;
  duration_seconds?: string | number;
  subagent_seconds?: string | number;
  orchestrator_seconds?: string | number;
  subagent_count?: string | number;
  event_count?: string | number;
  approval_count?: string | number;
  denied_count?: string | number;
  user_id?: string;
  user_email?: string;
  user_name?: string;
  hostname?: string;
  agent_kind?: string;
  agent_name?: string;
};

export type TriggerItem = Overview["recent"][number] & {
  event_id?: string;
  resolution?: string | null;
  prompt?: string | null;
  agent_kind?: string;
};

export type TriggerDetail = {
  trigger: TriggerItem & {
    session_id: string;
    payload: unknown;
    occurred_at: string;
    resolved_at?: string | null;
    resolved_by?: string | null;
    model?: string | null;
    agent_version?: string | null;
    platform?: string;
    user_email?: string;
    policy_results: Array<{
      policy_name: string;
      status: "passed" | "failed" | "needs_question";
      severity: string;
      explanation: string;
      evidence?: string[] | string;
      question?: string | null;
      created_at: string;
    }>;
  };
};

type ConversationTurnView = {
  role: string;
  content: string;
  at?: string;
};

export type CoreDashboardTab = "overview" | "usage" | "setup" | "settings" | "triggers" | "users" | "identity" | "agents" | "external-agents" | "mcps" | "skills" | "policies" | "tokens" | "deployment";
export type DashboardTab = CoreDashboardTab | (string & {});
export type DashboardExtensionTab = {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  badge?: number;
  showInPersonal?: boolean;
  render: (context: DashboardExtensionContext) => React.ReactNode;
};
export type DashboardExtensionContext = {
  apiUrl: string;
  basePath: string;
  tenantSlug?: string;
  deploymentMode: "cloud" | "private";
  dashboardMode: DashboardMode;
  onboardingData?: OnboardingData | null;
};
type DashboardMode = "organization" | "personal";

export type McpServersData = {
  servers: Array<{
    id: string;
    server_name: string;
    first_seen_at: string;
    last_seen_at: string;
    tool_count: string | number;
    call_count: string | number;
    user_count: string | number;
    tools?: Array<{ tool_name: string }>;
    users?: Array<{ id?: string; name?: string; email?: string }>;
    recent_calls?: Array<{
      id: string;
      tool_name: string;
      argument_summary?: string | null;
      project_path?: string | null;
      decision?: string | null;
      risk_level?: string | null;
      occurred_at: string;
      agent_name?: string | null;
      hostname?: string | null;
      user_name?: string | null;
    }>;
  }>;
};

export type SkillsData = {
  skills: Array<{
    id: string;
    agent_kind: string;
    agent_name: string;
    scope: string;
    project_path?: string | null;
    skill_name: string;
    skill_path: string;
    status: string;
    risk_score: string | number;
    reasons?: Array<{ reason: string; quote?: string }>;
    updated_at: string;
    user_name?: string | null;
    user_email?: string | null;
  }>;
  events: Array<{
    id: string;
    skill_name: string;
    skill_path: string;
    status: string;
    risk_score: string | number;
    reasons?: Array<{ reason: string; quote?: string }>;
    created_at: string;
    user_name?: string | null;
  }>;
};

export type ExternalAgentsData = {
  connectors: Array<{
    provider: string;
    label: string;
    configured: boolean;
    missing: string[];
    notes: string[];
    agents: Array<{
      provider: string;
      id: string;
      displayName: string;
      status: string;
      source: string;
      conversationIds?: string[];
    }>;
  }>;
  known: Array<{
    id: string;
    kind: string;
    display_name: string;
    hostname: string;
    user_name?: string;
    session_id?: string;
    latest_event_at?: string;
    latest_evaluation_id?: string;
    decision?: "allow" | "deny" | "ask";
    summary?: string;
  }>;
};

const agentPalette = [
  { bg: "#f08a55", fg: "white", letter: "C" },
  { bg: "#0f1115", fg: "white", letter: "C" },
  { bg: "#4f86f7", fg: "white", letter: "G" },
  { bg: "#10a37f", fg: "white", letter: "O" },
  { bg: "#22a3b8", fg: "white", letter: "W" },
  { bg: "#7a5af8", fg: "white", letter: "A" }
];

const avatarPalette = [
  { bg: "#fbe6c1", fg: "#8a5a1d" },
  { bg: "#dbe5fb", fg: "#2a44a6" },
  { bg: "#f6d6d2", fg: "#a23a32" },
  { bg: "#d6efde", fg: "#117552" },
  { bg: "#efdcfb", fg: "#5a2a9c" },
  { bg: "#d2eef6", fg: "#1c6a85" }
];

const demoOverview: Overview = {
  metrics: {
    computers: "12",
    agents: "9",
    events: "7,244",
    denied: "286",
    questions: "71"
  },
  agents: [
    demoAgent("claude-code", "Claude Code", "IDE Agent", "Margaret Chen", "platform-mbp"),
    demoAgent("claude-code-cli", "Claude Code CLI", "CLI Agent", "Jenny Wilson", "infra-01"),
    demoAgent("cursor", "Cursor", "IDE Agent", "Floyd Miles", "payments-air"),
    demoAgent("gemini", "Gemini", "IDE Agent", "Robert Fox", "identity-mbp"),
    demoAgent("gemini-cli", "Gemini CLI", "CLI Agent", "Guy Hawkins", "growth-studio"),
    demoAgent("codex", "Codex", "IDE Agent", "Theresa Webb", "security-mbp"),
    demoAgent("codex-cli", "Codex CLI", "CLI Agent", "Esther Howard", "platform-mini"),
    demoAgent("windsurf", "Windsurf", "IDE Agent", "Cody Fisher", "web-mbp"),
    demoAgent("aider", "Aider", "CLI Agent", "Cameron Williamson", "billing-air")
  ],
  users: [
    demoUser("u1", "Max Brin", "max.brin@northwind.example", "Engineering", "Platform", 1, 2, ["Claude Code", "OpenAI Codex"], "2m"),
    demoUser("u2", "Margaret Chen", "margaret.chen@northwind.example", "Engineering", "Product Security", 1, 1, ["Cursor"], "8m"),
    demoUser("u3", "Jenny Wilson", "jenny.wilson@northwind.example", "Infrastructure", "SRE", 1, 2, ["Claude Code", "Claude Code CLI"], "19m"),
    demoUser("u4", "Floyd Miles", "floyd.miles@northwind.example", "Engineering", "Payments", 1, 1, ["Codex"], "34m"),
    demoUser("u5", "Kristin Watson", "kristin.watson@northwind.example", "Data", "Analytics", 0, 0, [], "never"),
    demoUser("u6", "Robert Fox", "robert.fox@northwind.example", "Engineering", "Identity", 0, 0, [], "never")
  ],
  recent: [
    demoEvent("e1", "deny", "Guy Hawkins", "Claude Code", "AWS credentials", "~/.aws/credentials", 2),
    demoEvent("e2", "allow", "Margaret Chen", "Cursor", "Secrets redacted", "src/config/stripe.ts", 5),
    demoEvent("e3", "deny", "Cody Fisher", "Windsurf", "Unverified package", "npm install left-pad-clone", 11),
    demoEvent("e4", "ask", "Kristin Watson", "Claude Code CLI", "Unknown domain", "curl https://paste.ee/...", 18),
    demoEvent("e5", "deny", "Cameron Williamson", "Aider", ".env access", "~/projects/legacy/.env", 26),
    demoEvent("e6", "ask", "Floyd Miles", "Codex", "Push to main", "git push origin main", 34),
    demoEvent("e7", "ask", "Jenny Wilson", "Claude Code", "CI/CD change", ".github/workflows/deploy.yml", 47)
  ],
  policies: [
    demoPolicy("p1", "AWS credentials access", "Prevent agents from reading ~/.aws/credentials, ~/.aws/config, or any file matching aws_*_key.", "medium"),
    demoPolicy("p2", "SSH private keys", "Deny reads on ~/.ssh/id_*, *.pem and *.key files outside explicitly allowed project directories.", "medium"),
    demoPolicy("p3", ".env outside root", "Disallow agents from reading .env, .env.local and .env.production outside the current workspace.", "medium"),
    demoPolicy("p4", "Push main branches", "Any git push to main, master or release branches must be confirmed by the user.", "medium"),
    demoPolicy("p5", "PII external endpoints", "Detect outbound network calls containing PII patterns to domains outside the allowlist.", "medium"),
    demoPolicy("p6", "CI/CD configuration changes", "Edits to workflows and deployment pipelines require human review before commit.", "medium")
  ]
};

function demoAgent(id: string, displayName: string, kind: string, userName: string, hostname: string): Overview["agents"][number] {
  return {
    id,
    kind,
    display_name: displayName,
    version: "managed",
    hostname,
    user_name: userName,
    last_seen_at: new Date().toISOString()
  };
}

function demoEvent(id: string, decision: "allow" | "deny" | "ask", userName: string, agentName: string, summary: string, path: string, minutesAgo: number): Overview["recent"][number] {
  return {
    id,
    decision,
    summary,
    created_at: new Date(Date.now() - minutesAgo * 60000).toISOString(),
    event_name: "policy.evaluate",
    tool_name: path,
    project_path: path,
    agent_name: agentName,
    hostname: "northwind.local",
    user_name: userName
  };
}

function demoPolicy(id: string, name: string, description: string, severity: string): Overview["policies"][number] {
  return {
    id,
    name,
    description,
    severity,
    natural_language_rule: description,
    enabled: true
  };
}

function demoUser(
  id: string,
  displayName: string,
  email: string,
  department: string,
  role: string,
  endpoints: number,
  agents: number,
  agentNames: string[],
  lastSeen: string
): NonNullable<Overview["users"]>[number] & { department?: string; hr_title?: string; lastSeenLabel?: string } {
  return {
    id,
    display_name: displayName,
    email,
    role: role.toLowerCase().replace(/\s+/g, "-"),
    created_at: new Date().toISOString(),
    endpoint_count: endpoints,
    agent_count: agents,
    last_seen_at: lastSeen === "never" ? null : new Date(Date.now() - Number(lastSeen.replace(/\D/g, "") || 1) * 60000).toISOString(),
    agents: agentNames,
    hostnames: endpoints ? [`${displayName.split(" ")[0].toLowerCase()}-mbp`] : [],
    department,
    hr_title: role,
    lastSeenLabel: lastSeen
  };
}

export function DashboardShell({
  apiUrl,
  data,
  initialTab = "overview",
  triggerData,
  triggerDetail,
  triggerSearchParams,
  usageSearchParams,
  externalAgents,
  mcpServers,
  skills,
  onboardingData,
  deploymentMode = "cloud",
  tenantDomain = "openleash.com",
  tenantSlug,
  dashboardMode = "organization",
  extensionTabs = []
}: {
  apiUrl: string;
  data: Overview | null;
  initialTab?: DashboardTab;
  triggerData?: { triggers: TriggerItem[] } | null;
  triggerDetail?: TriggerDetail | null;
  triggerSearchParams?: Record<string, string | undefined>;
  usageSearchParams?: Record<string, string | undefined>;
  externalAgents?: ExternalAgentsData | null;
  mcpServers?: McpServersData | null;
  skills?: SkillsData | null;
  onboardingData?: OnboardingData | null;
  deploymentMode?: "cloud" | "private";
  tenantDomain?: string;
  tenantSlug?: string;
  dashboardMode?: DashboardMode;
  extensionTabs?: DashboardExtensionTab[];
}) {
  const tab = initialTab;
  if (onboardingData && !onboardingData.organization.setup_completed) {
    return (
      <main className="onboardingOnly">
        <EnterpriseOnboarding apiUrl={apiUrl} initialData={onboardingData} deploymentMode={deploymentMode} tenantDomain={tenantDomain} organizationSlug={tenantSlug} />
      </main>
    );
  }
  const overview = data ?? demoOverview;
  const metrics = overview.metrics;
  const recent = overview.recent;
  const agents = overview.agents;
  const policies = overview.policies;
  const usageSessions = overview.usage?.sessions ?? sessionsFromAgents(agents);
  const users = overview.users?.length ? overview.users : usersFromAgents(agents);
  const basePath = tenantSlug ? `/${tenantSlug}` : "";
  const personal = dashboardMode === "personal";
  const needsIdentityProvider = !personal && Boolean(onboardingData?.organization.setup_completed) && !onboardingData?.idp?.enabled;
  const extensionContext = { apiUrl, basePath, tenantSlug, deploymentMode, dashboardMode, onboardingData };
  const activeExtension = extensionTabs.find((item) => item.id === tab);

  return (
    <div className={personal ? "app personalDashboard" : "app"}>
      <Sidebar tab={tab} agentsCount={agents.length} usersCount={users.length} basePath={basePath} mode={dashboardMode} extensionTabs={extensionTabs} />
      <main className="main">
        {needsIdentityProvider && <IdentityProviderNotice basePath={basePath} />}
        {tab === "overview" && <OverviewPage metrics={metrics} recent={recent} agents={agents} policies={policies} usersCount={users.length} organizationName={onboardingData?.organization.name} mode={dashboardMode} basePath={basePath} />}
        {tab === "usage" && <UsagePage sessions={usageSessions} users={users} mode={dashboardMode} basePath={basePath} range={usageSearchParams?.range} />}
        {(tab === "setup" || tab === "settings") && <SettingsPage apiUrl={apiUrl} onboardingData={onboardingData ?? null} deploymentMode={deploymentMode} tenantDomain={tenantDomain} tenantSlug={tenantSlug} mode={dashboardMode} />}
        {tab === "triggers" && <TriggersPage triggers={triggerData?.triggers ?? []} detail={triggerDetail?.trigger} filters={triggerSearchParams ?? {}} mode={dashboardMode} basePath={basePath} />}
        {tab === "users" && <UsersPage users={users} mode={dashboardMode} />}
        {tab === "identity" && (personal ? <PersonalIdentityPage /> : <IdentityPage apiUrl={apiUrl} onboardingData={onboardingData ?? null} />)}
        {tab === "agents" && <AgentsPage agents={agents} mode={dashboardMode} />}
        {tab === "external-agents" && <ExternalAgentsPage apiUrl={apiUrl} data={externalAgents} />}
        {tab === "mcps" && <McpServersPage apiUrl={apiUrl} data={mcpServers} mode={dashboardMode} />}
        {tab === "skills" && <SkillsPage data={skills} mode={dashboardMode} />}
        {tab === "policies" && <PoliciesPage apiUrl={apiUrl} policies={policies} mode={dashboardMode} tenantSlug={tenantSlug} />}
        {tab === "tokens" && <TokensPage apiUrl={apiUrl} mode={dashboardMode} />}
        {tab === "deployment" && <DeploymentPage apiUrl={apiUrl} mode={dashboardMode} />}
        {activeExtension?.render(extensionContext)}
      </main>
    </div>
  );
}

function IdentityProviderNotice({ basePath }: { basePath: string }) {
  return (
    <section className="dashboardNotice">
      <div>
        <strong>Connect an identity provider</strong>
        <p>OpenLeash is active, but this organization is not connected to Google Workspace, Microsoft Entra ID, Okta, Ping, or LDAP yet. Connect identity to sync users and groups, assign dashboard roles, and manage rollout coverage.</p>
      </div>
      <Link href={routeHref(basePath, "/settings")}>Connect identity</Link>
    </section>
  );
}

function Sidebar({ tab, agentsCount, usersCount, basePath, mode, extensionTabs }: { tab: DashboardTab | string; agentsCount: number; usersCount: number; basePath: string; mode: DashboardMode; extensionTabs: DashboardExtensionTab[] }) {
  const personal = mode === "personal";
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"><Logo /></div>
        <div className="brand-name">OpenLeash</div>
      </div>
      <nav className="nav" aria-label="Dashboard sections">
        <NavButton active={tab === "overview"} href={dashboardHref(basePath, "/")} icon={<Home />} label="Overview" />
        <NavButton active={tab === "usage"} href={dashboardHref(basePath, "/usage")} icon={<Clock3 />} label="Usage" />
        <NavButton active={tab === "triggers"} href={dashboardHref(basePath, "/triggers")} icon={<AlertTriangle />} label={personal ? "Activity" : "Triggers"} />
        <NavButton active={tab === "agents"} href={dashboardHref(basePath, "/agents")} icon={<Bot />} label={personal ? "My agents" : "Agents"} badge={agentsCount || undefined} />
        {!personal && <NavButton active={tab === "users"} href={dashboardHref(basePath, "/users")} icon={<Users />} label="Users" badge={usersCount || undefined} />}
        {!personal && <NavButton active={tab === "identity"} href={dashboardHref(basePath, "/identity")} icon={<Building2 />} label="Identity" />}
        {!personal && <NavButton active={tab === "external-agents"} href={dashboardHref(basePath, "/external-agents")} icon={<Database />} label="External agents" />}
        <NavButton active={tab === "mcps"} href={dashboardHref(basePath, "/mcps")} icon={<Database />} label="MCPs" />
        <NavButton active={tab === "skills"} href={dashboardHref(basePath, "/skills")} icon={<Code2 />} label="Skills" />
        <NavButton active={tab === "policies"} href={dashboardHref(basePath, "/policies")} icon={<ShieldCheck />} label={personal ? "Guardrails" : "Policies"} />
        <NavButton active={tab === "tokens"} href={dashboardHref(basePath, "/tokens")} icon={<KeyRound />} label={personal ? "Connect" : "Tokens"} />
        {!personal && <NavButton active={tab === "deployment"} href={dashboardHref(basePath, "/deployment")} icon={<MonitorDown />} label="Deploy" />}
        {extensionTabs
          .filter((item) => !personal || item.showInPersonal)
          .map((item) => (
            <NavButton
              key={item.id}
              active={tab === item.id}
              href={dashboardHref(basePath, item.href ?? `/${item.id}`)}
              icon={item.icon ?? <Package />}
              label={item.label}
              badge={item.badge}
            />
          ))}
        <NavButton active={tab === "settings" || tab === "setup"} href={dashboardHref(basePath, "/settings")} icon={<Settings />} label="Settings" />
      </nav>

      <div className="upgrade-card">
        <div className="upgrade-icon"><ShieldCheck size={22} /></div>
        <h4>{personal ? "Personal" : "Enterprise"}</h4>
        <p>{personal ? "Your local agents, under control." : "6 days left"}</p>
        <button type="button">{personal ? "Manage plan" : "Contact sales"}</button>
      </div>

      <div className="sidebar-foot">
        <button className="nav-item" type="button"><Moon className="ic" /><span>Dark mode</span></button>
        <button className="nav-item" type="button"><CircleHelp className="ic" /><span>Help & docs</span></button>
        <DashboardSignOutButton />
      </div>
    </aside>
  );
}

type DashboardHref = "/" | "/usage" | "/setup" | "/settings" | "/triggers" | "/users" | "/identity" | "/agents" | "/external-agents" | "/mcps" | "/skills" | "/policies" | "/tokens" | "/deployment";

function dashboardHref(basePath: string, href: DashboardHref | string) {
  if (!basePath) return href;
  if (href === "/") return basePath;
  return `${basePath}${href}`;
}

function routeHref(basePath: string, href: DashboardHref | string) {
  return dashboardHref(basePath, href) as any;
}

function NavButton({ active, href, icon, label, badge }: { active: boolean; href: string; icon: React.ReactNode; label: string; badge?: number }) {
  return (
    <Link className={active ? "nav-item active" : "nav-item"} href={href as any}>
      <span className="ic">{icon}</span>
      <span>{label}</span>
      {badge ? <span className="badge">{badge}</span> : null}
    </Link>
  );
}

function OverviewPage({
  metrics,
  recent,
  agents,
  policies,
  usersCount,
  organizationName,
  mode,
  basePath
}: {
  metrics: Overview["metrics"];
  recent: Overview["recent"];
  agents: Overview["agents"];
  policies: Overview["policies"];
  usersCount: number;
  organizationName?: string | null;
  mode: DashboardMode;
  basePath: string;
}) {
  const enabledPolicies = policies.filter((policy) => policy.enabled);
  const latest = recent.filter(isTriggerEvent).slice(0, 10);
  const highlighted = agentHighlights(agents, recent);
  const personal = mode === "personal";
  const coverageLabel = personal
    ? "Your protected coding activity"
    : organizationName?.trim() ? `${organizationName.trim()} · live coverage` : "Live coverage";
  return (
    <>
      <Topbar />
      <div className="page-head">
        <div>
          <h1>{personal ? "Your OpenLeash dashboard" : "Hello, Max"}</h1>
          <p className="sub">{coverageLabel}</p>
        </div>
      </div>

      <div className="divider" />

      <div className="stat-row">
        <Stat icon={<Bot />} label={personal ? "Your agents" : "Agents"} value={metrics.agents} delta={personal ? undefined : "+2"} up={!personal} />
        {personal ? <Stat icon={<Laptop />} label="Computers" value={metrics.computers} /> : <Stat icon={<Users />} label="Users" value={String(usersCount)} delta="+3" up />}
        <Stat icon={<AlertTriangle />} label={personal ? "Things to review" : "Triggers"} value={metrics.events} delta={personal ? undefined : "+8%"} up={!personal} />
        <Stat icon={<Clock3 />} label="Agent time 24h" value={formatDuration(metrics.session_time?.last24h_seconds)} />
      </div>

      <div className="card-title overview-activity-head">
        <h3>Agent activity</h3>
        <div className="right"><span className="sync-pill"><Activity size={14} /> Highlighted actions</span></div>
      </div>

      <div className="agentActivityGrid">
        {highlighted.map((group) => <AgentActivityCard key={group.key} group={group} />)}
        {highlighted.length === 0 && <Empty text="No highlighted agent actions yet." />}
      </div>

      <div className="card-title triggers-head">
        <h3>{personal ? "Recent activity" : "Triggers"}</h3>
        <div className="right">
          <Link className="pill action-pill" href={routeHref(basePath, "/triggers")}>
            <span>{personal ? "All activity" : "Audit log"}</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      <div className="trigger-list">
        {latest.map((event) => <TriggerRow key={event.id} event={event} />)}
        {latest.length === 0 && <Empty text="No blocked or approval-triggered events yet." />}
      </div>

      <div className="section-spacer" />

      <div className="card-title">
        <h3>{personal ? "Guardrails" : "Policies"}</h3>
        <div className="right">
          <Link className="pill action-pill" href={routeHref(basePath, "/policies")}>
            <span>All</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      <div>
        {enabledPolicies.slice(0, 5).map((policy, index) => (
          <Link key={policy.id} className="row-card policy-row" href={routeHref(basePath, "/policies")}>
            <div className="row-ico">{iconForPolicy(policy, index)}</div>
            <div className="row-copy">
              <div className="row-title">{compactRule(policy.name)}</div>
            </div>
            <div className="blocked-count">
              {index === 0 ? metrics.denied : Math.max(0, Number(metrics.denied) - index)}
            </div>
            <ChevronRight size={18} className="muted" />
          </Link>
        ))}
        {enabledPolicies.length === 0 && <Empty text="No policies configured." />}
      </div>
    </>
  );
}

function SettingsPage({ apiUrl, onboardingData, deploymentMode, tenantDomain, tenantSlug, mode }: { apiUrl: string; onboardingData: OnboardingData | null; deploymentMode: "cloud" | "private"; tenantDomain: string; tenantSlug?: string; mode: DashboardMode }) {
  if (mode === "personal") {
    return (
      <>
        <Topbar />
        <div className="page-head">
          <div>
            <h1>Settings</h1>
            <p className="sub">Your account, local agent connection, and personal guardrails.</p>
          </div>
        </div>
        <div className="divider" />
        <div className="personalSettingsGrid">
          <section className="panel">
            <div className="card-title"><h3>Personal workspace</h3></div>
            <p className="sub">This dashboard is just for you. It keeps your local coding agents visible without asking you to configure company identity or MDM rollout.</p>
          </section>
          <section className="panel">
            <div className="card-title"><h3>What OpenLeash watches</h3></div>
            <div className="evidence-list">
              <span>Secret and token access</span>
              <span>Risky shell commands</span>
              <span>Agent actions that need your approval</span>
            </div>
          </section>
        </div>
      </>
    );
  }
  return (
    <>
      <Topbar />
      <div className="page-head">
        <div>
          <h1>Settings</h1>
          <p className="sub">Identity sync, dashboard roles, tenant setup, and endpoint deployment.</p>
        </div>
      </div>
      <div className="divider" />
      <EnterpriseOnboarding apiUrl={apiUrl} initialData={onboardingData} deploymentMode={deploymentMode} tenantDomain={tenantDomain} organizationSlug={tenantSlug} />
    </>
  );
}

function PersonalIdentityPage() {
  return (
    <>
      <Topbar />
      <div className="page-head">
        <div>
          <h1>Account</h1>
          <p className="sub">You are signed in with Google. No company identity provider is needed for a personal workspace.</p>
        </div>
      </div>
      <div className="divider" />
      <div className="deployHero">
        <div>
          <h3>Personal Google sign-in</h3>
          <p>Your account owns this workspace. If you later join a company workspace, OpenLeash can show that dashboard separately.</p>
        </div>
        <span className="tag allowed"><span className="dot" />connected</span>
      </div>
    </>
  );
}

function IdentityPage({ apiUrl, onboardingData }: { apiUrl: string; onboardingData: OnboardingData | null }) {
  return (
    <>
      <Topbar />
      <div className="page-head">
        <div>
          <h1>Identity</h1>
          <p className="sub">Users, groups, role mapping, and deployment coverage from your identity provider.</p>
        </div>
      </div>
      <div className="divider" />
      <IdentityManager apiUrl={apiUrl} initialData={onboardingData} />
    </>
  );
}

type UserRow = NonNullable<Overview["users"]>[number] & {
  department?: string;
  hr_title?: string;
  lastSeenLabel?: string;
};

function UsersPage({ users, mode }: { users: UserRow[]; mode: DashboardMode }) {
  if (mode === "personal") {
    return (
      <>
        <Topbar />
        <div className="page-head">
          <div>
            <h1>Your profile</h1>
            <p className="sub">Personal workspaces only show your devices and agents.</p>
          </div>
        </div>
        <div className="divider" />
        <div className="userRoster">
          {users.slice(0, 1).map((user) => <UserRosterRow key={user.id} user={user} />)}
          {users.length === 0 && <Empty text="No local user has checked in yet." />}
        </div>
      </>
    );
  }
  const covered = users.filter((user) => Number(user.endpoint_count ?? 0) > 0 && Number(user.agent_count ?? 0) > 0);
  const partial = users.filter((user) => Number(user.endpoint_count ?? 0) > 0 && Number(user.agent_count ?? 0) === 0);
  const notDeployed = users.filter((user) => Number(user.endpoint_count ?? 0) === 0);
  return (
    <>
      <Topbar />
      <div className="page-head">
        <div>
          <h1>Users</h1>
          <p className="sub">Identity roster and endpoint deployment coverage.</p>
        </div>
      </div>
      <div className="divider" />

      <div className="identityGrid">
        <div className="identityCard">
          <div className="identityIcon"><Building2 size={20} /></div>
          <div>
            <div className="identityLabel">Identity source</div>
            <strong>Okta</strong>
          </div>
        </div>
        <div className="identityCard">
          <div className="identityIcon"><Users size={20} /></div>
          <div>
            <div className="identityLabel">HR context</div>
            <strong>BambooHR</strong>
          </div>
        </div>
        <div className="identityCard">
          <div className="identityIcon"><UserCheck size={20} /></div>
          <div>
            <div className="identityLabel">Covered users</div>
            <strong>{covered.length}/{users.length}</strong>
          </div>
        </div>
        <div className="identityCard">
          <div className="identityIcon"><UserPlus size={20} /></div>
          <div>
            <div className="identityLabel">Needs rollout</div>
            <strong>{partial.length + notDeployed.length}</strong>
          </div>
        </div>
      </div>

      <div className="card-title users-title">
        <h3>Deployment roster</h3>
        <div className="right">
          <span className="sync-pill"><Clock3 size={14} /> Synced 4m ago</span>
        </div>
      </div>

      <div className="userRoster">
        {users.map((user) => <UserRosterRow key={user.id} user={user} />)}
        {users.length === 0 && <Empty text="No users synced yet." />}
      </div>
    </>
  );
}

function UserRosterRow({ user }: { user: UserRow }) {
  const endpointCount = Number(user.endpoint_count ?? 0);
  const agentCount = Number(user.agent_count ?? 0);
  const deployed = endpointCount > 0;
  const covered = deployed && agentCount > 0;
  const status = covered ? "covered" : deployed ? "partial" : "not-deployed";
  const agents = Array.isArray(user.agents) ? user.agents : [];
  const hostnames = Array.isArray(user.hostnames) ? user.hostnames : [];
  const avatar = avatarFor(user.display_name);
  return (
    <article className="user-row">
      <span className="avatar-sm user-avatar" style={{ background: avatar.bg, color: avatar.fg }}>{initials(user.display_name)}</span>
      <div className="user-main">
        <div className="user-name">{user.display_name}</div>
        <div className="user-meta">{user.email} · {user.department ?? departmentFor(user.email)} · {user.hr_title ?? titleFor(user.role)}</div>
      </div>
      <div className="coverage-stack">
        <span className={`coverage ${status}`}><span className="dot" />{covered ? "deployed" : deployed ? "agent missing" : "not deployed"}</span>
        <span className="coverage-note">{covered ? `${agentCount} agent${agentCount === 1 ? "" : "s"} protected` : deployed ? "endpoint seen, no agent runtime" : "waiting for endpoint install"}</span>
      </div>
      <div className="agent-icons">
        {agents.slice(0, 4).map((name) => <AgentLogo key={name} name={name} fallback={initials(name).slice(0, 1)} size="small" />)}
        {agents.length === 0 && <span className="mutedText">No agents</span>}
      </div>
      <div className="endpoint-cell">
        <strong>{endpointCount}</strong>
        <span>{hostnames[0] ?? "No endpoint"}</span>
      </div>
      <div className="last-seen">{user.lastSeenLabel ?? (user.last_seen_at ? relativeTime(user.last_seen_at) : "Never")}</div>
    </article>
  );
}

function AgentsPage({ agents, mode }: { agents: Overview["agents"]; mode: DashboardMode }) {
  const groupedAgents = aggregateAgents(agents);
  const personal = mode === "personal";
  return (
    <>
      <Topbar />
      <div className="page-head">
        <div>
          <h1>Agents</h1>
          <p className="sub">{personal ? "The AI coding tools OpenLeash has seen on your computer." : "Coverage and runtime status."}</p>
        </div>
      </div>
      <div className="divider" />
      <div className="cards">
        {groupedAgents.map((agent, index) => {
          const mark = agentMark(agent.displayName, index);
          const sessions = agent.sessions.slice(0, 5);
          return (
            <article key={agent.key} className="agent-card">
              <div className="agent-head">
                <AgentLogo name={agent.displayName} fallback={mark.letter} size="large" />
                <div>
                  <div className="agent-name">{agent.displayName}</div>
                  <div className="agent-vendor">{agent.kind}{agent.version ? ` · ${agent.version}` : ""}</div>
                </div>
              </div>
              <div className="agent-stats">
                <div className="agent-stat"><div className="v">{agent.users}</div><div className="l">{personal ? "Profiles" : "Users"}</div></div>
                <div className="agent-stat"><div className="v">{agent.installs}</div><div className="l">Installs</div></div>
                <div className="agent-stat"><div className="v">{agent.protectedPercent}%</div><div className="l">Protected</div></div>
              </div>
              <div className="session-list">
                {sessions.map((session) => (
                  <div className="session-line" key={session.id}>
                    <div>
                      <strong>{session.title || "Agent session"}</strong>
                      <span>{session.project_path || "No project"} · {formatDuration(session.duration_seconds)} · {session.event_count ?? 0} events</span>
                    </div>
                    <span className="tag">{session.last_activity_at ? relativeTime(session.last_activity_at) : "new"}</span>
                  </div>
                ))}
                {sessions.length === 0 && <span className="muted-small">No sessions captured yet.</span>}
              </div>
              <div className="bar-track"><div className="bar-fill" style={{ width: `${agent.protectedPercent}%` }} /></div>
              <span className="tag allowed"><span className="dot" />blocking</span>
            </article>
          );
        })}
        {groupedAgents.length === 0 && <Empty text="No agents have checked in." />}
      </div>
    </>
  );
}

function UsagePage({ sessions, users, mode, basePath, range }: { sessions: UsageSession[]; users: UserRow[]; mode: DashboardMode; basePath: string; range?: string }) {
  const personal = mode === "personal";
  const now = Date.now();
  const ranges = [
    { label: "24h", href: dashboardHref(basePath, "/usage"), cutoff: now - 24 * 60 * 60 * 1000 },
    { label: "7d", href: `${dashboardHref(basePath, "/usage")}?range=7d`, cutoff: now - 7 * 24 * 60 * 60 * 1000 },
    { label: "30d", href: `${dashboardHref(basePath, "/usage")}?range=30d`, cutoff: now - 30 * 24 * 60 * 60 * 1000 },
    { label: "All", href: `${dashboardHref(basePath, "/usage")}?range=all`, cutoff: 0 }
  ];
  const selectedRange = ranges.find((item) => item.label.toLowerCase() === String(range || "24h").toLowerCase()) ?? ranges[0];
  const selectedCutoff = selectedRange.cutoff;
  const scoped = sessions
    .filter((session) => new Date(session.last_activity_at ?? session.started_at ?? 0).getTime() >= selectedCutoff)
    .sort((a, b) => new Date(b.last_activity_at ?? 0).getTime() - new Date(a.last_activity_at ?? 0).getTime());
  const totalSeconds = scoped.reduce((sum, session) => sum + numeric(session.duration_seconds), 0);
  const subagentSeconds = scoped.reduce((sum, session) => sum + numeric(session.subagent_seconds), 0);
  const approvals = scoped.reduce((sum, session) => sum + numeric(session.approval_count), 0);
  const employeeRows = usageByEmployee(scoped);
  return (
    <>
      <Topbar />
      <div className="page-head">
        <div>
          <h1>Usage</h1>
          <p className="sub">{personal ? "Your agent sessions and time spent." : "Agent time, sessions, and employee activity across this OpenLeash environment."}</p>
        </div>
        <div className="usageRange">
          {ranges.map((item) => <Link key={item.label} className={item.label === selectedRange.label ? "active" : ""} href={item.href as any}>{item.label}</Link>)}
        </div>
      </div>
      <div className="divider" />
      <div className="stat-row">
        <Stat icon={<Clock3 />} label="Agent time" value={formatDuration(totalSeconds)} />
        <Stat icon={<FileClock />} label="Sessions" value={String(scoped.length)} />
        <Stat icon={<Bot />} label="Subagent time" value={formatDuration(subagentSeconds)} />
        <Stat icon={<Shield />} label="Approvals" value={String(approvals)} />
      </div>

      <div className="usageGrid">
        <section className="usagePanel">
          <div className="card-title"><h3>Employees</h3><div className="right"><span className="sync-pill">{users.length} managed</span></div></div>
          <div className="usageTable">
            <div className="usageTableHead"><span>Employee</span><span>Sessions</span><span>Time</span><span>Subagents</span><span>Last seen</span></div>
            {employeeRows.map((row) => (
              <div className="usageTableRow" key={row.key}>
                <span><strong>{row.name}</strong><small>{row.email}</small></span>
                <span>{row.sessions}</span>
                <span>{formatDuration(row.duration)}</span>
                <span>{formatDuration(row.subagents)}</span>
                <span>{row.lastActivity ? relativeTime(row.lastActivity) : "Never"}</span>
              </div>
            ))}
            {employeeRows.length === 0 && <Empty text="No usage in this window." />}
          </div>
        </section>

        <section className="usagePanel">
          <div className="card-title"><h3>Sessions</h3><div className="right"><span className="sync-pill">latest {Math.min(scoped.length, 100)}</span></div></div>
          <div className="usageSessionList">
            {scoped.slice(0, 100).map((session) => (
              <article className="usageSession" key={session.id}>
                <div>
                  <strong>{session.title || "Agent session"}</strong>
                  <p>{session.user_name || session.user_email || "Unknown user"} · {session.agent_name || session.agent_kind || "AI agent"} · {projectTag(session.project_path ?? undefined) ?? "No project"}</p>
                </div>
                <div className="usageSessionStats">
                  <span>{formatDuration(session.duration_seconds)}</span>
                  <span>{numeric(session.event_count)} events</span>
                  <span>{numeric(session.subagent_count)} subagents</span>
                </div>
              </article>
            ))}
            {scoped.length === 0 && <Empty text="No sessions captured for this range." />}
          </div>
        </section>
      </div>
    </>
  );
}

function ExternalAgentsPage({ apiUrl, data }: { apiUrl: string; data?: ExternalAgentsData | null }) {
  const connectors = data?.connectors ?? [];
  const known = data?.known ?? [];
  return (
    <>
      <Topbar />
      <div className="page-head">
        <div>
          <h1>External agents</h1>
          <p className="sub">Monitor SaaS agent conversations through the same OpenLeash rules engine.</p>
        </div>
      </div>
      <div className="divider" />
      <div className="deployHero">
        <div>
          <h3>Conversation sync</h3>
          <p>OpenLeash lists configured external agent providers, fetches the fullest conversation log available, normalizes it, and stores the evaluation next to local agent activity.</p>
        </div>
        <span className="tag allowed"><span className="dot" />same policies</span>
      </div>
      <div className="cards">
        {connectors.map((connector) => (
          <article className="agent-card" key={connector.provider}>
            <div className="agent-head">
              <AgentLogo name={connector.label} fallback={initials(connector.label)} size="small" />
              <div>
                <div className="agent-name">{connector.label}</div>
                <div className="agent-vendor">{connector.configured ? "Configured" : `Missing ${connector.missing.join(", ") || "credentials"}`}</div>
              </div>
            </div>
            <div className="agent-stats">
              <div className="agent-stat"><div className="v">{connector.agents.length}</div><div className="l">Agents</div></div>
              <div className="agent-stat"><div className="v">{connector.agents.reduce((sum, agent) => sum + (agent.conversationIds?.length ?? 0), 0)}</div><div className="l">Logs</div></div>
              <div className="agent-stat"><div className="v">{connector.configured ? "on" : "off"}</div><div className="l">Sync</div></div>
            </div>
            <div className="evidence-list externalList">
              {connector.agents.slice(0, 5).map((agent) => (
                <span key={`${connector.provider}-${agent.id}`}>
                  <strong>{agent.displayName}</strong>: {agent.source}{agent.conversationIds?.length ? ` · ${agent.conversationIds.length} configured threads` : ""}
                </span>
              ))}
              {connector.agents.length === 0 && <span>No agents listed yet.</span>}
            </div>
            {connector.notes.map((note) => <p className="mutedText" key={note}>{note}</p>)}
          </article>
        ))}
        {connectors.length === 0 && <Empty text="No external connectors configured." />}
      </div>

      <div className="panel externalSync">
        <div className="card-title"><h3>Sync now</h3></div>
        <p className="sub">Call this endpoint from a scheduler, CI job, or internal worker until we add a managed background runner.</p>
        <pre>{`curl -X POST ${apiUrl}/admin/external-agents/sync \\
  -H 'content-type: application/json' \\
  -d '{"provider":"azure-ai-foundry"}'`}</pre>
      </div>

      <div className="history">
        {known.map((agent) => (
          <article key={agent.id}>
            <div>
              <strong>{agent.display_name}</strong>
              <small>{agent.kind} · {agent.hostname} · {agent.latest_event_at ? relativeTime(agent.latest_event_at) : "no conversations synced yet"}</small>
              {agent.summary && <div className="quote">{agent.summary}</div>}
            </div>
            <span className={`tag ${agent.decision === "ask" ? "asked" : agent.decision === "deny" ? "blocked" : "allowed"}`}><span className="dot" />{agent.decision ?? "synced"}</span>
          </article>
        ))}
      </div>
    </>
  );
}

function McpServersPage({ apiUrl, data, mode }: { apiUrl: string; data?: McpServersData | null; mode: DashboardMode }) {
  const servers = data?.servers ?? [];
  const personal = mode === "personal";
  return (
    <>
      <Topbar />
      <div className="page-head">
        <div>
          <h1>MCP registry</h1>
          <p className="sub">{personal ? "MCP servers used by your local agents." : "MCP servers accessed across users, agents, projects, and tools."}</p>
        </div>
      </div>
      <div className="divider" />
      <div className="cards">
        {servers.map((server) => {
          const tools = server.tools?.map((tool) => tool.tool_name).filter(Boolean) ?? [];
          const users = server.users?.map((user) => user.name || user.email).filter(Boolean) ?? [];
          return (
            <article className="agent-card" key={server.id}>
              <div className="agent-head">
                <span className="agent-logo small"><Database size={18} /></span>
                <div>
                  <div className="agent-name">{server.server_name}</div>
                  <div className="agent-vendor">Last seen {relativeTime(server.last_seen_at)}</div>
                </div>
              </div>
              <div className="agent-stats">
                <div className="agent-stat"><div className="v">{server.call_count}</div><div className="l">Calls</div></div>
                <div className="agent-stat"><div className="v">{server.tool_count}</div><div className="l">Tools</div></div>
                <div className="agent-stat"><div className="v">{server.user_count}</div><div className="l">{personal ? "Profiles" : "Users"}</div></div>
              </div>
              <div className="evidence-list externalList">
                <span><strong>Tools</strong>: {tools.length ? tools.slice(0, 6).join(", ") : "No tools recorded"}</span>
                <span><strong>{personal ? "Profile" : "Users"}</strong>: {users.length ? users.slice(0, 6).join(", ") : "No users recorded"}</span>
                <span><strong>First seen</strong>: {new Date(server.first_seen_at).toLocaleString()}</span>
                {(server.recent_calls ?? []).slice(0, 3).map((call) => (
                  <span key={call.id}>
                    <strong>{call.tool_name}</strong>: {call.user_name ?? "Unknown user"} · {call.agent_name ?? "Unknown agent"} · {projectTag(call.project_path ?? undefined) ?? "No project"} · {call.argument_summary || "No arguments"} · {relativeTime(call.occurred_at)}
                  </span>
                ))}
              </div>
              <a className="pill action-pill" href={`${apiUrl}/admin/mcp-servers/${server.id}`}>View raw detail</a>
            </article>
          );
        })}
        {servers.length === 0 && <Empty text="No MCP servers have been used yet." />}
      </div>
    </>
  );
}

function SkillsPage({ data, mode }: { data?: SkillsData | null; mode: DashboardMode }) {
  const skills = data?.skills ?? [];
  const personal = mode === "personal";
  return (
    <>
      <Topbar />
      <div className="page-head">
        <div>
          <h1>Skills</h1>
          <p className="sub">{personal ? "Agent skills detected on this computer." : "Agent skills loaded by users, projects, and local agents."}</p>
        </div>
      </div>
      <div className="divider" />
      <div className="cards">
        {skills.map((skill) => {
          const reasons = Array.isArray(skill.reasons) ? skill.reasons : [];
          return (
            <article className="agent-card" key={skill.id}>
              <div className="agent-head">
                <AgentLogo name={skill.agent_name} fallback={initials(skill.agent_name)} size="small" />
                <div>
                  <div className="agent-name">{skill.skill_name}</div>
                  <div className="agent-vendor">{skill.agent_name} · {skill.scope} · {skill.user_name ?? "Unknown user"}</div>
                </div>
              </div>
              <div className="agent-stats">
                <div className="agent-stat"><div className="v">{skill.risk_score}</div><div className="l">Risk</div></div>
                <div className="agent-stat"><div className="v">{reasons.length}</div><div className="l">Reasons</div></div>
                <div className="agent-stat"><div className="v">{skill.status}</div><div className="l">Status</div></div>
              </div>
              <div className="evidence-list externalList">
                <span><strong>Project</strong>: {projectTag(skill.project_path ?? undefined) ?? "User-level"}</span>
                <span><strong>Path</strong>: {skill.skill_path}</span>
                {reasons.slice(0, 4).map((reason, index) => (
                  <span key={`${skill.id}-${index}`}><strong>{reason.reason}</strong>{reason.quote ? `: ${reason.quote}` : ""}</span>
                ))}
                <span><strong>Updated</strong>: {relativeTime(skill.updated_at)}</span>
              </div>
              <span className={`tag ${skill.status === "suspicious" ? "blocked" : "allowed"}`}><span className="dot" />{skill.status}</span>
            </article>
          );
        })}
        {skills.length === 0 && <Empty text="No agent skills have been detected yet." />}
      </div>
    </>
  );
}

function PoliciesPage({ apiUrl, policies, mode, tenantSlug }: { apiUrl: string; policies: Overview["policies"]; mode: DashboardMode; tenantSlug?: string }) {
  const personal = mode === "personal";
  return (
    <>
      <Topbar />
      <div className="page-head">
        <div>
          <h1>{personal ? "Guardrails" : "Policies"}</h1>
          <p className="sub">{personal ? "Simple rules that keep your local agents away from secrets and risky actions." : "Rules for allow, deny, or ask."}</p>
        </div>
      </div>
      <div className="divider" />
      <PolicyManager apiUrl={apiUrl} policies={policies} organizationSlug={tenantSlug} />
    </>
  );
}

function TokensPage({ apiUrl, mode }: { apiUrl: string; mode: DashboardMode }) {
  const personal = mode === "personal";
  return (
    <>
      <Topbar />
      <div className="page-head">
        <div>
          <h1>{personal ? "Connect your computer" : "Tokens"}</h1>
          <p className="sub">{personal ? "Create a token, connect the tray app, and start seeing your local agent activity here." : "Connect a workstation."}</p>
        </div>
      </div>
      <div className="divider" />
      <div className="tokenLayout">
        <div className="panel">
          <div className="card-title"><h3>Issue token</h3></div>
          <TokenIssuer apiUrl={apiUrl} />
        </div>
        <div className="panel">
          <div className="card-title"><h3>Install</h3></div>
          <pre>{`npm run desktop-cli -- configure --token <token> --api-url http://127.0.0.1:9317
npm run desktop-cli -- install-hooks --all
npm run desktop-client`}</pre>
        </div>
      </div>
    </>
  );
}

function DeploymentPage({ apiUrl, mode }: { apiUrl: string; mode: DashboardMode }) {
  const personal = mode === "personal";
  const enrollmentCommand = "/bin/bash install-openleash-personal.sh --dmg <signed-dmg-url> --tenant openleash.com --api-url https://api.openleash.com --token <deployment-token> --mode cloud --enroll --install-hooks";
  const mdms = [
    {
      name: "Jamf Pro",
      detail: "Upload the signed DMG as a package source, then add the enrollment script to the policy Files and Processes payload.",
      command: enrollmentCommand
    },
    {
      name: "Kandji",
      detail: "Create a Custom App for the signed DMG, then run the enrollment script as a Library Item after install.",
      command: enrollmentCommand
    },
    {
      name: "Microsoft Intune",
      detail: "Assign the signed macOS app, then attach the enrollment command as a macOS shell script for the same device group.",
      command: enrollmentCommand
    },
    {
      name: "Workspace ONE",
      detail: "Publish OpenLeash as an internal macOS app and add the enrollment command as the post-install script.",
      command: enrollmentCommand
    }
  ];
  return (
    <>
      <Topbar />
      <div className="page-head">
        <div>
          <h1>{personal ? "Install OpenLeash" : "Deployment"}</h1>
          <p className="sub">{personal ? "Connect this Mac to your personal OpenLeash dashboard." : "Push the OpenLeash tray app to managed macOS endpoints."}</p>
        </div>
      </div>
      <div className="divider" />

      <div className="deployHero">
        <div>
          <h3>{personal ? "Personal install" : "Enterprise rollout"}</h3>
          <p>{personal ? "Install the tray app, enroll with your token, and OpenLeash will start showing local agent activity." : "Generate a deployment token, deploy the signed app through MDM, then run the enrollment script. Rules, model keys, updates, and agent coverage stay managed from this dashboard."}</p>
        </div>
        <span className="tag allowed"><span className="dot" />macOS MDM</span>
      </div>

      <div className="deploymentTokenPanel">
        <DeploymentTokenIssuer apiUrl={apiUrl} />
      </div>

      <div className="mdmGrid">
        {mdms.map((mdm) => (
          <article className="mdmCard" key={mdm.name}>
            <div className="mdmTop">
              <div className="row-ico"><MonitorDown size={20} /></div>
              <div>
                <strong>{mdm.name}</strong>
                <p>{mdm.detail}</p>
              </div>
            </div>
            <pre>{mdm.command}</pre>
          </article>
        ))}
      </div>
    </>
  );
}

function Topbar() {
  return (
    <div className="topbar">
      <div className="date-chip">
        <span>Mon, 11 May 2026</span>
        <span className="ic"><CalendarDays size={18} /></span>
      </div>
      <button className="iconbutton" type="button"><Bell size={18} /><span className="dotmark" /></button>
      <DashboardUserChip />
    </div>
  );
}

function Stat({ icon, label, value, delta, up, down }: { icon: React.ReactNode; label: string; value: string; delta?: string; up?: boolean; down?: boolean }) {
  return (
    <div className="stat">
      <div className="stat-ico">{icon}</div>
      <div>
        <div className="stat-label">{label}</div>
        <div>
          <span className="stat-value">{value}</span>
          {delta && <span className={`stat-delta ${up ? "up" : down ? "down" : ""}`}>{up ? "↗" : "↘"} {delta}</span>}
        </div>
      </div>
    </div>
  );
}

function TriggerRow({ event }: { event: Overview["recent"][number] }) {
  const av = avatarFor(event.user_name ?? event.hostname);
  const hasFailedPolicy = (event.triggered_policies ?? []).some((policy) => policy.status === "failed");
  const decisionClass = event.decision === "deny" || hasFailedPolicy ? "blocked" : event.decision === "ask" ? "asked" : "allowed";
  const triggered = event.triggered_policies ?? [];
  const firstPolicy = triggered[0];
  const title = firstPolicy?.policy_name ?? compactRule(event.question ?? event.summary);
  return (
    <Link className="trigger-row" href={`/triggers/${event.id}`}>
      <span className="avatar-sm" style={{ background: av.bg, color: av.fg }}>{initials(event.user_name ?? event.hostname)}</span>
      <div className="trigger-copy">
        <div className="who">{event.user_name ?? "Unknown user"} <span>· {title}</span></div>
        <div className="agent-line">
          <AgentChip name={event.agent_name} />
        </div>
        {triggered.length > 0 && (
          <div className="evidence-list">
            {triggered.slice(0, 3).map((policy, index) => (
              <span key={`${policy.policy_name}-${index}`}>
                <strong>{policy.policy_name}</strong>
                {evidenceItems(policy.evidence).slice(0, 2).map((item) => `: ${truncate(item, 92)}`).join(" ")}
              </span>
            ))}
          </div>
        )}
      </div>
      <span className="path">{projectTag(event.project_path) ?? event.tool_name ?? event.event_name}</span>
      <span className={`tag ${decisionClass}`}><span className="dot" />{decisionClass}</span>
      <span className="when">{relativeTime(event.created_at)}</span>
    </Link>
  );
}

type HighlightedAction = {
  label: string;
  quote: string;
  created_at: string;
  project?: string;
};

type AgentActivityGroup = {
  key: string;
  agentName: string;
  agentKind: string;
  hostname?: string;
  userName?: string;
  actions: HighlightedAction[];
};

function AgentActivityCard({ group }: { group: AgentActivityGroup }) {
  return (
    <article className="agentActivityCard">
      <div className="agentActivityTop">
        <AgentLogo name={group.agentName} fallback={initials(group.agentName).slice(0, 1)} size="large" />
        <div className="agentActivityIdentity">
          <strong>{group.agentName}</strong>
          <span>{group.userName ?? "Unknown user"} · {group.hostname ?? "No endpoint"}</span>
        </div>
        <span className="pill mini">{group.actions.length} recent</span>
      </div>
      <div className="agentActionList">
        {group.actions.map((action, index) => (
          <div className="agentAction" key={`${action.label}-${action.created_at}-${index}`}>
            <div className="agentActionIcon">{iconForHighlight(action.label)}</div>
            <div className="agentActionCopy">
              <div className="agentActionTitle">{action.label}</div>
              <blockquote>{action.quote}</blockquote>
              <div className="agentActionMeta">{action.project ?? "No project"} · {new Date(action.created_at).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function agentHighlights(agents: Overview["agents"], recent: Overview["recent"]): AgentActivityGroup[] {
  const agentsByKey = new Map(agents.map((agent) => [agentProductKey(agent), agent]));
  const groups = new Map<string, AgentActivityGroup>();
  for (const event of recent) {
    const action = classifyHighlight(event);
    if (!action) continue;
    const key = agentProductKey({
      id: event.agent_name,
      kind: event.agent_name,
      display_name: event.agent_name,
      hostname: event.hostname,
      user_name: event.user_name,
      last_seen_at: event.created_at
    });
    const known = agentsByKey.get(key);
    const group = groups.get(key) ?? {
      key,
      agentName: known?.display_name ?? event.agent_name,
      agentKind: known?.kind ?? event.agent_name,
      hostname: known?.hostname ?? event.hostname,
      userName: known?.user_name ?? event.user_name,
      actions: []
    };
    if (group.actions.length < 5) {
      group.actions.push({ ...action, created_at: event.created_at, project: projectTag(event.project_path) ?? event.tool_name });
    }
    groups.set(key, group);
  }
  return Array.from(groups.values()).slice(0, 6);
}

function classifyHighlight(event: Overview["recent"][number]): Pick<HighlightedAction, "label" | "quote"> | undefined {
  const text = eventText(event).toLowerCase();
  if (event.decision === "allow" && (event.triggered_policies?.length ?? 0) === 0) return undefined;

  const policyLabel = labelFromPolicy(event);
  if (policyLabel) return { label: policyLabel, quote: highlightQuote(event) };

  const checks: Array<[string, RegExp]> = [
    ["Git repo creation", /\bgit\s+init\b|\bgh\s+repo\s+create\b|create (a )?(new )?git repo|create (a )?(new )?repository|initialize (a )?(new )?(git )?repo/],
    ["Credential file read", /\bread\b.*\.env|\bcat\b.*\.env|\bopen\b.*\.env|\bshow\b.*\.env|\bprint\b.*\.env|find .*\.env|search .*\.env|\.env.*read|\.env.*search|\.env.*find/],
    ["Credential file change", /\bwrite\b.*\.env|\bcreate\b.*\.env|\btouch\b.*\.env|\bedit\b.*\.env|\.env.*write|\.env.*create|\.env.*edit/],
    ["Secrets exposure", /private key|api[_ -]?key|secret|token|password|kubeconfig|\.npmrc|id_rsa|id_ed25519|credentials/],
    ["External sharing", /curl|wget|upload|pastebin|gist|webhook|send .*code|post .*secret|external domain/],
    ["New MCP config", /mcp|model context protocol|mcp\.json|\.cursor\/mcp|claude_desktop_config/],
    ["New VS Code settings", /settings\.json|keybindings\.json|extensions\.json|\.vscode/],
    ["New cron jobs / launch agents", /crontab|cron job|launchagent|launchdaemon|plist|launchctl/],
    ["New background processes", /nohup|pm2|systemctl|brew services|background process|daemon|&\s*$|disown/],
    ["Shell profile changed", /\.zshrc|\.bashrc|\.bash_profile|\.profile|shell profile|path export/],
    ["Git config changed", /git config|\.gitconfig|insteadOf|credential\.helper|core\.hooksPath/],
    ["Packages installed", /npm install|pnpm add|yarn add|pip install|brew install|cargo install|gem install/],
    ["Files created", /\btouch\b|new file|file created|create file|\bwrite\b.*\.(ts|tsx|js|jsx|py|go|rs|java|rb|php|html|css|md|json|yaml|yml)\b/],
    ["Files modified", /\bedit\b|\bmultiedit\b|\bmodify\b|\bpatch\b|file modified|changed file/]
  ];
  const match = checks.find(([, pattern]) => pattern.test(text));
  if (!match) return undefined;
  return { label: match[0], quote: highlightQuote(event) };
}

function labelFromPolicy(event: Overview["recent"][number]) {
  const policyNames = (event.triggered_policies ?? []).map((policy) => policy.policy_name.toLowerCase()).join("\n");
  const text = `${policyNames}\n${eventText(event).toLowerCase()}`;
  if (!policyNames && !text.trim()) return undefined;
  if (/git repo|repository|git init/.test(text)) return "Git repo creation";
  if (/credential|secret|\.env|token|private key|kubeconfig|\.npmrc|id_rsa|id_ed25519/.test(text)) {
    if (/\b(read|cat|open|show|print|search|find|grep|scan|dump|copy)\b/.test(text)) return "Credential file read";
    if (/\b(write|create|edit|touch|generate|save)\b/.test(text)) return "Credential file change";
    return "Credential access";
  }
  if (/destructive|rm -rf|delete|terraform destroy|git reset/.test(text)) return "Destructive command";
  if (/personal data|pii|ssn|passport|credit card|customer/.test(text)) return "Personal data use";
  if (/external|exfiltrat|upload|webhook|pastebin|gist/.test(text)) return "External sharing";
  if (/package|npm install|pip install|brew install/.test(text)) return "Package installation";
  return undefined;
}

function eventText(event: Overview["recent"][number]) {
  return [
    event.summary,
    event.question,
    event.event_name,
    event.tool_name,
    event.project_path,
    event.prompt,
    ...(event.triggered_policies ?? []).flatMap((policy) => [
      policy.policy_name,
      policy.explanation,
      ...evidenceItems(policy.evidence)
    ])
  ].filter(Boolean).join("\n");
}

function highlightQuote(event: Overview["recent"][number]) {
  const evidence = event.triggered_policies?.flatMap((policy) => evidenceItems(policy.evidence)).find(Boolean);
  return truncate(evidence ?? event.prompt ?? event.tool_name ?? event.summary, 140);
}

function iconForHighlight(label: string) {
  const text = label.toLowerCase();
  if (text.includes("package")) return <Package size={18} />;
  if (text.includes("git")) return <GitBranch size={18} />;
  if (text.includes("mcp") || text.includes("settings")) return <Settings size={18} />;
  if (text.includes("cron") || text.includes("background")) return <Activity size={18} />;
  if (text.includes("shell")) return <Code2 size={18} />;
  return <FileClock size={18} />;
}

function isTriggerEvent(event: Overview["recent"][number]) {
  return event.decision === "deny" || event.decision === "ask" || (event.triggered_policies?.length ?? 0) > 0;
}

function TriggersPage({
  triggers,
  detail,
  filters,
  mode,
  basePath
}: {
  triggers: TriggerItem[];
  detail?: TriggerDetail["trigger"];
  filters: Record<string, string | undefined>;
  mode: DashboardMode;
  basePath: string;
}) {
  const personal = mode === "personal";
  if (detail) return <TriggerDetailPage trigger={detail} basePath={basePath} mode={mode} />;
  return (
    <>
      <Topbar />
      <div className="page-head">
        <div>
          <h1>{personal ? "Activity" : "Triggers"}</h1>
          <p className="sub">{personal ? "Review the moments when OpenLeash protected you or asked for approval." : "Search policy interventions by user, policy, agent, project, or date."}</p>
        </div>
      </div>
      <div className="divider" />
      <form className="triggerFilters" action={dashboardHref(basePath, "/triggers")}>
        <label>
          <span>Search</span>
          <div className="searchInput"><Search size={16} /><input name="q" defaultValue={filters.q ?? ""} placeholder="Prompt, project, tool..." /></div>
        </label>
        <label>
          <span>{personal ? "Profile" : "User"}</span>
          <input name="user" defaultValue={filters.user ?? ""} placeholder={personal ? "You" : "Max Brin"} />
        </label>
        <label>
          <span>Policy</span>
          <input name="policy" defaultValue={filters.policy ?? ""} placeholder="Credential files" />
        </label>
        <label>
          <span>Decision</span>
          <select name="decision" defaultValue={filters.decision ?? ""}>
            <option value="">Any</option>
            <option value="ask">Needs approval</option>
            <option value="deny">Denied</option>
            <option value="allow">Allowed after review</option>
          </select>
        </label>
        <label>
          <span>From</span>
          <input name="dateFrom" type="date" defaultValue={filters.dateFrom ?? ""} />
        </label>
        <label>
          <span>To</span>
          <input name="dateTo" type="date" defaultValue={filters.dateTo ?? ""} />
        </label>
        <button type="submit">Filter</button>
      </form>

      <div className="triggerAuditList">
        {triggers.map((trigger) => <TriggerAuditRow key={trigger.id} trigger={trigger} basePath={basePath} />)}
        {triggers.length === 0 && <Empty text={personal ? "No personal activity matched this filter." : "No matching policy triggers."} />}
      </div>
    </>
  );
}

function TriggerAuditRow({ trigger, basePath }: { trigger: TriggerItem; basePath: string }) {
  const policy = trigger.triggered_policies?.[0];
  const evidence = trigger.triggered_policies?.flatMap((item) => evidenceItems(item.evidence)).slice(0, 2) ?? [];
  const state = trigger.resolution ?? trigger.decision;
  return (
    <Link className="triggerAuditRow" href={routeHref(basePath, `/triggers/${trigger.id}`)}>
      <div className="audit-main">
        <div className="audit-title">{policy?.policy_name ?? trigger.summary}</div>
        <div className="audit-meta">
          {trigger.user_name ?? "Unknown user"} · {trigger.agent_name} · {projectTag(trigger.project_path) ?? "No project"} · {relativeTime(trigger.created_at)}
        </div>
        {evidence.length > 0 && <div className="audit-evidence">{evidence.join(" · ")}</div>}
      </div>
      <span className={`tag ${state === "allow" ? "allowed" : state === "deny" ? "blocked" : "asked"}`}><span className="dot" />{state}</span>
      <ChevronRight size={18} className="muted" />
    </Link>
  );
}

function TriggerDetailPage({ trigger, basePath, mode }: { trigger: TriggerDetail["trigger"]; basePath: string; mode: DashboardMode }) {
  const failed = trigger.policy_results.filter((policy) => policy.status !== "passed");
  const transcript = latestConversationTurns(trigger);
  const personal = mode === "personal";
  return (
    <>
      <Topbar />
      <div className="page-head">
        <div>
          <h1>{personal ? "Activity detail" : "Trigger detail"}</h1>
          <p className="sub">{trigger.summary}</p>
        </div>
        <Link className="pill action-pill" href={routeHref(basePath, "/triggers")}>Back</Link>
      </div>
      <div className="divider" />

      <div className="detailGrid">
        <section className="detailPanel">
          <div className="card-title"><h3>What happened</h3></div>
          <dl className="metaGrid">
            <div><dt>User</dt><dd>{trigger.user_name ?? "Unknown"}</dd></div>
            <div><dt>Agent</dt><dd>{trigger.agent_name}</dd></div>
            <div><dt>Project</dt><dd>{trigger.project_path ?? "Unknown"}</dd></div>
            <div><dt>Tool/event</dt><dd>{trigger.tool_name ?? trigger.event_name}</dd></div>
            <div><dt>Decision</dt><dd>{trigger.resolution ?? trigger.decision}</dd></div>
            <div><dt>When</dt><dd>{new Date(trigger.created_at).toLocaleString()}</dd></div>
          </dl>
        </section>

        <section className="detailPanel">
          <div className="card-title"><h3>Triggered policies</h3></div>
          <div className="policyHitList">
            {failed.map((policy) => (
              <article key={`${policy.policy_name}-${policy.status}`}>
                <strong>{policy.policy_name}</strong>
                <span className={`tag ${policy.status === "failed" ? "blocked" : "asked"}`}><span className="dot" />{policy.status}</span>
                <p>{policy.explanation}</p>
                {evidenceItems(policy.evidence).map((item, index) => <code key={`${item}-${index}`}>{item}</code>)}
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="detailPanel full">
        <div className="card-title">
          <h3>Conversation context</h3>
          <span className="muted">Latest 5 messages</span>
        </div>
        {transcript.map((turn, index) => (
          <div key={index} className="conversationLine">
            <strong>{conversationRoleLabel(turn.role)}{turn.at ? ` · ${relativeTime(turn.at)}` : ""}</strong>
            <p>{turn.content}</p>
          </div>
        ))}
        {transcript.length === 0 && <Empty text="No transcript was included with this hook event." />}
      </section>
    </>
  );
}

function AgentChip({ name }: { name: string }) {
  return (
    <span className="agent-chip">
      <AgentLogo name={name} fallback={initials(name).slice(0, 1)} size="small" />
      <span>{name}</span>
    </span>
  );
}

function AgentLogo({ name, fallback, size }: { name: string; fallback: string; size: "small" | "large" }) {
  const icon = agentIconFor(name);
  return (
    <span className={`agent-logo ${size} ${icon ? "with-icon" : ""}`} aria-label={name}>
      {icon ? <img src={icon.src} alt="" /> : <span>{fallback}</span>}
    </span>
  );
}

function agentIconFor(name: string) {
  const text = name.toLowerCase();
  const base = "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons";
  if (text.includes("claude")) return { src: `${base}/claude.svg` };
  if (text.includes("salesforce") || text.includes("agentforce")) return { src: `${base}/salesforce.svg` };
  if (text.includes("azure") || text.includes("foundry")) return { src: `${base}/microsoftazure.svg` };
  if (text.includes("copilot") || text.includes("agent 365")) return { src: `${base}/microsoftcopilot.svg` };
  if (text.includes("bedrock") || text.includes("agentcore") || text.includes("aws")) return { src: `${base}/amazonaws.svg` };
  if (text.includes("vertex") || text.includes("gemini enterprise")) return { src: `${base}/googlecloud.svg` };
  if (text.includes("n8n")) return { src: `${base}/n8n.svg` };
  if (text.includes("zapier")) return { src: `${base}/zapier.svg` };
  if (text.includes("codex") || text.includes("openai")) return { src: `${base}/openai.svg` };
  if (text.includes("cursor")) return { src: `${base}/cursor.svg` };
  if (text.includes("gemini")) return { src: `${base}/googlegemini.svg` };
  if (text.includes("windsurf")) return { src: `${base}/windsurf.svg` };
  if (text.includes("copilot")) return { src: `${base}/githubcopilot.svg` };
  if (text.includes("zed")) return { src: `${base}/zedindustries.svg` };
  return undefined;
}

function usersFromAgents(agents: Overview["agents"]): UserRow[] {
  const grouped = new Map<string, UserRow>();
  for (const agent of agents) {
    const name = agent.user_name ?? "Unknown user";
    const key = name.toLowerCase();
    const current = grouped.get(key) ?? {
      id: key,
      email: emailFor(name),
      display_name: name,
      role: "engineer",
      created_at: agent.last_seen_at,
      endpoint_count: 0,
      agent_count: 0,
      last_seen_at: agent.last_seen_at,
      agents: [],
      hostnames: []
    };
    current.endpoint_count = Math.max(Number(current.endpoint_count ?? 0), agent.hostname ? 1 : 0);
    current.agent_count = Number(current.agent_count ?? 0) + 1;
    current.last_seen_at = newestDate(current.last_seen_at, agent.last_seen_at);
    current.agents = Array.from(new Set([...(current.agents ?? []), agent.display_name]));
    current.hostnames = Array.from(new Set([...(current.hostnames ?? []), agent.hostname].filter(Boolean)));
    grouped.set(key, current);
  }
  return Array.from(grouped.values());
}

function sessionsFromAgents(agents: Overview["agents"]): UsageSession[] {
  return agents.flatMap((agent) =>
    (agent.sessions ?? []).map((session) => ({
      ...session,
      user_name: agent.user_name,
      hostname: agent.hostname,
      agent_kind: agent.kind,
      agent_name: agent.display_name
    }))
  );
}

function usageByEmployee(sessions: UsageSession[]) {
  const grouped = new Map<string, { key: string; name: string; email: string; sessions: number; duration: number; subagents: number; lastActivity?: string }>();
  for (const session of sessions) {
    const key = session.user_id || session.user_email || session.user_name || session.hostname || "unknown";
    const current = grouped.get(key) ?? {
      key,
      name: session.user_name || session.user_email || session.hostname || "Unknown user",
      email: session.user_email || session.hostname || "",
      sessions: 0,
      duration: 0,
      subagents: 0,
      lastActivity: undefined
    };
    current.sessions += 1;
    current.duration += numeric(session.duration_seconds);
    current.subagents += numeric(session.subagent_seconds);
    if (!current.lastActivity || new Date(session.last_activity_at ?? 0).getTime() > new Date(current.lastActivity).getTime()) {
      current.lastActivity = session.last_activity_at;
    }
    grouped.set(key, current);
  }
  return [...grouped.values()].sort((a, b) => b.duration - a.duration);
}

function numeric(value: string | number | undefined | null) {
  return Number(value ?? 0) || 0;
}

function aggregateAgents(agents: Overview["agents"]) {
  const grouped = new Map<string, {
    key: string;
    displayName: string;
    kind: string;
    version?: string;
    users: number;
    installs: number;
    protectedPercent: number;
    userNames: Set<string>;
    hostnames: Set<string>;
    sessions: NonNullable<Overview["agents"][number]["sessions"]>;
  }>();
  for (const agent of agents) {
    const key = agentProductKey(agent);
    const current = grouped.get(key) ?? {
      key,
      displayName: agentProductName(agent),
      kind: agentProductKind(agent),
      version: agent.version,
      users: 0,
      installs: 0,
      protectedPercent: 0,
      userNames: new Set<string>(),
      hostnames: new Set<string>(),
      sessions: []
    };
    if (agent.user_name) current.userNames.add(agent.user_name);
    if (agent.hostname) current.hostnames.add(agent.hostname);
    current.installs += 1;
    current.version = current.version ?? agent.version;
    current.sessions.push(...(agent.sessions ?? []));
    grouped.set(key, current);
  }
  return Array.from(grouped.values()).map((agent) => ({
    ...agent,
    users: agent.userNames.size,
    protectedPercent: agent.installs > 0 ? 96 : 0,
    sessions: agent.sessions.sort((a, b) => new Date(b.last_activity_at ?? 0).getTime() - new Date(a.last_activity_at ?? 0).getTime())
  }));
}

function agentProductKey(agent: Overview["agents"][number]) {
  const text = `${agent.kind} ${agent.display_name}`.toLowerCase();
  if (text.includes("claude")) return "claude-code";
  if (text.includes("codex") || text.includes("openai")) return "openai-codex";
  if (text.includes("cursor")) return "cursor";
  if (text.includes("gemini")) return "gemini";
  if (text.includes("windsurf")) return "windsurf";
  if (text.includes("aider")) return "aider";
  return agent.kind || agent.display_name.toLowerCase();
}

function agentProductName(agent: Overview["agents"][number]) {
  const key = agentProductKey(agent);
  if (key === "claude-code") return "Claude Code";
  if (key === "openai-codex") return "OpenAI Codex";
  if (key === "cursor") return "Cursor";
  if (key === "gemini") return "Gemini";
  if (key === "windsurf") return "Windsurf";
  if (key === "aider") return "Aider";
  return agent.display_name;
}

function agentProductKind(agent: Overview["agents"][number]) {
  const key = agentProductKey(agent);
  if (key === "claude-code") return "claude-code";
  if (key === "openai-codex") return "codex";
  return agent.kind;
}

function emailFor(name: string) {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "") || "user"}@northwind.example`;
}

function newestDate(a?: string | null, b?: string | null) {
  if (!a) return b ?? null;
  if (!b) return a;
  return new Date(a).getTime() >= new Date(b).getTime() ? a : b;
}

function departmentFor(email: string) {
  if (/security|platform|infra|sre|devops/i.test(email)) return "Infrastructure";
  if (/data|analytics/i.test(email)) return "Data";
  return "Engineering";
}

function titleFor(role: string) {
  return role
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ") || "Engineer";
}

function Logo() {
  return <img src="/openleash-icon.png" alt="" width="34" height="34" />;
}

function iconForPolicy(policy: Overview["policies"][number], index: number) {
  const text = `${policy.name} ${policy.description}`.toLowerCase();
  if (text.includes("credential") || text.includes("ssh") || text.includes("secret") || text.includes(".env")) return <Lock size={20} />;
  if (text.includes("git") || text.includes("push") || text.includes("ci")) return <GitBranch size={20} />;
  if (text.includes("pii") || text.includes("data")) return <Database size={20} />;
  if (text.includes("install") || text.includes("package") || text.includes("binary")) return <Package size={20} />;
  if (text.includes("system") || text.includes("file")) return <Code2 size={20} />;
  return [<Shield key="shield" size={20} />, <FileClock key="file" size={20} />, <Laptop key="laptop" size={20} />][index % 3];
}

function agentMark(name: string, index: number) {
  const base = agentPalette[index % agentPalette.length];
  const letter = name.trim().charAt(0).toUpperCase() || base.letter;
  return { ...base, letter };
}

function avatarFor(key: string) {
  return avatarPalette[(key.charCodeAt(0) + key.length) % avatarPalette.length];
}

function initials(name: string) {
  return name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function compactRule(value: string) {
  const compact = value
    .replace(/exfiltration of PII to external endpoints/i, "PII exfiltration")
    .replace(/\.env files outside project root/i, ".env outside root")
    .replace(/^Block access to /i, "")
    .replace(/^Prevent reading /i, "")
    .replace(/^Require approval before pushing/i, "Push")
    .replace(/^Block /i, "")
    .replace(/^Prevent /i, "")
    .replace(/^Disallow /i, "")
    .replace(/^Require approval before /i, "")
    .replace(/^Redact /i, "")
    .replace(/\.$/, "");
  return compact.charAt(0).toUpperCase() + compact.slice(1);
}

function evidenceItems(value: string[] | string | undefined) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string" && item.length > 0) : [value];
  } catch {
    return [value];
  }
}

function latestConversationTurns(trigger: TriggerDetail["trigger"]): ConversationTurnView[] {
  const turns = transcriptFromPayload(trigger.payload);
  const prompt = trigger.prompt?.trim();
  const hasPrompt = prompt && turns.some((turn) => turn.role === "user" && turn.content.trim() === prompt);
  const promptTurn: ConversationTurnView | undefined = prompt
    ? { role: "user", content: prompt, at: trigger.occurred_at }
    : undefined;
  const all = prompt && !hasPrompt
    ? [...turns, promptTurn].filter((turn): turn is ConversationTurnView => Boolean(turn))
    : turns;
  return all.slice(-5).reverse();
}

function transcriptFromPayload(payload: unknown): ConversationTurnView[] {
  if (!payload || typeof payload !== "object") return [];
  const transcript = (payload as { transcript?: unknown }).transcript;
  if (!Array.isArray(transcript)) return [];
  return transcript
    .map((turn) => {
      if (!turn || typeof turn !== "object") return undefined;
      const record = turn as { role?: unknown; content?: unknown; at?: unknown };
      return {
        role: typeof record.role === "string" ? record.role : "message",
        content: typeof record.content === "string" ? record.content : JSON.stringify(record.content ?? ""),
        ...(typeof record.at === "string" ? { at: record.at } : {})
      };
    })
    .filter((turn): turn is ConversationTurnView => Boolean(turn?.content));
}

function conversationRoleLabel(role: string) {
  if (role === "user") return "User";
  if (role === "assistant") return "Assistant";
  if (role === "tool") return "Tool";
  if (role === "system") return "System";
  return "Message";
}

function projectTag(value?: string) {
  if (!value) return undefined;
  const normalized = value.replace(/\\/g, "/").replace(/\/+$/, "");
  return normalized.split("/").filter(Boolean).pop() ?? normalized;
}

function truncate(value: string, max: number) {
  return value.length <= max ? value : `${value.slice(0, max - 1)}...`;
}

function relativeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const minutes = Math.max(1, Math.round((Date.now() - date.getTime()) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function formatDuration(value: string | number | undefined) {
  const total = Math.max(0, Number(value ?? 0));
  if (total < 60) return total ? `${total}s` : "0s";
  const minutes = Math.floor(total / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

function Empty({ text }: { text: string }) {
  return <p className="empty">{text}</p>;
}
