import { redirect } from "next/navigation";
import { CloudGoogleCallback } from "../../../../components/CloudGoogleCallback";

export default async function CloudCallbackPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const apiUrl = process.env.OPENLEASH_CLOUD_CLIENT_API_URL ?? process.env.OPENLEASH_CLIENT_API_URL ?? process.env.OPENLEASH_CLOUD_API_URL ?? "http://localhost:9318";
  const params = await searchParams;
  if (first(params.desktop) === "1") return <CloudGoogleCallback apiUrl={apiUrl} />;
  const error = first(params.error_description) || first(params.error);
  const code = first(params.code);
  const exchangeRedirectUri = first(params.exchangeRedirectUri);
  if (error) return <CloudCallbackError message={error} />;
  if (!code || !exchangeRedirectUri) return <CloudCallbackError message="Google sign-in did not return a usable authorization code." />;
  redirect(`/auth/cloud/session?${toSearchString(params)}` as any);
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function toSearchString(params: Record<string, string | string[] | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const firstValue = first(value);
    if (firstValue) search.set(key, firstValue);
  }
  return search.toString();
}

function CloudCallbackError({ message }: { message: string }) {
  return (
    <main className="tenantLoginShell">
      <section className="tenantLoginCard">
        <div className="tenantLoginBrand">
          <div className="tenantLoginMark"><img src="/openleash-icon.png" alt="" /></div>
          <span>OpenLeash</span>
        </div>
        <div>
          <h1>Sign-in needs attention</h1>
          <p>{message}</p>
        </div>
        <a className="tenantLoginEmpty" href="/">Try again</a>
      </section>
    </main>
  );
}
