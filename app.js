const STORAGE_KEY = 'kanban-tasks-v5';
const COLUMN_STORAGE_KEY = 'kanban-columns-v2';
const BOARD_BG_KEY = 'kanban-board-bg-v1';
const REF_COUNTER_KEY = 'kanban-ref-counter-v1';

const starterColumns = [
  { id: crypto.randomUUID(), name: 'Backlog' },
  { id: crypto.randomUUID(), name: 'Em andamento' },
  { id: crypto.randomUUID(), name: 'Concluído' }
];

const defaults = [
  { id: crypto.randomUUID(), ref: 'T-001', title: 'Definir backlog', description: 'Levantar funcionalidades MVP', owner: 'Equipe', dueDate: '', priority: 'Alta', status: starterColumns[0].id },
  { id: crypto.randomUUID(), ref: 'T-002', title: 'Criar layout inicial', description: 'Estruturar board Kanban', owner: 'Front-end', dueDate: '', priority: 'Média', status: starterColumns[1].id },
  { id: crypto.randomUUID(), ref: 'T-003', title: 'Validar com gestor', description: 'Review da sprint', owner: 'PM', dueDate: '', priority: 'Baixa', status: starterColumns[1].id }
];

let columns = loadColumns();
let tasks = hydrateTasks(loadTasks());
let createdTaskId = null;
let movedTaskId = null;

const board = document.getElementById('board');
const boardArea = document.getElementById('boardArea');
const dialog = document.getElementById('taskDialog');
const addTaskBtn = document.getElementById('addTaskBtn');
const addColumnBtn = document.getElementById('addColumnBtn');
const newColumnName = document.getElementById('newColumnName');
const taskForm = document.getElementById('taskForm');
const cancelDialog = document.getElementById('cancelDialog');
const statusMessage = document.getElementById('statusMessage');
const dialogTitle = document.getElementById('dialogTitle');
const searchInput = document.getElementById('searchInput');
const priorityFilter = document.getElementById('priorityFilter');
const discordReportBtn = document.getElementById('discordReportBtn');
const calendarSyncBtn = document.getElementById('calendarSyncBtn');
const excelExportBtn = document.getElementById('excelExportBtn');
const boardColorPicker = document.getElementById('boardColorPicker');
const boardImagePicker = document.getElementById('boardImagePicker');
const clearBackgroundBtn = document.getElementById('clearBackground');
const taskStatusSelect = document.getElementById('taskStatusSelect');

function loadColumns() {
  try {
    const stored = JSON.parse(localStorage.getItem(COLUMN_STORAGE_KEY));
    if (Array.isArray(stored) && stored.length > 0) return stored;
  } catch {
    // fallback to starter columns
  }
  localStorage.setItem(COLUMN_STORAGE_KEY, JSON.stringify(starterColumns));
  return starterColumns;
}

function persistColumns() {
  localStorage.setItem(COLUMN_STORAGE_KEY, JSON.stringify(columns));
}

function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaults;
  } catch {
    return defaults;
  }
}

function hydrateTasks(rawTasks) {
  let counter = Number(localStorage.getItem(REF_COUNTER_KEY) || '0');
  const legacyMap = {
    todo: columns[0]?.id,
    doing: columns[1]?.id || columns[0]?.id,
    review: columns[1]?.id || columns[0]?.id,
    done: columns[columns.length - 1]?.id || columns[0]?.id
  };

  const hydrated = rawTasks.map((task) => {
    const nextTask = { ...task };

    if (nextTask.ref) {
      const value = Number(nextTask.ref.replace('T-', ''));
      if (!Number.isNaN(value)) counter = Math.max(counter, value);
    } else {
      counter += 1;
      nextTask.ref = `T-${String(counter).padStart(3, '0')}`;
    }

    if (!columns.some((column) => column.id === nextTask.status)) {
      nextTask.status = legacyMap[nextTask.status] || columns[0]?.id;
    }

    return nextTask;
  });

  localStorage.setItem(REF_COUNTER_KEY, String(counter));
  return hydrated;
}

function nextTaskRef() {
  const current = Number(localStorage.getItem(REF_COUNTER_KEY) || '0') + 1;
  localStorage.setItem(REF_COUNTER_KEY, String(current));
  return `T-${String(current).padStart(3, '0')}`;
}

function persistTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function setStatus(message) {
  statusMessage.textContent = message;
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
    const text = `${task.ref} ${task.title} ${task.description} ${task.owner}`.toLowerCase();
    const byText = !q || text.includes(q);
    const byPriority = !pf || task.priority === pf;
    return byText && byPriority;
  });
}

function getStatusLabel(statusId) {
  return columns.find((column) => column.id === statusId)?.name || 'Sem quadro';
}

function refreshStatusOptions(selectedId = taskStatusSelect.value) {
  taskStatusSelect.innerHTML = '';
  columns.forEach((column) => {
    const option = document.createElement('option');
    option.value = column.id;
    option.textContent = column.name;
    if (selectedId === column.id) option.selected = true;
    taskStatusSelect.appendChild(option);
  });
}

