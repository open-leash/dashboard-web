import { apiVersionHeaders, type OpenLeashApiFunction } from "@openleash/shared";

export function apiFetch(input: string | URL | Request, functionName: OpenLeashApiFunction, init: RequestInit = {}) {
  const token = typeof window !== "undefined" ? window.localStorage.getItem("openleash_dashboard_token") : null;
  return fetch(input, {
    ...init,
    headers: {
      ...apiVersionHeaders(functionName),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {})
    }
  });
}
