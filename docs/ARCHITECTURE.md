# SmartBuild ERP - Architecture Documentation

## System Overview

SmartBuild ERP is a comprehensive construction industry ERP system built as a single-page application (SPA). It is designed to manage all aspects of construction project operations including project management, financial accounting, procurement, human resources, resource planning, cost control, collaboration, client portals, and AI-powered analytics.

**Tech Stack:**

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, standalone output) |
| Language | TypeScript 5 |
| Runtime | Bun |
| Database | SQLite via Prisma ORM 6 |
| State Management | Zustand 5 |
| UI Components | shadcn/ui (Radix UI primitives) |
| Styling | Tailwind CSS 4 |
| Data Fetching | TanStack React Query 5 |
| Forms | React Hook Form + Zod |
| Charts | Recharts 2 |
| Animations | Framer Motion 12 |
| Password Hashing | bcryptjs |
| Icons | Lucide React |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │  Zustand  │  │  React   │  │ shadcn/  │  │ TanStack      │  │
│  │  Store    │  │  Pages   │  │ ui       │  │ React Query   │  │
│  │ (auth,   │  │ (SPA     │  │ (Radix   │  │ (data cache)  │  │
│  │  nav,    │  │  routed) │  │  based)  │  │               │  │
│  │  theme)  │  │          │  │          │  │               │  │
│  └────┬─────┘  └────┬─────┘  └──────────┘  └──────┬────────┘  │
│       │             │                               │           │
│       └─────────────┴───────────────┬───────────────┘           │
│                                     │                           │
│                          ┌──────────▼──────────┐                │
│                          │   API Helper Layer   │                │
│                          │   (Bearer token,    │                │
│                          │    JSON req/res)    │                │
│                          └──────────┬──────────┘                │
└─────────────────────────────────────┼───────────────────────────┘
                                      │ HTTP
