"use client";

import { useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { apiFetch } from "../lib/api-client";
import type { OnboardingData } from "./EnterpriseOnboarding";

export function DashboardRoleSettings({
  apiUrl,
  initialData,
  organizationSlug
}: {
  apiUrl: string;
  initialData: OnboardingData | null;
  organizationSlug?: string;
}) {
  const users = initialData?.users ?? [];
  const initialAdmins = useMemo(() => {
    const assigned = (initialData?.roles ?? [])
      .filter((role) => role.role === "admin" && role.user_id)
      .map((role) => role.user_id as string);
    const existingAdmins = users
      .filter((user) => ["admin", "owner"].includes(String(user.role ?? "").toLowerCase()))
      .map((user) => user.id);
    return new Set([...assigned, ...existingAdmins]);
  }, [initialData?.roles, users]);
  const [admins, setAdmins] = useState(() => initialAdmins);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function save() {
    setBusy(true);
    setMessage("");
    const query = organizationSlug ? `?organizationSlug=${encodeURIComponent(organizationSlug)}` : "";
    const response = await apiFetch(`${apiUrl}/admin/onboarding/rbac${query}`, "adminOnboardingWrite", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        organizationSlug,
        roles: [...admins].map((userId) => ({ userId, role: "admin" }))
      })
    });
    const payload = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) {
      setMessage(payload.error ?? "Could not save dashboard administrators.");
      return;
    }
    setMessage("Dashboard administrators saved.");
    window.location.reload();
  }

  function toggle(userId: string, checked: boolean) {
    const next = new Set(admins);
    if (checked) next.add(userId);
    else next.delete(userId);
    setAdmins(next);
  }

  return (
    <section className="setupPanel" id="roles">
      <div className="setupPanelHead">
        <div>
          <h3>Roles</h3>
          <p className="setupCopy compact">Choose who can log in and manage this dashboard. Regular employees are only managed endpoints; they do not get dashboard access.</p>
        </div>
        <span className="tag asked"><span className="dot" />administrator</span>
      </div>
      {users.length === 0 ? (
        <div className="setupNotice">Connect an identity provider first. Synced users will appear here.</div>
      ) : (
        <div className="roleUserList">
          {users.map((user) => (
            <label key={user.id} className="roleUserRow">
              <span className="avatar-sm">{initials(user.display_name || user.email)}</span>
              <span>
                <strong>{user.display_name || user.email}</strong>
                <small>{user.email}{user.title ? ` · ${user.title}` : ""}</small>
              </span>
              <em>{String(user.role ?? "").toLowerCase() === "owner" ? "Owner" : "Administrator"}</em>
              <input type="checkbox" checked={admins.has(user.id)} disabled={String(user.role ?? "").toLowerCase() === "owner"} onChange={(event) => toggle(user.id, event.target.checked)} />
            </label>
          ))}
        </div>
      )}
      {message && <div className={message.includes("saved") ? "setupNotice" : "setupNotice danger"}>{message}</div>}
      <div className="setupActions">
        <button type="button" onClick={save} disabled={busy || users.length === 0}><ShieldCheck size={16} /> {busy ? "Saving" : "Save administrators"}</button>
      </div>
    </section>
  );
}

function initials(value: string) {
  return value
    .split(/\s+|@/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
