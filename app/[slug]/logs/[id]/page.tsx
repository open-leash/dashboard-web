import { DashboardPage } from "../../../DashboardPage";

export default async function TenantLogDetail({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  return <DashboardPage initialTab="logs" logId={id} tenantSlug={slug} />;
}
