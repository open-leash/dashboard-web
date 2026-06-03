"use client";

import { type ChangeEvent, useMemo, useState } from "react";
import {
  ArrowRight,
  AlertCircle,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Download,
  KeyRound,
  Lock,
  MonitorDown,
  RefreshCw,
  ShieldCheck,
  Upload,
  Users
} from "lucide-react";
import { siGooglecloud, siOkta } from "simple-icons";
import { apiFetch } from "../lib/api-client";

export type OnboardingData = {
  organization: {
    id: string;
    name: string;
    slug?: string;
    region?: string | null;
    setup_completed: boolean;
    current_step: number;
    onboarding_code?: string | null;
    deployment_mode?: string | null;
    infrastructure_config?: {
      databaseUrl?: string;
      apiUrl?: string;
      dashboardUrl?: string;
      identityLoaderUrl?: string;
      updateMode?: string;
      updateFeedUrl?: string;
    } | null;
  };
  idp?: {
    provider: string;
    enabled: boolean;
    last_sync_at?: string | null;
    user_count: number;
    group_count: number;
    last_error?: string | null;
  } | null;
  groups: Array<{ id: string; name: string; member_count: string | number; idp_provider?: string }>;
  users: Array<{ id: string; email: string; display_name: string; role?: string; department?: string; title?: string; status?: string }>;
  roles: Array<{ id: string; role: string; user_id?: string | null; group_id?: string | null; user_name?: string | null; group_name?: string | null }>;
  deploymentTokens: Array<{ id: string; label: string; mdm?: string | null; tenant_url: string; created_at: string; last_used_at?: string | null }>;
};

type OktaJwk = JsonWebKey & {
  kid?: string;
  use?: string;
  alg?: string;
};

const cloudSteps = [
  { id: 1, label: "Company", icon: Building2 },
  { id: 2, label: "Identity", icon: Lock },
  { id: 3, label: "Import", icon: RefreshCw },
  { id: 4, label: "Roles", icon: ShieldCheck },
  { id: 5, label: "Deploy", icon: MonitorDown },
  { id: 6, label: "Review", icon: CheckCircle2 }
];

const privateSteps = [
  { id: 1, label: "Infrastructure", icon: MonitorDown },
  { id: 2, label: "Company", icon: Building2 },
  { id: 3, label: "Identity", icon: Lock },
  { id: 4, label: "Import", icon: RefreshCw },
  { id: 5, label: "Roles", icon: ShieldCheck },
  { id: 6, label: "Deploy", icon: MonitorDown },
  { id: 7, label: "Review", icon: CheckCircle2 }
];

const providers = [
  { id: "azure", name: "Microsoft Entra ID", detail: "Microsoft 365 and Azure AD tenants", popular: true, icon: "microsoft" },
  { id: "okta", name: "Okta", detail: "Okta Workforce Identity", popular: true, icon: "okta" },
  { id: "google", name: "Google Workspace", detail: "Google Cloud Identity and Workspace", icon: "google" },
  { id: "ping", name: "Ping Identity", detail: "PingOne and PingFederate", icon: "ping" },
  { id: "ldap", name: "Active Directory / LDAP", detail: "On-prem directories over LDAP", icon: "microsoft" }
];

