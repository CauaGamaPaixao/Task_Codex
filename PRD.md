# PRD — Kanban Task App (Estágio ADS)

## 1. Visão do Produto
O **Kanban Task App** é uma aplicação web inspirada em Trello para gestão visual de tarefas por colunas, com foco em times pequenos e documentação de projeto.

## 2. Objetivo do Incremento Atual
Evoluir as integrações MCP para apoiar comunicação e documentação: Discord (resumo + comandos via chat) e geração de backlog em Excel.

## 3. Escopo desta versão
1. Substituir MCP GitHub por **MCP Discord**.
2. Enviar resumo da task para o Discord pessoal do desenvolvedor.
3. Permitir criação e edição de cards por comando de chat.
4. Criar **MCP Excel Backlog** para exportar tarefas em formato compatível com Excel.

## 4. Requisitos Funcionais
- RF01: MCP Discord deve gerar relatório contendo título, resumo de descrição, prioridade e prazo.
- RF02: MCP Discord deve copiar relatório para clipboard e abrir Discord em nova aba.
- RF03: Chat MCP deve suportar comando `/nova` para criação de card.
- RF04: Chat MCP deve suportar comando `/editar` para edição de card via ID.
- RF05: Cards devem possuir identificador humano no formato `T-001`.
- RF06: MCP Excel deve exportar backlog completo com colunas padronizadas para abertura no Excel.

## 5. Comandos MCP Discord Chat
### 5.1 Criar card
`/nova Título | descrição | prioridade | prazo(YYYY-MM-DD) | responsável`

### 5.2 Editar card
`/editar T-001 | titulo=...;descricao=...;prioridade=...;prazo=...;responsavel=...;status=todo|doing|review|done`

## 6. Requisitos Não Funcionais
- RNF01: Exportação deve gerar arquivo em UTF-8 para evitar problemas de acentuação no Excel.
- RNF02: Parser de comando deve retornar mensagens amigáveis em caso de erro.
- RNF03: Interface deve continuar responsiva mesmo com novas seções MCP.

## 7. Critérios de Aceite
- CA01: Botão Discord cria resumo correto e abre Discord.
- CA02: Comando `/nova` cria card visível no board.
- CA03: Comando `/editar` altera card existente pelo ID.
- CA04: Exportação gera arquivo `.csv` que abre no Excel com colunas corretas.
- CA05: ID único (`T-001`, `T-002`...) aparece no card e no export.

## 8. Riscos
- Falha no clipboard em navegadores sem permissão: fallback deve exibir mensagem para cópia manual.
- Arquivo CSV depende da configuração regional do Excel (uso de `;` como separador ajuda no padrão PT-BR).
