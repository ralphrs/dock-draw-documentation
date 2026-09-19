# Kickoff — sessão do ADR 005 no Claude Code

Cole o bloco abaixo como primeira mensagem, depois de abrir o `claude` dentro de `adr-kit/`.

---

Vamos retomar os ADRs da engine de documentação do DokDraw. O contexto está no repositório; leia antes de fazer qualquer coisa:

- `CLAUDE.md` (regras da sessão) e `insumos/ORDEM.md` (numeração e próximo passo)
- `insumos/BASE.md` (arquitetura base, grade de notas, regras de compatibilidade, estrutura do ADR)
- `insumos/ESTILO-ADR.md` (regras de escrita do ADR; valem desde o primeiro rascunho)
- `adrs/LEDGER.md` (contratos: 001 Aceito; 002, 003 e 004 Propostos vinculantes; conflitos C-1 a C-7)
- `prompts/PROMPT-ADR-005.md` (a tarefa desta sessão)

## Objetivo da sessão

Escrever o **ADR 005 — Edição** seguindo o fluxo de `/adr 005`. Este ADR executa o **spike S-1** definido no ADR 002 (seção 8.2), que decide ao mesmo tempo o editor e a aceitação dos ADRs 002, 003 e 004. É o ADR que destrava todos os outros.

## Etapa 0 — conferência (sem subagentes)

Antes de começar, verifique e me reporte em uma lista curta:
1. Todos os arquivos que o prompt manda anexar existem? O ADR 001 está em `adrs/`?
2. O `LEDGER.md` bate com os contratos de `adrs/ADR-002`, `003` e `004`? (mesma checagem do `/ledger-sync`, só leitura)
3. As 30 fixtures do Apêndice C do ADR 002 estão completas e extraíveis para arquivos?
4. Quais conflitos em aberto do ledger tocam esta camada (esperado: C-4 e C-5)?

Se algo faltar, pare e me diga. Não siga com premissas inventadas.

## Paralelização

Use subagentes **só onde o trabalho é independente**; decisão e escrita ficam com você, na thread principal.

**Paralelize:**
- **Pesquisa por candidata** (MDXEditor, Plate, Milkdown; Tiptap 3 e BlockNote só para registrar a eliminação com evidência atual; CodeMirror 6 para o modo fonte). Um subagente por candidata.
- **Auditoria de licenças** das dependências transitivas de cada finalista, se a pesquisa não cobrir.
- **Execução do spike S-1**, um subagente por editor finalista, depois que eu aprovar a instalação (ver abaixo).

**Não paralelize:**
- Escopo, ponderação, escolha do editor, texto do ADR e diff do ledger.
- Qualquer coisa que dependa do resultado de outro subagente.

**Briefing de cada subagente** (inclua sempre, porque ele não vê esta conversa):
- O objetivo específico, em uma frase.
- Só o contexto necessário: os critérios E-01 a E-13 do prompt, as regras de licença e de evidência do `BASE.md`, e os riscos conhecidos daquela candidata (listados no prompt). Não mande o ledger inteiro.
- O arquivo de saída exato: `adrs/_work/ADR-005-candidata-<nome>.md` ou `adrs/_work/spike-s1/<editor>/RESULTADO.md`.
- O formato de saída: versão estável e data da verificação; licença do pacote e das transitivas relevantes; nota N/P/C/X/? por critério, **cada uma com link ou trecho de código como evidência**; estimativa em dias para cada "C"; lista do que não conseguiu verificar.
- Proibições: não escrever fora de `adrs/_work/`, não decidir nada, não editar ADR nem ledger, não tratar README como evidência.
- Das regras de estilo, só a Regra zero e a de evidência valem para as fichas: lacuna declarada, nenhuma afirmação sem fonte.

No máximo 5 subagentes simultâneos. Quando todos terminarem, **você** consolida as fichas, confere as contradições entre elas e só então pondera.

## Spike S-1 (código de verdade)

O spike precisa instalar os editores e rodar as fixtures. Regras:
- Tudo num projeto descartável em `adrs/_work/spike-s1/` (Vite + React 19 + TS strict), **nunca** no app.
- Antes de instalar qualquer pacote, me mostre a lista (pacote, versão, licença) e espere meu "ok".
- O `src/content-format` ainda não existe: implemente no spike só o mínimo de `parseDok`, `serializeDok` e `normalizeDok` descrito no Apêndice A do ADR 002, compartilhado pelos subagentes (um só, em `adrs/_work/spike-s1/content-format/`), para que todos os editores sejam medidos contra a mesma referência.
- Cada subagente de editor roda os testes 1 a 8 do S-1 e os E-10 a E-13, e grava o resultado com a saída real dos testes (não um resumo).

## Pontos de parada (espere minha resposta)

1. Relatório da Etapa 0.
2. Escopo aprovado (skill de brainstorming, uma pergunta por vez).
3. Lista de pacotes do spike, antes de instalar.
4. Resultado do S-1 e editor proposto, antes de escrever o ADR.
5. Diff do `LEDGER.md`, antes de aplicar. Se o S-1 passar, o diff move 002, 003, 004 e 005 para "Aceitos".

Comece pela Etapa 0.
