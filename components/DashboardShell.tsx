import Link from "next/link";
import { Suspense } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
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
  Package,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users
} from "lucide-react";
import { PolicyManager } from "./PolicyManager";
import { DeploymentTokenIssuer } from "./DeploymentTokenIssuer";
import { IdentityManager, type OnboardingData } from "./EnterpriseOnboarding";
import { OrganizationSetupPanel } from "./OrganizationSetupPanel";
import { LiveDate } from "./LiveDate";
import { DashboardGreeting, DashboardSignOutButton, DashboardSignOutIconButton, DashboardUserChip } from "./DashboardAuth";
import { DashboardSettingsPane, SettingsTree, TokensSettingsPanel } from "./DashboardSettings";
import { AgentInventory, type AgentInventoryCard } from "./AgentInventory";
import { UserRoster, type UserRosterItem } from "./UserRoster";

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
    idp_provider?: string | null;
    agents?: string[];
    hostnames?: string[];
    status?: string;
  }>;
  recent: Array<{
    id: string;
    decision: "allow" | "deny" | "ask";
    resolution?: "allow" | "deny" | null;
    summary: string;
    question?: string;
    prompt?: string | null;
    created_at: string;
    event_name: string;
    tool_name?: string;
    project_path?: string;
    agent_name: string;
    agent_kind?: string;
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

export type CoreDashboardTab = "overview" | "security" | "usage" | "setup" | "settings" | "triggers" | "users" | "identity" | "agents" | "external-agents" | "mcps" | "skills" | "policies" | "tokens" | "deployment";
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
    content?: string | null;
    content_preview?: string | null;
    purpose_summary?: string | null;
    content_updated_at?: string | null;
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
    content_preview?: string | null;
    purpose_summary?: string | null;
    created_at: string;
    user_name?: string | null;
  }>;
};

export type SecurityData = {
  range?: { days: number; since: string };
  summary?: {
    total_signals?: string | number;
    findings?: string | number;
    high_severity?: string | number;
    contained?: string | number;
    affected_users?: string | number;
  };
  signals: Array<{
    id: string;
    plugin_id: string;
    kind: string;
    severity: string;
    title: string;
    summary?: string | null;
    decision?: string | null;
    status?: string | null;
    target?: { type?: string; name?: string; id?: string };
    details?: Record<string, unknown>;
    correlation_keys?: string[];
    occurred_at?: string;
    created_at: string;
    user_id?: string | null;
    user_email?: string | null;
    user_name?: string | null;
    hostname?: string | null;
    agent_kind?: string | null;
    agent_name?: string | null;
    event_name?: string | null;
    tool_name?: string | null;
    project_path?: string | null;
    evaluation_id?: string | null;
  }>;
  byPlugin: Array<{ plugin_id: string; kind: string; severity: string; count: string | number }>;
  byUser: Array<{ user_id?: string | null; email?: string | null; name?: string | null; signal_count: string | number; high_count: string | number; last_signal_at?: string | null }>;
  usage: {
    byPlugin: Array<{ plugin_id: string; kind: string; provider?: string | null; model?: string | null; records: string | number; input_tokens?: string | number; output_tokens?: string | number; saved_tokens?: string | number; estimated_cost_cents?: string | number }>;
    byUser: Array<{ user_id?: string | null; email?: string | null; name?: string | null; records: string | number; input_tokens?: string | number; output_tokens?: string | number; saved_tokens?: string | number; estimated_cost_cents?: string | number; last_usage_at?: string | null }>;
  };
  outcomes?: Array<{
    id: string;
    domain: string;
    title: string;
    summary?: string | null;
    severity: string;
    status: string;
    decision?: string | null;
    occurredAt: string;
    createdAt: string;
    source?: { pluginId?: string; label?: string; kind?: string };
    subject?: { type?: string; name?: string; id?: string };
    actor?: { userId?: string | null; name?: string | null; email?: string | null };
    agent?: { kind?: string | null; name?: string | null; hostname?: string | null };
    context?: { conversationEventId?: string | null; evaluationId?: string | null; eventName?: string | null; toolName?: string | null; projectPath?: string | null; correlationKeys?: string[] };
    evidence?: Array<{ label: string; value?: string; kind?: string; sensitive?: boolean }>;
    details?: Record<string, unknown>;
  }>;
  correlations: Array<{ correlation_key: string; signal_count: string | number; plugin_count: string | number; user_count: string | number; last_signal_at?: string | null; plugin_ids?: string[] }>;
};

export type LogsData = {
  logs: LogItem[];
  logDetail?: { log: LogItem & { resolution_guidance?: string | null; model?: string | null } } | null;
};

