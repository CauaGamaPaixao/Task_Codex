# Task_Codex — Kanban Task App

Projeto de Kanban inspirado em Trello/Slack para a task da 3ª semana de estágio.

## Como executar
Como é um app estático, basta abrir o `index.html` no navegador.

Opcionalmente, rode um servidor local:

```bash
python -m http.server 8000
```

Depois acesse: `http://localhost:8000`

## Entregáveis
- App Kanban funcional com drag-and-drop.
- 1 modificação de GUI: **Modo Compacto**.
- Simulação de 3 MCPs: GitHub, Slack e Google Calendar.
- PRD detalhado em `PRD.md`.
- Explicação de fluxo em `FLOW.md`.

## Melhorias desta versão
- Persistência local das tarefas e do log com `localStorage`.
- Edição e exclusão de tarefas diretamente no card.
- Campos extras de tarefa: responsável e prazo.
- Filtros por texto e prioridade para facilitar operação do board.
