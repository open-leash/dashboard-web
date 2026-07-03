"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronRight, Github, KeyRound, PlugZap } from "lucide-react";
import type { PluginCatalogItem } from "@openleash/shared";
import { DeploymentTokenIssuer } from "./DeploymentTokenIssuer";
import { TokenIssuer } from "./TokenIssuer";
import { IdentityProviderSetup, type OnboardingData } from "./EnterpriseOnboarding";
import { OrganizationSetupPanel } from "./OrganizationSetupPanel";
import { DashboardRoleSettings } from "./DashboardRoleSettings";
import { apiFetch } from "../lib/api-client";

export type SettingsItem = "organization" | "identity" | "roles" | "tokens" | "providers" | "plugins" | "deploy";

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
      <SettingsTreeItem active={activeItem === "plugins"} href={`${settingsPath}?item=plugins`} label="Plugins" />
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
      {activeItem === "plugins" && <PluginSettingsPanel apiUrl={apiUrl} organizationSlug={organizationSlug} />}
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

function PluginSettingsPanel({ apiUrl, organizationSlug }: { apiUrl: string; organizationSlug?: string }) {
  const [plugins, setPlugins] = useState<PluginCatalogItem[]>([]);
  const [marketplacePolicy, setMarketplacePolicy] = useState({
    allowUserMarketplaceInstalls: true,
    allowUserCommunityPlugins: true
  });
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [message, setMessage] = useState("");
  const query = organizationSlug ? `?organizationSlug=${encodeURIComponent(organizationSlug)}` : "";

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      try {
        const response = await apiFetch(`${apiUrl}/admin/plugins${query}`, "adminPluginsRead");
        const body = await response.json().catch(() => ({}));
        if (alive && response.ok) {
          setPlugins(Array.isArray(body.plugins) ? body.plugins : []);
          if (body.marketplacePolicy) setMarketplacePolicy(body.marketplacePolicy);
        }
        if (alive && !response.ok) setMessage(body.error || "Could not load plugins.");
      } catch (error) {
        if (alive) setMessage(error instanceof Error ? error.message : "Could not load plugins.");
      } finally {
        if (alive) setLoading(false);
      }
    }
    void load();
    return () => {
      alive = false;
    };
  }, [apiUrl, query]);

  async function savePlugin(plugin: PluginCatalogItem, patch: Partial<PluginCatalogItem["settings"]>) {
    const nextSettings = {
      ...plugin.settings,
      ...patch,
      config: patch.config ?? plugin.settings.config ?? {}
    };
    setPlugins((items) => items.map((item) => item.id === plugin.id ? { ...item, settings: nextSettings } : item));
    setSavingId(plugin.id);
    setMessage("");
    try {
      const response = await apiFetch(`${apiUrl}/admin/plugins/${encodeURIComponent(plugin.id)}/settings${query}`, "adminPluginsWrite", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          enabled: nextSettings.enabled,
          config: nextSettings.config,
          orderingPriority: nextSettings.orderingPriority
        })
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(body.error || `Could not save ${plugin.name}.`);
        return;
      }
      setPlugins((items) => items.map((item) => item.id === plugin.id ? { ...item, settings: { ...nextSettings, ...body.settings } } : item));
      setMessage(`${plugin.name} settings saved.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : `Could not save ${plugin.name}.`);
    } finally {
      setSavingId("");
    }
  }

  async function saveMarketplacePolicy(patch: Partial<typeof marketplacePolicy>) {
    const nextPolicy = { ...marketplacePolicy, ...patch };
    setMarketplacePolicy(nextPolicy);
    setSavingId("marketplace-policy");
    setMessage("");
    try {
      const response = await apiFetch(`${apiUrl}/admin/plugin-marketplace/policy${query}`, "adminPluginsWrite", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(nextPolicy)
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(body.error || "Could not save plugin access policy.");
        return;
      }
      if (body.marketplacePolicy) setMarketplacePolicy(body.marketplacePolicy);
      setMessage("Plugin access policy saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save plugin access policy.");
    } finally {
      setSavingId("");
    }
  }

  async function savePluginPolicy(plugin: PluginCatalogItem, patch: Partial<NonNullable<PluginCatalogItem["organizationPolicy"]>>) {
    const nextPolicy = {
      mandatory: Boolean(plugin.organizationPolicy?.mandatory),
      defaultEnabled: Boolean(plugin.organizationPolicy?.defaultEnabled),
      userInstallAllowed: plugin.organizationPolicy?.userInstallAllowed !== false,
      configLocked: Boolean(plugin.organizationPolicy?.configLocked),
      ...patch
    };
    if (nextPolicy.mandatory) nextPolicy.defaultEnabled = true;
    if (nextPolicy.mandatory) nextPolicy.userInstallAllowed = false;
    if (nextPolicy.mandatory) nextPolicy.configLocked = true;
    setPlugins((items) => items.map((item) => item.id === plugin.id ? {
      ...item,
      organizationPolicy: nextPolicy,
      settings: nextPolicy.mandatory ? { ...item.settings, enabled: true } : item.settings
    } : item));
    setSavingId(`${plugin.id}:policy`);
    setMessage("");
    try {
      const response = await apiFetch(`${apiUrl}/admin/plugins/${encodeURIComponent(plugin.id)}/policy${query}`, "adminPluginsWrite", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(nextPolicy)
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(body.error || `Could not save ${plugin.name} policy.`);
        return;
      }
      setPlugins((items) => items.map((item) => item.id === plugin.id ? { ...item, organizationPolicy: body.policy ?? nextPolicy } : item));
      setMessage(`${plugin.name} policy saved.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : `Could not save ${plugin.name} policy.`);
    } finally {
      setSavingId("");
    }
  }

  return (
    <section className="setupPanel">
      <div className="setupPanelHead">
        <div>
          <h3>Plugins</h3>
          <p className="setupCopy compact">CISO controls for org-wide plugins, mandatory rules, employee access, and locked configuration.</p>
        </div>
      </div>
      {message && <p className="setupCopy compact">{message}</p>}
      {loading ? <p className="setupCopy compact">Loading plugins...</p> : (
        <div className="transformSettings">
          <section className="transformPanel">
            <div className="transformPanelHead">
              <div>
                <h2>Plugin access</h2>
                <p>Control whether employees can add their own plugins from the approved OpenLeash plugin catalog.</p>
              </div>
              <PlugZap size={20} />
            </div>
            <div className="transformFields">
              <label>Employee plugin installs
                <select
                  value={marketplacePolicy.allowUserMarketplaceInstalls ? "allowed" : "blocked"}
                  onChange={(event) => void saveMarketplacePolicy({ allowUserMarketplaceInstalls: event.target.value === "allowed" })}
                  disabled={savingId === "marketplace-policy"}
                >
                  <option value="allowed">Allowed</option>
                  <option value="blocked">Blocked</option>
                </select>
              </label>
              <label>Plugin sources
                <select
                  value={marketplacePolicy.allowUserCommunityPlugins ? "reviewed" : "openleash"}
                  onChange={(event) => void saveMarketplacePolicy({ allowUserCommunityPlugins: event.target.value === "reviewed" })}
                  disabled={savingId === "marketplace-policy"}
                >
                  <option value="reviewed">All reviewed plugins</option>
                  <option value="openleash">OpenLeash plugins only</option>
                </select>
              </label>
            </div>
          </section>
          {plugins.map((plugin) => {
            const repositoryUrl = pluginRepositoryUrl(plugin);
            return (
            <section className="transformPanel" key={plugin.id}>
              <div className="transformPanelHead">
                <div>
                  <h2>{plugin.name}</h2>
                  <p>{plugin.marketplace?.shortDescription ?? plugin.description}</p>
                  <p className="setupCopy compact">By {plugin.marketplace?.developerName ?? plugin.publisher} · {plugin.slug ?? plugin.id}</p>
                  {repositoryUrl ? (
                    <a className="setupCopy compact pluginRepoTextLink" href={repositoryUrl} target="_blank" rel="noreferrer">
                      <Github size={14} /> GitHub repo
                    </a>
                  ) : null}
                </div>
                <PlugZap size={20} />
              </div>
              <div className="transformFields">
                <label>Organization install
                  <select
                    value={plugin.settings.enabled ? "enabled" : "disabled"}
                    onChange={(event) => void savePlugin(plugin, { enabled: event.target.value === "enabled" })}
                    disabled={savingId === plugin.id || plugin.organizationPolicy?.mandatory}
                  >
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </label>
                <label>Mandatory for employees
                  <select
                    value={plugin.organizationPolicy?.mandatory ? "mandatory" : "optional"}
                    onChange={(event) => void savePluginPolicy(plugin, { mandatory: event.target.value === "mandatory" })}
                    disabled={savingId === `${plugin.id}:policy`}
                  >
                    <option value="optional">Optional</option>
                    <option value="mandatory">Mandatory installed</option>
                  </select>
                </label>
                <label>Default for new users
                  <select
                    value={plugin.organizationPolicy?.defaultEnabled ? "enabled" : "disabled"}
                    onChange={(event) => void savePluginPolicy(plugin, { defaultEnabled: event.target.value === "enabled" })}
                    disabled={savingId === `${plugin.id}:policy` || plugin.organizationPolicy?.mandatory}
                  >
                    <option value="enabled">Added by default</option>
                    <option value="disabled">Not added by default</option>
                  </select>
                </label>
                <label>User choice
                  <select
                    value={plugin.organizationPolicy?.userInstallAllowed === false ? "blocked" : "allowed"}
                    onChange={(event) => void savePluginPolicy(plugin, { userInstallAllowed: event.target.value === "allowed" })}
                    disabled={savingId === `${plugin.id}:policy` || plugin.organizationPolicy?.mandatory}
                  >
                    <option value="allowed">Users can add/remove</option>
                    <option value="blocked">Admins only</option>
                  </select>
                </label>
                <label>Plugin settings
                  <select
                    value={plugin.organizationPolicy?.mandatory || plugin.organizationPolicy?.configLocked ? "locked" : "custom"}
                    onChange={(event) => void savePluginPolicy(plugin, { configLocked: event.target.value === "locked" })}
                    disabled={savingId === `${plugin.id}:policy` || plugin.organizationPolicy?.mandatory}
                  >
                    <option value="custom">Users can customize</option>
                    <option value="locked">Use org settings</option>
                  </select>
                </label>
                <label>Order priority
                  <input
                    value={String(plugin.settings.orderingPriority ?? plugin.ordering?.priority ?? "")}
                    inputMode="numeric"
                    onChange={(event) => {
                      const value = event.target.value.trim();
                      void savePlugin(plugin, { orderingPriority: value ? Number(value) : null });
                    }}
                    disabled={savingId === plugin.id}
                  />
                </label>
              </div>
              <PluginConfigFields plugin={plugin} saving={savingId === plugin.id} onChange={(config) => void savePlugin(plugin, { config })} />
            </section>
            );
          })}
        </div>
      )}
    </section>
  );
}

