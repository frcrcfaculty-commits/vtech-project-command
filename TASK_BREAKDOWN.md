# AGENT 2 — PROJECTS & PHASES

> You are Agent 2 on V-Tech Project Command.
> Read COMMON_BRIEF.md first. Then build everything below.
> Your branch: `agent-2/projects-phases`

---

## YOUR FILES (only touch these)

```
src/components/projects/*
src/hooks/useProjects.ts
src/pages/ProjectsPage.tsx
src/pages/ProjectDetailPage.tsx
```

---

## TASKS

### T09 — useProjects Hook

**src/hooks/useProjects.ts**

```tsx
export function useProjects() {
  // State: projects[], loading, error

  // fetchProjects(filters?) — SELECT with joins on project_phases
  //   filters: { status?, project_type?, city?, search? }
  //   order by created_at desc

  // fetchProject(id) — single project with project_phases, milestones, tasks
  //   use nested select: projects(*, project_phases(*, milestones(*, tasks(*))))

  // createProject(data) — INSERT into projects
  //   NOTE: database trigger auto-creates 10 phases. Do NOT create phases manually.
  //   After insert, fetch the created project with phases and return it.

  // updateProject(id, data) — partial UPDATE

  // deleteProject(id) — UPDATE status to 'cancelled' (soft delete, never hard delete)

  return { projects, loading, error, fetchProjects, fetchProject, createProject, updateProject, deleteProject };
}
```

---

### T10 — Project Creation Form

**src/components/projects/ProjectForm.tsx**

Single scrollable form (NOT multi-step, keep it simple):
- **Project Name** — text input, required. Placeholder: "e.g., Reliance Jio HQ Boardroom"
- **Client Name** — text input, required. Placeholder: "e.g., Reliance Industries"
- **Project Type** — Select dropdown using `PROJECT_TYPES` from constants. Required.
- **City** — Select dropdown using `INDIAN_CITIES` from constants. Required.
- **Start Date** — date input, required. Default: today.
- **Target End Date** — date input, required. Must be after start date.
- **Notes** — textarea, optional. 3 rows.
- **Submit button** — "Create Project". Loading state while saving.

On success: redirect to the new project's detail page (`/projects/:id`).
Use this as both create AND edit form. When editing, pre-fill all fields.
Wrap in a Modal when editing, full page when creating.

---

### T11 — Projects List Page

**src/pages/ProjectsPage.tsx**

- **Filter bar** (sticky on mobile):
  - Status pills: All | Active | Planning | On Hold | Completed — horizontal scroll on mobile
  - Project Type dropdown (from PROJECT_TYPES)
  - City dropdown (from INDIAN_CITIES)
  - Search input (debounced 300ms, searches name + client_name)
- **Grid:** 3 columns desktop, 2 tablet, 1 mobile — each cell is a ProjectCard
- **Sort:** dropdown — "Newest First", "Deadline Soon", "Name A-Z"
- **FAB:** floating "+ New Project" button (bottom-right on mobile, top-right on desktop). Navigates to creation form.
- **Empty state:** when no projects match filters. Use EmptyState component with folder icon.
- **Loading state:** skeleton cards while fetching.

---

### T12 — Project Card Component

**src/components/projects/ProjectCard.tsx**

Card displaying:
- **Top row:** Project name (bold, truncate at 40 chars) + Status badge (colored, using Badge component)
- **Second row:** Client name (text-secondary color)
- **Third row:** Project type icon + label (from PROJECT_TYPES config) | City name
- **Fourth row:** Phase progress — horizontal bar showing X/10 phases complete. Bar segments colored: completed=green, in_progress=blue, not_started=gray, blocked=red
- **Bottom row:** "Started [date]" left-aligned | "[X] days remaining" or "[X] days overdue" (red) right-aligned
- **Click:** navigates to `/projects/:id`
- Card has subtle hover shadow on desktop.

---

### T13 — Project Detail Page — Overview

**src/pages/ProjectDetailPage.tsx**

Tab navigation at top: **Overview** | **Phases** | **Team**
Default tab: Overview.

**Overview tab content:**
- **Info card:** Project name (h1), client name, status badge, project type + city
  - "Edit" button (owner only) → opens ProjectForm in modal, pre-filled
  - Status change dropdown (owner only): planning → active → on_hold → completed
- **Quick stats row** (4 cards in a row, 2x2 on mobile):
  - Total Work Hours (from time_entries sum)
  - Total Travel Hours (from time_entries sum)
  - Days Elapsed (start_date to today)
  - Completion % (completed phases / 10 × 100)
- **Notes section:** editable text area showing project notes

---

### T14 — Phase Tracker Component

**src/components/projects/PhaseTracker.tsx**

This renders on the **Phases tab** of ProjectDetailPage.

**Desktop (≥768px):** Horizontal stepper with 10 steps
- Each step: circle (colored by status) + phase label below + connecting line
- Colors: not_started=gray, in_progress=blue pulse, completed=green check, blocked=red X
- Click a step to expand details below

**Mobile (<768px):** Vertical stepper
- Each step: colored circle left + phase label + status badge right
- Tap to expand

**Expanded phase detail (shown below the stepper):**
- Phase name (h3) + status dropdown (editable by owner/team_lead)
- Assigned team name + badge
- Planned start → Planned end dates (editable)
- Actual start → Actual end dates (editable, auto-set actual_start when status → in_progress)
- Milestones count: "3 milestones (2 complete)"
- Hours logged: "45.5 work hours + 12 travel hours in this phase"
- Notes text area

---

### T15 — Project Team Tab

Renders on the **Team tab** of ProjectDetailPage.

- Table/list showing each phase → assigned team → hours logged
- Below: list of individual users who have logged time on this project (from time_entries, distinct user_id)
  - Each user: name, team, total work hours, total travel hours on this project
- Owner can reassign a team to a phase (dropdown showing all 7 teams)

---

### T16 — Project Status Management

- Phase status transitions: owner/team_lead can change via dropdown
- When phase status → `in_progress`: auto-set `actual_start` to today if null
- When phase status → `completed`: auto-set `actual_end` to today
- Sequential validation WARNING (not blocking): show warning if trying to start a phase when previous phase isn't completed. Allow override.
- "Mark Project Complete" button: visible when all phases are completed. Sets project status → completed, actual_end_date → today.
- "Put On Hold" / "Resume" toggle for project status.
