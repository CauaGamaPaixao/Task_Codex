import { useEffect, useMemo, useState } from 'react';

const STORAGE_TASKS = 'kanban_tasks_v1';
const STORAGE_THEME = 'kanban_theme_v1';

const COLUMNS = [
  { key: 'todo', label: 'To Do' },
  { key: 'doing', label: 'Doing' },
  { key: 'done', label: 'Done' },
];

const PRIORITIES = ['High', 'Medium', 'Low'];

const PRIORITY_CLASS = {
  High: 'priority-high',
  Medium: 'priority-medium',
  Low: 'priority-low',
};

function generateChecklist(description) {
  // Mock external AI skill: combines keyword rules + generic software workflow.
  const text = description.toLowerCase();
  const items = new Set();

  if (text.includes('api')) {
    items.add('Create endpoint');
    items.add('Validate inputs');
    items.add('Test API');
  }
  if (text.includes('login') || text.includes('auth')) {
    items.add('Implement authentication');
  }
  if (text.includes('ui') || text.includes('page') || text.includes('screen')) {
    items.add('Design interface');
    items.add('Implement UI components');
  }
  if (text.includes('database') || text.includes('db')) {
    items.add('Design schema');
    items.add('Write data access layer');
  }

  if (items.size === 0) {
    ['Break down requirements', 'Implement solution', 'Write tests', 'Review and polish'].forEach((step) =>
      items.add(step),
    );
  }

  return [...items].map((item, index) => ({ id: `${Date.now()}-${index}`, text: item, checked: false }));
}

function createGoogleCalendarUrl(task) {
  const base = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
  const text = encodeURIComponent(task.title);
  const details = encodeURIComponent(task.description);
  return `${base}&text=${text}&details=${details}`;
}

function downloadCSV(tasks) {
  const header = ['Title', 'Description', 'Priority', 'Status'];
  const rows = tasks.map((task) => [task.title, task.description, task.priority, task.status]);

  const csvContent = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.setAttribute('download', 'task-backlog.csv');
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function App() {
  const [tasks, setTasks] = useState([]);
  const [theme, setTheme] = useState('light');
  const [form, setForm] = useState({ title: '', description: '', priority: 'Medium' });

  useEffect(() => {
    const savedTasks = localStorage.getItem(STORAGE_TASKS);
    const savedTheme = localStorage.getItem(STORAGE_THEME);

    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }

    if (savedTheme) {
      setTheme(savedTheme);
      document.body.setAttribute('data-theme', savedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_THEME, theme);
  }, [theme]);

  const columns = useMemo(
    () =>
      COLUMNS.map((column) => ({
        ...column,
        tasks: tasks.filter((task) => task.status === column.key),
      })),
    [tasks],
  );

  const createTask = (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      return;
    }

    const newTask = {
      id: crypto.randomUUID(),
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      status: 'todo',
      checklist: generateChecklist(form.description),
    };

    setTasks((prev) => [newTask, ...prev]);
    setForm({ title: '', description: '', priority: 'Medium' });
  };

  const updateTask = (taskId, updater) => {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? updater(task) : task)));
  };

  const moveForward = (task) => {
    const nextStatus = task.status === 'todo' ? 'doing' : task.status === 'doing' ? 'done' : 'done';
    updateTask(task.id, (existing) => ({ ...existing, status: nextStatus }));
  };

  const finishTask = (taskId) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  const toggleChecklistItem = (taskId, checklistItemId) => {
    updateTask(taskId, (task) => ({
      ...task,
      checklist: task.checklist.map((item) =>
        item.id === checklistItemId ? { ...item, checked: !item.checked } : item,
      ),
    }));
  };

  const shareToTeams = async (task) => {
    const summary = `New Task: ${task.title} | Priority: ${task.priority}`;

    try {
      await navigator.clipboard.writeText(summary);
    } catch (error) {
      console.warn('Clipboard failed, summary:', summary, error);
    }

    window.open('https://teams.microsoft.com', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="app-shell">
      <header className="top-bar">
        <h1>Task Manager (Kanban App)</h1>

        <label className="theme-toggle" htmlFor="themeToggle">
          <input
            id="themeToggle"
            type="checkbox"
            checked={theme === 'dark'}
            onChange={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
          />
          <span>{theme === 'dark' ? 'Dark Theme' : 'Light Theme'}</span>
        </label>
      </header>

      <section className="task-form-section">
        <h2>Create Task</h2>
        <form className="task-form" onSubmit={createTask}>
          <input
            type="text"
            placeholder="Task title"
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            required
          />

          <textarea
            rows={3}
            placeholder="Task description"
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          />

          <select
            value={form.priority}
            onChange={(event) => setForm((prev) => ({ ...prev, priority: event.target.value }))}
          >
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>

          <button type="submit">Add Task</button>
          <button type="button" onClick={() => downloadCSV(tasks)}>
            Export to Excel
          </button>
        </form>
      </section>

      <main className="board">
        {columns.map((column) => (
          <section key={column.key} className="column">
            <h3>{column.label}</h3>

            {column.tasks.length === 0 && <p className="column-empty">No tasks yet.</p>}

            {column.tasks.map((task) => (
              <article className="task-card" key={task.id}>
                <header className="task-header">
                  <h4>{task.title}</h4>
                  <span className={`priority-chip ${PRIORITY_CLASS[task.priority]}`}>{task.priority}</span>
                </header>

                <p>{task.description || 'No description provided.'}</p>

                <div className="checklist">
                  <strong>Checklist</strong>
                  {task.checklist.map((item) => (
                    <label key={item.id}>
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggleChecklistItem(task.id, item.id)}
                      />
                      <span>{item.text}</span>
                    </label>
                  ))}
                </div>

                <div className="task-actions">
                  {task.status !== 'done' && (
                    <button type="button" onClick={() => moveForward(task)}>
                      {task.status === 'todo' ? 'Move to Doing' : 'Move to Done'}
                    </button>
                  )}

                  {task.status === 'done' && (
                    <button type="button" onClick={() => finishTask(task.id)}>
                      Finish Task
                    </button>
                  )}

                  <button type="button" onClick={() => window.open(createGoogleCalendarUrl(task), '_blank')}>
                    Add to Calendar
                  </button>

                  <button type="button" onClick={() => shareToTeams(task)}>
                    Share to Teams
                  </button>
                </div>
              </article>
            ))}
          </section>
        ))}
      </main>
    </div>
  );
}

export default App;