function PluginConfigFields({
  plugin,
  saving,
  onChange
}: {
  plugin: PluginCatalogItem;
  saving: boolean;
  onChange: (config: Record<string, unknown>) => void;
}) {
  const properties = plugin.configSchema?.properties ?? {};
  const keys = Object.keys(properties).filter((key) => key !== "enabled");
  if (keys.length === 0) return null;
  const config = plugin.settings.config ?? {};
  return (
    <div className="transformFields">
      {keys.map((key) => {
        const schema = properties[key] as { type?: string; enum?: unknown[]; items?: { enum?: unknown[] } };
        const value = config[key] ?? plugin.defaultConfig?.[key];
        if (Array.isArray(schema.enum)) {
          return (
            <label key={key}>{settingLabel(key)}
              <select value={String(value ?? "")} onChange={(event) => onChange({ ...config, [key]: event.target.value })} disabled={saving}>
                {schema.enum.map((item) => <option key={String(item)} value={String(item)}>{String(item)}</option>)}
              </select>
            </label>
          );
        }
        if (schema.type === "boolean") {
          return (
            <label key={key}>{settingLabel(key)}
              <select value={value ? "true" : "false"} onChange={(event) => onChange({ ...config, [key]: event.target.value === "true" })} disabled={saving}>
                <option value="true">On</option>
                <option value="false">Off</option>
              </select>
            </label>
          );
        }
        if (schema.type === "array" && Array.isArray(schema.items?.enum)) {
          const selected = new Set(Array.isArray(value) ? value.map(String) : []);
          return (
            <label key={key}>{settingLabel(key)}
              <select
                multiple
                value={[...selected]}
                onChange={(event) => onChange({
                  ...config,
                  [key]: Array.from(event.currentTarget.selectedOptions).map((option) => option.value)
                })}
                disabled={saving}
              >
                {schema.items.enum.map((item) => <option key={String(item)} value={String(item)}>{String(item)}</option>)}
              </select>
            </label>
          );
        }
        return (
          <label key={key}>{settingLabel(key)}
            <input
              type={secretSetting(key) ? "password" : "text"}
              value={String(value ?? "")}
              onChange={(event) => onChange({ ...config, [key]: event.target.value })}
              disabled={saving}
            />
          </label>
        );
      })}
    </div>
  );
}

