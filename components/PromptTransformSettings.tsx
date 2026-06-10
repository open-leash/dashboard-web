"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api-client";

type CompressionLevel = "light" | "standard" | "maximum";
type DlpAction = "block" | "mask";
type DlpCategory = "pii" | "phi" | "tokens" | "keys" | "credentials";

type PromptTransformConfig = {
  compression: {
    enabled: boolean;
    level: CompressionLevel;
    conciseResponse: boolean;
    model: string;
  };
  dlp: {
    enabled: boolean;
    action: DlpAction;
    categories: DlpCategory[];
    model: string;
  };
};

const defaultConfig: PromptTransformConfig = {
  compression: { enabled: false, level: "standard", conciseResponse: false, model: "gpt-4.1-nano" },
  dlp: { enabled: false, action: "mask", categories: ["pii", "phi", "tokens", "keys", "credentials"], model: "gpt-4.1-nano" }
};

const dlpOptions: Array<{ id: DlpCategory; label: string; detail: string }> = [
  { id: "pii", label: "PII", detail: "Emails, SSNs, personal identifiers." },
  { id: "phi", label: "PHI", detail: "Patient and health-data context." },
  { id: "tokens", label: "Tokens", detail: "API and access tokens." },
  { id: "keys", label: "Keys", detail: "Private key blocks and key material." },
  { id: "credentials", label: "Credentials", detail: "Passwords, secrets, API-key assignments." }
];

export function PromptTransformSettings({
  apiUrl,
  tenantSlug,
  mode
}: {
  apiUrl: string;
  tenantSlug?: string;
  mode: "compression" | "dlp";
}) {
  const [config, setConfig] = useState<PromptTransformConfig>(defaultConfig);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const query = useMemo(() => tenantSlug ? `?organizationSlug=${encodeURIComponent(tenantSlug)}` : "", [tenantSlug]);

  useEffect(() => {
    let active = true;
    apiFetch(`${apiUrl}/admin/prompt-transforms${query}`, "adminPromptTransformsRead")
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => {
        if (active && payload?.config) setConfig(normalizeConfig(payload.config));
      })
      .catch(() => {
        if (active) setMessage("Could not load prompt transform settings.");
      });
    return () => { active = false; };
  }, [apiUrl, query]);

  async function save(nextConfig = config) {
    setSaving(true);
    setMessage("");
    try {
      const response = await apiFetch(`${apiUrl}/admin/prompt-transforms${query}`, "adminPromptTransformsWrite", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ config: nextConfig })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Could not save settings.");
      setConfig(normalizeConfig(payload.config ?? nextConfig));
      setMessage("Saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save settings.");
    } finally {
      setSaving(false);
    }
  }

  function update(next: PromptTransformConfig) {
    setConfig(next);
  }

  if (mode === "compression") {
    return (
      <div className="transformSettings">
        <section className="transformPanel">
          <div className="transformPanelHead">
            <div>
              <h2>Prompt compression</h2>
              <p>Compress prompt text before it reaches the model provider.</p>
            </div>
            <label className="policySwitch">
              <input
                type="checkbox"
                checked={config.compression.enabled}
                onChange={(event) => update({ ...config, compression: { ...config.compression, enabled: event.target.checked } })}
              />
              <span />
            </label>
          </div>
          <div className="transformFields">
            <label>
              <span>Compression level</span>
              <select value={config.compression.level} onChange={(event) => update({ ...config, compression: { ...config.compression, level: event.target.value as CompressionLevel } })}>
                <option value="light">Light</option>
                <option value="standard">Standard</option>
                <option value="maximum">Maximum</option>
              </select>
            </label>
            <label>
              <span>Model</span>
              <input value={config.compression.model} onChange={(event) => update({ ...config, compression: { ...config.compression, model: event.target.value } })} />
            </label>
            <label className="transformCheck">
              <input
                type="checkbox"
                checked={config.compression.conciseResponse}
                onChange={(event) => update({ ...config, compression: { ...config.compression, conciseResponse: event.target.checked } })}
              />
              <span>Also ask the model to answer concisely</span>
            </label>
          </div>
        </section>
        <TransformSave saving={saving} message={message} onSave={() => void save()} />
      </div>
    );
  }

  return (
    <div className="transformSettings">
      <section className="transformPanel">
        <div className="transformPanelHead">
          <div>
            <h2>DLP funnel</h2>
            <p>Inspect the transformed prompt and block or mask configured sensitive data.</p>
          </div>
          <label className="policySwitch">
            <input
              type="checkbox"
              checked={config.dlp.enabled}
              onChange={(event) => update({ ...config, dlp: { ...config.dlp, enabled: event.target.checked } })}
            />
            <span />
          </label>
        </div>
        <div className="transformFields">
          <label>
            <span>Action</span>
            <select value={config.dlp.action} onChange={(event) => update({ ...config, dlp: { ...config.dlp, action: event.target.value as DlpAction } })}>
              <option value="mask">Mask and continue</option>
              <option value="block">Block submission</option>
            </select>
          </label>
          <label>
            <span>Model</span>
            <input value={config.dlp.model} onChange={(event) => update({ ...config, dlp: { ...config.dlp, model: event.target.value } })} />
          </label>
        </div>
        <div className="transformCategoryGrid">
          {dlpOptions.map((option) => (
            <label key={option.id} className="transformCategory">
              <input
                type="checkbox"
                checked={config.dlp.categories.includes(option.id)}
                onChange={(event) => {
                  const categories = event.target.checked
                    ? [...config.dlp.categories, option.id]
                    : config.dlp.categories.filter((item) => item !== option.id);
                  update({ ...config, dlp: { ...config.dlp, categories } });
                }}
              />
              <span>
                <strong>{option.label}</strong>
                <small>{option.detail}</small>
              </span>
            </label>
          ))}
        </div>
      </section>
      <TransformSave saving={saving} message={message} onSave={() => void save()} />
    </div>
  );
}

function TransformSave({ saving, message, onSave }: { saving: boolean; message: string; onSave: () => void }) {
  return (
    <div className="transformSaveRow">
      <button type="button" onClick={onSave} disabled={saving}>{saving ? "Saving" : "Save changes"}</button>
      {message && <span>{message}</span>}
    </div>
  );
}

function normalizeConfig(value: any): PromptTransformConfig {
  return {
    compression: {
      enabled: Boolean(value?.compression?.enabled),
      level: ["light", "standard", "maximum"].includes(value?.compression?.level) ? value.compression.level : defaultConfig.compression.level,
      conciseResponse: Boolean(value?.compression?.conciseResponse),
      model: cleanModel(value?.compression?.model) || defaultConfig.compression.model
    },
    dlp: {
      enabled: Boolean(value?.dlp?.enabled),
      action: value?.dlp?.action === "block" ? "block" : "mask",
      categories: Array.isArray(value?.dlp?.categories) ? value.dlp.categories.filter((item: unknown) => ["pii", "phi", "tokens", "keys", "credentials"].includes(String(item))) : defaultConfig.dlp.categories,
      model: cleanModel(value?.dlp?.model) || defaultConfig.dlp.model
    }
  };
}

function cleanModel(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}
