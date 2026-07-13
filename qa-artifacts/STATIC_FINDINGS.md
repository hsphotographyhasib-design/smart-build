# Static Analysis Findings (Phase 2)

Date: 2026-07-13 · Branch: `claude/playwright-qa-setup-5l9oun`

## Build
- `bun run build` (Next.js 16 production build): **passes**, but only because
  `next.config.ts` sets `typescript.ignoreBuildErrors: true`, which masks the
  type errors listed below. Goal: make the build pass **without** the mask.

## ESLint (`bun run lint`) — 3 errors
1. `src/components/eppm/views/exec-reports-view.tsx:159` & `:165` —
   `react-hooks/static-components`: components created during render (nested
   component definitions inside the view function). Causes remount/state loss
   on every render and blocks React Compiler optimization.
2. `src/components/eppm/views/maintenance-view.tsx:435` —
   `react-hooks/preserve-manual-memoization`: `openWos` dependency may be
   mutated later; React Compiler skips the component.

## TypeScript (`tsc --noEmit`) — 22 errors in 5 files
| File | Errors | Nature |
|---|---|---|
| `examples/websocket/{frontend.tsx,server.ts}` | 2 | `socket.io`/`socket.io-client` not installed — example code included in typecheck scope |
| `prisma/seed.ts` | 14 | WBS node literal type too narrow (`activities`/`deps`/`weight` props, string\|number unions) |
| `src/components/eppm/motion.tsx:40` | 1 | framer-motion 12 `Variants`: `ease: number[]` needs cubic-bezier tuple typing |
| `src/components/eppm/views/ai-planner-view.tsx:175` | 1 | regex `s` flag requires `target >= es2018` (tsconfig target is lower) |
| `src/components/eppm/views/critical-path-view.tsx:67,70` | 2 | `acts` is `unknown` (untyped `Object.values` reduce) |

## Config / hygiene observations
- **`next.config.ts` masks type errors** (`ignoreBuildErrors: true`) — the single
  biggest correctness risk; production builds can ship broken code silently.
- **`bun.lock` referenced `registry.npmjs.com`** (non-canonical npm host);
  rewritten to `registry.npmjs.org` — installs failed in any environment that
  only allows the canonical registry.
- `db/custom.db` is a leftover SQLite database while the Prisma schema targets
  PostgreSQL; `.zscripts/build.sh` still expects it. Confusing but not runtime-breaking.
- No `.env` shipped (expected); `.env.example` documents everything needed.
  `AUTH_SECRET` has an insecure dev fallback in `src/lib/auth.ts` — acceptable
  for dev, documented for production.
- `reactStrictMode: false` — hides double-render bugs; left as-is (product decision).
- No TODO/FIXME markers in `src/`.

## Environment deviations (QA container)
- Only Chromium is available (firefox/webkit CDN blocked by egress policy).
  All three viewports run on Chromium; config keeps a `CHROMIUM_PATH` escape hatch.
