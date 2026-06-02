import { DashboardPage } from "../../../DashboardPage";

export default async function TenantTriggerDetail({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  return <DashboardPage initialTab="triggers" triggerId={id} tenantSlug={slug} />;
}
