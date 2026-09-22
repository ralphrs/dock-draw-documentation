# Ordem DDP-442b: tela Membros sem referência interna

**Issue:** emenda da `DDP-442` (página de configuração do projeto), a partir do comentário do humano na `DDP-517` em 2026-09-22 e da `DEC-0041`.
**App:** `dok-draw-app`. Sem migração, sem dependência nova, sem publicação nesta ordem.

## Por que

A ordem `DDP-439`, item 10, mandou escrever na tela Membros o selo "Convites por projeto chegam com o ADR 013". O texto cita um documento interno do projeto e chegou ao preview em `src/routes/_authenticated/projetos.$projectId.configuracoes.membros.tsx`, linha 30. Pela `DEC-0041`, nenhum texto de tela cita tarefa, ADR, ordem ou sessão.

## O que fazer

**1. Trocar o texto do selo.** Na linha 30 de `configuracoes.membros.tsx`, o `Badge` passa a dizer "Convites por projeto em breve". Nada mais muda no arquivo.

**2. Varrer os outros textos de tela.** Procurar em `src/routes` e `src/components` qualquer texto visível com `ADR`, `DDP-`, `DEC-`, `Lovable`, `ordem` ou `sessão` e trocar pela frase na voz do produto. Mensagens de erro de configuração do Supabase (`src/integrations/supabase/*.ts`, "Connect Supabase in Lovable Cloud") ficam, porque são texto do próprio Lovable Cloud para quem configura o ambiente, não para quem usa o app. O conteúdo de exemplo da wiki (`src/lib/wiki/repositorio-memoria.ts`) fica, porque é assunto da `DDP-497`.

**3. Conferir** no preview: Configurações do projeto, seção Membros, o selo diz "Convites por projeto em breve". Listar no "Resultado" qualquer outro texto trocado pelo item 2, com arquivo e linha.

## O que não fazer aqui

- Não mudar leiaute, campos nem comportamento da página de configuração.
- Não tocar em migração, política RLS nem `.env*`.
- Nenhum texto de tela cita tarefa, ADR, ordem ou sessão.

## Tabela de restrições do contrato

| Restrição (`LEDGER.md` e decisões) | Onde esta ordem cumpre |
| --- | --- |
| Quem escreve código no app é o Lovable (`DEC-0007`) | Ordem enviada por `send_message`, sem commit das sessões |
| Texto de tela sem referência interna (`DEC-0041`) | Itens 1 e 2 |
| Commit direto na `main` atualiza o preview, publicar é ação separada (`DEC-0007`) | A publicação da configuração do projeto (`DDP-517`) espera esta ordem no preview |
