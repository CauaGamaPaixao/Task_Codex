const STORAGE_KEY = 'kanban-tasks-v4';
const BOARD_BG_KEY = 'kanban-board-bg-v1';
const REF_COUNTER_KEY = 'kanban-ref-counter-v1';

const columns = [
  { id: 'todo', name: 'A Fazer' },
  { id: 'doing', name: 'Em Progresso' },
  { id: 'review', name: 'Revisão' },
  { id: 'done', name: 'Concluído' }
];

const defaults = [
  { id: crypto.randomUUID(), ref: 'T-001', title: 'Definir backlog', description: 'Levantar funcionalidades MVP', owner: 'Equipe', dueDate: '', priority: 'Alta', status: 'todo' },
  { id: crypto.randomUUID(), ref: 'T-002', title: 'Criar layout inicial', description: 'Estruturar board Kanban', owner: 'Front-end', dueDate: '', priority: 'Média', status: 'doing' },
  { id: crypto.randomUUID(), ref: 'T-003', title: 'Validar com gestor', description: 'Review da sprint', owner: 'PM', dueDate: '', priority: 'Baixa', status: 'review' }
];

let tasks = hydrateTasks(loadTasks());
let createdTaskId = null;
let movedTaskId = null;

const board = document.getElementById('board');
const boardArea = document.getElementById('boardArea');
const dialog = document.getElementById('taskDialog');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskForm = document.getElementById('taskForm');
const cancelDialog = document.getElementById('cancelDialog');
const statusMessage = document.getElementById('statusMessage');
const dialogTitle = document.getElementById('dialogTitle');
const searchInput = document.getElementById('searchInput');
const priorityFilter = document.getElementById('priorityFilter');
const discordReportBtn = document.getElementById('discordReportBtn');
const calendarSyncBtn = document.getElementById('calendarSyncBtn');
const excelExportBtn = document.getElementById('excelExportBtn');
const chatCommand = document.getElementById('chatCommand');
const runChatCommand = document.getElementById('runChatCommand');
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

function hydrateTasks(rawTasks) {
  let counter = Number(localStorage.getItem(REF_COUNTER_KEY) || '0');
  const hydrated = rawTasks.map((task) => {
    if (task.ref) {
      const value = Number(task.ref.replace('T-', ''));
      if (!Number.isNaN(value)) counter = Math.max(counter, value);
      return task;
    }
    counter += 1;
    return { ...task, ref: `T-${String(counter).padStart(3, '0')}` };
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
  return columns.find((col) => col.id === statusId)?.name || statusId;
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

function openCreateDialog() {
  taskForm.reset();
  taskForm.id.value = '';
  dialogTitle.textContent = 'Nova Tarefa';
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
  const fmt = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
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
    .filter((task) => task.status !== 'done' && task.dueDate)
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
  const candidate = tasks
    .filter((task) => task.status !== 'done')
    .sort((a, b) => a.ref.localeCompare(b.ref))[0];

  if (!candidate) {
    setStatus('[MCP DISCORD] Não há tarefas pendentes para relatório.');
    return;
  }

  const message = [
    `📌 Relatório da Task ${candidate.ref}`,
    `Título: ${candidate.title}`,
    `Resumo: ${summarizeDescription(candidate.description)}`,
    `Prioridade: ${candidate.priority}`,
    `Prazo: ${candidate.dueDate || 'Não definido'}`
  ].join('\n');

  try {
    await navigator.clipboard.writeText(message);
    window.open('https://discord.com/channels/@me', '_blank', 'noopener,noreferrer');
    setStatus(`[MCP DISCORD] Relatório de ${candidate.ref} copiado e Discord aberto.`);
  } catch {
    setStatus(`[MCP DISCORD] Copie manualmente:\n${message}`);
  }
}

function createTaskFromChat(parts) {
  if (parts.length < 5) {
    setStatus('Uso: /nova Título | descrição | prioridade | prazo(YYYY-MM-DD) | responsável');
    return;
  }

  const [title, description, priority, dueDate, owner] = parts.map((item) => item.trim());
  const normalizedPriority = ['Baixa', 'Média', 'Alta'].includes(priority) ? priority : 'Média';

  const task = {
    id: crypto.randomUUID(),
    ref: nextTaskRef(),
    title,
    description,
    priority: normalizedPriority,
    dueDate,
    owner,
    status: 'todo'
  };

  tasks.push(task);
  createdTaskId = task.id;
  persistTasks();
  render();
  setStatus(`[MCP DISCORD] Card criado via chat: ${task.ref} - ${task.title}.`);
}

function editTaskFromChat(ref, updatesText) {
  const task = tasks.find((item) => item.ref.toLowerCase() === ref.toLowerCase());
  if (!task) {
    setStatus(`[MCP DISCORD] Card ${ref} não encontrado.`);
    return;
  }

  const updates = updatesText.split(';').map((entry) => entry.trim()).filter(Boolean);
  const map = Object.fromEntries(
    updates
      .map((entry) => entry.split('=').map((v) => v.trim()))
      .filter((parts) => parts.length === 2)
  );

  if (map.titulo) task.title = map.titulo;
  if (map.descricao) task.description = map.descricao;
  if (map.prioridade && ['Baixa', 'Média', 'Alta'].includes(map.prioridade)) task.priority = map.prioridade;
  if (map.prazo) task.dueDate = map.prazo;
  if (map.responsavel) task.owner = map.responsavel;
  if (map.status && columns.some((col) => col.id === map.status)) task.status = map.status;

  persistTasks();
  render();
  setStatus(`[MCP DISCORD] Card ${task.ref} atualizado via chat.`);
}

function processDiscordChatCommand(command) {
  const trimmed = command.trim();

  if (trimmed.startsWith('/nova ')) {
    const payload = trimmed.slice(6);
    const parts = payload.split('|');
    createTaskFromChat(parts);
    return;
  }

  if (trimmed.startsWith('/editar ')) {
    const payload = trimmed.slice(8);
    const [ref, updates] = payload.split('|').map((item) => item.trim());
    if (!ref || !updates) {
      setStatus('Uso: /editar T-001 | titulo=...;descricao=...;prioridade=...;prazo=...;responsavel=...;status=todo');
      return;
    }
    editTaskFromChat(ref, updates);
    return;
  }

  setStatus('Comando inválido. Use /nova ou /editar.');
}

function exportBacklogToExcelCsv() {
  if (!tasks.length) {
    setStatus('[MCP EXCEL] Nenhuma tarefa para exportar.');
    return;
  }

  const header = ['ID', 'Título', 'Descrição', 'Prioridade', 'Prazo', 'Responsável', 'Status'];
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
      setStatus(`Editada: ${task.ref} - "${task.title}".`);
    }
  } else {
    const newTask = {
      id: crypto.randomUUID(),
      ref: nextTaskRef(),
      ...payload,
      status: 'todo'
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
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const { action, id } = button.dataset;
  if (action === 'edit') openEditDialog(id);
  if (action === 'delete') deleteTask(id);
});

discordReportBtn.addEventListener('click', sendDiscordReport);
calendarSyncBtn.addEventListener('click', syncGoogleCalendarV1);
excelExportBtn.addEventListener('click', exportBacklogToExcelCsv);

runChatCommand.addEventListener('click', () => {
  processDiscordChatCommand(chatCommand.value);
  chatCommand.value = '';
});

chatCommand.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    runChatCommand.click();
  }
});

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

loadBoardBackground();
render();
