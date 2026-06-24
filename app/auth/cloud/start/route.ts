import { NextRequest, NextResponse } from "next/server";
import { apiVersionHeaders } from "@openleash/shared";

export async function GET(request: NextRequest) {
  const apiUrl = cloudApiUrl();
  const dashboardUrl = process.env.OPENLEASH_DASHBOARD_URL ?? process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:9300";
  const provider = request.nextUrl.searchParams.get("provider") === "microsoft" ? "microsoft" : "google";
  const callback = new URL("/auth/cloud/callback", dashboardUrl);
  callback.searchParams.set("provider", provider);
  if (request.nextUrl.searchParams.get("desktop") === "1") callback.searchParams.set("desktop", "1");
  const organizationSlug = request.nextUrl.searchParams.get("organizationSlug");
  if (organizationSlug) callback.searchParams.set("organizationSlug", organizationSlug);
  const next = request.nextUrl.searchParams.get("next");
  if (next) callback.searchParams.set("next", next);

  const response = await fetch(new URL("/v1/mobile/auth/start", apiUrl), {
    method: "POST",
    headers: { "content-type": "application/json", ...apiVersionHeaders("mobileAuthStart") },
    cache: "no-store",
    body: JSON.stringify({
      redirectUri: callback.toString(),
      providerType: provider === "microsoft" ? "azure_ad" : "google",
      audience: "organization",
      organizationSlug: organizationSlug || undefined
    })
  }).catch((error) => error instanceof Error ? error : new Error("OpenLeash could not start sign-in."));

  if (response instanceof Error) {
    return redirectToCloudError(request, response.message);
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.authorizationUrl) {
    return redirectToCloudError(request, payload.error || payload.message || "OpenLeash could not start sign-in.");
  }

  return NextResponse.redirect(payload.authorizationUrl);
}

function redirectToCloudError(request: NextRequest, message: string) {
  const errorUrl = new URL("/auth/cloud/callback", request.url);
  errorUrl.searchParams.set("error", message);
  return NextResponse.redirect(errorUrl);
}

function cloudApiUrl() {
  const configured = process.env.OPENLEASH_CLOUD_CLIENT_API_URL ?? process.env.OPENLEASH_CLIENT_API_URL ?? process.env.OPENLEASH_CLOUD_API_URL ?? "http://localhost:9318";
  try {
    const url = new URL(configured);
    if (url.hostname === "dashboard-api.openleash.com") return "https://api.openleash.com";
  } catch {
    return configured;
  }
  return configured;
}
