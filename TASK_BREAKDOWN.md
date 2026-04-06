# AGENT 5 (KIMI) — DASHBOARDS & CHARTS

> You are Agent 5 on V-Tech Project Command.
> Read COMMON_BRIEF.md first. Then build everything below.
> Your branch: `agent-5/dashboards`
>
> **Your tasks are visual/presentation focused.** You build dashboards, charts, and display components.
> Use **Recharts** for all charts. Use **dummy data** initially — create a mockData.ts file.
> Other agents build the data hooks. During integration, mock data gets swapped for real hooks.

---

## YOUR FILES (only touch these)

```
src/components/dashboard/*
src/pages/DashboardPage.tsx
```

---

## TASKS

### T33 — Dashboard Page Router

**src/pages/DashboardPage.tsx**

Simple role-based router:

```tsx
import { useAuth } from '@/hooks/useAuth';
import { OwnerDashboard } from '@/components/dashboard/OwnerDashboard';
import { TeamLeadDashboard } from '@/components/dashboard/TeamLeadDashboard';
import { Navigate } from 'react-router-dom';

export function DashboardPage() {
  const { user } = useAuth();

  if (user?.role === 'owner') return <OwnerDashboard />;
  if (user?.role === 'team_lead') return <TeamLeadDashboard />;
  return <Navigate to="/tasks" replace />; // field_staff has no dashboard
}
```

That's it. Clean and simple.

---

### T34 — Owner Dashboard Layout + KPI Cards

**src/components/dashboard/OwnerDashboard.tsx**

**Layout (responsive grid):**
```
Desktop (≥1280px):
┌──────────┬──────────┬──────────┬──────────┐
│  KPI 1   │  KPI 2   │  KPI 3   │  KPI 4   │
├──────────┴──────────┼──────────┴──────────┤
│  Phase Bottleneck   │  Team Performance    │
│  Chart (T35)        │  Chart (T36)         │
├──────────┴──────────┼──────────┴──────────┤
│  Travel vs Work     │  No-Entry Alerts     │
│  Chart (T37)        │  + Activity (T40)    │
├─────────────────────┴─────────────────────┤
│  Project Health Table (T39)               │
└───────────────────────────────────────────┘

Mobile (<768px):
Everything stacks in single column.
KPI cards in 2x2 grid.
```

**4 KPI Cards:**

Each card:
- Big number (32px, bold, `--color-text`)
- Label below (14px, `--color-text-secondary`)
- Trend indicator: arrow up/down + percentage + "vs last month" — green if positive, red if negative
- Card: white bg, rounded-lg, shadow-sm, subtle left border in accent color

KPI 1: **Active Projects** — count of projects where status = 'active'
KPI 2: **Hours This Month** — sum of work_hours for current month
KPI 3: **Travel Overhead** — (travel_hours / (work_hours + travel_hours)) × 100, shown as "X%"
KPI 4: **Overdue Tasks** — count of tasks where due_date < today AND status != 'done'

**Date range picker at top right:** "This Week" | "This Month" | "This Quarter" — pills, affect all charts below.

---

### T35 — Phase Bottleneck Chart

**src/components/dashboard/PhaseBottleneckChart.tsx**

**Horizontal bar chart** using Recharts `BarChart` with `layout="vertical"`.

