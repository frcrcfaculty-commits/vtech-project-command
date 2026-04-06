# AGENT 4 — TIME ENTRY (MOBILE-FIRST)

> You are Agent 4 on V-Tech Project Command.
> Read COMMON_BRIEF.md first. Then build everything below.
> Your branch: `agent-4/time-entry`
>
> **Your module is the MOST CRITICAL part of the entire app.**
> If time entry is painful, nobody uses it, and the whole system is worthless.
> Optimize every screen for SPEED and SIMPLICITY. Max 5 taps to submit an entry.

---

## YOUR FILES (only touch these)

```
src/components/time-entry/*
src/hooks/useTimeEntries.ts
src/pages/TimeEntryPage.tsx
```

---

## TASKS

### T25 — useTimeEntries Hook

**src/hooks/useTimeEntries.ts**

```tsx
export function useTimeEntries() {
  // fetchToday(userId) — today's entries for current user
  //   join: projects(name), project_phases(phase_name), tasks(title)
  //   filter: entry_date = today

  // fetchByDateRange(userId, startDate, endDate) — user's entries in range
  //   same joins as above

  // fetchByProject(projectId) — all entries for a project (owner/lead view)
  //   join: users(full_name, team_id)

  // fetchByTeam(teamId, startDate, endDate) — team's entries
  //   join: users where team_id matches

  // fetchUnverified(teamId) — unverified entries from team members
  //   filter: verified_by IS NULL
  //   join: users(full_name)

  // createEntry(data) — INSERT
  //   Validate: total hours for this user on this date ≤ 16
  //   data: { user_id, project_id, phase_id, task_id?, entry_date, work_hours, travel_hours, city, notes? }

  // updateEntry(id, data) — UPDATE
  //   Block if verified_by is not null (cannot edit verified entries)

  // deleteEntry(id) — DELETE
  //   Block if verified_by is not null

  // verifyEntry(id, verifiedByUserId) — UPDATE verified_by and verified_at

  // bulkVerify(ids[], verifiedByUserId) — UPDATE multiple entries

  // copyYesterday(userId) — fetch yesterday's entries, duplicate with today's date
  //   Return the new entries for preview before saving

  // getDailyTotal(userId, date) — sum work_hours + travel_hours for a date

  return { entries, loading, error, fetchToday, fetchByDateRange, createEntry, updateEntry, deleteEntry, verifyEntry, bulkVerify, copyYesterday, getDailyTotal };
}
```

---

### T26 — Time Entry Form (CORE FEATURE)

**src/components/time-entry/TimeEntryForm.tsx**

**This form MUST be completable in under 30 seconds / 5 taps.**

**Form flow (top to bottom, single screen, no steps):**

1. **Project** — Select dropdown
   - Options: only projects with status 'active' or 'planning'
   - Show project name + client name in dropdown
   - Required

2. **Phase** — Select dropdown
   - Auto-filtered: only phases belonging to selected project
   - Show phase label (from PHASE_CONFIG)
   - Required
   - Auto-select the phase that is 'in_progress' if only one is

3. **Task** — Select dropdown
   - Optional (can log time against phase without specific task)
   - Auto-filtered: tasks assigned to current user in selected phase
   - Show task title
   - Label: "Task (optional)"

4. **Work Hours** — Custom stepper component
   - Large display: "4.5" in big text (24px+)
   - Two buttons: [ − ] and [ + ], increment by 0.5
   - Range: 0 to 16
   - Buttons: 48px × 48px touch targets minimum
   - Long press on +/- for rapid increment (nice-to-have)

5. **Travel Hours** — Same stepper component
   - Range: 0 to 8
   - Label: "Travel Hours"

6. **City** — Select dropdown
   - Options from INDIAN_CITIES constant
   - Remember last selected city (save to localStorage, pre-fill next time)

7. **Date** — date input
   - Default: today
   - Editable: can select yesterday or up to 7 days back
   - Cannot select future dates
   - Label: "Date"

8. **Notes** — single line text input
   - Optional
   - Placeholder: "What did you work on?"

9. **Submit button** — "Log Time" (primary, full width, large)
   - Loading state while saving
   - On success: green checkmark animation (scale in, 500ms), then clear form, show "Entry saved!" toast
   - On error: red shake animation, show error message

**Pre-fill support:**
- Read URL params: `?project={id}&phase={id}&task={id}`
- If present, auto-select those dropdowns (from MyTasksPage "Log Time" button)

---

### T27 — Today's Entries View

**src/components/time-entry/DailySummary.tsx**

Rendered on TimeEntryPage below the form (or as a tab).

- **Summary bar at top:**
  - "Today: **6.5h** work + **1.5h** travel = **8h** total"
  - Color: green if total ≥ 8, yellow if 4-7.5, red if < 4
  - Warning icon + "Over 12 hours logged today" if total > 12

