"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronRight, KeyRound } from "lucide-react";
import { DeploymentTokenIssuer } from "./DeploymentTokenIssuer";
import { TokenIssuer } from "./TokenIssuer";
import { IdentityProviderSetup, type OnboardingData } from "./EnterpriseOnboarding";
import { OrganizationSetupPanel } from "./OrganizationSetupPanel";
import { DashboardRoleSettings } from "./DashboardRoleSettings";
import { apiFetch } from "../lib/api-client";

export type SettingsItem = "organization" | "identity" | "roles" | "tokens" | "providers" | "deploy";

export function SettingsTree({ basePath, initialItem }: { basePath: string; initialItem?: string }) {
  const activeItem = useActiveSettingsItem(initialItem);
  const settingsPath = `${basePath}/settings`;
  return (
    <div className="navSubtree" aria-label="Settings sections">
      <SettingsTreeItem active={activeItem === "organization"} href={`${settingsPath}?item=organization`} label="Organization" />
      <SettingsTreeItem active={activeItem === "identity"} href={`${settingsPath}?item=identity`} label="Identity provider" />
      <SettingsTreeItem active={activeItem === "roles"} href={`${settingsPath}?item=roles`} label="Roles" />
      <SettingsTreeItem active={activeItem === "tokens"} href={`${settingsPath}?item=tokens`} label="Tokens" />
      <SettingsTreeItem active={activeItem === "providers"} href={`${settingsPath}?item=providers`} label="Provider usage" />
      <SettingsTreeItem active={activeItem === "deploy"} href={`${settingsPath}?item=deploy`} label="Deploy" />
    </div>
  );
}

export function DashboardSettingsPane({
  apiUrl,
  onboardingData,
  tenantDomain,
  basePath,
  organizationSlug,
  initialItem
}: {
  apiUrl: string;
  onboardingData: OnboardingData;
  tenantDomain: string;
  basePath: string;
  organizationSlug?: string;
  initialItem?: string;
}) {
  const activeItem = useActiveSettingsItem(initialItem);
  return (
    <div className="settingsPane">
      {activeItem === "organization" && <OrganizationSetupPanel apiUrl={apiUrl} onboardingData={onboardingData} tenantDomain={tenantDomain} basePath={basePath} organizationSlug={organizationSlug} variant="settings" showTaskCards={false} />}
      {activeItem === "identity" && <IdentityProviderSetup apiUrl={apiUrl} initialData={onboardingData} organizationSlug={organizationSlug} />}
      {activeItem === "roles" && <DashboardRoleSettings apiUrl={apiUrl} initialData={onboardingData} organizationSlug={organizationSlug} />}
      {activeItem === "tokens" && <TokensSettingsPanel apiUrl={apiUrl} />}
      {activeItem === "providers" && <ProviderUsageSettingsPanel apiUrl={apiUrl} organizationSlug={organizationSlug} />}
      {activeItem === "deploy" && (
        <section className="setupPanel">
          <div className="setupPanelHead">
            <div>
              <h3>Deploy</h3>
              <p className="setupCopy compact">Create a deployment token for MDM enrollment. The tray app uses it to enroll endpoints into this organization.</p>
            </div>
          </div>
          <DeploymentTokenIssuer apiUrl={apiUrl} />
        </section>
      )}
    </div>
  );
}

