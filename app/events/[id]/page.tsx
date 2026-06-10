import { DashboardPage } from "../../DashboardPage";

export default async function EventDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DashboardPage initialTab="triggers" triggerId={id} />;
}
