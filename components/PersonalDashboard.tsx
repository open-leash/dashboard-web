"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Apple,
  BellRing,
  Check,
  ChevronRight,
  ClipboardCheck,
  Cloud,
  Eye,
  FileText,
  Github,
  History,
  Home,
  Laptop,
  LogOut,
  Monitor,
  Plus,
  Search,
  Settings,
  Shield,
  TrendingDown,
  User,
  Zap,
  X
} from "lucide-react";
import { DashboardSignOutIconButton } from "./DashboardAuth";
import { apiVersionHeaders } from "@openleash/shared";

type PersonalOutcome = {
  id: string;
  domain: string;
  title: string;
  summary?: string | null;
  severity: string;
  status: string;
  decision?: string | null;
  source?: { pluginId?: string; label?: string };
  agent?: { name?: string | null; kind?: string | null; hostname?: string | null };
  evidence?: Array<{ label: string; value?: string }>;
};

type PersonalViewModel = {
  summary?: {
    totalOutcomes?: number;
    blocked?: number;
    needsReview?: number;
  };
  pluginCategories?: Array<{
    id: string;
    label: string;
    plugins: PersonalPlugin[];
  }>;
};

type PersonalPlugin = {
  id: string;
  slug?: string;
  name?: string;
  packageId?: string;
  displayName?: string;
  description?: string;
  publisher?: string;
  author?: string;
  category?: string;
  tags?: string[];
  repositoryUrl?: string;
  installed?: boolean;
  iconText?: string;
  downloadCount?: number;
  marketplace?: {
    slug?: string;
    shortDescription?: string;
    category?: string;
    tags?: string[];
    developerName?: string;
    downloadCount?: number;
    iconText?: string;
    repositoryUrl?: string;
  };
  settings?: {
    enabled?: boolean;
    config?: Record<string, unknown>;
    installedVersion?: string;
    availableVersion?: string;
    updateAvailable?: boolean;
    updatePolicy?: "manual" | "patch" | "minor" | "locked";
    profiles?: PersonalPluginProfile[];
    inheritedProfiles?: PersonalPluginProfile[];
    runtimeAvailable?: boolean;
    runtimeError?: string;
  };
  organizationPolicy?: {
    mandatory?: boolean;
    configLocked?: boolean;
    userInstallAllowed?: boolean;
  };
  configSchema?: { properties?: Record<string, Record<string, unknown>> };
  defaultConfig?: Record<string, unknown>;
  outcomeCount?: number;
};

type PersonalPluginProfile = {
  id: string;
  name: string;
  agentKinds: string[];
  agentIds?: string[];
  enabled?: boolean;
  config: Record<string, unknown>;
  priority?: number;
};

type PersonalAgent = {
  id?: string;
  kind?: string;
  display_name?: string;
  displayName?: string;
  installed?: boolean;
  protected?: boolean;
  desired_monitored?: boolean;
  desiredMonitored?: boolean;
  hostname?: string;
  platform?: string;
  project_path?: string;
};

type DesktopComputer = {
  hostname?: string;
  platform?: string;
  os_release?: string;
  last_seen_at?: string;
};

type Notifications = {
  pendingApprovals: Array<{
    id: string;
    summary?: string | null;
    question?: string | null;
    event_name?: string | null;
    tool_name?: string | null;
    project_name?: string | null;
    project_path?: string | null;
    agent_name?: string | null;
    agent_kind?: string | null;
    plugin_name?: string | null;
  }>;
  blockedEvents: Array<{
    id: string;
    summary?: string | null;
    question?: string | null;
    triggered_policies?: Array<{ policy_name?: string; explanation?: string }>;
    agent_name?: string | null;
    agent_kind?: string | null;
    tool_name?: string | null;
    plugin_name?: string | null;
  }>;
};

type PersonalView = "overview" | "agents" | "plugins" | "usage" | "history" | "settings";

const personalPluginAgentKinds = [
  "claude-code", "codex", "cursor", "github-copilot", "gemini", "opencode", "cline",
  "continue", "windsurf", "kiro", "aider", "zed", "openclaw", "nanoclaw",
  "salesforce-agentforce", "azure-ai-foundry", "microsoft-copilot-studio",
  "aws-bedrock-agentcore", "google-vertex-ai", "n8n", "zapier-agents",
  "openai-codex-cloud", "unknown"
];

