# Task Manager

A Flask + Vanilla JS Kanban app with 3 columns: **To Do**, **Doing**, **Done**.

## Features

- Create task with title, description, and priority (High/Medium/Low)
- New tasks always start in **To Do**
- Move workflow:
  - **Start Task**: To Do → Doing
  - **Complete Task**: Doing → Done
  - **Finish Task**: removes task from Done
- Auto checklist generation via Python keyword parser endpoint (`/api/checklist`)
- Light/Dark mode toggle persisted in `localStorage`
- Simulated MCP actions:
  - Add to Calendar (Google Calendar prefilled event URL)
  - Share to Teams (copy summary + open Teams web)
  - Export to Excel (CSV backlog export)
- Task persistence with `localStorage`

## Run locally

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Then open `http://127.0.0.1:5000`.
