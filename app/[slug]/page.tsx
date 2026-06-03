import { DashboardPage } from "../DashboardPage";
import { redirect } from "next/navigation";
import { apiFetch } from "../../lib/api-client";

type OrganizationLookup = {
  id: string;
  name: string;
  slug: string;
  setupCompleted?: boolean;
  setup_completed?: boolean;
};

async function readOrganization(slug: string): Promise<OrganizationLookup | null> {
  const apiUrl = process.env.OPENLEASH_API_URL ?? "http://localhost:9319";
  try {
    const response = await apiFetch(`${apiUrl}/organizations/${encodeURIComponent(slug)}`, "organizationsRead", { cache: "no-store" });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return { id: slug, name: slug, slug, setupCompleted: true };
  }
}

export default async function TenantDashboard({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const organization = await readOrganization(slug);
  if (!organization) redirect("/");
  return <DashboardPage tenantSlug={slug} />;
}
