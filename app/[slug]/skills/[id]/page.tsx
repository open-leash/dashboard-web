import { DashboardPage } from "../../../DashboardPage";

export default async function TenantSkillDetail({
  params,
  searchParams
}: {
  params: Promise<{ slug: string; id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug, id } = await params;
  const query = await searchParams;
  const normalized = Object.fromEntries(
    Object.entries(query ?? {}).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
  );
  return <DashboardPage initialTab="skills" skillsSearchParams={{ ...normalized, skillId: id }} tenantSlug={slug} />;
}
