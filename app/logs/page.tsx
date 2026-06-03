import { DashboardPage } from "../DashboardPage";

export default async function Logs({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const normalized = Object.fromEntries(
    Object.entries(params ?? {}).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
  );
  return <DashboardPage initialTab="logs" logsSearchParams={normalized} />;
}
