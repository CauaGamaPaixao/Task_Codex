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
let movedColumnId = null;

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

    if (!Array.isArray(nextTask.checklist)) {
      nextTask.checklist = createChecklistItems(nextTask.title);
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

function buildChecklistFromTitle(taskTitle) {
  // Regras simples para gerar checklist automático sem depender de IA.
  const normalizedTitle = String(taskTitle || '').trim().toLowerCase();

  if (normalizedTitle.includes('login')) {
    return [
      'Mapear regras de autenticação',
      'Implementar tela/formulário de login',
      'Validar mensagens de erro',
      'Testar fluxo de acesso'
    ];
  }

  if (normalizedTitle.includes('bug')) {
    return [
      'Reproduzir bug em ambiente local',
      'Identificar causa raiz',
      'Aplicar correção',
      'Validar regressão'
    ];
  }

  if (normalizedTitle.includes('api')) {
    return [
      'Definir payloads de entrada/saída',
      'Implementar endpoint',
      'Tratar validações e erros',
      'Testar requisições no client'
    ];
  }

  return [
    'Entender o escopo da tarefa',
    'Implementar etapa principal',
    'Realizar testes',
    'Documentar entrega'
  ];
}

function createChecklistItems(taskTitle) {
  return buildChecklistFromTitle(taskTitle).map((text) => ({
    id: crypto.randomUUID(),
    text,
    done: false
  }));
}

function setStatus(message) {
  statusMessage.textContent = message;
}

// Sanitização básica para exibir texto no HTML com segurança.
function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
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

function moveColumn(draggedId, targetId) {
  if (!draggedId || !targetId || draggedId === targetId) return;
  const fromIndex = columns.findIndex((column) => column.id === draggedId);
  const toIndex = columns.findIndex((column) => column.id === targetId);
  if (fromIndex < 0 || toIndex < 0) return;

  const [dragged] = columns.splice(fromIndex, 1);
  columns.splice(toIndex, 0, dragged);
  movedColumnId = dragged.id;
  persistColumns();
  setStatus(`Quadro "${dragged.name}" movido.`);
  render();
}

function moveTask(draggedTaskId, targetColumnId, targetTaskId = null) {
  const fromIndex = tasks.findIndex((task) => task.id === draggedTaskId);
  if (fromIndex < 0 || !targetColumnId) return;

  const [draggedTask] = tasks.splice(fromIndex, 1);
  draggedTask.status = targetColumnId;

  if (targetTaskId) {
    const insertIndex = tasks.findIndex((task) => task.id === targetTaskId);
    if (insertIndex >= 0) {
      tasks.splice(insertIndex, 0, draggedTask);
    } else {
      tasks.push(draggedTask);
    }
  } else {
    const lastInColumnIndex = tasks.reduce(
      (acc, task, index) => (task.status === targetColumnId ? index : acc),
      -1
    );

    if (lastInColumnIndex >= 0) {
      tasks.splice(lastInColumnIndex + 1, 0, draggedTask);
    } else {
      tasks.push(draggedTask);
    }
  }

  movedTaskId = draggedTask.id;
  persistTasks();
  setStatus(`Movida: "${draggedTask.title}" para ${getStatusLabel(targetColumnId)}.`);
  render();
}

function render() {
  board.innerHTML = '';
  refreshStatusOptions();
  const visible = tasks;

  // Renderização principal do board: cria colunas dinâmicas e conecta drag-and-drop.
  columns.forEach((column) => {
    const colEl = document.createElement('section');
    colEl.className = 'column';
    colEl.dataset.status = column.id;
    colEl.draggable = true;
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
      const checklist = Array.isArray(task.checklist) ? task.checklist : [];
      const doneCount = checklist.filter((item) => item.done).length;
      const checklistHtml = checklist.length
        ? `
          <div class="card-checklist">
            <small>Checklist (${doneCount}/${checklist.length})</small>
            <ul>
              ${checklist
                .map(
                  (item) => `
                    <li>
                      <label>
                        <input type="checkbox" data-checklist-task-id="${task.id}" data-checklist-item-id="${item.id}" ${item.done ? 'checked' : ''} />
                        <span>${escapeHtml(item.text)}</span>
                      </label>
                    </li>
                  `
                )
                .join('')}
            </ul>
          </div>
        `
        : '';

      card.innerHTML = `
        <span class="card-id">${escapeHtml(task.ref)}</span>
        <strong>${escapeHtml(task.title)}</strong>
        <p>${escapeHtml(task.description || 'Sem descrição')}</p>
        <small>Prioridade: ${task.priority}${owner}${due}</small>
        ${checklistHtml}
        <div class="card-actions">
          <button class="ghost" data-action="edit" data-id="${task.id}" type="button">Editar</button>
          <button class="danger" data-action="delete" data-id="${task.id}" type="button">Excluir</button>
        </div>
      `;

      card.addEventListener('dragstart', (event) => {
        card.classList.add('dragging');
        event.dataTransfer.effectAllowed = 'move';
        event.stopPropagation();
        event.dataTransfer.setData('text/task-id', task.id);
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
      });

      card.addEventListener('dragover', (event) => {
        if (!event.dataTransfer.types.includes('text/task-id')) return;
        event.preventDefault();
        event.stopPropagation();
        card.classList.add('card-drop-target');
      });

      card.addEventListener('dragleave', () => {
        card.classList.remove('card-drop-target');
      });

      card.addEventListener('drop', (event) => {
        if (!event.dataTransfer.types.includes('text/task-id')) return;
        event.preventDefault();
        event.stopPropagation();
        card.classList.remove('card-drop-target');
        const draggedTaskId = event.dataTransfer.getData('text/task-id');
        moveTask(draggedTaskId, column.id, task.id);
      });

      colEl.appendChild(card);
    });

    colEl.addEventListener('dragstart', (event) => {
      if (!event.dataTransfer.types.includes('text/task-id')) {
        colEl.classList.add('column-dragging');
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/column-id', column.id);
      }
    });

    colEl.addEventListener('dragend', () => {
      colEl.classList.remove('column-dragging');
    });

    colEl.addEventListener('dragover', (event) => {
      event.preventDefault();
      if (event.dataTransfer.types.includes('text/task-id')) {
        event.dataTransfer.dropEffect = 'move';
        colEl.classList.add('drag-over');
      }
      if (event.dataTransfer.types.includes('text/column-id')) {
        colEl.classList.add('column-drag-over');
      }
    });

    colEl.addEventListener('dragleave', (event) => {
      if (event.target.classList?.contains('card')) {
        event.target.classList.remove('card-drop-target');
      }
      colEl.classList.remove('drag-over');
      colEl.classList.remove('column-drag-over');
    });

    colEl.addEventListener('drop', (event) => {
      event.preventDefault();
      colEl.classList.remove('drag-over');
      colEl.classList.remove('column-drag-over');

      if (event.dataTransfer.types.includes('text/task-id')) {
        const draggedTaskId = event.dataTransfer.getData('text/task-id');
        moveTask(draggedTaskId, column.id);
      }

      if (event.dataTransfer.types.includes('text/column-id')) {
        const draggedColumnId = event.dataTransfer.getData('text/column-id');
        if (draggedColumnId && draggedColumnId !== column.id) {
          moveColumn(draggedColumnId, column.id);
        }
      }
    });

    board.appendChild(colEl);
  });

  if (createdTaskId || movedTaskId || movedColumnId) {
    window.setTimeout(() => {
      createdTaskId = null;
      movedTaskId = null;
      movedColumnId = null;
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
  // Abertura do modal de cadastro: útil para mostrar CRUD básico na apresentação.
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

function openExternalUrl(url) {
  const popup = window.open(url, '_blank', 'noopener,noreferrer');
  if (popup) return true;

  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  link.remove();
  return true;
}

function syncGoogleCalendarV1() {
  // MVP de integração: gera link de evento no Google Calendar para a tarefa mais urgente.
  if (!tasks.length) {
    setStatus('[MCP CALENDAR] Não há tarefas para sincronizar.');
    return;
  }

  const candidateWithDueDate = tasks
    .filter((task) => task.dueDate)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];

  const candidate = candidateWithDueDate || [...tasks].sort((a, b) => a.ref.localeCompare(b.ref))[0];

  if (!candidateWithDueDate) {
    setStatus('[MCP CALENDAR] Nenhuma tarefa com prazo encontrada. Evento será criado para hoje.');
  }

  const url = buildGoogleCalendarUrl(candidate);
  openExternalUrl(url);
  setStatus(`[MCP CALENDAR] Evento preparado para ${candidate.ref} (${candidate.dueDate || 'hoje'}).`);
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

  // Coleta dados do formulário para criar/editar tarefa com estrutura simples e didática.
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
      checklist: createChecklistItems(payload.title),
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

board.addEventListener('change', (event) => {
  const checkbox = event.target.closest('input[data-checklist-task-id][data-checklist-item-id]');
  if (!checkbox) return;

  const task = tasks.find((item) => item.id === checkbox.dataset.checklistTaskId);
  if (!task || !Array.isArray(task.checklist)) return;

  const checklistItem = task.checklist.find((item) => item.id === checkbox.dataset.checklistItemId);
  if (!checklistItem) return;

  checklistItem.done = checkbox.checked;
  persistTasks();
  render();
});

discordReportBtn.addEventListener('click', sendDiscordReport);
calendarSyncBtn.addEventListener('click', syncGoogleCalendarV1);
excelExportBtn.addEventListener('click', exportBacklogToExcelCsv);

document.getElementById('densityToggle').addEventListener('click', () => {
  document.body.classList.toggle('compact');
  setStatus('GUI alterada: modo compacto alternado.');
});

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
