import { DashboardPage } from "../DashboardPage";

export default async function SecurityPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const normalized = Object.fromEntries(
    Object.entries(query ?? {}).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
  );
  return <DashboardPage initialTab="security" securitySearchParams={normalized} />;
}