type LogItem = {
  id: string;
  session_id: string;
  event_name: string;
  project_path?: string | null;
  prompt?: string | null;
  tool_name?: string | null;
  payload?: unknown;
  occurred_at: string;
  created_at: string;
  evaluation_id?: string | null;
  decision?: "allow" | "deny" | "ask" | null;
  resolution?: string | null;
  summary?: string | null;
  question?: string | null;
  evaluated_at?: string | null;
  agent_name?: string | null;
  agent_kind?: string | null;
  agent_version?: string | null;
  hostname?: string | null;
  platform?: string | null;
  user_id?: string | null;
  user_name?: string | null;
  user_email?: string | null;
  policy_results?: Array<{
    policy_name: string;
    status: string;
    severity: string;
    explanation: string;
    question?: string | null;
    evidence?: string[] | string;
    created_at?: string;
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

export type ProviderUsageData = {
  summary?: {
    total_cost_cents?: string | number;
    request_count?: string | number;
    token_count?: string | number;
    user_count?: string | number;
    provider_count?: string | number;
  };
  byProvider?: ProviderUsageAggregate[];
  byUser?: Array<{
    email: string;
    name?: string | null;
    cost_cents?: string | number;
    request_count?: string | number;
    token_count?: string | number;
    last_seen_at?: string | null;
  }>;
  byModel?: ProviderUsageAggregate[];
  connections?: Array<{
    id: string;
    provider: string;
    label?: string | null;
    enabled?: boolean;
    status?: string | null;
    last_sync_at?: string | null;
    last_error?: string | null;
    last_validated_at?: string | null;
    total_cost_cents?: string | number;
    event_count?: string | number;
  }>;
  budgets?: Array<{
    provider?: string | null;
    monthly_budget_cents?: string | number;
    enabled?: boolean;
    updated_at?: string | null;
  }>;
};

type ProviderUsageAggregate = {
  provider: string;
  model?: string | null;
  cost_cents?: string | number;
  request_count?: string | number;
  token_count?: string | number;
  user_count?: string | number;
};

const agentPalette = [
  { bg: "#f08a55", fg: "white", letter: "C" },
  { bg: "#0f1115", fg: "white", letter: "C" },
  { bg: "#4f86f7", fg: "white", letter: "G" },
  { bg: "#10a37f", fg: "white", letter: "O" },
  { bg: "#22a3b8", fg: "white", letter: "W" },
  { bg: "#7a5af8", fg: "white", letter: "A" }
];

const supportedAgentProducts = [
  { key: "claude-code", displayName: "Claude Code", kind: "claude-code" },
  { key: "openai-codex", displayName: "OpenAI Codex", kind: "codex" },
  { key: "cline", displayName: "Cline", kind: "cline" },
  { key: "opencode", displayName: "OpenCode", kind: "opencode" },
  { key: "cursor", displayName: "Cursor", kind: "cursor" },
  { key: "gemini", displayName: "Google Gemini CLI", kind: "gemini" },
  { key: "antigravity", displayName: "Antigravity", kind: "antigravity" }
];

const hiddenOverviewAgentKeys = new Set(["openclaw", "nanoclaw"]);

const avatarPalette = [
  { bg: "#fbe6c1", fg: "#8a5a1d" },
  { bg: "#dbe5fb", fg: "#2a44a6" },
  { bg: "#f6d6d2", fg: "#a23a32" },
  { bg: "#d6efde", fg: "#117552" },
  { bg: "#efdcfb", fg: "#5a2a9c" },
  { bg: "#d2eef6", fg: "#1c6a85" }
];

const emptyOverview: Overview = {
  metrics: {
    computers: "0",
    agents: "0",
    events: "0",
    denied: "0",
    questions: "0"
  },
  agents: [],
  users: [],
  recent: [],
  policies: [],
  usage: { sessions: [] }
};

function shouldUseDemoOverview(overview: Overview, mode: DashboardMode) {
  if (mode === "personal") return false;
  if (process.env.NEXT_PUBLIC_OPENLEASH_DEMO_DATA === "0") return false;
  if (process.env.NEXT_PUBLIC_OPENLEASH_DEMO_DATA === "1") return true;
  const visibleAgents = aggregateAgents(overview.agents);
  const userCount = overview.users?.length || usersFromAgents(overview.agents).length;
  return visibleAgents.length > 0 && visibleAgents.length <= 4 && userCount <= 1 && overview.recent.length === 0;
}

function demoOverview(): Overview {
  const now = Date.now();
  const iso = (minutesAgo: number) => new Date(now - minutesAgo * 60_000).toISOString();
  const team = [
    { name: "Avery Chen", email: "avery.chen@northstar.dev", host: "avery-mbp-14", agents: ["OpenCode", "OpenAI Codex", "Claude Code"] },
    { name: "Maya Patel", email: "maya.patel@northstar.dev", host: "maya-framework-16", agents: ["Gemini", "Cursor", "Claude Code"] },
    { name: "Jon Bell", email: "jon.bell@northstar.dev", host: "jon-thinkpad-x1", agents: ["OpenCode", "Gemini"] },
    { name: "Priya Rao", email: "priya.rao@northstar.dev", host: "priya-studio", agents: ["OpenAI Codex", "Cursor"] }
  ];
  const agentInfo: Record<string, { kind: string; display: string; version: string }> = {
    "OpenCode": { kind: "opencode", display: "OpenCode", version: "0.9.6" },
    "Gemini": { kind: "gemini", display: "Gemini", version: "1.1.0" },
    "OpenAI Codex": { kind: "codex", display: "OpenAI Codex", version: "0.18.2" },
    "Claude Code": { kind: "claude-code", display: "Claude Code", version: "1.0.34" },
    "Cursor": { kind: "cursor", display: "Cursor", version: "0.49.1" }
  };
  const agents: Overview["agents"] = team.flatMap((member, memberIndex) =>
    member.agents.map((agentName, agentIndex) => {
      const info = agentInfo[agentName];
      const sessionTime = iso(14 + memberIndex * 19 + agentIndex * 8);
      return {
        id: `demo-agent-${memberIndex}-${agentIndex}`,
        kind: info.kind,
        display_name: info.display,
        version: info.version,
        hostname: member.host,
        user_name: member.name,
        last_seen_at: sessionTime,
        sessions: [
          {
            id: `demo-session-${memberIndex}-${agentIndex}`,
            title: `${projectName(memberIndex, agentIndex)} maintenance`,
            summary: "Reviewed code changes, checked policy impact, and completed an approval-gated action.",
            project_path: `/workspaces/${projectName(memberIndex, agentIndex)}`,
            last_activity_at: sessionTime,
            duration_seconds: 1240 + memberIndex * 280 + agentIndex * 95,
            event_count: 8 + memberIndex + agentIndex
          }
        ]
      };
    })
  );
  const recent: Overview["recent"] = [
    {
      id: "demo-event-1",
      decision: "ask",
      resolution: "allow",
      summary: "Production deploy required approval",
      question: "Approve deployment to payments-api production?",
      created_at: iso(18),
      event_name: "PreToolUse",
      tool_name: "bash",
      project_path: "/workspaces/payments-api",
      agent_name: "Claude Code",
      agent_kind: "claude-code",
      hostname: "avery-mbp-14",
      user_name: "Avery Chen",
      triggered_policies: [{
        policy_name: "Production deploys",
        status: "needs_question",
        severity: "high",
        explanation: "Deployment command targeted the production namespace.",
        evidence: ["kubectl apply -n production"]
      }]
    },
    {
      id: "demo-event-2",
      decision: "deny",
      resolution: "deny",
      summary: "Secret-like token was blocked before leaving the workstation",
      created_at: iso(42),
      event_name: "UserPromptSubmit",
      tool_name: "prompt",
      project_path: "/workspaces/customer-portal",
      agent_name: "OpenAI Codex",
      agent_kind: "codex",
      hostname: "priya-studio",
      user_name: "Priya Rao",
      triggered_policies: [{
        policy_name: "Secrets in prompts",
        status: "failed",
        severity: "critical",
        explanation: "Prompt included a value matching an API key pattern.",
        evidence: ["masked credential-like string"]
      }]
    },
    {
      id: "demo-event-3",
      decision: "allow",
      resolution: "allow",
      summary: "Low-risk dependency update was logged",
      created_at: iso(73),
      event_name: "PostToolUse",
      tool_name: "npm",
      project_path: "/workspaces/web-console",
      agent_name: "Gemini",
      agent_kind: "gemini",
      hostname: "maya-framework-16",
      user_name: "Maya Patel",
      triggered_policies: []
    }
  ];
  return {
    metrics: {
      computers: "4",
      agents: "5",
      events: "128",
      denied: "7",
      questions: "18",
      session_time: {
        today_seconds: 18420,
        today_sessions: 16,
        last24h_seconds: 29640,
        last24h_sessions: 24,
        week_seconds: 148800,
        week_sessions: 93,
        month_seconds: 421200,
        month_sessions: 276
      }
    },
    agents,
    recent,
    policies: [
      {
        id: "demo-policy-prod",
        name: "Production deploys",
        category: "Approvals",
        description: "Hold deploys, database migrations, and infrastructure changes targeting production.",
        severity: "high",
        natural_language_rule: "Ask for approval before any command changes production infrastructure or services.",
        enabled: true,
        trigger_count: 18,
        question_count: 18,
        last_triggered_at: iso(18),
        last_agent_name: "Claude Code",
        last_project_path: "/workspaces/payments-api"
      },
      {
        id: "demo-policy-secrets",
        name: "Secrets in prompts",
        category: "DLP",
        description: "Block API keys, tokens, and credentials before they reach an AI assistant.",
        severity: "critical",
        natural_language_rule: "Deny prompts or tool output containing credential-like strings.",
        enabled: true,
        trigger_count: 11,
        deny_count: 7,
        last_triggered_at: iso(42),
        last_agent_name: "OpenAI Codex",
        last_project_path: "/workspaces/customer-portal"
      }
    ],
    users: team.map((member, index) => ({
      id: `demo-user-${index}`,
      email: member.email,
      display_name: member.name,
      role: index === 0 ? "admin" : "engineer",
      created_at: iso(60 * 24 * (index + 3)),
      endpoint_count: 1,
      agent_count: member.agents.length,
      last_seen_at: iso(12 + index * 17),
      idp_provider: "google_workspace",
      agents: member.agents,
      hostnames: [member.host],
      status: "active"
    })),
    usage: {
      sessions: agents.flatMap((agent) =>
        (agent.sessions ?? []).map((session) => ({
          ...session,
          user_name: agent.user_name,
          user_email: team.find((member) => member.name === agent.user_name)?.email,
          hostname: agent.hostname,
          agent_kind: agent.kind,
          agent_name: agent.display_name,
          started_at: iso(120),
          approval_count: agent.display_name === "Claude Code" ? 2 : 0,
          denied_count: agent.display_name === "OpenAI Codex" ? 1 : 0
        }))
      )
    }
  };
}

function demoSecurityData(): SecurityData {
  const now = Date.now();
  const iso = (minutesAgo: number) => new Date(now - minutesAgo * 60_000).toISOString();
  return {
    range: { days: 30, since: iso(60 * 24 * 30) },
    summary: {
      total_signals: 24,
      findings: 9,
      high_severity: 3,
      contained: 7,
      affected_users: 4
    },
    signals: [
      {
        id: "demo-security-1",
        plugin_id: "data-leakage-prevention",
        kind: "secret_exposure",
        severity: "critical",
        title: "Secret-like token blocked before model call",
        summary: "DLP masked a credential-like value in a Codex prompt from customer-portal.",
        decision: "deny",
        status: "contained",
        created_at: iso(18),
        user_email: "priya.rao@northstar.dev",
        user_name: "Priya Rao",
        hostname: "priya-studio",
        agent_kind: "codex",
        agent_name: "Codex",
        event_name: "UserPromptSubmit",
        project_path: "/workspaces/customer-portal"
      },
      {
        id: "demo-security-2",
        plugin_id: "sec-evaluator",
        kind: "approval_required",
        severity: "high",
        title: "Production deploy held for approval",
        summary: "Security evaluator required approval for a production namespace deployment.",
        decision: "ask",
        status: "review",
        created_at: iso(42),
        user_email: "avery.chen@northstar.dev",
        user_name: "Avery Chen",
        hostname: "avery-mbp-14",
        agent_kind: "claude-code",
        agent_name: "Claude Code",
        event_name: "PreToolUse",
        tool_name: "bash",
        project_path: "/workspaces/payments-api"
      },
      {
        id: "demo-security-3",
        plugin_id: "mcp-scanner",
        kind: "mcp_inventory",
        severity: "medium",
        title: "New MCP server discovered",
        summary: "MCP scanner found a filesystem server with write tools enabled.",
        decision: "allow",
        status: "observed",
        created_at: iso(76),
        user_email: "maya.patel@northstar.dev",
        user_name: "Maya Patel",
        hostname: "maya-framework-16",
        agent_kind: "gemini",
        agent_name: "Gemini",
        event_name: "McpServerSeen",
        project_path: "/workspaces/web-console"
      }
    ],
    byPlugin: [
      { plugin_id: "data-leakage-prevention", kind: "secret_exposure", severity: "critical", count: 7 },
      { plugin_id: "sec-evaluator", kind: "approval_required", severity: "high", count: 11 },
      { plugin_id: "mcp-scanner", kind: "mcp_inventory", severity: "medium", count: 6 }
    ],
    byUser: [
      { user_id: "demo-user-0", email: "avery.chen@northstar.dev", name: "Avery Chen", signal_count: 8, high_count: 2, last_signal_at: iso(42) },
      { user_id: "demo-user-2", email: "priya.rao@northstar.dev", name: "Priya Rao", signal_count: 7, high_count: 1, last_signal_at: iso(18) }
    ],
    usage: {
      byPlugin: [
        { plugin_id: "token-saver", kind: "compression", provider: "openai", model: "gpt-5.2", records: 41, input_tokens: 184000, output_tokens: 26000, saved_tokens: 72000, estimated_cost_cents: 1820 },
        { plugin_id: "data-leakage-prevention", kind: "masking", provider: "anthropic", model: "claude-sonnet", records: 19, input_tokens: 94000, output_tokens: 12000, saved_tokens: 0, estimated_cost_cents: 960 },
        { plugin_id: "sec-evaluator", kind: "policy_eval", provider: "openai", model: "gpt-5-mini", records: 68, input_tokens: 128000, output_tokens: 18000, saved_tokens: 0, estimated_cost_cents: 730 }
      ],
      byUser: [
        { user_id: "demo-user-0", email: "avery.chen@northstar.dev", name: "Avery Chen", records: 32, input_tokens: 76000, output_tokens: 9000, saved_tokens: 21000, estimated_cost_cents: 620, last_usage_at: iso(42) },
        { user_id: "demo-user-1", email: "maya.patel@northstar.dev", name: "Maya Patel", records: 28, input_tokens: 69000, output_tokens: 7800, saved_tokens: 18000, estimated_cost_cents: 540, last_usage_at: iso(76) },
        { user_id: "demo-user-2", email: "priya.rao@northstar.dev", name: "Priya Rao", records: 24, input_tokens: 61000, output_tokens: 7200, saved_tokens: 33000, estimated_cost_cents: 480, last_usage_at: iso(18) }
      ]
    },
    correlations: [
      { correlation_key: "payments-api-risk", signal_count: 5, plugin_count: 3, user_count: 2, last_signal_at: iso(18), plugin_ids: ["data-leakage-prevention", "sec-evaluator", "token-saver"] },
      { correlation_key: "mcp-write-tools", signal_count: 3, plugin_count: 2, user_count: 1, last_signal_at: iso(76), plugin_ids: ["mcp-scanner", "sec-evaluator"] }
    ]
  };
}

function hasSecurityData(data?: SecurityData | null) {
  return Boolean(
    data?.signals?.length ||
    data?.byPlugin?.length ||
    data?.usage?.byPlugin?.length ||
    data?.usage?.byUser?.length ||
    data?.correlations?.length
  );
}

function projectName(memberIndex: number, agentIndex: number) {
  const names = ["payments-api", "customer-portal", "web-console", "identity-sync", "billing-worker", "infra-policies"];
  return names[(memberIndex + agentIndex) % names.length];
}

export function DashboardShell({
  apiUrl,
  data,
  initialTab = "overview",
  triggerData,
  triggerDetail,
  logsData,
  triggerSearchParams,
  logsSearchParams,
  usageSearchParams,
  securitySearchParams,
  usersSearchParams,
  skillsSearchParams,
  settingsSearchParams,
  externalAgents,
  providerUsage,
  securityData,
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
  logsData?: LogsData | null;
  triggerSearchParams?: Record<string, string | undefined>;
  logsSearchParams?: Record<string, string | undefined>;
  usageSearchParams?: Record<string, string | undefined>;
  securitySearchParams?: Record<string, string | undefined>;
  usersSearchParams?: Record<string, string | undefined>;
  skillsSearchParams?: Record<string, string | undefined>;
  settingsSearchParams?: Record<string, string | undefined>;
  externalAgents?: ExternalAgentsData | null;
  providerUsage?: ProviderUsageData | null;
  securityData?: SecurityData | null;
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
  const rawOverview = data ?? emptyOverview;
  const overview = shouldUseDemoOverview(rawOverview, dashboardMode) ? demoOverview() : rawOverview;
  const metrics = overview.metrics;
  const recent = overview.recent;
  const agents = overview.agents;
  const visibleAgentCount = aggregateAgents(agents).length;
  const policies = overview.policies;
  const usageSessions = overview.usage?.sessions ?? sessionsFromAgents(agents);
  const users = overview.users?.length ? overview.users : usersFromAgents(agents);
  const basePath = tenantSlug ? `/${tenantSlug}` : "";
  const personal = dashboardMode === "personal";
  const needsSetup = !personal && Boolean(onboardingData) && organizationNeedsSetup(onboardingData);
  const needsIdentityProvider = !personal && !needsSetup && !onboardingData?.idp?.enabled;
  const extensionContext = { apiUrl, basePath, tenantSlug, deploymentMode, dashboardMode, onboardingData };
  const activeExtension = extensionTabs.find((item) => item.id === tab);

  return (
    <div className={personal ? "app personalDashboard" : "app"}>
      <Sidebar tab={tab} agentsCount={visibleAgentCount} usersCount={users.length} basePath={basePath} mode={dashboardMode} extensionTabs={extensionTabs} settingsItem={settingsSearchParams?.item} />
      <main className="main">
        {tab === "overview" && needsIdentityProvider && <IdentityProviderNotice basePath={basePath} />}
        {tab === "overview" && (
          <OverviewPage
            metrics={metrics}
            recent={recent}
            agents={agents}
            policies={policies}
            users={users}
            usageSessions={usageSessions}
            organizationName={onboardingData?.organization.name}
            mode={dashboardMode}
            basePath={basePath}
            setupPanel={needsSetup && onboardingData ? (
              <OrganizationSetupPanel apiUrl={apiUrl} onboardingData={onboardingData} tenantDomain={tenantDomain} basePath={basePath} organizationSlug={tenantSlug} variant="compact" />
            ) : null}
          />
        )}
        {tab === "security" && <SecurityPage data={securityData} mode={dashboardMode} basePath={basePath} range={securitySearchParams?.range} />}
        {tab === "usage" && <UsagePage sessions={usageSessions} users={users} providerUsage={providerUsage} mode={dashboardMode} basePath={basePath} range={usageSearchParams?.range} view={usageSearchParams?.view} />}
        {(tab === "setup" || tab === "settings") && <SettingsPage apiUrl={apiUrl} onboardingData={onboardingData ?? null} tenantDomain={tenantDomain} tenantSlug={tenantSlug} mode={dashboardMode} settingsItem={settingsSearchParams?.item} />}
        {tab === "triggers" && <TriggersPage triggers={triggerData?.triggers ?? []} detail={triggerDetail?.trigger} filters={triggerSearchParams ?? {}} mode={dashboardMode} basePath={basePath} />}
        {tab === "logs" && <LogsPage logs={logsData?.logs ?? []} detail={logsData?.logDetail?.log} filters={logsSearchParams ?? {}} mode={dashboardMode} basePath={basePath} />}
        {tab === "users" && <UsersPage users={users} mode={dashboardMode} basePath={basePath} identitySource={identitySourceLabel(onboardingData, users)} filters={usersSearchParams ?? {}} />}
        {tab === "identity" && (personal ? <PersonalIdentityPage /> : <IdentityPage apiUrl={apiUrl} onboardingData={onboardingData ?? null} />)}
        {tab === "agents" && <AgentsPage agents={agents} recent={recent} mode={dashboardMode} basePath={basePath} />}
        {tab === "external-agents" && <ExternalAgentsPage apiUrl={apiUrl} data={externalAgents} />}
        {tab === "mcps" && <McpServersPage apiUrl={apiUrl} data={mcpServers} mode={dashboardMode} />}
        {tab === "skills" && <SkillsPage data={skills} mode={dashboardMode} basePath={basePath} filters={skillsSearchParams ?? {}} />}
        {tab === "policies" && <PoliciesPage apiUrl={apiUrl} policies={policies} mode={dashboardMode} tenantSlug={tenantSlug} />}
        {tab === "tokens" && <TokensPage apiUrl={apiUrl} mode={dashboardMode} />}
        {tab === "deployment" && <DeploymentPage apiUrl={apiUrl} mode={dashboardMode} />}
        {activeExtension?.render(extensionContext)}
      </main>
    </div>
  );
}

function organizationNeedsSetup(onboardingData: OnboardingData | null | undefined) {
  if (!onboardingData) return false;
  const org = onboardingData.organization;
  const hasCompany = Boolean(org.name?.trim())
    && !["OpenLeash Cloud Dev", "OpenLeash Managed Dev"].includes(String(org.name ?? "").trim())
    && Boolean(org.slug?.trim())
    && org.slug !== "openleash";
  return !hasCompany
    || !onboardingData.idp?.enabled
    || onboardingData.roles.length === 0
    || onboardingData.deploymentTokens.length === 0;
}

function IdentityProviderNotice({ basePath }: { basePath: string }) {
  return (
    <section className="dashboardNotice">
      <div>
        <strong>Connect an identity provider</strong>
        <p>OpenLeash is active, but this organization is not connected to Google Workspace, Microsoft Entra ID, Okta, Ping, or LDAP yet. Connect identity to sync users and groups, assign dashboard roles, and manage rollout coverage.</p>
      </div>
      <Link href={`${routeHref(basePath, "/settings")}?item=identity` as any}>Connect identity</Link>
    </section>
  );
}

function Sidebar({
  tab,
  agentsCount,
  usersCount,
  basePath,
  mode,
  extensionTabs,
  settingsItem
}: {
  tab: DashboardTab | string;
  agentsCount: number;
  usersCount: number;
  basePath: string;
  mode: DashboardMode;
  extensionTabs: DashboardExtensionTab[];
  settingsItem?: string;
}) {
  const personal = mode === "personal";
  const settingsOpen = tab === "settings" || tab === "setup";
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"><Logo /></div>
        <div className="brand-name">OpenLeash</div>
      </div>
      <nav className="nav" aria-label="Dashboard sections">
        <NavButton active={tab === "overview"} href={dashboardHref(basePath, "/")} icon={<Home />} label="Home" />
        {!personal && <NavButton active={tab === "security"} href={dashboardHref(basePath, "/security")} icon={<Shield />} label="Security" />}
        <NavButton active={tab === "agents"} href={dashboardHref(basePath, "/agents")} icon={<Bot />} label={personal ? "My agents" : "Agents"} badge={agentsCount || undefined} />
        {!personal && <NavButton active={tab === "users"} href={dashboardHref(basePath, "/users")} icon={<Users />} label="Users" badge={usersCount || undefined} />}
        <NavButton active={tab === "usage"} href={dashboardHref(basePath, "/usage")} icon={<Clock3 />} label="Usage" />
        <NavButton active={tab === "triggers"} href={dashboardHref(basePath, "/events")} icon={<AlertTriangle />} label={personal ? "Activity" : "Events"} />
        <NavButton active={tab === "skills"} href={dashboardHref(basePath, "/skills")} icon={<Code2 />} label="Skills" />
        <NavButton active={tab === "mcps"} href={dashboardHref(basePath, "/mcps")} icon={<Database />} label="MCPs" />
        <NavButton active={tab === "policies"} href={dashboardHref(basePath, "/policies")} icon={<ShieldCheck />} label={personal ? "Guardrails" : "Policies"} />
        <NavButton active={tab === "logs"} href={dashboardHref(basePath, "/logs")} icon={<FileClock />} label="Logs" />
        {personal && <NavButton active={tab === "tokens"} href={dashboardHref(basePath, "/tokens")} icon={<KeyRound />} label="Connect" />}
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
        <NavButton active={settingsOpen} href={dashboardHref(basePath, "/settings")} icon={<Settings />} label="Settings" />
        {settingsOpen && !personal && (
          <Suspense fallback={null}>
            <SettingsTree basePath={basePath} initialItem={settingsItem} />
          </Suspense>
        )}
      </nav>

      <div className="sidebar-foot">
        <button className="nav-item" type="button"><CircleHelp className="ic" /><span>Help & docs</span></button>
        <DashboardSignOutButton />
      </div>
    </aside>
  );
}

type DashboardHref = "/" | "/security" | "/usage" | "/setup" | "/settings" | "/events" | "/triggers" | "/logs" | "/users" | "/identity" | "/agents" | "/external-agents" | "/mcps" | "/skills" | "/policies" | "/tokens" | "/deployment";

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

function OverviewPanel({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <section className="overviewPanel">
      <div className="card-title">
        <h3>{title}</h3>
        <Link className="pill action-pill" href={href as any}>
          <span>View</span>
          <ChevronRight size={14} />
        </Link>
      </div>
      <div className="overviewLeaderList">{children}</div>
    </section>
  );
}

function OverviewPage({
  metrics,
  recent,
  agents,
  policies,
  users,
  usageSessions,
  organizationName,
  mode,
  basePath,
  setupPanel
}: {
  metrics: Overview["metrics"];
  recent: Overview["recent"];
  agents: Overview["agents"];
  policies: Overview["policies"];
  users: UserRow[];
  usageSessions: UsageSession[];
  organizationName?: string | null;
  mode: DashboardMode;
  basePath: string;
  setupPanel?: React.ReactNode;
}) {
  const latest = recent.filter(isTriggerEvent).slice(0, 10);
  const topAgents = overviewAgents(agents, users).slice(0, 7);
  const topUsers = usageByEmployee(usageSessions).slice(0, 5);
  const topPolicies = policies
    .filter((policy) => numeric(policy.trigger_count) > 0)
    .sort((a, b) => numeric(b.trigger_count) - numeric(a.trigger_count))
    .slice(0, 5);
  const personal = mode === "personal";
  const managedUsers = users.filter((user) => Number(user.endpoint_count ?? 0) > 0 || user.status === "active").length;
  const totalTriggers = policies.reduce((sum, policy) => sum + numeric(policy.trigger_count), 0) || numeric(metrics.denied) + numeric(metrics.questions);
  const coverageLabel = personal
    ? "Your protected coding activity"
    : organizationName?.trim() ? `${organizationName.trim()} · live coverage` : "Live coverage";
  return (
    <>
      <Topbar />
      <div className="page-head">
        <div>
          <h1>{personal ? "Your OpenLeash dashboard" : "Overview"}</h1>
          <p className="sub">{coverageLabel}</p>
        </div>
      </div>

      <div className="divider" />

      {setupPanel}

      <div className="stat-row">
        <Stat icon={<Bot />} label={personal ? "Your agents" : "Agents"} value={metrics.agents} />
        {personal ? <Stat icon={<Laptop />} label="Computers" value={metrics.computers} /> : <Stat icon={<Users />} label="Managed users" value={String(managedUsers)} />}
        <Stat icon={<AlertTriangle />} label={personal ? "Things to review" : "Events"} value={String(totalTriggers)} />
        <Stat icon={<Clock3 />} label="Agent time 24h" value={formatDuration(metrics.session_time?.last24h_seconds)} />
      </div>

      <div className="overviewLeaderGrid">
        <OverviewPanel title="Top agents" href={routeHref(basePath, "/agents")}>
          {topAgents.map((agent) => (
            <div className="overviewLeaderRow" key={agent.key}>
              <AgentLogo name={agent.displayName} fallback={initials(agent.displayName).slice(0, 1)} size="small" />
              <div>
                <strong>{agent.displayName}</strong>
                <span>{agent.users} user{agent.users === 1 ? "" : "s"} · {agent.installs} install{agent.installs === 1 ? "" : "s"}</span>
              </div>
            </div>
          ))}
          {topAgents.length === 0 && <Empty text="No agents have checked in yet." />}
        </OverviewPanel>

        <OverviewPanel title="Top users by usage" href={routeHref(basePath, "/usage")}>
          {topUsers.map((user) => (
            <div className="overviewLeaderRow" key={user.key}>
              <span className="avatar-sm" style={{ background: avatarFor(user.name).bg, color: avatarFor(user.name).fg }}>{initials(user.name)}</span>
              <div>
                <strong>{user.name}</strong>
                <span>{user.sessions} session{user.sessions === 1 ? "" : "s"} · {formatDuration(user.duration)}</span>
              </div>
              <em>{user.subagents} sub</em>
            </div>
          ))}
          {topUsers.length === 0 && <Empty text="No usage recorded yet." />}
        </OverviewPanel>
      </div>

      <div className="card-title overview-activity-head">
        <h3>{personal ? "Recent activity" : "Recent events"}</h3>
        <div className="right">
          <Link className="pill action-pill" href={routeHref(basePath, "/events")}>
            <span>{personal ? "All activity" : "All events"}</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      <div className="trigger-list">
        {latest.map((event) => <TriggerRow key={event.id} event={event} basePath={basePath} />)}
        {latest.length === 0 && <Empty text="No event activity yet." />}
      </div>

      <div className="section-spacer" />

      <div className="card-title">
        <h3>{personal ? "Guardrails" : "Top event policies"}</h3>
        <div className="right">
          <Link className="pill action-pill" href={routeHref(basePath, "/policies")}>
            <span>All</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      <div>
        {topPolicies.map((policy, index) => (
          <Link key={policy.id} className="row-card policy-row" href={`${routeHref(basePath, "/events")}?policy=${encodeURIComponent(policy.name)}` as any}>
            <div className="row-ico">{iconForPolicy(policy, index)}</div>
            <div className="row-copy">
              <div className="row-title">{compactRule(policy.name)}</div>
              <div className="row-sub">Last {policy.last_triggered_at ? `${relativeTime(policy.last_triggered_at)}${policy.last_agent_name ? ` by ${policy.last_agent_name}` : ""}` : "recently"}</div>
            </div>
            <div className="blocked-count">
              {formatCount(policy.trigger_count)}
              <span> events</span>
            </div>
            <ChevronRight size={18} className="muted" />
          </Link>
        ))}
        {topPolicies.length === 0 && <Empty text="No policy events yet." />}
      </div>
    </>
  );
}

function SettingsPage({
  apiUrl,
  onboardingData,
  tenantDomain,
  tenantSlug,
  mode,
  settingsItem
}: {
  apiUrl: string;
  onboardingData: OnboardingData | null;
  tenantDomain: string;
  tenantSlug?: string;
  mode: DashboardMode;
  settingsItem?: string;
}) {
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
  const basePath = tenantSlug ? `/${tenantSlug}` : "";
  return (
    <>
      <Topbar />
      <div className="page-head">
        <div>
          <h1>Settings</h1>
          <p className="sub">Organization setup, identity, dashboard access, tokens, and deployment.</p>
        </div>
      </div>
      <div className="divider" />
      {onboardingData ? (
        <Suspense fallback={<div className="panel"><div className="card-title"><h3>Settings</h3></div></div>}>
          <DashboardSettingsPane apiUrl={apiUrl} onboardingData={onboardingData} tenantDomain={tenantDomain} basePath={basePath} organizationSlug={tenantSlug} initialItem={settingsItem} />
        </Suspense>
      ) : (
        <div className="panel">
          <div className="card-title"><h3>Organization setup</h3></div>
          <p className="sub">OpenLeash could not load setup state for this organization.</p>
        </div>
      )}
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

function UsersPage({ users, mode, basePath, identitySource, filters }: { users: UserRow[]; mode: DashboardMode; basePath: string; identitySource: string; filters: Record<string, string | undefined> }) {
  const selectedUser = users.find((user) => user.id === filters.userId);
  if (filters.userId) return <UserDetailPage user={selectedUser} basePath={basePath} identitySource={identitySource} />;
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
        <UserRoster users={users.slice(0, 1).map((user) => userRosterItem(user, basePath))} />
      </>
    );
  }
  const covered = users.filter((user) => Number(user.endpoint_count ?? 0) > 0);
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
            <strong>{identitySource}</strong>
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
            <strong>{notDeployed.length}</strong>
          </div>
        </div>
      </div>

      <UserRoster users={users.map((user) => userRosterItem(user, basePath))} />
    </>
  );
}

function UserDetailPage({ user, basePath, identitySource }: { user?: UserRow; basePath: string; identitySource: string }) {
  if (!user) {
    return (
      <>
        <Topbar />
        <div className="page-head">
          <div>
            <Link className="backLink" href={routeHref(basePath, "/users")}><ArrowLeft size={17} />Users</Link>
            <h1>User not found</h1>
            <p className="sub">This user is not in the current identity roster.</p>
          </div>
        </div>
        <div className="divider" />
        <Empty text="No matching user was found." />
      </>
    );
  }
  const item = userRosterItem(user, basePath);
  const avatar = avatarFor(item.name);
  const clientActive = item.endpointCount > 0;
  return (
    <>
      <Topbar />
      <div className="page-head userDetailHead">
        <div>
          <Link className="backLink" href={routeHref(basePath, "/users")}><ArrowLeft size={17} />Users</Link>
          <div className="userDetailIdentity">
            <span className="avatar-lg" style={{ background: avatar.bg, color: avatar.fg }}>{initials(item.name)}</span>
            <div>
              <h1>{item.name}</h1>
              <p className="sub">{item.email} · {item.department} · {item.title}</p>
            </div>
          </div>
        </div>
        <span className={`tag ${clientActive ? "allowed" : "blocked"}`}><span className="dot" />{clientActive ? "client active" : "client missing"}</span>
      </div>
      <div className="divider" />
      <div className="userDetailGrid">
        <section className="userDetailCard">
          <span>Identity source</span>
          <strong>{identitySource}</strong>
          <p>{user.idp_provider ? providerLabel(user.idp_provider) : "Roster user"}</p>
        </section>
        <section className="userDetailCard">
          <span>Client</span>
          <strong>{clientActive ? "Installed" : "Needs rollout"}</strong>
          <p>{clientActive ? "OpenLeash client checked in" : "No OpenLeash client check-in yet"}</p>
        </section>
        <section className="userDetailCard">
          <span>Endpoint</span>
          <strong>{item.endpointCount}</strong>
          <p>{item.hostnames[0] ?? "No endpoint recorded"}</p>
        </section>
        <section className="userDetailCard">
          <span>Last seen</span>
          <strong>{item.lastSeen}</strong>
          <p>Latest OpenLeash activity from this user.</p>
        </section>
      </div>
      <section className="userDetailSection">
        <div className="sectionHeader">
          <h2>Agents</h2>
          <a className="pill action-pill" href={item.logsHref}>View logs</a>
        </div>
        <div className="userAgentList">
          {item.agents.map((agent) => (
            <div className="userAgentItem" key={agent}>
              <AgentLogo name={agent} fallback={initials(agent).slice(0, 1)} size="small" />
              <strong>{agent}</strong>
              <span>Seen on {item.hostnames[0] ?? "endpoint"}</span>
            </div>
          ))}
          {item.agents.length === 0 && <Empty text="No agents recorded for this user yet." />}
        </div>
      </section>
    </>
  );
}

function userRosterItem(user: UserRow, basePath: string): UserRosterItem {
  const endpointCount = Number(user.endpoint_count ?? 0);
  const agents = Array.isArray(user.agents) ? user.agents : [];
  const hostnames = Array.isArray(user.hostnames) ? user.hostnames : [];
  return {
    id: user.id,
    name: user.display_name,
    email: user.email,
    department: user.department ?? departmentFor(user.email),
    title: user.hr_title ?? titleFor(user.role),
    endpointCount,
    agentCount: Number(user.agent_count ?? 0),
    agents,
    hostnames,
    lastSeen: user.lastSeenLabel ?? (user.last_seen_at ? relativeTime(user.last_seen_at) : "Never"),
    logsHref: `${routeHref(basePath, "/logs")}?userId=${encodeURIComponent(user.id)}`,
    detailHref: routeHref(basePath, `/users/${encodeURIComponent(user.id)}`)
  };
}

function identitySourceLabel(onboardingData: OnboardingData | null | undefined, users: UserRow[]) {
  const provider = onboardingData?.idp?.provider ?? users.find((user) => user.idp_provider)?.idp_provider;
  return providerLabel(provider) ?? "Not connected";
}

function providerLabel(provider?: string | null) {
  const value = String(provider ?? "").trim().toLowerCase();
  if (!value) return undefined;
  if (["google", "google_workspace", "workspace"].includes(value)) return "Google Workspace";
  if (["azuread", "azure_ad", "entra", "entra_id", "microsoft_entra", "microsoft_entra_id"].includes(value)) return "Microsoft Entra ID";
  if (value === "okta") return "Okta";
  if (["ping", "ping_identity"].includes(value)) return "Ping Identity";
  if (["ldap", "active_directory", "ad"].includes(value)) return "Active Directory / LDAP";
  return provider ?? "Connected";
}

function AgentsPage({ agents, recent, mode, basePath }: { agents: Overview["agents"]; recent: Overview["recent"]; mode: DashboardMode; basePath: string }) {
  const groupedAgents = aggregateAgents(agents);
  const personal = mode === "personal";
  const cards = groupedAgents.map((agent) => agentInventoryCard(agent, agents, recent, basePath));
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
      {cards.length > 0 ? <AgentInventory agents={cards} /> : <Empty text="No agents have checked in." />}
    </>
  );
}

