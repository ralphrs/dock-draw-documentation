# DokDraw — ADRs da engine de documentação

Responda sempre em pt-BR. Termos técnicos, nomes de arquivo, pacotes e APIs ficam em inglês.
Seja direto: proposta primeiro, justificativa depois. Discorde quando eu estiver errado, sobretudo em decisões difíceis de reverter.

## Estrutura

| Pasta | Conteúdo | Quem escreve |
| --- | --- | --- |
| `insumos/` | Entradas fixas: `BASE.md` (contexto comum, arquitetura base, grade, regras de compatibilidade, estrutura do ADR, formato do contrato), `ESTILO-ADR.md` (regras de escrita), `ORDEM.md` (numeração e dependências), `supabase-types-dokdraw.ts` (schema real), pesquisas anteriores | Só eu. **Não edite** |
| `prompts/` | `PROMPT-ADR-NNN.md`: a pergunta de cada ADR | Só eu. Não edite |
| `adrs/` | ADRs gerados (`ADR-NNN-slug.md`) e `LEDGER.md` | Você, com minha aprovação |
| `adrs/_work/` | Escopo aprovado, fichas de pesquisa por candidata, rascunhos | Você, livremente |
| `decisoes/` | Decisão que não é contrato de camada: numeração, sequenciamento, meta de trilha, processo, regra do kit. Mais `sprints/` e o índice `REGISTRO.md` | A sessão A. B registra no "Resultado" da tarefa e A promove |
| `guia-sessoes/` | Protocolo entre a sessão A (arquiteto) e a sessão B (executor), modelos e scripts | Só eu. Não edite |
| `tasks/` | Tarefas, dúvidas e respostas trocadas entre as sessões A, B e C | As sessões, pelos scripts de `guia-sessoes/bin/` |
| `/Users/ralphrenatodasilva/workspace/000-Pessoal/codebase/dok-draw-app` | Projeto do app Lovable (`dok-draw-app`), fonte de verdade da arquitetura base | A e B: só leitura. C: desenvolvimento em branch `dev/D-*` |

## Regras de toda sessão

- Antes de propor qualquer tecnologia, leia `insumos/BASE.md` e `adrs/LEDGER.md`. O ledger é a fonte de verdade das decisões, incluindo a seção "Propostos vinculantes".
- Candidata que viola a arquitetura base ou um contrato do ledger é eliminada, a menos que você proponha **explicitamente** reabrir o ADR anterior, com custo. Nunca contorne um contrato em silêncio.
- **Nunca edite `adrs/LEDGER.md` nem um ADR existente sem minha aprovação explícita.** Proponha o diff e espere. Quando as sessões trabalham pelo protocolo de `guia-sessoes/PROTOCOLO.md`, aprovação explícita é uma resposta `A-Q-*` com `aprovado_por: humano`, e nada mais.
- Um ADR por sessão. Se surgir necessidade de mudar outro ADR, pare e me diga.
- Versões e licenças sempre conferidas na web na data da pesquisa, com link. README não é evidência.
- ADRs em Markdown puro, com alertas GFM (`> [!NOTE]`), não callouts `:::`.
- **Estilo:** toda prosa de ADR (inclusive os textos livres do contrato YAML) segue `insumos/ESTILO-ADR.md`. Sem travessão, sem ponto e vírgula ligando orações, sem primeira pessoa, sem "optou-se", toda decisão com alternativa descartada e custo aceito, lacuna declarada em vez de coberta por prosa.
- Os prompts dizem "Colar o Bloco 0" e "Anexar": isso já está resolvido por `insumos/BASE.md`, `adrs/LEDGER.md` e os arquivos em `adrs/` e `insumos/`. Se um anexo citado não existir, pare e me diga.

## Projeto do app (`dok-draw-app`)

O app Lovable fica em `/Users/ralphrenatodasilva/workspace/000-Pessoal/codebase/dok-draw-app`, pasta irmã deste repositório. É a **fonte de verdade da arquitetura base**: `package.json` com as versões reais, os tipos do Supabase, a estrutura de rotas e componentes.

- **Leitura livre.** Prefira sempre o arquivo do app a uma cópia em `insumos/`. `insumos/package.json` e `insumos/supabase-types-dokdraw.ts` são retratos de 2026-09-19. Se divergirem, vale o app, e a divergência vira pendência no ledger.
- **Só a sessão C altera o app**, por tarefas `D` que a sessão A cria a partir das fatias dos ADRs aceitos, sempre numa branch `dev/D-NNNN-slug`. As sessões A e B só leem. Merge na `main`, `push`, dependência nova, migration e política RLS são a categoria `app-release` do protocolo e exigem aprovação do humano. O Lovable sincroniza com a `main` do GitHub, então o que chega lá aparece no projeto do Lovable.
- **Spike nunca roda no app.** Spike continua em `adrs/_work/`.
- **Nunca ler nem editar** `.env*` do app.

## Superpowers

ADRs são documentos, não código. O mapa de skills obrigatórias por sessão, com o gatilho de cada uma, está em `decisoes/DEC-0001-skills-por-sessao.md`. Para a sessão B, resumindo:

| Skill | Quando |
| --- | --- |
| `superpowers:brainstorming` | Etapa de escopo de cada ADR, antes de propor candidata |
| `superpowers:systematic-debugging` | Spike que falha. A causa vai para o ADR medida, nunca estimada |
| `superpowers:dispatching-parallel-agents` | Fichas de pesquisa por candidata, avaliação de mais de duas bibliotecas |
| `superpowers:verification-before-completion` | Antes de anexar "Resultado" |

Não use TDD, worktrees nem `finishing-a-development-branch` aqui. Specs e planos das skills vão para `adrs/_work/`. Não faça commit sozinho.

@insumos/ORDEM.md
