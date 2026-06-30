---
Task ID: 14
Agent: eppm-views-batch-4
Files created:
- src/components/eppm/views/documents-view.tsx — Document Management
- src/components/eppm/views/reports-view.tsx — Reporting & Analytics
- src/components/eppm/views/lookahead-view.tsx — Lookahead Planning
- src/components/eppm/views/admin-view.tsx — System Administration

Summary:
All 4 view components built per spec. Each is `'use client'`, exports default
`{Name}View({ onNavigate }: { onNavigate: (v: View) => void })`, wraps content in
`<div className="space-y-4">`, uses `void onNavigate`, and avoids indigo/blue
primary colors (uses emerald/amber/rose/sky/violet/slate oklch tokens).

documents-view.tsx:
- 24 synthetic documents across 8 types (Drawing, Spec, Method Statement, Contract,
  RFI, Submittal, Photo, Report).
- 5-KPI strip: Total / Approved / Under Review / RFIs Open / Submittals Pending.
- Filters: search Input + type Select + status Select.
- Tabs: All / Drawings / RFIs / Submittals / Method Statements (filter by type).
- Document table: Doc ID, Name (with type icon), Type badge, Project, Version,
  Status colored badge, Uploaded By, Date. Wrapped in max-h-[600px] scroll-thin
  with sticky header.
- RFI Workflow card: open RFIs rendered as cards with days-open + a 4-step
  timeline (Submitted → Reviewing → Response → Closed) using coloured dots.
- Quick-stats footer card with per-type counts.

reports-view.tsx:
- 12 Report Templates as cards (Executive Summary, Portfolio Status, Project
  Health, Delay Analysis, Cost Variance, Resource Utilisation, EVM Report, Risk
  Register, Progress S-Curve, Critical Path, Cash Flow Forecast, Weekly Progress).
  Each has icon (colored by category), title, description, format badges
  (PDF/Excel/CSV/PPT with small icons), and Generate button.
- Analytics section with 3 charts from live dashboard data:
  · Project count by status (PieChart with donut)
  · Budget by category (horizontal BarChart)
  · Progress distribution histogram (5 buckets)
- Recent Reports table: 8 synthetic rows with download buttons, "Generating"
  status pulses, format icon, status badge. Wrapped max-h-[600px] scroll-thin.
- Footer KPI strip: Total / Scheduled / Storage Used.

lookahead-view.tsx:
- Window selector Tabs: 2 / 4 / 6 / 8 weeks (computed against today=2025-01-24).
- 4-KPI strip: Window / Activities in Window / Constraints Open / Activities Finishing.
- Activities table filtering by finishDate within window. Columns: Act ID, Name,
  Project, Start, Finish, Remaining Dur, Progress bar, Responsible, Constraint
  (colored badge: Pending Material amber / Pending RFI violet / Pending Inspection
  sky / Awaiting Approval rose / None muted), Status. Sticky header, max-h-600.
- Constraint Tracking card: counts per type with progress bars + "no constraints"
  emerald highlight.
- Weekly Buckets card: BarChart (start vs finish per week W1..Wn) + totals footer.
- Loading skeleton when data is null.

admin-view.tsx:
- 4 tabs: Users & Roles / Audit Log / Security / Configuration.
- Users & Roles:
  · Users table (8 synthetic rows): avatar initials, name, email, role badge,
    status colored badge, last active. Search input + Invite button.
  · Role Permission Matrix: 8 roles × 13 modules grid with sticky left column &
    sticky header, CheckCircle2 (emerald) for granted / XCircle (muted) for denied.
- Audit Log: 12 synthetic entries (timestamp, user, action badge colored by type,
  module, details). Sticky header.
- Security: 6 cards (2FA, RBAC, Encryption, Rate Limiting, CSRF/XSS, Audit
  Logging) all marked Active (emerald). Plus "Failed Login Attempts" BarChart
  (last 7 days, rose bars) and a Security Posture side card with key metrics.
- Configuration: 4 cards — Calendar Defaults (read-only inputs), Currency & Locale
  (Selects for currency & timezone, default USD/UTC), Notification Rules (3
  switches + triggers summary), System (auto-backup/maintenance switches +
  version/last backup + Run Health Check button). Footer Save/Reset buttons.

Lint: All 4 new files pass cleanly. Pre-existing errors in use-data.ts (setState
in effect) and page.tsx are out of scope for this task. One error was fixed in
reports-view.tsx (useMemo IIFE → inline function).

Shared utilities used: useDashboardData, fmtMoney / fmtPct / fmtDate / fmtNum /
healthColor / statusColor / View from @/lib/eppm. shadcn/ui components: Card,
Badge, Button, Input, Select, Switch, Label, Table, Tabs. recharts: BarChart,
PieChart, Tooltip, Legend, CartesianGrid, XAxis, YAxis, Cell, Bar, Pie.
lucide-react icons throughout. Verified all icon imports exist (FileDrawing was
missing from lucide-react — replaced with PencilRuler for the Drawing type).
