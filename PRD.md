# PRD — Task Manager (Kanban Web App)

## 1. Visão Geral do Produto

**Nome do produto:** Task Manager  
**Tipo:** Aplicação web (front-end only)  
**Objetivo:** Permitir que usuários organizem e acompanhem tarefas em um quadro Kanban simples com três colunas: **To Do**, **Doing** e **Done**.

O Task Manager deve oferecer uma experiência enxuta, intuitiva e rápida, inspirada em ferramentas como Trello e Microsoft Planner, porém com escopo reduzido para foco em produtividade individual/equipe pequena.

---

## 2. Problema a Resolver

Usuários precisam de uma forma simples de:
- registrar tarefas com contexto mínimo (título, descrição, prioridade);
- visualizar status de execução em um fluxo claro;
- mover tarefas entre etapas sem complexidade;
- utilizar tema claro/escuro para melhor conforto visual.

---

## 3. Objetivos do Produto

1. Disponibilizar um quadro Kanban funcional com 3 colunas fixas.
2. Permitir criação de cards com dados essenciais da tarefa.
3. Permitir movimentação de cards entre colunas por botões de ação.
4. Oferecer alternância de tema visual entre **Light** e **Dark mode**.
5. Manter implementação 100% front-end em **HTML, CSS e JavaScript**.

---

## 4. Escopo

### 4.1 Escopo Incluído (In-Scope)
- Quadro Kanban com colunas:
  - To Do
  - Doing
  - Done
- Criação de card com:
  - Título da Task
  - Descrição
  - Prioridade
- Botões para mover card entre colunas.
- Alternância de tema Light/Dark.
- Interface responsiva básica para desktop e mobile.

### 4.2 Escopo Excluído (Out-of-Scope)
- Backend/API persistente.
- Login/autenticação de usuários.
- Colaboração em tempo real.
- Permissões por perfil.
- Integrações externas obrigatórias.

---

## 5. Personas

### Persona Primária
**Profissional de operações/projeto** que precisa organizar tarefas diárias sem curva de aprendizado alta.

### Persona Secundária
**Desenvolvedor(a) ou estudante** que deseja acompanhar atividades pessoais por estágio de execução.

---

## 6. Requisitos Funcionais

### RF-01 — Estrutura Kanban
O sistema deve exibir três colunas fixas: **To Do**, **Doing** e **Done**.

### RF-02 — Criação de Task
O sistema deve permitir criar um card informando:
- Título da Task (obrigatório)
- Descrição (opcional)
- Prioridade (obrigatória: Alta, Média, Baixa)

### RF-03 — Estado Inicial
Toda task criada deve iniciar na coluna **To Do**.

### RF-04 — Movimentação por Botões
Cada card deve possuir botões de ação para avanço de etapa:
- Em **To Do**: botão para mover para **Doing**
- Em **Doing**: botão para mover para **Done**
- Em **Done**: botão para finalizar/remover card

### RF-05 — Exibição de Dados no Card
Cada card deve apresentar claramente:
- Título
- Descrição
- Prioridade

### RF-06 — Alternância de Tema
O sistema deve disponibilizar alternância entre **Light mode** e **Dark mode**.

### RF-07 — Persistência de Preferência de Tema
A preferência de tema deve ser mantida localmente no navegador (ex.: `localStorage`).

---

## 7. Requisitos Não Funcionais

### RNF-01 — Tecnologia
A aplicação deve ser desenvolvida utilizando apenas:
- HTML
- CSS
- JavaScript (vanilla)

### RNF-02 — Usabilidade
A interface deve ser simples e intuitiva, com ações explícitas e baixa complexidade cognitiva.

### RNF-03 — Performance
A renderização e ações de movimentação devem ocorrer de forma imediata no cliente, sem recarregar página.

### RNF-04 — Responsividade
A aplicação deve se adaptar a diferentes larguras de tela, mantendo legibilidade e navegabilidade.

---

## 8. Regras de Negócio

1. Uma task não pode ser criada sem título.
2. Toda task nova entra em **To Do**.
3. O fluxo de avanço padrão é sequencial: **To Do → Doing → Done**.
4. Apenas tarefas em **Done** podem ser finalizadas/removidas.
5. Prioridade deve pertencer ao conjunto permitido: **Alta, Média, Baixa**.

---

## 9. Fluxo do Usuário (Happy Path)

1. Usuário acessa o Task Manager.
2. Usuário preenche título, descrição e prioridade.
3. Usuário clica em “Adicionar Task”.
4. Card aparece em **To Do**.
5. Usuário clica no botão de avançar para **Doing**.
6. Usuário clica no botão de avançar para **Done**.
7. Usuário clica em “Finalizar Task” para remover o card.
8. Usuário alterna tema entre Light/Dark conforme preferência.

---

## 10. Critérios de Aceite

### CA-01
Dado que o app foi carregado, quando o usuário visualizar o quadro, então as colunas **To Do**, **Doing** e **Done** devem estar presentes.

### CA-02
Dado que o usuário preencheu os campos obrigatórios, quando clicar em criar task, então um novo card deve surgir em **To Do** com título, descrição e prioridade.

### CA-03
Dado um card em **To Do**, quando clicar no botão de iniciar, então o card deve mover para **Doing**.

### CA-04
Dado um card em **Doing**, quando clicar no botão de concluir, então o card deve mover para **Done**.

### CA-05
Dado um card em **Done**, quando clicar em finalizar, então o card deve ser removido do quadro.

### CA-06
Dado que o usuário alternou o tema, quando navegar/recarregar a página, então o tema selecionado deve permanecer aplicado.

---

## 11. Métricas de Sucesso (MVP)

- Tempo médio para criar uma task < 10 segundos.
- 100% das movimentações entre colunas executadas sem erro em testes manuais.
- Alternância de tema funcionando em 100% dos cenários manuais testados.

---

## 12. Riscos e Mitigações

- **Risco:** perda de dados em limpeza de cache/localStorage.  
  **Mitigação:** informar que os dados são locais e não sincronizados.

- **Risco:** crescimento de cards pode reduzir legibilidade.  
  **Mitigação:** aplicar estilos com scroll por coluna em versões futuras.

---

## 13. Roadmap Futuro (Pós-MVP)

- Edição de card.
- Drag-and-drop entre colunas.
- Filtros por prioridade.
- Busca por título/descrição.
- Persistência em backend e multiusuário.
