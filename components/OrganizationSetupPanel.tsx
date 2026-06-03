"use client";

import { CheckCircle2, ChevronRight, MonitorDown, ShieldCheck, Building2, Lock } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { apiFetch } from "../lib/api-client";
import type { OnboardingData } from "./EnterpriseOnboarding";

export function OrganizationSetupPanel({
  apiUrl,
  onboardingData,
  tenantDomain,
  basePath,
  organizationSlug,
  variant = "notice",
  showTaskCards = true
}: {
  apiUrl: string;
  onboardingData: OnboardingData;
  tenantDomain: string;
  basePath: string;
  organizationSlug?: string;
  variant?: "notice" | "settings";
  showTaskCards?: boolean;
}) {
  const org = onboardingData.organization;
  const normalizedTenantDomain = tenantDomain.replace(/^https?:\/\//, "").replace(/\/+$/, "").toLowerCase();
  const placeholderName = isDevPlaceholderOrganizationName(org.name) ? "" : org.name ?? "";
  const placeholderSlug = org.slug === "openleash" ? "" : org.slug ?? "";
  const [company, setCompany] = useState({ name: placeholderName, slug: placeholderSlug });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState<"company" | null>(null);
  const hasCompany = Boolean(company.name.trim() && company.slug.trim());
  const hasIdentity = Boolean(onboardingData.idp?.enabled);
  const hasRoles = onboardingData.roles.length > 0;
  const hasDeployment = onboardingData.deploymentTokens.length > 0;
  const tenantHost = company.slug.trim() ? `${company.slug.trim()}.${normalizedTenantDomain}` : `[company].${normalizedTenantDomain}`;
  const querySlug = organizationSlug ?? org.slug;
  const settingsPath = `${basePath}/settings`;
  const taskCards = [
    !hasIdentity ? <SetupTask key="identity" icon={<Lock size={18} />} title="Connect identity provider" detail="Google Workspace, Entra ID, Okta, Ping, or LDAP." href={`${settingsPath}?item=identity`} /> : null,
    !hasRoles ? <SetupTask key="roles" icon={<ShieldCheck size={18} />} title="Roles" detail="Choose who can manage OpenLeash." href={`${settingsPath}?item=roles`} /> : null,
    !hasDeployment ? <SetupTask key="deploy" icon={<MonitorDown size={18} />} title="Deploy" detail={`Create a token for ${tenantHost}.`} href={`${settingsPath}?item=deploy`} /> : null
  ].filter(Boolean);
  const settingsCards = [
    <SetupTask key="identity" done={hasIdentity} icon={<Lock size={18} />} title="Identity provider" detail={hasIdentity ? `Connected to ${onboardingData.idp?.provider}` : "Connect your company identity source."} href={`${settingsPath}?item=identity`} />,
    <SetupTask key="roles" done={hasRoles} icon={<ShieldCheck size={18} />} title="Roles" detail={hasRoles ? `${onboardingData.roles.length} administrator${onboardingData.roles.length === 1 ? "" : "s"}` : "Choose dashboard administrators."} href={`${settingsPath}?item=roles`} />,
    <SetupTask key="deploy" done={hasDeployment} icon={<MonitorDown size={18} />} title="Deploy" detail={hasDeployment ? `${onboardingData.deploymentTokens.length} deployment token${onboardingData.deploymentTokens.length === 1 ? "" : "s"}` : "Create deployment tokens."} href={`${settingsPath}?item=deploy`} />
  ];
  const showCompanyInline = variant === "settings" || !hasCompany;
  const visibleCards = variant === "settings" ? settingsCards : taskCards;

  async function saveCompany() {
    const name = company.name.trim();
    const slug = slugifyTenant(company.slug || name);
    if (!name || !slug) {
      setMessage("Add an organization name and dashboard URL first.");
      return;
    }
    setBusy("company");
    setMessage("");
    const response = await apiFetch(onboardingUrl(apiUrl, "/company", querySlug), "adminOnboardingWrite", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ organizationSlug: querySlug, name, slug })
    });
    const payload = await response.json().catch(() => ({}));
    setBusy(null);
    if (!response.ok) {
      setMessage(payload.error ?? "Could not save company profile.");
      return;
    }
    const savedSlug = payload.organization?.slug ?? slug;
    updateStoredOrganization(payload.organization);
    setMessage("Company profile saved.");
    if (savedSlug && savedSlug !== organizationSlug && savedSlug !== org.slug) {
      window.location.href = `/${encodeURIComponent(savedSlug)}`;
    } else {
      window.location.reload();
    }
  }

  if (variant === "notice" && hasCompany && visibleCards.length === 0) return null;

  return (
    <section className={`setupTasksPanel ${variant === "settings" ? "settingsMode" : ""}`}>
      <div className="setupTasksHead">
        <div>
          <span className="setupEyebrow">{variant === "settings" ? "Organization settings" : "Organization setup"}</span>
          <h2>{variant === "settings" ? "Organization" : "Finish setup"}</h2>
          {variant === "notice" && <p>Complete the missing pieces when you are ready.</p>}
        </div>
      </div>

      {message && <div className="setupNotice">{message}</div>}

      {showCompanyInline && (
        <div className="setupCompanyInline">
          <div className="row-ico"><Building2 size={20} /></div>
          <div className="setupCompanyFields">
            <label>
              <span>Organization name</span>
              <input
                value={company.name}
                placeholder="Acme Security"
                onChange={(event) => {
                  const name = event.target.value;
                  setCompany({ name, slug: company.slug || slugifyTenant(name) });
                }}
              />
            </label>
            <label>
              <span>Dashboard URL</span>
              <div className="tenantInputCompact">
                <input value={company.slug} placeholder="company" onChange={(event) => setCompany({ ...company, slug: slugifyTenant(event.target.value) })} />
                <b>.{normalizedTenantDomain}</b>
              </div>
            </label>
          </div>
          <button type="button" onClick={saveCompany} disabled={busy === "company"}>{busy === "company" ? "Saving..." : "Save"}</button>
        </div>
      )}

      {showTaskCards && visibleCards.length > 0 && <div className="setupTaskGrid">{visibleCards}</div>}
    </section>
  );
}

function SetupTask({ done = false, icon, title, detail, href }: { done?: boolean; icon: ReactNode; title: string; detail: string; href: string }) {
  return (
    <a className={`setupTaskCard ${done ? "done" : ""}`} href={href}>
      <div className="row-ico">{done ? <CheckCircle2 size={18} /> : icon}</div>
      <div>
        <strong>{title}</strong>
        <span>{detail}</span>
      </div>
      <ChevronRight size={18} />
    </a>
  );
}

function onboardingUrl(apiUrl: string, path: string, organizationSlug?: string) {
  const query = organizationSlug ? `?organizationSlug=${encodeURIComponent(organizationSlug)}` : "";
  return `${apiUrl}/admin/onboarding${path}${query}`;
}

function slugifyTenant(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);
}

function isDevPlaceholderOrganizationName(value?: string | null) {
  return ["OpenLeash Cloud Dev", "OpenLeash Managed Dev"].includes(String(value ?? "").trim());
}

function updateStoredOrganization(organization: unknown) {
  if (!organization || typeof window === "undefined") return;
  try {
    localStorage.setItem("openleash_dashboard_organization", JSON.stringify(organization));
  } catch {
    // Ignore local storage failures; server state is the source of truth.
  }
}
