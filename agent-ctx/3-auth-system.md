# Task 3 - Authentication System & Seed Data

## Date: 2025-06-12

## Summary
Built the complete authentication system with all API routes, utility functions, seed data script, and dashboard statistics endpoint. All API routes are functional and tested.

## Files Created

### Core Auth Utility
- **`src/lib/auth.ts`** - Auth utility with:
  - `verifyAuth(request)` - validates Bearer token from headers, checks session validity, expiry, and user active status
  - `requireRole(user, roles)` - role-based access control check
  - `createSession(userId, meta)` - creates DB session with UUID token, 7-day expiry
  - `revokeSession(token)` - revokes session by setting revokedAt
  - `createAuditLog(params)` - audit trail helper
  - `isRateLimited(ip)` - in-memory rate limiter (20 req/min per IP)

### Seed Script
- **`src/lib/seed.ts`** - Comprehensive seed data:
  - 6 users (admin, supervisor, hr_manager, accountant, store_manager, client)
  - 3 construction projects (2 active, 1 planning)
  - 4 suppliers with GST details
  - 13 construction materials across 6 categories
  - 6 labour groups with 18 labourers (3 per group)
  - ~100 attendance records across 5 days + today
  - 5 daily notes with realistic construction data
  - 4 invoices (paid, partial, sent, overdue) with line items
  - 3 payments (completed + pending)
  - 7 expenses (mix of approved and pending)
  - 4 purchase requests (draft, submitted, approved)
  - 2 purchase orders
  - 6 assets (equipment, tools, vehicles)
  - 5 product categories with 12 products
  - 4 customers
  - 5 project tasks (mix of todo and in_progress)
  - 5 stock movements
  - 6 notifications (mix of read/unread)
  - 6 notification preferences
  - 6 audit log entries

### Auth API Routes
- **`src/app/api/auth/login/route.ts`** - POST login with rate limiting, password verification via bcrypt, session creation
- **`src/app/api/auth/register/route.ts`** - POST register (admin-only) with validation
- **`src/app/api/auth/logout/route.ts`** - POST logout with session revocation
- **`src/app/api/auth/me/route.ts`** - GET current user from session token
- **`src/app/api/auth/users/route.ts`** - Full CRUD (GET/POST/PUT/DELETE) with pagination, search, role filtering

### Dashboard API Routes
- **`src/app/api/dashboard/stats/route.ts`** - GET comprehensive dashboard stats:
  - Active projects count, revenue/expenses this month, outstanding invoices
  - Labour on-site today, pending purchase requests/approvals
  - Recent payments (last 10), recent activities (last 20 audit logs)
  - Upcoming tasks (due this week), stock alerts (below min stock)
  - 6-month revenue/expense chart data
  - Project progress data with task completion
- **`src/app/api/dashboard/notifications/route.ts`** - GET/POST/DELETE for user notifications

### Configuration
- **`package.json`** - Added `"seed": "bun run src/lib/seed.ts"` script
- **`bcryptjs`** - Installed bcryptjs@3.0.3 and @types/bcryptjs for password hashing

## Login Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@smartbuild.com | admin123 |
| Supervisor | supervisor@smartbuild.com | password123 |
| HR Manager | hr@smartbuild.com | password123 |
| Accountant | accountant@smartbuild.com | password123 |
| Store Manager | store@smartbuild.com | password123 |
| Client | client@smartbuild.com | password123 |

## API Response Format
All endpoints return: `{ success: boolean, data?: any, error?: string }`

## Verified Working
- ✅ Login returns token + user data
- ✅ Dashboard stats returns real computed data (2 active projects, ₹20L revenue this month, 23 labour on-site, 4 pending approvals, 1 stock alert)
- ✅ User listing with pagination (6 users)
- ✅ ESLint passes with zero errors
- ✅ Seed populates all tables correctly