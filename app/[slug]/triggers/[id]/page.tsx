import { redirect } from "next/navigation";

export default async function TenantTriggerDetail({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  redirect(`/${encodeURIComponent(slug)}/events/${encodeURIComponent(id)}`);
}
