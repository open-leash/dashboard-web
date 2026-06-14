<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:14B8A6,45:2563EB,100:111827&height=220&section=header&text=Dashboard%20Web&fontSize=52&fontColor=ffffff&fontAlignY=38&desc=The%20team%20control%20room%20for%20agents.&descSize=18&descAlignY=58" width="100%" />

<p>
  <img src="https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Open%20Core-Dashboard%20UI-14B8A6?style=for-the-badge&logo=github&logoColor=white" />
  <img src="https://img.shields.io/badge/UX-operational%20security-2563EB?style=for-the-badge" />
</p>

<h3>📊 Policies, approvals, users, audit, and agent visibility.</h3>

</div>

---

## ✨ What this app is

`dashboard-web` is the shared customer dashboard for OpenLeash.

Teams use it to onboard, connect identity, manage users, configure policy, set BYOK evaluation keys, issue deployment tokens, review risky actions, and understand what agents are doing across their environment.

---

## 🧭 Product surfaces

- Organization setup and sign-in
- Identity provider configuration
- Users, roles, and deployment coverage
- Policies and approval flows
- Agents, MCP servers, skills, and external-agent observability
- Audit trails for risky, approved, denied, and held actions
- Provider/BYOK evaluation settings

---

## 🛠 Run locally

```bash
npm install
OPENLEASH_API_URL=http://localhost:9319 npm run dev:dashboard-web
```

Open:

```text
http://localhost:9300
```

Recommended full-mode runner:

```bash
python3 run.py
```

Choose **Private Cloud** or **OpenLeash Cloud**.

---

## 🌐 Used by

| Environment | How |
| --- | --- |
| 🏢 Private Cloud | Runs directly for one customer tenant. |
| ☁️ OpenLeash Cloud | Composed by `cloud-dashboard-web`. |
| 🧪 Local dev | Talks to `dashboard-api` on `localhost:9319`. |

---

## 🎨 UI direction

Operational, dense, calm. This is a working security console, not a marketing page.

Prefer readable tables, timelines, obvious states, crisp empty states, and controls that feel safe to use repeatedly.

<div align="center">

### Give security teams clarity without making developers feel trapped.

</div>