export function PersonalDashboard({
  apiUrl,
  clientApiUrl,
  deploymentMode = "cloud"
}: {
  apiUrl: string;
  clientApiUrl: string;
  deploymentMode?: "cloud" | "private";
}) {
  const [view, setView] = useState<PersonalView>("overview");
  const [selectedCategory, setSelectedCategory] = useState("cost");
  const [selectedPluginId, setSelectedPluginId] = useState("");
  const [plugins, setPlugins] = useState<PersonalPlugin[]>([]);
  const [viewModel, setViewModel] = useState<PersonalViewModel | null>(null);
  const [agents, setAgents] = useState<PersonalAgent[]>([]);
  const [outcomes, setOutcomes] = useState<PersonalOutcome[]>([]);
  const [notifications, setNotifications] = useState<Notifications>({ pendingApprovals: [], blockedEvents: [] });
  const [desktopConnected, setDesktopConnected] = useState(false);
  const [desktopComputer, setDesktopComputer] = useState<DesktopComputer | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState("");
  const [pluginDraft, setPluginDraft] = useState<Record<string, Record<string, unknown>>>({});
  const [marketplaceSearch, setMarketplaceSearch] = useState("");
  const [marketplaceCategory, setMarketplaceCategory] = useState<"all" | "cost" | "security" | "observability" | "utility">("all");
  const [installingPluginId, setInstallingPluginId] = useState("");

  const categories = useMemo(() => personalPluginCategories(viewModel, plugins), [plugins, viewModel]);
  const allPlugins = useMemo(() => allPersonalPlugins(plugins, viewModel), [plugins, viewModel]);
  const availablePlugins = allPlugins.filter((plugin) => !isPluginInstalled(plugin));
  const selectedPlugin = allPlugins.find((plugin) => plugin.id === selectedPluginId)
    || undefined;
  const visiblePlugins = selectedCategory === "all"
    ? availablePlugins
    : categories.find((category) => category.id === selectedCategory)?.plugins ?? [];
  const showPluginList = selectedCategory === "all" || !selectedPluginId;
  const installingPlugin = allPlugins.find((plugin) => plugin.id === installingPluginId);

  useEffect(() => {
    let cancelled = false;
    async function tick() {
      const token = dashboardToken();
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };
      const [stateResponse, outcomeResponse, pluginResponse, sessionResponse, notificationsResponse] = await Promise.all([
        fetch(`${clientApiUrl}/v1/mobile/state`, { headers: { ...headers, ...apiVersionHeaders("mobileState") } }),
        fetch(`${clientApiUrl}/v1/outcomes?limit=30`, { headers: { ...headers, ...apiVersionHeaders("authAccountOutcomes") } }),
        fetch(`${clientApiUrl}/v1/plugins`, { headers: { ...headers, ...apiVersionHeaders("tenantPluginsRead") } }),
        fetch(`${apiUrl}/auth/session`, { headers }),
        fetch(`${clientApiUrl}/v1/client/notifications`, { headers: { ...headers, ...apiVersionHeaders("clientNotifications") } })
      ]);
      const stateBody = stateResponse.ok ? await stateResponse.json().catch(() => ({})) : {};
      const outcomeBody = outcomeResponse.ok ? await outcomeResponse.json().catch(() => ({})) : {};
      const pluginBody = pluginResponse.ok ? await pluginResponse.json().catch(() => ({})) : {};
      const sessionBody = sessionResponse.ok ? await sessionResponse.json().catch(() => ({})) : {};
      const notificationsBody = notificationsResponse.ok ? await notificationsResponse.json().catch(() => ({})) : {};
      if (cancelled) return;
      const nextViewModel = objectOrNull(stateBody.viewModel) ?? objectOrNull(outcomeBody.viewModel);
      const nextPlugins = firstNonEmptyPlugins(pluginBody.plugins, stateBody.plugins, flattenViewModelPlugins(nextViewModel));
      setViewModel(nextViewModel);
      setPlugins(nextPlugins);
      setOutcomes(Array.isArray(stateBody.outcomes) ? stateBody.outcomes : Array.isArray(outcomeBody.outcomes) ? outcomeBody.outcomes : []);
      setAgents(Array.isArray(stateBody.agents) ? stateBody.agents : []);
      setNotifications({
        pendingApprovals: Array.isArray(notificationsBody.pendingApprovals) ? notificationsBody.pendingApprovals : [],
        blockedEvents: Array.isArray(notificationsBody.blockedEvents) ? notificationsBody.blockedEvents : []
      });
      setDesktopConnected(Boolean(sessionBody.desktop?.connected));
      setDesktopComputer(sessionBody.desktop?.computer ?? null);
      setMessage(!stateResponse.ok || !pluginResponse.ok ? "Sync issue: client API is not fully reachable." : "");
    }
    void tick().catch(() => {
      if (!cancelled) setMessage("Sync issue: client API unreachable.");
    });
    const interval = window.setInterval(() => void tick().catch(() => undefined), 3000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [apiUrl, clientApiUrl]);

  async function setPluginInstalled(plugin: PersonalPlugin, install: boolean) {
    const token = dashboardToken();
    if (!token) return;
    if (!install && !window.confirm(`Remove ${pluginPackageName(plugin)} from OpenLeash?`)) return;
    setBusy(`${install ? "install" : "uninstall"}:${plugin.id}`);
    setMessage("");
    try {
      const response = await fetch(`${clientApiUrl}/v1/plugins/${encodeURIComponent(plugin.id)}/${install ? "install" : "uninstall"}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, ...apiVersionHeaders("adminPluginsWrite") }
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || `Could not ${install ? "install" : "remove"} plugin.`);
      setMessage(`${pluginPackageName(plugin)} ${install ? "installed" : "removed"}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : `Could not ${install ? "install" : "remove"} plugin.`);
    } finally {
      setBusy("");
    }
  }

  async function installPluginWithConfig(plugin: PersonalPlugin) {
    const token = dashboardToken();
    if (!token) return;
    setBusy(`install:${plugin.id}`);
    setMessage("");
    try {
      const installResponse = await fetch(`${clientApiUrl}/v1/plugins/${encodeURIComponent(plugin.id)}/install`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, ...apiVersionHeaders("adminPluginsWrite") }
      });
      const installBody = await installResponse.json().catch(() => ({}));
      if (!installResponse.ok) throw new Error(installBody.error || "Could not install plugin.");
      const settingsResponse = await fetch(`${clientApiUrl}/v1/plugins/${encodeURIComponent(plugin.id)}/settings`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...apiVersionHeaders("adminPluginsWrite") },
        body: JSON.stringify({
          enabled: true,
          config: effectivePluginConfig(plugin, pluginDraft[plugin.id])
        })
      });
      const settingsBody = await settingsResponse.json().catch(() => ({}));
      if (!settingsResponse.ok) throw new Error(settingsBody.error || "Plugin installed, but settings could not be saved.");
      setInstallingPluginId("");
      setPluginDraft((current) => {
        const next = { ...current };
        delete next[plugin.id];
        return next;
      });
      setMessage(`${pluginPackageName(plugin)} installed.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not install plugin.");
    } finally {
      setBusy("");
    }
  }

  async function savePluginSettings(plugin: PersonalPlugin, profiles?: PersonalPluginProfile[]) {
    const token = dashboardToken();
    if (!token) return;
    setBusy(`settings:${plugin.id}`);
    setMessage("");
    try {
      const response = await fetch(`${clientApiUrl}/v1/plugins/${encodeURIComponent(plugin.id)}/settings`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...apiVersionHeaders("adminPluginsWrite") },
        body: JSON.stringify({
          enabled: isPluginInstalled(plugin),
          config: effectivePluginConfig(plugin, pluginDraft[plugin.id]),
          ...(profiles ? { profiles } : {})
        })
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "Could not save plugin settings.");
      setPluginDraft((current) => {
        const next = { ...current };
        delete next[plugin.id];
        return next;
      });
      setMessage(`${pluginPackageName(plugin)} settings saved.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save plugin settings.");
    } finally {
      setBusy("");
    }
  }

  async function updatePlugin(plugin: PersonalPlugin) {
    const token = dashboardToken();
    if (!token) return;
    setBusy(`update:${plugin.id}`);
    setMessage("");
    try {
      const response = await fetch(`${clientApiUrl}/v1/plugins/${encodeURIComponent(plugin.id)}/update`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, ...apiVersionHeaders("adminPluginsWrite") }
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "Could not update plugin.");
      setMessage(`${pluginPackageName(plugin)} updated.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update plugin.");
    } finally {
      setBusy("");
    }
  }

  function updatePluginDraft(plugin: PersonalPlugin, key: string, value: unknown) {
    setPluginDraft((current) => ({
      ...current,
      [plugin.id]: {
        ...effectivePluginConfig(plugin, current[plugin.id]),
        [key]: value
      }
    }));
  }

  async function setAgentMonitoring(kind: string, monitored: boolean) {
    const token = dashboardToken();
    const normalizedKind = normalizeAgentKind(kind);
    if (!token || !normalizedKind) return;
    const previousAgents = agents;
    setAgents((current) => current.map((agent) => normalizeAgentKind(agent.kind || agent.display_name || agent.displayName || "") === normalizedKind ? { ...agent, desired_monitored: monitored } : agent));
    try {
      const response = await fetch(`${clientApiUrl}/v1/agents/${encodeURIComponent(normalizedKind)}/monitoring`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...apiVersionHeaders("mobileState") },
        body: JSON.stringify({ monitored })
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || body.message || "Could not update agent monitoring.");
      setMessage(`OpenLeash will ${monitored ? "turn on" : "turn off"} ${agentDisplayName(normalizedKind)} monitoring from the desktop client.`);
    } catch (error) {
      setAgents(previousAgents);
      setMessage(error instanceof Error ? error.message : "Could not update agent monitoring.");
    }
  }

  const inventory = agentInventory(agents);

  return (
    <div className="app personalClientApp">
      <PersonalSidebar
        view={view}
        selectedCategory={selectedCategory}
        categories={categories}
        availableCount={availablePlugins.length}
        installedAgentCount={inventory.filter((agent) => agent.installed).length}
        selectedPluginId={selectedPlugin?.id}
        onView={setView}
        onCategory={(category) => {
          setView("plugins");
          setSelectedCategory(category);
          setSelectedPluginId("");
        }}
        onPlugin={(category, pluginId) => {
          setView("plugins");
          setSelectedCategory(category);
          setSelectedPluginId(pluginId);
        }}
      />
      <main className="personalClientMain">
        <PersonalTopbar deploymentMode={deploymentMode} />
        <NotificationDock notifications={notifications} />
        {view === "overview" || view === "agents" ? (
          <PersonalOverview
            agents={inventory}
            outcomes={outcomes}
            viewModel={viewModel}
            pendingApprovals={notifications.pendingApprovals.length}
            desktopConnected={desktopConnected}
            desktopComputer={desktopComputer}
            message={message}
            agentsOnly={view === "agents"}
            onAgentMonitoringChange={setAgentMonitoring}
          />
        ) : null}
        {view === "plugins" ? (
          <>
            {selectedCategory === "all" ? (
              <PluginMarketplacePanel
                plugins={availablePlugins}
                search={marketplaceSearch}
                category={marketplaceCategory}
                onSearch={setMarketplaceSearch}
                onCategory={setMarketplaceCategory}
                onInstall={(plugin) => {
                  setInstallingPluginId(plugin.id);
                  setPluginDraft((current) => ({
                    ...current,
                    [plugin.id]: effectivePluginConfig(plugin, current[plugin.id])
                  }));
                }}
              />
            ) : showPluginList ? <section className="personalPanel">
              <div className="personalPanelHead">
                <div>
                  <span className={`personalCategoryTag ${selectedCategory}`}>{selectedCategory === "all" ? <Plus size={14} /> : categoryIcon(selectedCategory)} {selectedCategory === "all" ? "Add plugins" : `${categoryLabel(selectedCategory)} plugins`}</span>
                  <h2>{selectedCategory === "all" ? "Install plugins" : "Installed plugins"}</h2>
                </div>
              </div>
              <div className="personalPluginGrid">
                {visiblePlugins.map((plugin) => (
                  <button type="button" className={selectedPlugin?.id === plugin.id ? "personalPluginCard active" : "personalPluginCard"} key={plugin.id} onClick={() => setSelectedPluginId(plugin.id)}>
                    <span className={`personalPluginIcon ${pluginCategory(plugin)}`}>{pluginIconText(plugin)}</span>
                    <strong>{pluginPackageName(plugin)}</strong>
                    <p>{pluginDescription(plugin)}</p>
                    <em>{pluginStatusLabel(plugin)}</em>
                  </button>
                ))}
                {visiblePlugins.length === 0 ? <p className="personalEmpty">{selectedCategory === "all" ? "All available plugins are installed." : "No installed plugins in this category."}</p> : null}
              </div>
            </section> : null}
            {selectedPlugin ? (
                <PluginDetail
                  plugin={selectedPlugin}
                  agents={agents}
                  outcomes={outcomes.filter((outcome) => outcome.source?.pluginId === selectedPlugin.id)}
                  draft={pluginDraft[selectedPlugin.id]}
                  busy={busy}
                  message={message}
                  onDraftChange={updatePluginDraft}
                  onSave={savePluginSettings}
                  onUpdate={updatePlugin}
                  onInstallChange={setPluginInstalled}
                />
            ) : null}
            {installingPlugin ? (
              <PluginInstallDialog
                plugin={installingPlugin}
                draft={pluginDraft[installingPlugin.id]}
                busy={busy}
                message={message}
                onDraftChange={updatePluginDraft}
                onCancel={() => setInstallingPluginId("")}
                onInstall={installPluginWithConfig}
              />
            ) : null}
          </>
        ) : null}
        {view === "usage" ? <SimplePanel title="Usage" text="Usage will appear as plugin outcomes, approvals, and agent events are reported." /> : null}
        {view === "history" ? <HistoryPanel outcomes={outcomes} /> : null}
        {view === "settings" ? <SimplePanel title="Settings" text="Account, local agent connection, and personal plugin settings." /> : null}
      </main>
    </div>
  );
}

function PersonalSidebar({
  view,
  selectedCategory,
  categories,
  availableCount,
  installedAgentCount,
  selectedPluginId,
  onView,
  onCategory,
  onPlugin
}: {
  view: PersonalView;
  selectedCategory: string;
  categories: ReturnType<typeof personalPluginCategories>;
  availableCount: number;
  installedAgentCount: number;
  selectedPluginId?: string;
  onView: (view: PersonalView) => void;
  onCategory: (category: string) => void;
  onPlugin: (category: string, pluginId: string) => void;
}) {
  return (
    <aside className="sidebar personalClientSidebar">
      <div className="brand">
        <div className="brand-mark"><img src="/openleash-icon.png" alt="" /></div>
        <div className="brand-name">OpenLeash</div>
      </div>
      <nav className="nav" aria-label="Dashboard sections">
        <PersonalNavButton active={view === "overview"} icon={<Home />} label="Overview" onClick={() => onView("overview")} />
        <PersonalNavButton active={view === "agents"} icon={<Laptop />} label="Agents" badge={installedAgentCount} onClick={() => onView("agents")} />
        {categories.map((category) => (
          <div className="personalNavGroup" key={category.id}>
            <PersonalNavButton
              active={view === "plugins" && selectedCategory === category.id}
              icon={categoryIcon(category.id)}
              label={category.label}
              badge={category.plugins.length}
              tone={category.id}
              onClick={() => onCategory(category.id)}
            />
            {category.plugins.map((plugin) => (
              <button
                type="button"
                className={view === "plugins" && selectedPluginId === plugin.id ? "personalNavPlugin active" : "personalNavPlugin"}
                key={plugin.id}
                onClick={() => onPlugin(category.id, plugin.id)}
              >
                {pluginPackageName(plugin)}
              </button>
            ))}
          </div>
        ))}
        <PersonalNavButton active={view === "plugins" && selectedCategory === "all"} icon={<Plus />} label="Add plugins" badge={availableCount} onClick={() => onCategory("all")} />
        <PersonalNavButton active={view === "usage"} icon={<Activity />} label="Usage" onClick={() => onView("usage")} />
        <PersonalNavButton active={view === "history"} icon={<History />} label="History" onClick={() => onView("history")} />
        <PersonalNavButton active={false} icon={<FileText />} label="Log" onClick={() => { window.location.href = "/log"; }} />
        <PersonalNavButton active={view === "settings"} icon={<Settings />} label="Settings" onClick={() => onView("settings")} />
      </nav>
    </aside>
  );
}

function PersonalNavButton({ active, icon, label, badge, tone, onClick }: { active: boolean; icon: React.ReactNode; label: string; badge?: number; tone?: string; onClick: () => void }) {
  return (
    <button type="button" className={active ? `nav-item personalNavItem active ${tone ?? ""}` : `nav-item personalNavItem ${tone ?? ""}`} onClick={onClick}>
      <span className="ic">{icon}</span>
      <span>{label}</span>
      <span className="badge">{badge ?? 0}</span>
    </button>
  );
}

function PersonalTopbar({ deploymentMode }: { deploymentMode: "cloud" | "private" }) {
  return (
    <div className="personalTopbar">
      <span>{deploymentMode === "private" ? "Private Cloud" : "OpenLeash Cloud"}</span>
      <DashboardSignOutIconButton />
    </div>
  );
}

function NotificationDock({ notifications }: { notifications: Notifications }) {
  const count = notifications.pendingApprovals.length + notifications.blockedEvents.length;
  if (count === 0) return null;
  return (
    <aside className="personalNotificationDock">
      <strong><BellRing size={15} /> Live OpenLeash</strong>
      <span>{count} active</span>
      {[...notifications.pendingApprovals, ...notifications.blockedEvents].slice(0, 2).map((item) => (
        <small key={item.id}>Plugin: {item.plugin_name || "OpenLeash core"}</small>
      ))}
    </aside>
  );
}

function PersonalOverview({
  agents,
  outcomes,
  viewModel,
  pendingApprovals,
  desktopConnected,
  desktopComputer,
  message,
  agentsOnly,
  onAgentMonitoringChange
}: {
  agents: ReturnType<typeof agentInventory>;
  outcomes: PersonalOutcome[];
  viewModel: PersonalViewModel | null;
  pendingApprovals: number;
  desktopConnected: boolean;
  desktopComputer: DesktopComputer | null;
  message: string;
  agentsOnly?: boolean;
  onAgentMonitoringChange: (kind: string, monitored: boolean) => void;
}) {
  return (
    <>
      {!agentsOnly ? (
        <section className="personalPanel personalActivity">
          <div>
            <span className="personalKicker">Activity</span>
            <h1>Waiting for agent activity.</h1>
            <p>Plugin outcomes, approvals, and blocked events will appear here and in the plugin views.</p>
          </div>
          <div className="personalSummaryPills">
            <span>{viewModel?.summary?.totalOutcomes ?? outcomes.length} outcomes</span>
            <span>{viewModel?.summary?.blocked ?? 0} blocked</span>
            <span>{viewModel?.summary?.needsReview ?? pendingApprovals} needs review</span>
          </div>
        </section>
      ) : null}
      <section className="personalPanel personalOverviewHead">
        <div>
          <h1>{agentsOnly ? "Agents" : "Overview"}</h1>
          <p>{agentsOnly ? "All AI agents seen for this account." : "What local AI agents are doing right now."}</p>
        </div>
        <DesktopSummary connected={desktopConnected} computer={desktopComputer} />
      </section>
      {message ? <p className="personalSyncMessage">{message}</p> : null}
      {agentsOnly ? (
        <section className="personalAgentGrid">
          {agents.map((agent) => (
            <article className={`personalAgentTile ${agent.installed ? agent.protected ? "active" : "unmonitored" : "missing"}`} key={agent.kind}>
              <span className={agent.installed ? "personalAgentIcon" : "personalAgentIcon muted"}><img src={agent.icon} alt="" /></span>
              <span className="personalAgentText">
                <strong>{agent.displayName}</strong>
                <small>{agent.detail}</small>
                {agent.installed ? (
                  <span className="personalAgentMeta">
                    {agentInstallBadges(agent).map((badge) => <i className={badge.kind} title={badge.title} key={badge.kind}>{badge.icon}</i>)}
                    <label className="personalSwitch" title={agent.desiredMonitored ? "Monitored" : "Unmonitored"}>
                      <input type="checkbox" checked={agent.desiredMonitored} onChange={(event) => onAgentMonitoringChange(agent.kind, event.currentTarget.checked)} />
                      <span />
                    </label>
                  </span>
                ) : null}
              </span>
            </article>
          ))}
        </section>
      ) : null}
    </>
  );
}

function DesktopSummary({ connected, computer }: { connected: boolean; computer: DesktopComputer | null }) {
  if (!connected) return <span className="personalCloudPill">Desktop not connected</span>;
  return (
    <div className="personalConnectedDevice">
      <span>{desktopPlatformIcon(computer?.platform)}</span>
      <div>
        <strong>{computer?.hostname || "Connected desktop"}</strong>
        <small>{desktopPlatformLabel(computer?.platform)}{computer?.os_release ? ` ${computer.os_release}` : ""}</small>
      </div>
      <em>{computer?.last_seen_at ? `Synced ${relativeTime(computer.last_seen_at)}` : "Connected"}</em>
    </div>
  );
}

function PluginMarketplacePanel({
  plugins,
  search,
  category,
  onSearch,
  onCategory,
  onInstall
}: {
  plugins: PersonalPlugin[];
  search: string;
  category: "all" | "cost" | "security" | "observability" | "utility";
  onSearch: (value: string) => void;
  onCategory: (value: "all" | "cost" | "security" | "observability" | "utility") => void;
  onInstall: (plugin: PersonalPlugin) => void;
}) {
  const counts = {
    all: plugins.length,
    cost: plugins.filter((plugin) => pluginCategory(plugin) === "cost").length,
    security: plugins.filter((plugin) => pluginCategory(plugin) === "security").length,
    observability: plugins.filter((plugin) => pluginCategory(plugin) === "observability").length,
    utility: plugins.filter((plugin) => pluginCategory(plugin) === "utility").length
  };
  const query = search.trim().toLowerCase();
  const organizationControlsInstalls = plugins.length > 0 && plugins.every((plugin) => plugin.organizationPolicy?.userInstallAllowed === false);
  const filtered = plugins
    .filter((plugin) => category === "all" || pluginCategory(plugin) === category)
    .filter((plugin) => {
      if (!query) return true;
      return [pluginPackageName(plugin), pluginDescription(plugin), pluginAuthor(plugin), pluginCategory(plugin)]
        .join(" ")
        .toLowerCase()
        .includes(query);
    })
    .sort((left, right) => Number(right.downloadCount ?? right.marketplace?.downloadCount ?? 0) - Number(left.downloadCount ?? left.marketplace?.downloadCount ?? 0) || pluginPackageName(left).localeCompare(pluginPackageName(right)));
  return (
    <section className="personalPanel personalMarketplace">
      <div className="personalMarketplaceHero">
        <div>
          <span className="personalKicker">Add plugins</span>
          <h1>Plugin Catalog</h1>
          <p>Search reviewed plugins and add them to your OpenLeash pipeline.</p>
        </div>
      </div>
      {organizationControlsInstalls ? (
        <div className="personalMarketplacePolicyNotice">
          <Shield size={17} />
          <span>Your organization manages plugin installs. You can still browse the catalog.</span>
        </div>
      ) : null}
      <label className="personalMarketplaceSearch">
        <Search size={18} />
        <input value={search} onChange={(event) => onSearch(event.currentTarget.value)} placeholder="Search by plugin, capability, or category..." />
      </label>
      <div className="personalMarketplaceControls">
        {(["all", "observability", "cost", "security", "utility"] as const).map((item) => (
          <button type="button" className={category === item ? `active ${item}` : item} key={item} onClick={() => onCategory(item)}>
            {item === "all" ? null : categoryIcon(item)}
            {item === "all" ? "All" : categoryLabel(item)}
            <em>{counts[item]}</em>
          </button>
        ))}
      </div>
      <div className="personalMarketplaceResults">
        <span>{filtered.length} plugin{filtered.length === 1 ? "" : "s"} found</span>
      </div>
      {filtered.length ? (
        <div className="personalMarketplaceGrid">
          {filtered.map((plugin) => (
            <article className="personalMarketplaceCard" key={plugin.id}>
              {pluginRepositoryUrl(plugin) ? (
                <a className="personalPluginRepoLink" href={pluginRepositoryUrl(plugin)} target="_blank" rel="noreferrer" aria-label={`${pluginPackageName(plugin)} GitHub repository`}>
                  <Github size={15} />
                </a>
              ) : null}
              <div className="personalMarketplaceCardTop">
                <span className={`personalPluginIcon ${pluginCategory(plugin)}`}>{pluginIconText(plugin)}</span>
                <div>
                  <strong>{pluginPackageName(plugin)}</strong>
                  <small>{categoryLabel(pluginCategory(plugin))}</small>
                </div>
              </div>
              <p>{pluginDescription(plugin)}</p>
              <div className="personalMarketplaceCardBottom">
                <span>{pluginAuthor(plugin)}</span>
                <button
                  type="button"
                  onClick={() => onInstall(plugin)}
                  disabled={plugin.organizationPolicy?.userInstallAllowed === false || plugin.settings?.runtimeAvailable === false}
                  title={plugin.organizationPolicy?.userInstallAllowed === false
                    ? "Plugin installs are managed by your organization."
                    : plugin.settings?.runtimeError}
                >
                  {plugin.organizationPolicy?.userInstallAllowed === false
                    ? "Admin only"
                    : plugin.settings?.runtimeAvailable === false
                      ? "Unavailable"
                      : "Install"}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="personalMarketplaceEmpty">
          <Search size={38} />
          <h2>No plugins found</h2>
          <p>Try another search or category.</p>
        </div>
      )}
    </section>
  );
}

function PluginInstallDialog({
  plugin,
  draft,
  busy,
  message,
  onDraftChange,
  onCancel,
  onInstall
}: {
  plugin: PersonalPlugin;
  draft?: Record<string, unknown>;
  busy: string;
  message: string;
  onDraftChange: (plugin: PersonalPlugin, key: string, value: unknown) => void;
  onCancel: () => void;
  onInstall: (plugin: PersonalPlugin) => void;
}) {
  const config = effectivePluginConfig(plugin, draft);
  const settings = pluginSettingDefinitions(plugin, config);
  return (
    <div className="personalModalBackdrop" role="presentation">
      <section className="personalInstallDialog" role="dialog" aria-modal="true" aria-labelledby="install-plugin-title">
        <div className="personalPluginDetailHead">
          <div>
            <span className={`personalCategoryTag ${pluginCategory(plugin)}`}>{categoryIcon(pluginCategory(plugin))} {categoryLabel(pluginCategory(plugin))}</span>
            <h2 id="install-plugin-title">Install {pluginPackageName(plugin)}</h2>
            <p>{pluginDescription(plugin) || "Configure this plugin before adding it to the pipeline."}</p>
          </div>
          <button type="button" className="personalIconClose" onClick={onCancel} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="personalInstallBody">
          {settings.length ? (
            <div className="personalSettingsFields">
              {settings.map((field) => (
                <PluginSettingField
                  key={field.key}
                  plugin={plugin}
                  field={field}
                  value={config[field.key] ?? field.defaultValue}
                  locked={false}
                  onDraftChange={onDraftChange}
                />
              ))}
            </div>
          ) : (
            <p className="personalEmpty">No setup required. This plugin can be added with its default configuration.</p>
          )}
          {message ? <p className="personalSyncMessage">{message}</p> : null}
        </div>
        <div className="personalInstallActions">
          <button type="button" className="secondary" onClick={onCancel}>Cancel</button>
          <button type="button" onClick={() => onInstall(plugin)} disabled={busy === `install:${plugin.id}`}>{busy === `install:${plugin.id}` ? "Installing" : "Install plugin"}</button>
        </div>
      </section>
    </div>
  );
}

function PluginDetail({
  plugin,
  agents,
  outcomes,
  draft,
  busy,
  message,
  onDraftChange,
  onSave,
  onUpdate,
  onInstallChange
}: {
  plugin: PersonalPlugin;
  agents: PersonalAgent[];
  outcomes: PersonalOutcome[];
  draft?: Record<string, unknown>;
  busy: string;
  message: string;
  onDraftChange: (plugin: PersonalPlugin, key: string, value: unknown) => void;
  onSave: (plugin: PersonalPlugin, profiles?: PersonalPluginProfile[]) => void;
  onUpdate: (plugin: PersonalPlugin) => void;
  onInstallChange: (plugin: PersonalPlugin, install: boolean) => void;
}) {
  const installed = isPluginInstalled(plugin);
  const mandatory = Boolean(plugin.organizationPolicy?.mandatory);
  const installBlocked = plugin.organizationPolicy?.userInstallAllowed === false && !installed;
  const runtimeBlocked = plugin.settings?.runtimeAvailable === false;
  const locked = Boolean(plugin.organizationPolicy?.configLocked);
  const config = effectivePluginConfig(plugin, draft);
  const settings = pluginSettingDefinitions(plugin, config);
  const [activeTab, setActiveTab] = useState<"insights" | "outcomes" | "settings">("insights");
  const repositoryUrl = pluginRepositoryUrl(plugin);
  return (
    <section className="personalPanel personalPluginDetail">
      <div className="personalPluginDetailHead">
        <div>
          <span className={`personalCategoryTag ${pluginCategory(plugin)}`}>{categoryIcon(pluginCategory(plugin))} {categoryLabel(pluginCategory(plugin))}</span>
          <h2>{pluginPackageName(plugin)}</h2>
          <p>{pluginDescription(plugin) || "OpenLeash plugin"}</p>
        </div>
        <div className="personalPluginActions">
          {installed && plugin.settings?.updateAvailable ? (
            <button type="button" disabled={busy.endsWith(`:${plugin.id}`)} onClick={() => onUpdate(plugin)}>
              {busy === `update:${plugin.id}` ? "Updating" : "Update"}
            </button>
          ) : null}
          <button type="button" disabled={mandatory || installBlocked || runtimeBlocked || busy.endsWith(`:${plugin.id}`)} onClick={() => onInstallChange(plugin, !installed)}>
            {busy.endsWith(`:${plugin.id}`) ? "Working" : runtimeBlocked ? "Unavailable here" : mandatory ? "Required by org" : installBlocked ? "Blocked by org" : installed ? "Remove" : "Add"}
          </button>
        </div>
      </div>
      {message ? <p className="personalSyncMessage">{message}</p> : null}
      {plugin.settings?.runtimeError ? <p className="personalSyncMessage">{plugin.settings.runtimeError}</p> : null}
      <div className="personalPluginMeta">
        <span><User size={14} /> {plugin.author || plugin.marketplace?.developerName || plugin.publisher || "OpenLeash"}</span>
        {repositoryUrl ? <a href={repositoryUrl} target="_blank" rel="noreferrer"><Github size={14} /> GitHub repo</a> : null}
        <span>{pluginStatusLabel(plugin)}</span>
        {locked ? <span>settings locked by org</span> : null}
      </div>

      <div className="personalPluginTabs" role="tablist" aria-label={`${pluginPackageName(plugin)} sections`}>
        <button type="button" role="tab" aria-selected={activeTab === "insights"} className={activeTab === "insights" ? "active" : ""} onClick={() => setActiveTab("insights")}>
          Insights
        </button>
        <button type="button" role="tab" aria-selected={activeTab === "outcomes"} className={activeTab === "outcomes" ? "active" : ""} onClick={() => setActiveTab("outcomes")}>
          Outcomes
          <span>{outcomes.length}</span>
        </button>
        <button type="button" role="tab" aria-selected={activeTab === "settings"} className={activeTab === "settings" ? "active" : ""} onClick={() => setActiveTab("settings")}>
          Settings
        </button>
      </div>

      <div className="personalPluginTabPanel">
        {activeTab === "insights" ? (
          <div className="personalPluginInsights">
            <div className="personalSectionHead">
              <div>
                <strong>Insights</strong>
                <p>Signals and trends reported by this plugin for this account.</p>
              </div>
              <span>{outcomes.length}</span>
            </div>
            {outcomes.length === 0 ? (
              <p className="personalEmpty">No insights reported yet.</p>
            ) : (
              <div className="personalInsightSummary">
                <article>
                  <strong>{outcomes.length}</strong>
                  <span>Total outcomes</span>
                </article>
                <article>
                  <strong>{outcomes.filter((outcome) => String(outcome.decision || outcome.status).toLowerCase().includes("block")).length}</strong>
                  <span>Blocked</span>
                </article>
                <article>
                  <strong>{outcomes.filter((outcome) => String(outcome.status).toLowerCase().includes("review")).length}</strong>
                  <span>Needs review</span>
                </article>
              </div>
            )}
          </div>
        ) : null}

        {activeTab === "outcomes" ? (
          <div className="personalPluginInsights">
            <div className="personalSectionHead">
              <div>
                <strong>Outcomes</strong>
                <p>Events this plugin reported for this account.</p>
              </div>
              <span>{outcomes.length}</span>
            </div>
            <div className="personalOutcomeList">
              {outcomes.map((outcome) => (
                <article key={outcome.id}>
                  <strong>{outcome.title}</strong>
                  <p>{outcome.summary || outcome.domain}</p>
                  <span>{outcome.decision || outcome.status}</span>
                </article>
              ))}
              {outcomes.length === 0 ? <p className="personalEmpty">No outcomes reported yet.</p> : null}
            </div>
          </div>
        ) : null}

        {activeTab === "settings" ? (
          <div className="personalPluginSettings">
          <div className="personalSectionHead">
            <div>
              <strong>Settings</strong>
              <p>{locked ? "Managed by your organization." : installed ? "Settings sync to every signed-in OpenLeash client." : "Install this plugin before editing settings."}</p>
            </div>
            <span>{locked ? "locked" : "editable"}</span>
          </div>
          <div className="personalSettingsFields">
            {settings.length ? settings.map((field) => (
              <PluginSettingField
                key={field.key}
                plugin={plugin}
                field={field}
                value={config[field.key] ?? field.defaultValue}
                locked={locked || !installed}
                onDraftChange={onDraftChange}
              />
            )) : <p className="personalEmpty">No configurable settings exposed.</p>}
          </div>
          <PersonalPluginProfiles
            plugin={plugin}
            agents={agents}
            locked={locked || !installed}
            busy={busy === `settings:${plugin.id}`}
            onSave={(profiles) => onSave(plugin, profiles)}
          />
          <div className="personalPluginActions">
            <span />
            <button type="button" disabled={locked || !installed || busy === `settings:${plugin.id}`} onClick={() => onSave(plugin)}>
              {busy === `settings:${plugin.id}` ? "Saving" : "Save settings"}
            </button>
          </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function PersonalPluginProfiles({
  plugin,
  agents,
  locked,
  busy,
  onSave
}: {
  plugin: PersonalPlugin;
  agents: PersonalAgent[];
  locked: boolean;
  busy: boolean;
  onSave: (profiles: PersonalPluginProfile[]) => void;
}) {
  type Draft = PersonalPluginProfile & { configText: string };
  const toDrafts = (profiles: PersonalPluginProfile[]): Draft[] => profiles.map((profile) => ({
    ...profile,
    configText: JSON.stringify(profile.config ?? {}, null, 2)
  }));
  const [profiles, setProfiles] = useState<Draft[]>(() => toDrafts(plugin.settings?.profiles ?? []));
  const [error, setError] = useState("");
  useEffect(() => setProfiles(toDrafts(plugin.settings?.profiles ?? [])), [plugin.id, plugin.settings?.profiles]);
  const update = (id: string, patch: Partial<Draft>) => setProfiles((current) => current.map((profile) => profile.id === id ? { ...profile, ...patch } : profile));
  function save() {
    try {
      const normalized = profiles.map(({ configText, ...profile }, index) => {
        const config = JSON.parse(configText || "{}");
        if (!config || typeof config !== "object" || Array.isArray(config)) throw new Error(`Profile ${index + 1} settings must be an object.`);
        return { ...profile, config };
      });
      setError("");
      onSave(normalized);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Invalid agent profile settings.");
    }
  }
  return (
    <div className="personalPluginProfiles">
      <div className="personalSectionHead">
        <div>
          <strong>Agent-specific settings</strong>
          <p>Override this plugin for all your agents of a type or select an exact enrolled agent.</p>
        </div>
        <button
          type="button"
          disabled={locked || busy}
          onClick={() => setProfiles((current) => [...current, {
            id: `profile-${Date.now()}`,
            name: "Agent override",
            agentKinds: [],
            config: {},
            configText: "{}",
            priority: 0
          }])}
        >Add profile</button>
      </div>
      {(plugin.settings?.inheritedProfiles?.length ?? 0) > 0 ? (
        <p className="personalEmpty">Your organization applies {plugin.settings!.inheritedProfiles!.length} profile{plugin.settings!.inheritedProfiles!.length === 1 ? "" : "s"} first.</p>
      ) : null}
      {profiles.map((profile) => (
        <article className="personalPluginProfile" key={profile.id}>
          <label>Profile name<input disabled={locked || busy} value={profile.name} onChange={(event) => update(profile.id, { name: event.target.value })} /></label>
          <label>Agent types
            <select multiple size={4} disabled={locked || busy} value={profile.agentKinds} onChange={(event) => update(profile.id, { agentKinds: [...event.currentTarget.selectedOptions].map((option) => option.value) })}>
              {[...new Set([...personalPluginAgentKinds, ...agents.map((agent) => agent.kind).filter((kind): kind is string => Boolean(kind))])].sort().map((kind) => <option key={kind} value={kind}>{kind}</option>)}
            </select>
            <small>No selection means all agent types.</small>
          </label>
          <label>Exact agents
            <select multiple size={4} disabled={locked || busy} value={profile.agentIds ?? []} onChange={(event) => update(profile.id, { agentIds: [...event.currentTarget.selectedOptions].map((option) => option.value) })}>
              {agents.filter((agent) => agent.id).map((agent) => <option key={agent.id} value={agent.id}>{[agent.displayName || agent.display_name || agent.kind, agent.hostname].filter(Boolean).join(" · ")}</option>)}
            </select>
            <small>No selection means every matching agent.</small>
          </label>
          <label>Enabled override
            <select disabled={locked || busy || plugin.organizationPolicy?.mandatory} value={plugin.organizationPolicy?.mandatory ? "inherit" : typeof profile.enabled === "boolean" ? String(profile.enabled) : "inherit"} onChange={(event) => update(profile.id, event.target.value === "inherit" ? { enabled: undefined } : { enabled: event.target.value === "true" })}>
              <option value="inherit">{plugin.organizationPolicy?.mandatory ? "Required by organization" : "Use base setting"}</option>
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </label>
          <label>Priority<input type="number" disabled={locked || busy} value={profile.priority ?? 0} onChange={(event) => update(profile.id, { priority: Number(event.target.value || 0) })} /></label>
          <label>Setting overrides<textarea rows={5} disabled={locked || busy} value={profile.configText} onChange={(event) => update(profile.id, { configText: event.target.value })} /></label>
          <button type="button" disabled={locked || busy} onClick={() => setProfiles((current) => current.filter((item) => item.id !== profile.id))}>Remove</button>
        </article>
      ))}
      {profiles.length === 0 ? <p className="personalEmpty">No personal agent-specific overrides.</p> : null}
      {error ? <p className="personalSyncMessage">{error}</p> : null}
      <button type="button" disabled={locked || busy} onClick={save}>{busy ? "Saving" : "Save agent profiles"}</button>
    </div>
  );
}

function PluginSettingField({
  plugin,
  field,
  value,
  locked,
  onDraftChange
}: {
  plugin: PersonalPlugin;
  field: { key: string; schema: Record<string, unknown>; defaultValue: unknown };
  value: unknown;
  locked: boolean;
  onDraftChange: (plugin: PersonalPlugin, key: string, value: unknown) => void;
}) {
  const schema = field.schema || {};
  const label = settingLabel(field.key);
  if (Array.isArray(schema.enum)) {
    return (
      <div className="personalSettingField">
        <strong>{label}</strong>
        <div className="personalSegmented">
          {schema.enum.map((option) => (
            <label key={String(option)}>
              <input type="radio" disabled={locked} checked={String(value) === String(option)} onChange={() => onDraftChange(plugin, field.key, option)} />
              {settingLabel(String(option))}
            </label>
          ))}
        </div>
      </div>
    );
  }
  if (schema.type === "boolean" || typeof value === "boolean") {
    return (
      <label className="personalSettingToggle">
        <span><strong>{label}</strong></span>
        <input type="checkbox" disabled={locked} checked={Boolean(value)} onChange={(event) => onDraftChange(plugin, field.key, event.currentTarget.checked)} />
      </label>
    );
  }
  if (schema.type === "number" || schema.type === "integer" || typeof value === "number") {
    return (
      <div className="personalSettingField">
        <strong>{label}</strong>
        <input type="number" disabled={locked} value={Number(value || 0)} onChange={(event) => onDraftChange(plugin, field.key, Number(event.currentTarget.value || 0))} />
      </div>
    );
  }
  if (Array.isArray(value)) {
    return (
      <div className="personalSettingField">
        <strong>{label}</strong>
        <textarea disabled={locked} rows={Math.max(3, value.length)} value={value.map(String).join("\n")} onChange={(event) => onDraftChange(plugin, field.key, event.currentTarget.value.split(/\r?\n/g).map((line) => line.trim()).filter(Boolean))} />
      </div>
    );
  }
  return (
    <div className="personalSettingField">
      <strong>{label}</strong>
      <input disabled={locked} value={String(value ?? "")} onChange={(event) => onDraftChange(plugin, field.key, event.currentTarget.value)} />
    </div>
  );
}

function HistoryPanel({ outcomes }: { outcomes: PersonalOutcome[] }) {
  return (
    <section className="personalPanel">
      <div className="personalPanelHead"><h2>History</h2></div>
      <div className="personalOutcomeList">
        {outcomes.map((outcome) => (
          <article key={outcome.id}>
            <strong>{outcome.title}</strong>
            <p>{outcome.summary || outcome.domain} · {outcome.agent?.name || outcome.agent?.kind || "agent"}</p>
            <span>{outcome.decision || outcome.status}</span>
          </article>
        ))}
        {outcomes.length === 0 ? <p className="personalEmpty">No plugin-powered outcomes yet.</p> : null}
      </div>
    </section>
  );
}

function SimplePanel({ title, text }: { title: string; text: string }) {
  return (
    <section className="personalPanel">
      <div className="personalPanelHead"><h2>{title}</h2></div>
      <p className="personalEmpty">{text}</p>
    </section>
  );
}

function dashboardToken() {
  const token = localStorage.getItem("openleash_dashboard_token") || document.cookie.split(";").map((item) => item.trim()).find((item) => item.startsWith("openleash_dashboard_token="))?.split("=").slice(1).join("=") || "";
  try {
    return decodeURIComponent(token);
  } catch {
    return token;
  }
}

function objectOrNull(value: unknown): PersonalViewModel | null {
  return value && typeof value === "object" ? value as PersonalViewModel : null;
}

function flattenViewModelPlugins(viewModel?: PersonalViewModel | null) {
  return (viewModel?.pluginCategories || []).flatMap((category) => category.plugins || []);
}

function firstNonEmptyPlugins(...sources: unknown[]) {
  for (const source of sources) {
    if (Array.isArray(source) && source.length > 0) return source as PersonalPlugin[];
  }
  return [] as PersonalPlugin[];
}

function allPersonalPlugins(plugins: PersonalPlugin[], viewModel?: PersonalViewModel | null) {
  if (plugins.length) return plugins;
  return flattenViewModelPlugins(viewModel);
}

function personalPluginCategories(viewModel: PersonalViewModel | null, plugins: PersonalPlugin[]) {
  const installedPlugins = allPersonalPlugins(plugins, viewModel).filter(isPluginInstalled);
  const base = [
    { id: "observability", label: "Visibility", plugins: [] as PersonalPlugin[] },
    { id: "cost", label: "Cost", plugins: [] as PersonalPlugin[] },
    { id: "security", label: "Security", plugins: [] as PersonalPlugin[] },
    { id: "utility", label: "Misc", plugins: [] as PersonalPlugin[] }
  ];
  for (const plugin of installedPlugins) {
    const category = base.find((item) => item.id === pluginCategory(plugin)) || base[3];
    category.plugins.push(plugin);
  }
  return base;
}

function isPluginInstalled(plugin: PersonalPlugin) {
  return plugin.organizationPolicy?.mandatory === true ||
    plugin.installed === true ||
    plugin.settings?.enabled === true ||
    Boolean(plugin.settings?.installedVersion) ||
    [...(plugin.settings?.inheritedProfiles ?? []), ...(plugin.settings?.profiles ?? [])]
      .some((profile) => profile.enabled === true);
}

function pluginStatusLabel(plugin: PersonalPlugin) {
  if (plugin.settings?.runtimeAvailable === false) return "unavailable";
  if (plugin.organizationPolicy?.mandatory) return "required";
  return isPluginInstalled(plugin) ? "installed" : "available";
}

function pluginPackageName(plugin: PersonalPlugin) {
  return plugin.packageId || plugin.slug || plugin.marketplace?.slug || plugin.name || plugin.displayName || plugin.id.split(".").pop() || plugin.id;
}

function pluginDescription(plugin: PersonalPlugin) {
  return plugin.marketplace?.shortDescription || plugin.description || "";
}

function pluginAuthor(plugin: PersonalPlugin) {
  return plugin.author || plugin.marketplace?.developerName || (plugin.publisher === "openleash" ? "OpenLeash" : plugin.publisher) || "OpenLeash";
}

function pluginRepositoryUrl(plugin: PersonalPlugin) {
  const firstPartyUrl = firstPartyPluginRepositoryUrl(plugin.id, plugin.slug || plugin.marketplace?.slug, plugin.publisher);
  return firstPartyUrl || cleanPluginRepositoryUrl(plugin.repositoryUrl || plugin.marketplace?.repositoryUrl) || "";
}

const firstPartyPluginRepositories: Record<string, string> = {
  "blast-radius": "https://github.com/open-leash/plugin-blast-radius",
  "data-leakage-prevention": "https://github.com/open-leash/plugin-data-leakage-prevention",
  "mcp-scanner": "https://github.com/open-leash/plugin-mcp-scanner",
  "rules-enforcer": "https://github.com/open-leash/plugin-rules-enforcer",
  "sensitive-access": "https://github.com/open-leash/plugin-sensitive-access",
  "siem-exporter": "https://github.com/open-leash/plugin-siem-exporter",
  "skill-scanner": "https://github.com/open-leash/plugin-skill-scanner",
  "token-saver": "https://github.com/open-leash/plugin-token-saver"
};

function firstPartyPluginRepositoryUrl(id: string, slug?: string, publisher?: string) {
  const normalizedSlug = slug || id.replace(/^openleash\./, "").replace("prompt-compression", "token-saver").replace("dlp", "data-leakage-prevention");
  const isFirstParty = publisher === "openleash" || id.startsWith("openleash.");
  return isFirstParty ? firstPartyPluginRepositories[normalizedSlug] : undefined;
}

function cleanPluginRepositoryUrl(repositoryUrl?: string) {
  if (repositoryUrl === "https://github.com/open-leash/open-leash") return undefined;
  if (repositoryUrl === "https://github.com/open-leash/plugins") return undefined;
  return repositoryUrl;
}

function effectivePluginConfig(plugin: PersonalPlugin, draft?: Record<string, unknown>) {
  return {
    ...(plugin.defaultConfig || {}),
    ...(plugin.settings?.config || {}),
    ...(draft || {})
  };
}

function pluginSettingDefinitions(plugin: PersonalPlugin, config: Record<string, unknown>) {
  const properties = plugin.configSchema?.properties && typeof plugin.configSchema.properties === "object" ? plugin.configSchema.properties : {};
  const keys = new Set([...Object.keys(plugin.defaultConfig || {}), ...Object.keys(config || {}), ...Object.keys(properties)]);
  keys.delete("enabled");
  return [...keys].sort().map((key) => ({
    key,
    schema: properties[key] && typeof properties[key] === "object" ? properties[key] : {},
    defaultValue: plugin.defaultConfig?.[key]
  }));
}

function settingLabel(value: string) {
  return value
    .replace(/[_-]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function pluginIconText(plugin: PersonalPlugin) {
  return (plugin.iconText || plugin.marketplace?.iconText || pluginPackageName(plugin).split(/[-_\s]/).map((part) => part[0]).join("").slice(0, 2)).toUpperCase();
}

function pluginCategory(plugin: PersonalPlugin) {
  const text = String(plugin.category || plugin.marketplace?.category || `${plugin.id} ${pluginPackageName(plugin)} ${pluginDescription(plugin)} ${(plugin.marketplace?.tags || []).join(" ")} ${(plugin.tags || []).join(" ")}`).toLowerCase();
  if (/siem-exporter/.test(text)) return "utility";
  if (/mcp-scanner|skill-scanner/.test(text)) return "security";
  if (/security|policy|guard|skill|prompt-injection|risk|approval|dlp|leak|sensitive|secret|credential|rule/.test(text)) return "security";
  if (/visibility|observability|observe|log|mcp|siem|audit|telemetry|monitor/.test(text)) return "observability";
  if (/cost|token|compression|usage|budget|spend/.test(text)) return "cost";
  return "utility";
}

function categoryLabel(category: string) {
  if (category === "cost") return "Cost";
  if (category === "security") return "Security";
  if (category === "observability") return "Visibility";
  return "Misc";
}

function categoryIcon(category: string) {
  if (category === "security") return <Shield size={15} />;
  if (category === "observability") return <Eye size={15} />;
  if (category === "utility") return <Zap size={15} />;
  return <TrendingDown size={15} />;
}

function agentInventory(agents: PersonalAgent[]) {
  const byKind = new Map<string, PersonalAgent>();
  for (const agent of agents || []) {
    const kind = normalizeAgentKind(agent.kind || agent.display_name || agent.displayName || "");
    if (kind) byKind.set(kind, agent);
  }
  const catalog = [
    { kind: "claude-code", displayName: "Claude Code", icon: "/agents/claude.png" },
    { kind: "github-copilot", displayName: "GitHub Copilot", icon: "/agents/githubcopilot.png" },
    { kind: "gemini", displayName: "Google Gemini CLI", icon: "/agents/googlegemini.png" },
    { kind: "opencode", displayName: "OpenCode", icon: "/agents/opencode.png" },
    { kind: "codex", displayName: "OpenAI Codex", icon: "/agents/codex.png" },
    { kind: "cline", displayName: "Cline", icon: "/agents/cline.png" },
    { kind: "cursor", displayName: "Cursor", icon: "/agents/cursor.png" },
    { kind: "windsurf", displayName: "Windsurf", icon: "/agents/windsurf.png" }
  ];
  return catalog.map((definition) => {
    const agent = byKind.get(definition.kind);
    const installed = agent ? agent.installed !== false : false;
    const protectedByOpenLeash = agent?.protected === true;
    const desiredMonitored = agent?.desired_monitored ?? agent?.desiredMonitored ?? protectedByOpenLeash;
    return {
      ...definition,
      raw: agent,
      installed,
      protected: protectedByOpenLeash,
      desiredMonitored: Boolean(desiredMonitored),
      detail: installed ? protectedByOpenLeash ? "Active" : "Unmonitored" : "Not installed"
    };
  });
}

function normalizeAgentKind(value: string) {
  const text = String(value || "").toLowerCase();
  if (text.includes("claude")) return "claude-code";
  if (text.includes("copilot")) return "github-copilot";
  if (text.includes("gemini")) return "gemini";
  if (text.includes("opencode")) return "opencode";
  if (text.includes("codex") || text.includes("openai")) return "codex";
  if (text.includes("cline")) return "cline";
  if (text.includes("cursor")) return "cursor";
  if (text.includes("windsurf")) return "windsurf";
  return text.replace(/_/g, "-");
}

function agentDisplayName(kind: string) {
  if (kind === "claude-code") return "Claude Code";
  if (kind === "github-copilot") return "GitHub Copilot";
  if (kind === "gemini") return "Google Gemini CLI";
  if (kind === "opencode") return "OpenCode";
  if (kind === "codex") return "OpenAI Codex";
  if (kind === "cline") return "Cline";
  if (kind === "cursor") return "Cursor";
  if (kind === "windsurf") return "Windsurf";
  return kind;
}

function agentInstallBadges(agent: ReturnType<typeof agentInventory>[number]) {
  const raw = agent.raw;
  const platformText = `${raw?.platform || ""} ${raw?.hostname || ""} ${raw?.project_path || ""}`.toLowerCase();
  const badges: Array<{ kind: string; title: string; icon: React.ReactNode }> = [];
  if (/\b(darwin|mac|macos|osx)\b/.test(platformText)) badges.push({ kind: "mac", title: "Installed on Mac", icon: <Apple size={13} /> });
  else if (/\b(win32|windows|win)\b/.test(platformText)) badges.push({ kind: "windows", title: "Installed on Windows", icon: <Monitor size={13} /> });
  else if (/\b(linux|ubuntu|debian|fedora)\b/.test(platformText)) badges.push({ kind: "linux", title: "Installed on Linux", icon: <Monitor size={13} /> });
  if (/\b(cloud|codespaces|devcontainer|remote|hosted)\b/.test(platformText)) badges.push({ kind: "cloud", title: "Seen in cloud or remote runtime", icon: <Cloud size={13} /> });
  if (badges.length === 0) badges.push({ kind: "desktop", title: "Installed on desktop", icon: <Monitor size={13} /> });
  return badges;
}

function desktopPlatformLabel(value?: string) {
  const text = String(value || "").toLowerCase();
  if (text === "darwin" || text.includes("mac")) return "Mac";
  if (text.startsWith("win")) return "Windows";
  if (text.includes("linux")) return "Linux";
  return value || "Desktop";
}

function desktopPlatformIcon(value?: string) {
  const text = String(value || "").toLowerCase();
  if (text === "darwin" || text.includes("mac")) return <Apple size={16} />;
  return <Monitor size={16} />;
}

function relativeTime(value: string) {
  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) return "recently";
  const seconds = Math.max(0, Math.round((Date.now() - time) / 1000));
  if (seconds < 45) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
