"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { DeploymentTokenIssuer } from "./DeploymentTokenIssuer";
import { TokenIssuer } from "./TokenIssuer";
import { IdentityProviderSetup, type OnboardingData } from "./EnterpriseOnboarding";
import { OrganizationSetupPanel } from "./OrganizationSetupPanel";
import { DashboardRoleSettings } from "./DashboardRoleSettings";

export type SettingsItem = "organization" | "identity" | "roles" | "tokens" | "deploy";

export function SettingsTree({ basePath, initialItem }: { basePath: string; initialItem?: string }) {
  const activeItem = useActiveSettingsItem(initialItem);
  const settingsPath = `${basePath}/settings`;
  return (
    <div className="navSubtree" aria-label="Settings sections">
      <SettingsTreeItem active={activeItem === "organization"} href={`${settingsPath}?item=organization`} label="Organization" />
      <SettingsTreeItem active={activeItem === "identity"} href={`${settingsPath}?item=identity`} label="Identity provider" />
      <SettingsTreeItem active={activeItem === "roles"} href={`${settingsPath}?item=roles`} label="Roles" />
      <SettingsTreeItem active={activeItem === "tokens"} href={`${settingsPath}?item=tokens`} label="Tokens" />
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
  if (value === "identity" || value === "roles" || value === "tokens" || value === "deploy" || value === "organization") return value;
  return "organization";
}
