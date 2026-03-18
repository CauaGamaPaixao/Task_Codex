# Fluxo e Funcionamento da Solução

## 1) Fluxo principal do usuário
1. Usuário abre o app e visualiza o board com quadros/colunas configuráveis.
2. Pode criar um novo quadro digitando o nome e clicando em **Adicionar quadro**.
3. Pode remover um quadro; nesse caso, as tasks dele são movidas automaticamente para outro quadro existente.
4. Clica em **+ Nova tarefa** para abrir o modal.
5. Preenche título, descrição, responsável, prazo, prioridade e escolhe em qual quadro a tarefa ficará.
6. Salva e a tarefa entra no quadro selecionado com animação de entrada.
7. Arrasta o card entre colunas e recebe animação visual de movimentação.

## 2) Fluxo de gestão dos quadros
1. Usuário informa o nome de uma nova coluna no campo **Novo quadro/coluna**.
2. O app cria a nova coluna e a persiste localmente.
3. Ao remover uma coluna, o sistema mantém pelo menos uma coluna existente.
4. Todas as tarefas da coluna removida são realocadas automaticamente para outro quadro disponível.

## 3) Fluxo MCP Discord
1. Usuário clica em **Enviar resumo p/ Discord**.
2. O app seleciona uma task e gera um resumo com título, descrição resumida, prioridade, prazo e nome do quadro.
3. O resumo é copiado para a área de transferência.
4. O Discord pessoal do desenvolvedor é aberto para facilitar o envio da mensagem.

## 4) Fluxo MCP Excel Backlog
1. Usuário clica em **Exportar backlog (Excel)**.
2. O app gera um arquivo CSV com BOM UTF-8 e separador `;`.
3. O arquivo é baixado automaticamente e pode ser aberto no Excel.
4. Colunas exportadas: ID, Título, Descrição, Prioridade, Prazo, Responsável e Quadro.

## 5) Arquitetura resumida
- **index.html**: estrutura da interface, painel MCP, controles do board e modal de tarefa.
- **styles.css**: tema visual, animações dos cards e visual dos quadros dinâmicos.
- **app.js**: estado das tarefas/colunas, persistência local, integrações MCP e gerenciamento dos quadros.
