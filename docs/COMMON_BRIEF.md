# V-TECH PROJECT COMMAND — UNIVERSAL BRIEF

> **Every agent MUST read this fully before writing code.**

---

## WHAT WE'RE BUILDING

A Project Management + Time Logging platform for **V-Tech Technologies Pvt. Ltd.**, a 50+ person AV/office automation integrator in Mumbai, India, running 10-15 concurrent projects pan-India.

**App Name:** V-Tech Project Command

---

## TECH STACK (NON-NEGOTIABLE)

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + Vite, TypeScript |
| **Styling** | Tailwind CSS 4 |
| **Backend** | Supabase (PostgreSQL + Auth + RLS + Realtime) |
| **Charts** | Recharts |
| **State** | React Context + custom hooks |
| **Routing** | React Router v7 |
| **Dates** | date-fns |
| **Icons** | lucide-react |
| **Font** | DM Sans (Google Fonts) |

---

## BRAND IDENTITY

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#0B1F3F` | Navy — headers, sidebars, primary buttons |
| `--color-secondary` | `#1E88E5` | Blue — links, active states, highlights |
| `--color-accent` | `#FF6F00` | Amber — alerts, CTAs, badges |
| `--color-success` | `#2E7D32` | Green — completed, on-track |
| `--color-warning` | `#F9A825` | Yellow — at-risk |
| `--color-danger` | `#C62828` | Red — overdue, blocked |
| `--color-bg` | `#F5F7FA` | Light gray background |
| `--color-surface` | `#FFFFFF` | Card background |
| `--color-text` | `#1A1A2E` | Primary text |
| `--color-text-secondary` | `#6B7280` | Muted text |

**Border radius:** 8px cards, 6px buttons, 4px inputs
**Shadows:** `0 1px 3px rgba(0,0,0,0.08)` cards, `0 4px 12px rgba(0,0,0,0.12)` modals

---

## PROJECT STRUCTURE

```
src/
├── components/
│   ├── ui/              # Button, Input, Card, Modal, Badge, Select, Table, Spinner, EmptyState
│   ├── layout/          # AppShell, Sidebar, TopBar, MobileNav
│   ├── auth/            # LoginForm, ProtectedRoute, RoleGate
│   ├── projects/        # ProjectCard, ProjectList, ProjectForm, PhaseTracker
│   ├── milestones/      # MilestoneCard, MilestoneForm, MilestoneList
│   ├── tasks/           # TaskCard, TaskForm, TaskList, TaskBoard
│   ├── time-entry/      # TimeEntryForm, TimeEntryList, DailySummary, WeeklySummary
│   └── dashboard/       # OwnerDashboard, TeamLeadDashboard, charts/
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── ProjectsPage.tsx
│   ├── ProjectDetailPage.tsx
│   ├── MyTasksPage.tsx
│   ├── TimeEntryPage.tsx
│   ├── TeamPage.tsx
│   └── SettingsPage.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useProjects.ts
│   ├── useMilestones.ts
│   ├── useTasks.ts
│   ├── useTimeEntries.ts
│   └── useTeams.ts
├── lib/
│   ├── supabase.ts
│   ├── types.ts         # ALL TypeScript types — import from here, never create local types
│   ├── constants.ts     # All enums, config, colors — import from here, never hardcode
│   └── utils.ts         # Shared utilities
├── styles/
│   └── globals.css
├── App.tsx
└── main.tsx
```

---

## USERS & ROLES

| Role | Sees | Can Do |
|------|------|--------|
| `owner` | ALL projects, ALL time entries | Create projects, set milestones, manage users/teams, view dashboards |
| `team_lead` | Projects their team is on | Create/assign tasks, verify time entries, view team dashboard |
| `field_staff` | Only assigned tasks | Log time entries, update task status |

---

## DATA MODEL

```
teams (7 teams: Sales/BD, Design/Engineering, Procurement, Installation, Programming, Service/AMC, Admin)
  └── users (50+ people, each belongs to 1 team)

projects (10-15 concurrent)
  └── project_phases (10 auto-generated per project)
       └── milestones (owner-created targets)
            └── tasks (lead-assigned to field staff)

time_entries (daily logs by each user: project + phase + task + work_hours + travel_hours + city)
```

### 10 Project Phases (auto-created on project creation)

| # | Phase | Default Team |
|---|-------|-------------|
| 1 | Site Survey | Sales/BD |
| 2 | Design/Engineering | Design/Engineering |
| 3 | BOQ & Quotation | Design/Engineering |
| 4 | Client Approval | Sales/BD |
| 5 | Procurement | Procurement |
| 6 | Installation/Wiring | Installation |
| 7 | Programming/Commissioning | Programming |
| 8 | Testing/QA | Programming |
| 9 | Handover | Sales/BD |
| 10 | AMC/Support | Service/AMC |

### 6 Project Types
Boardroom, Conference Room, Residential/HNI, Experience Centre, Auditorium, Lighting/HVAC

---

## CODING STANDARDS

### Component Pattern
```tsx
import { useState } from 'react';
import { IProject } from '@/lib/types';

interface ProjectCardProps {
  project: IProject;
  onSelect?: (id: string) => void;
}

export function ProjectCard({ project, onSelect }: ProjectCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
      {/* content */}
    </div>
  );
}
```

### Supabase Query Pattern
```tsx
// Always use custom hooks, never raw supabase calls in components
export function useProjects() {
  const [projects, setProjects] = useState<IProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // ... CRUD methods
  return { projects, loading, error, fetchProjects, createProject, updateProject };
}
```

### Rules
- **Mobile-first:** Design for 375px FIRST, then 768px, then 1280px
- **Touch targets:** Minimum 44x44px on mobile
- **No `any` types** — every variable typed
- **No inline styles** — Tailwind only
- **Every async = loading + error + empty + data states**
- **Import types from `@/lib/types.ts`** — never create local type definitions
- **Import constants from `@/lib/constants.ts`** — never hardcode strings
- **Semantic HTML** — use `<main>`, `<section>`, `<nav>`, `<header>`

### Git
- Branch: `agent-{N}/{feature-name}`
- Commits: `[AGENT-N] feat: description`
- NEVER modify files outside your assigned module
- If you need a shared type, add to `lib/types.ts` in a separate commit first

---

## SHARED FILES (already created, import from these)

These files exist in the repo. Import from them. Do NOT recreate:

- `src/lib/types.ts` — All interfaces: IUser, IProject, IProjectPhase, IMilestone, ITask, ITimeEntry, IProjectSummary, ITeamPerformance
- `src/lib/constants.ts` — PHASE_CONFIG, PROJECT_TYPES, TEAM_NAMES, STATUS_COLORS, PRIORITY_COLORS, INDIAN_CITIES, NAV_ITEMS, validation limits
- `src/lib/supabase.ts` — Supabase client
- `src/lib/utils.ts` — formatDate, formatHours, getStatusColor, cn(), initials(), etc.
- `src/styles/globals.css` — CSS variables, Tailwind, DM Sans font, mobile resets
