# PRD — Kanban Task App (Estágio ADS)

## 1. Visão do Produto
O **Kanban Task App** é uma aplicação web inspirada em Trello para gestão visual de tarefas por colunas, com foco em times pequenos e com liberdade para adaptar o fluxo de trabalho.

## 2. Objetivo do Incremento Atual
Dar controle total ao usuário sobre os quadros/colunas do board, removendo o modelo fixo anterior e simplificando o MCP Discord ao uso de relatório da task.

## 3. Escopo desta versão
1. Remover a funcionalidade de Chat MCP Discord.
2. Manter o MCP Discord apenas para envio de resumo da task.
3. Tornar os quadros/colunas totalmente configuráveis pelo usuário.
4. Permitir adicionar e remover quadros conforme a necessidade do projeto.
5. Permitir que a tarefa seja criada ou editada escolhendo qualquer quadro existente.

## 4. Requisitos Funcionais
- RF01: Usuário deve criar novos quadros/colunas manualmente.
- RF02: Usuário deve remover quadros/colunas quando não precisar mais deles.
- RF03: Ao remover um quadro, o sistema deve realocar as tarefas para outro quadro válido.
- RF04: Usuário deve escolher o quadro no momento de criar ou editar uma task.
- RF05: MCP Discord deve enviar resumo da task com título, resumo da descrição, prioridade, prazo e quadro.
- RF06: MCP Excel deve exportar backlog completo com o nome do quadro de cada tarefa.

## 5. Requisitos Não Funcionais
- RNF01: O board deve persistir colunas e tarefas no navegador.
- RNF02: O sistema deve impedir que o usuário fique sem nenhum quadro disponível.
- RNF03: A interface deve continuar responsiva após a criação de múltiplas colunas.

## 6. Critérios de Aceite
- CA01: Usuário consegue criar um novo quadro e visualizá-lo imediatamente.
- CA02: Usuário consegue remover um quadro e as tasks são reaproveitadas em outro quadro.
- CA03: Nova task pode ser criada em qualquer quadro existente.
- CA04: Edição de task permite trocar o quadro de destino.
- CA05: Discord exporta resumo com referência da task e quadro atual.
- CA06: Excel exporta backlog com a coluna “Quadro”.

## 7. Riscos
- Boards com muitas colunas podem reduzir a legibilidade em telas pequenas.
- Usuários podem remover quadros com muitas tasks sem perceber a realocação automática, exigindo feedback claro na interface.