- Y-axis: 10 phase names (use labels from PHASE_CONFIG)
- X-axis: average days spent in that phase (across all completed projects, or use active projects' elapsed days per phase)
- Bar color: `--color-secondary` (#1E88E5)
- Highlight the longest phase bar with `--color-accent` (#FF6F00)
- Tooltip on hover: "Installation: avg 12.3 days (planned: 7 days)"
- Chart title: "Average Days per Phase"

**Mock data for initial development:**
```tsx
const mockPhaseData = [
  { phase: 'Site Survey', avgDays: 3.2, plannedDays: 2 },
  { phase: 'Design', avgDays: 5.1, plannedDays: 5 },
  { phase: 'BOQ & Quotation', avgDays: 4.0, plannedDays: 3 },
  { phase: 'Client Approval', avgDays: 8.5, plannedDays: 5 },
  { phase: 'Procurement', avgDays: 10.2, plannedDays: 7 },
  { phase: 'Installation', avgDays: 14.8, plannedDays: 10 },
  { phase: 'Programming', avgDays: 6.3, plannedDays: 5 },
  { phase: 'Testing', avgDays: 3.1, plannedDays: 3 },
  { phase: 'Handover', avgDays: 2.0, plannedDays: 2 },
  { phase: 'AMC/Support', avgDays: 1.5, plannedDays: 1 },
];
```

---

### T36 — Team Performance Chart

**src/components/dashboard/TeamPerformanceChart.tsx**

**Grouped bar chart** using Recharts `BarChart`.

- X-axis: team names (7 teams)
- Y-axis: value
- Toggle buttons above chart to switch metric:
  - "Hours Logged" — total work_hours per team
  - "Tasks Completed" — count of tasks with status='done' per team
  - "Overdue Tasks" — count of overdue tasks per team
- Bar color: `--color-secondary` for primary metric, `--color-danger` for overdue
- Chart title: "Team Performance"
- Tooltip: "Installation: 234.5 hours"

**Highlight badge:** "Best team: [team name]" shown above chart based on selected metric.

**Mock data:**
```tsx
const mockTeamData = [
  { team: 'Sales/BD', hours: 120, tasksCompleted: 28, overdue: 3 },
  { team: 'Design', hours: 185, tasksCompleted: 22, overdue: 1 },
  { team: 'Procurement', hours: 95, tasksCompleted: 15, overdue: 5 },
  { team: 'Installation', hours: 310, tasksCompleted: 45, overdue: 8 },
  { team: 'Programming', hours: 220, tasksCompleted: 35, overdue: 2 },
  { team: 'Service/AMC', hours: 75, tasksCompleted: 18, overdue: 0 },
  { team: 'Admin', hours: 60, tasksCompleted: 12, overdue: 1 },
];
```

---

### T37 — Travel vs Productive Hours Chart

**src/components/dashboard/TravelChart.tsx**

**Stacked bar chart** or **donut chart** (your choice — pick whichever looks better).

**Option A — Stacked bar (recommended):**
- X-axis: project names (or team names — add toggle)
- Two stacked segments per bar: work_hours (blue) + travel_hours (orange)
- Highlight bars where travel > 30% of total in `--color-warning`
- Legend: "Work Hours" (blue) | "Travel Hours" (orange)

**Option B — Donut chart:**
- Single donut showing company-wide work vs travel split
- Center text: "Travel: 18%"
- Below donut: breakdown by project or team as a mini list

**Summary stat** above chart: "Company-wide travel overhead: **X%**"
If travel > 25%, show warning: "⚠️ High travel overhead. Consider optimizing schedules."

**Mock data:**
```tsx
const mockTravelData = [
  { name: 'Reliance Boardroom', workHours: 120, travelHours: 28 },
  { name: 'Tata Experience Centre', workHours: 85, travelHours: 35 },
  { name: 'Ambani Residence', workHours: 200, travelHours: 45 },
  { name: 'HDFC Training Room', workHours: 60, travelHours: 8 },
  { name: 'Wipro Auditorium', workHours: 150, travelHours: 55 },
];
```

---

### T38 — Team Lead Dashboard

**src/components/dashboard/TeamLeadDashboard.tsx**

Simpler than owner dashboard. Same visual quality, less data.

**Layout:**
```
┌──────────┬──────────┬──────────┐
│  KPI 1   │  KPI 2   │  KPI 3   │
├──────────┴──────────┴──────────┤
│  My Team Members (status list) │
├────────────────────────────────┤
│  Tasks Due This Week (list)    │
└────────────────────────────────┘
```

**3 KPI Cards (same style as owner):**
- **Active Tasks** — count of tasks with status != 'done' assigned to team members
- **Unverified Entries** — count of time entries where verified_by IS NULL for team members
- **Overdue Tasks** — count of overdue tasks for team members

**My Team Members section:**
- List of team members (users with same team_id)
- Each row: avatar (initials) + name + "X.Xh logged today" + current task name
- Members with ZERO entries today: highlight row in light yellow + "⚠️ No entry"
- Members with 2+ consecutive days no entries: highlight in light red

**Tasks Due This Week:**
- Simple list of tasks due within next 7 days, assigned to team members
- Each: task title, project name, assignee, due date, status badge
- Sorted by due date ascending
- Quick link: "Verify Time Entries →" button at bottom → navigates to verification page

---

### T39 — Project Health Summary Table

**src/components/dashboard/ProjectHealthTable.tsx**

Sortable table on the owner dashboard.

**Columns:**
| Project | Client | Type | Status | Phase | Days Left | Hours | Health |
|---------|--------|------|--------|-------|-----------|-------|--------|

- **Project:** name, clickable → navigates to `/projects/:id`
- **Client:** client_name
- **Type:** icon + label from PROJECT_TYPES
- **Status:** colored badge
- **Phase:** current active phase name
- **Days Left:** days_remaining (red if negative, meaning overdue)
- **Hours:** total work_hours (formatted)
- **Health:** colored dot — Green / Yellow / Red
  - Green: completion% ≥ time_elapsed% (ahead of schedule)
  - Yellow: completion% is within 20% of time_elapsed%
  - Red: completion% is more than 20% behind time_elapsed%

**Sortable:** click column header to sort asc/desc.
**Mobile:** horizontal scroll OR switch to card view (each project as a card).

**Mock data:**
```tsx
const mockProjectHealth = [
  { id: '1', name: 'Reliance Jio HQ', client: 'Reliance', type: 'boardroom', status: 'active', phase: 'Installation', daysLeft: 15, hours: 148, health: 'green' },
  { id: '2', name: 'Tata Experience Centre', client: 'Tata Group', type: 'experience_centre', status: 'active', phase: 'Procurement', daysLeft: 30, hours: 85, health: 'yellow' },
  { id: '3', name: 'Ambani Residence AV', client: 'Ambani Family', type: 'residential', status: 'active', phase: 'Programming', daysLeft: -3, hours: 245, health: 'red' },
  { id: '4', name: 'HDFC Training Rooms', client: 'HDFC Bank', type: 'conference_room', status: 'planning', phase: 'Design', daysLeft: 45, hours: 20, health: 'green' },
  { id: '5', name: 'Wipro Auditorium', client: 'Wipro Ltd', type: 'auditorium', status: 'active', phase: 'Installation', daysLeft: 8, hours: 205, health: 'yellow' },
];
```

---

### T40 — No-Entry Alert + Activity Feed

**src/components/dashboard/NoEntryAlert.tsx**

Banner component for dashboards.

- After 6 PM (use `NO_ENTRY_ALERT_HOUR` from constants):
  - Show amber banner: "⚠️ X team members haven't logged time today"
  - Expandable: click to see list of names + their team
  - Members with 2+ consecutive days missing: show in RED with "🔴 No entries for 3 days"
- Before 6 PM: don't show this component

**src/components/dashboard/ActivityFeed.tsx**

Recent activity list, 20 items max.

Each item:
- Avatar (initials) + name + action + timestamp
- Examples:
  - "**Rahul** logged 4h on Reliance Jio HQ — Installation · 2h ago"
  - "**Priya** completed: Install ceiling speakers · 1h ago"
  - "**Vishal** created project: Tata Experience Centre · 3h ago"
  - "**Amit** marked Procurement phase complete on HDFC Training · 5h ago"
- Timestamp: relative ("2h ago", "yesterday")
- Auto-refresh every 60 seconds (setInterval + refetch)

For now, use mock data. During integration, query recent time_entries + task status changes.
