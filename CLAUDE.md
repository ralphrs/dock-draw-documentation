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
| `guia-sessoes/` | Protocolo entre a sessão A (arquiteto) e a sessão B (executor), modelos e scripts | Só eu. Não edite |
| `tasks/` | Tarefas, dúvidas e respostas trocadas entre as sessões A e B | As sessões, pelos scripts de `guia-sessoes/bin/` |

## Regras de toda sessão

- Antes de propor qualquer tecnologia, leia `insumos/BASE.md` e `adrs/LEDGER.md`. O ledger é a fonte de verdade das decisões, incluindo a seção "Propostos vinculantes".
- Candidata que viola a arquitetura base ou um contrato do ledger é eliminada, a menos que você proponha **explicitamente** reabrir o ADR anterior, com custo. Nunca contorne um contrato em silêncio.
- **Nunca edite `adrs/LEDGER.md` nem um ADR existente sem minha aprovação explícita.** Proponha o diff e espere. Quando as sessões trabalham pelo protocolo de `guia-sessoes/PROTOCOLO.md`, aprovação explícita é uma resposta `A-Q-*` com `aprovado_por: humano`, e nada mais.
- Um ADR por sessão. Se surgir necessidade de mudar outro ADR, pare e me diga.
- Versões e licenças sempre conferidas na web na data da pesquisa, com link. README não é evidência.
- ADRs em Markdown puro, com alertas GFM (`> [!NOTE]`), não callouts `:::`.
- **Estilo:** toda prosa de ADR (inclusive os textos livres do contrato YAML) segue `insumos/ESTILO-ADR.md`. Sem travessão, sem ponto e vírgula ligando orações, sem primeira pessoa, sem "optou-se", toda decisão com alternativa descartada e custo aceito, lacuna declarada em vez de coberta por prosa.
- Os prompts dizem "Colar o Bloco 0" e "Anexar": isso já está resolvido por `insumos/BASE.md`, `adrs/LEDGER.md` e os arquivos em `adrs/` e `insumos/`. Se um anexo citado não existir, pare e me diga.

## Superpowers

ADRs são documentos, não código: use as skills de brainstorming, despacho de agentes em paralelo e verificação antes de concluir. Não use TDD nem worktrees aqui. Specs e planos das skills vão para `adrs/_work/`. Não faça commit sozinho.

@insumos/ORDEM.md