- **Entry list:**
  - Each entry card:
    - Project name (bold) + Phase label (badge)
    - Work hours + Travel hours
    - City
    - Notes (if any, truncated to 1 line)
    - Verified checkmark (green) if verified, else empty
    - **Edit button** (pencil icon) → opens form pre-filled with this entry's data
    - **Delete button** (trash icon) → confirmation modal "Delete this entry?"
    - Edit/Delete hidden if entry is verified

- **Empty state:** "No time logged today. Start by adding an entry above."

---

### T28 — Copy Yesterday Feature

**src/components/time-entry/CopyYesterday.tsx**

Button on TimeEntryPage: "📋 Copy Yesterday's Entries"

Flow:
1. Tap button
2. Fetch yesterday's entries for current user
3. If zero entries: show toast "No entries found for yesterday"
4. If entries exist: show preview modal:
   - "Copy 3 entries from yesterday?"
   - List: project name + phase + work hours + travel hours (for each)
   - "Confirm Copy" button + "Cancel"
5. On confirm: duplicate entries with today's date. Show success toast.
6. Entries appear in DailySummary. User can edit if needed.

---

### T29 — Weekly Summary View

**src/components/time-entry/WeeklySummary.tsx**

Rendered as a tab on TimeEntryPage: "Today" | "This Week"

**7-day grid:**
- Columns: Mon | Tue | Wed | Thu | Fri | Sat | Sun
- Rows: one per project the user logged time on this week
- Cells: work hours number (e.g., "3.5")
- **Color coding per cell:**
  - Green background: ≥ 8h total that day
  - Yellow: 4-7.5h
  - Red: < 4h (on weekdays)
  - Gray: weekend or no entry
- **Totals row** at bottom: sum per day
- **Totals column** at right: sum per project

- Tap on a cell → navigate to that day's DailySummary view
- **Week picker** at top: "← This Week →" arrows to navigate weeks
- Current week highlighted

Mobile: horizontal scroll if needed, freeze project name column.

---

### T30 — Team Lead Verification Flow

**src/components/time-entry/VerificationList.tsx**

Visible to team_lead role only. Accessible from TimeEntryPage or dashboard.

- **Fetch:** all unverified entries from team members (users with same team_id)
- **Group by:** team member name → then by date (most recent first)
- **Each entry shows:**
  - Project + Phase + Task (if any)
  - Work hours + Travel hours
  - City + Notes
  - Entry date
  - **Checkbox** for bulk selection
  - **Individual verify button** (green checkmark)
- **Suspicious entry flags** (orange warning icon):
  - Work hours > 10
  - Travel hours > 4
  - No notes
  - These use constants: SUSPICIOUS_WORK_HOURS, SUSPICIOUS_TRAVEL_HOURS
- **Bulk actions bar** (appears when checkboxes selected):
  - "Verify Selected (5)" button
  - "Select All" checkbox
- **Empty state:** "All entries verified! Your team is up to date."

---

### T31 — Time Entry Validation

Implement these validations in the useTimeEntries hook and TimeEntryForm:

1. **Max daily hours:** work_hours + travel_hours across ALL entries for a user on a date ≤ 16
   - Before creating: fetch getDailyTotal, check if new entry would exceed
   - Show error: "You've already logged X hours today. Maximum is 16."

2. **No future dates:** entry_date must be ≤ today

3. **Max backdate:** entry_date must be ≥ today - 7 days
   - Error: "Cannot log time for more than 7 days ago."

4. **No editing verified entries:** if verified_by is not null, disable edit/delete
   - Show lock icon + "Verified by [name] on [date]"

5. **Positive hours:** work_hours + travel_hours must be > 0
   - Error: "Log at least some work or travel hours."

6. **Duplicate warning:** if user already has an entry for this project + phase + date:
   - Show warning (not blocking): "You already logged 2h on this project/phase today. Add more?"
   - Allow proceed (multiple entries per project per day are valid)

---

### T32 — Mobile Optimization

- **Persistent bottom bar** on TimeEntryPage (above MobileNav):
  - "Today: 6.5h work · 1.5h travel"
  - Tapping it scrolls to DailySummary
  - Sticks even when scrolled in form

- **Large touch targets:** all steppers, buttons minimum 48px
- **Haptic feedback:** use `navigator.vibrate(10)` on stepper taps (if supported)
- **Auto-scroll:** after selecting project, auto-scroll to next field
- **Quick Log shortcut:** if user has only 1 active project with 1 in_progress task:
  - Show simplified entry at top: "[Project Name] — [Task] — [hours stepper] — Submit"
  - 2 taps: set hours + submit

- Test entire flow at 375px width. Every element must be usable with thumb.