function agentInventoryCard(
  agent: ReturnType<typeof aggregateAgents>[number],
  allAgents: Overview["agents"],
  recent: Overview["recent"],
  basePath: string
): AgentInventoryCard {
  const events = agentEvents(agent, recent).slice(0, 4).map((event) => ({
    id: event.id,
    href: routeHref(basePath, `/events/${event.id}`),
    project: projectTag(event.project_path) ?? "No project",
    title: agentActionTitle(event),
    context: agentActionContext(event),
    when: relativeTime(event.created_at)
  }));
  const users = usersForAgent(agent, allAgents, basePath);
  return {
    key: agent.key,
    displayName: agent.displayName,
    kind: agent.kind,
    version: agent.version,
    users: agent.users,
    installs: agent.installs,
    events,
    usersList: users
  };
}

function usersForAgent(agent: ReturnType<typeof aggregateAgents>[number], allAgents: Overview["agents"], basePath: string) {
  const grouped = new Map<string, { key: string; name: string; hostname: string; lastSeen: string; lastSeenRaw: string; sessions: number; logsHref: string }>();
  for (const runtime of allAgents) {
    if (agentProductKey(runtime) !== agent.key) continue;
    const name = runtime.user_name || "Unknown user";
    const hostname = runtime.hostname || "";
    const key = `${name.toLowerCase()}|${hostname}`;
    const current = grouped.get(key) ?? {
      key,
      name,
      hostname,
      lastSeen: runtime.last_seen_at ? relativeTime(runtime.last_seen_at) : "Never",
      lastSeenRaw: runtime.last_seen_at,
      sessions: 0,
      logsHref: `${routeHref(basePath, "/logs")}?agent=${encodeURIComponent(runtime.display_name || runtime.kind)}&user=${encodeURIComponent(name)}` as string
    };
    current.sessions += runtime.sessions?.length ?? 0;
    if (runtime.last_seen_at && new Date(runtime.last_seen_at).getTime() > new Date(current.lastSeenRaw || 0).getTime()) {
      current.lastSeenRaw = runtime.last_seen_at;
      current.lastSeen = relativeTime(runtime.last_seen_at);
    }
    grouped.set(key, current);
  }
  return Array.from(grouped.values()).sort((a, b) => new Date(b.lastSeenRaw || 0).getTime() - new Date(a.lastSeenRaw || 0).getTime());
}

