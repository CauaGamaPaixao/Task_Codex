// LocalStorage keys for persistence.
const TASKS_KEY = 'kanban_frontend_tasks_v1';
const THEME_KEY = 'kanban_frontend_theme_v1';

// App state kept in-memory, synced to localStorage.
let tasks = [];

const refs = {
  form: document.getElementById('taskForm'),
  title: document.getElementById('taskTitle'),
  description: document.getElementById('taskDescription'),
  priority: document.getElementById('taskPriority'),
  todoList: document.getElementById('todoList'),
  doingList: document.getElementById('doingList'),
  doneList: document.getElementById('doneList'),
  exportBtn: document.getElementById('exportBtn'),
  themeToggle: document.getElementById('themeToggle'),
};

function saveTasks() {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

function loadTasks() {
  const raw = localStorage.getItem(TASKS_KEY);
  tasks = raw ? JSON.parse(raw) : [];
}

function setTheme(theme) {
  document.body.classList.toggle('dark', theme === 'dark');
  localStorage.setItem(THEME_KEY, theme);
}

function loadTheme() {
  const saved = localStorage.getItem(THEME_KEY) || 'light';
  setTheme(saved);
}

// Simulates an external AI skill using keywords/fallback steps.
function generateChecklist(description) {
  const text = (description || '').toLowerCase();
  const steps = [];

  const add = (item) => {
    if (!steps.includes(item)) steps.push(item);
  };

  if (text.includes('api')) {
    add('Create endpoint');
    add('Validate data');
    add('Test API');
  }

  if (text.includes('login') || text.includes('auth')) {
    add('Implement authentication');
  }

  if (text.includes('ui') || text.includes('page') || text.includes('screen')) {
    add('Design interface');
    add('Implement UI components');
  }

  if (text.includes('database') || text.includes('db')) {
    add('Design schema');
    add('Implement data layer');
  }

  if (steps.length === 0) {
    add('Break down requirements');
    add('Implement task');
    add('Test functionality');
    add('Review and finalize');
  }

  return steps.map((textStep) => ({ text: textStep, checked: false }));
}

function moveTask(taskId) {
  const task = tasks.find((item) => item.id === taskId);
  if (!task) return;

  if (task.status === 'todo') task.status = 'doing';
  else if (task.status === 'doing') task.status = 'done';

  saveTasks();
  renderBoard();
}

function finishTask(taskId) {
  tasks = tasks.filter((item) => item.id !== taskId);
  saveTasks();
  renderBoard();
}

function toggleChecklist(taskId, checklistIndex) {
  const task = tasks.find((item) => item.id === taskId);
  if (!task) return;

  const target = task.checklist[checklistIndex];
  if (!target) return;

  target.checked = !target.checked;
  saveTasks();
}

function priorityClass(priority) {
  return `priority-${priority.toLowerCase()}`;
}

function getCalendarUrl(task) {
  const base = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
  return `${base}&text=${encodeURIComponent(task.title)}&details=${encodeURIComponent(task.description || '')}`;
}

async function shareToTeams(task) {
  const summary = `New Task: ${task.title} | Priority: ${task.priority}`;
  try {
    await navigator.clipboard.writeText(summary);
  } catch (error) {
    console.warn('Clipboard write failed:', error);
  }
  window.open('https://teams.microsoft.com', '_blank');
}

function exportBacklog() {
  const rows = [
    ['Title', 'Description', 'Priority', 'Status'],
    ...tasks.map((task) => [task.title, task.description || '', task.priority, task.status]),
  ];

  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'task-backlog.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function renderColumn(listEl, columnTasks) {
  listEl.innerHTML = '';

  if (columnTasks.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'No tasks yet.';
    listEl.appendChild(empty);
    return;
  }

  columnTasks.forEach((task) => {
    const card = document.createElement('article');
    card.className = 'task-card';

    const checklistHtml = task.checklist
      .map(
        (item, index) => `
          <label class="check-item">
            <input type="checkbox" data-check-task="${task.id}" data-check-index="${index}" ${
              item.checked ? 'checked' : ''
            } />
            <span>${item.text}</span>
          </label>
        `,
      )
      .join('');

    const actionButton =
      task.status === 'todo'
        ? `<button type="button" data-action="move" data-task-id="${task.id}">Start Task</button>`
        : task.status === 'doing'
          ? `<button type="button" data-action="move" data-task-id="${task.id}">Complete Task</button>`
          : `<button type="button" data-action="finish" data-task-id="${task.id}">Finish Task</button>`;

    card.innerHTML = `
      <div class="task-header">
        <h4>${task.title}</h4>
        <span class="priority-chip ${priorityClass(task.priority)}">${task.priority}</span>
      </div>
      <p>${task.description || 'No description provided.'}</p>
      <div class="checklist">
        <strong>Checklist</strong>
        ${checklistHtml}
      </div>
      <div class="actions">
        ${actionButton}
        <button type="button" data-action="calendar" data-task-id="${task.id}">Add to Calendar</button>
        <button type="button" data-action="teams" data-task-id="${task.id}">Share to Teams</button>
      </div>
    `;

    listEl.appendChild(card);
  });
}

function renderBoard() {
  renderColumn(refs.todoList, tasks.filter((task) => task.status === 'todo'));
  renderColumn(refs.doingList, tasks.filter((task) => task.status === 'doing'));
  renderColumn(refs.doneList, tasks.filter((task) => task.status === 'done'));
}

function handleCreateTask(event) {
  event.preventDefault();

  const title = refs.title.value.trim();
  const description = refs.description.value.trim();
  const priority = refs.priority.value;

  if (!title) return;

  const newTask = {
    id: crypto.randomUUID(),
    title,
    description,
    priority,
    status: 'todo',
    checklist: generateChecklist(description),
  };

  tasks.unshift(newTask);
  saveTasks();
  renderBoard();
  refs.form.reset();
  refs.priority.value = 'Medium';
}

function handleBoardClick(event) {
  const target = event.target;

  if (target.matches('input[type="checkbox"][data-check-task]')) {
    toggleChecklist(target.dataset.checkTask, Number(target.dataset.checkIndex));
    return;
  }

  const { action, taskId } = target.dataset;
  if (!action || !taskId) return;

  const task = tasks.find((item) => item.id === taskId);
  if (!task) return;

  if (action === 'move') {
    moveTask(taskId);
  } else if (action === 'finish') {
    finishTask(taskId);
  } else if (action === 'calendar') {
    window.open(getCalendarUrl(task), '_blank');
  } else if (action === 'teams') {
    shareToTeams(task);
  }
}

function init() {
  loadTheme();
  loadTasks();
  renderBoard();

  refs.form.addEventListener('submit', handleCreateTask);
  refs.exportBtn.addEventListener('click', exportBacklog);
  refs.themeToggle.addEventListener('click', () => {
    const nextTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
    setTheme(nextTheme);
  });

  document.querySelector('.board').addEventListener('click', handleBoardClick);
}

init();
