import { redirect } from "next/navigation";

export default async function Triggers({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const normalized = new URLSearchParams();
  for (const [key, value] of Object.entries(params ?? {})) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first) normalized.set(key, first);
  }
  redirect(`/events${normalized.size ? `?${normalized.toString()}` : ""}`);
}
