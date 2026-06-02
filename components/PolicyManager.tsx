"use client";

import { Search, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api-client";

type Policy = {
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
};

export function PolicyManager({ apiUrl, policies, organizationSlug }: { apiUrl: string; policies: Policy[]; organizationSlug?: string }) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<Record<string, Policy>>(() =>
    Object.fromEntries(policies.map((policy) => [policy.id, policy]))
  );
  const [isCreating, setIsCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [newRule, setNewRule] = useState("Do not allow agents to send source code to unknown external domains.");

  useEffect(() => {
    setDrafts(Object.fromEntries(policies.map((policy) => [policy.id, policy])));
  }, [policies]);

  async function save(policy: Policy) {
    const title = summarizePolicyTitle(policy.natural_language_rule);
    await apiFetch(policyEndpoint(`${apiUrl}/admin/policies/${policy.id}`, organizationSlug), "adminPoliciesWrite", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: title,
        category: policy.category || categoryForPolicy(policy),
        description: policy.description,
        severity: "medium",
        naturalLanguageRule: policy.natural_language_rule,
        enabled: policy.enabled,
        locked: Boolean(policy.locked)
      })
    });
    router.refresh();
  }

  async function create() {
    const rule = newRule.trim();
    if (!rule) return;
    await apiFetch(policyEndpoint(`${apiUrl}/admin/policies`, organizationSlug), "adminPoliciesWrite", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: summarizePolicyTitle(rule),
        category: categoryForRule(rule),
        description: "Created from dashboard",
        severity: "medium",
        naturalLanguageRule: rule,
        enabled: true,
        locked: false
      })
    });
    setNewRule("Do not allow agents to send source code to unknown external domains.");
    setIsCreating(false);
    router.refresh();
  }

  const filtered = policies.filter((policy) => {
    const draft = drafts[policy.id] ?? policy;
    const haystack = [
      draft.name,
      draft.category,
      draft.description,
      draft.severity,
      draft.natural_language_rule,
      draft.last_agent_name,
      draft.last_project_path
    ].join(" ").toLowerCase();
    return haystack.includes(search.trim().toLowerCase());
  });
  const groups = groupPolicies(filtered, drafts);

  return (
    <div className="policyManagerShell">
      <div className="policyToolbar">
        <label className="policySearch">
          <Search size={18} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search policies, categories, rules, triggers..." />
        </label>
        <button className="policyCreateTopButton" type="button" onClick={() => setIsCreating(true)}>
          <Plus size={18} />
          Create policy
        </button>
      </div>
      <div className="policyList">
        {policies.length === 0 ? <div className="policyEmptyInline">No policies configured yet.</div> : null}
        {policies.length > 0 && filtered.length === 0 ? <div className="policyEmptyInline">No policies match that search.</div> : null}
        {groups.map(([category, items]) => (
          <section className="policyCategoryGroup" key={category}>
            <div className="policyCategoryHead">
              <h2>{category}</h2>
              <span>{items.length} polic{items.length === 1 ? "y" : "ies"}</span>
            </div>
            {items.map((policy) => {
              const draft = drafts[policy.id] ?? policy;
              const title = summarizePolicyTitle(draft.natural_language_rule);
              return (
                <article key={policy.id}>
                  <div className="policyEditorHead">
                    <div>
                      <strong>{title}</strong>
                      <span>{draft.enabled ? "Enabled" : "Disabled"} · {draft.severity} · {draft.locked ? "mandatory" : "optional"}</span>
                    </div>
                    <label className="policySwitch">
                      <input
                        type="checkbox"
                        checked={draft.enabled}
                        disabled={Boolean(draft.locked)}
                        onChange={(event) => setDrafts({ ...drafts, [policy.id]: { ...draft, enabled: event.target.checked } })}
                      />
                      <span aria-hidden="true" />
                    </label>
                  </div>
                  <div className="policyTriggerMeta">
                    <span><b>{count(policy.trigger_count)}</b> triggers</span>
                    <span><b>{count(policy.deny_count)}</b> denied</span>
                    <span><b>{count(policy.question_count)}</b> questions</span>
                    <span>{policy.last_triggered_at ? `Last: ${formatDate(policy.last_triggered_at)}${policy.last_agent_name ? ` by ${policy.last_agent_name}` : ""}` : "No trigger history yet"}</span>
                  </div>
                  <label className="policyField">
                    <span>Category</span>
                    <select
                      value={draft.category || categoryForPolicy(draft)}
                      onChange={(event) => setDrafts({ ...drafts, [policy.id]: { ...draft, category: event.target.value } })}
                    >
                      {policyCategories.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </label>
                  <label className="policyLockRow">
                    <input
                      type="checkbox"
                      checked={Boolean(draft.locked)}
                      onChange={(event) => setDrafts({ ...drafts, [policy.id]: { ...draft, locked: event.target.checked, enabled: event.target.checked ? true : draft.enabled } })}
                    />
                    <span>Mandatory for enrolled clients</span>
                  </label>
                  <textarea
                    className="policyRuleText"
                    value={draft.natural_language_rule}
                    onChange={(event) => setDrafts({ ...drafts, [policy.id]: { ...draft, natural_language_rule: event.target.value, category: draft.category || categoryForRule(event.target.value) } })}
                    aria-label={`${policy.name} rule`}
                  />
                  <button type="button" onClick={() => save(draft)}>Save policy</button>
                </article>
              );
            })}
          </section>
        ))}
      </div>
      <button className="policyFab" type="button" onClick={() => setIsCreating(true)} aria-label="Create policy">
        <Plus size={30} />
      </button>
      {isCreating ? (
        <div className="policyCreateOverlay" role="dialog" aria-modal="true" aria-labelledby="create-policy-title">
          <section className="policyCreateDialog">
            <div className="policyEditorHead">
              <div>
                <strong id="create-policy-title">{summarizePolicyTitle(newRule)}</strong>
                <span>New policy</span>
              </div>
              <button className="policyDialogClose" type="button" onClick={() => setIsCreating(false)} aria-label="Close create policy">
                <X size={22} />
              </button>
            </div>
            <textarea className="policyRuleText" value={newRule} onChange={(event) => setNewRule(event.target.value)} aria-label="New policy rule" autoFocus />
            <div className="policyDialogActions">
              <button type="button" className="secondary" onClick={() => setIsCreating(false)}>Cancel</button>
              <button type="button" onClick={create} disabled={!newRule.trim()}>Create policy</button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

const policyCategories = [
  "Secrets and credentials",
  "Data protection",
  "Source control",
  "Databases",
  "Infrastructure",
  "Supply chain",
  "System safety",
  "General"
];

function groupPolicies(policies: Policy[], drafts: Record<string, Policy>) {
  const groups = new Map<string, Policy[]>();
  for (const policy of policies) {
    const draft = drafts[policy.id] ?? policy;
    const category = draft.category || categoryForPolicy(draft);
    groups.set(category, [...(groups.get(category) ?? []), policy]);
  }
  return [...groups.entries()].sort(([a], [b]) => policyCategories.indexOf(a) - policyCategories.indexOf(b));
}

function policyEndpoint(url: string, organizationSlug?: string) {
  if (!organizationSlug) return url;
  const parsed = new URL(url);
  parsed.searchParams.set("organizationSlug", organizationSlug);
  return parsed.toString();
}

function count(value?: string | number) {
  return Number(value ?? 0).toLocaleString();
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function categoryForPolicy(policy: Policy) {
  return policy.category || categoryForRule(`${policy.name} ${policy.description} ${policy.natural_language_rule}`);
}

function categoryForRule(rule: string) {
  const lower = rule.toLowerCase();
  if (/credential|secret|token|private key|api key|\.env|kubeconfig|password|cookie|npmrc/.test(lower)) return "Secrets and credentials";
  if (/personal|pii|customer|employee|passport|ssn|credit card|regulated|external|upload|source code|exfiltrat|unknown url|third-party/.test(lower)) return "Data protection";
  if (/git|branch|commit|push|rebase|repository|repo|history|worktree/.test(lower)) return "Source control";
  if (/database|drop table|drop database|truncate|delete from|update statement|sql/.test(lower)) return "Databases";
  if (/terraform|kubernetes|kubectl|cloud|s3|gcp|aws|azure|namespace|vm|dns|helm|infrastructure/.test(lower)) return "Infrastructure";
  if (/package|dependency|lockfile|npm|pnpm|yarn|pip|gem|cargo|go install|supply-chain/.test(lower)) return "Supply chain";
  if (/rm -rf|delete|destructive|format|chmod|chown|filesystem|disk|volume/.test(lower)) return "System safety";
  return "General";
}

function summarizePolicyTitle(rule: string) {
  const lower = rule.toLowerCase();
  if (/(credential files|local files|\.env|kubeconfig|npm token|password vault|cloud credentials|api key stores)/.test(lower)) return "Credential files access";
  if (/(delete files|destructive|irreversible|rewrite history|terraform destroy|git reset|change permissions)/.test(lower)) return "Destructive commands";
  if (/(personal data|pii|reveal secrets|tokens|private keys|credentials)/.test(lower)) return "Secret and personal data";
  if (/5\s*(\+|plus|add|added to)\s*4/.test(lower)) return "5 plus 4 answers";
  if (/(new git repo|create .*git repo|git init|repository)/.test(lower)) return "Git repo creation";
  if (/(source code|external domains|unknown external|exfiltrat)/.test(lower)) return "External code sharing";
  const cleaned = rule
    .replace(/[^\w\s.+/#-]/g, " ")
    .replace(/\b(do not|don't|never|disallow|prevent|block|deny|allow|agents?|the|a|an|to|from|that|which|any|before)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = (cleaned || "New policy").split(/\s+/).slice(0, 7);
  const title = words.join(" ");
  return title.charAt(0).toUpperCase() + title.slice(1);
}
