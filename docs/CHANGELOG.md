# Changelog

All notable changes to SmartBuild ERP will be documented in this file.

## [1.0.0] - 2025-01-13

### Added

#### Authentication & Security
- Token-based authentication with UUID session tokens (7-day expiry)
- Password hashing with bcryptjs (10 salt rounds)
- Account lockout after 5 failed login attempts (15-minute lockout window)
- In-memory rate limiting (20 requests/minute per IP)
- Session revocation on logout and account deactivation
- TOTP (two-factor authentication) fields on User model (ready for implementation)
- Comprehensive audit logging for all CRUD operations
- Role-Based Access Control (RBAC) with 10 roles and hierarchical permission model

#### Project Management
- Project CRUD with status tracking (planning, active, on-hold, completed)
- Project tasks with status management and assignments
- Project milestones
- Project document management
- Daily notes / site diary
- Project team member management with role assignments
- Project comments (threaded)
- Open items / punch list tracking
- Prime contract management
- Subcontractor commitments tracking
- Direct cost recording
- Request for Information (RFI) management with comments
- Change order workflow with approval
- Change event workflow with approve/reject
- Project insights (AI-powered)

#### Finance
- Invoice management with auto-numbering, line items, tax, and discounts
- Payment recording and tracking
- Bill of Quantities (BOQ) per project with items
- Day book entries with credit/debit categorization
- Cashflow reporting with monthly filtering
- Loan management (employee loans)
- Milestone payment tracking
- Expense recording per project

#### Procurement
- Purchase request workflow with approve/reject
- Purchase order management with line items
- Supplier management (contact details, GST, rating)
- Material / inventory management with stock levels
- Stock movement tracking (in/out/adjustment)
- Material stock adjustment API

#### Labour & HR
- Labour group management with member assignments
- Individual labour records
- Attendance tracking (check-in/check-out)
- Payroll generation with deductions and net pay calculation
- Payroll payment processing
- Employee management (full CRUD)
- Leave request workflow with approve/reject
- Advance payment tracking
- Employee loan management

#### Operations
- Subcontractor management (contact, specialization, rating)
- Work order management with status tracking
- Asset management with categories
- Asset issue tracking (checkout/return)
- Asset maintenance scheduling
- Project scheduling

#### Resource Management
- Resource dashboard with utilization overview
- Resource planning view
- Labour resource tracking
- Equipment resource tracking
- Vehicle resource tracking
- Tool resource tracking
- Crew management with member assignments
- Resource request workflow with approve/reject
- Skill management and worker-skill assignments
- Productivity logging and tracking
- Resource forecasting

#### Cost Control
- Cost code hierarchy management
- Budget management with line items
- Budget line item update history
- Budget snapshots (point-in-time captures)
- Budget change order workflow
- Cost forecasting
- Cost control dashboard with variance analysis

#### Collaboration
- Collaboration dashboard with activity overview
- RFI management (request for information) with comments
- Submittal management with status tracking
- Threaded discussions with comments
- Approvals center
- Announcements (broadcast to all users)

#### Sales
- Product catalog management
- Product category management
- Customer management
- Sales quotation model (schema ready)
- Sales invoice management

#### Client Portal
- Isolated client portal dashboard
- Project progress tracking for clients
- Client invoice viewing
- Client document access
- Client complaint submission and tracking
- Data isolation — clients see only their own projects

#### AI & Analytics
- AI-powered cost and schedule forecasting
- AI-generated project insights
- Project analytics dashboard
- Advanced reports generation
- Analytics dashboard with cross-project KPIs

#### Dashboard & Reporting
- Executive dashboard with project, financial, and operational KPIs
- In-app notification system with preferences (in-app, email, SMS)
- Mark-all-read notifications
- Reports module
- Audit log viewer (admin and auditor access)

#### User Interface
- Marketing landing page with hero, features, testimonials, FAQ, ROI calculator
- Responsive sidebar navigation with role-based filtering
- Breadcrumb navigation
- Light/dark/system theme switching
- 25+ shadcn/ui components (buttons, cards, dialogs, tables, forms, charts, etc.)
- Charts and data visualizations with Recharts
- Drag-and-drop support with dnd-kit
- Animated transitions with Framer Motion
- Rich text editing with MDX Editor
- Mobile-responsive layout

#### Database
- 73 Prisma models covering all business domains
- SQLite database (zero-configuration, file-based)
- Comprehensive relations between models
- Seed scripts with demo data

#### Infrastructure
- Next.js 16 standalone build for self-contained deployment
- Caddy reverse proxy configuration
- Zustand state management for SPA routing
- TanStack React Query for data fetching
- React Hook Form + Zod for form validation
- TypeScript throughout

[1.0.0]: https://github.com/smartbuild/erp/releases/tag/v1.0.0