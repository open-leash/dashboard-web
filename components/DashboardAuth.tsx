"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { LogOut, User } from "lucide-react";
import { apiFetch } from "../lib/api-client";

type AuthUser = {
  id: string;
  email: string;
  display_name: string;
  role: string;
};

type AuthOrganization = {
  id: string;
  name: string;
  slug: string;
  region?: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  organization: AuthOrganization | null;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function DashboardAuthGate({
  apiUrl,
  organizationSlug,
  requireAdmin = false,
  children
}: {
  apiUrl: string;
  organizationSlug: string;
  requireAdmin?: boolean;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [organization, setOrganization] = useState<AuthOrganization | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function checkSession() {
      const token = normalizeToken(localStorage.getItem("openleash_dashboard_token") || readCookie("openleash_dashboard_token"));
      if (token) localStorage.setItem("openleash_dashboard_token", token);
      const storedOrg = readStoredOrganization();
      if (!token) {
        redirectToLogin(requireAdmin, storedOrg?.slug ?? organizationSlug);
        return;
      }
      try {
        const response = await apiFetch(`${apiUrl}/auth/session`, "authSession", {
          headers: { authorization: `Bearer ${token}` }
        });
        if (!response.ok) {
          clearDashboardAuth();
          redirectToLogin(requireAdmin, storedOrg?.slug ?? organizationSlug);
          return;
        }
        const payload = await response.json();
        if (cancelled) return;
        if (payload.organization?.slug && payload.organization.slug !== organizationSlug && organizationSlug !== "openleash") {
          clearDashboardAuth();
          redirectToTenantLogin(organizationSlug);
          return;
        }
        if (requireAdmin && !isDashboardRole(payload.user?.role)) {
          clearDashboardAuth();
          window.location.href = "/?error=dashboard_admin_required";
          return;
        }
        setUser(payload.user);
        setOrganization(payload.organization);
        localStorage.setItem("openleash_dashboard_user", JSON.stringify(payload.user));
        localStorage.setItem("openleash_dashboard_organization", JSON.stringify(payload.organization));
        setChecking(false);
      } catch {
        clearDashboardAuth();
        redirectToLogin(requireAdmin, storedOrg?.slug ?? organizationSlug);
      }
    }
    checkSession();
    return () => {
      cancelled = true;
    };
  }, [apiUrl, organizationSlug, requireAdmin]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    organization,
    signOut: async () => {
      const token = localStorage.getItem("openleash_dashboard_token");
      if (token) {
        await apiFetch(`${apiUrl}/auth/logout`, "authLogout", {
          method: "POST",
          headers: { authorization: `Bearer ${token}` }
        }).catch(() => undefined);
      }
      const slug = organization?.slug ?? readStoredOrganization()?.slug ?? organizationSlug;
      clearDashboardAuth();
      redirectToLogin(requireAdmin, slug);
    }
  }), [apiUrl, organization, organizationSlug]);

  if (checking) {
    return (
      <main className="authChecking">
        <div className="authSpinner" />
        <p>Checking your OpenLeash session...</p>
      </main>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function DashboardUserChip() {
  const auth = useContext(AuthContext);
  const user = auth?.user ?? readStoredUser();
  const initials = (user?.display_name ?? "User").split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="user-chip">
      <span className="ava">{initials || <User size={15} />}</span>
      {user?.display_name ?? "Signed in"}
    </div>
  );
}

export function DashboardGreeting() {
  const auth = useContext(AuthContext);
  const user = auth?.user ?? readStoredUser();
  const firstName = String(user?.display_name ?? "")
    .trim()
    .split(/\s+/)[0];
  return <>{firstName ? `Hello, ${firstName}` : "Hello"}</>;
}

export function DashboardSignOutButton() {
  const auth = useContext(AuthContext);
  return (
    <button className="nav-item" type="button" onClick={() => auth?.signOut()}>
      <LogOut className="ic" />
      <span>Sign out</span>
    </button>
  );
}

export function DashboardSignOutIconButton() {
  const auth = useContext(AuthContext);
  return (
    <button className="iconbutton logoutIconButton" type="button" aria-label="Sign out" title="Sign out" onClick={() => auth?.signOut()}>
      <LogOut size={17} />
    </button>
  );
}

function isDashboardRole(role: unknown) {
  return ["owner", "admin", "ciso", "security_admin"].includes(String(role ?? "").toLowerCase());
}

function redirectToTenantLogin(slug: string) {
  redirectToMainWebWorkLogin(slug);
}

function redirectToLogin(requireAdmin: boolean, slug: string) {
  if (requireAdmin) {
    redirectToMainWebWorkLogin(slug);
    return;
  }
  window.location.href = `${mainWebUrl()}/account`;
}

function redirectToMainWebWorkLogin(slug: string) {
  const target = `${window.location.pathname}${window.location.search}`;
  const url = new URL("/account", mainWebUrl());
  url.searchParams.set("audience", "organization");
  url.searchParams.set("redirect", target || `/${slug || "openleash"}`);
  window.location.href = url.toString();
}

function mainWebUrl() {
  const configured = process.env.NEXT_PUBLIC_MAIN_WEB_URL?.replace(/\/+$/, "");
  if (configured) return configured;
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return `${window.location.protocol}//${window.location.hostname}:9305`;
  }
  return "https://openleash.com";
}

function clearDashboardAuth() {
  localStorage.removeItem("openleash_dashboard_token");
  document.cookie = "openleash_dashboard_token=; Path=/; SameSite=Lax; Max-Age=0";
  localStorage.removeItem("openleash_dashboard_expires_at");
  localStorage.removeItem("openleash_dashboard_user");
  localStorage.removeItem("openleash_dashboard_organization");
}

function readCookie(name: string) {
  if (typeof document === "undefined") return "";
  const prefix = `${name}=`;
  const value = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(prefix))
    ?.slice(prefix.length) ?? "";
  return normalizeToken(value);
}

function normalizeToken(token: string | null | undefined) {
  const value = String(token ?? "");
  if (!value) return "";
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function readStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("openleash_dashboard_user") ?? "null");
  } catch {
    return null;
  }
}

function readStoredOrganization(): AuthOrganization | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("openleash_dashboard_organization") ?? "null");
  } catch {
    return null;
  }
}