export function EnterpriseOnboarding({
  apiUrl,
  initialData,
  deploymentMode = "cloud",
  tenantDomain = "openleash.com",
  organizationSlug
}: {
  apiUrl: string;
  initialData: OnboardingData | null;
  deploymentMode?: "cloud" | "private";
  tenantDomain?: string;
  organizationSlug?: string;
}) {
  const isPrivate = deploymentMode === "private";
  const steps = isPrivate ? privateSteps : cloudSteps;
  const initialCompanySlug = initialData?.organization.slug === "openleash" ? "" : initialData?.organization.slug ?? "";
  const initialCompanyName = isDevPlaceholderOrganizationName(initialData?.organization.name) ? "" : initialData?.organization.name ?? "";
  const normalizedTenantDomain = normalizeTenantDomain(tenantDomain);
  const [data, setData] = useState(initialData);
  const [step, setStep] = useState(Math.min(Math.max(initialData?.organization.current_step ?? 1, 1), steps.length));
  const [busy, setBusy] = useState<string | null>(null);
  const [company, setCompany] = useState({
    name: initialCompanyName,
    slug: initialCompanySlug
  });
  const [provider, setProvider] = useState("azure");
  const [infrastructure, setInfrastructure] = useState({
    databaseUrl: initialData?.organization.infrastructure_config?.databaseUrl ?? "",
    apiUrl: initialData?.organization.infrastructure_config?.apiUrl ?? apiUrl,
    dashboardUrl: initialData?.organization.infrastructure_config?.dashboardUrl ?? "",
    identityLoaderUrl: initialData?.organization.infrastructure_config?.identityLoaderUrl ?? "",
    updateMode: initialData?.organization.infrastructure_config?.updateMode ?? "public",
    updateFeedUrl: initialData?.organization.infrastructure_config?.updateFeedUrl ?? ""
  });
  const [credentials, setCredentials] = useState<Record<string, string>>({
    tenantId: "",
    clientId: "",
    clientSecret: "",
    domain: "",
    apiToken: "",
    oktaClientId: "",
    oktaPrivateKey: "",
    oktaPublicKey: "",
    privateKey: "",
    serviceAccountJson: "",
    adminEmail: ""
  });
  const [message, setMessage] = useState("");
  const [roleDrafts, setRoleDrafts] = useState<Record<string, string>>({});
  const [oktaExpandedStep, setOktaExpandedStep] = useState<number | null>(1);
  const [oktaKeyMode, setOktaKeyMode] = useState<"generate" | "upload">("generate");
  const [oktaGenerating, setOktaGenerating] = useState(false);
  const [oktaUploadError, setOktaUploadError] = useState("");
  const [identitySkipped, setIdentitySkipped] = useState(false);

  const completion = useMemo(() => {
    if (data?.organization.setup_completed) return 100;
    return Math.max(0, Math.round(((step - 1) / steps.length) * 100));
  }, [data?.organization.setup_completed, step]);

  const onboardingSlug = organizationSlug ?? data?.organization.slug;

  function onboardingUrl(path = "") {
    const query = onboardingSlug ? `?organizationSlug=${encodeURIComponent(onboardingSlug)}` : "";
    return `${apiUrl}/admin/onboarding${path}${query}`;
  }

  async function reload() {
    const response = await apiFetch(onboardingUrl(), "adminOnboardingRead");
    if (response.ok) setData(await response.json());
  }

  async function saveInfrastructure() {
    setBusy("infrastructure");
    setMessage("");
    const response = await apiFetch(onboardingUrl("/infrastructure"), "adminOnboardingWrite", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ organizationSlug: onboardingSlug, deploymentMode, ...infrastructure })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(payload.error ?? "Could not save infrastructure settings.");
      setBusy(null);
      return;
    }
    await reload();
    setStep(2);
    setBusy(null);
  }

  async function saveCompany() {
    setBusy("company");
    setMessage("");
    await apiFetch(onboardingUrl("/company"), "adminOnboardingWrite", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ organizationSlug: onboardingSlug, name: company.name, slug: company.slug })
    });
    await reload();
    setStep(isPrivate ? 3 : 2);
    setBusy(null);
  }

  async function testIdp() {
    setBusy("test");
    setMessage("");
    const response = await apiFetch(onboardingUrl("/test-idp"), "adminOnboardingWrite", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ organizationSlug: onboardingSlug, provider, credentials })
    });
    const payload = await response.json();
    setMessage(payload.message ?? payload.error ?? (response.ok ? "Connection looks good." : "Connection failed."));
    setBusy(null);
  }

  async function syncIdentity() {
    setBusy("sync");
    setMessage("Syncing users and groups...");
    const response = await apiFetch(onboardingUrl("/sync-identity"), "adminOnboardingWrite", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ organizationSlug: onboardingSlug, provider, credentials })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.success === false) {
      setMessage(payload.error ?? payload.message ?? "Identity sync failed.");
      await reload();
      setBusy(null);
      return;
    }
    setMessage(payload.message ?? "Identity sync completed.");
    await reload();
    setStep(isPrivate ? 5 : 4);
    setBusy(null);
  }

  async function saveRoles() {
    setBusy("roles");
    const roles = Object.entries(roleDrafts)
      .filter(([, role]) => role)
      .map(([groupId, role]) => ({ groupId, role }));
    if (roles.length === 0 && data?.groups[0]) roles.push({ groupId: data.groups[0].id, role: "admin" });
    await apiFetch(onboardingUrl("/rbac"), "adminOnboardingWrite", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ organizationSlug: onboardingSlug, roles })
    });
    await reload();
    setStep(isPrivate ? 6 : 5);
    setBusy(null);
  }

  async function finish() {
    setBusy("finish");
    const response = await apiFetch(onboardingUrl("/complete"), "adminOnboardingWrite", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ organizationSlug: onboardingSlug })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(payload.error ?? "Finish the required setup steps before activating OpenLeash.");
      setBusy(null);
      return;
    }
    await reload();
    setStep(steps.length);
    setBusy(null);
    const slug = payload.organization?.slug || onboardingSlug || data?.organization.slug;
    document.cookie = "openleash_onboarding_org=; Path=/; SameSite=Lax; Max-Age=0";
    window.location.href = slug ? `/${encodeURIComponent(slug)}` : "/";
  }

  async function generateOktaKeys() {
    setOktaGenerating(true);
    setOktaUploadError("");
    try {
      const keyPair = await generateRSAKeyPair();
      const privateKey = formatJWKForStorage(keyPair.privateKey);
      const publicKey = formatJWKForStorage(keyPair.publicKey);
      setCredentials({ ...credentials, oktaPrivateKey: privateKey, oktaPublicKey: publicKey, privateKey });
      downloadJWK(keyPair.privateKey, "openleash-okta-private-key.json");
    } catch (error) {
      setOktaUploadError(error instanceof Error ? error.message : "Failed to generate Okta keys.");
    } finally {
      setOktaGenerating(false);
    }
  }

  async function uploadOktaPrivateKey(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setOktaUploadError("");
    try {
      const privateKey = JSON.parse(await file.text()) as OktaJwk;
      if (!privateKey.kty || !privateKey.d || !privateKey.n || !privateKey.e) {
        throw new Error("Invalid private key. Upload a JWK JSON file with kty, d, n, and e fields.");
      }
      const stored = formatJWKForStorage(privateKey);
      setCredentials({ ...credentials, oktaPrivateKey: stored, privateKey: stored });
    } catch (error) {
      setOktaUploadError(error instanceof Error ? error.message : "Invalid private key JSON file.");
    }
  }

  function pasteOktaPublicKey(value: string) {
    setOktaUploadError("");
    if (!value.trim()) {
      setCredentials({ ...credentials, oktaPublicKey: "" });
      return;
    }
    try {
      const publicKey = JSON.parse(value) as OktaJwk;
      if (!publicKey.kty || !publicKey.n || !publicKey.e) {
        throw new Error("Invalid public key. Paste a JWK with kty, n, and e fields.");
      }
      if (credentials.oktaPrivateKey) {
        const privateKey = JSON.parse(credentials.oktaPrivateKey) as OktaJwk;
        if (privateKey.kid && publicKey.kid && privateKey.kid !== publicKey.kid) {
          setOktaUploadError("Warning: the public and private key IDs do not match.");
        }
      }
      setCredentials({ ...credentials, oktaPublicKey: formatJWKForStorage(publicKey) });
    } catch (error) {
      setOktaUploadError(error instanceof Error ? error.message : "Invalid public key JSON.");
    }
  }

  const org = data?.organization;
  const hasIdentityProvider = Boolean(data?.idp?.enabled);
  const skippedIdentity = identitySkipped || Boolean(org?.setup_completed && !hasIdentityProvider);
  const identityRequiredForStep = skippedIdentity && !hasIdentityProvider;
  const tenantHost = company.slug ? `${company.slug}.${normalizedTenantDomain}` : `[company].${normalizedTenantDomain}`;
  const companyLoginUrl = `https://${tenantHost}`;
  const enrollmentCommand = `/bin/bash install-openleash-personal.sh --dmg <signed-dmg-url> --tenant ${tenantHost} --api-url https://api.openleash.com --token <deployment-token> --mode cloud --enroll --install-hooks`;
  const companyStep = isPrivate ? 2 : 1;
  const identityStep = isPrivate ? 3 : 2;
  const importStep = isPrivate ? 4 : 3;
  const rolesStep = isPrivate ? 5 : 4;
  const deployStep = isPrivate ? 6 : 5;
  const reviewStep = isPrivate ? 7 : 6;

  function goToStep(nextStep: number) {
    if (identityRequiredForStep && (nextStep === importStep || nextStep === rolesStep)) {
      setMessage("Connect an identity provider before importing users or assigning dashboard roles.");
      setStep(reviewStep);
      return;
    }
    if (identityRequiredForStep && nextStep === deployStep) {
      setMessage("MDM deployment skipped because no identity provider is connected yet.");
      setStep(reviewStep);
      return;
    }
    setStep(nextStep);
  }

  function skipIdentity() {
    setIdentitySkipped(true);
    setMessage("Identity and MDM deployment skipped for now. You can connect identity and configure deployment from the dashboard after activation.");
    setStep(reviewStep);
  }

  return (
    <div className="setupShell">
      <section className="setupHero">
        <div>
          <span className="setupEyebrow">{isPrivate ? "Private deployment onboarding" : "Hosted cloud onboarding"}</span>
          <h2>{org?.setup_completed ? "OpenLeash is ready for managed rollout" : "Set up OpenLeash for your organization"}</h2>
          <p>{isPrivate ? "Configure the customer-hosted services, connect identity, import users and groups, then deploy the endpoint agent through your MDM." : "Connect identity, import users and groups, map admin roles, then deploy the same tray and local agent through your MDM."}</p>
        </div>
        <div className="setupProgress">
          <strong>{completion}%</strong>
          <span>setup complete</span>
        </div>
      </section>

      <div className="setupStepper">
        {steps.map((item) => {
          const Icon = item.icon;
          const active = step === item.id;
          const done = item.id < step || (item.id === 6 && org?.setup_completed);
          return (
            <button type="button" className={`setupStep ${active ? "active" : ""} ${done ? "done" : ""}`} key={item.id} onClick={() => goToStep(item.id)}>
              <span><Icon size={16} /></span>
              {item.label}
            </button>
          );
        })}
      </div>

      {message && <div className="setupNotice">{message}</div>}

      {isPrivate && step === 1 && (
        <section className="setupPanel">
          <div className="setupPanelHead">
            <h3>Infrastructure</h3>
            <span className="tag asked"><span className="dot" />private</span>
          </div>
          <p className="setupCopy">Private deployments run inside your environment. These values should also be passed to the API and dashboard containers as environment variables.</p>
          <div className="setupFields">
            <label className="wide">Postgres connection string<input placeholder="postgres://user:password@postgres:5432/openleash" value={infrastructure.databaseUrl} onChange={(event) => setInfrastructure({ ...infrastructure, databaseUrl: event.target.value })} /></label>
            <label>OpenLeash API URL<input placeholder="https://openleash-api.company.com" value={infrastructure.apiUrl} onChange={(event) => setInfrastructure({ ...infrastructure, apiUrl: event.target.value })} /></label>
            <label>Dashboard URL<input placeholder="https://openleash.company.com" value={infrastructure.dashboardUrl} onChange={(event) => setInfrastructure({ ...infrastructure, dashboardUrl: event.target.value })} /></label>
            <label>Identity Loader URL<input placeholder="http://identity-loader:8080" value={infrastructure.identityLoaderUrl} onChange={(event) => setInfrastructure({ ...infrastructure, identityLoaderUrl: event.target.value })} /></label>
            <label>Client update source<select value={infrastructure.updateMode} onChange={(event) => setInfrastructure({ ...infrastructure, updateMode: event.target.value })}>
              <option value="public">OpenLeash public update API</option>
              <option value="private">Private update API or feed</option>
              <option value="manual">Manual distribution only</option>
            </select></label>
            <label>Update feed URL<input placeholder="https://openleash.company.com/api/updates/check" value={infrastructure.updateFeedUrl} onChange={(event) => setInfrastructure({ ...infrastructure, updateFeedUrl: event.target.value })} /></label>
          </div>
          <div className="setupEnvBox">
            <strong>Docker environment variables</strong>
            <code>DATABASE_URL</code><code>OPENLEASH_API_URL</code><code>OPENLEASH_PUBLIC_API_URL</code><code>IDENTITY_LOADER_URL</code><code>OPENLEASH_UPDATE_MODE</code><code>OPENLEASH_UPDATE_FEED_URL</code>
          </div>
          <div className="setupActions"><button type="button" onClick={saveInfrastructure} disabled={busy === "infrastructure"}>Save infrastructure <ArrowRight size={16} /></button></div>
        </section>
      )}

      {step === companyStep && (
        <section className="setupPanel">
          <div className="setupPanelHead">
            <h3>Company profile</h3>
            <span className="tag allowed"><span className="dot" />tenant</span>
          </div>
          <div className="setupFields">
            <label>Organization name<input value={company.name} onChange={(event) => {
              const name = event.target.value;
              setCompany({ ...company, name, slug: slugifyTenant(name) });
            }} /></label>
            <label className="wide">Dashboard URL
              <span className="tenantDomainField">
                <input value={company.slug} placeholder="company" onChange={(event) => setCompany({ ...company, slug: slugifyTenant(event.target.value) })} />
                <span>.{normalizedTenantDomain}</span>
              </span>
            </label>
          </div>
          {!isPrivate && (
            <div className="tenantPreview">
              <strong>Company login</strong>
              <span>Employees will sign in at <code>{companyLoginUrl}</code> using the identity provider you connect in the next step.</span>
            </div>
          )}
          <div className="setupActions">
            <button type="button" onClick={saveCompany} disabled={busy === "company"}>Save company <ArrowRight size={16} /></button>
          </div>
        </section>
      )}

      {step === identityStep && (
        <section className="setupPanel">
          <div className="setupPanelHead"><h3>Identity provider</h3><span className="tag asked"><span className="dot" />CISO controlled</span></div>
          <div className="providerGrid">
            {providers.map((item) => (
              <button type="button" className={provider === item.id ? "providerCard active" : "providerCard"} key={item.id} onClick={() => setProvider(item.id)}>
                <span className="providerIcon"><ProviderIcon icon={item.icon} /></span>
                <strong>{item.name}</strong>
                <span>{item.detail}</span>
                {item.popular && <em>Popular</em>}
              </button>
            ))}
          </div>
          <div className="setupFields">
            {provider === "azure" && (
              <>
                <div className="wide">
                  <EntraSetupGuide />
                </div>
                <label>Tenant ID<input placeholder="00000000-0000-0000-0000-000000000000" value={credentials.tenantId} onChange={(event) => setCredentials({ ...credentials, tenantId: event.target.value })} /></label>
                <label>Client ID<input placeholder="Application client ID" value={credentials.clientId} onChange={(event) => setCredentials({ ...credentials, clientId: event.target.value })} /></label>
                <label>Client secret<input placeholder="Secret value, not secret ID" type="password" value={credentials.clientSecret} onChange={(event) => setCredentials({ ...credentials, clientSecret: event.target.value })} /></label>
              </>
            )}
            {provider === "okta" && (
              <>
                <div className="wide">
                  <OktaSetupGuide expandedStep={oktaExpandedStep} onToggle={(stepNumber) => setOktaExpandedStep(oktaExpandedStep === stepNumber ? null : stepNumber)} />
                </div>
                <div className="wide oktaNeedBox">
                  <h4><CheckCircle2 size={18} /> What OpenLeash needs from Okta</h4>
                  <div>
                    <span><strong>Okta domain</strong><small>Example: https://yourcompany.okta.com</small></span>
                    <span><strong>Client ID</strong><small>From the API Services app General tab</small></span>
                    <span><strong>Public key</strong><small>Generated here, then pasted into Okta</small></span>
                  </div>
                  <p>OpenLeash uses private key JWT. The public key goes into Okta; the private key stays in OpenLeash and is used only to request read-only sync tokens.</p>
                </div>
                <div className="wide oktaKeyBox">
                  <div className="oktaKeyHead">
                    <div><h4><KeyRound size={18} /> Authentication keys</h4><p>Generate a secure RSA key pair or upload an existing JWK pair.</p></div>
                    <div className="segmented">
                      <button type="button" className={oktaKeyMode === "generate" ? "active" : ""} onClick={() => setOktaKeyMode("generate")}><KeyRound size={15} /> Generate</button>
                      <button type="button" className={oktaKeyMode === "upload" ? "active" : ""} onClick={() => setOktaKeyMode("upload")}><Upload size={15} /> Upload</button>
                    </div>
                  </div>
                  {oktaKeyMode === "generate" ? (
                    <div className="oktaKeyContent">
                      {!credentials.oktaPrivateKey ? (
                        <button type="button" className="oktaPrimary" onClick={generateOktaKeys} disabled={oktaGenerating}>
                          <KeyRound size={16} /> {oktaGenerating ? "Generating keys..." : "Generate RSA key pair"}
                        </button>
                      ) : (
                        <>
                          <div className="oktaSuccess"><CheckCircle2 size={16} /> Keys generated. The private key was downloaded for backup.</div>
                          <label className="oktaPublicKey">Public key to paste into Okta<textarea readOnly value={formatPublicKeyForDisplay(JSON.parse(credentials.oktaPublicKey))} onClick={(event) => event.currentTarget.select()} /></label>
                          <div className="oktaButtonRow">
                            <button type="button" className="oktaSecondary" onClick={() => downloadJWK(JSON.parse(credentials.oktaPrivateKey), "openleash-okta-private-key.json")}><Download size={16} /> Re-download private key</button>
                            <button type="button" className="oktaSecondary" onClick={generateOktaKeys}><KeyRound size={16} /> Generate new keys</button>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="oktaKeyContent">
                      <label>Private key JWK file<input type="file" accept=".json,application/json" onChange={uploadOktaPrivateKey} /></label>
                      <label className="oktaPublicKey">Public key JWK<textarea placeholder='{"kty":"RSA","use":"sig","kid":"...","alg":"RS256","n":"...","e":"AQAB"}' onChange={(event) => pasteOktaPublicKey(event.target.value)} /></label>
                      {credentials.oktaPrivateKey && credentials.oktaPublicKey && !oktaUploadError && <div className="oktaSuccess"><CheckCircle2 size={16} /> Keys loaded and ready.</div>}
                    </div>
                  )}
                  {oktaUploadError && <div className="oktaWarning"><AlertCircle size={16} /> {oktaUploadError}</div>}
                </div>
                <label>Okta domain<input placeholder="https://yourcompany.okta.com" value={credentials.domain} onChange={(event) => setCredentials({ ...credentials, domain: event.target.value })} /></label>
                <label>Client ID<input placeholder="0oa1a2b3c4d5e6f7g8h9" value={credentials.oktaClientId || credentials.clientId} onChange={(event) => setCredentials({ ...credentials, oktaClientId: event.target.value, clientId: event.target.value })} /></label>
              </>
            )}
            {provider === "google" && (
              <>
                <div className="wide">
                  <GoogleWorkspaceSetupGuide />
                </div>
                <label>Admin email<input placeholder="admin@company.com" value={credentials.adminEmail} onChange={(event) => setCredentials({ ...credentials, adminEmail: event.target.value })} /></label>
                <label className="wide">Service account JSON<textarea placeholder='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}' value={credentials.serviceAccountJson} onChange={(event) => setCredentials({ ...credentials, serviceAccountJson: event.target.value })} /></label>
              </>
            )}
            {provider === "ping" && (
              <>
                <div className="wide">
                  <PingSetupGuide />
                </div>
                <label>Ping API URL<input placeholder="https://api.pingone.com" value={credentials.apiUrl} onChange={(event) => setCredentials({ ...credentials, apiUrl: event.target.value })} /></label>
                <label>Access token<input placeholder="Bearer token or worker app token" value={credentials.accessToken} onChange={(event) => setCredentials({ ...credentials, accessToken: event.target.value })} /></label>
                <label>Environment ID<input placeholder="PingOne environment ID" value={credentials.environmentId} onChange={(event) => setCredentials({ ...credentials, environmentId: event.target.value })} /></label>
              </>
            )}
            {provider === "ldap" && (
              <>
                <div className="wide">
                  <LdapSetupGuide />
                </div>
                <label>LDAP host<input placeholder="ldaps://ad.company.com" value={credentials.apiUrl} onChange={(event) => setCredentials({ ...credentials, apiUrl: event.target.value, ldapHost: event.target.value })} /></label>
                <label>Bind DN<input placeholder="CN=openleash-sync,OU=Service Accounts,DC=company,DC=com" value={credentials.accessToken} onChange={(event) => setCredentials({ ...credentials, accessToken: event.target.value, bindDn: event.target.value })} /></label>
                <label>Base DN<input placeholder="DC=company,DC=com" value={credentials.environmentId} onChange={(event) => setCredentials({ ...credentials, environmentId: event.target.value, baseDn: event.target.value })} /></label>
              </>
            )}
          </div>
          <div className="setupActions">
            <button type="button" onClick={testIdp} disabled={busy === "test"}>Test connection</button>
            <button type="button" className="secondary" onClick={() => goToStep(importStep)}>Continue</button>
            <button type="button" className="secondary" onClick={skipIdentity}>Skip identity for now</button>
          </div>
        </section>
      )}

      {step === importStep && (
        identityRequiredForStep ? (
          <section className="setupPanel">
            <div className="setupPanelHead"><h3>Import users and groups</h3><span className="tag asked"><span className="dot" />identity required</span></div>
            <div className="setupNotice danger">Connect an identity provider before importing users and groups.</div>
            <div className="setupActions">
              <button type="button" onClick={() => goToStep(identityStep)}>Connect identity</button>
              <button type="button" className="secondary" onClick={() => goToStep(reviewStep)}>Skip to review</button>
            </div>
          </section>
        ) : (
          <section className="setupPanel">
            <div className="setupPanelHead"><h3>Import users and groups</h3><span className="tag allowed"><span className="dot" />IdentityLoader</span></div>
            <p className="setupCopy">OpenLeash uses the Identity Loader contract: provider credentials go to the sync service, users and groups land in Postgres, and dashboard RBAC uses the synced groups.</p>
            <div className="metricStrip">
              <Metric label="Users" value={data?.users.length ?? 0} />
              <Metric label="Groups" value={data?.groups.length ?? 0} />
              <Metric label="Last sync" value={data?.idp?.last_sync_at ? new Date(data.idp.last_sync_at).toLocaleString() : "Not synced"} />
            </div>
            <div className="setupActions"><button type="button" onClick={syncIdentity} disabled={busy === "sync"}><RefreshCw size={16} /> Sync identity now</button></div>
          </section>
        )
      )}

      {step === rolesStep && (
        identityRequiredForStep ? (
          <section className="setupPanel">
            <div className="setupPanelHead"><h3>Role assignments</h3><span className="tag asked"><span className="dot" />identity required</span></div>
            <div className="setupNotice danger">Dashboard roles use synced users and groups. Connect identity before assigning roles.</div>
            <div className="setupActions">
              <button type="button" onClick={() => goToStep(identityStep)}>Connect identity</button>
              <button type="button" className="secondary" onClick={() => goToStep(reviewStep)}>Skip to review</button>
            </div>
          </section>
        ) : (
          <section className="setupPanel">
            <div className="setupPanelHead"><h3>Role assignments</h3><span className="tag asked"><span className="dot" />RBAC</span></div>
            <p className="setupCopy">Assign dashboard permissions by synced identity group. End users do not manage policies in managed OpenLeash deployments.</p>
            <div className="roleGrid">
              {data?.groups.map((group) => (
                <label key={group.id}>
                  <span><strong>{group.name}</strong><small>{group.member_count} members</small></span>
                  <select value={roleDrafts[group.id] ?? ""} onChange={(event) => setRoleDrafts({ ...roleDrafts, [group.id]: event.target.value })}>
                    <option value="">No dashboard role</option>
                    <option value="admin">Admin</option>
                    <option value="analyst">Analyst</option>
                    <option value="responder">Responder</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </label>
              ))}
            </div>
            <div className="setupActions"><button type="button" onClick={saveRoles} disabled={busy === "roles"}>Save roles <ArrowRight size={16} /></button></div>
          </section>
        )
      )}

      {step === deployStep && (
        <section className="setupPanel">
          <div className="setupPanelHead"><h3>Deploy endpoint agent</h3><span className="tag allowed"><span className="dot" />MDM ready</span></div>
          <p className="setupCopy">Deploy the signed macOS app with your MDM, then run the enrollment script as the logged-in user. The script exchanges the deployment token, configures this tenant, starts OpenLeash, and can install supported agent hooks.</p>
          <div className="mdmGrid compact">
            {[
              ["Jamf Pro", "Package policy plus Files and Processes post-install command."],
              ["Kandji", "Custom App install plus Library Item script after install."],
              ["Microsoft Intune", "macOS app assignment plus post-install shell script."],
              ["Workspace ONE", "Internal app assignment plus post-install script."]
            ].map(([name, detail]) => (
              <article className="mdmCard" key={name}>
                <div className="mdmTop"><div className="row-ico"><MonitorDown size={18} /></div><div><strong>{name}</strong><p>{detail}</p></div></div>
                <pre>{enrollmentCommand}</pre>
              </article>
            ))}
          </div>
          <div className="setupActions"><button type="button" onClick={() => setStep(reviewStep)}>Review setup</button></div>
        </section>
      )}

      {step === reviewStep && (
        <section className="setupPanel">
          <div className="setupPanelHead"><h3>Review and activate</h3><span className={org?.setup_completed ? "tag allowed" : "tag asked"}><span className="dot" />{org?.setup_completed ? "active" : "pending"}</span></div>
          <div className="reviewGrid">
            <Metric label="Organization" value={org?.name ?? "Not set"} />
            <Metric label="Deployment" value={isPrivate ? "Private / on-prem" : "Hosted Cloud"} />
            <Metric label="Identity source" value={data?.idp?.provider ?? "Not connected"} />
            <Metric label="Imported users" value={data?.users.length ?? 0} />
            <Metric label="Imported groups" value={data?.groups.length ?? 0} />
            <Metric label="Dashboard roles" value={data?.roles.length ?? 0} />
            <Metric label="Deployment tokens" value={data?.deploymentTokens.length ?? 0} />
          </div>
          <div className="setupActions"><button type="button" onClick={finish} disabled={busy === "finish"}><CheckCircle2 size={16} /> Activate OpenLeash</button></div>
        </section>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="setupMetric"><span>{label}</span><strong>{value}</strong></div>;
}

function slugifyTenant(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);
}

function isDevPlaceholderOrganizationName(value?: string | null) {
  return ["OpenLeash Cloud Dev", "OpenLeash Managed Dev"].includes(String(value ?? "").trim());
}

function normalizeTenantDomain(value: string) {
  return value.replace(/^https?:\/\//, "").replace(/\/+$/, "").toLowerCase();
}

function OktaSetupGuide({ expandedStep, onToggle }: { expandedStep: number | null; onToggle: (stepNumber: number) => void }) {
  const items = [
    {
      title: "Get your Okta domain",
      body: (
        <>
          <p>Your Okta domain is in the URL when you log in to the Okta Admin Console.</p>
          <p>Example: <code>https://dev-123456.okta.com</code></p>
        </>
      )
    },
    {
      title: "Create an OAuth 2.0 service app",
      body: (
        <>
          <p>In Okta Admin Console, go to <strong>Applications</strong> then <strong>Applications</strong>.</p>
          <ol>
            <li>Click <strong>Create App Integration</strong>.</li>
            <li>Select <strong>API Services</strong>.</li>
            <li>Name it <strong>OpenLeash Identity Sync</strong>.</li>
            <li>Save the app.</li>
          </ol>
        </>
      )
    },
    {
      title: "Upload the public key and copy Client ID",
      body: (
        <>
          <p>In the app General tab, scroll to <strong>Client Credentials</strong>.</p>
          <ol>
            <li>Under <strong>Public Keys</strong>, click <strong>Add key</strong>.</li>
            <li>Paste the public JWK generated by OpenLeash below.</li>
            <li>Save, then copy the <strong>Client ID</strong> from the top of the app page.</li>
          </ol>
        </>
      )
    },
    {
      title: "Grant read-only API scopes",
      body: (
        <>
          <p>Open the <strong>Okta API Scopes</strong> tab and grant:</p>
          <ul>
            <li><code>okta.users.read</code> for reading users</li>
            <li><code>okta.groups.read</code> for reading groups</li>
          </ul>
          <p>These scopes do not let OpenLeash create, edit, or delete Okta users or groups.</p>
        </>
      )
    },
    {
      title: "Assign the read-only admin role",
      body: (
        <>
          <p>This is required for Okta to allow the service app to read users and groups.</p>
          <ol>
            <li>Open the app <strong>Assignments</strong> tab.</li>
            <li>Edit <strong>Admin roles</strong>.</li>
            <li>Select <strong>Read-only Administrator</strong>.</li>
            <li>Save changes.</li>
          </ol>
          <p>You can use a narrower Group Administrator role if your Okta tenant requires scoped access.</p>
        </>
      )
    }
  ];
  return (
    <div className="oktaGuide">
      <h4>Okta OAuth setup guide</h4>
      <p>Follow these steps once, then test the connection before importing users and groups.</p>
      {items.map((item, index) => {
        const stepNumber = index + 1;
        const open = expandedStep === stepNumber;
        return (
          <article key={item.title} className={open ? "open" : ""}>
            <button type="button" onClick={() => onToggle(stepNumber)}>
              <span>{stepNumber}. {item.title}</span>
              {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {open && <div className="oktaGuideBody">{item.body}</div>}
          </article>
        );
      })}
    </div>
  );
}

function EntraSetupGuide() {
  return (
    <div className="idpGuide azureGuide">
      <div>
        <h4><CheckCircle2 size={18} /> What OpenLeash needs from Microsoft Entra ID</h4>
        <p>OpenLeash uses a Microsoft Entra app registration to read users and groups through Microsoft Graph. An Entra admin creates the app, grants read-only application permissions, and pastes the tenant ID, client ID, and client secret here.</p>
      </div>
      <ol>
        <li>
          <strong>Create an app registration</strong>
          <span>In the Azure portal, open Microsoft Entra ID -&gt; App registrations -&gt; New registration. Name it OpenLeash Identity Sync and use Single tenant unless your organization requires multi-tenant access.</span>
        </li>
        <li>
          <strong>Copy Tenant ID and Client ID</strong>
          <span>Open the app Overview page. Copy Directory tenant ID into Tenant ID, and Application client ID into Client ID.</span>
        </li>
        <li>
          <strong>Add Microsoft Graph application permissions</strong>
          <span>Go to API permissions -&gt; Add a permission -&gt; Microsoft Graph -&gt; Application permissions. Add read-only permissions for users, groups, and group membership, then grant admin consent.</span>
          <code>User.Read.All</code>
          <code>Group.Read.All</code>
          <code>Directory.Read.All</code>
        </li>
        <li>
          <strong>Create a client secret</strong>
          <span>Go to Certificates &amp; secrets -&gt; Client secrets -&gt; New client secret. Copy the secret value immediately and paste it into Client secret. Do not paste the secret ID.</span>
        </li>
      </ol>
      <div className="idpNeedBox">
        <span><strong>Tenant ID</strong><small>Directory tenant ID from the app Overview page.</small></span>
        <span><strong>Client ID</strong><small>Application client ID from the same Overview page.</small></span>
        <span><strong>Client secret</strong><small>The secret value shown once after creating a client secret.</small></span>
      </div>
      <div className="idpGuideLinks">
        <a href="https://learn.microsoft.com/entra/identity-platform/quickstart-register-app" target="_blank" rel="noreferrer">Microsoft app registration guide</a>
        <a href="https://learn.microsoft.com/graph/permissions-reference" target="_blank" rel="noreferrer">Microsoft Graph permissions</a>
      </div>
    </div>
  );
}

function GoogleWorkspaceSetupGuide() {
  return (
    <div className="idpGuide googleGuide">
      <div>
        <h4><CheckCircle2 size={18} /> What OpenLeash needs from Google Workspace</h4>
        <p>OpenLeash reads users and groups through the Google Admin SDK Directory API. A Google Workspace super admin creates a service account, authorizes domain-wide delegation, then pastes the JSON key and admin email here.</p>
      </div>
      <ol>
        <li>
          <strong>Create a Google Cloud service account</strong>
          <span>In Google Cloud Console, create or select a project, enable the Admin SDK API, then go to IAM &amp; Admin -&gt; Service Accounts and create a service account for OpenLeash.</span>
        </li>
        <li>
          <strong>Enable domain-wide delegation</strong>
          <span>Open the service account details, enable Google Workspace domain-wide delegation, then copy the service account OAuth Client ID or Unique ID.</span>
        </li>
        <li>
          <strong>Authorize read-only Directory scopes</strong>
          <span>In Google Admin Console, go to Security -&gt; Access and data control -&gt; API controls -&gt; Domain-wide delegation, add the client ID, and authorize these scopes:</span>
          <code>https://www.googleapis.com/auth/admin.directory.user.readonly</code>
          <code>https://www.googleapis.com/auth/admin.directory.group.readonly</code>
          <code>https://www.googleapis.com/auth/admin.directory.group.member.readonly</code>
        </li>
        <li>
          <strong>Create and paste the JSON key</strong>
          <span>Back in Google Cloud, open the service account Keys tab, create a JSON key, download it, then paste the full file contents into Service account JSON.</span>
        </li>
      </ol>
      <div className="idpNeedBox googleNeedBox">
        <span><strong>Admin email</strong><small>A Google Workspace super admin or delegated admin email in your domain.</small></span>
        <span><strong>Service account JSON</strong><small>The full downloaded JSON key. Treat it like a secret.</small></span>
        <span><strong>Access level</strong><small>Read-only user, group, and group membership sync.</small></span>
      </div>
      <p className="idpGuideFoot">If your organization uses multi-party approval for domain-wide delegation, another super admin may need to approve the authorization in Google Admin Console.</p>
      <div className="idpGuideLinks">
        <a href="https://support.google.com/a/answer/162106" target="_blank" rel="noreferrer">Google Admin domain-wide delegation</a>
        <a href="https://developers.google.com/workspace/guides/create-credentials" target="_blank" rel="noreferrer">Google service account credentials</a>
      </div>
    </div>
  );
}

function PingSetupGuide() {
  return (
    <div className="idpGuide pingGuide">
      <div>
        <h4><CheckCircle2 size={18} /> What OpenLeash needs from Ping Identity</h4>
        <p>OpenLeash connects to PingOne with a read-only worker application or API token. A Ping administrator creates the credential, grants it access to read users and groups, then pastes the API URL, access token, and environment ID here.</p>
      </div>
      <ol>
        <li>
          <strong>Find your PingOne environment</strong>
          <span>In the PingOne admin console, select the environment that contains the workforce users and groups you want OpenLeash to sync. Copy the Environment ID from the environment details.</span>
        </li>
        <li>
          <strong>Create a worker app or API credential</strong>
          <span>Create an administrative worker app for OpenLeash Identity Sync, or use your organization&apos;s approved PingOne API token process. The credential should be scoped to read identities, groups, and memberships.</span>
        </li>
        <li>
          <strong>Grant read-only identity access</strong>
          <span>Assign read-only directory or identity data permissions. OpenLeash should not need permissions to create, update, delete, suspend, or reset users.</span>
        </li>
        <li>
          <strong>Copy the regional API base URL</strong>
          <span>Use the PingOne API host for your region, such as api.pingone.com, api.pingone.eu, api.pingone.ca, or the internal base URL your Ping admin gives you.</span>
        </li>
      </ol>
      <div className="idpNeedBox">
        <span><strong>Ping API URL</strong><small>The regional PingOne API base URL.</small></span>
        <span><strong>Access token</strong><small>A read-only worker app/API token for identity sync.</small></span>
        <span><strong>Environment ID</strong><small>The PingOne environment containing your workforce identities.</small></span>
      </div>
      <div className="idpGuideLinks">
        <a href="https://apidocs.pingidentity.com/pingone/platform/v1/api/" target="_blank" rel="noreferrer">PingOne API reference</a>
        <a href="https://docs.pingidentity.com/pingone/platform/" target="_blank" rel="noreferrer">PingOne administration docs</a>
      </div>
    </div>
  );
}

function LdapSetupGuide() {
  return (
    <div className="idpGuide ldapGuide">
      <div>
        <h4><CheckCircle2 size={18} /> What OpenLeash needs from Active Directory / LDAP</h4>
        <p>OpenLeash binds to LDAP with a read-only service account, searches below a base DN, and imports users, groups, and memberships. An AD/LDAP admin provides the host, bind DN, bind password through the sync service configuration, and base DN.</p>
      </div>
      <ol>
        <li>
          <strong>Choose a secure LDAP endpoint</strong>
          <span>Use LDAPS whenever possible. Ask your directory admin for the host name and port, for example ldaps://ad.company.com or ldaps://ad.company.com:636.</span>
        </li>
        <li>
          <strong>Create a read-only bind account</strong>
          <span>Create a dedicated service account such as openleash-sync. It only needs permission to read users, groups, and group membership attributes under the selected directory tree.</span>
        </li>
        <li>
          <strong>Copy the bind DN</strong>
          <span>Use the full distinguished name for the service account, for example CN=openleash-sync,OU=Service Accounts,DC=company,DC=com.</span>
        </li>
        <li>
          <strong>Choose the base DN</strong>
          <span>Use the narrowest DN that includes the users and groups OpenLeash should manage, such as DC=company,DC=com or OU=Engineering,DC=company,DC=com.</span>
        </li>
      </ol>
      <div className="idpNeedBox">
        <span><strong>LDAP host</strong><small>Prefer an LDAPS URL with port 636.</small></span>
        <span><strong>Bind DN</strong><small>The full DN of the read-only sync service account.</small></span>
        <span><strong>Base DN</strong><small>The directory subtree to search for users and groups.</small></span>
      </div>
      <p className="idpGuideFoot">Bind password and TLS certificate details should be stored in the Identity Loader or private deployment secret store, not shared casually in chat or tickets.</p>
    </div>
  );
}

async function generateRSAKeyPair() {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256"
    },
    true,
    ["sign", "verify"]
  );
  const publicKey = await window.crypto.subtle.exportKey("jwk", keyPair.publicKey) as OktaJwk;
  const privateKey = await window.crypto.subtle.exportKey("jwk", keyPair.privateKey) as OktaJwk;
  const kid = `ol_${Array.from(window.crypto.getRandomValues(new Uint8Array(16))).map((byte) => byte.toString(16).padStart(2, "0")).join("")}`;
  publicKey.kid = kid;
  privateKey.kid = kid;
  publicKey.use = "sig";
  privateKey.use = "sig";
  publicKey.alg = "RS256";
  privateKey.alg = "RS256";
  return { publicKey, privateKey };
}

function downloadJWK(jwk: OktaJwk, filename: string) {
  const blob = new Blob([JSON.stringify(jwk, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function formatPublicKeyForDisplay(publicKey: OktaJwk) {
  return JSON.stringify(
    {
      kty: publicKey.kty,
      use: publicKey.use,
      kid: publicKey.kid,
      alg: publicKey.alg,
      n: publicKey.n,
      e: publicKey.e
    },
    null,
    2
  );
}

function formatJWKForStorage(jwk: OktaJwk) {
  return JSON.stringify(jwk);
}

function ProviderIcon({ icon }: { icon: string }) {
  if (icon === "okta") return <SimpleIcon path={siOkta.path} title={siOkta.title} color={`#${siOkta.hex}`} />;
  if (icon === "google") return <SimpleIcon path={siGooglecloud.path} title={siGooglecloud.title} color={`#${siGooglecloud.hex}`} />;
  if (icon === "ping") return <PingIcon />;
  return <MicrosoftIcon />;
}

function SimpleIcon({ path, title, color }: { path: string; title: string; color: string }) {
  return (
    <svg viewBox="0 0 24 24" role="img" aria-label={title}>
      <path fill={color} d={path} />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <span className="microsoftMark" aria-label="Microsoft" role="img">
      <i /><i /><i /><i />
    </span>
  );
}

function PingIcon() {
  return (
    <span className="pingMark" aria-label="Ping Identity" role="img">
      <strong>P</strong>
    </span>
  );
}

export function IdentityManager({ apiUrl, initialData }: { apiUrl: string; initialData: OnboardingData | null }) {
  const [data, setData] = useState(initialData);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function sync() {
    setBusy(true);
    setMessage("");
    const response = await apiFetch(`${apiUrl}/admin/onboarding/sync-identity`, "adminOnboardingWrite", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ provider: data?.idp?.provider ?? "azure", credentials: {} })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.success === false) {
      setMessage(payload.error ?? payload.message ?? "Identity sync failed.");
      const reload = await apiFetch(`${apiUrl}/admin/onboarding`, "adminOnboardingRead");
      if (reload.ok) setData(await reload.json());
      setBusy(false);
      return;
    }
    setMessage(payload.message ?? "Identity sync completed.");
    const reload = await apiFetch(`${apiUrl}/admin/onboarding`, "adminOnboardingRead");
    if (reload.ok) setData(await reload.json());
    setBusy(false);
  }

  const canSync = Boolean(data?.idp?.provider);

  return (
    <div className="identityManager">
      <div className="identityOps">
        <Metric label="Source" value={data?.idp?.provider ?? "Not connected"} />
        <Metric label="Users" value={data?.users.length ?? 0} />
        <Metric label="Groups" value={data?.groups.length ?? 0} />
        <Metric label="Last sync" value={data?.idp?.last_sync_at ? new Date(data.idp.last_sync_at).toLocaleString() : "Never"} />
        <button type="button" onClick={sync} disabled={!canSync || busy}><RefreshCw size={16} /> {busy ? "Syncing" : "Sync now"}</button>
      </div>
      {message && <div className="setupNotice danger">{message}</div>}
      {data?.idp?.last_error && !message && <div className="setupNotice danger">{data.idp.last_error}</div>}
      {!canSync && <div className="setupNotice">Connect a real identity provider before syncing users and groups.</div>}
      <div className="identityColumns">
        <section>
          <h3>Groups</h3>
          {data?.groups.map((group) => (
            <article key={group.id} className="identityListRow">
              <div><strong>{group.name}</strong><span>{group.idp_provider} · {group.member_count} members</span></div>
            </article>
          ))}
        </section>
        <section>
          <h3>Users</h3>
          {data?.users.map((user) => (
            <article key={user.id} className="identityListRow">
              <div><strong>{user.display_name}</strong><span>{user.email} · {user.department ?? "No department"} · {user.title ?? "No title"}</span></div>
              <em>{user.status ?? "active"}</em>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}

export function IdentityProviderSetup({ apiUrl, initialData, organizationSlug }: { apiUrl: string; initialData: OnboardingData | null; organizationSlug?: string }) {
  const [provider, setProvider] = useState(initialData?.idp?.provider === "azure_ad" ? "azure" : initialData?.idp?.provider ?? "azure");
  const [credentials, setCredentials] = useState<Record<string, string>>({
    tenantId: "",
    clientId: "",
    clientSecret: "",
    domain: "",
    apiToken: "",
    oktaClientId: "",
    oktaPrivateKey: "",
    oktaPublicKey: "",
    privateKey: "",
    serviceAccountJson: "",
    adminEmail: ""
  });
  const [busy, setBusy] = useState<"test" | "sync" | null>(null);
  const [message, setMessage] = useState("");
  const [oktaExpandedStep, setOktaExpandedStep] = useState<number | null>(1);
  const [oktaKeyMode, setOktaKeyMode] = useState<"generate" | "upload">("generate");
  const [oktaGenerating, setOktaGenerating] = useState(false);
  const [oktaUploadError, setOktaUploadError] = useState("");

  function onboardingUrl(path = "") {
    const query = organizationSlug ? `?organizationSlug=${encodeURIComponent(organizationSlug)}` : "";
    return `${apiUrl}/admin/onboarding${path}${query}`;
  }

  async function testIdp() {
    setBusy("test");
    setMessage("");
    const response = await apiFetch(onboardingUrl("/test-idp"), "adminOnboardingWrite", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ organizationSlug, provider, credentials })
    });
    const payload = await response.json().catch(() => ({}));
    setMessage(payload.message ?? payload.error ?? (response.ok ? "Connection looks good." : "Connection failed."));
    setBusy(null);
  }

  async function connectAndSync() {
    setBusy("sync");
    setMessage("Connecting identity provider...");
    const response = await apiFetch(onboardingUrl("/sync-identity"), "adminOnboardingWrite", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ organizationSlug, provider, credentials })
    });
    const payload = await response.json().catch(() => ({}));
    setBusy(null);
    if (!response.ok || payload.success === false) {
      setMessage(payload.error ?? payload.message ?? "Identity sync failed.");
      return;
    }
    setMessage(payload.message ?? "Identity provider connected.");
    window.location.reload();
  }

  async function generateOktaKeys() {
    setOktaGenerating(true);
    setOktaUploadError("");
    try {
      const keyPair = await generateRSAKeyPair();
      const privateKey = formatJWKForStorage(keyPair.privateKey);
      const publicKey = formatJWKForStorage(keyPair.publicKey);
      setCredentials({ ...credentials, oktaPrivateKey: privateKey, oktaPublicKey: publicKey, privateKey });
      downloadJWK(keyPair.privateKey, "openleash-okta-private-key.json");
    } catch (error) {
      setOktaUploadError(error instanceof Error ? error.message : "Failed to generate Okta keys.");
    } finally {
      setOktaGenerating(false);
    }
  }

  async function uploadOktaPrivateKey(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setOktaUploadError("");
    try {
      const privateKey = JSON.parse(await file.text()) as OktaJwk;
      if (!privateKey.kty || !privateKey.d || !privateKey.n || !privateKey.e) {
        throw new Error("Invalid private key. Upload a JWK JSON file with kty, d, n, and e fields.");
      }
      const stored = formatJWKForStorage(privateKey);
      setCredentials({ ...credentials, oktaPrivateKey: stored, privateKey: stored });
    } catch (error) {
      setOktaUploadError(error instanceof Error ? error.message : "Invalid private key JSON file.");
    }
  }

  function pasteOktaPublicKey(value: string) {
    setOktaUploadError("");
    if (!value.trim()) {
      setCredentials({ ...credentials, oktaPublicKey: "" });
      return;
    }
    try {
      const publicKey = JSON.parse(value) as OktaJwk;
      if (!publicKey.kty || !publicKey.n || !publicKey.e) {
        throw new Error("Invalid public key. Paste a JWK with kty, n, and e fields.");
      }
      setCredentials({ ...credentials, oktaPublicKey: formatJWKForStorage(publicKey) });
    } catch (error) {
      setOktaUploadError(error instanceof Error ? error.message : "Invalid public key JSON.");
    }
  }

  return (
    <section className="setupPanel" id="identity-provider">
      <div className="setupPanelHead"><h3>Identity provider</h3>{initialData?.idp?.enabled ? <span className="tag allowed"><span className="dot" />connected</span> : null}</div>
      <div className="providerGrid">
        {providers.map((item) => (
          <button type="button" className={provider === item.id || provider === item.id.replace("azure", "azure_ad") ? "providerCard active" : "providerCard"} key={item.id} onClick={() => setProvider(item.id)}>
            <span className="providerIcon"><ProviderIcon icon={item.icon} /></span>
            <strong>{item.name}</strong>
            <span>{item.detail}</span>
            {item.popular && <em>Popular</em>}
          </button>
        ))}
      </div>
      <div className="setupFields">
        {provider === "azure" && (
          <>
            <div className="wide"><EntraSetupGuide /></div>
            <label>Tenant ID<input placeholder="00000000-0000-0000-0000-000000000000" value={credentials.tenantId} onChange={(event) => setCredentials({ ...credentials, tenantId: event.target.value })} /></label>
            <label>Client ID<input placeholder="Application client ID" value={credentials.clientId} onChange={(event) => setCredentials({ ...credentials, clientId: event.target.value })} /></label>
            <label>Client secret<input placeholder="Secret value, not secret ID" type="password" value={credentials.clientSecret} onChange={(event) => setCredentials({ ...credentials, clientSecret: event.target.value })} /></label>
          </>
        )}
        {provider === "okta" && (
          <>
            <div className="wide"><OktaSetupGuide expandedStep={oktaExpandedStep} onToggle={(stepNumber) => setOktaExpandedStep(oktaExpandedStep === stepNumber ? null : stepNumber)} /></div>
            <div className="wide oktaNeedBox">
              <h4><CheckCircle2 size={18} /> What OpenLeash needs from Okta</h4>
              <div>
                <span><strong>Okta domain</strong><small>Example: https://yourcompany.okta.com</small></span>
                <span><strong>Client ID</strong><small>From the API Services app General tab</small></span>
                <span><strong>Public key</strong><small>Generated here, then pasted into Okta</small></span>
              </div>
              <p>OpenLeash uses private key JWT. The public key goes into Okta; the private key stays in OpenLeash and is used only to request read-only sync tokens.</p>
            </div>
            <div className="wide oktaKeyBox">
              <div className="oktaKeyHead">
                <div><h4><KeyRound size={18} /> Authentication keys</h4><p>Generate a secure RSA key pair or upload an existing JWK pair.</p></div>
                <div className="segmented">
                  <button type="button" className={oktaKeyMode === "generate" ? "active" : ""} onClick={() => setOktaKeyMode("generate")}><KeyRound size={15} /> Generate</button>
                  <button type="button" className={oktaKeyMode === "upload" ? "active" : ""} onClick={() => setOktaKeyMode("upload")}><Upload size={15} /> Upload</button>
                </div>
              </div>
              {oktaKeyMode === "generate" ? (
                <div className="oktaKeyContent">
                  {!credentials.oktaPrivateKey ? (
                    <button type="button" className="oktaPrimary" onClick={generateOktaKeys} disabled={oktaGenerating}>
                      <KeyRound size={16} /> {oktaGenerating ? "Generating keys..." : "Generate RSA key pair"}
                    </button>
                  ) : (
                    <>
                      <div className="oktaSuccess"><CheckCircle2 size={16} /> Keys generated. The private key was downloaded for backup.</div>
                      <label className="oktaPublicKey">Public key to paste into Okta<textarea readOnly value={formatPublicKeyForDisplay(JSON.parse(credentials.oktaPublicKey))} onClick={(event) => event.currentTarget.select()} /></label>
                    </>
                  )}
                </div>
              ) : (
                <div className="oktaKeyContent">
                  <label>Private key JWK file<input type="file" accept=".json,application/json" onChange={uploadOktaPrivateKey} /></label>
                  <label className="oktaPublicKey">Public key JWK<textarea placeholder='{"kty":"RSA","use":"sig","kid":"...","alg":"RS256","n":"...","e":"AQAB"}' onChange={(event) => pasteOktaPublicKey(event.target.value)} /></label>
                </div>
              )}
              {oktaUploadError && <div className="oktaWarning"><AlertCircle size={16} /> {oktaUploadError}</div>}
            </div>
            <label>Okta domain<input placeholder="https://yourcompany.okta.com" value={credentials.domain} onChange={(event) => setCredentials({ ...credentials, domain: event.target.value })} /></label>
            <label>Client ID<input placeholder="0oa1a2b3c4d5e6f7g8h9" value={credentials.oktaClientId || credentials.clientId} onChange={(event) => setCredentials({ ...credentials, oktaClientId: event.target.value, clientId: event.target.value })} /></label>
          </>
        )}
        {provider === "google" && (
          <>
            <div className="wide"><GoogleWorkspaceSetupGuide /></div>
            <label>Admin email<input placeholder="admin@company.com" value={credentials.adminEmail} onChange={(event) => setCredentials({ ...credentials, adminEmail: event.target.value })} /></label>
            <label className="wide">Service account JSON<textarea placeholder='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}' value={credentials.serviceAccountJson} onChange={(event) => setCredentials({ ...credentials, serviceAccountJson: event.target.value })} /></label>
          </>
        )}
        {provider === "ping" && (
          <>
            <div className="wide"><PingSetupGuide /></div>
            <label>Ping API URL<input placeholder="https://api.pingone.com" value={credentials.apiUrl} onChange={(event) => setCredentials({ ...credentials, apiUrl: event.target.value })} /></label>
            <label>Access token<input placeholder="Bearer token or worker app token" value={credentials.accessToken} onChange={(event) => setCredentials({ ...credentials, accessToken: event.target.value })} /></label>
            <label>Environment ID<input placeholder="PingOne environment ID" value={credentials.environmentId} onChange={(event) => setCredentials({ ...credentials, environmentId: event.target.value })} /></label>
          </>
        )}
        {provider === "ldap" && (
          <>
            <div className="wide"><LdapSetupGuide /></div>
            <label>LDAP host<input placeholder="ldaps://ad.company.com" value={credentials.apiUrl} onChange={(event) => setCredentials({ ...credentials, apiUrl: event.target.value, ldapHost: event.target.value })} /></label>
            <label>Bind DN<input placeholder="CN=openleash-sync,OU=Service Accounts,DC=company,DC=com" value={credentials.accessToken} onChange={(event) => setCredentials({ ...credentials, accessToken: event.target.value, bindDn: event.target.value })} /></label>
            <label>Base DN<input placeholder="DC=company,DC=com" value={credentials.environmentId} onChange={(event) => setCredentials({ ...credentials, environmentId: event.target.value, baseDn: event.target.value })} /></label>
          </>
        )}
      </div>
      {message && <div className={message.toLowerCase().includes("failed") || message.toLowerCase().includes("not configured") ? "setupNotice danger" : "setupNotice"}>{message}</div>}
      <div className="setupActions">
        <button type="button" onClick={testIdp} disabled={busy === "test"}>Test connection</button>
        <button type="button" onClick={connectAndSync} disabled={busy === "sync"}>{busy === "sync" ? "Connecting" : "Connect identity provider"}</button>
      </div>
    </section>
  );
}