┌─────────────────────────────────────┼───────────────────────────┐
│                          NEXT.JS 16 SERVER (Standalone)         │
│                                     │                           │
│  ┌──────────────────────────────────▼──────────────────────┐    │
│  │              API Routes (src/app/api/*)                  │    │
│  │                                                          │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐              │    │
│  │  │  Auth    │  │  verify  │  │ require  │              │    │
│  │  │  Layer   │  │  Auth()  │  │  Role()  │              │    │
│  │  │ (bcrypt, │──│ (session │──│ (RBAC    │              │    │
│  │  │  tokens) │  │  lookup) │  │  check)  │              │    │
│  │  └──────────┘  └──────────┘  └──────────┘              │    │
│  │                                                          │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │    │
│  │  │ Projects │  │ Finance  │  │ Procure- │  │  HR &  │  │    │
│  │  │          │  │ Invoices │  │  ment    │  │ Labour │  │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └────────┘  │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │    │
│  │  │ Resources│  │   Cost   │  │ Collab-  │  │  AI &  │  │    │
│  │  │          │  │ Control  │  │  oration │  │Analytics│ │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └────────┘  │    │
│  │  ┌──────────┐  ┌──────────┐                              │    │
│  │  │  Sales   │  │  Client  │                              │    │
│  │  │          │  │  Portal  │                              │    │
│  │  └──────────┘  └──────────┘                              │    │
│  └──────────────────────────┬───────────────────────────────┘    │
│                             │                                    │
│  ┌──────────────────────────▼───────────────────────────────┐    │
│  │                    Prisma ORM 6                           │    │
│  │              (Query builder, migrations)                  │    │
│  └──────────────────────────┬───────────────────────────────┘    │
│                             │                                    │
│  ┌──────────────────────────▼───────────────────────────────┐    │
│  │                   SQLite Database                         │    │
│  │               (73 models, file-based)                     │    │
│  └─────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
                                      │
                              ┌───────▼───────┐
                              │  Caddy Server  │
                              │  (reverse      │
                              │   proxy, TLS)  │
                              └───────────────┘
```

---

## Module List

The system is organized into the following functional modules:

### 1. Authentication & User Management
Handles login, logout, registration, session management, user CRUD, and account lockout.
- **Files:** `src/lib/auth.ts`, `src/lib/api-auth.ts`, `src/app/api/auth/*`

### 2. Project Management
Full project lifecycle management including tasks, milestones, documents, daily notes, team members, comments, open items, and prime contracts.
- **Files:** `src/app/api/projects/*`, `src/components/projects/*`

### 3. Finance
Invoicing, payments, bill of quantities (BOQ), daybook entries, cashflow tracking, loans, and milestone payments.
- **Files:** `src/app/api/invoices/*`, `src/app/api/payments/*`, `src/app/api/boq/*`, `src/app/api/daybook/*`, `src/app/api/cashflow/*`, `src/app/api/loans/*`

### 4. Procurement
Purchase requests (with approval workflow), purchase orders, supplier management, material inventory with stock movements.
- **Files:** `src/app/api/purchase-requests/*`, `src/app/api/purchase-orders/*`, `src/app/api/suppliers/*`, `src/app/api/materials/*`

### 5. Labour & HR
Labour groups, individual labour records, attendance tracking, payroll generation and payment, employee management, leave request workflow, advance payments.
- **Files:** `src/app/api/labour-groups/*`, `src/app/api/labour/*`, `src/app/api/attendance/*`, `src/app/api/payroll/*`, `src/app/api/employees/*`, `src/app/api/leave-requests/*`

### 6. Operations
Subcontractor management, work orders, asset management (with issue tracking and maintenance scheduling), project scheduling.
- **Files:** `src/app/api/subcontractors/*`, `src/app/api/work-orders/*`, `src/app/api/assets/*`, `src/app/api/scheduling/*`

### 7. Resource Management
Resource dashboard, planning, labour/equipment/vehicle/tool resource tracking, crew management, resource requests with approval workflow, productivity logging, and resource forecasting.
- **Files:** `src/app/api/resources/*`, `src/components/resources/*`

### 8. Cost Control
Cost code management, budget management with line items and snapshots, budget change orders, cost forecasting, and cost control dashboard.
- **Files:** `src/app/api/cost-control/*`, `src/components/cost-control/*`

### 9. Collaboration
RFI (Request for Information) management, submittals, threaded discussions with comments, approvals center, and announcements.
- **Files:** `src/app/api/collaboration/*`, `src/components/collaboration/*`

### 10. Sales
Product catalog, product categories, customer management, sales quotations, and sales invoices.
- **Files:** `src/app/api/products/*`, `src/app/api/product-categories/*`, `src/app/api/customers/*`, `src/app/api/sales-invoices/*`

### 11. Client Portal
Isolated portal for clients to view their projects, track progress, view invoices and documents, and submit complaints.
- **Files:** `src/app/api/client-portal/*`, `src/components/client-portal/*`

### 12. AI & Analytics
AI-powered forecasting, insights generation, project analytics, advanced reporting, and an analytics dashboard.
- **Files:** `src/app/api/ai/*`, `src/app/api/analytics/*`, `src/components/ai/*`

### 13. Notifications
In-app notification system with user preferences (in-app, email, SMS channels).
- **Files:** `src/app/api/dashboard/notifications/*`, `src/components/notifications/*`

### 14. Audit Logging
Comprehensive audit trail for all CRUD operations with user, action, entity, and IP tracking.
- **Files:** `src/app/api/audit-log/*`, `src/lib/auth.ts` (createAuditLog)

### 15. Reports & Dashboard
Executive dashboard with KPIs, and a reports module for generating various business reports.
- **Files:** `src/app/api/dashboard/*`, `src/app/api/reports/*`, `src/components/dashboard/*`, `src/components/reports/*`

---

## API Structure

All API routes follow Next.js App Router conventions under `src/app/api/`. Each route exports handler functions for the HTTP methods it supports (GET, POST, PUT, DELETE).

### Route Organization

```
src/app/api/
├── auth/                    # Authentication
│   ├── login/route.ts       # POST - Login
│   ├── logout/route.ts      # POST - Logout
│   ├── me/route.ts          # GET - Current user
│   └── users/route.ts       # CRUD - User management
├── dashboard/               # Dashboard & Notifications
│   ├── stats/route.ts
│   └── notifications/
├── projects/                # Project management (+ 15 sub-routes)
├── invoices/                # Invoice management
├── payments/                # Payment management
├── boq/                     # Bill of Quantities
├── daybook/                 # Day book entries
├── cashflow/                # Cashflow reports
├── loans/                   # Loan management
├── purchase-requests/       # PR workflow (+ approve/reject)
├── purchase-orders/         # PO management
├── suppliers/               # Supplier management
├── materials/               # Material inventory (+ stock adjustment)
├── labour-groups/           # Labour groups (+ members)
├── labour/                  # Individual labour records
├── attendance/              # Attendance tracking
├── payroll/                 # Payroll (+ generate, pay)
├── employees/               # Employee management
├── leave-requests/          # Leave workflow (+ approve/reject)
├── subcontractors/          # Subcontractor management
├── work-orders/             # Work order management
├── assets/                  # Asset management
├── scheduling/              # Project scheduling
├── resources/               # Resource management (8 sub-routes)
├── cost-control/            # Cost control (7 sub-routes)
├── collaboration/           # Collaboration (7 sub-routes)
├── products/                # Product catalog
├── product-categories/      # Product categories
├── customers/               # Customer management
├── sales-invoices/          # Sales invoices
├── client-portal/           # Client portal (6 sub-routes)
├── ai/                      # AI features (3 sub-routes)
├── analytics/               # Analytics (4 sub-routes)
├── audit-log/               # Audit log
├── reports/                 # Reports
└── notifications/           # Notifications
```

### Standard Response Format

All API responses use a consistent JSON envelope:

```json
// Success
{
  "success": true,
  "data": { ... }
}

// Error
{
  "success": false,
  "error": "Human-readable error message"
}

// Paginated List
{
  "success": true,
  "data": [...],
  "total": 150,
  "page": 1,
  "limit": 50
}
```

---

## Authentication & Authorization

### Authentication Flow

1. User submits email + password to `POST /api/auth/login`
2. Server validates credentials against bcrypt-hashed password in SQLite
3. On success, a session is created with a UUID token (7-day expiry)
4. Client stores token in `localStorage` as `sb_token`
5. All subsequent API requests include `Authorization: Bearer <token>` header
6. `verifyAuth()` looks up the session, checks expiry, revocation, and user active status

### Authorization (RBAC)

The system implements **Role-Based Access Control** with 10 roles organized in a hierarchy:

| Role | Level | Description |
|------|-------|-------------|
| `super_admin` | 100 | Full system access, bypasses all permission checks |
| `admin` | 90 | Full system access like super_admin |
| `supervisor` | 70 | Project management and field operations |
| `auditor` | 65 | Read-only access to financial and audit data |
| `hr_manager` | 60 | HR, labour, attendance, payroll, employees, leave |
| `accountant` | 60 | Finance, invoices, payments, budgets, cost control |
| `store_manager` | 60 | Procurement, inventory, assets, resources |
| `client` | 30 | Client portal only |
| `vendor` | 30 | Vendor portal (purchase orders, suppliers) |
| `labour` | 20 | Minimal access (dashboard, attendance, settings) |

**Key rules:**
- `super_admin` and `admin` always pass `requireRole()` regardless of the required roles list
- Route permissions are defined in `ROUTE_PERMISSIONS` array mapping patterns to allowed roles per HTTP method
- Page access (sidebar visibility) is defined in `PAGE_ACCESS` mapping
- `filterNavForRole()` dynamically hides navigation items based on role

### Rate Limiting

In-memory rate limiting is implemented per IP address:
- **Limit:** 20 requests per minute
- **Window:** 60 seconds
- Stale entries are cleaned up every 5 minutes

### Account Lockout

- After **5 consecutive failed login attempts**, the account is locked for **15 minutes**
- Successful login resets the failed attempt counter
- Lockout expiry is checked on each login attempt

---

## Frontend Architecture

### SPA Routing with Zustand

The application does **not** use Next.js file-based routing for navigation. Instead, it operates as a single-page application where:

- The entire app renders inside `src/app/page.tsx` and `src/components/layout/app-layout.tsx`
- Navigation state is managed by the Zustand store (`src/lib/store.ts`)
- The `currentPage` field of type `AppPage` (a union of 50+ string literals) determines which component to render
- The `navigate(page, params)` action updates `currentPage` and `pageParams`
- Breadcrumbs are automatically generated from page labels

### State Management (Zustand Store)

The `useAppStore` Zustand store manages:
- **Auth state:** `user`, `token`, `isAuthenticated`
- **Navigation state:** `currentPage`, `pageParams`, `breadcrumbs`, `sidebarOpen`
- **Theme state:** `light` / `dark` / `system`

An API helper is exported from the store module:
```typescript
api.get<T>(url)       // GET request
api.post<T>(url, body) // POST request
api.put<T>(url, body)  // PUT request
api.del<T>(url)        // DELETE request
```

### UI Components

All UI components use the **shadcn/ui** pattern:
- Built on Radix UI primitives
- Styled with Tailwind CSS
- Located in `src/components/ui/`
- 25+ components available (button, card, dialog, table, form, tabs, etc.)

### Query Key Factory

TanStack React Query keys are centralized in `src/lib/store.ts`:
```typescript
queryKeys.projects       // ['projects']
queryKeys.project(id)    // ['projects', id]
queryKeys.invoices       // ['invoices']
queryKeys.cashflow(m, y) // ['cashflow', m, y]
```

---

## Database Architecture

### Database: SQLite

SmartBuild ERP uses **SQLite** as its database, which is well-suited for construction companies that need a self-contained, zero-configuration database that runs without a separate database server.

### ORM: Prisma 6

The Prisma schema defines **73 models** covering all business domains:

| Domain | Models |
|--------|--------|
| Auth & Users | User, Session, AuditLog, Notification, NotificationPreference |
| Projects | Project, ProjectMember, ProjectTask, ProjectMilestone, ProjectDocument, DailyNote, ProjectTeamMember, OpenItem, ProjectComment, PrimeContract |
| Finance | Invoice, InvoiceItem, Payment, BOQ, BOQItem, Expense, DayBookEntry, MilestonePayment |
| Procurement | Supplier, Material, StockMovement, PurchaseRequest, PurchaseRequestItem, PurchaseOrder, PurchaseOrderItem |
| Labour & HR | LabourGroup, Labour, Attendance, Payroll, AdvancePayment, Employee, LeaveRequest, Loan |
| Operations | SubContractor, WorkOrder, Asset, AssetIssue, AssetMaintenance |
| Sales | ProductCategory, Product, Customer, SalesQuotation, SalesInvoice |
| Cost Control | CostCode, Budget, BudgetLineItem, BudgetLineItemUpdate, BudgetChangeOrder, BudgetSnapshot |
| Resources | ResourceAssignment, ResourceRequest, Crew, CrewMember, Skill, WorkerSkill, ProductivityLog |
| Collaboration | Submittal, Discussion, DiscussionComment, Announcement, RFI, RFIComment, ChangeEvent, ChangeOrder |
| Project Finance | ProjectCommitment, DirectCost |
| AI | AIInsight |
| Client Portal | ClientComplaint |

### Database Connection

The Prisma client is instantiated in `src/lib/db.ts` with:
- Singleton pattern in development (prevents connection pool exhaustion during hot reload)
- Query logging enabled in development mode
- Connection string from `DATABASE_URL` environment variable

---

## Security Architecture

### Authentication Security
- Passwords hashed with **bcryptjs** (10 salt rounds)
- Session tokens are **UUID v4** values, not guessable sequences
- Sessions expire after **7 days**
- Sessions can be **revoked** individually
- All sessions for a user are revoked on account deactivation

### Account Lockout
- **5 failed login attempts** triggers a 15-minute lockout
- Failed attempt counter resets on successful login
- Locked accounts cannot authenticate even with correct credentials

### API Security
- Every API route (except login) requires a valid `Authorization: Bearer <token>` header
- Token validation checks: existence, revocation, expiry, and user active status
- Role-based access control enforced per-route per-method via `ROUTE_PERMISSIONS`
- `super_admin` bypasses all role checks

### Rate Limiting
- 20 requests per minute per IP address
- Returns HTTP 429 when limit exceeded

### Audit Logging
- All significant operations (CREATE, UPDATE, DELETE, LOGIN, LOGOUT) are logged
- Audit entries capture: user ID, action, entity type, entity ID, old/new values, IP address
- Audit log failures are silently caught to avoid blocking main operations

### Data Isolation
- Client portal API routes filter data by client association
- Client users can only see their own projects, invoices, and documents
- Cross-tenant access is prevented by the API layer

---

## Feature Flags System

The application does not currently implement a dynamic feature flag system. However, role-based access serves as a form of feature gating:

- **Page-level gating:** `canAccessPage(role, page)` determines if a page appears in the sidebar
- **API-level gating:** `canAccessRoute(role, pathname, method)` determines if an API call is permitted
- **Navigation filtering:** `filterNavForRole(sections, role)` hides entire navigation sections when a role has no access to any items in that section

This can be extended to a proper feature flag system by adding a `features` field to the `PAGE_ACCESS` or `ROUTE_PERMISSIONS` structures.

---

## Deployment Notes

### Output Mode

The application builds in **standalone** mode (`output: "standalone"` in `next.config.ts`), which produces a self-contained server bundle that includes all necessary dependencies.

### Reverse Proxy

A **Caddy** configuration file is provided (`Caddyfile`) that:
- Listens on port 81
- Supports dynamic port transformation via query parameter
- Proxies to `localhost:3000`
- Forwards `Host`, `X-Forwarded-For`, `X-Forwarded-Proto`, and `X-Real-IP` headers

### Environment

- **Runtime:** Bun (recommended) or Node.js
- **Database:** SQLite (file-based, no external DB server needed)
- **No external services required** for core functionality

### Static Assets

After building, static assets are copied into the standalone output:
```bash
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/
```

---

## Directory Structure

```
smartbuild-erp/
├── prisma/
│   └── schema.prisma          # 73 database models
├── src/
│   ├── app/
│   │   ├── api/               # All API route handlers
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # SPA entry point
│   ├── components/
│   │   ├── ui/                # shadcn/ui components (25+)
│   │   ├── layout/            # App layout, sidebar, navigation
│   │   ├── auth/              # Login page
│   │   ├── dashboard/         # Dashboard
│   │   ├── projects/          # Project pages
│   │   ├── finance/           # Finance pages
│   │   ├── procurement/       # Procurement pages
│   │   ├── hr/                # HR pages
│   │   ├── resources/         # Resource management pages
│   │   ├── cost-control/      # Cost control pages
│   │   ├── collaboration/     # Collaboration pages
│   │   ├── client-portal/     # Client portal pages
│   │   ├── ai/                # AI & analytics pages
│   │   ├── landing/           # Marketing landing page
│   │   └── ...                # Other feature pages
│   ├── hooks/                 # Custom React hooks
│   └── lib/
│       ├── auth.ts            # Auth utilities (verify, session, audit, rate limit)
│       ├── api-auth.ts        # API auth middleware helper
│       ├── rbac.ts            # RBAC configuration (roles, page access, route permissions)
│       ├── db.ts              # Prisma client singleton
│       ├── store.ts           # Zustand store + API helper + query keys
│       ├── seed.ts            # Database seed script
│       ├── seed-collaboration.ts # Collaboration seed script
│       └── utils.ts           # General utilities
├── public/                    # Static assets
├── docs/                      # Documentation
├── tests/                     # Test files
├── Caddyfile                  # Caddy reverse proxy config
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies and scripts
└── bun.lock                   # Bun lockfile
```