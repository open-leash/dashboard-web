"use client";

import { useMemo, useState } from "react";

export type UserRosterItem = {
  id: string;
  name: string;
  email: string;
  department: string;
  title: string;
  endpointCount: number;
  agentCount: number;
  agents: string[];
  hostnames: string[];
  lastSeen: string;
  logsHref: string;
};

export function UserRoster({ users }: { users: UserRosterItem[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "covered" | "missing">("all");
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return users.filter((user) => {
      const covered = user.endpointCount > 0;
      if (status === "covered" && !covered) return false;
      if (status === "missing" && covered) return false;
      if (!needle) return true;
      return [
        user.name,
        user.email,
        user.department,
        user.title,
        user.hostnames.join(" "),
        user.agents.join(" ")
      ].join("\n").toLowerCase().includes(needle);
    });
  }, [pageSize, query, status, users]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * pageSize;
  const visible = filtered.slice(start, start + pageSize);

  function resetPage() {
    setPage(1);
  }

  return (
    <section className="rosterPanel">
      <div className="rosterToolbar">
        <label className="searchInput rosterSearch">
          <span>Search</span>
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              resetPage();
            }}
            placeholder="Name, email, team, agent, endpoint..."
          />
        </label>
        <label className="compactSelect">
          <span>Status</span>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as "all" | "covered" | "missing");
              resetPage();
            }}
          >
            <option value="all">All users</option>
            <option value="covered">Client active</option>
            <option value="missing">Needs rollout</option>
          </select>
        </label>
        <label className="compactSelect">
          <span>Rows</span>
          <select
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value));
              resetPage();
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </label>
      </div>

      <div className="rosterSummary">
        Showing {visible.length === 0 ? 0 : start + 1}-{Math.min(start + visible.length, filtered.length)} of {filtered.length} users
      </div>

      <div className="userRoster">
        {visible.map((user) => <UserRosterRow key={user.id} user={user} />)}
        {visible.length === 0 && <p className="empty">{users.length === 0 ? "No users synced yet." : "No users match this search."}</p>}
      </div>

      <div className="pager">
        <button type="button" onClick={() => setPage(Math.max(1, safePage - 1))} disabled={safePage <= 1}>Previous</button>
        <span>Page {safePage} of {pageCount}</span>
        <button type="button" onClick={() => setPage(Math.min(pageCount, safePage + 1))} disabled={safePage >= pageCount}>Next</button>
      </div>
    </section>
  );
}

function UserRosterRow({ user }: { user: UserRosterItem }) {
  const clientInstalled = user.endpointCount > 0;
  const status = clientInstalled ? "covered" : "not-deployed";
  const avatar = avatarFor(user.name);
  return (
    <article className="user-row">
      <span className="avatar-sm user-avatar" style={{ background: avatar.bg, color: avatar.fg }}>{initials(user.name)}</span>
      <div className="user-main">
        <div className="user-name">{user.name}</div>
        <div className="user-meta">{user.email} · {user.department} · {user.title}</div>
      </div>
      <div className="coverage-stack">
        <span className={`coverage ${status}`}><span className="dot" />{clientInstalled ? "client active" : "client missing"}</span>
        <span className="coverage-note">{clientInstalled ? "OpenLeash client checked in" : "waiting for client install"}</span>
      </div>
      <div className="agent-icons">
        {user.agents.slice(0, 4).map((name) => <AgentBadge key={name} name={name} />)}
        {user.agents.length === 0 && <span className="mutedText">No agents</span>}
      </div>
      <div className="endpoint-cell">
        <strong>{user.endpointCount}</strong>
        <span>{user.hostnames[0] ?? "No endpoint"}</span>
      </div>
      <div className="last-seen">{user.lastSeen}</div>
      <a className="pill action-pill userLogsLink" href={user.logsHref}>Logs</a>
    </article>
  );
}

function AgentBadge({ name }: { name: string }) {
  const source = agentLogoSource(name);
  return (
    <span className="agent-logo small">
      {source ? <img src={source} alt="" /> : initials(name).slice(0, 1)}
    </span>
  );
}

function agentLogoSource(name: string) {
  const text = name.toLowerCase();
  if (text.includes("claude")) return "/agents/claude.png";
  if (text.includes("codex") || text.includes("openai")) return "/agents/codex.png";
  if (text.includes("cline")) return "/agents/cline.png";
  if (text.includes("opencode") || text.includes("open code")) return "/agents/opencode.png";
  if (text.includes("cursor")) return "/agents/cursor.png";
  if (text.includes("gemini")) return "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/googlegemini.svg";
  if (text.includes("antigravity")) return "/agents/antigravity.png";
  return undefined;
}

function initials(name: string) {
  return name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function avatarFor(key: string) {
  const palette = [
    { bg: "#fbe6c1", fg: "#8a5a1d" },
    { bg: "#dbe5fb", fg: "#2a44a6" },
    { bg: "#f6d6d2", fg: "#a23a32" },
    { bg: "#d6efde", fg: "#117552" },
    { bg: "#efdcfb", fg: "#5a2a9c" },
    { bg: "#d2eef6", fg: "#1c6a85" }
  ];
  return palette[(key.charCodeAt(0) + key.length) % palette.length];
}
