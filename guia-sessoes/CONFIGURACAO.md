# Configuração, início e retomada

## 1. Onde fica cada coisa

| Sessão | Abre em | Escreve em |
| --- | --- | --- |
| A (arquiteto e scrum master) | `/Users/ralphrenatodasilva/workspace/000-Pessoal/codebase/dok-draw-documentation` | `tasks/`, `decisoes/` |
| B (executor de ADR) | `/Users/ralphrenatodasilva/workspace/000-Pessoal/codebase/dok-draw-documentation` | `adrs/_work/`, `tasks/` |
| C (desenvolvedora) | `/Users/ralphrenatodasilva/workspace/000-Pessoal/codebase/dok-draw-app` | código do app em branch `dev/D-*`, e `/Users/ralphrenatodasilva/workspace/000-Pessoal/codebase/dok-draw-documentation/tasks/` |

A pasta `tasks/` é única e fica na documentação. É por ela que as três sessões conversam.

## 2. Permissões

**Documentação** (`.claude/settings.json`, usado por A e B): só regras `Edit(...)` (as `Write(...)` foram descontinuadas pelo Claude Code). Liberado: `Edit(adrs/_work/**)`, `Edit(tasks/**)`, `Edit(decisoes/**)`, os scripts de `guia-sessoes/bin/` e leitura do app, incluindo `git diff`, `log`, `show` e `status` no app para A revisar as branches de C. Bloqueado: `insumos/`, `prompts/` e `.env*` do app.

`guia-sessoes/` não está nem liberado nem bloqueado: toda edição no kit pede confirmação no momento. A e B compartilham este arquivo, então não há como separá-las por permissão. A confirmação existe para que uma edição de B no kit apareça na tela em vez de passar em silêncio. A mesma limitação vale para `decisoes/`, que é de A por regra escrita no `PROMPT-SESSAO-B.md`, não por permissão.

**App** (`.claude/settings.local.json` dentro de `dok-draw-app`, usado por C):
- inclui a documentação em `additionalDirectories`, com leitura liberada e escrita só em `tasks/`;
- libera os scripts de `guia-sessoes/bin/` pelo caminho absoluto, edição em `src/` e os comandos de git do dia a dia;
- pede confirmação para `git push`, `git merge`, `git rebase`, instalação de pacote, Supabase CLI, `package.json` e `supabase/migrations/`;
- bloqueia `.env*` e qualquer escrita na documentação fora de `tasks/`.

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
4. Converse só com A. Acompanhe pelo `tasks/LOG.md`.

A C fica escutando sem tarefa até existir ADR aceito com fatias e a meta de desenvolvimento estar definida. Se preferir, abra a C só quando A anunciar a primeira sprint.

## 4. Retomada

Reabra com `claude --continue`. Se a conversa se perdeu, abra uma sessão nova e cole o prompt de novo: os três prompts detectam o histórico em `tasks/` e seguem a "Recuperação" do protocolo.

Depois de editar `settings.json`, `settings.local.json` ou `CLAUDE.md`, reabra as sessões afetadas. O Claude Code só lê esses arquivos na abertura.

## 5. Custo da escuta

Cada ciclo de escuta é uma chamada de ferramenta, cerca de 6 por hora ociosa, por sessão. Com três sessões, são cerca de 18 por hora sem trabalho. A regra de ociosidade para cada sessão depois de uma hora sem evento, e as tarefas `encerrar` param B e C quando as trilhas terminam.