function ensureValidTaskStatuses() {
  const fallbackStatus = columns[0]?.id;
  tasks = tasks.map((task) => ({
    ...task,
    status: columns.some((column) => column.id === task.status) ? task.status : fallbackStatus
  }));
  persistTasks();
}

function render() {
  board.innerHTML = '';
  refreshStatusOptions();
  const visible = filteredTasks();

  columns.forEach((column) => {
    const colEl = document.createElement('section');
    colEl.className = 'column';
    colEl.dataset.status = column.id;
    colEl.innerHTML = `
      <div class="column-header">
        <h3>${escapeHtml(column.name)}</h3>
        <button class="ghost remove-column-btn" data-column-id="${column.id}" type="button">Remover</button>
      </div>
    `;

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
        <span class="card-id">${escapeHtml(task.ref)}</span>
        <strong>${escapeHtml(task.title)}</strong>
        <p>${escapeHtml(task.description || 'Sem descrição')}</p>
        <small>Prioridade: ${task.priority}${owner}${due}</small>
        <div class="card-actions">
          <button class="ghost" data-action="edit" data-id="${task.id}" type="button">Editar</button>
          <button class="danger" data-action="delete" data-id="${task.id}" type="button">Excluir</button>
        </div>
      `;

      card.addEventListener('dragstart', (event) => {
        card.classList.add('dragging');
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/task-id', task.id);
      });

      card.addEventListener('dragend', () => {
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
        setStatus(`Movida: "${target.title}" para ${column.name}.`);
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

function addColumn() {
  const name = newColumnName.value.trim();
  if (!name) {
    setStatus('Informe um nome para o novo quadro.');
    return;
  }

  const column = { id: crypto.randomUUID(), name };
  columns.push(column);
  persistColumns();
  refreshStatusOptions(column.id);
  render();
  newColumnName.value = '';
  setStatus(`Quadro "${name}" criado com sucesso.`);
}

function removeColumn(columnId) {
  if (columns.length === 1) {
    setStatus('É necessário manter pelo menos um quadro no board.');
    return;
  }

  const column = columns.find((item) => item.id === columnId);
  if (!column) return;

  const fallbackColumn = columns.find((item) => item.id !== columnId);
  tasks = tasks.map((task) => ({
    ...task,
    status: task.status === columnId ? fallbackColumn.id : task.status
  }));
  columns = columns.filter((item) => item.id !== columnId);
  persistColumns();
  persistTasks();
  refreshStatusOptions(fallbackColumn.id);
  render();
  setStatus(`Quadro "${column.name}" removido. As tarefas foram movidas para "${fallbackColumn.name}".`);
}

function openCreateDialog() {
  if (!columns.length) {
    setStatus('Crie pelo menos um quadro antes de cadastrar tarefas.');
    return;
  }
  taskForm.reset();
  taskForm.id.value = '';
  dialogTitle.textContent = 'Nova Tarefa';
  refreshStatusOptions(columns[0].id);
  dialog.showModal();
}

function openEditDialog(taskId) {
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return;
  dialogTitle.textContent = `Editar Tarefa ${task.ref}`;
  taskForm.id.value = task.id;
  taskForm.title.value = task.title;
  taskForm.description.value = task.description;
  taskForm.owner.value = task.owner || '';
  taskForm.dueDate.value = task.dueDate || '';
  taskForm.priority.value = task.priority;
  refreshStatusOptions(task.status);
  dialog.showModal();
}

function deleteTask(taskId) {
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return;
  tasks = tasks.filter((t) => t.id !== taskId);
  setStatus(`Excluída: ${task.ref} - "${task.title}".`);
  persistTasks();
  render();
}

function toCalendarDateRange(dateText) {
  const base = new Date(`${dateText}T09:00:00`);
  const end = new Date(base.getTime() + 60 * 60 * 1000);
  const fmt = (date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  return `${fmt(base)}/${fmt(end)}`;
}

function buildGoogleCalendarUrl(task) {
  const title = encodeURIComponent(`Kanban: ${task.title}`);
  const details = encodeURIComponent(task.description || 'Tarefa criada no Kanban Task App');
  const dates = task.dueDate
    ? toCalendarDateRange(task.dueDate)
    : toCalendarDateRange(new Date().toISOString().slice(0, 10));
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${dates}`;
}

function syncGoogleCalendarV1() {
  const candidate = tasks
    .filter((task) => task.dueDate)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];

  if (!candidate) {
    setStatus('[MCP CALENDAR] Nenhuma tarefa com prazo encontrada para criar evento.');
    return;
  }

  const url = buildGoogleCalendarUrl(candidate);
  window.open(url, '_blank', 'noopener,noreferrer');
  setStatus(`[MCP CALENDAR] Evento preparado para ${candidate.ref} (${candidate.dueDate}).`);
}

function summarizeDescription(description) {
  const text = (description || '').trim();
  if (!text) return 'Sem descrição';
  return text.length > 80 ? `${text.slice(0, 77)}...` : text;
}

async function sendDiscordReport() {
  const candidate = tasks.sort((a, b) => a.ref.localeCompare(b.ref))[0];

  if (!candidate) {
    setStatus('[MCP DISCORD] Não há tarefas para relatório.');
    return;
  }

  const message = [
    `📌 Relatório da Task ${candidate.ref}`,
    `Título: ${candidate.title}`,
    `Resumo: ${summarizeDescription(candidate.description)}`,
    `Prioridade: ${candidate.priority}`,
    `Prazo: ${candidate.dueDate || 'Não definido'}`,
    `Quadro: ${getStatusLabel(candidate.status)}`
  ].join('\n');

  try {
    await navigator.clipboard.writeText(message);
    window.open('https://discord.com/channels/@me', '_blank', 'noopener,noreferrer');
    setStatus(`[MCP DISCORD] Relatório de ${candidate.ref} copiado e Discord aberto.`);
  } catch {
    setStatus(`[MCP DISCORD] Copie manualmente:\n${message}`);
  }
}

function exportBacklogToExcelCsv() {
  if (!tasks.length) {
    setStatus('[MCP EXCEL] Nenhuma tarefa para exportar.');
    return;
  }

  const header = ['ID', 'Título', 'Descrição', 'Prioridade', 'Prazo', 'Responsável', 'Quadro'];
  const rows = tasks.map((task) => [
    task.ref,
    task.title,
    task.description || '',
    task.priority,
    task.dueDate || '',
    task.owner || '',
    getStatusLabel(task.status)
  ]);

  const escapeCsv = (value) => `"${String(value).replaceAll('"', '""')}"`;
  const csv = [header, ...rows].map((line) => line.map(escapeCsv).join(';')).join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `backlog-kanban-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  setStatus('[MCP EXCEL] Backlog exportado em CSV compatível com Excel.');
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
addColumnBtn.addEventListener('click', addColumn);
cancelDialog.addEventListener('click', () => dialog.close());

newColumnName.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    addColumn();
  }
});

taskForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(taskForm);
  const payload = {
    title: formData.get('title')?.toString().trim(),
    description: formData.get('description')?.toString().trim(),
    owner: formData.get('owner')?.toString().trim(),
    dueDate: formData.get('dueDate')?.toString(),
    priority: formData.get('priority')?.toString(),
    status: formData.get('status')?.toString() || columns[0]?.id
  };

  if (!payload.title) return;

  const id = formData.get('id')?.toString();
  if (id) {
    const task = tasks.find((item) => item.id === id);
    if (task) {
      task.title = payload.title;
      task.description = payload.description;
      task.owner = payload.owner;
      task.dueDate = payload.dueDate;
      task.priority = payload.priority;
      task.status = payload.status;
      setStatus(`Editada: ${task.ref} - "${task.title}".`);
    }
  } else {
    const newTask = {
      id: crypto.randomUUID(),
      ref: nextTaskRef(),
      ...payload
    };
    tasks.push(newTask);
    createdTaskId = newTask.id;
    setStatus(`Nova tarefa criada: ${newTask.ref} - "${newTask.title}".`);
  }

  persistTasks();
  render();
  dialog.close();
});

board.addEventListener('click', (event) => {
  const actionButton = event.target.closest('button[data-action]');
  if (actionButton) {
    const { action, id } = actionButton.dataset;
    if (action === 'edit') openEditDialog(id);
    if (action === 'delete') deleteTask(id);
    return;
  }

  const removeColumnButton = event.target.closest('button[data-column-id]');
  if (removeColumnButton) {
    removeColumn(removeColumnButton.dataset.columnId);
  }
});

discordReportBtn.addEventListener('click', sendDiscordReport);
calendarSyncBtn.addEventListener('click', syncGoogleCalendarV1);
excelExportBtn.addEventListener('click', exportBacklogToExcelCsv);

document.getElementById('densityToggle').addEventListener('click', () => {
  document.body.classList.toggle('compact');
  setStatus('GUI alterada: modo compacto alternado.');
});

searchInput.addEventListener('input', render);
priorityFilter.addEventListener('change', render);

boardColorPicker.addEventListener('input', (event) => {
  const color = event.target.value;
  const payload = { type: 'color', value: color };
  applyBoardBackground(payload);
  saveBoardBackground(payload);
  setStatus(`GUI alterada: fundo do quadro atualizado para ${color}.`);
});

boardImagePicker.addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const payload = { type: 'image', value: reader.result };
    applyBoardBackground(payload);
    saveBoardBackground(payload);
    setStatus(`GUI alterada: fundo do quadro por imagem "${file.name}".`);
  };
  reader.readAsDataURL(file);
});

clearBackgroundBtn.addEventListener('click', () => {
  const payload = { type: 'default' };
  applyBoardBackground(payload);
  saveBoardBackground(payload);
  setStatus('GUI alterada: fundo do quadro restaurado para padrão.');
});

ensureValidTaskStatuses();
loadBoardBackground();
render();
