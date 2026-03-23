# PRD Kanban Task (Web)

## 1) Visão Geral do Produto
O **Kanban Task** é uma aplicação web de gerenciamento de tarefas no modelo Kanban, semelhante ao Trello/Planner, voltada para organização visual do fluxo de trabalho de projetos.

O produto organiza tarefas em colunas dinâmicas com estado inicial sugerido:
- **To Do**
- **Doing**
- **Done**

As colunas podem ser renomeadas, adicionadas, removidas e reordenadas pelo usuário, respeitando o modelo Kanban.

---

## 2) Problema que o Produto Resolve
Equipes e estudantes em início de carreira precisam acompanhar entregas com clareza, mas planilhas ou listas lineares dificultam:
- visualizar gargalos;
- priorizar demandas;
- acompanhar responsáveis e prazos;
- mover tarefas entre etapas do fluxo.

O Kanban Task centraliza esse controle em uma interface simples e interativa no navegador.

---

## 3) Objetivos do Produto
1. Permitir gestão visual de tarefas por colunas Kanban.
2. Reduzir atrito para cadastro e atualização de tarefas.
3. Facilitar acompanhamento de prioridade, responsável e prazo.
4. Permitir movimentação por **drag and drop** de cards e colunas.
5. Manter experiência fluida em front-end puro (**HTML, CSS, JavaScript**).

---

## 4) Escopo Funcional

### 4.1 Gestão de Colunas (Quadros)
- Colunas padrão iniciais: To Do, Doing, Done.
- Criação de novas colunas.
- Remoção de colunas com realocação segura dos cards.
- Reordenação horizontal das colunas via arrastar e soltar.

### 4.2 Gestão de Cards (Tarefas)
Cada card deve armazenar obrigatoriamente:
- **atividade** (título);
- **descrição**;
- **responsável**;
- **prazo**;
- **prioridade**.

Capacidades:
- criar card;
- editar card;
- excluir card;
- mover card entre colunas via drag and drop;
- reordenar cards dentro da coluna e entre colunas.

### 4.3 Interface e Experiência
- Layout horizontal de colunas.
- Exibição limitada no viewport com **scroll horizontal** para visualizar colunas adicionais.
- Modo compacto opcional para densidade de informação.
- Feedback visual durante drag and drop.

---

## 5) Requisitos Funcionais (RF)
- **RF01**: O sistema deve iniciar com colunas To Do, Doing e Done.
- **RF02**: O usuário deve poder adicionar novas colunas.
- **RF03**: O usuário deve poder remover colunas, mantendo ao menos uma coluna ativa.
- **RF04**: Ao remover uma coluna, os cards dela devem ser movidos automaticamente para outra coluna válida.
- **RF05**: O usuário deve criar cards com atividade, descrição, responsável, prazo e prioridade.
- **RF06**: O usuário deve editar qualquer campo de um card existente.
- **RF07**: O usuário deve excluir cards.
- **RF08**: O usuário deve mover cards entre colunas por drag and drop.
- **RF09**: O usuário deve reordenar colunas por drag and drop.
- **RF10**: O sistema deve persistir dados no navegador (localStorage).

---

## 6) Requisitos Não Funcionais (RNF)
- **RNF01**: Front-end implementado em **HTML, CSS e JavaScript** (sem dependência obrigatória de framework).
- **RNF02**: Interface responsiva para desktop e notebooks.
- **RNF03**: Tempo de resposta visual das ações principais (criar/mover/editar) deve ser percebido como imediato.
- **RNF04**: Deve haver feedback textual de status para ações críticas (sucesso/erro).
- **RNF05**: A solução deve funcionar em navegadores modernos com suporte a drag and drop e localStorage.

---

## 7) Fluxos Principais de Uso
1. Usuário abre a aplicação e visualiza To Do, Doing e Done.
2. Usuário cria um card preenchendo atividade, descrição, responsável, prazo e prioridade.
3. Usuário move o card para Doing conforme avanço da execução.
4. Usuário conclui e move para Done.
5. Usuário cria colunas extras (ex.: Review, QA) quando necessário.
6. Usuário usa scroll horizontal para navegar por todas as colunas.

---

## 8) Critérios de Aceite (CA)
- **CA01**: Ao abrir o sistema pela primeira vez, as colunas To Do, Doing e Done aparecem disponíveis.
- **CA02**: É possível criar card com todos os campos solicitados.
- **CA03**: É possível editar e salvar alterações do card sem perda de dados.
- **CA04**: O card pode ser movido por arrastar e soltar entre colunas.
- **CA05**: As colunas podem ser rearranjadas horizontalmente por arrastar e soltar.
- **CA06**: Com mais de 3 colunas, as excedentes ficam acessíveis por scroll horizontal.
- **CA07**: Após recarregar a página, colunas e cards permanecem salvos.

---

## 9) Fora de Escopo (versão atual)
- Controle de acesso por usuário/login.
- Colaboração em tempo real entre múltiplos usuários.
- Backend dedicado com banco de dados remoto.
- Notificações push/e-mail.

---

## 10) Riscos e Mitigações
- **Risco**: uso excessivo de colunas pode afetar legibilidade.  
  **Mitigação**: manter largura padrão dos quadros e scroll horizontal.
- **Risco**: remoção acidental de coluna com muitos cards.  
  **Mitigação**: exibir feedback explícito sobre a realocação automática.
- **Risco**: inconsistência de dados no armazenamento local por limpeza do navegador.  
  **Mitigação**: orientar exportação periódica (quando disponível) e backups manuais.
