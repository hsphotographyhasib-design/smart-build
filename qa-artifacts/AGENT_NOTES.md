# QA Agent Notes — test → fix → retest loop

Audit trail for the agentic QA loop. One section per iteration: findings,
hypotheses, fixes, verification. See STATIC_FINDINGS.md for the Phase 2 baseline.

## Environment
- Local Postgres 16 (`smartbuild` db), seeded via `prisma/seed.ts` + `create-admin.ts`.
- Chromium-only (firefox/webkit downloads blocked by container egress policy);
  responsive coverage via 3 viewport projects: 1440×900, 768×1024, 375×667.
- Demo login: admin@hjsb.com / admin123 (committed demo credential, not a secret).

---
