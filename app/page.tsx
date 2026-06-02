import { TenantEntry } from "../components/TenantEntry";

export default async function Dashboard() {
  const apiUrl = process.env.OPENLEASH_API_URL ?? "http://localhost:9319";
  const tenantDomain = process.env.OPENLEASH_TENANT_DOMAIN ?? "openleash.com";
  return <TenantEntry apiUrl={apiUrl} tenantDomain={tenantDomain} />;
}
