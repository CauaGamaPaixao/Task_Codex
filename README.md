# Task Manager (Kanban App)

A React-based Kanban board with 3 columns (`To Do`, `Doing`, `Done`), task checklist generation, theme toggling, and simulated MCP integrations.

## Features

- Create tasks with title, description, priority.
- Auto-checklist generation from task description (mock external AI skill behavior).
- Move tasks from `To Do -> Doing -> Done`.
- Finish tasks in `Done` to remove them.
- Light/Dark theme toggle with `localStorage` persistence.
- Integrations:
  - **Add to Calendar**: Opens Google Calendar pre-filled event form.
  - **Share to Teams**: Copies summary and opens Microsoft Teams web.
  - **Export to Excel**: Exports backlog as CSV.
- Local persistence for tasks via `localStorage`.

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
