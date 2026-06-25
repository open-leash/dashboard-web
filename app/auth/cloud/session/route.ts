import { apiVersionHeaders } from "@openleash/shared";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const apiUrl = process.env.OPENLEASH_CLOUD_CLIENT_API_URL ?? process.env.OPENLEASH_CLIENT_API_URL ?? process.env.OPENLEASH_CLOUD_API_URL ?? "http://localhost:9318";
  const code = request.nextUrl.searchParams.get("code");
  const exchangeRedirectUri = request.nextUrl.searchParams.get("exchangeRedirectUri");
  if (!code || !exchangeRedirectUri) return redirectToCallbackError(request, "Google sign-in did not return a usable authorization code.");

  const response = await fetch(`${apiUrl}/v1/mobile/auth/exchange`, {
    method: "POST",
    headers: { "content-type": "application/json", ...apiVersionHeaders("mobileAuthExchange") },
    cache: "no-store",
    body: JSON.stringify({
      redirectUri: exchangeRedirectUri,
      authorizationCode: code,
      providerType: request.nextUrl.searchParams.get("provider") === "microsoft" ? "azure_ad" : "google",
      audience: "organization",
      organizationSlug: request.nextUrl.searchParams.get("organizationSlug") || undefined
    })
  }).catch((err) => err instanceof Error ? err : new Error("OpenLeash could not finish sign-in."));
  if (response instanceof Error) return redirectToCallbackError(request, response.message);

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) return redirectToCallbackError(request, payload.message || payload.error || "OpenLeash could not finish sign-in.");

  const token = payload.token || payload.sessionToken || payload.session?.token || payload.tokens?.accessToken;
  if (!token) return redirectToCallbackError(request, "OpenLeash did not return a dashboard session token.");

  const slug = payload.organization?.slug || request.nextUrl.searchParams.get("organizationSlug") || "openleash";
  const redirectPath = safeLocalPath(request.nextUrl.searchParams.get("next") || "") || `/${encodeURIComponent(slug)}`;
  const responseWithCookies = NextResponse.redirect(new URL(redirectPath, request.url));
  responseWithCookies.cookies.set("openleash_dashboard_token", token, { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 14 });
  responseWithCookies.cookies.set("openleash_onboarding_org", slug, { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 });
  return responseWithCookies;
}

function redirectToCallbackError(request: NextRequest, message: string) {
  const errorUrl = new URL("/auth/cloud/callback", request.url);
  errorUrl.searchParams.set("error", message);
  return NextResponse.redirect(errorUrl);
}

function safeLocalPath(value: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "";
  return value;
}
