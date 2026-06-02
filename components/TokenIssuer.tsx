"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import { apiFetch } from "../lib/api-client";

export function TokenIssuer({ apiUrl }: { apiUrl: string }) {
  const [email, setEmail] = useState("max.brin@openleash.com");
  const [displayName, setDisplayName] = useState("Max Brin");
  const [token, setToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      const response = await apiFetch(`${apiUrl}/admin/users`, "adminUsersWrite", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, displayName, role: "engineer" })
      });
      const body = await response.json();
      setToken(body.token ?? body.error ?? "Unable to generate token");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="tokenBox">
      <div className="tokenTitle">
        <KeyRound size={18} />
        <strong>User token</strong>
      </div>
      <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} aria-label="Display name" />
      <input value={email} onChange={(event) => setEmail(event.target.value)} aria-label="Email" />
      <button type="button" onClick={submit} disabled={busy}>{busy ? "Generating" : "Generate"}</button>
      {token && <code>{token}</code>}
    </section>
  );
}