function secretSetting(key: string) {
  return /token|secret|key|password/i.test(key);
}

function ProviderUsageSettingsPanel({ apiUrl, organizationSlug }: { apiUrl: string; organizationSlug?: string }) {
  const [provider, setProvider] = useState("cursor");
  const [evaluationProvider, setEvaluationProvider] = useState("openai");
  const [evaluationKey, setEvaluationKey] = useState("");
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

  async function saveEvaluationKey() {
    setSaving(true);
    setMessage("Saving evaluation key...");
    try {
      const response = await apiFetch(`${apiUrl}/admin/evaluation-key${query}`, "adminProviderUsageWrite", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ provider: evaluationProvider, apiKey: evaluationKey })
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || body.ok === false) {
        setMessage(body.error || "Could not save evaluation key.");
        return;
      }
      setEvaluationKey("");
      setMessage(`${providerLabel(evaluationProvider)} evaluation key connected. OpenLeash will invoke policy evaluation from this API using your provider.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save evaluation key.");
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
              <h2>Evaluation key</h2>
              <p>For BYOK plans, store an encrypted organization key. OpenLeash invokes policy evaluation from the managed API against your provider.</p>
            </div>
            <KeyRound size={20} />
          </div>
          <div className="transformFields">
            <label>Provider
              <select value={evaluationProvider} onChange={(event) => setEvaluationProvider(event.target.value)}>
                <option value="openai">OpenAI</option>
                <option value="anthropic">Claude</option>
                <option value="deepseek">DeepSeek</option>
              </select>
            </label>
            <label className="providerKeyField">Evaluation API key
              <input value={evaluationKey} onChange={(event) => setEvaluationKey(event.target.value)} type="password" placeholder={providerPlaceholder(evaluationProvider)} />
            </label>
          </div>
          <div className="transformSaveRow">
            <button type="button" onClick={saveEvaluationKey} disabled={saving || !evaluationKey.trim()}>{saving ? "Saving" : "Save evaluation key"}</button>
          </div>
        </section>
        <section className="transformPanel">
          <div className="transformPanelHead">
            <div>
              <h2>Management key</h2>
              <p>Usage keys are separate from evaluation keys. They are validated immediately and stored encrypted for scheduled usage sync.</p>
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
  if (value === "identity" || value === "roles" || value === "tokens" || value === "providers" || value === "plugins" || value === "deploy" || value === "organization") return value;
  return "organization";
}

function settingLabel(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]+/g, " ")
    .replace(/^./, (char) => char.toUpperCase());
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

function pluginRepositoryUrl(plugin: PluginCatalogItem) {
  const slug = plugin.slug || plugin.marketplace?.slug || plugin.id.replace(/^openleash\./, "").replace("prompt-compression", "token-saver").replace("dlp", "data-leakage-prevention");
  const isFirstParty = plugin.publisher === "openleash" || plugin.id.startsWith("openleash.");
  if (isFirstParty && firstPartyPluginRepositories[slug]) return firstPartyPluginRepositories[slug];
  return cleanPluginRepositoryUrl(plugin.repositoryUrl || plugin.marketplace?.repositoryUrl) || "";
}

function cleanPluginRepositoryUrl(repositoryUrl?: string) {
  if (repositoryUrl === "https://github.com/open-leash/open-leash") return undefined;
  if (repositoryUrl === "https://github.com/open-leash/plugins") return undefined;
  return repositoryUrl;
}

function providerLabel(value: string) {
  if (value === "openai") return "OpenAI";
  if (value === "anthropic") return "Claude";
  if (value === "deepseek") return "DeepSeek";
  if (value === "cursor") return "Cursor";
  return "Provider";
}

function providerPlaceholder(value: string) {
  if (value === "cursor") return "key_...";
  if (value === "openai") return "sk-admin-...";
  if (value === "deepseek") return "sk-...";
  return "sk-ant-admin...";
}
