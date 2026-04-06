# AGENT 3 — MILESTONES & TASKS

> You are Agent 3 on V-Tech Project Command.
> Read COMMON_BRIEF.md first. Then build everything below.
> Your branch: `agent-3/milestones-tasks`

---

## YOUR FILES (only touch these)

```
src/components/milestones/*
src/components/tasks/*
src/hooks/useMilestones.ts
src/hooks/useTasks.ts
src/pages/MyTasksPage.tsx
```

---

## TASKS

### T17 — useMilestones Hook

**src/hooks/useMilestones.ts**

```tsx
export function useMilestones() {
  // fetchByPhase(phaseId) — milestones for a phase, include task counts:
  //   select: *, tasks(count) — or manually count
  //   order by due_date asc

  // fetchByProject(projectId) — all milestones across all phases
  //   include phase_name from project_phases join

  // createMilestone(data) — INSERT with phase_id and project_id
  //   data: { phase_id, project_id, title, description?, due_date }

  // updateMilestone(id, data) — partial UPDATE (title, description, due_date, status)

  // deleteMilestone(id) — DELETE (cascades to tasks via FK)
  //   Show confirmation before calling

  return { milestones, loading, error, fetchByPhase, fetchByProject, createMilestone, updateMilestone, deleteMilestone };
}
```

---

### T18 — useTasks Hook

**src/hooks/useTasks.ts**

```tsx
export function useTasks() {
  // fetchByMilestone(milestoneId) — tasks under a milestone
  //   join: assigned_to → users(full_name, avatar_url)

  // fetchByUser(userId) — "my tasks" query
  //   join: projects(name), project_phases(phase_name)
  //   filter: status != 'done' (active tasks)
  //   order: priority desc, due_date asc

  // fetchByProject(projectId) — all tasks across all milestones
  //   join: assignee info, milestone title, phase name

  // fetchByTeam(teamId) — all tasks assigned to team members
  //   join users where team_id matches

  // createTask(data) — INSERT
  //   data: { milestone_id, phase_id, project_id, title, description?, assigned_to, assigned_by, priority, due_date? }

  // updateTask(id, data) — partial UPDATE
  //   When status → 'done': completed_at auto-set by DB trigger

  // assignTask(taskId, userId) — UPDATE assigned_to

  return { tasks, loading, error, fetchByMilestone, fetchByUser, fetchByProject, fetchByTeam, createTask, updateTask, assignTask };
}
```

---

### T19 — Milestone List in Phase View

**src/components/milestones/MilestoneList.tsx**

This renders INSIDE the expanded phase detail (built by Agent 2's PhaseTracker).
Agent 2 will import and render `<MilestoneList phaseId={phase.id} projectId={project.id} />`.

- Fetch milestones for the given phaseId
- Each milestone renders as a collapsible card:
  - **Header row:** Title (bold) | Due date | Status badge | Expand/collapse chevron
  - **Progress bar:** tasks done / total tasks
  - **Collapsed:** just header row + progress bar
  - **Expanded:** shows TaskList underneath (T21)
- **"+ Add Milestone" button** at bottom — visible to owner and team_lead only
  - Opens MilestoneForm modal (T20)
- **Empty state:** "No milestones in this phase yet. Add one to get started."
- Loading: skeleton cards

---

### T20 — Milestone Creation/Edit Form

**src/components/milestones/MilestoneForm.tsx**

Modal form. Props: `phaseId`, `projectId`, `milestone?` (if editing, pre-fill).

Fields:
- **Title** — text input, required. Placeholder: "e.g., Complete AV design drawings"
- **Description** — textarea, optional. 2 rows.
- **Due Date** — date input, required.

Validation:
- Title required, min 3 chars
- Due date required
- Due date should be within the project's date range (if available, else just required)

Buttons: "Save" (primary) + "Cancel" (ghost)
On save: call createMilestone or updateMilestone, close modal, refresh list.

---

### T21 — Task List Component

**src/components/tasks/TaskList.tsx**

Renders inside expanded milestone (T19). Props: `milestoneId`, `phaseId`, `projectId`.

- Fetch tasks for the given milestoneId
- Each task as a compact row/card:
  - **Left:** Status icon (circle: gray=todo, blue=in_progress, green=done, red=blocked)
  - **Middle:** Title + assignee name (small, text-secondary) + priority badge
  - **Right:** Due date (red if overdue) + quick status toggle dropdown
- **Quick status toggle:** tapping the status icon cycles: todo → in_progress → done
  - Update via useTasks.updateTask
  - Visual feedback: brief green flash on completion
- **"+ Add Task" button** — visible to owner and team_lead
  - Opens TaskForm modal (T22)
- **Empty state:** "No tasks yet. Break this milestone into actionable tasks."
- **Swipe on mobile:** swipe right to complete, swipe left to edit (nice-to-have, skip if complex)

---

### T22 — Task Creation/Edit Form

**src/components/tasks/TaskForm.tsx**

Modal form. Props: `milestoneId`, `phaseId`, `projectId`, `task?` (if editing).

Fields:
- **Title** — text input, required. Placeholder: "e.g., Install ceiling speakers in Room 3A"
- **Description** — textarea, optional. 2 rows.
- **Assign To** — Select dropdown. Options: users who belong to the team assigned to this phase.
  - Query: fetch users where team_id = phase.assigned_team_id AND is_active = true
  - Show: full_name for each user
  - Required.
- **Priority** — Select: Low | Medium | High | Urgent. Default: Medium.
- **Due Date** — date input, optional.

Validation:
- Title required, min 3 chars
- Assigned to required

On save: call createTask (set assigned_by to current user's id), close modal, refresh list.

---

### T23 — My Tasks Page (PRIMARY FIELD STAFF VIEW)

**src/pages/MyTasksPage.tsx**

This is THE most important screen for field staff. They open the app → this is what they see.

**Layout:**

**Section 1 — "Overdue" (red accent):**
- Tasks where due_date < today AND status != 'done'
- Red left border on each card
- Show count in section header: "Overdue (3)"

**Section 2 — "Today" (blue accent):**
- Tasks where due_date = today OR status = 'in_progress'
- Blue left border

**Section 3 — "Upcoming" (gray):**
- Tasks where due_date is within next 7 days AND status = 'todo'
- Sorted by due_date ascending

**Each task card shows:**
- Project name (small, text-secondary, top)
- Phase label (small badge)
- Task title (bold, main line)
- Assignee: "Assigned by [name]" (small)
- Priority badge (colored)
- Due date (relative: "Due today", "Due in 3 days", "2 days overdue")
- **Status toggle button** — tap to cycle status
- **"Log Time" button** — navigates to `/time?project={projectId}&phase={phaseId}&task={taskId}`
  - This pre-fills the time entry form (Agent 4 reads these URL params)

**Pull to refresh** on mobile.
**Empty state:** "No tasks assigned to you. Check with your team lead."

---

### T24 — Task Board View (Team Lead)

**src/components/tasks/TaskBoard.tsx**

Kanban-style board for team leads. Rendered on a tab or section within the team lead's view.

**4 columns:** Todo | In Progress | Done | Blocked
- Each column: header with count badge
- Cards in each column: task title, project name (small), assignee avatar+name, priority badge, due date
- **Status change:** dropdown on each card to move between columns (NO drag-and-drop needed)
- **Filters at top:**
  - Project dropdown (filter tasks to one project)
  - Team member dropdown (filter to one person)
  - Priority dropdown
- **Scope:** shows tasks only for the team lead's team members

Desktop: 4 columns side by side.
Mobile: horizontal scrollable, or tabbed (Todo tab, In Progress tab, etc.).
