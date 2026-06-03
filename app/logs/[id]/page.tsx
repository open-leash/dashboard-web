import { DashboardPage } from "../../DashboardPage";

export default async function LogDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DashboardPage initialTab="logs" logId={id} />;
}
