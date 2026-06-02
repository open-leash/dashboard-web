# OpenLeash Dashboard Web 🕶️📊

[![Open Core](https://img.shields.io/badge/open--core-yes-111718)](#)
[![Next.js](https://img.shields.io/badge/next.js-15-black)](#)
[![UI](https://img.shields.io/badge/ui-customer_dashboard-0c8b67)](#)

The shared customer dashboard for OpenLeash. This is what teams use to onboard, connect identity, manage policies, inspect triggers, issue deployment tokens, and review agent activity.

## Product Surfaces

- Organization signup/sign-in
- Onboarding and identity sync
- Users, groups, roles, and deployment coverage
- Policies and approval flows
- Agents, MCP servers, skills, and external-agent observability
- Audit details for risky or blocked actions

## Run

```bash
npm install
OPENLEASH_API_URL=http://localhost:9319 npm run dev:dashboard-web
```

Open:

```text
http://localhost:9300
```

## Used By

| Environment | How |
| --- | --- |
| Managed private cloud | Runs directly for one customer tenant. |
| OpenLeash Cloud | Imported by `cloud-dashboard-web` and wrapped with cloud-only pages/routes. |
| Local development | Talks to `dashboard-api` on `localhost:9319`. |

## Compose, Do Not Fork

Cloud-only UI should live in `cloud-dashboard-web`. Shared customer features belong here.

```tsx
import { DashboardPage } from "@openleash/dashboard-web/DashboardPage";

export default function TenantDashboard({ slug }: { slug: string }) {
  return <DashboardPage tenantSlug={slug} />;
}
```

## UI Direction

Operational, dense, calm. This is a working security console, not a marketing page. Prefer clear tables, readable timelines, obvious states, and boringly reliable controls.
