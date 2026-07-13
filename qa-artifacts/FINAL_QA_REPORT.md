# Final QA Report — SmartBuild (HJSB EPPM)

Date: 2026-07-13 · Branch: `claude/playwright-qa-setup-5l9oun` (PR #2)
Agent loop: 2 fix iterations (of max 8) to convergence + production verification.

## 1. Initial state

Next.js 16 / React 19 / Prisma 6 (PostgreSQL) EPPM app with 2 routes (`/login`,
`/app`) fronting ~69 client-side views, 17 API routes, JWT-cookie auth. **No
tests of any kind existed.** The production build "passed" only because
`next.config.ts` masked TypeScript errors (`ignoreBuildErrors: true`); lint had
3 errors and `tsc` 22. The `bun run start` production script was unrunnable
(expected a standalone bundle that was never emitted), and `bun install` failed
behind canonical-registry-only networks (lockfile pinned `registry.npmjs.com`).

## 2. Bugs found & fixed, by severity (fix commits)

### High — broken product behaviour
| Bug | Fix | Commit |
|---|---|---|
| Sonner toasts never rendered — no `<Toaster/>` for sonner was mounted; login/register/OTP errors and all workflow feedback across 8 files were invisible | Mount sonner Toaster in root layout | `63e11e5` |
| `bun run start` could never work: no `output: "standalone"` in next.config while start script + `.zscripts/build.sh` both expect `.next/standalone/server.js` | Emit standalone output; start script stages static assets | `7ce2859` |
| `manifest.json`, `icon.svg` and all icons were auth-gated by middleware (redirected to `/login`) — broken PWA install/crawlers | Middleware matcher exempts static-file extensions | `63e11e5` |
| `/favicon.ico` + every icon referenced by layout metadata/manifest was missing (404 on every page load) | Generated full icon set + og-image from `icon.svg` | `63e11e5` |
| `bun.lock` pinned tarballs to non-canonical `registry.npmjs.com` — installs fail on canonical-only egress | Rewritten to `registry.npmjs.org` | `c46133b` |

### Medium — correctness/maintenance risk
| Bug | Fix | Commit |
|---|---|---|
| `ignoreBuildErrors: true` masked 22 type errors from production builds | Mask removed; all type errors fixed (seed tuple types, framer-motion `Variants`, ES2022 target, typed grouping) | `c9170e5` |
| `PackTable` component created during render (state-losing remounts, blocks React Compiler) | Hoisted to module scope | `c9170e5` |
| Broken `useMemo` in maintenance view (dep recreated per render) | Derive from stable store value | `c9170e5` |

### Accessibility (axe serious/critical → zero on tested views)
| Violation | Scope | Fix | Commit |
|---|---|---|---|
| `color-contrast` (3.01–4.12 vs 4.5:1 required) | systemic: 629 status-chip/text usages | `text-{hue}-600` → `-700` app-wide; kbd hints; badge fills | `63e11e5` |
| `button-name` on Selects | app-wide pattern (combobox takes no name from content) | aria-labels on all flagged triggers + admin Switch + mobile logo button | `63e11e5` |
| `aria-progressbar-name` | every `<Progress/>` | default aria-label in ui primitive | `63e11e5` |
| `scrollable-region-focusable` | tables, scroll areas, admin lists | `tabIndex={0}` in ui primitives + flagged divs | `63e11e5` |
| `svg-img-alt` | dashboard pie charts | aria-label per `<Cell>` | `63e11e5` |

## 3. Final test results

Suite: 6 spec files — route smoke, 69-view render sweep (console errors +
HTTP≥400 asserted), auth journeys (sign-in/up, bad creds, `?from=` redirect,
logout), navigation/API journeys, axe a11y, visual captures.
Projects: desktop 1440×900 · tablet 768×1024 · mobile 375×667.

| Run | Result | Duration |
|---|---|---|
| Dev server, full suite | **157 passed / 0 failed** (132 skipped-by-design: full view sweep is desktop-only, subset re-run on tablet/mobile) | 4.5m |
| Production bundle, smoke + journeys | **127 passed / 0 failed** | 2.1m |
| Production bundle, a11y + visual | **31 passed / 0 failed** | 1.0m |

Exit criteria: ✅ build clean **without** the type-error mask · ✅ `eslint .` and
`tsc --noEmit` clean · ✅ 100% tests pass on all three viewport projects · ✅ zero
console errors on every tested view · ✅ zero serious/critical axe violations ·
✅ screenshots render on all three viewports · ✅ dev/prod parity confirmed.

## 4. Screenshots

`qa-artifacts/screenshots/{desktop,tablet,mobile}/{login,dashboard,projects,gantt,work-orders}.png`
(15 full-page captures, regenerated each run; gitignored as build artifacts).

## 5. Environment deviations

- **Chromium-only**: firefox/webkit browser downloads are blocked by the
  container egress policy. All three viewport projects run on the pinned
  Chromium (`/opt/pw-browsers/chromium`); `CHROMIUM_PATH` env overrides. Re-run
  `npx playwright install --with-deps` + drop the `launchOptions.executablePath`
  override on an unrestricted machine to add real webkit/firefox projects.
- Local Postgres 16 stood in for the production database; seeded via
  `prisma/seed.ts` + `prisma/create-admin.ts`.

## 6. Remaining known issues / recommendations (non-blocking)

1. **Selects app-wide**: only the axe-tested views got aria-labels; the same
   combobox-name pattern exists in other views. Recommend a sweep adding
   `aria-label` to every `SelectTrigger` (mechanical, ~40 call sites).
2. `moderate`-impact axe findings (landmarks, heading order) were out of scope
   (gate is serious/critical) and remain.
3. `reactStrictMode: false` hides double-render bugs — recommend enabling.
4. `db/custom.db` (leftover SQLite) and `.zscripts/build.sh`'s dependency on it
   contradict the Postgres schema; the deploy script needs updating.
5. Legacy `useToast` toaster and sonner now coexist; consolidate on sonner.
6. WhatsApp OTP flow is stubbed (dev code path) — untestable end-to-end without
   `WHATSAPP_TOKEN`.

## 7. Verdict

**The build is production-ready** within the scope tested: it compiles with
type-checking enforced, lints clean, serves the standalone production bundle,
and passes 100% of the E2E suite (smoke, auth, journeys, responsive, a11y,
network) against both dev and production servers.