function ProviderUsageSettingsPanel({ apiUrl, organizationSlug }: { apiUrl: string; organizationSlug?: string }) {
  const [provider, setProvider] = useState("cursor");
  const [label, setLabel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [budgetProvider, setBudgetProvider] = useState("all");
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const query = organizationSlug ? `?organizationSlug=${encodeURIComponent(organizationSlug)}` : "";

  async function submit() {
    setSaving(true);
    setMessage("Checking provider key...");
    try {
      const response = await apiFetch(`${apiUrl}/admin/provider-usage/connections${query}`, "adminProviderUsageWrite", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ provider, label, apiKey })
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || body.ok === false) {
        setMessage(body.message || body.error || "Provider key did not validate.");
        return;
      }
      setApiKey("");
      setMessage(`${providerLabel(provider)} connected. Usage will sync on the next run.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not connect provider.");
    } finally {
      setSaving(false);
    }
  }

  async function runSync() {
    setSaving(true);
    setMessage("Running usage sync...");
    try {
      const response = await apiFetch(`${apiUrl}/admin/provider-usage/sync${query}`, "adminProviderUsageSync", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ provider, triggeredBy: "dashboard" })
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || body.ok === false) {
        setMessage(body.error || body.failed?.[0]?.error || "Sync finished with errors.");
        return;
      }
      const records = (body.synced ?? []).reduce((sum: number, item: { events?: number }) => sum + Number(item.events ?? 0), 0);
      setMessage(`Synced ${records.toLocaleString()} usage records.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not run sync.");
    } finally {
      setSaving(false);
    }
  }

  async function saveBudget() {
    setSaving(true);
    setMessage("Saving budget...");
    try {
      const response = await apiFetch(`${apiUrl}/admin/provider-usage/budgets${query}`, "adminProviderUsageWrite", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          provider: budgetProvider === "all" ? undefined : budgetProvider,
          monthlyBudgetCents: Math.round(Number(monthlyBudget || 0) * 100)
        })
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || body.ok === false) {
        setMessage(body.error || "Could not save budget.");
        return;
      }
      setMessage("Monthly budget saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save budget.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="setupPanel">
      <div className="setupPanelHead">
        <div>
          <h3>Provider usage</h3>
          <p className="setupCopy compact">Connect organization admin keys for Cursor, OpenAI, and Claude to sync usage, tokens, and cost into the Usage tab.</p>
        </div>
      </div>
      <div className="transformSettings">
        <section className="transformPanel">
          <div className="transformPanelHead">
            <div>
              <h2>Management key</h2>
              <p>Keys are validated immediately and stored encrypted for scheduled sync.</p>
            </div>
            <KeyRound size={20} />
          </div>
          <div className="transformFields">
            <label>Provider
              <select value={provider} onChange={(event) => setProvider(event.target.value)}>
                <option value="cursor">Cursor</option>
                <option value="openai">OpenAI</option>
                <option value="anthropic">Claude</option>
              </select>
            </label>
            <label>Label
              <input value={label} onChange={(event) => setLabel(event.target.value)} placeholder={providerLabel(provider)} />
            </label>
            <label className="providerKeyField">Admin key
              <input value={apiKey} onChange={(event) => setApiKey(event.target.value)} type="password" placeholder={providerPlaceholder(provider)} />
            </label>
          </div>
          <div className="transformSaveRow">
            <button type="button" onClick={submit} disabled={saving || !apiKey.trim()}>{saving ? "Working" : "Connect"}</button>
            <button type="button" className="secondaryButton" onClick={runSync} disabled={saving}>Run sync</button>
            {message && <span>{message}</span>}
          </div>
        </section>
        <section className="transformPanel">
          <div className="transformPanelHead">
            <div>
              <h2>Monthly budget</h2>
              <p>Track provider spend against an organization budget in the Usage tab.</p>
            </div>
          </div>
          <div className="transformFields">
            <label>Scope
              <select value={budgetProvider} onChange={(event) => setBudgetProvider(event.target.value)}>
                <option value="all">All providers</option>
                <option value="cursor">Cursor</option>
                <option value="openai">OpenAI</option>
                <option value="anthropic">Claude</option>
              </select>
            </label>
            <label>Monthly budget
              <input value={monthlyBudget} onChange={(event) => setMonthlyBudget(event.target.value)} inputMode="decimal" placeholder="2500" />
            </label>
          </div>
          <div className="transformSaveRow">
            <button type="button" onClick={saveBudget} disabled={saving}>Save budget</button>
          </div>
        </section>
      </div>
    </section>
  );
}

export function TokensSettingsPanel({ apiUrl }: { apiUrl: string }) {
  return (
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
  );
}

function SettingsTreeItem({ active, href, label }: { active: boolean; href: string; label: string }) {
  return (
    <Link className={active ? "nav-subitem active" : "nav-subitem"} href={href as any}>
      <span>{label}</span>
      <ChevronRight size={13} />
    </Link>
  );
}

function useActiveSettingsItem(initialItem?: string) {
  const searchParams = useSearchParams();
  return normalizeSettingsItem(searchParams.get("item") ?? initialItem);
}

function normalizeSettingsItem(value?: string | null): SettingsItem {
  if (value === "identity" || value === "roles" || value === "tokens" || value === "providers" || value === "deploy" || value === "organization") return value;
  return "organization";
}

function providerLabel(value: string) {
  if (value === "openai") return "OpenAI";
  if (value === "anthropic") return "Claude";
  if (value === "cursor") return "Cursor";
  return "Provider";
}

function providerPlaceholder(value: string) {
  if (value === "cursor") return "key_...";
  if (value === "openai") return "sk-admin-...";
  return "sk-ant-admin...";
}
