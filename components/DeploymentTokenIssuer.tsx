"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import { apiFetch } from "../lib/api-client";

export function DeploymentTokenIssuer({ apiUrl }: { apiUrl: string }) {
  const [label, setLabel] = useState("Production MDM rollout");
  const [tenantUrl, setTenantUrl] = useState("openleash.com");
  const [mdm, setMdm] = useState("Jamf Pro");
  const [mode, setMode] = useState<"cloud" | "private">("cloud");
  const [command, setCommand] = useState("");
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);

  async function generate() {
    setBusy(true);
    try {
      const response = await apiFetch(`${apiUrl}/admin/deployment-tokens`, "adminDeploymentTokensWrite", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ label, tenantUrl, mdm, mode, expiresInDays: 30 })
      });
      const body = await response.json();
      setToken(body.token ?? body.error ?? "");
      setCommand(body.command ?? "");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="tokenBox deployTokenBox">
      <div className="tokenTitle">
        <KeyRound size={18} />
        <strong>Deployment token</strong>
      </div>
      <div className="fieldGrid">
        <label>
          <span>Label</span>
          <input value={label} onChange={(event) => setLabel(event.target.value)} />
        </label>
        <label>
          <span>Tenant</span>
          <input value={tenantUrl} onChange={(event) => setTenantUrl(event.target.value)} />
        </label>
        <label>
          <span>MDM</span>
          <select value={mdm} onChange={(event) => setMdm(event.target.value)}>
            <option>Jamf Pro</option>
            <option>Kandji</option>
            <option>Microsoft Intune</option>
            <option>Workspace ONE</option>
          </select>
        </label>
        <label>
          <span>Edition</span>
          <select value={mode} onChange={(event) => setMode(event.target.value === "private" ? "private" : "cloud")}>
            <option value="cloud">OpenLeash Cloud</option>
            <option value="private">OpenLeash Private</option>
          </select>
        </label>
      </div>
      <button type="button" onClick={generate} disabled={busy}>{busy ? "Generating" : "Generate deployment command"}</button>
      {command && <pre>{command}</pre>}
      {token && <code>{token}</code>}
    </section>
  );
}
