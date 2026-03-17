const STORAGE_KEY = 'kanban-tasks-v3';
const LOG_KEY = 'kanban-log-v3';
const BOARD_BG_KEY = 'kanban-board-bg-v1';

const columns = [
  { id: 'todo', name: 'A Fazer' },
  { id: 'doing', name: 'Em Progresso' },
  { id: 'review', name: 'Revisão' },
  { id: 'done', name: 'Concluído' }
];

const defaults = [
  { id: crypto.randomUUID(), title: 'Definir backlog', description: 'Levantar funcionalidades MVP', owner: 'Equipe', dueDate: '', priority: 'Alta', status: 'todo' },
  { id: crypto.randomUUID(), title: 'Criar layout inicial', description: 'Estruturar board Kanban', owner: 'Front-end', dueDate: '', priority: 'Média', status: 'doing' },
  { id: crypto.randomUUID(), title: 'Validar com gestor', description: 'Review da sprint', owner: 'PM', dueDate: '', priority: 'Baixa', status: 'review' }
];

let tasks = loadTasks();
let createdTaskId = null;
let movedTaskId = null;
let draggingTaskId = null;

const board = document.getElementById('board');
const boardArea = document.getElementById('boardArea');
const dialog = document.getElementById('taskDialog');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskForm = document.getElementById('taskForm');
const cancelDialog = document.getElementById('cancelDialog');
const log = document.getElementById('log');
const dialogTitle = document.getElementById('dialogTitle');
const searchInput = document.getElementById('searchInput');
const priorityFilter = document.getElementById('priorityFilter');
const calendarSyncBtn = document.getElementById('calendarSyncBtn');
const boardColorPicker = document.getElementById('boardColorPicker');
const boardImagePicker = document.getElementById('boardImagePicker');
const clearBackgroundBtn = document.getElementById('clearBackground');

function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaults;
  } catch {
    return defaults;
  }
}

function persistTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadLog() {
  log.textContent = localStorage.getItem(LOG_KEY) || '';
}

function persistLog() {
  localStorage.setItem(LOG_KEY, log.textContent);
}

function appendLog(message) {
  const date = new Date().toLocaleTimeString('pt-BR');
  log.textContent += `[${date}] ${message}\n`;
  persistLog();
}

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function filteredTasks() {
  const q = searchInput.value.trim().toLowerCase();
  const pf = priorityFilter.value;

  return tasks.filter((task) => {
    const text = `${task.title} ${task.description} ${task.owner}`.toLowerCase();
    const byText = !q || text.includes(q);
    const byPriority = !pf || task.priority === pf;
    return byText && byPriority;
  });
}

function render() {
  board.innerHTML = '';
  const visible = filteredTasks();

  columns.forEach((column) => {
    const colEl = document.createElement('section');
    colEl.className = 'column';
    colEl.dataset.status = column.id;
    colEl.innerHTML = `<h3>${column.name}</h3>`;

    visible.filter((task) => task.status === column.id).forEach((task) => {
      const card = document.createElement('article');
      card.className = 'card';
      card.draggable = true;
      card.dataset.id = task.id;

      if (task.id === createdTaskId) card.classList.add('is-new');
      if (task.id === movedTaskId) card.classList.add('was-moved');

      const due = task.dueDate ? ` | Prazo: ${task.dueDate}` : '';
      const owner = task.owner ? ` | Resp.: ${task.owner}` : '';

      card.innerHTML = `
        <strong>${escapeHtml(task.title)}</strong>
        <p>${escapeHtml(task.description || 'Sem descrição')}</p>
        <small>Prioridade: ${task.priority}${owner}${due}</small>
        <div class="card-actions">
          <button class="ghost" data-action="edit" data-id="${task.id}" type="button">Editar</button>
          <button class="danger" data-action="delete" data-id="${task.id}" type="button">Excluir</button>
        </div>
      `;

      card.addEventListener('dragstart', (event) => {
        draggingTaskId = task.id;
        card.classList.add('dragging');
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/task-id', task.id);
      });

      card.addEventListener('dragend', () => {
        draggingTaskId = null;
        card.classList.remove('dragging');
      });

      colEl.appendChild(card);
    });

    colEl.addEventListener('dragover', (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      colEl.classList.add('drag-over');
    });

    colEl.addEventListener('dragleave', () => {
      colEl.classList.remove('drag-over');
    });

    colEl.addEventListener('drop', (event) => {
      event.preventDefault();
      colEl.classList.remove('drag-over');
      const taskId = event.dataTransfer.getData('text/task-id');
      const target = tasks.find((item) => item.id === taskId);
      if (target && target.status !== column.id) {
        target.status = column.id;
        movedTaskId = target.id;
        appendLog(`Movida: "${target.title}" para ${column.name}.`);
        persistTasks();
        render();
      }
    });

    board.appendChild(colEl);
  });

  if (createdTaskId || movedTaskId) {
    window.setTimeout(() => {
      createdTaskId = null;
      movedTaskId = null;
      render();
    }, 550);
  }
}

function openCreateDialog() {
  taskForm.reset();
  taskForm.id.value = '';
  dialogTitle.textContent = 'Nova Tarefa';
  dialog.showModal();
}

