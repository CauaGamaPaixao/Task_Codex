# Fluxo e Funcionamento da Solução

## 1) Fluxo principal do usuário
1. Usuário abre o app e visualiza o board com colunas e tarefas.
2. Clica em **+ Nova tarefa** para abrir o modal.
3. Preenche título, descrição, responsável, prazo e prioridade.
4. Salva e a tarefa entra em **A Fazer** com animação de entrada.
5. Arrasta o card entre colunas e recebe animação visual de movimentação.
6. O sistema atualiza mensagens de status em tela e persiste dados essenciais no navegador.

## 2) Fluxo de GUI e personalização
1. Usuário pode alternar **Modo Compacto** para reduzir densidade dos cards.
2. Usuário pode escolher uma **cor fixa** para o fundo do quadro.
3. Usuário pode carregar uma **imagem local** para plano de fundo do quadro.
4. Preferência visual fica salva no `localStorage`.

## 3) Fluxo MCP Google Calendar (v1)
1. Usuário clica em **Google Calendar (v1)**.
2. O app busca a próxima tarefa não concluída com prazo.
3. O app gera URL com evento pré-preenchido no Google Calendar.
4. Evento abre em nova aba para confirmação manual do usuário.

## 4) Arquitetura resumida
- **index.html**: estrutura da interface, toolbar, painel MCP e controles de fundo.
- **styles.css**: tema visual, animações dos cards, estados de drag-and-drop.
- **app.js**: estado das tarefas, persistência, integração calendar v1 e personalização de fundo.