function agentEvents(agent: ReturnType<typeof aggregateAgents>[number], recent: Overview["recent"]) {
  return recent
    .filter((event) => agentProductKey({
      id: event.agent_name,
      kind: event.agent_kind ?? event.agent_name,
      display_name: event.agent_name,
      hostname: event.hostname,
      user_name: event.user_name,
      last_seen_at: event.created_at
    }) === agent.key)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

function agentActionTitle(event: Overview["recent"][number]) {
  const text = eventText(event).toLowerCase();
  const prompt = (event.prompt || event.question || event.summary || "").trim();
  if (/hooks?\s+config/.test(text)) return "Trying to read hooks config file";
  if (/\.env/.test(text)) return /write|edit|create|save/i.test(text) ? "Trying to edit environment file" : "Trying to read environment file";
  if (/mcp/.test(text)) return "Trying to access MCP configuration";
  if (/git\s+push|push to/.test(text)) return "Trying to push code";
  if (/git\s+init|repo|repository/.test(text)) return "Trying to create a repository";
  if (/delete|rm -rf|destructive|reset --hard/.test(text)) return "Trying to run a destructive action";
  if (/secret|token|credential|private key/.test(text)) return "Trying to access secrets";
  if (event.tool_name) return `Trying to ${humanToolVerb(event.tool_name)}`;
  if (prompt) return sentenceTitle(prompt);
  return compactRule(event.summary);
}

function agentActionContext(event: Overview["recent"][number]) {
  const evidence = event.triggered_policies?.flatMap((policy) => evidenceItems(policy.evidence)).find(Boolean);
  const request = event.prompt || event.question;
  const outcome = decisionLabel(event.resolution ?? event.decision);
  return [request ? `Requested: ${truncate(request, 86)}` : undefined, evidence ? truncate(evidence, 86) : undefined, `Outcome: ${outcome}`].filter(Boolean).join(" · ");
}

function humanToolVerb(toolName: string) {
  const normalized = toolName.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").toLowerCase();
  if (normalized.includes("read")) return "read a file";
  if (normalized.includes("write") || normalized.includes("edit")) return "edit a file";
  if (normalized.includes("bash")) return "run a command";
  if (normalized.includes("grep") || normalized.includes("search")) return "search the project";
  return normalized || "use a tool";
}

function sentenceTitle(value: string) {
  const clean = value.replace(/\s+/g, " ").replace(/[.?!]+$/, "").trim();
  if (!clean) return "Agent action";
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function SecurityPage({ data, mode, basePath, range }: { data?: SecurityData | null; mode: DashboardMode; basePath: string; range?: string }) {
  const personal = mode === "personal";
  const pageData = !personal && !hasSecurityData(data) ? demoSecurityData() : data;
  const selectedRange = range === "7d" ? "7d" : range === "all" ? "all" : "30d";
  const ranges = [{ label: "7d", value: "7d" }, { label: "30d", value: "30d" }, { label: "All", value: "all" }];
  const securityHref = (nextRange: string) => {
    const params = new URLSearchParams();
    if (nextRange !== "30d") params.set("range", nextRange);
    return `${dashboardHref(basePath, "/security")}${params.size ? `?${params.toString()}` : ""}` as any;
  };
  const summary = pageData?.summary ?? {};
  const signals = pageData?.signals ?? [];
  const outcomes = pageData?.outcomes ?? [];
  const correlations = pageData?.correlations ?? [];
  const byPlugin = aggregateSecurityPlugins(pageData?.byPlugin ?? []);
  const usageByPlugin = pageData?.usage?.byPlugin ?? [];
  const usageByUser = pageData?.usage?.byUser ?? [];
  return (
    <>
      <Topbar />
      <div className="page-head">
        <div>
          <h1>Security</h1>
          <p className="sub">{personal ? "Security outcomes from your OpenLeash runtime." : "Incidents, findings, correlations, and cost signals across OpenLeash plugins."}</p>
        </div>
        <div className="usageRange">
          {ranges.map((item) => <Link key={item.value} className={item.value === selectedRange ? "active" : ""} href={securityHref(item.value)}>{item.label}</Link>)}
        </div>
      </div>
      <div className="divider" />
      <div className="stat-row">
        <Stat icon={<ShieldAlert />} label="Findings" value={formatCount(summary.findings)} />
        <Stat icon={<AlertTriangle />} label="High severity" value={formatCount(summary.high_severity)} />
        <Stat icon={<Ban />} label="Contained" value={formatCount(summary.contained)} />
        <Stat icon={<Users />} label="Affected users" value={formatCount(summary.affected_users)} />
      </div>
      <div className="usageGrid single">
        <section className="usagePanel">
          <div className="card-title"><h3>Latest security outcomes</h3><div className="right"><span className="sync-pill">{formatCount(outcomes.length || summary.total_signals)} records</span></div></div>
          <div className="usageSessionList">
            {(outcomes.length ? outcomes : signals.map(signalToOutcomeView)).slice(0, 40).map((outcome) => (
              <article className="usageSession outcomeCard" key={outcome.id}>
                <div>
                  <strong>{outcome.title}</strong>
                  <p>{outcome.summary || outcome.subject?.name || sentenceTitle(outcome.domain)} · {outcome.actor?.name || outcome.actor?.email || "Unknown user"} · {outcome.agent?.name || outcome.agent?.kind || "agent"}</p>
                  {outcome.evidence?.length ? (
                    <div className="outcomeEvidence">
                      {outcome.evidence.slice(0, 3).map((item, index) => (
                        <span key={`${outcome.id}-evidence-${index}`} title={item.value}>{item.label}{item.value ? `: ${truncate(item.value, 72)}` : ""}</span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="usageSessionStats">
                  <span>{outcome.severity}</span>
                  <span>{outcome.decision || outcome.status || "observed"}</span>
                  <span>{relativeTime(outcome.createdAt)}</span>
                  <small>{outcome.source?.label ?? "OpenLeash"}</small>
                </div>
              </article>
            ))}
            {outcomes.length === 0 && signals.length === 0 && <Empty text="No security outcomes in this range." />}
          </div>
        </section>
        <section className="usagePanel">
          <div className="card-title"><h3>Cross-plugin correlations</h3><div className="right"><span className="sync-pill">{correlations.length} active</span></div></div>
          <div className="usageTable">
            <div className="usageTableHead provider"><span>Correlation</span><span>Signals</span><span>Plugins</span><span>Users</span><span>Latest</span></div>
            {correlations.map((row) => (
              <div className="usageTableRow provider" key={row.correlation_key}>
                <span><strong>{row.correlation_key}</strong><small>{(row.plugin_ids ?? []).map(pluginName).join(", ") || "OpenLeash"}</small></span>
                <span>{formatCount(row.signal_count)}</span>
                <span>{formatCount(row.plugin_count)}</span>
                <span>{formatCount(row.user_count)}</span>
                <span>{row.last_signal_at ? relativeTime(row.last_signal_at) : "Never"}</span>
              </div>
            ))}
            {correlations.length === 0 && <Empty text="No cross-plugin correlations yet." />}
          </div>
        </section>
        <section className="usagePanel">
          <div className="card-title"><h3>Signal sources</h3><div className="right"><span className="sync-pill">plugin contribution</span></div></div>
          <div className="usageTable">
            <div className="usageTableHead provider"><span>Source</span><span>Signals</span><span>High</span><span>Kinds</span><span>Criticality</span></div>
            {byPlugin.map((row) => (
              <div className="usageTableRow provider" key={row.pluginId}>
                <span><strong>{pluginName(row.pluginId)}</strong><small>{row.kinds.join(", ")}</small></span>
                <span>{formatCount(row.count)}</span>
                <span>{formatCount(row.high)}</span>
                <span>{formatCount(row.kinds.length)}</span>
                <span>{row.high > 0 ? "needs review" : "normal"}</span>
              </div>
            ))}
            {byPlugin.length === 0 && <Empty text="No plugin security contribution in this range." />}
          </div>
        </section>
        <section className="usagePanel">
          <div className="card-title"><h3>Plugin-reported cost and usage</h3><div className="right"><span className="sync-pill">{formatCount(usageByPlugin.length)} sources</span></div></div>
          <div className="usageTable">
            <div className="usageTableHead provider"><span>Plugin</span><span>Model</span><span>Tokens</span><span>Saved</span><span>Cost</span></div>
            {usageByPlugin.slice(0, 20).map((row) => (
              <div className="usageTableRow provider" key={`${row.plugin_id}:${row.kind}:${row.model ?? ""}`}>
                <span><strong>{pluginName(row.plugin_id)}</strong><small>{row.kind}</small></span>
                <span>{row.model || row.provider || "plugin"}</span>
                <span>{formatCompactNumber(numeric(row.input_tokens) + numeric(row.output_tokens))}</span>
                <span>{formatCompactNumber(row.saved_tokens)}</span>
                <span>{formatCurrencyCents(row.estimated_cost_cents)}</span>
              </div>
            ))}
            {usageByPlugin.length === 0 && <Empty text="No plugin-reported cost yet." />}
          </div>
        </section>
        <section className="usagePanel">
          <div className="card-title"><h3>Employees by plugin usage</h3></div>
          <div className="usageTable">
            <div className="usageTableHead provider"><span>Employee</span><span>Records</span><span>Tokens</span><span>Saved</span><span>Cost</span></div>
            {usageByUser.slice(0, 20).map((row) => (
              <div className="usageTableRow provider" key={row.user_id || row.email || row.name || "unknown"}>
                <span><strong>{row.name || row.email || "Unknown user"}</strong><small>{row.email || "No synced email"}</small></span>
                <span>{formatCount(row.records)}</span>
                <span>{formatCompactNumber(numeric(row.input_tokens) + numeric(row.output_tokens))}</span>
                <span>{formatCompactNumber(row.saved_tokens)}</span>
                <span>{formatCurrencyCents(row.estimated_cost_cents)}</span>
              </div>
            ))}
            {usageByUser.length === 0 && <Empty text="No employee plugin usage in this range." />}
          </div>
        </section>
      </div>
    </>
  );
}

function UsagePage({ sessions, users, providerUsage, mode, basePath, range, view }: { sessions: UsageSession[]; users: UserRow[]; providerUsage?: ProviderUsageData | null; mode: DashboardMode; basePath: string; range?: string; view?: string }) {
  const personal = mode === "personal";
  const now = Date.now();
  const selectedView = view === "sessions" ? "sessions" : view === "providers" && !personal ? "providers" : "employees";
  const usageHref = (next: { range?: string; view?: "employees" | "sessions" | "providers" }) => {
    const nextRange = next.range ?? selectedRange.label.toLowerCase();
    const nextView = next.view ?? selectedView;
    const params = new URLSearchParams();
    if (nextRange !== "24h") params.set("range", nextRange);
    if (nextView !== "employees") params.set("view", nextView);
    const query = params.toString();
    return `${dashboardHref(basePath, "/usage")}${query ? `?${query}` : ""}` as any;
  };
  const ranges = [
    { label: "24h", value: "24h", cutoff: now - 24 * 60 * 60 * 1000 },
    { label: "7d", value: "7d", cutoff: now - 7 * 24 * 60 * 60 * 1000 },
    { label: "30d", value: "30d", cutoff: now - 30 * 24 * 60 * 60 * 1000 },
    { label: "All", value: "all", cutoff: 0 }
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
          {ranges.map((item) => <Link key={item.label} className={item.label === selectedRange.label ? "active" : ""} href={usageHref({ range: item.value })}>{item.label}</Link>)}
        </div>
      </div>
      <div className="divider" />
      <div className="stat-row">
        <Stat icon={<Clock3 />} label="Agent time" value={formatDuration(totalSeconds)} />
        <Stat icon={<FileClock />} label="Sessions" value={String(scoped.length)} />
        <Stat icon={<Bot />} label="Subagent time" value={formatDuration(subagentSeconds)} />
        <Stat icon={<Shield />} label="Approvals" value={String(approvals)} />
      </div>

      <div className="usageViewSwitch">
        <Link className={selectedView === "employees" ? "active" : ""} href={usageHref({ view: "employees" })}>Employees</Link>
        <Link className={selectedView === "sessions" ? "active" : ""} href={usageHref({ view: "sessions" })}>Sessions</Link>
        {!personal && <Link className={selectedView === "providers" ? "active" : ""} href={usageHref({ view: "providers" })}>Providers</Link>}
      </div>

      <div className="usageGrid single">
        {selectedView === "employees" && <section className="usagePanel">
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
        </section>}

        {selectedView === "sessions" && <section className="usagePanel">
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
        </section>}

        {selectedView === "providers" && <ProviderUsagePanel data={providerUsage} rangeLabel={selectedRange.label} />}
      </div>
    </>
  );
}

function ProviderUsagePanel({ data, rangeLabel }: { data?: ProviderUsageData | null; rangeLabel: string }) {
  const summary = data?.summary ?? {};
  const connections = data?.connections ?? [];
  const byUser = data?.byUser ?? [];
  const byModel = (data?.byModel ?? []).slice(0, 12);
  const byProvider = data?.byProvider ?? [];
  const monthlyBudget = (data?.budgets ?? []).reduce((sum, item) => sum + numeric(item.monthly_budget_cents), 0);
  const remainingBudget = Math.max(0, monthlyBudget - numeric(summary.total_cost_cents));
  const topModel = byModel[0];
  const totalModelRequests = byModel.reduce((sum, item) => sum + providerModelMetric(item), 0);
  const averageDailyUsers = Math.max(0, Math.round(numeric(summary.user_count) / 7));
  const donutStyle = { background: modelDonutGradient(byModel) };
  return (
    <section className="modelUsageShell">
      <div className="modelUsageMain">
        <div className="modelUsageTitle">
          <div>
            <h2>AI Model Usage</h2>
            <p>{providerUsageDateLabel(rangeLabel)} · from connected provider management APIs</p>
          </div>
          <span className="sync-pill">{connections.filter((item) => item.status === "connected").length} connected</span>
        </div>

        <div className="modelUsageStats">
          <div className="modelStatCard">
            <span>Total requests</span>
            <strong>{formatCount(summary.request_count)}</strong>
            <small>across {formatCount(byModel.length || numeric(summary.provider_count))} models</small>
          </div>
          <div className="modelStatCard">
            <span>Top model</span>
            <strong className="accentText">{topModel?.model || "No model data"}</strong>
            <small>{topModel ? `${formatCount(providerModelMetric(topModel))} requests` : "connect a provider to sync"}</small>
          </div>
          <div className="modelStatCard">
            <span>Avg DAU</span>
            <strong>{formatCount(averageDailyUsers || summary.user_count)}</strong>
            <small>daily active users</small>
          </div>
          <div className="modelStatCard budget">
            <span>Budget remaining</span>
            <strong>{formatCurrencyCents(remainingBudget)}</strong>
            <small>{formatCurrencyCents(summary.total_cost_cents)} spent</small>
          </div>
        </div>

        <div className="modelUsageCharts">
          <section className="modelChartCard">
            <h3>Share of Requests</h3>
            <div className="donutWrap">
              <div className="modelDonut" style={donutStyle} />
            </div>
            <div className="modelLegend">
              {byModel.slice(0, 8).map((row, index) => (
                <span key={`${row.provider}:${row.model}`}><i style={{ background: modelColor(index) }} />{row.model || "Unknown"}</span>
              ))}
            </div>
            {byModel.length === 0 && <Empty text="No provider usage synced for this range." />}
          </section>

          <section className="modelChartCard">
            <h3>Requests by Model</h3>
            <p>Click a model later to inspect users; top model is shown on the right.</p>
            <div className="modelBars">
              {byModel.map((row, index) => {
                const value = providerModelMetric(row);
                const width = totalModelRequests ? Math.max(4, Math.round((value / totalModelRequests) * 100)) : 0;
                return (
                  <div className="modelBarRow" key={`${row.provider}:${row.model}`}>
                    <span>{row.model || "Unknown"}</span>
                    <div><b style={{ width: `${width}%`, background: modelColor(index) }} /></div>
                    <strong>{formatCompactNumber(value)}</strong>
                  </div>
                );
              })}
              {byModel.length === 0 && <Empty text="Connect Cursor, OpenAI, or Claude from Settings to start syncing provider usage." />}
            </div>
          </section>
        </div>

        <div className="providerUsageColumns compactAnalytics">
          <div className="usageTable">
            <div className="card-title compact"><h3>Sources</h3></div>
            <div className="usageTableHead provider"><span>Provider</span><span>Status</span><span>Synced</span><span>Events</span><span>Spend</span></div>
            {connections.map((connection) => (
              <div className="usageTableRow provider" key={connection.id}>
                <span><strong>{connection.label || providerName(connection.provider)}</strong><small>{providerName(connection.provider)}</small></span>
                <span><span className={`tag ${connection.status === "connected" ? "allowed" : "blocked"}`}><span className="dot" />{connection.status || "pending"}</span></span>
                <span>{connection.last_sync_at ? relativeTime(connection.last_sync_at) : "Never"}</span>
                <span>{formatCount(connection.event_count)}</span>
                <span>{formatCurrencyCents(connection.total_cost_cents)}</span>
              </div>
            ))}
            {connections.length === 0 && <Empty text="No provider connections yet." />}
          </div>

          <div className="usageTable">
            <div className="card-title compact"><h3>By provider</h3></div>
            <div className="usageTableHead provider"><span>Provider</span><span>Users</span><span>Requests</span><span>Tokens</span><span>Spend</span></div>
            {byProvider.map((row) => (
              <div className="usageTableRow provider" key={row.provider}>
                <span><strong>{providerName(row.provider)}</strong><small>{row.model || "all usage"}</small></span>
                <span>{formatCount(row.user_count)}</span>
                <span>{formatCount(row.request_count)}</span>
                <span>{formatCompactNumber(row.token_count)}</span>
                <span>{formatCurrencyCents(row.cost_cents)}</span>
              </div>
            ))}
            {byProvider.length === 0 && <Empty text="No provider usage synced for this range." />}
          </div>
        </div>
      </div>

      <aside className="modelInspector">
        <div className="modelInspectorHead">
          <div>
            <span>Model</span>
            <strong>{topModel?.model || "No model selected"}</strong>
          </div>
          <button type="button" aria-label="Close">×</button>
        </div>
        <div className="modelInspectorStats">
          <div><span>Users</span><strong>{formatCount(summary.user_count)}</strong></div>
          <div><span>Requests on model</span><strong>{formatCount(topModel ? providerModelMetric(topModel) : 0)}</strong></div>
        </div>
        <div className="modelUserList">
          {byUser.slice(0, 10).map((row, index) => (
            <div className="modelUserRow" key={row.email}>
              <span className="modelRank">{index + 1}</span>
              <span className="modelAvatar">{initials(row.name || row.email)}</span>
              <span className="modelPerson"><strong>{row.name || row.email}</strong><small>{row.email}</small></span>
              <span className="modelUse">
                <strong>{formatCompactNumber(row.request_count || row.token_count || row.cost_cents)}</strong>
                <small>{usageShare(row, summary)}% of their use</small>
                <i><b style={{ width: `${Math.min(100, Math.max(6, usageShare(row, summary)))}%` }} /></i>
              </span>
            </div>
          ))}
          {byUser.length === 0 && <Empty text="No per-user provider data yet. Cursor sync usually fills this first." />}
        </div>
      </aside>
    </section>
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
          <h1>SaaS agents</h1>
          <p className="sub">Monitor SaaS agent conversations through the same OpenLeash rules engine.</p>
        </div>
      </div>
      <div className="divider" />
      <div className="deployHero">
        <div>
          <h3>Conversation sync</h3>
          <p>OpenLeash lists configured SaaS agent providers, fetches the fullest conversation log available, normalizes it, and stores the evaluation next to local agent activity.</p>
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
        {connectors.length === 0 && <Empty text="No SaaS agent connectors configured." />}
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

function SkillsPage({ data, mode, basePath, filters }: { data?: SkillsData | null; mode: DashboardMode; basePath: string; filters: Record<string, string | undefined> }) {
  const skills = data?.skills ?? [];
  const personal = mode === "personal";
  const selectedView = filters.view === "skills" ? "skills" : "users";
  const query = (filters.q ?? "").trim();
  const filteredSkills = filterSkills(skills, query);
  const skillHref = (view: "users" | "skills") => {
    const params = new URLSearchParams();
    if (view !== "users") params.set("view", view);
    if (query) params.set("q", query);
    const suffix = params.toString();
    return `${dashboardHref(basePath, "/skills")}${suffix ? `?${suffix}` : ""}` as any;
  };
  const selectedSkill = skills.find((skill) => skill.id === filters.skillId);
  if (filters.skillId) {
    return (
      <SkillDetailPage
        skill={selectedSkill}
        related={selectedSkill ? skills.filter((skill) => skill.skill_name === selectedSkill.skill_name && skill.agent_name === selectedSkill.agent_name) : []}
        backHref={skillHref(selectedView)}
      />
    );
  }
  const userGroups = groupSkillsByUser(filteredSkills);
  const skillGroups = groupSkillsByName(filteredSkills);
  return (
    <>
      <Topbar />
      <div className="page-head">
        <div>
          <h1>Skills</h1>
          <p className="sub">{personal ? "Scanned agent skills on this computer." : "Scanned skills across users and local agents."}</p>
        </div>
      </div>
      <div className="divider" />
      <div className="skillToolbar">
        <div className="usageViewSwitch">
          <Link className={selectedView === "users" ? "active" : ""} href={skillHref("users")}>Users</Link>
          <Link className={selectedView === "skills" ? "active" : ""} href={skillHref("skills")}>Skills</Link>
        </div>
        <form className="skillSearch" action={dashboardHref(basePath, "/skills")}>
          <input type="hidden" name="view" value={selectedView} />
          <Search size={17} />
          <input name="q" defaultValue={query} placeholder="Search skills, users, agents..." />
        </form>
      </div>

      <div className="skillList">
        {selectedView === "users" && userGroups.map((group) => (
          <article className="skillUserRow" key={group.key}>
            <span className="avatar-sm" style={{ background: avatarFor(group.name).bg, color: avatarFor(group.name).fg }}>{initials(group.name)}</span>
            <div className="skillRowMain">
              <div className="skillRowHead">
                <div>
                  <strong>{group.name}</strong>
                  <span>{group.email || `${group.skills.length} scanned skills`}</span>
                </div>
                <em>{group.skills.length} skills</em>
              </div>
              <div className="skillAgentGroups">
                {group.agents.map((agent) => (
                  <div className="skillAgentLine" key={`${group.key}-${agent.agentName}`}>
                    <AgentLogo name={agent.agentName} fallback={initials(agent.agentName).slice(0, 1)} size="small" />
                    <b>{agent.agentName}</b>
                    <span>{agent.skills.slice(0, 7).map((skill, index) => (
                      <Link key={skill.id} href={skillDetailHref(basePath, selectedView, query, skill.id)}>{index > 0 ? `, ${skill.skill_name}` : skill.skill_name}</Link>
                    ))}{agent.skills.length > 7 ? ` +${agent.skills.length - 7}` : ""}</span>
                  </div>
                ))}
              </div>
            </div>
          </article>
        ))}

        {selectedView === "skills" && skillGroups.map((group) => (
          <Link className="skillItemRow" key={group.key} href={skillDetailHref(basePath, selectedView, query, group.primarySkill.id)}>
            <AgentLogo name={group.agentName} fallback={initials(group.agentName).slice(0, 1)} size="small" />
            <div className="skillRowMain">
              <div className="skillRowHead">
                <div>
                  <strong>{group.name}</strong>
                  <span>{group.summary || group.agentName} · {group.projectLabel}</span>
                </div>
                <span className={`tag ${group.status === "suspicious" ? "blocked" : "allowed"}`}><span className="dot" />{skillStatusLabel(group.status)}</span>
              </div>
              <div className="skillPeople">
                {group.users.slice(0, 8).map((user) => (
                  <span key={`${group.key}-${user.name}`} className="skillPerson" title={user.email || user.name}>
                    <span className="avatar-xs" style={{ background: avatarFor(user.name).bg, color: avatarFor(user.name).fg }}>{initials(user.name)}</span>
                    {user.name}
                  </span>
                ))}
                {group.users.length > 8 && <span className="skillMore">+{group.users.length - 8}</span>}
              </div>
            </div>
          </Link>
        ))}

        {filteredSkills.length === 0 && <Empty text={query ? "No skills match this search." : "No scanned skills detected yet."} />}
      </div>
    </>
  );
}

type SkillRow = SkillsData["skills"][number];

function filterSkills(skills: SkillRow[], query: string) {
  if (!query) return skills;
  const needle = query.toLowerCase();
  return skills.filter((skill) => [
    skill.skill_name,
    skill.agent_name,
    skill.user_name,
    skill.user_email,
    skill.project_path,
    skill.skill_path,
    skill.purpose_summary,
    skill.scope
  ].filter(Boolean).join("\n").toLowerCase().includes(needle));
}

function skillDetailHref(basePath: string, view: "users" | "skills", query: string, skillId: string) {
  const params = new URLSearchParams();
  if (view !== "users") params.set("view", view);
  if (query) params.set("q", query);
  params.set("skillId", skillId);
  return `${dashboardHref(basePath, "/skills")}?${params.toString()}` as any;
}

function groupSkillsByUser(skills: SkillRow[]) {
  const groups = new Map<string, { key: string; name: string; email: string; skills: SkillRow[]; agents: Array<{ agentName: string; skills: SkillRow[] }> }>();
  for (const skill of skills) {
    const name = skill.user_name || skill.user_email || "Unknown user";
    const key = (skill.user_email || name).toLowerCase();
    const group = groups.get(key) ?? { key, name, email: skill.user_email ?? "", skills: [], agents: [] };
    group.skills.push(skill);
    groups.set(key, group);
  }
  for (const group of groups.values()) {
    const byAgent = new Map<string, SkillRow[]>();
    for (const skill of group.skills) byAgent.set(skill.agent_name, [...(byAgent.get(skill.agent_name) ?? []), skill]);
    group.agents = Array.from(byAgent.entries()).map(([agentName, agentSkills]) => ({ agentName, skills: sortSkills(agentSkills) }));
    group.skills = sortSkills(group.skills);
  }
  return Array.from(groups.values()).sort((a, b) => b.skills.length - a.skills.length || a.name.localeCompare(b.name));
}

function groupSkillsByName(skills: SkillRow[]) {
  const groups = new Map<string, { key: string; name: string; agentName: string; projectLabel: string; status: string; summary?: string | null; users: Array<{ name: string; email: string }>; updatedAt: string; primarySkill: SkillRow }>();
  for (const skill of skills) {
    const key = `${skill.agent_name}:${skill.skill_name}:${projectTag(skill.project_path ?? undefined) ?? "user"}`.toLowerCase();
    const group = groups.get(key) ?? {
      key,
      name: skill.skill_name,
      agentName: skill.agent_name,
      projectLabel: projectTag(skill.project_path ?? undefined) ?? "User-level",
      status: skill.status,
      summary: skill.purpose_summary,
      users: [],
      updatedAt: skill.updated_at,
      primarySkill: skill
    };
    const userName = skill.user_name || skill.user_email || "Unknown user";
    if (!group.users.some((user) => user.name === userName && user.email === (skill.user_email ?? ""))) {
      group.users.push({ name: userName, email: skill.user_email ?? "" });
    }
    if (new Date(skill.updated_at).getTime() > new Date(group.updatedAt).getTime()) {
      group.updatedAt = skill.updated_at;
      group.primarySkill = skill;
      group.summary = skill.purpose_summary ?? group.summary;
    }
    if (skill.status === "suspicious") group.status = skill.status;
    groups.set(key, group);
  }
  return Array.from(groups.values()).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

function SkillDetailPage({ skill, related, backHref }: { skill?: SkillRow; related: SkillRow[]; backHref: any }) {
  return (
    <>
      <Topbar />
      <div className="page-head skillDetailPageHead">
        <div>
          <Link className="backLink" href={backHref}><ArrowLeft size={17} />Skills</Link>
          <h1>{skill?.skill_name ?? "Skill not found"}</h1>
          <p className="sub">{skill ? skill.purpose_summary || "Skill purpose not summarized yet" : "This skill was not found or no longer exists."}</p>
        </div>
      </div>
      <div className="divider" />
      {skill ? <SkillDetailPanel skill={skill} related={related} /> : <Empty text="No matching skill was found." />}
    </>
  );
}

function SkillDetailPanel({ skill, related }: { skill: SkillRow; related: SkillRow[] }) {
  const content = skill.content || skill.content_preview || "";
  const relatedUsers = related
    .map((item) => item.user_name || item.user_email || "Unknown user")
    .filter((value, index, all) => all.indexOf(value) === index);
  return (
    <section className="skillDetailPanel">
      <div className="skillDetailHead">
        <div>
          <span className="eyebrow">{skill.agent_name}</span>
          <h3>{skill.skill_name}</h3>
          <p>{skill.purpose_summary || "Skill purpose not summarized yet"}</p>
        </div>
        <span className={`tag ${skill.status === "suspicious" ? "blocked" : "allowed"}`}><span className="dot" />{skillStatusLabel(skill.status)}</span>
      </div>
      <div className="skillDetailMeta">
        <div><span>Last update</span><strong>{relativeTime(skill.content_updated_at || skill.updated_at)}</strong></div>
        <div><span>Scope</span><strong>{skill.scope}</strong></div>
        <div><span>Users</span><strong>{relatedUsers.length}</strong></div>
        <div><span>Risk</span><strong>{numeric(skill.risk_score)}</strong></div>
      </div>
      <div className="filePathPill wide" title={skill.skill_path}><span>Path</span><code>{skill.skill_path}</code></div>
      {content ? <MarkdownDocument content={content} /> : <Empty text="Skill content has not synced yet." />}
    </section>
  );
}

function MarkdownDocument({ content }: { content: string }) {
  const lines = content.split(/\r?\n/);
  const blocks: Array<{ type: "heading" | "subheading" | "list" | "code" | "paragraph"; text: string; items?: string[] }> = [];
  let paragraph: string[] = [];
  let list: string[] = [];
  let code: string[] = [];
  let inCode = false;
  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ type: "paragraph", text: paragraph.join(" ") });
    paragraph = [];
  };
  const flushList = () => {
    if (list.length) blocks.push({ type: "list", text: "", items: list });
    list = [];
  };
  const flushCode = () => {
    if (code.length) blocks.push({ type: "code", text: code.join("\n") });
    code = [];
  };
  for (const line of lines) {
    if (/^```/.test(line)) {
      if (inCode) flushCode();
      else {
        flushParagraph();
        flushList();
      }
      inCode = !inCode;
      continue;
    }
    if (inCode) {
      code.push(line);
      continue;
    }
    if (/^##\s+/.test(line)) {
      flushParagraph();
      flushList();
      blocks.push({ type: "subheading", text: line.replace(/^##\s+/, "") });
    } else if (/^#\s+/.test(line)) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading", text: line.replace(/^#\s+/, "") });
    } else if (/^\s*[-*]\s+/.test(line)) {
      flushParagraph();
      list.push(line.replace(/^\s*[-*]\s+/, ""));
    } else if (!line.trim()) {
      flushParagraph();
      flushList();
    } else {
      paragraph.push(line.trim());
    }
  }
  flushParagraph();
  flushList();
  flushCode();
  return (
    <article className="markdownViewer">
      {blocks.slice(0, 160).map((block, index) => {
        if (block.type === "heading") return <h2 key={index}>{block.text}</h2>;
        if (block.type === "subheading") return <h4 key={index}>{block.text}</h4>;
        if (block.type === "list") return <ul key={index}>{block.items?.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}</ul>;
        if (block.type === "code") return <pre key={index}><code>{block.text}</code></pre>;
        return <p key={index}>{block.text}</p>;
      })}
    </article>
  );
}

function sortSkills(skills: SkillRow[]) {
  return [...skills].sort((a, b) => a.skill_name.localeCompare(b.skill_name));
}

function skillStatusLabel(status: string) {
  return status === "suspicious" ? "review" : "scanned";
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
      <TokensSettingsPanel apiUrl={apiUrl} />
    </>
  );
}

function DeploymentPage({ apiUrl, mode }: { apiUrl: string; mode: DashboardMode }) {
  const personal = mode === "personal";
  const enrollmentCommand = "/bin/bash install-openleash-personal.sh --dmg <signed-dmg-url> --tenant <organization-slug> --api-url <managed-api-url> --token <deployment-token> --mode <cloud|self-hosted> --enroll --install-hooks";
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
        <LiveDate />
        <span className="ic"><CalendarDays size={18} /></span>
      </div>
      <button className="iconbutton" type="button"><Bell size={18} /><span className="dotmark" /></button>
      <div className="topbarUserActions">
        <DashboardUserChip />
        <DashboardSignOutIconButton />
      </div>
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

function TriggerRow({ event, basePath }: { event: Overview["recent"][number]; basePath: string }) {
  const hasFailedPolicy = (event.triggered_policies ?? []).some((policy) => policy.status === "failed");
  const decisionClass = event.decision === "deny" || hasFailedPolicy ? "blocked" : event.decision === "ask" ? "asked" : "allowed";
  const triggered = event.triggered_policies ?? [];
  const firstPolicy = triggered[0];
  const title = firstPolicy?.policy_name ?? compactRule(event.question ?? event.summary);
  return (
    <Link className="trigger-row" href={routeHref(basePath, `/events/${event.id}`)}>
      <AgentLogo name={event.agent_name} fallback={initials(event.agent_name).slice(0, 1)} size="large" />
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
      <span className={`tag ${decisionClass}`}><span className="dot" />{triggerStatusLabel(decisionClass)}</span>
      <span className="when">{relativeTime(event.created_at)}</span>
    </Link>
  );
}

function triggerStatusLabel(value: "blocked" | "asked" | "allowed") {
  if (value === "blocked") return "Blocked";
  if (value === "asked") return "Waiting";
  return "Passed";
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
          <h1>{personal ? "Activity" : "Events"}</h1>
          <p className="sub">{personal ? "Review the moments when OpenLeash protected you or asked for approval." : "Search policy interventions by user, policy, agent, project, or date."}</p>
        </div>
      </div>
      <div className="divider" />
      <form className="triggerFilters" action={dashboardHref(basePath, "/events")}>
        <label>
          <span>Search</span>
          <div className="searchInput"><Search size={16} /><input name="q" defaultValue={filters.q ?? ""} placeholder="Prompt, project, tool..." /></div>
        </label>
        <label>
          <span>{personal ? "Profile" : "User"}</span>
          <input name="user" defaultValue={filters.user ?? ""} placeholder={personal ? "You" : "Avery Chen"} />
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
        {triggers.length === 0 && <Empty text={personal ? "No personal activity matched this filter." : "No matching policy events."} />}
      </div>
    </>
  );
}

function TriggerAuditRow({ trigger, basePath }: { trigger: TriggerItem; basePath: string }) {
  const policy = trigger.triggered_policies?.[0];
  const evidence = trigger.triggered_policies?.flatMap((item) => evidenceItems(item.evidence)).slice(0, 2) ?? [];
  const state = trigger.resolution ?? trigger.decision;
  const title = triggerDisplayTitle(trigger);
  return (
    <Link className="triggerAuditRow" href={routeHref(basePath, `/events/${trigger.id}`)}>
      <AgentLogo name={trigger.agent_name} fallback={initials(trigger.agent_name).slice(0, 1)} size="large" />
      <div className="audit-main">
        <div className="audit-title">{title}</div>
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

function triggerDisplayTitle(trigger: TriggerItem) {
  const text = [
    trigger.summary,
    trigger.question,
    trigger.prompt,
    trigger.event_name,
    trigger.tool_name,
    ...(trigger.triggered_policies ?? []).flatMap((policy) => [
      policy.policy_name,
      policy.explanation,
      ...evidenceItems(policy.evidence)
    ])
  ].filter(Boolean).join("\n").toLowerCase();
  const secretText = /credential|secret|\.env|token|private key|kubeconfig|\.npmrc|id_rsa|id_ed25519|password/.test(text);
  if (secretText) {
    if (/\b(read|cat|open|show|print|search|find|grep|scan|dump|copy|view|access)\b/.test(text)) return "Secret file access";
    if (/\b(write|create|edit|touch|generate|save|commit|push)\b/.test(text)) return "Secret file change";
    return "Secret access";
  }
  const classified = classifyHighlight(trigger);
  return classified?.label ?? trigger.triggered_policies?.[0]?.policy_name ?? trigger.summary;
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
          <h1>{personal ? "Activity detail" : "Event detail"}</h1>
          <p className="sub">{trigger.summary}</p>
        </div>
        <Link className="pill action-pill" href={routeHref(basePath, "/events")}>Back</Link>
      </div>
      <div className="divider" />

      <div className="detailGrid">
        <section className="detailPanel">
          <div className="detailAgentHeader">
            <AgentLogo name={trigger.agent_name} fallback={initials(trigger.agent_name).slice(0, 1)} size="large" />
            <div>
              <strong>{trigger.agent_name}</strong>
              <span>{trigger.user_name ?? "Unknown user"} · {trigger.hostname ?? "Unknown endpoint"}</span>
            </div>
          </div>
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

function LogsPage({
  logs,
  detail,
  filters,
  mode,
  basePath
}: {
  logs: LogItem[];
  detail?: LogItem;
  filters: Record<string, string | undefined>;
  mode: DashboardMode;
  basePath: string;
}) {
  const personal = mode === "personal";
  if (detail) return <LogDetailPage log={detail} basePath={basePath} mode={mode} />;
  return (
    <>
      <Topbar />
      <div className="page-head">
        <div>
          <h1>Logs</h1>
          <p className="sub">{personal ? "Search your local OpenLeash hook history." : "Search hook logs by user, agent, prompt, tool, project, session, or payload."}</p>
        </div>
      </div>
      <div className="divider" />
      <form className="triggerFilters logsFilters" action={dashboardHref(basePath, "/logs")}>
        <label>
          <span>Search</span>
          <div className="searchInput"><Search size={16} /><input name="q" defaultValue={filters.q ?? ""} placeholder="Prompt, file, payload, session..." /></div>
        </label>
        <label>
          <span>{personal ? "Profile" : "User"}</span>
          <input name="user" defaultValue={filters.user ?? ""} placeholder={personal ? "You" : "Avery Chen"} />
          {filters.userId && <input name="userId" type="hidden" defaultValue={filters.userId} />}
        </label>
        <label>
          <span>Agent</span>
          <input name="agent" defaultValue={filters.agent ?? ""} placeholder="Claude Code" />
        </label>
        <label>
          <span>Event</span>
          <select name="event" defaultValue={filters.event ?? ""}>
            <option value="">Any</option>
            <option value="UserPromptSubmit">Prompt</option>
            <option value="PreToolUse">Tool request</option>
            <option value="PostToolUse">Tool result</option>
            <option value="SessionStart">Session start</option>
            <option value="SessionEnd">Session end</option>
          </select>
        </label>
        <label>
          <span>Status</span>
          <select name="decision" defaultValue={filters.decision ?? ""}>
            <option value="">Any</option>
            <option value="ask">Needs approval</option>
            <option value="deny">Denied</option>
            <option value="allow">Allowed</option>
            <option value="passed">Passed</option>
            <option value="logged">Logged only</option>
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
        <button type="submit">Search</button>
      </form>

      <div className="triggerAuditList">
        {logs.map((log) => <LogAuditRow key={log.id} log={log} basePath={basePath} />)}
        {logs.length === 0 && <Empty text="No logs matched this search." />}
      </div>
    </>
  );
}

function LogAuditRow({ log, basePath }: { log: LogItem; basePath: string }) {
  const state = logState(log);
  const title = logActionTitle(log);
  const policies = (log.policy_results ?? []).filter((policy) => policy.status !== "passed");
  return (
    <Link className="triggerAuditRow logAuditRow" href={routeHref(basePath, `/logs/${log.id}`)}>
      <AgentLogo name={log.agent_name ?? log.agent_kind ?? "Agent"} fallback={initials(log.agent_name ?? log.agent_kind ?? "A").slice(0, 1)} size="large" />
      <div className="audit-main">
        <div className="audit-title">{title}</div>
        <div className="audit-meta">
          {log.user_name ?? log.user_email ?? "Unknown user"} · {log.agent_name ?? log.agent_kind ?? "Unknown agent"} · {projectTag(log.project_path ?? undefined) ?? "No project"} · {relativeTime(log.created_at)}
        </div>
        <div className="audit-evidence">
          {policies.length > 0 ? policies.slice(0, 3).map((policy) => policy.policy_name).join(" · ") : log.session_id}
        </div>
      </div>
      <span className={`tag ${state.className}`}><span className="dot" />{state.label}</span>
      <ChevronRight size={18} className="muted" />
    </Link>
  );
}

function LogDetailPage({ log, basePath, mode }: { log: LogItem; basePath: string; mode: DashboardMode }) {
  const transcript = latestLogConversationTurns(log);
  const state = logState(log);
  const policyResults = log.policy_results ?? [];
  const payloadText = safeJson(log.payload);
  const promptTransform = promptTransformFromPayload(log.payload);
  const personal = mode === "personal";
  return (
    <>
      <Topbar />
      <div className="page-head">
        <div>
          <h1>{personal ? "Activity log" : "Log detail"}</h1>
          <p className="sub">{logActionTitle(log)}</p>
        </div>
        <Link className="pill action-pill" href={routeHref(basePath, "/logs")}>Back</Link>
      </div>
      <div className="divider" />

      <div className="detailGrid">
        <section className="detailPanel">
          <div className="detailAgentHeader">
            <AgentLogo name={log.agent_name ?? log.agent_kind ?? "Agent"} fallback={initials(log.agent_name ?? log.agent_kind ?? "A").slice(0, 1)} size="large" />
            <div>
              <strong>{log.agent_name ?? log.agent_kind ?? "Unknown agent"}</strong>
              <span>{log.user_name ?? log.user_email ?? "Unknown user"} · {log.hostname ?? "Unknown endpoint"}</span>
            </div>
          </div>
          <div className="card-title"><h3>What happened</h3><span className={`tag ${state.className}`}><span className="dot" />{state.label}</span></div>
          <dl className="metaGrid">
            <div><dt>User</dt><dd>{log.user_name ?? log.user_email ?? "Unknown"}</dd></div>
            <div><dt>Agent</dt><dd>{log.agent_name ?? log.agent_kind ?? "Unknown"}</dd></div>
            <div><dt>Project</dt><dd>{log.project_path ?? "Unknown"}</dd></div>
            <div><dt>Tool/event</dt><dd>{log.tool_name ?? log.event_name}</dd></div>
            <div><dt>Session</dt><dd>{log.session_id}</dd></div>
            <div><dt>When</dt><dd>{new Date(log.created_at).toLocaleString()}</dd></div>
          </dl>
        </section>

        <section className="detailPanel">
          <div className="card-title"><h3>Policy evaluation</h3></div>
          <div className="policyHitList">
            {policyResults.map((policy) => (
              <article key={`${policy.policy_name}-${policy.status}`}>
                <strong>{policy.policy_name}</strong>
                <span className={`tag ${policy.status === "passed" ? "allowed" : policy.status === "failed" ? "blocked" : "asked"}`}><span className="dot" />{policy.status === "passed" ? "passed" : policy.status}</span>
                <p>{policy.explanation}</p>
                {evidenceItems(policy.evidence).map((item, index) => <code key={`${item}-${index}`}>{item}</code>)}
              </article>
            ))}
            {policyResults.length === 0 && <Empty text="This hook was logged without a policy evaluation." />}
          </div>
        </section>
      </div>

      <section className="detailPanel full">
        <div className="card-title">
          <h3>Conversation context</h3>
          <span className="muted">Latest captured messages</span>
        </div>
        {transcript.map((turn, index) => (
          <div key={index} className="conversationLine">
            <strong>{conversationRoleLabel(turn.role)}{turn.at ? ` · ${relativeTime(turn.at)}` : ""}</strong>
            <p>{turn.content}</p>
          </div>
        ))}
        {transcript.length === 0 && <Empty text="No transcript was included with this hook event." />}
      </section>

      {promptTransform && (
        <section className="detailPanel full">
          <div className="card-title">
            <h3>Prompt transforms</h3>
            <span className={`tag ${promptTransform.blocked ? "blocked" : "allowed"}`}><span className="dot" />{promptTransform.blocked ? "blocked" : "applied"}</span>
          </div>
          <div className="transformLogGrid">
            {promptTransform.compression?.enabled && (
              <div>
                <strong>Compression</strong>
                <span>{formatCount(promptTransform.compression.originalLength)} to {formatCount(promptTransform.compression.compressedLength)} chars · {Math.round((1 - promptTransform.compression.ratio) * 100)}% smaller</span>
              </div>
            )}
            {promptTransform.dlp?.enabled && (
              <div>
                <strong>DLP</strong>
                <span>{promptTransform.dlp.matched ? `${promptTransform.dlp.action}${promptTransform.dlp.masked ? "ed" : ""}: ${promptTransform.dlp.categories.join(", ")}` : "passed"}</span>
              </div>
            )}
          </div>
          {promptTransform.dlp?.findings?.length ? (
            <div className="policyHitList transformFindings">
              {promptTransform.dlp.findings.slice(0, 6).map((finding: { category: string; quote: string; reason: string }, index: number) => (
                <article key={`${finding.category}-${index}`}>
                  <strong>{finding.category.toUpperCase()}</strong>
                  <p>{finding.reason}</p>
                  {finding.quote && <code>{finding.quote}</code>}
                </article>
              ))}
            </div>
          ) : null}
        </section>
      )}

      <section className="detailPanel full">
        <div className="card-title"><h3>Raw hook payload</h3></div>
        <pre className="payloadBlock">{payloadText}</pre>
      </section>
    </>
  );
}

function logState(log: LogItem) {
  const failed = (log.policy_results ?? []).some((policy) => policy.status === "failed");
  const asked = (log.policy_results ?? []).some((policy) => policy.status === "needs_question");
  if (log.resolution === "deny" || log.decision === "deny" || failed) return { label: "blocked", className: "blocked" };
  if (log.decision === "ask" || asked) return { label: "needs approval", className: "asked" };
  if (log.decision === "allow") return { label: "passed", className: "allowed" };
  return { label: "logged", className: "neutral" };
}

function logActionTitle(log: LogItem) {
  const tool = String(log.tool_name ?? "").trim();
  const path = toolTargetPath(log);
  if (tool) {
    const verb = toolActionVerb(tool);
    return path ? `${verb} ${path}` : `${verb} with ${tool}`;
  }
  const prompt = String(log.prompt ?? "").replace(/\s+/g, " ").trim();
  if (prompt) return prompt.slice(0, 140);
  return eventLabel(log.event_name);
}

function toolActionVerb(tool: string) {
  const normalized = tool.toLowerCase();
  if (normalized.includes("read")) return "Reading";
  if (normalized.includes("write") || normalized.includes("edit") || normalized.includes("patch")) return "Editing";
  if (normalized.includes("bash") || normalized.includes("shell")) return "Running command";
  if (normalized.includes("grep") || normalized.includes("glob") || normalized.includes("search")) return "Searching";
  return "Using";
}

function toolTargetPath(log: LogItem) {
  const payload = log.payload && typeof log.payload === "object" ? log.payload as Record<string, unknown> : {};
  const raw = payload.raw && typeof payload.raw === "object" ? payload.raw as Record<string, unknown> : {};
  const toolInput = raw.tool_input && typeof raw.tool_input === "object" ? raw.tool_input as Record<string, unknown> : {};
  const event = payload.event && typeof payload.event === "object" ? payload.event as Record<string, unknown> : {};
  const eventTool = event.tool && typeof event.tool === "object" ? event.tool as Record<string, unknown> : {};
  const input = eventTool.input && typeof eventTool.input === "object" ? eventTool.input as Record<string, unknown> : {};
  const candidate = toolInput.file_path ?? toolInput.path ?? toolInput.command ?? input.file_path ?? input.path ?? input.command;
  return typeof candidate === "string" && candidate.trim() ? candidate.trim() : undefined;
}

function eventLabel(value: string) {
  return value.replace(/([a-z])([A-Z])/g, "$1 $2");
}

function latestLogConversationTurns(log: LogItem): ConversationTurnView[] {
  const turns = transcriptFromPayload(log.payload).slice(-5);
  const prompt = log.prompt?.trim();
  if (!prompt) return turns;
  const duplicate = turns.some((turn) => turn.role === "user" && turn.content.trim() === prompt);
  return duplicate ? turns : [...turns, { role: "user", content: prompt, at: log.occurred_at }].slice(-5);
}

function safeJson(value: unknown) {
  try {
    return JSON.stringify(value ?? {}, null, 2);
  } catch {
    return "{}";
  }
}

function promptTransformFromPayload(value: unknown) {
  if (!value || typeof value !== "object") return undefined;
  const payload = value as { openleashPromptTransform?: unknown };
  const transform = payload.openleashPromptTransform;
  if (!transform || typeof transform !== "object") return undefined;
  const record = transform as any;
  return {
    blocked: Boolean(record.blocked),
    compression: record.compression && typeof record.compression === "object" ? {
      enabled: Boolean(record.compression.enabled),
      originalLength: Number(record.compression.originalLength || 0),
      compressedLength: Number(record.compression.compressedLength || 0),
      ratio: Number(record.compression.ratio || 1)
    } : undefined,
    dlp: record.dlp && typeof record.dlp === "object" ? {
      enabled: Boolean(record.dlp.enabled),
      action: String(record.dlp.action || "mask"),
      matched: Boolean(record.dlp.matched),
      masked: Boolean(record.dlp.masked),
      categories: Array.isArray(record.dlp.categories) ? record.dlp.categories.map(String) : [],
      findings: Array.isArray(record.dlp.findings) ? record.dlp.findings.map((finding: any) => ({
        category: String(finding?.category || "dlp"),
        quote: String(finding?.quote || ""),
        reason: String(finding?.reason || "")
      })) : []
    } : undefined
  };
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
  if (text.includes("claude")) return { src: "/agents/claude.png" };
  if (text.includes("antigravity")) return { src: "/agents/antigravity.png" };
  if (text.includes("cline")) return { src: "/agents/cline.png" };
  if (text.includes("opencode") || text.includes("open code")) return { src: "/agents/opencode.png" };
  if (text.includes("cursor")) return { src: "/agents/cursor.png" };
  if (text.includes("codex")) return { src: "/agents/codex.png" };
  if (text.includes("chatgpt") || text.includes("chat gpt")) return { src: "/agents/chatgpt.png" };
  if (text.includes("salesforce") || text.includes("agentforce")) return { src: `${base}/salesforce.svg` };
  if (text.includes("azure") || text.includes("foundry")) return { src: `${base}/microsoftazure.svg` };
  if (text.includes("copilot") || text.includes("agent 365")) return { src: `${base}/microsoftcopilot.svg` };
  if (text.includes("bedrock") || text.includes("agentcore") || text.includes("aws")) return { src: `${base}/amazonaws.svg` };
  if (text.includes("vertex") || text.includes("gemini enterprise")) return { src: `${base}/googlecloud.svg` };
  if (text.includes("n8n")) return { src: `${base}/n8n.svg` };
  if (text.includes("zapier")) return { src: `${base}/zapier.svg` };
  if (text.includes("openai")) return { src: "/agents/codex.png" };
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

function formatCount(value: string | number | undefined | null) {
  return numeric(value).toLocaleString();
}

function formatCompactNumber(value: string | number | undefined | null) {
  const number = numeric(value);
  if (number >= 1_000_000) return `${(number / 1_000_000).toFixed(number >= 10_000_000 ? 0 : 1)}M`;
  if (number >= 1_000) return `${(number / 1_000).toFixed(number >= 10_000 ? 0 : 1)}K`;
  return formatCount(number);
}

function formatCurrencyCents(value: string | number | undefined | null) {
  const cents = numeric(value);
  if (!cents) return "$0";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: cents < 1000 ? 2 : 0 }).format(cents / 100);
}

function aggregateSecurityPlugins(rows: SecurityData["byPlugin"]) {
  const grouped = new Map<string, { pluginId: string; count: number; high: number; kinds: string[] }>();
  for (const row of rows) {
    const pluginId = row.plugin_id;
    const current = grouped.get(pluginId) ?? { pluginId, count: 0, high: 0, kinds: [] };
    current.count += numeric(row.count);
    if (row.severity === "high" || row.severity === "critical") current.high += numeric(row.count);
    if (!current.kinds.includes(row.kind)) current.kinds.push(row.kind);
    grouped.set(pluginId, current);
  }
  return [...grouped.values()].sort((left, right) => right.high - left.high || right.count - left.count);
}

function signalToOutcomeView(signal: SecurityData["signals"][number]): NonNullable<SecurityData["outcomes"]>[number] {
  return {
    id: signal.id,
    domain: signal.kind === "secret.detected" ? "data_protection" : signal.kind === "mcp.discovery" || signal.kind === "tool.risk" ? "tool_risk" : "security",
    title: signal.title,
    summary: signal.summary,
    severity: signal.severity,
    status: signal.status || signal.decision || "observed",
    decision: signal.decision,
    occurredAt: signal.occurred_at || signal.created_at,
    createdAt: signal.created_at,
    source: { pluginId: signal.plugin_id, label: outcomeSourceLabel(signal.plugin_id), kind: signal.kind },
    subject: signal.target,
    actor: { userId: signal.user_id, name: signal.user_name, email: signal.user_email },
    agent: { kind: signal.agent_kind, name: signal.agent_name, hostname: signal.hostname },
    context: {
      evaluationId: signal.evaluation_id,
      eventName: signal.event_name,
      toolName: signal.tool_name,
      projectPath: signal.project_path,
      correlationKeys: signal.correlation_keys
    },
    evidence: [],
    details: signal.details
  };
}

function outcomeSourceLabel(pluginId: string | undefined | null) {
  const value = String(pluginId ?? "").trim();
  if (value === "openleash.security-evaluator") return "Security Evaluation";
  if (value === "openleash.dlp") return "Data Protection";
  if (value === "openleash.mcp-scanner") return "MCP and Tool Risk";
  if (value === "openleash.skill-scanner") return "Skill Review";
  if (value === "openleash.prompt-compression") return "Token Savings";
  return pluginName(value);
}

function pluginName(pluginId: string | undefined | null) {
  const value = String(pluginId ?? "").trim();
  if (!value) return "openleash";
  return value.replace(/^openleash\./, "").replace("prompt-compression", "token-saver").replace("dlp", "data-leakage-prevention");
}

function providerName(value: string | undefined | null) {
  if (value === "openai") return "OpenAI";
  if (value === "anthropic") return "Claude";
  if (value === "cursor") return "Cursor";
  return value ? sentenceTitle(value) : "Provider";
}

function providerUsageDateLabel(rangeLabel: string) {
  if (rangeLabel.toLowerCase() === "all") return "Last 180 days";
  return `Last ${rangeLabel}`;
}

function providerModelMetric(row: ProviderUsageAggregate) {
  return numeric(row.request_count) || numeric(row.token_count) || numeric(row.cost_cents);
}

function usageShare(row: { request_count?: string | number; token_count?: string | number; cost_cents?: string | number }, summary: ProviderUsageData["summary"]) {
  const value = numeric(row.request_count) || numeric(row.token_count) || numeric(row.cost_cents);
  const total = numeric(summary?.request_count) || numeric(summary?.token_count) || numeric(summary?.total_cost_cents);
  if (!value || !total) return 0;
  return Math.max(1, Math.min(99, Math.round((value / total) * 100)));
}

function modelColor(index: number) {
  return ["#4f46c7", "#7450c8", "#8f79cd", "#5f8fcf", "#2f73c0", "#79a7cc", "#15947f", "#c58c21", "#c65a5a"][index % 9];
}

function modelDonutGradient(rows: ProviderUsageAggregate[]) {
  if (rows.length === 0) return "conic-gradient(#e5e7eb 0 100%)";
  const total = rows.reduce((sum, row) => sum + providerModelMetric(row), 0) || 1;
  let cursor = 0;
  const stops = rows.slice(0, 9).map((row, index) => {
    const start = cursor;
    cursor += (providerModelMetric(row) / total) * 100;
    return `${modelColor(index)} ${start.toFixed(2)}% ${cursor.toFixed(2)}%`;
  });
  return `conic-gradient(${stops.join(", ")})`;
}

function trendPoints(values: Array<string | number | undefined | null>) {
  const normalized = values.map(numeric).filter((value) => Number.isFinite(value));
  if (normalized.length >= 2 && normalized.some((value) => value > 0)) return normalized.slice(-6);
  if (normalized.length === 1 && normalized[0] > 0) {
    const value = normalized[0];
    return [Math.max(0, value * .35), value * .52, value * .48, value * .78, value * .7, value];
  }
  return [12, 18, 15, 24, 20, 28];
}

function decisionBuckets(events: Overview["recent"]) {
  const buckets = [0, 0, 0, 0, 0, 0];
  for (const [index, event] of events.slice(0, 60).entries()) {
    const bucket = Math.min(5, Math.floor(index / 10));
    buckets[5 - bucket] += event.decision === "deny" ? 2 : event.decision === "ask" ? 1.5 : 1;
  }
  return buckets;
}

function timeBuckets(values: Array<string | undefined | null>) {
  const buckets = [0, 0, 0, 0, 0, 0];
  const now = Date.now();
  const bucketMs = 4 * 60 * 60 * 1000;
  for (const value of values) {
    const time = value ? new Date(value).getTime() : 0;
    if (!time) continue;
    const age = Math.max(0, now - time);
    const bucket = Math.min(5, Math.floor(age / bucketMs));
    buckets[5 - bucket] += 1;
  }
  return buckets;
}

function aggregateAgents(agents: Overview["agents"]) {
  const grouped = new Map<string, {
    key: string;
    displayName: string;
    kind: string;
    version?: string;
    users: number;
    installs: number;
    userNames: Set<string>;
    hostnames: Set<string>;
    sessions: NonNullable<Overview["agents"][number]["sessions"]>;
  }>();
  for (const agent of agents) {
    const key = agentProductKey(agent);
    if (hiddenOverviewAgentKeys.has(key)) continue;
    const current = grouped.get(key) ?? {
      key,
      displayName: agentProductName(agent),
      kind: agentProductKind(agent),
      version: agent.version,
      users: 0,
      installs: 0,
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
    sessions: agent.sessions.sort((a, b) => new Date(b.last_activity_at ?? 0).getTime() - new Date(a.last_activity_at ?? 0).getTime())
  }));
}

function overviewAgents(agents: Overview["agents"], users: UserRow[]) {
  const actual = aggregateAgents(agents);
  const byKey = new Map(actual.map((agent) => [agent.key, agent]));
  for (const user of users) {
    const detectedAgents = Array.isArray(user.agents) ? user.agents : [];
    const userName = user.display_name || user.email || "Unknown user";
    const hostnames = Array.isArray(user.hostnames) ? user.hostnames.filter(Boolean) : [];
    const endpointCount = Math.max(hostnames.length, numeric(user.endpoint_count));
    for (const agentName of detectedAgents) {
      const key = agentProductKey({ kind: agentName, display_name: agentName } as Overview["agents"][number]);
      if (hiddenOverviewAgentKeys.has(key)) continue;
      const current = byKey.get(key) ?? {
        key,
        displayName: agentProductName({ kind: agentName, display_name: agentName } as Overview["agents"][number]),
        kind: agentProductKind({ kind: agentName, display_name: agentName } as Overview["agents"][number]),
        users: 0,
        installs: 0,
        userNames: new Set<string>(),
        hostnames: new Set<string>(),
        sessions: []
      };
      current.userNames.add(userName);
      for (const hostname of hostnames) current.hostnames.add(hostname);
      current.installs = Math.max(current.installs, endpointCount || current.hostnames.size || 1);
      current.users = current.userNames.size;
      byKey.set(key, current);
    }
  }
  for (const product of supportedAgentProducts) {
    if (byKey.has(product.key)) continue;
    byKey.set(product.key, {
      ...product,
      users: 0,
      installs: 0,
      userNames: new Set<string>(),
      hostnames: new Set<string>(),
      sessions: []
    });
  }
  return Array.from(byKey.values()).sort((a, b) => {
    a.users = a.userNames.size;
    b.users = b.userNames.size;
    a.installs = Math.max(a.installs, a.hostnames.size);
    b.installs = Math.max(b.installs, b.hostnames.size);
    const activityDelta = b.installs - a.installs || b.users - a.users;
    if (activityDelta !== 0) return activityDelta;
    return supportedAgentOrder(a.key) - supportedAgentOrder(b.key);
  });
}

function supportedAgentOrder(key: string) {
  const index = supportedAgentProducts.findIndex((agent) => agent.key === key);
  return index === -1 ? supportedAgentProducts.length : index;
}

function agentProductKey(agent: Overview["agents"][number]) {
  const text = `${agent.kind} ${agent.display_name}`.toLowerCase();
  if (text.includes("claude")) return "claude-code";
  if (text.includes("codex") || text.includes("openai")) return "openai-codex";
  if (text.includes("cline")) return "cline";
  if (text.includes("opencode") || text.includes("open code")) return "opencode";
  if (text.includes("cursor")) return "cursor";
  if (text.includes("antigravity")) return "antigravity";
  if (text.includes("gemini")) return "gemini";
  if (text.includes("windsurf")) return "windsurf";
  if (text.includes("aider")) return "aider";
  return (agent.kind || agent.display_name || "unknown").toLowerCase();
}

function agentProductName(agent: Overview["agents"][number]) {
  const key = agentProductKey(agent);
  if (key === "claude-code") return "Claude Code";
  if (key === "openai-codex") return "OpenAI Codex";
  if (key === "cline") return "Cline";
  if (key === "opencode") return "OpenCode";
  if (key === "cursor") return "Cursor";
  if (key === "gemini") return "Gemini";
  if (key === "antigravity") return "Antigravity";
  if (key === "windsurf") return "Windsurf";
  if (key === "aider") return "Aider";
  return agent.display_name;
}

function agentProductKind(agent: Overview["agents"][number]) {
  const key = agentProductKey(agent);
  if (key === "claude-code") return "claude-code";
  if (key === "openai-codex") return "codex";
  if (key === "opencode") return "opencode";
  return agent.kind;
}

function emailFor(name: string) {
  return name.includes("@") ? name : "";
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

function decisionLabel(value: string) {
  if (value === "allow") return "allowed";
  if (value === "deny") return "denied";
  if (value === "ask") return "waiting for approval";
  return value;
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