function openEditDialog(taskId) {
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return;
  dialogTitle.textContent = 'Editar Tarefa';
  taskForm.id.value = task.id;
  taskForm.title.value = task.title;
  taskForm.description.value = task.description;
  taskForm.owner.value = task.owner || '';
  taskForm.dueDate.value = task.dueDate || '';
  taskForm.priority.value = task.priority;
  dialog.showModal();
}

function deleteTask(taskId) {
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return;
  tasks = tasks.filter((t) => t.id !== taskId);
  appendLog(`Excluída: "${task.title}".`);
  persistTasks();
  render();
}

function toCalendarDateRange(dateText) {
  const base = new Date(`${dateText}T09:00:00`);
  const end = new Date(base.getTime() + 60 * 60 * 1000);
  const fmt = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  return `${fmt(base)}/${fmt(end)}`;
}

function buildGoogleCalendarUrl(task) {
  const title = encodeURIComponent(`Kanban: ${task.title}`);
  const details = encodeURIComponent(task.description || 'Tarefa criada no Kanban Task App');
  const dates = task.dueDate ? toCalendarDateRange(task.dueDate) : toCalendarDateRange(new Date().toISOString().slice(0, 10));
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${dates}`;
}

function syncGoogleCalendarV1() {
  const candidate = tasks
    .filter((task) => task.status !== 'done' && task.dueDate)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];

  if (!candidate) {
    appendLog('[MCP CALENDAR] Nenhuma tarefa com prazo encontrada para criar evento.');
    return;
  }

  const url = buildGoogleCalendarUrl(candidate);
  window.open(url, '_blank', 'noopener,noreferrer');
  appendLog(`[MCP CALENDAR] Evento preparado para "${candidate.title}" (${candidate.dueDate}).`);
}

function saveBoardBackground(payload) {
  localStorage.setItem(BOARD_BG_KEY, JSON.stringify(payload));
}

function applyBoardBackground(payload) {
  if (!payload || payload.type === 'default') {
    boardArea.style.backgroundImage = 'none';
    boardArea.style.backgroundColor = '#f5f7fb';
    return;
  }

  if (payload.type === 'color') {
    boardArea.style.backgroundImage = 'none';
    boardArea.style.backgroundColor = payload.value;
    return;
  }

  if (payload.type === 'image') {
    boardArea.style.backgroundColor = '#dbeafe';
    boardArea.style.backgroundImage = `url("${payload.value}")`;
  }
}

function loadBoardBackground() {
  try {
    const stored = JSON.parse(localStorage.getItem(BOARD_BG_KEY));
    applyBoardBackground(stored);
  } catch {
    applyBoardBackground({ type: 'default' });
  }
}

addTaskBtn.addEventListener('click', openCreateDialog);
cancelDialog.addEventListener('click', () => dialog.close());

taskForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(taskForm);
  const payload = {
    title: formData.get('title')?.toString().trim(),
    description: formData.get('description')?.toString().trim(),
    owner: formData.get('owner')?.toString().trim(),
    dueDate: formData.get('dueDate')?.toString(),
    priority: formData.get('priority')?.toString()
  };

  if (!payload.title) return;

  const id = formData.get('id')?.toString();
  if (id) {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      task.title = payload.title;
      task.description = payload.description;
      task.owner = payload.owner;
      task.dueDate = payload.dueDate;
      task.priority = payload.priority;
      appendLog(`Editada: "${task.title}".`);
    }
  } else {
    const newTask = {
      id: crypto.randomUUID(),
      ...payload,
      status: 'todo'
    };
    tasks.push(newTask);
    createdTaskId = newTask.id;
    appendLog(`Nova tarefa criada: "${newTask.title}".`);
  }

  persistTasks();
  render();
  dialog.close();
});

board.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const { action, id } = button.dataset;
  if (action === 'edit') openEditDialog(id);
  if (action === 'delete') deleteTask(id);
});

calendarSyncBtn.addEventListener('click', syncGoogleCalendarV1);

[...document.querySelectorAll('[data-mcp]')].forEach((button) => {
  button.addEventListener('click', () => {
    const mcp = button.dataset.mcp;
    const descriptions = {
      github: 'Issues sincronizadas com o repositório (simulação).',
      slack: 'Mensagem enviada no canal #kanban-updates (simulação).'
    };
    appendLog(`[MCP ${mcp.toUpperCase()}] ${descriptions[mcp]}`);
  });
});

document.getElementById('densityToggle').addEventListener('click', () => {
  document.body.classList.toggle('compact');
  appendLog('GUI alterada: modo compacto alternado.');
});

searchInput.addEventListener('input', render);
priorityFilter.addEventListener('change', render);

boardColorPicker.addEventListener('input', (event) => {
  const color = event.target.value;
  const payload = { type: 'color', value: color };
  applyBoardBackground(payload);
  saveBoardBackground(payload);
  appendLog(`GUI alterada: fundo do quadro atualizado para ${color}.`);
});

boardImagePicker.addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const payload = { type: 'image', value: reader.result };
    applyBoardBackground(payload);
    saveBoardBackground(payload);
    appendLog(`GUI alterada: fundo do quadro por imagem "${file.name}".`);
  };
  reader.readAsDataURL(file);
});

clearBackgroundBtn.addEventListener('click', () => {
  const payload = { type: 'default' };
  applyBoardBackground(payload);
  saveBoardBackground(payload);
  appendLog('GUI alterada: fundo do quadro restaurado para padrão.');
});

loadLog();
loadBoardBackground();
render();
