# Fluxo e Funcionamento da Solução

## 1) Fluxo principal do usuário
1. Usuário abre o app e visualiza o board com colunas e tarefas.
2. Clica em **+ Nova tarefa** para abrir o modal.
3. Preenche título, descrição, responsável, prazo e prioridade.
4. Salva e a tarefa entra em **A Fazer** com animação de entrada.
5. Arrasta o card entre colunas e recebe animação visual de movimentação.

## 2) Fluxo MCP Discord
1. Usuário clica em **Enviar resumo p/ Discord**.
2. O app seleciona a primeira tarefa pendente e cria um resumo com: título, descrição resumida, prioridade e prazo.
3. O resumo é copiado para área de transferência.
4. O app abre o Discord (`@me`) para facilitar o envio ao discord pessoal do desenvolvedor.

## 3) Fluxo MCP Discord Chat (criar e editar)
### Comando de criação
`/nova Título | descrição | prioridade | prazo(YYYY-MM-DD) | responsável`

Exemplo:
`/nova Ajustar autenticação | Revisar middleware jwt | Alta | 2026-03-22 | Maria`

### Comando de edição
`/editar T-001 | titulo=Novo título;descricao=Texto;prioridade=Alta;prazo=2026-03-25;responsavel=Ana;status=doing`

Campos aceitos no `/editar`:
- `titulo`
- `descricao`
- `prioridade` (Baixa, Média, Alta)
- `prazo`
- `responsavel`
- `status` (`todo`, `doing`, `review`, `done`)

## 4) Fluxo MCP Excel Backlog
1. Usuário clica em **Exportar backlog (Excel)**.
2. O app gera um arquivo CSV com BOM UTF-8 e separador `;`.
3. O arquivo é baixado automaticamente e pode ser aberto no Excel.
4. Colunas exportadas: ID, Título, Descrição, Prioridade, Prazo, Responsável e Status.

## 5) Arquitetura resumida
- **index.html**: estrutura da interface, painel MCP, chat de comandos e controles de fundo.
- **styles.css**: tema visual, animações dos cards e estilo do painel MCP.
- **app.js**: estado das tarefas, parser de comandos do chat, integração Discord, Calendar e exportação Excel.
