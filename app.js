const STORAGE_KEY = 'kanban-tasks-v2';
const LOG_KEY = 'kanban-log-v2';

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

const board = document.getElementById('board');
const dialog = document.getElementById('taskDialog');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskForm = document.getElementById('taskForm');
const cancelDialog = document.getElementById('cancelDialog');
const log = document.getElementById('log');
const dialogTitle = document.getElementById('dialogTitle');
const searchInput = document.getElementById('searchInput');
const priorityFilter = document.getElementById('priorityFilter');

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
        event.dataTransfer.setData('text/task-id', task.id);
      });

      colEl.appendChild(card);
    });

    colEl.addEventListener('dragover', (event) => event.preventDefault());
    colEl.addEventListener('drop', (event) => {
      event.preventDefault();
      const taskId = event.dataTransfer.getData('text/task-id');
      const target = tasks.find((item) => item.id === taskId);
      if (target && target.status !== column.id) {
        target.status = column.id;
        appendLog(`Movida: "${target.title}" para ${column.name}.`);
        persistTasks();
        render();
      }
    });

    board.appendChild(colEl);
  });
}

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function appendLog(message) {
  const date = new Date().toLocaleTimeString('pt-BR');
  log.textContent += `[${date}] ${message}\n`;
  persistLog();
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

[...document.querySelectorAll('[data-mcp]')].forEach((button) => {
  button.addEventListener('click', () => {
    const mcp = button.dataset.mcp;
    const descriptions = {
      github: 'Issues sincronizadas com o repositório.',
      slack: 'Mensagem enviada no canal #kanban-updates.',
      calendar: 'Eventos de prazo criados na agenda da equipe.'
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

loadLog();
render();
