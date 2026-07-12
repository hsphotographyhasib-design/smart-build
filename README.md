# SmartBuild EPPM

**SmartBuild** is an Enterprise Project Portfolio Management (EPPM) platform for the construction industry, inspired by Primavera P6. It brings portfolios, programs, projects, schedules, costs, resources, and field operations together in a single modern web application.

Built with Next.js 16, React 19, TypeScript, Tailwind CSS 4, and Prisma on PostgreSQL.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Running the App](#running-the-app)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Authentication](#authentication)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Features

SmartBuild ships with 50+ integrated views organized around the full project lifecycle:

### Portfolio & Planning
- **Portfolios, Programs & Projects** — Primavera-style organizational hierarchy with health, budget, and status tracking
- **WBS & Activities** — work breakdown structures with activity-level scheduling
- **Gantt, Critical Path & Lookahead** — interactive scheduling and short-interval planning
- **Baselines, Milestones & Compare** — baseline management and plan-vs-actual comparison
- **What-If Analysis** — scenario modeling for schedules and costs
- **AI Planner** — AI-assisted project planning

### Cost & Commercial
- **Costs, Cashflow & Accounts** — budget, actual, committed, and forecast cost tracking
- **Earned Value Management (EVM)** — performance measurement against baselines
- **Procurement & Tendering** — sourcing, procurement operations, and tender management
- **Changes & Claims** — change order and claims management

### Field Operations
- **Site Progress & Daily Reports** — field progress capture and reporting
- **Work Orders & Maintenance** — persistent maintenance workflow shared across surfaces
- **Equipment, Fleet & Inventory** — asset and materials management
- **Quality, HSE & Commissioning** — quality control, health & safety, and handover
- **Mobile Screens** — dedicated mobile views for work orders, complaints, and notifications

### Management & Administration
- **Dashboards & Executive Reports** — KPI cards, charts, and portfolio-level reporting
- **Resources, Workforce & HR** — resource allocation and workforce management
- **Documents & Submittals** — document control and submittal workflows
- **Risks & Workflow Engine** — risk registers and configurable workflows
- **Admin, Security & Integrations** — user/role management and system administration
- **Data Export** — export project data via the export API

The UI features a unified app shell with a token-driven layout, floating navigation, global search, notifications, and a fully responsive, device-adaptive design across all breakpoints.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) with [React 19](https://react.dev/) |
| Language | [TypeScript 5](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives), [Framer Motion](https://www.framer.com/motion/) |
| Data | [Prisma 6](https://www.prisma.io/) ORM on PostgreSQL |
| State & Data Fetching | [Zustand](https://zustand-demo.pmnd.rs/), [TanStack Query](https://tanstack.com/query) & [TanStack Table](https://tanstack.com/table) |
| Forms & Validation | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| Auth | JWT sessions ([jose](https://github.com/panva/jose)), Google OAuth, WhatsApp OTP |
| Charts | [Recharts](https://recharts.org/) |
| Runtime / Package Manager | [Bun](https://bun.sh/) |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) v1.x (used as both package manager and production runtime)
- [PostgreSQL](https://www.postgresql.org/) database (local, or hosted such as Prisma Postgres / Neon / Supabase)

### Installation

```bash
git clone https://github.com/hsphotographyhasib-design/smart-build.git
cd smart-build
bun install
```

### Environment Variables

Copy the example file and fill in your values. **Never commit your real `.env`.**

```bash
cp .env.example .env
```

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `AUTH_SECRET` | Yes | Long random string used to sign session JWTs |
| `APP_URL` | Yes | Base URL of the app (`http://localhost:3000` in dev) — used for OAuth redirects |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional | Enables Google sign-in ([create credentials](https://console.cloud.google.com/apis/credentials)) |
| `WHATSAPP_TOKEN` / `WHATSAPP_PHONE_ID` | Optional | Enables WhatsApp OTP login; when blank a dev stub shows the code in the UI/console |

Generate a strong `AUTH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

### Database Setup

```bash
# Generate the Prisma client
bun run db:generate

# Push the schema to your database
bun run db:push

# Seed demo data
bun prisma/seed.ts

# Create/refresh a demo Super Admin account
bun prisma/create-admin.ts
```

### Running the App

```bash
# Development (http://localhost:3000)
bun run dev

# Production
bun run build
bun run start
```

## Available Scripts

| Script | Description |
|---|---|
| `bun run dev` | Start the dev server on port 3000 (output logged to `dev.log`) |
| `bun run build` | Create a production build |
| `bun run start` | Run the standalone production server with Bun |
| `bun run lint` | Lint the codebase with ESLint |
| `bun run db:generate` | Generate the Prisma client |
| `bun run db:push` | Push the Prisma schema to the database |
| `bun run db:migrate` | Create and apply a development migration |
| `bun run db:reset` | Reset the database and re-run migrations |

## Project Structure

```
smart-build/
├── prisma/
│   ├── schema.prisma        # Data model (portfolios, programs, projects, ...)
│   ├── seed.ts              # Demo data seeder
│   └── create-admin.ts      # Demo Super Admin bootstrap
├── public/                  # Static assets (logo, icons, PWA manifest)
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/             # API routes (auth, admin, dashboard, projects, ...)
│   │   ├── app/             # Main application shell page
│   │   └── login/           # Login page
│   ├── components/
│   │   ├── auth/            # Auth context/provider
│   │   ├── eppm/            # App shell, navigation, and all EPPM views
│   │   │   └── views/       # 50+ feature views (Gantt, EVM, HSE, ...)
│   │   └── ui/              # shadcn/ui primitives
│   └── lib/                 # Auth, database client, domain logic, utilities
├── examples/                # Reference examples (e.g. WebSocket server)
├── mini-services/           # Optional companion services
├── .zscripts/               # Dev/build/start helper scripts
├── Caddyfile                # Reverse-proxy configuration
└── vercel.json              # Vercel deployment configuration
```

## Authentication

SmartBuild supports three sign-in methods:

1. **Email & password** — credentials with bcrypt-hashed passwords
2. **Google OAuth** — configure `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` and register the redirect URI `<APP_URL>/api/auth/google/callback`
3. **WhatsApp OTP** — one-time codes via the WhatsApp Business API; falls back to a development stub when credentials are not set

Sessions are stateless JWTs signed with `AUTH_SECRET`. Role-based access (e.g. Super Admin) is managed through the admin views.

## Deployment

- **Vercel** — the repository includes a `vercel.json`; set the environment variables from the table above in your project settings.
- **Self-hosted** — build with `bun run build`, run the standalone server with `bun run start`, and front it with the included `Caddyfile` (or any reverse proxy). Helper scripts for build/start live in `.zscripts/`.

## Contributing

1. Fork the repository and create a feature branch
2. Make your changes and run `bun run lint`
3. Commit with a clear, descriptive message
4. Open a pull request describing the change

---

Maintained by the SmartBuild team.
