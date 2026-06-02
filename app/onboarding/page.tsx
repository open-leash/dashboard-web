import { cookies } from "next/headers";
import { DashboardPage } from "../DashboardPage";

export default async function CloudOnboarding() {
  const slug = (await cookies()).get("openleash_onboarding_org")?.value;
  return <DashboardPage initialTab="setup" tenantSlug={slug || undefined} />;
}
