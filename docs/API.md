# SmartBuild ERP - API Documentation

## General Information

**Base URL:** `/api`

**Authentication:** All endpoints (except `POST /api/auth/login`) require an `Authorization: Bearer <token>` header.

**Content Type:** All requests and responses use `application/json`.

**Response Envelope:**

```json
{ "success": true, "data": { ... } }          // Success
{ "success": false, "error": "message" }       // Error
```

**Pagination:** List endpoints support `?page=N&limit=N` query parameters and return:

```json
{ "success": true, "data": [...], "total": 150, "page": 1, "limit": 50 }
```

**Filtering:** List endpoints commonly support `?status=value` and `?search=term` query parameters.

---

## Authentication

### POST /api/auth/login

Authenticate a user and create a session.

**Public endpoint** (no authentication required). Rate limited: 20 req/min per IP.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | User email |
| password | string | Yes | User password |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "uuid-v4-token",
    "expiresAt": "2025-01-20T10:00:00.000Z",
    "user": {
      "id": "clx...",
      "email": "admin@smartbuild.com",
      "name": "Admin User",
      "phone": "+91-9876543210",
      "avatar": null,
      "role": "admin",
      "isActive": true
    }
  }
}
```

**Error Responses:**
- `400` — Missing email or password
- `401` — Invalid credentials, inactive account, or locked account
- `429` — Rate limit exceeded

**Security:**
- Account locks after 5 failed attempts for 15 minutes
- Successful login resets the failed attempt counter
- Creates an audit log entry with IP address

---

### POST /api/auth/register

Register a new user. **Admin only.**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Must be valid email format |
| password | string | Yes | Minimum 6 characters |
| name | string | Yes | Display name |
| phone | string | No | Phone number |
| role | string | No | One of: super_admin, admin, supervisor, hr_manager, accountant, store_manager, client, labour (default: labour) |

**Roles Required:** `super_admin`, `admin`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "email": "newuser@smartbuild.com",
    "name": "New User",
    "phone": null,
    "role": "labour",
    "isActive": true,
    "createdAt": "2025-01-13T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` — Missing fields, invalid email, password too short, invalid role
- `403` — Non-admin user
- `409` — Email already exists

---

### POST /api/auth/logout

Revoke the current session.

**Roles Required:** Any authenticated user (`*`)

**Response (200):**
```json
{ "success": true, "data": { "message": "Logged out successfully" } }
```

**Error Responses:**
- `401` — Missing, invalid, or expired token

---

### GET /api/auth/me

Get the currently authenticated user's profile.

