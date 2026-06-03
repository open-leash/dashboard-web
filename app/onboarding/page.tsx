import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function CloudOnboarding() {
  const slug = (await cookies()).get("openleash_onboarding_org")?.value;
  redirect(slug ? `/${encodeURIComponent(slug)}` : "/");
}
