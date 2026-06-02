import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const apiUrl = process.env.OPENLEASH_API_URL ?? "http://localhost:9319";
  const dashboardUrl = process.env.OPENLEASH_DASHBOARD_URL ?? process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:9300";
  const provider = request.nextUrl.searchParams.get("provider") === "microsoft" ? "microsoft" : "google";
  const callback = new URL("/auth/cloud/callback", dashboardUrl);
  callback.searchParams.set("provider", provider);
  if (request.nextUrl.searchParams.get("desktop") === "1") callback.searchParams.set("desktop", "1");
  const organizationSlug = request.nextUrl.searchParams.get("organizationSlug");
  if (organizationSlug) callback.searchParams.set("organizationSlug", organizationSlug);
  const next = request.nextUrl.searchParams.get("next");
  if (next) callback.searchParams.set("next", next);
  const redirect = new URL(provider === "microsoft" ? "/auth/microsoft/start" : "/auth/google/start", apiUrl);
  redirect.searchParams.set("redirectUri", callback.toString());
  return NextResponse.redirect(redirect);
}
