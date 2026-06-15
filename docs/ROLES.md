# SmartBuild ERP - Roles & Permissions

## Role Definitions

SmartBuild ERP uses **10 roles** organized in a hierarchical permission model. Higher-level roles inherit or bypass permissions of lower-level roles.

| Role | Level | Label | Description |
|------|-------|-------|-------------|
| `super_admin` | 100 | Super Admin | Full unrestricted access to all features, pages, and APIs. Bypasses all RBAC checks. |
| `admin` | 90 | Admin | Full access to all features, identical to super_admin in terms of permissions. |
| `supervisor` | 70 | Supervisor | Manages projects, field operations, collaboration, and has read access to most areas. |
| `auditor` | 65 | Auditor | Read-only access to financial data, cost control, projects, and audit logs for compliance review. |
| `hr_manager` | 60 | HR Manager | Manages employees, labour groups, attendance, payroll, leave requests, and loans. |
| `accountant` | 60 | Accountant | Manages invoices, payments, budgets, BOQ, daybook, cashflow, and cost control. |
| `store_manager` | 60 | Store Manager | Manages procurement (PRs, POs), inventory, suppliers, assets, and resource allocation. |
| `client` | 30 | Client | External client with access to the client portal to view their projects and submit complaints. |
| `vendor` | 30 | Vendor | External vendor with access to view purchase orders and supplier information. |
| `labour` | 20 | Labour | Minimal access — dashboard, attendance recording, notifications, and settings. |

---

## Role Hierarchy

```
Level 100  ┌─────────────┐
           │ super_admin │  Full system access, bypasses all checks
           └──────┬──────┘
                  │
Level  90  ┌──────┴──────┐
           │    admin    │  Full system access
           └──────┬──────┘
                  │
Level  70  ┌──────┴──────┐
           │  supervisor  │  Projects, operations, collaboration
           └──────┬──────┘
                  │
Level  65  ┌──────┴──────┐
           │   auditor   │  Read-only financial & audit access
           └──────┬──────┘
                  │
Level  60  ┌──────┴──────────────────────────┐
           │ hr_manager │ accountant │ store_manager │
           │ (HR/Labour)│ (Finance)   │ (Procurement)  │
           └──────┬────────────────────────────┬────┘
                  │                            │
Level  30  ┌──────┴──────┐          ┌─────────┴──────┐
           │   client    │          │     vendor     │
           │ (Portal)    │          │  (PO Portal)   │
           └──────┬──────┘          └────────┬───────┘
                  │                          │
Level  20  ┌──────┴──────┐          ┌────────┴───────┐
           │   labour    │          │                │
           │ (Minimal)   │          │                │
           └─────────────┘          └────────────────┘
```

### Key Hierarchy Rules

1. **`super_admin`** and **`admin`** always pass `requireRole()` regardless of the required roles list.
2. **`super_admin`** always passes `canAccessRoute()` regardless of route permissions.
3. `hasMinRoleLevel(userRole, minRole)` compares numeric levels for hierarchical checks.
4. Same-level roles (hr_manager, accountant, store_manager at level 60; client, vendor at level 30) have **non-overlapping** domain-specific permissions.

---

## Page Access by Role

The following table shows which pages each role can see in the sidebar navigation. This is enforced by `canAccessPage()` in `src/lib/rbac.ts`.

