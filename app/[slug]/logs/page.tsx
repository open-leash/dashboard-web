import { DashboardPage } from "../../DashboardPage";

export default async function TenantLogs({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const normalized = Object.fromEntries(
    Object.entries(query ?? {}).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
  );
  return <DashboardPage initialTab="logs" logsSearchParams={normalized} tenantSlug={slug} />;
}
