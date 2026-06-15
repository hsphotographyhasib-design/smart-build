# Task 4-a: Invoice Management API Routes

## Summary
Built 19 API route files for the complete Invoice Management module under `/api/invoicing/`.

## Files Created

### Core Invoice CRUD
1. **`/src/app/api/invoicing/dashboard/route.ts`** (GET) - Dashboard stats: status counts, value aggregations, avg approval time, volume by month (6 months), top 5 vendors, invoice aging buckets (0-30/31-60/61-90/90+)
2. **`/src/app/api/invoicing/route.ts`** (GET + POST) - List with pagination/filters (status, type, projectId, vendorId, search, dateFrom, dateTo, paymentStatus). POST creates with auto INV-YYYY-NNNNNN numbering, calculates subtotal/tax/total/retention, auto-assigns workflow.
3. **`/src/app/api/invoicing/[id]/route.ts`** (GET + PUT + DELETE) - Full detail with all relations. PUT restricted to draft/returned/revision_requested. DELETE soft-deletes (sets cancelled).
4. **`/src/app/api/invoicing/[id]/submit/route.ts`** (POST) - Validates items + total > 0, sets pending_review, creates/updates workflow instance, creates submitted action.
5. **`/src/app/api/invoicing/[id]/approve/route.ts`** (POST) - Role-based permission check, advances workflow or sets approved with paymentStatus unpaid.
6. **`/src/app/api/invoicing/[id]/reject/route.ts`** (POST) - Requires reason, completes workflow instance.
7. **`/src/app/api/invoicing/[id]/return/route.ts`** (POST) - Returns for revision, requires reason.
8. **`/src/app/api/invoicing/[id]/escalate/route.ts`** (POST) - Skips to next workflow step.
9. **`/src/app/api/invoicing/[id]/delegate/route.ts`** (POST) - Delegates to another user, creates action log.

### Supporting Features
10. **`/src/app/api/invoicing/[id]/comments/route.ts`** (GET + POST) - Threaded comments with parentId support.
11. **`/src/app/api/invoicing/[id]/documents/route.ts`** (GET + POST) - Document metadata management.
12. **`/src/app/api/invoicing/workflows/route.ts`** (GET + POST) - List/create workflow templates with steps.
13. **`/src/app/api/invoicing/workflows/[id]/route.ts`** (GET + PUT + DELETE) - Full workflow CRUD, delete restricted to unpublished.
14. **`/src/app/api/invoicing/workflows/[id]/publish/route.ts`** (POST) - Publishes workflow (validates has steps).
15. **`/src/app/api/invoicing/payments/route.ts`** (GET) - Lists invoices with payment info, filterable by paymentStatus.
16. **`/src/app/api/invoicing/payments/[invoiceId]/record/route.ts`** (POST) - Records payment, updates invoice paidAmount/outstandingAmount/paymentStatus.
17. **`/src/app/api/invoicing/retention/route.ts`** (GET) - Retention summary: totals, by project, by vendor, overdue retention.
18. **`/src/app/api/invoicing/retention/[invoiceId]/release/route.ts`** (POST) - Releases retention with validation.
19. **`/src/app/api/invoicing/analytics/route.ts`** (GET) - 12-month analytics: volume by month, avg approval time by type, bottlenecks, outstanding payments, aging distribution, cashflow impact.

## Key Design Decisions
- Used `verifyAuth` and `createAuditLog` from `@/lib/auth` for consistency
- Sequential invoice numbering: counts existing `INV-YYYY-*` and increments
- Workflow auto-assignment: searches type-specific default, then falls back to `all` type
- All `Record<string, unknown>` types converted to `any` with explicit String()/Number()/Boolean() conversions for Prisma compatibility
- Payment model doesn't have bankReference/chequeNumber fields; stored in notes
- Fixed SubContractor select (email, phone not contactEmail, contactPhone)
- Fixed PurchaseOrder select (orderNo not poNumber)
- Fixed WorkOrder select (orderNo not woNumber, description not title)
- All 19 files pass TypeScript and ESLint checks (0 errors in invoicing routes)