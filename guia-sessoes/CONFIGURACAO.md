# Configuração, início e retomada

## 1. Onde fica cada coisa

| Sessão | Abre em | Escreve em |
| --- | --- | --- |
| A (arquiteto e scrum master) | `/Users/ralphrenatodasilva/workspace/000-Pessoal/codebase/dok-draw-documentation` | `adrs/`, `decisoes/`, `guia-sessoes/` |
| B (executor de ADR) | `/Users/ralphrenatodasilva/workspace/000-Pessoal/codebase/dok-draw-documentation` | `adrs/_work/`, mais os arquivos de ADR que uma aprovação `fora-de-work` liberar |
| C (revisora) | `/Users/ralphrenatodasilva/workspace/000-Pessoal/codebase/dok-draw-app` | nada: só lê os dois repositórios e escreve nas issues |

As três sessões conversam por issues do Jira, no projeto `DDP` do site `dokdrawapp.atlassian.net`. Cada sessão precisa do MCP do Atlassian conectado. O conector é autorizado na conta Claude, e não por sessão, então a identidade de quem escreveu vem do responsável da issue e do prefixo do comentário (`decisoes/DEC-0009-comunicacao-por-jira.md`).

A pasta `tasks/` guarda o histórico do protocolo por arquivo, usado até 2026-09-20. Nada novo entra lá.

## 2. Permissões

**Documentação** (`.claude/settings.json`, usado por A e B): só regras `Edit(...)` (as `Write(...)` foram descontinuadas pelo Claude Code). Liberado: `Edit(adrs/_work/**)`, `Edit(tasks/**)`, `Edit(decisoes/**)`, os scripts de `guia-sessoes/bin/` e leitura do app, incluindo `git diff`, `log`, `show` e `status` no app para A revisar os commits do Lovable. Bloqueado: `insumos/`, `prompts/` e `.env*` do app.

`guia-sessoes/` não está nem liberado nem bloqueado: toda edição no kit pede confirmação no momento, e o kit é da sessão A. A e B compartilham este arquivo, então não há como separá-las por permissão. A confirmação existe para que uma edição de B no kit apareça na tela em vez de passar em silêncio. A mesma limitação vale para `decisoes/`, que é de A por regra escrita no `PROMPT-SESSAO-B.md`, não por permissão.

**App** (`.claude/settings.local.json` dentro de `dok-draw-app`, usado por C):
- inclui a documentação em `additionalDirectories`, com leitura liberada e nenhuma escrita;
- libera os scripts de `guia-sessoes/bin/` pelo caminho absoluto e os comandos de git de leitura, mais build, typecheck, lint e teste;
- pede confirmação para `git push`, `git merge`, `git rebase`, instalação de pacote, Supabase CLI, `package.json` e `supabase/migrations/`;
- bloqueia `.env*` e qualquer escrita na documentação.

O arquivo é `settings.local.json`, e não `settings.json`, para não ir para o GitHub do app nem aparecer no Lovable. Confira que ele está ignorado:

```fish
cd /Users/ralphrenatodasilva/workspace/000-Pessoal/codebase/dok-draw-app
git check-ignore -v .claude/settings.local.json
```

Se o comando não imprimir nada, acrescente `.claude/settings.local.json` ao `.gitignore` do app.

Os scripts precisam ser executáveis: `chmod +x /Users/ralphrenatodasilva/workspace/000-Pessoal/codebase/dok-draw-documentation/guia-sessoes/bin/*.sh`.

## 3. Início

1. **A:** abra em `/Users/ralphrenatodasilva/workspace/000-Pessoal/codebase/dok-draw-documentation` e cole `PROMPT-SESSAO-A.md`, da linha `---` em diante.
2. **B:** abra em `/Users/ralphrenatodasilva/workspace/000-Pessoal/codebase/dok-draw-documentation` (ou retome com `claude --continue`) e cole `PROMPT-SESSAO-B.md`.
3. **C:** abra em `/Users/ralphrenatodasilva/workspace/000-Pessoal/codebase/dok-draw-app` e cole `PROMPT-SESSAO-C.md`.
4. Converse só com A. Acompanhe pelo quadro `DDP` no Jira.

A C fica escutando sem tarefa até existir ADR aceito com fatias e a meta de desenvolvimento estar definida. Se preferir, abra a C só quando A anunciar a primeira sprint.

## 4. Retomada

Reabra com `claude --continue`. Se a conversa se perdeu, abra uma sessão nova e cole o prompt de novo: os três prompts detectam o histórico no quadro `DDP` e seguem a "Recuperação" do protocolo.

Depois de editar `settings.json`, `settings.local.json` ou `CLAUDE.md`, reabra as sessões afetadas. O Claude Code só lê esses arquivos na abertura.

## 5. Custo da escuta

Cada volta do ciclo de escuta são duas chamadas de ferramenta, a espera e a consulta ao Jira, cerca de 12 por hora ociosa, por sessão. Com três sessões, são cerca de 36 por hora sem trabalho. A regra de ociosidade para cada sessão depois de uma hora sem novidade, e as tarefas `encerrar` param B e C quando as trilhas terminam.