| Page | super_admin | admin | supervisor | auditor | hr_manager | accountant | store_manager | client | vendor | labour |
|------|:-----------:|:-----:|:----------:|:-------:|:----------:|:----------:|:------------:|:------:|:------:|:------:|
| **Main** |
| dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Project Management** |
| projects | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | | ✅ | | |
| project-detail | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | | | | |
| project-tasks | ✅ | ✅ | ✅ | | | | | | | |
| project-finance | ✅ | ✅ | ✅ | ✅ | | ✅ | | | | |
| project-documents | ✅ | ✅ | ✅ | | | | | | | |
| project-daily-notes | ✅ | ✅ | ✅ | | | | | | | |
| scheduling | ✅ | ✅ | ✅ | | ✅ | | | | | |
| **Finance** |
| invoices | ✅ | ✅ | | ✅ | | ✅ | | | | |
| payments | ✅ | ✅ | | ✅ | | ✅ | | | | |
| boq | ✅ | ✅ | | ✅ | | ✅ | | | | |
| daybook | ✅ | ✅ | | ✅ | | ✅ | | | | |
| cashflow | ✅ | ✅ | | ✅ | | ✅ | | | | |
| **Procurement** |
| purchase-requests | ✅ | ✅ | | | | | ✅ | | | |
| purchase-orders | ✅ | ✅ | | | | | ✅ | | ✅ | |
| suppliers | ✅ | ✅ | | | | | ✅ | | ✅ | |
| inventory | ✅ | ✅ | | | | | ✅ | | | |
| **Labour & HR** |
| labour-groups | ✅ | ✅ | | | ✅ | | | | | |
| attendance | ✅ | ✅ | | | ✅ | | | | | ✅ |
| payroll | ✅ | ✅ | | | ✅ | | | | | |
| employees | ✅ | ✅ | | | ✅ | | | | | |
| leave | ✅ | ✅ | | | ✅ | | | | | |
| **Operations** |
| subcontractors | ✅ | ✅ | ✅ | | ✅ | | | | | |
| work-orders | ✅ | ✅ | ✅ | | ✅ | | | | | |
| assets | ✅ | ✅ | ✅ | | | | ✅ | | | |
| **Sales** |
| product-catalog | ✅ | ✅ | | | | | | | | |
| customers | ✅ | ✅ | | | | | | | | |
| sales-invoices | ✅ | ✅ | | | | | | | | |
| **Resource Management** |
| resource-dashboard | ✅ | ✅ | ✅ | | | | ✅ | | | |
| resource-planning | ✅ | ✅ | ✅ | | | | ✅ | | | |
| labour-resources | ✅ | ✅ | ✅ | | | | ✅ | | | |
| equipment-resources | ✅ | ✅ | ✅ | | | | ✅ | | | |
| vehicle-resources | ✅ | ✅ | ✅ | | | | ✅ | | | |
| tool-resources | ✅ | ✅ | ✅ | | | | ✅ | | | |
| crew-management | ✅ | ✅ | ✅ | | | | ✅ | | | |
| resource-requests | ✅ | ✅ | ✅ | | | | ✅ | | | |
| resource-productivity | ✅ | ✅ | ✅ | | | | ✅ | | | |
| resource-forecasting | ✅ | ✅ | ✅ | | | | ✅ | | | |
| **Cost Control** |
| cost-control-dashboard | ✅ | ✅ | ✅ | ✅ | | ✅ | | | | |
| budget-management | ✅ | ✅ | ✅ | ✅ | | ✅ | | | | |
| cost-codes | ✅ | ✅ | ✅ | ✅ | | ✅ | | | | |
| budget-change-orders | ✅ | ✅ | ✅ | ✅ | | ✅ | | | | |
| cost-forecasting | ✅ | ✅ | ✅ | ✅ | | ✅ | | | | |
| **Collaboration** |
| collaboration-dashboard | ✅ | ✅ | ✅ | | | | | | | |
| collaboration-rfis | ✅ | ✅ | ✅ | | | | | | | |
| collaboration-submittals | ✅ | ✅ | ✅ | | | | | | | |
| collaboration-discussions | ✅ | ✅ | ✅ | | | | | | | |
| collaboration-approvals | ✅ | ✅ | ✅ | | | | | | | |
| collaboration-announcements | ✅ | ✅ | ✅ | | | | | | | |
| **Client Portal** |
| client-dashboard | ✅ | ✅ | ✅ | | | | | ✅ | | |
| client-progress | ✅ | ✅ | ✅ | | | | | ✅ | | |
| client-invoices | ✅ | ✅ | ✅ | | | | | ✅ | | |
| client-documents | ✅ | ✅ | ✅ | | | | | ✅ | | |
| client-complaints | ✅ | ✅ | ✅ | | | | | ✅ | | |
| **AI & Analytics** |
| ai-dashboard | ✅ | ✅ | ✅ | ✅ | | | | | | |
| ai-insights | ✅ | ✅ | ✅ | ✅ | | | | | | |
| ai-forecast | ✅ | ✅ | ✅ | | | | | | | |
| project-analytics | ✅ | ✅ | ✅ | ✅ | | | | | | |
| advanced-reports | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | | | | |
| **System** |
| reports | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | | | |
| notifications | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| audit-log | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | | | |
| settings | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| users | ✅ | ✅ | | | | | | | | |

---

## API Permission Matrix

The `ROUTE_PERMISSIONS` array in `src/lib/rbac.ts` defines which roles can access each API route pattern per HTTP method. Below is a summary of the key API permission patterns.

### Legend
- `SA` = super_admin | `A` = admin | `S` = supervisor | `AU` = auditor
- `HR` = hr_manager | `AC` = accountant | `SM` = store_manager
- `CL` = client | `VE` = vendor | `LA` = labour | `*` = any authenticated user

