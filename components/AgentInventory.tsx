"use client";

import { useEffect, useMemo, useState } from "react";

export type AgentInventoryCard = {
  key: string;
  displayName: string;
  kind: string;
  version?: string;
  users: number;
  installs: number;
  events: Array<{
    id: string;
    href: string;
    project: string;
    title: string;
    context: string;
    when: string;
  }>;
  usersList: Array<{
    key: string;
    name: string;
    hostname: string;
    lastSeen: string;
    sessions: number;
    logsHref: string;
  }>;
};

export function AgentInventory({ agents }: { agents: AgentInventoryCard[] }) {
  const [selectedKey, setSelectedKey] = useState<string | null>(() => agents[0]?.key ?? null);
  const selected = useMemo(
    () => agents.find((agent) => agent.key === selectedKey) ?? null,
    [agents, selectedKey]
  );

  useEffect(() => {
    if (selectedKey && !agents.some((agent) => agent.key === selectedKey)) {
      setSelectedKey(agents[0]?.key ?? null);
    }
  }, [agents, selectedKey]);

  return (
    <>
      <div className="cards agentsSelectableGrid">
        {agents.map((agent) => (
          <article
            key={agent.key}
            className={`agent-card ${selectedKey === agent.key ? "selected" : ""}`}
            role="button"
            tabIndex={0}
            aria-expanded={selectedKey === agent.key}
            onClick={() => setSelectedKey(agent.key)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setSelectedKey(agent.key);
              }
            }}
          >
            <div className="agent-head">
              <AgentLogo name={agent.displayName} />
              <div>
                <div className="agent-name">{agent.displayName}</div>
                <div className="agent-vendor">{agent.kind}{agent.version ? ` · ${agent.version}` : ""}</div>
              </div>
            </div>
            <div className="agent-stats">
              <div className="agent-stat">
                <div className="v">{agent.users}</div>
                <div className="l">Users</div>
              </div>
              <div className="agent-stat">
                <div className="v">{agent.installs}</div>
                <div className="l">Installs</div>
              </div>
            </div>
            <div className="agent-event-list">
              {agent.events.map((event) => (
                <a className="agent-event-line" href={event.href} key={event.id} onClick={(clickEvent) => clickEvent.stopPropagation()}>
                  <div className="agent-event-project">{event.project}</div>
                  <strong>{event.title}</strong>
                  <span>{event.context}</span>
                  <em>{event.when}</em>
                </a>
              ))}
              {agent.events.length === 0 && <span className="muted-small">No notable actions captured yet.</span>}
            </div>
            <span className="tag allowed"><span className="dot" />Protected</span>
          </article>
        ))}
      </div>

      {selected && (
        <section className="agentUsersPanel" aria-live="polite">
          <div className="agentUsersHead">
            <div>
              <h3>{selected.displayName} Users</h3>
              <p>{selected.users} user{selected.users === 1 ? "" : "s"} · {selected.installs} install{selected.installs === 1 ? "" : "s"}</p>
            </div>
            <button type="button" className="ghostIconButton" onClick={() => setSelectedKey(null)} aria-label="Close users list">×</button>
          </div>
          <div className="agentUsersList">
            {selected.usersList.map((user) => {
              const avatar = avatarFor(user.name);
              return (
                <a className="agentUserRow" href={user.logsHref} key={user.key}>
                  <span className="avatar-sm" style={{ background: avatar.bg, color: avatar.fg }}>{initials(user.name)}</span>
                  <span className="agentUserMain">
                    <strong>{user.name}</strong>
                    <span>{user.hostname || "No endpoint"} · {user.sessions} session{user.sessions === 1 ? "" : "s"}</span>
                  </span>
                  <span className="agentUserSeen">{user.lastSeen}</span>
                </a>
              );
            })}
            {selected.usersList.length === 0 && <p className="empty">No users reported this agent yet.</p>}
          </div>
        </section>
      )}
    </>
  );
}

function AgentLogo({ name }: { name: string }) {
  const source = agentLogoSource(name);
  return (
    <span className="agent-logo large">
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
