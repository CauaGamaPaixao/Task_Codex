# PRD — Kanban Task App (Estágio ADS)

## 1. Visão do Produto
O **Kanban Task App** é uma aplicação web leve inspirada em Trello/Slack para gestão visual de tarefas por colunas. O objetivo é apoiar equipes pequenas (estágio/squads iniciais) no acompanhamento do fluxo de trabalho com simplicidade.

## 2. Problema
Times iniciantes costumam gerenciar tarefas em chats e planilhas, o que gera:
- Falta de visibilidade do status real.
- Dificuldade para priorizar entregas.
- Comunicação reativa e sem histórico estruturado.

## 3. Objetivos de Negócio
- Reduzir tempo de atualização de status em reuniões diárias.
- Aumentar previsibilidade de entregas da sprint.
- Centralizar visão de atividades em uma única interface.

## 4. Público-Alvo
- Estudantes em estágio e desenvolvedores júnior.
- Pequenas equipes de produto e tecnologia.
- Projetos acadêmicos e MVPs internos.

## 5. Escopo MVP
### 5.1 Funcionalidades Principais
1. Board Kanban com 4 colunas: **A Fazer**, **Em Progresso**, **Revisão**, **Concluído**.
2. Criação de tarefas com título, descrição, prioridade, responsável e prazo.
3. Edição e exclusão de tarefas.
4. Arrastar e soltar tarefas entre colunas.
5. Filtro por busca textual e prioridade.
6. Log de eventos em tempo real para rastreabilidade.
7. Persistência local em `localStorage`.

### 5.2 Modificação de GUI (obrigatória)
- Implementar botão **Modo Compacto** para reduzir densidade visual dos cards e ocultar descrições, facilitando visualização rápida em boards cheios.

### 5.3 Integrações MCP (3 diferentes)
1. **MCP GitHub**: conversão de tarefa em issue para execução técnica.
2. **MCP Slack**: envio de notificação ao trocar tarefa de coluna.
3. **MCP Google Calendar**: criação de lembrete de prazo para tarefas críticas.

## 6. Requisitos Funcionais
- RF01: Usuário deve visualizar colunas e tarefas ao abrir o app.
- RF02: Usuário deve criar nova tarefa por modal.
- RF03: Usuário deve editar e excluir tarefa.
- RF04: Usuário deve mover tarefa por drag-and-drop.
- RF05: Sistema deve registrar eventos no log local.
- RF06: Usuário deve acionar sincronização MCP por botões dedicados.
- RF07: Usuário deve alternar entre visual normal e modo compacto.
- RF08: Usuário deve filtrar tarefas por texto e prioridade.

## 7. Requisitos Não Funcionais
- RNF01: Interface responsiva para desktop/tablet/mobile.
- RNF02: Tempo de renderização inicial inferior a 2s em ambiente local.
- RNF03: Código frontend sem dependências pesadas para facilitar manutenção.
- RNF04: Usabilidade: ações principais em até 2 cliques.

## 8. Regras de Negócio
- RB01: Toda tarefa nova nasce em **A Fazer**.
- RB02: Prioridade deve ser Baixa, Média ou Alta.
- RB03: Toda mudança de coluna gera evento no log.
- RB04: O estado do board deve persistir no navegador.

## 9. Critérios de Aceite
- CA01: Criar tarefa e visualizá-la em "A Fazer".
- CA02: Editar tarefa e validar atualização no card.
- CA03: Excluir tarefa e validar remoção do board.
- CA04: Mover tarefa para outra coluna com drag-and-drop.
- CA05: Ativar modo compacto e observar cards reduzidos.
- CA06: Acionar os 3 botões de MCP e registrar mensagens de sync no log.
- CA07: Recarregar a página e manter tarefas/log persistidos.

## 10. Métricas de Sucesso
- Tempo médio para atualizar status de tarefa.
- Número de tarefas concluídas por ciclo.
- Frequência de uso de integrações MCP por semana.
- Taxa de uso de filtros durante planning/review.

## 11. Riscos
- Dependência de APIs externas para MCP real.
- Curva inicial de uso para membros sem experiência em Kanban.

## 12. Roadmap Evolutivo
- Fase 2: autenticação e múltiplos boards.
- Fase 3: filtros por membro, prioridade e tags com analytics.
- Fase 4: integração real com API MCP e persistência em backend.