### Authentication & Users

| Route | GET | POST | PUT | DELETE |
|-------|-----|------|-----|--------|
| `/api/auth/login` | — | `*` | — | — |
| `/api/auth/register` | — | SA, A | — | — |
| `/api/auth/me` | `*` | — | — | — |
| `/api/auth/logout` | — | `*` | — | — |
| `/api/auth/users` | SA, A, HR | SA, A | SA, A | SA, A |

### Projects

| Route | GET | POST | PUT | DELETE |
|-------|-----|------|-----|--------|
| `/api/projects` | SA, A, S, HR, AC, SM, AU, CL | SA, A, S | — | — |
| `/api/projects/[id]` | `*` | — | SA, A, S | SA, A |
| `/api/projects/[id]/tasks` | `*` | SA, A, S, HR | SA, A, S, HR | SA, A, S |
| `/api/projects/[id]/team` | `*` | SA, A, S | SA, A, S | SA, A |
| `/api/projects/[id]/documents` | `*` | SA, A, S | — | SA, A, S |
| `/api/projects/[id]/daily-notes` | `*` | SA, A, S | — | — |
| `/api/projects/[id]/finance` | SA, A, S, AC, AU | — | — | — |
| `/api/projects/[id]/prime-contract` | SA, A, S, AC | — | SA, A | — |
| `/api/projects/[id]/commitments` | SA, A, S, AC, AU | — | SA, A, AC | SA, A |
| `/api/projects/[id]/direct-costs` | SA, A, S, AC, AU | SA, A, AC | SA, A, AC | SA, A, AC |
| `/api/projects/[id]/change-orders` | SA, A, S, AC, AU | SA, A, S | SA, A, S | SA, A |
| `/api/projects/[id]/change-orders/[coId]/approve` | — | SA, A | — | — |
| `/api/projects/[id]/insights` | SA, A, S, AU | — | — | — |

### Finance

| Route | GET | POST | PUT | DELETE |
|-------|-----|------|-----|--------|
| `/api/invoices` | SA, A, S, AC, AU | SA, A, AC | — | — |
| `/api/invoices/[id]` | SA, A, S, AC, AU, CL | — | SA, A, AC | SA, A, AC |
| `/api/payments` | SA, A, S, AC, AU | SA, A, AC | — | — |
| `/api/payments/[id]` | `*` | — | SA, A, AC | SA, A, AC |
| `/api/boq` | SA, A, S, AC, SM, AU | SA, A, S, SM | — | — |
| `/api/daybook` | SA, A, AC, AU | SA, A, AC | SA, A, AC | SA, A, AC |
| `/api/cashflow` | SA, A, AC, AU | — | — | — |
| `/api/loans` | SA, A, HR, AC | SA, A, HR | — | — |

### Procurement

| Route | GET | POST | PUT | DELETE |
|-------|-----|------|-----|--------|
| `/api/purchase-requests` | SA, A, S, SM, AC, AU | SA, A, S, SM | — | — |
| `/api/purchase-requests/[id]` | `*` | — | SA, A, S, SM | SA, A |
| `/api/purchase-requests/[id]/approve` | — | SA, A | — | — |
| `/api/purchase-requests/[id]/reject` | — | SA, A | — | — |
| `/api/purchase-orders` | SA, A, S, SM, AC, AU, VE | SA, A, SM | — | — |
| `/api/purchase-orders/[id]` | `*` | — | SA, A, SM | SA, A |
| `/api/suppliers` | SA, A, SM, AC, AU | SA, A, SM | — | — |
| `/api/materials` | SA, A, SM, AU | SA, A, SM | SA, A, SM | SA, A, SM |

### Labour & HR

| Route | GET | POST | PUT | DELETE |
|-------|-----|------|-----|--------|
| `/api/labour-groups` | SA, A, HR, S, SM | SA, A, HR | — | — |
| `/api/labour-groups/[id]` | `*` | — | SA, A, HR | SA, A |
| `/api/labour-groups/[id]/members` | `*` | SA, A, HR | — | SA, A, HR |
| `/api/attendance` | SA, A, HR, S, LA | SA, A, HR, S | — | — |
| `/api/payroll` | SA, A, HR, AC, AU | — | — | — |
| `/api/payroll/generate` | — | SA, A, HR | — | — |
| `/api/payroll/[id]/pay` | — | SA, A, AC | — | — |
| `/api/employees` | SA, A, HR | SA, A, HR | — | — |
| `/api/employees/[id]` | `*` | — | SA, A, HR | SA, A, HR |
| `/api/leave-requests` | SA, A, HR, S | `*` | — | — |
| `/api/leave-requests/[id]/approve` | — | SA, A, HR | — | — |
| `/api/leave-requests/[id]/reject` | — | SA, A, HR | — | — |

