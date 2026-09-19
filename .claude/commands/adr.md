---
description: Escreve um ADR de camada da engine de documentação, com checagem de compatibilidade contra o LEDGER
argument-hint: <número do ADR, ex. 005 ou 002-emenda-1>
---

Escreva o ADR **$ARGUMENTS** da engine de documentação do DokDraw. Siga as etapas na ordem; não avance sem cumprir o critério de saída de cada uma.

## 1. Carregar contexto
Leia `insumos/BASE.md`, `insumos/ESTILO-ADR.md`, `insumos/ORDEM.md`, `adrs/LEDGER.md` e `prompts/PROMPT-ADR-$ARGUMENTS.md`. Leia cada ADR e insumo que o prompt manda anexar (ADRs em `adrs/`, pesquisas e schema em `insumos/`).
**Saída:** se o prompt ou algum anexo não existir, pare e liste o que falta.

## 2. Conferir o ledger
Compare `adrs/LEDGER.md` com o "Contrato de saída" de cada `adrs/ADR-*.md`. Confira também os "Conflitos em aberto" que tocam esta camada.
**Saída:** se o ledger estiver desatualizado, pare e sugira `/ledger-sync`. Liste os conflitos em aberto que este ADR precisa resolver ou respeitar.

## 3. Escopo (skill de brainstorming)
Confirme comigo, uma pergunta por vez, o que este ADR decide, o que não decide e quais contratos restringem as candidatas. Grave o escopo aprovado em `adrs/_work/ADR-$ARGUMENTS-escopo.md`.
**Saída:** escopo aprovado por mim.

## 4. Pesquisa em paralelo (skill de despacho de agentes em paralelo)
Um subagente por candidata. Cada um grava `adrs/_work/ADR-$ARGUMENTS-candidata-<nome>.md` com versão estável atual, data da verificação, licença (pacote e transitivas relevantes), links de evidência e nota N/P/C/X/? por critério, cada nota com evidência.
**Saída:** todas as fichas gravadas; nenhuma nota sem evidência.

## 5. Escrever
Escreva `adrs/ADR-$ARGUMENTS-<slug>.md` seguindo a "Estrutura obrigatória do ADR" de `insumos/BASE.md`, com a "Verificação de compatibilidade" contra **todo** o ledger (Aceitos e Propostos vinculantes) e o "Contrato de saída" em YAML. Status: Proposto. Escreva seguindo `insumos/ESTILO-ADR.md` desde o primeiro rascunho, não como revisão no fim.

## 6. Verificação (skill verification-before-completion)
Mostre o resultado de cada item:
- [ ] Todo critério tem "como verificar" e toda nota tem evidência com link.
- [ ] A compatibilidade cobre cada `restricoes_impostas` e cada `premissas_sobre_camadas_futuras` do ledger dirigida a esta camada.
- [ ] Os conflitos em aberto que tocam esta camada foram resolvidos ou mantidos com dono.
- [ ] Nenhuma licença GPL, AGPL, BSL ou SSPL em código embutido.
- [ ] Versões com data de verificação.
- [ ] YAML do contrato válido e completo.
- [ ] Nenhum "?" em eliminatório sem spike descrito.
- [ ] Checklist de `insumos/ESTILO-ADR.md` (itens 1 a 14), com a saída real de `grep -n "—"` e da busca por ponto e vírgula fora de bloco de código.

## 7. Ledger
Mostre o diff proposto para `adrs/LEDGER.md` (novo contrato, conflitos, premissas pendentes, numeração). **Não aplique** até eu aprovar. Depois, aplique e pergunte se deve fazer commit.
