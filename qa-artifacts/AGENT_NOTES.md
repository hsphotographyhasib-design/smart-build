# QA Agent Notes — test → fix → retest loop

Audit trail for the agentic QA loop. One section per iteration: findings,
hypotheses, fixes, verification. See STATIC_FINDINGS.md for the Phase 2 baseline.

## Environment
- Local Postgres 16 (`smartbuild` db), seeded via `prisma/seed.ts` + `create-admin.ts`.
- Chromium-only (firefox/webkit downloads blocked by container egress policy);
  responsive coverage via 3 viewport projects: 1440×900, 768×1024, 375×667.
- Demo login: admin@hjsb.com / admin123 (committed demo credential, not a secret).

---

## Iteration 1 — Findings & Fixes

Run: 23 failed / 134 passed / 132 skipped-by-design (subset views run desktop-only).

### Cluster B — failed-login toast never appears (3 tests)
**Hypothesis:** login page fires `toast.error()` from **sonner**, but the root
layout only mounted the legacy shadcn `useToast`-based `<Toaster/>`; sonner has
no renderer, so no toast in the DOM (8 files fire sonner toasts — all silently
broken UX).
**Fix:** mount `ui/sonner.tsx` `<SonnerToaster/>` in `src/app/layout.tsx`
alongside the legacy toaster (reports-view still uses `useToast`). VERIFIED.

### Cluster C — `/favicon.ico` 404 console error (6 desktop views + mobile gantt)
**Hypothesis:** layout.tsx links `/favicon.ico` (+ metadata references
favicon-16/32/96, apple-icon, og-image; manifest references icon-192/384/512)
but `public/` only contained icon.svg/logo.svg/manifest.json. Browser requests
favicon once per context, so random view tests absorbed the 404.
**Fix:** generated the full icon set from `public/icon.svg` with sharp
(favicon.ico is a PNG-in-ICO wrapper) + og-image.png from logo.svg. VERIFIED 200.
**Related bug found:** middleware matcher only exempted favicon.ico/logo.svg/
robots.txt — manifest.json + all icons were auth-gated (redirected to /login).
Matcher now exempts any path with a static-file extension.

### Cluster D — portfolios view "empty main" (1 test, flaky)
**Hypothesis:** test raced the shared `/api/dashboard` fetch; view renders a
skeleton with no text until data lands. Repro showed 1150 chars of content.
**Fix (test-side, justified):** assertion was demonstrably racy — replaced
one-shot innerText check with `expect.poll` (15s). App code unchanged.

### Cluster A — axe serious/critical violations (12 tests)
Root causes and fixes (all app-side):
1. `aria-progressbar-name` — shadcn `ui/progress.tsx` renders a Radix
   progressbar with no name → default `aria-label="Progress"` (caller-overridable).
2. `button-name` on Select triggers — Radix `SelectTrigger` is `role="combobox"`,
   which cannot take its name from content; every unlabeled Select fails even
   with visible placeholder text. Added `aria-label` to Selects on projects,
   work-orders (maintenance-view ×6), admin (user-role-manager role Select +
   active Switch).
3. `button-name` on mobile logo button (`.tap-target`, text hidden below sm)
   → aria-label.
4. `color-contrast` — systemic: `text-{amber,sky,emerald,rose,orange,teal}-600`
   on tinted -50 chips / white at 9–12px all fail 4.5:1 (measured 3.01–4.12).
   Global one-shade darkening: 629 occurrences → `-700` across src (no `dark:`
   variants affected — verified). Also: kbd hints `text-muted-foreground` →
   `text-foreground/70` (4 files); notification badge tones `bg-*-500` →
   `bg-*-700` under white text.
5. `scrollable-region-focusable` — `ui/scroll-area.tsx` viewport,
   `ui/table.tsx` overflow container, admin `max-h-[…] overflow-auto` divs →
   `tabIndex={0}`.
6. `svg-img-alt` — recharts pie sector paths carry `role="img"` with no name →
   `aria-label` on each `<Cell>` in dashboard pies.

Verification: a11y suite 16/16 green on all three viewports.