**Roles Required:** Any authenticated user (`*`)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "email": "admin@smartbuild.com",
    "name": "Admin User",
    "phone": "+91-9876543210",
    "avatar": null,
    "role": "admin",
    "isActive": true
  }
}
```

---

### User Management

#### GET /api/auth/users

List all users with pagination, filtering, and search.

**Roles Required:** `super_admin`, `admin`, `hr_manager`

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| role | string | Filter by role |
| isActive | boolean | Filter by active status |
| search | string | Search by name or email |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 50) |

#### POST /api/auth/users

Create a new user. Same as `/api/auth/register` but accessible via user management UI.

**Roles Required:** `super_admin`, `admin`

#### PUT /api/auth/users

Update a user. Accepts `id`, `name`, `phone`, `role`, `isActive`, `password` fields.

**Roles Required:** `super_admin`, `admin`

#### DELETE /api/auth/users?id={id}

Deactivate a user and revoke all their active sessions. Cannot deactivate yourself.

**Roles Required:** `super_admin`, `admin`

---

## Projects API

### GET /api/projects

List all projects with task counts and member counts.

**Roles Required:** `super_admin`, `admin`, `supervisor`, `hr_manager`, `accountant`, `store_manager`, `auditor`, `client`

**Query Parameters:** `status`, `search`

**Response fields per project:** id, name, code, status, progress, budget, startDate, endDate, address, description, memberCount, totalTasks, completedTasks, inProgressTasks, documentCount, dailyNoteCount, createdAt, updatedAt

### POST /api/projects

Create a new project. Creator is automatically added as project manager.

**Roles Required:** `super_admin`, `admin`, `supervisor`

| Field | Type | Required |
|-------|------|----------|
| name | string | Yes |
| code | string | Yes (unique) |
| description | string | No |
| status | string | No (default: "planning") |
| startDate | string | No |
| endDate | string | No |
| budget | number | No |
| address | string | No |
| clientId | string | No |

### GET /api/projects/[id]

Get full project details.

**Roles Required:** `*` (any authenticated user)

### PUT /api/projects/[id]

Update project details.

**Roles Required:** `super_admin`, `admin`, `supervisor`

### DELETE /api/projects/[id]

Delete a project.

**Roles Required:** `super_admin`, `admin`

### Project Sub-resources

| Endpoint | Methods | Roles | Description |
|----------|---------|-------|-------------|
| `/api/projects/[id]/tasks` | GET, POST | GET: `*`, POST: admin, supervisor, hr_manager | Project tasks |
| `/api/projects/[id]/tasks/[taskId]` | PUT, DELETE | admin, supervisor | Task management |
| `/api/projects/[id]/team` | GET, POST | GET: `*`, POST: admin, supervisor | Team members |
| `/api/projects/[id]/team/[memberId]` | PUT, DELETE | PUT: admin, supervisor; DELETE: admin | Team member management |
| `/api/projects/[id]/documents` | GET, POST, DELETE | GET/POST/DELETE: admin, supervisor | Project documents |
| `/api/projects/[id]/daily-notes` | GET, POST | GET: `*`, POST: admin, supervisor | Daily log entries |
| `/api/projects/[id]/finance` | GET | admin, supervisor, accountant, auditor | Project financial summary |
| `/api/projects/[id]/comments` | GET, POST | `*` | Project comments |
| `/api/projects/[id]/open-items` | GET, POST | GET: `*`, POST: admin, supervisor | Open/punch items |
| `/api/projects/[id]/open-items/[itemId]` | PUT, DELETE | admin, supervisor | Open item management |
| `/api/projects/[id]/prime-contract` | GET, PUT | GET: admin, supervisor, accountant; PUT: admin | Prime contract |
| `/api/projects/[id]/commitments` | GET | admin, supervisor, accountant, auditor | Subcontractor commitments |
| `/api/projects/[id]/commitments/[commitmentId]` | PUT, DELETE | PUT: admin, accountant; DELETE: admin | Commitment management |
| `/api/projects/[id]/direct-costs` | GET, POST | admin, supervisor, accountant, auditor | Direct costs |
| `/api/projects/[id]/direct-costs/[costId]` | PUT, DELETE | admin, accountant | Direct cost management |
| `/api/projects/[id]/insights` | GET | admin, supervisor, auditor | AI project insights |
| `/api/projects/[id]/rfis` | GET, POST | GET: `*`, POST: admin, supervisor | Requests for Information |
| `/api/projects/[id]/rfis/[rfiId]` | GET, PUT, DELETE | GET: `*`; PUT: admin, supervisor; DELETE: admin | RFI management |
| `/api/projects/[id]/rfis/[rfiId]/comments` | GET, POST | `*` | RFI comments |
| `/api/projects/[id]/change-orders` | GET, POST | admin, supervisor, accountant, auditor | Change orders |
| `/api/projects/[id]/change-orders/[coId]` | GET, PUT, DELETE | GET: admin, supervisor, accountant, auditor; PUT: admin, supervisor; DELETE: admin | Change order management |
| `/api/projects/[id]/change-orders/[coId]/approve` | POST | admin | Approve change order |
| `/api/projects/[id]/change-events` | GET, POST | GET: admin, supervisor, auditor; POST: admin, supervisor | Change events |
| `/api/projects/[id]/change-events/[eventId]` | GET, PUT, DELETE | GET: `*`; PUT: admin, supervisor; DELETE: admin | Change event management |
| `/api/projects/[id]/change-events/[eventId]/approve` | POST | admin | Approve change event |
| `/api/projects/[id]/change-events/[eventId]/reject` | POST | admin | Reject change event |

---

## Finance API

### Invoices

| Endpoint | Methods | Roles |
|----------|---------|-------|
| `GET /api/invoices` | GET | admin, supervisor, accountant, auditor |
| `POST /api/invoices` | POST | admin, accountant |
| `GET /api/invoices/[id]` | GET | admin, supervisor, accountant, auditor, client |
| `PUT /api/invoices/[id]` | PUT | admin, accountant |
| `DELETE /api/invoices/[id]` | DELETE | admin, accountant |

**Invoice creation fields:** projectId, clientName, issueDate, dueDate, items (array of {description, quantity, unit, unitPrice}), taxPercent, discount, notes

Auto-generates invoice number (`INV-0001`, `INV-0002`, ...). Calculates subtotal, tax, discount, and total.

### Payments

| Endpoint | Methods | Roles |
|----------|---------|-------|
| `GET /api/payments` | GET | admin, supervisor, accountant, auditor |
| `POST /api/payments` | POST | admin, accountant |
| `GET /api/payments/[id]` | GET | `*` |
| `PUT /api/payments/[id]` | PUT | admin, accountant |
| `DELETE /api/payments/[id]` | DELETE | admin, accountant |

### BOQ (Bill of Quantities)

| Endpoint | Methods | Roles |
|----------|---------|-------|
| `GET /api/boq/[projectId]` | GET | admin, supervisor, accountant, store_manager, auditor |
| `POST /api/boq/[projectId]` | POST | admin, supervisor, store_manager |
| `GET /api/boq/[projectId]/items/[itemId]` | GET | `*` |
| `PUT /api/boq/[projectId]/items/[itemId]` | PUT | admin, supervisor, store_manager |
| `DELETE /api/boq/[projectId]/items/[itemId]` | DELETE | admin, supervisor, store_manager |

### Daybook

| Endpoint | Methods | Roles |
|----------|---------|-------|
| `GET /api/daybook` | GET | admin, accountant, auditor |
| `POST /api/daybook` | POST | admin, accountant |
| `PUT /api/daybook/[id]` | PUT | admin, accountant |
| `DELETE /api/daybook/[id]` | DELETE | admin, accountant |

### Cashflow

| Endpoint | Methods | Roles |
|----------|---------|-------|
| `GET /api/cashflow` | GET | admin, accountant, auditor |

**Query Parameters:** `month`, `year`

### Loans

| Endpoint | Methods | Roles |
|----------|---------|-------|
| `GET /api/loans` | GET | admin, hr_manager, accountant |
| `POST /api/loans` | POST | admin, hr_manager |

---

## Procurement API

### Purchase Requests

| Endpoint | Methods | Roles |
|----------|---------|-------|
| `GET /api/purchase-requests` | GET | admin, supervisor, store_manager, accountant, auditor |
| `POST /api/purchase-requests` | POST | admin, supervisor, store_manager |
| `GET /api/purchase-requests/[id]` | GET | `*` |
| `PUT /api/purchase-requests/[id]` | PUT | admin, supervisor, store_manager |
| `DELETE /api/purchase-requests/[id]` | DELETE | admin |
| `POST /api/purchase-requests/[id]/approve` | POST | admin |
| `POST /api/purchase-requests/[id]/reject` | POST | admin |

### Purchase Orders

| Endpoint | Methods | Roles |
|----------|---------|-------|
| `GET /api/purchase-orders` | GET | admin, supervisor, store_manager, accountant, auditor, vendor |
| `POST /api/purchase-orders` | POST | admin, store_manager |
| `GET /api/purchase-orders/[id]` | GET | `*` |
| `PUT /api/purchase-orders/[id]` | PUT | admin, store_manager |
| `DELETE /api/purchase-orders/[id]` | DELETE | admin |

### Suppliers

| Endpoint | Methods | Roles |
|----------|---------|-------|
| `GET /api/suppliers` | GET | admin, store_manager, accountant, auditor |
| `POST /api/suppliers` | POST | admin, store_manager |
| `GET /api/suppliers/[id]` | GET | `*` |
| `PUT /api/suppliers/[id]` | PUT | admin, store_manager |
| `DELETE /api/suppliers/[id]` | DELETE | admin |

### Materials / Inventory

| Endpoint | Methods | Roles |
|----------|---------|-------|
| `GET /api/materials` | GET | admin, store_manager, auditor |
| `POST /api/materials` | POST | admin, store_manager |
| `GET /api/materials/[id]` | GET | `*` |
| `PUT /api/materials/[id]` | PUT | admin, store_manager |
| `DELETE /api/materials/[id]` | DELETE | admin, store_manager |
| `POST /api/materials/[id]/adjust-stock` | POST | admin, store_manager |

---

## Labour & HR API

### Labour Groups

| Endpoint | Methods | Roles |
|----------|---------|-------|
| `GET /api/labour-groups` | GET | admin, hr_manager, supervisor, store_manager |
| `POST /api/labour-groups` | POST | admin, hr_manager |
| `GET /api/labour-groups/[id]` | GET | `*` |
| `PUT /api/labour-groups/[id]` | PUT | admin, hr_manager |
| `DELETE /api/labour-groups/[id]` | DELETE | admin |
| `GET /api/labour-groups/[id]/members` | GET | `*` |
| `POST /api/labour-groups/[id]/members` | POST | admin, hr_manager |
| `DELETE /api/labour-groups/[id]/members` | DELETE | admin, hr_manager |

### Individual Labour

| Endpoint | Methods | Roles |
|----------|---------|-------|
| `GET /api/labour/[id]` | GET | `*` |
| `PUT /api/labour/[id]` | PUT | admin, hr_manager |
| `DELETE /api/labour/[id]` | DELETE | admin, hr_manager |

### Attendance

| Endpoint | Methods | Roles |
|----------|---------|-------|
| `GET /api/attendance` | GET | admin, hr_manager, supervisor, labour |
| `POST /api/attendance` | POST | admin, hr_manager, supervisor |

### Payroll

| Endpoint | Methods | Roles |
|----------|---------|-------|
| `GET /api/payroll` | GET | admin, hr_manager, accountant, auditor |
| `POST /api/payroll/generate` | POST | admin, hr_manager |
| `POST /api/payroll/[id]/pay` | POST | admin, accountant |

### Employees

| Endpoint | Methods | Roles |
|----------|---------|-------|
| `GET /api/employees` | GET | admin, hr_manager |
| `POST /api/employees` | POST | admin, hr_manager |
| `GET /api/employees/[id]` | GET | `*` |
| `PUT /api/employees/[id]` | PUT | admin, hr_manager |
| `DELETE /api/employees/[id]` | DELETE | admin, hr_manager |

### Leave Requests

| Endpoint | Methods | Roles |
|----------|---------|-------|
| `GET /api/leave-requests` | GET | admin, hr_manager, supervisor |
| `POST /api/leave-requests` | POST | `*` (any user can request leave) |
| `POST /api/leave-requests/[id]/approve` | POST | admin, hr_manager |
| `POST /api/leave-requests/[id]/reject` | POST | admin, hr_manager |

---

## Operations API

### Subcontractors

| Endpoint | Methods | Roles |
|----------|---------|-------|
| `GET /api/subcontractors` | GET | admin, supervisor, store_manager |
| `POST /api/subcontractors` | POST | admin, supervisor |
| `GET /api/subcontractors/[id]` | GET | `*` |
| `PUT /api/subcontractors/[id]` | PUT | admin, supervisor |
| `DELETE /api/subcontractors/[id]` | DELETE | admin |

### Work Orders

| Endpoint | Methods | Roles |
|----------|---------|-------|
| `GET /api/work-orders` | GET | admin, supervisor, store_manager |
| `POST /api/work-orders` | POST | admin, supervisor |
| `GET /api/work-orders/[id]` | GET | `*` |
| `PUT /api/work-orders/[id]` | PUT | admin, supervisor |
| `DELETE /api/work-orders/[id]` | DELETE | admin |

### Assets

| Endpoint | Methods | Roles |
|----------|---------|-------|
| `GET /api/assets` | GET | admin, store_manager, supervisor |
| `POST /api/assets` | POST | admin, store_manager |
| `GET /api/assets/[id]` | GET | `*` |
| `PUT /api/assets/[id]` | PUT | admin, store_manager |
| `DELETE /api/assets/[id]` | DELETE | admin, store_manager |

### Scheduling

| Endpoint | Methods | Roles |
|----------|---------|-------|
| `GET /api/scheduling` | GET | admin, supervisor, hr_manager |
| `POST /api/scheduling` | POST | admin, supervisor |

---

## Resource Management API

| Endpoint | Methods | Roles |
|----------|---------|-------|
| `GET /api/resources/dashboard` | GET | admin, store_manager, supervisor |
| `GET /api/resources/skills` | GET | `*` |
| `POST /api/resources/skills` | POST | admin, hr_manager, store_manager |
| `PUT /api/resources/skills/[id]` | PUT | admin, hr_manager, store_manager |
| `DELETE /api/resources/skills/[id]` | DELETE | admin |
| `GET /api/resources/worker-skills` | GET | `*` |
| `POST /api/resources/worker-skills` | POST | admin, hr_manager |
| `DELETE /api/resources/worker-skills` | DELETE | admin, hr_manager |
| `GET /api/resources/assignments` | GET | admin, store_manager, supervisor |
| `POST /api/resources/assignments` | POST | admin, store_manager, supervisor |
| `PUT /api/resources/assignments/[id]` | PUT | admin, store_manager |
| `DELETE /api/resources/assignments/[id]` | DELETE | admin, store_manager |
| `GET /api/resources/crews` | GET | admin, store_manager, supervisor, hr_manager |
| `POST /api/resources/crews` | POST | admin, store_manager |
| `PUT /api/resources/crews/[id]` | PUT | admin, store_manager |
| `DELETE /api/resources/crews/[id]` | DELETE | admin, store_manager |
| `GET /api/resources/requests` | GET | admin, store_manager, supervisor |
| `POST /api/resources/requests` | POST | `*` |
| `GET /api/resources/requests/[id]` | GET | `*` |
| `PUT /api/resources/requests/[id]` | PUT | admin, store_manager |
| `POST /api/resources/requests/[id]/approve` | POST | admin, store_manager |
| `POST /api/resources/requests/[id]/reject` | POST | admin, store_manager |
| `GET /api/resources/productivity` | GET | admin, store_manager, supervisor, auditor |
| `POST /api/resources/productivity` | POST | admin, supervisor |
| `PUT /api/resources/productivity/[id]` | PUT | admin, supervisor |

---

## Cost Control API

| Endpoint | Methods | Roles |
|----------|---------|-------|
| `GET /api/cost-control/dashboard` | GET | admin, supervisor, accountant, auditor |
| `GET /api/cost-control/forecast` | GET | admin, accountant, auditor |
| `GET /api/cost-control/cost-codes` | GET | admin, supervisor, accountant, auditor |
| `POST /api/cost-control/cost-codes` | POST | admin, accountant |
| `PUT /api/cost-control/cost-codes/[id]` | PUT | admin, accountant |
| `DELETE /api/cost-control/cost-codes/[id]` | DELETE | admin |
| `GET /api/cost-control/budgets` | GET | admin, supervisor, accountant, auditor |
| `POST /api/cost-control/budgets` | POST | admin, accountant |
| `GET /api/cost-control/budgets/[id]` | GET | `*` |
| `PUT /api/cost-control/budgets/[id]` | PUT | admin, accountant |
| `DELETE /api/cost-control/budgets/[id]` | DELETE | admin |
| `GET /api/cost-control/budgets/[id]/line-items` | GET | `*` |
| `POST /api/cost-control/budgets/[id]/line-items` | POST | admin, accountant |
| `PUT /api/cost-control/budgets/[id]/line-items/[itemId]` | PUT | admin, accountant |
| `DELETE /api/cost-control/budgets/[id]/line-items/[itemId]` | DELETE | admin, accountant |
| `GET /api/cost-control/budgets/[id]/snapshots` | GET | admin, accountant |
| `POST /api/cost-control/budgets/[id]/snapshots` | POST | admin, accountant |
| `GET /api/cost-control/budgets/[id]/change-orders` | GET | `*` |
| `POST /api/cost-control/budgets/[id]/change-orders` | POST | admin, supervisor, accountant |
| `GET /api/cost-control/budgets/[id]/change-orders/[coId]` | GET | `*` |
| `PUT /api/cost-control/budgets/[id]/change-orders/[coId]` | PUT | admin, accountant |
| `DELETE /api/cost-control/budgets/[id]/change-orders/[coId]` | DELETE | admin |

---

## Collaboration API

| Endpoint | Methods | Roles |
|----------|---------|-------|
| `GET /api/collaboration/dashboard` | GET | `*` |
| `GET /api/collaboration/rfis` | GET | `*` |
| `POST /api/collaboration/rfis` | POST | admin, supervisor |
| `GET /api/collaboration/submittals` | GET | `*` |
| `POST /api/collaboration/submittals` | POST | admin, supervisor |
| `GET /api/collaboration/submittals/[id]` | GET | `*` |
| `PUT /api/collaboration/submittals/[id]` | PUT | admin, supervisor |
| `DELETE /api/collaboration/submittals/[id]` | DELETE | admin |
| `GET /api/collaboration/discussions` | GET | `*` |
| `POST /api/collaboration/discussions` | POST | `*` |
| `GET /api/collaboration/discussions/[id]` | GET | `*` |
| `PUT /api/collaboration/discussions/[id]` | PUT | admin |
| `DELETE /api/collaboration/discussions/[id]` | DELETE | admin |
| `GET /api/collaboration/discussions/[id]/comments` | GET | `*` |
| `POST /api/collaboration/discussions/[id]/comments` | POST | `*` |
| `GET /api/collaboration/announcements` | GET | `*` |
| `POST /api/collaboration/announcements` | POST | admin, supervisor |
| `PUT /api/collaboration/announcements/[id]` | PUT | admin |
| `DELETE /api/collaboration/announcements/[id]` | DELETE | admin |

---

## Sales API

| Endpoint | Methods | Roles |
|----------|---------|-------|
| `GET /api/products` | GET | admin, store_manager |
| `POST /api/products` | POST | admin, store_manager |
| `GET /api/products/[id]` | GET | `*` |
| `PUT /api/products/[id]` | PUT | admin, store_manager |
| `DELETE /api/products/[id]` | DELETE | admin, store_manager |
| `GET /api/product-categories` | GET | `*` |
| `POST /api/product-categories` | POST | admin, store_manager |
| `GET /api/customers` | GET | admin, accountant |
| `POST /api/customers` | POST | admin, accountant |
| `GET /api/customers/[id]` | GET | `*` |
| `PUT /api/customers/[id]` | PUT | admin, accountant |
| `DELETE /api/customers/[id]` | DELETE | admin, accountant |
| `GET /api/sales-invoices` | GET | admin, accountant, auditor |
| `POST /api/sales-invoices` | POST | admin, accountant |
| `GET /api/sales-invoices/[id]` | GET | `*` |
| `PUT /api/sales-invoices/[id]` | PUT | admin, accountant |
| `DELETE /api/sales-invoices/[id]` | DELETE | admin, accountant |

---

## Client Portal API

| Endpoint | Methods | Roles |
|----------|---------|-------|
| `GET /api/client-portal/dashboard` | GET | admin, client |
| `GET /api/client-portal/projects` | GET | admin, client |
| `GET /api/client-portal/projects/[id]` | GET | admin, client |
| `GET /api/client-portal/projects/[id]/invoices` | GET | admin, client |
| `GET /api/client-portal/projects/[id]/documents` | GET | admin, client |
| `GET /api/client-portal/projects/[id]/progress` | GET | admin, client |
| `GET /api/client-portal/complaints` | GET | admin, client |
| `POST /api/client-portal/complaints` | POST | admin, client |
| `GET /api/client-portal/complaints/[id]` | GET | admin, client |
| `PUT /api/client-portal/complaints/[id]` | PUT | admin, client |
| `DELETE /api/client-portal/complaints/[id]` | DELETE | admin |

---

## AI & Analytics API

| Endpoint | Methods | Roles |
|----------|---------|-------|
| `GET /api/ai/forecast` | GET | admin, supervisor, accountant, auditor |
| `GET /api/ai/insights` | GET | admin, supervisor, auditor |
| `GET /api/ai/insights/[id]` | GET | `*` |
| `GET /api/analytics/dashboard` | GET | admin, supervisor, accountant, auditor |
| `GET /api/analytics/project/[id]` | GET | admin, supervisor, accountant, auditor |
| `GET /api/analytics/reports` | GET | admin, supervisor, accountant, auditor |

---

## Other Endpoints

| Endpoint | Methods | Roles |
|----------|---------|-------|
| `GET /api/dashboard/stats` | GET | admin, supervisor, accountant, hr_manager, store_manager, auditor |
| `GET /api/dashboard/notifications` | GET | `*` |
| `POST /api/dashboard/notifications/mark-all-read` | POST | `*` |
| `GET /api/audit-log` | GET | admin, auditor |
| `GET /api/reports` | GET | admin, supervisor, accountant, hr_manager, auditor |

---

## Error Handling

All errors follow a consistent format:

```json
{ "success": false, "error": "Human-readable message" }
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (missing/invalid fields) |
| 401 | Unauthorized (missing or invalid token) |
| 403 | Forbidden (insufficient role permissions) |
| 404 | Not Found (resource does not exist) |
| 409 | Conflict (duplicate entry) |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |