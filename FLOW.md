# Fluxo e Funcionamento da Solução

## 1) Fluxo principal do usuário
1. Usuário abre o app e visualiza o board com colunas e tarefas.
2. Clica em **+ Nova tarefa** para abrir o modal.
3. Preenche título, descrição, responsável, prazo e prioridade.
4. Salva e a tarefa entra em **A Fazer**.
5. Arrasta o card entre colunas conforme progresso.
6. O sistema registra cada ação no painel de log e persiste no navegador.

## 2) Fluxo da modificação de GUI
1. Usuário clica em **Modificar GUI: Modo Compacto**.
2. O app alterna classe CSS `compact` no `body`.
3. Cards ficam menores e descrições são ocultadas.
4. Um evento de alteração visual é gravado no log.

## 3) Fluxo de operação de tarefas
1. **Editar:** botão editar no card abre modal preenchido.
2. **Excluir:** botão excluir remove card e grava evento no log.
3. **Filtrar:** busca por texto e filtro por prioridade atualizam board em tempo real.

## 4) Fluxo de integrações MCP (simulado)
1. Usuário seleciona um botão de integração (GitHub/Slack/Calendar).
2. O frontend identifica qual MCP foi acionado.
3. O app escreve no log a ação correspondente de sincronização.
4. Em uma versão futura, esse passo chamaria endpoints reais MCP.

## 5) Arquitetura resumida
- **index.html**: estrutura da interface (toolbar, board, painel MCP, modal).
- **styles.css**: tema, responsividade, modo compacto e ações de card.
- **app.js**: estado das tarefas, persistência local, renderização, drag-and-drop e logs.
- **PRD.md**: especificação formal do produto e requisitos.