### Operations

| Route | GET | POST | PUT | DELETE |
|-------|-----|------|-----|--------|
| `/api/subcontractors` | SA, A, S, SM | SA, A, S | SA, A, S | SA, A |
| `/api/work-orders` | SA, A, S, SM | SA, A, S | SA, A, S | SA, A |
| `/api/assets` | SA, A, SM, S | SA, A, SM | SA, A, SM | SA, A, SM |
| `/api/scheduling` | SA, A, S, HR | SA, A, S | — | — |

### Resources

| Route | GET | POST | PUT | DELETE |
|-------|-----|------|-----|--------|
| `/api/resources/dashboard` | SA, A, SM, S | — | — | — |
| `/api/resources/skills` | `*` | SA, A, HR, SM | SA, A, HR, SM | SA, A |
| `/api/resources/crews` | SA, A, SM, S, HR | SA, A, SM | SA, A, SM | SA, A, SM |
| `/api/resources/requests` | SA, A, SM, S | `*` | SA, A, SM | — |
| `/api/resources/productivity` | SA, A, SM, S, AU | SA, A, S | SA, A, S | — |

### Cost Control

| Route | GET | POST | PUT | DELETE |
|-------|-----|------|-----|--------|
| `/api/cost-control/dashboard` | SA, A, S, AC, AU | — | — | — |
| `/api/cost-control/forecast` | SA, A, AC, AU | — | — | — |
| `/api/cost-control/cost-codes` | SA, A, S, AC, AU | SA, A, AC | SA, A, AC | SA, A |
| `/api/cost-control/budgets` | SA, A, S, AC, AU | SA, A, AC | SA, A, AC | SA, A |
| `/api/cost-control/budgets/[id]/line-items` | `*` | SA, A, AC | SA, A, AC | SA, A, AC |
| `/api/cost-control/budgets/[id]/snapshots` | SA, A, AC | SA, A, AC | — | — |
| `/api/cost-control/budgets/[id]/change-orders` | `*` | SA, A, S, AC | SA, A, AC | SA, A |

### Collaboration

| Route | GET | POST | PUT | DELETE |
|-------|-----|------|-----|--------|
| `/api/collaboration/dashboard` | `*` | — | — | — |
| `/api/collaboration/discussions` | `*` | `*` | SA, A | SA, A |
| `/api/collaboration/discussions/[id]/comments` | `*` | `*` | — | — |
| `/api/collaboration/announcements` | `*` | SA, A, S | SA, A | SA, A |
| `/api/collaboration/submittals` | `*` | SA, A, S | SA, A, S | SA, A |
| `/api/collaboration/rfis` | `*` | SA, A, S | — | — |

### Client Portal

| Route | GET | POST | PUT | DELETE |
|-------|-----|------|-----|--------|
| `/api/client-portal/dashboard` | SA, A, CL | — | — | — |
| `/api/client-portal/projects` | SA, A, CL | — | — | — |
| `/api/client-portal/complaints` | SA, A, CL | SA, A, CL | SA, A, CL | SA, A |

### AI & Analytics

| Route | GET | POST | PUT | DELETE |
|-------|-----|------|-----|--------|
| `/api/ai/forecast` | SA, A, S, AC, AU | — | — | — |
| `/api/ai/insights` | SA, A, S, AU | — | — | — |
| `/api/analytics/dashboard` | SA, A, S, AC, AU | — | — | — |
| `/api/analytics/reports` | SA, A, S, AC, AU | — | — | — |

### System

| Route | GET | POST | PUT | DELETE |
|-------|-----|------|-----|--------|
| `/api/dashboard/stats` | SA, A, S, AC, HR, SM, AU | — | — | — |
| `/api/audit-log` | SA, A, AU | — | — | — |
| `/api/reports` | SA, A, S, AC, HR, AU | — | — | — |

---

## Implementation Reference

- **RBAC Configuration:** `src/lib/rbac.ts`
- **Auth Utilities:** `src/lib/auth.ts`
- **API Auth Middleware:** `src/lib/api-auth.ts`
- **Navigation Filtering:** `filterNavForRole()` in `src/lib/rbac.ts`
- **Route Permission Checking:** `canAccessRoute()` in `src/lib/rbac.ts`