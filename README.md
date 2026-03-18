# Task_Codex — Kanban Task App

Projeto de Kanban inspirado em Trello/Slack para a task da 3ª semana de estágio.

## Como executar
Como é um app estático, basta abrir o `index.html` no navegador.

Opcionalmente, rode um servidor local:

```bash
python -m http.server 8000
```

Depois acesse: `http://localhost:8000`

## Funcionalidades
- Board Kanban com colunas dinâmicas e drag-and-drop.
- Criação, edição e exclusão de tarefas.
- Criação e remoção de quadros/colunas pelo usuário.
- Filtro por texto e prioridade.
- Persistência local de tarefas, colunas e preferências visuais.
- Modificação de GUI: **Modo Compacto**.
- Modificação de GUI adicional: fundo do quadro por cor fixa ou imagem local.
- MCP Discord: gera resumo da task e abre Discord para envio.
- MCP Google Calendar (v1): abre evento pré-preenchido da próxima tarefa com prazo.
- MCP Excel Backlog: exporta backlog em CSV compatível com Excel.
