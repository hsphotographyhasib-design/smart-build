# Task 3 - Collaboration Module APIs (2025-06-13)

### What was built:
20 API route files for the SMARTBUILD ERP Collaboration Module, covering all project-level collaboration features:

1. **Open Items** (`open-items/[itemId]/route.ts`) — GET single, PUT (update with auto-resolve), DELETE
2. **RFIs** (`rfis/route.ts`) — GET list (filters: status, category, priority, search), POST (auto-generates RFI-XXX)
3. **RFI Single** (`rfis/[rfiId]/route.ts`) — GET, PUT (status transitions: draft→submitted→under_review→answered→closed), DELETE
4. **RFI Comments** (`rfis/[rfiId]/comments/route.ts`) — GET list, POST add comment
5. **Change Events** (`change-events/route.ts`) — GET list (filters: status, category, impactType, search), POST (auto-generates CE-XXX)
6. **Change Event Single** (`change-events/[eventId]/route.ts`) — GET, PUT, DELETE
7. **Change Event Approve** (`change-events/[eventId]/approve/route.ts`) — POST sets status='approved', approvedById
8. **Change Event Reject** (`change-events/[eventId]/reject/route.ts`) — POST sets status='rejected'
9. **Change Orders** (`change-orders/route.ts`) — GET (with changeEvent include), POST (auto-generates CO-XXX)
10. **Change Order Single** (`change-orders/[coId]/route.ts`) — GET, PUT, DELETE
11. **Change Order Approve** (`change-orders/[coId]/approve/route.ts`) — POST sets status='approved', approvedById
12. **Commitments** (`commitments/route.ts`) — GET (filters: status, type, search), POST
13. **Commitment Single** (`commitments/[commitmentId]/route.ts`) — GET, PUT, DELETE
14. **Direct Costs** (`direct-costs/route.ts`) — GET (filters: status, category, search), POST
15. **Direct Cost Single** (`direct-costs/[costId]/route.ts`) — GET, PUT (auto-sets approvedById on approve), DELETE
16. **Prime Contract** (`prime-contract/route.ts`) — GET (404 if not found), POST (409 if exists), PUT
17. **Team** (`team/route.ts`) — GET (filters: role, isActive), POST
18. **Team Member** (`team/[memberId]/route.ts`) — PUT, DELETE
19. **Project Comments** (`comments/route.ts`) — GET (filters: entityType, entityId), POST (with JSON mentions)
20. **Insights** (`insights/route.ts`) — GET computes aggregates in parallel (open items, RFIs, commitments, direct costs, change events/orders, prime contract, milestones, project info)

### Patterns applied:
- All routes use `verifyAuth(request)` → 401 if unauthorized
- All mutations write audit logs via `createAuditLog()`
- All params use `await params` pattern with destructured nested IDs
- All list routes support search via `OR` with `contains` on text fields
- Auto-generated numbers: RFI-XXX, CE-XXX, CO-XXX using `count + 1` padded to 3 digits
- Prime contract uses `findUnique` with `@unique` projectId relation
- Insights uses `Promise.all` for 15 parallel DB queries + 1 sequential

### Files created (20 route files):
- `src/app/api/projects/[id]/open-items/[itemId]/route.ts`
- `src/app/api/projects/[id]/rfis/route.ts`
- `src/app/api/projects/[id]/rfis/[rfiId]/route.ts`
- `src/app/api/projects/[id]/rfis/[rfiId]/comments/route.ts`
- `src/app/api/projects/[id]/change-events/route.ts`
- `src/app/api/projects/[id]/change-events/[eventId]/route.ts`
- `src/app/api/projects/[id]/change-events/[eventId]/approve/route.ts`
- `src/app/api/projects/[id]/change-events/[eventId]/reject/route.ts`
- `src/app/api/projects/[id]/change-orders/route.ts`
- `src/app/api/projects/[id]/change-orders/[coId]/route.ts`
- `src/app/api/projects/[id]/change-orders/[coId]/approve/route.ts`
- `src/app/api/projects/[id]/commitments/route.ts`
- `src/app/api/projects/[id]/commitments/[commitmentId]/route.ts`
- `src/app/api/projects/[id]/direct-costs/route.ts`
- `src/app/api/projects/[id]/direct-costs/[costId]/route.ts`
- `src/app/api/projects/[id]/prime-contract/route.ts`
- `src/app/api/projects/[id]/team/route.ts`
- `src/app/api/projects/[id]/team/[memberId]/route.ts`
- `src/app/api/projects/[id]/comments/route.ts`
- `src/app/api/projects/[id]/insights/route.ts`

### Verified:
- ESLint passes clean (0 errors, 0 warnings) ✓
- Dev server compiles successfully (no errors in log) ✓