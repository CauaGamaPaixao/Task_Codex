# PRD — Kanban Task App (Estágio ADS)

## 1. Visão do Produto
O **Kanban Task App** é uma aplicação web inspirada em Trello para gestão visual de tarefas por colunas, com foco em times pequenos.

## 2. Objetivo do Incremento Atual
Melhorar a experiência visual e interação do usuário, além de iniciar integração realista com Google Calendar.

## 3. Escopo desta versão
1. Melhorias visuais gerais no board e painéis.
2. Animações fluidas na criação e movimentação dos cards.
3. MCP Google Calendar (v1) com geração de evento pré-preenchido.
4. GUI adicional para personalizar fundo por cor fixa ou imagem local.
5. Persistência das preferências visuais.

## 4. Requisitos Funcionais
- RF01: Criar tarefa com animação de entrada.
- RF02: Mover tarefa com feedback visual de coluna e destaque de movimentação.
- RF03: Permitir seleção de fundo por color picker.
- RF04: Permitir upload de imagem local para fundo do quadro.
- RF05: Restaurar fundo padrão por botão dedicado.
- RF06: MCP Google Calendar deve abrir evento pré-preenchido da próxima tarefa com prazo.

## 5. Requisitos Não Funcionais
- RNF01: Interações visuais devem ocorrer com transições suaves (< 600ms).
- RNF02: Funcionalidade de fundo deve persistir entre recargas da página.
- RNF03: Layout responsivo para desktop e mobile.

## 6. Critérios de Aceite
- CA01: Ao criar tarefa, card aparece com animação perceptível.
- CA02: Ao mover tarefa, coluna alvo destaca e card recebe feedback visual.
- CA03: Cor de fundo escolhida é aplicada imediatamente e persiste no reload.
- CA04: Imagem local selecionada é aplicada como fundo e persiste no reload.
- CA05: Botão de restauração retorna para fundo padrão.
- CA06: Botão Google Calendar (v1) abre nova aba com template de evento.

## 7. Riscos
- Armazenamento de imagem em base64 pode crescer no `localStorage`.
- Bloqueio de pop-up pode impedir abertura automática de nova aba do calendar.
