const TASKS_KEY = 'task_manager_tasks_v1';
const THEME_KEY = 'task_manager_theme_v1';

let tasks = [];

const refs = {
  form: document.getElementById('taskForm'),
  title: document.getElementById('title'),
  description: document.getElementById('description'),
  priority: document.getElementById('priority'),
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

function applyTheme(theme) {
  document.body.classList.toggle('dark', theme === 'dark');
  localStorage.setItem(THEME_KEY, theme);
}

function loadTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
  applyTheme(savedTheme);
}

function priorityClass(priority) {
  return `priority-${priority.toLowerCase()}`;
}

function moveTaskForward(task) {
  if (task.status === 'todo') {
    task.status = 'doing';
  } else if (task.status === 'doing') {
    task.status = 'done';
  }
  saveTasks();
  renderBoard();
}

function finishTask(taskId) {
  tasks = tasks.filter((task) => task.id !== taskId);
  saveTasks();
  renderBoard();
}

function toggleChecklist(taskId, itemIndex) {
  const task = tasks.find((entry) => entry.id === taskId);
  if (!task) return;

  task.checklist[itemIndex].checked = !task.checklist[itemIndex].checked;
  saveTasks();
}

function openGoogleCalendar(task) {
  const base = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
  const text = encodeURIComponent(task.title);
  const details = encodeURIComponent(task.description || '');
  window.open(`${base}&text=${text}&details=${details}`, '_blank');
}

async function shareToTeams(task) {
  const summary = `New Task: ${task.title} | Priority: ${task.priority}`;
  try {
    await navigator.clipboard.writeText(summary);
  } catch (error) {
    console.warn('Failed to copy summary:', error);
  }
  window.open('https://teams.microsoft.com', '_blank');
}

function exportToCSV() {
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

function createTaskCard(task) {
  const card = document.createElement('article');
  card.className = 'task-card';

  const checklistHtml = task.checklist
    .map(
      (item, index) => `
      <label class="checklist-item">
        <input type="checkbox" data-task-id="${task.id}" data-check-index="${index}" ${
          item.checked ? 'checked' : ''
        } />
        <span>${item.text}</span>
      </label>
    `,
    )
    .join('');

  const moveButtonLabel = task.status === 'todo' ? 'Start Task' : 'Complete Task';

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
      ${
        task.status !== 'done'
          ? `<button type="button" data-action="move" data-task-id="${task.id}">${moveButtonLabel}</button>`
          : `<button type="button" data-action="finish" data-task-id="${task.id}">Finish Task</button>`
      }
      <button type="button" data-action="calendar" data-task-id="${task.id}">Add to Calendar</button>
      <button type="button" data-action="teams" data-task-id="${task.id}">Share to Teams</button>
    </div>
  `;

  return card;
}

function renderColumn(listElement, columnTasks) {
  listElement.innerHTML = '';

  if (columnTasks.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'No tasks yet.';
    listElement.appendChild(empty);
    return;
  }

  columnTasks.forEach((task) => {
    listElement.appendChild(createTaskCard(task));
  });
}

function renderBoard() {
  renderColumn(
    refs.todoList,
    tasks.filter((task) => task.status === 'todo'),
  );
  renderColumn(
    refs.doingList,
    tasks.filter((task) => task.status === 'doing'),
  );
  renderColumn(
    refs.doneList,
    tasks.filter((task) => task.status === 'done'),
  );
}

async function requestChecklist(description) {
  const response = await fetch('/api/checklist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate checklist');
  }

  const data = await response.json();
  return (data.checklist || []).map((item) => ({ text: item, checked: false }));
}

async function onCreateTask(event) {
  event.preventDefault();

  const title = refs.title.value.trim();
  const description = refs.description.value.trim();
  const priority = refs.priority.value;

  if (!title) {
    return;
  }

  let checklist = [];
  try {
    checklist = await requestChecklist(description);
  } catch (error) {
    checklist = [
      { text: 'Break down requirements', checked: false },
      { text: 'Implement task', checked: false },
      { text: 'Test functionality', checked: false },
    ];
  }

  const task = {
    id: crypto.randomUUID(),
    title,
    description,
    priority,
    status: 'todo',
    checklist,
  };

  tasks.unshift(task);
  saveTasks();
  renderBoard();
  refs.form.reset();
  refs.priority.value = 'Medium';
}

function onBoardClick(event) {
  const target = event.target;

  if (target.matches('input[type="checkbox"][data-task-id]')) {
    toggleChecklist(target.dataset.taskId, Number(target.dataset.checkIndex));
    return;
  }

  const action = target.dataset.action;
  const taskId = target.dataset.taskId;

  if (!action || !taskId) return;
  const task = tasks.find((entry) => entry.id === taskId);
  if (!task) return;

  if (action === 'move') {
    moveTaskForward(task);
  } else if (action === 'finish') {
    finishTask(taskId);
  } else if (action === 'calendar') {
    openGoogleCalendar(task);
  } else if (action === 'teams') {
    shareToTeams(task);
  }
}

function onToggleTheme() {
  const next = document.body.classList.contains('dark') ? 'light' : 'dark';
  applyTheme(next);
}

function init() {
  loadTheme();
  loadTasks();
  renderBoard();

  refs.form.addEventListener('submit', onCreateTask);
  refs.exportBtn.addEventListener('click', exportToCSV);
  refs.themeToggle.addEventListener('click', onToggleTheme);
  document.querySelector('.board').addEventListener('click', onBoardClick);
}

init();
