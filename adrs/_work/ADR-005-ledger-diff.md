# Diff proposto para adrs/LEDGER.md (parada 5)

Não aplicado. Requer `categoria_aprovacao: ledger` e `categoria_aprovacao: aceite-adr`, com `aprovado_por: humano` na resposta `A-Q-*` que autorizar. Fonte de cada mudança: `adrs/_work/ADR-005-edicao.md` e `adrs/_work/ADR-005-pendencias-ledger.md` (itens 1 a 14).

## Mudança 1: nota de regra de status (topo do ledger)

O aviso `[!IMPORTANT]` no topo explica por que 002, 003 e 004 ficam em "Propostos vinculantes" até o S-1 passar. O S-1 passou (ADR 005, seção 7). O aviso perde a razão de existir tal como está escrito e vira nota histórica.

**Antes:**

```md
> [!IMPORTANT]
> **Regra de status do ledger (mudança de processo, 2026-09-19).** Os ADRs 002, 003 e 004 estão **Propostos** e encadeados: o 002 só vira Aceito quando o spike S-1 passar, e o 003 e o 004 são aceitos junto com ele. Se o ledger registrasse só ADRs Aceitos, nenhum ADR seguinte poderia ser escrito até o spike rodar.
>
> Por isso o ledger tem duas seções:
>
> - **Aceitos**: contratos definitivos.
> - **Propostos vinculantes**: contratos que os próximos ADRs **devem respeitar como se estivessem aceitos**. Se o spike S-1 falhar, o gatilho de reabertura do ADR 002 reabre a cadeia 002 → 003 → 004 e todo ADR que tenha consumido esses contratos é revisado.
```

**Depois:**

```md
> [!NOTE]
> **Histórico de processo.** Entre 2026-09-18 e 2026-09-19 os ADRs 002, 003 e 004 ficaram em "Propostos vinculantes", contratos que os ADRs seguintes deviam respeitar como se estivessem aceitos, enquanto o spike S-1 (definido no ADR 002, seção 8.2) não rodava. O S-1 passou com o MDXEditor 4.2.5 em 2026-09-19 (ADR 005, seção 7), e os três ADRs, junto com o 005, passam para "Aceitos". A seção "Propostos vinculantes" volta a existir se um ADR futuro precisar do mesmo mecanismo.
```

## Mudança 2: mover ADR 002 para "Aceitos"

O bloco inteiro do ADR 002 (do cabeçalho `## ADR 002 — Formato de conteúdo (DokMD v1)` até o fechamento do bloco YAML) sai da seção "Propostos vinculantes" e entra na seção "Aceitos", logo depois do ADR 001.

Dentro do bloco YAML, duas linhas mudam:

**Antes:**

```yaml
status: "Proposto"
```

**Depois:**

```yaml
status: "Aceito"
```

Acrescentar ao fim de `riscos_abertos`, item novo (achado do S-1, pendência 13):

```yaml
  - "DOK-W103 falso no validador de referência do harness: em leafDirective, o rótulo vira filhos diretos (phrasing) sem parágrafo com data.directiveLabel, e o check de conformidade emite o aviso mesmo quando o rótulo está correto. O porte usado no S-1 (ADR 005) mantém o comportamento do harness. Dono: fatia F2 (validação)"
```

Corrigir a dependência `zod` (pendência 6, achado do S-1):

**Antes:**

```yaml
  - pacote: "zod"
    versao: "^4.6.5"
    licenca: "MIT"
    verificado_em: "2026-09-18 https://www.npmjs.com/package/zod (provavelmente já presente no app)"
```

**Depois:**

```yaml
  - pacote: "zod"
    versao: "^4.6.5, ou ^3.25.76 do app importando de zod/v4"
    licenca: "MIT"
    verificado_em: "2026-09-18 https://www.npmjs.com/package/zod. Confirmado em 2026-09-19 (ADR 005, adrs/_work/spike-s1/AMBIENTE.md): o app usa zod ^3.25.76, que publica a API 4 em zod/v4. O gate do S-1 passa 30/30 importando de zod/v4 e falha na carga importando a API 3 clássica (z.uuid is not a function). src/content-format importa sempre de zod/v4"
```

## Mudança 3: mover ADR 003 para "Aceitos"

Bloco inteiro do ADR 003 sai de "Propostos vinculantes" e entra em "Aceitos", depois do ADR 002. Dentro do bloco YAML:

**Antes:**

```yaml
status: "Proposto"
```

**Depois:**

```yaml
status: "Aceito"
```

## Mudança 4: mover ADR 004 para "Aceitos"

Bloco inteiro do ADR 004 sai de "Propostos vinculantes" e entra em "Aceitos", depois do ADR 003. Dentro do bloco YAML:

**Antes:**

```yaml
status: "Proposto"
```

**Depois:**

```yaml
status: "Aceito"
```

## Mudança 5: seção "Propostos vinculantes" fica vazia

**Antes:**

```md
---

# Propostos vinculantes

Ordem de aceitação: 002 (após spike S-1) → 003 e 004 juntos com o 002.

## ADR 002 — Formato de conteúdo (DokMD v1)
[... bloco completo ...]

## ADR 003 — Armazenamento e versionamento
[... bloco completo ...]

## ADR 004 — Fluxo editorial
[... bloco completo ...]
```

**Depois:**

```md
---

# Propostos vinculantes

Vazia em 2026-09-19. Os ADRs 002, 003 e 004 passaram para "Aceitos" quando o S-1 (ADR 005) passou. Seção mantida para o próximo ADR que precisar do mesmo mecanismo de contrato vinculante antes do aceite formal.
```

## Mudança 6: acrescentar o contrato do ADR 005 em "Aceitos"

Novo bloco, depois do ADR 004 (agora em "Aceitos"):

```md
## ADR 005 — Edição

Arquivo: `ADR-005-edicao.md` · Status: Aceito.

\`\`\`yaml
[conteúdo integral da seção 12 do adrs/ADR-005-edicao.md]
\`\`\`
```

O conteúdo do bloco YAML é a seção 12 ("Contrato de saída") de `adrs/ADR-005-edicao.md`, copiado sem edição.

## Mudança 7: tabela "Numeração oficial"

**Antes:**

```md
| 005 | Edição | Proposto — aceito quando o spike S-1 passar |
```

Nota: a linha real no ledger de origem (antes desta sessão) ainda trazia o texto antigo apontado na pendência 1: "Não escrito — o arquivo `ADR-005-edicao.md` contém o prompt, não o ADR", que já estava incorreto antes mesmo do S-1 (o arquivo em questão passou a ser o prompt em `prompts/PROMPT-ADR-005.md`, e `adrs/ADR-005-edicao.md` é o ADR gerado por esta sessão).

**Depois:**

```md
| 005 | Edição | Aceito |
```

## Mudança 8: conflito C-4

**Antes:**

```md
| C-4 | 004 × 005 | O ADR 004 exige do editor: diff textual **e** renderizado contra a publicada, comentário ancorado por **faixa de linhas do texto canônico**, indicador de `changes_requested` e modo somente leitura. Ancorar por linha do texto canônico num editor WYSIWYG exige mapear seleção visual ↔ posição no Markdown | ADR 005 (eliminatório/importante explícito) |
```

**Depois:** remover a linha da tabela de "Conflitos em aberto". Acrescentar, na tabela de "Premissas pendentes por camada destinatária", linha "Edição (005)" já existente, o texto:

```md
Resolvido pelo ADR 005: a ancoragem acontece em `<RevisionView>`, fora do editor. O renderer da fatia `read` (ADR 007) emite `data-line-start`/`data-line-end` por bloco, e a seleção na visão de leitura vira faixa de linhas a partir desses atributos. Lacuna registrada com dono na fatia F5 do ADR 005: mapear comentário de uma revisão anterior para as linhas do rascunho atual, quando divergem.
```

## Mudança 9: conflito C-5

**Antes:**

```md
| C-5 | 002 × prompt 005 | O ADR 002 trocou o eliminatório de round-trip de 28/30 para **30/30** (teste 1 do S-1, com `normalizeDok`) e redefiniu os testes 3 e 4. O prompt original do ADR 005 ainda pede 28/30 | Prompt do ADR 005 atualizado (entregue junto com este ledger) |
```

**Depois:** remover a linha. `prompts/PROMPT-ADR-005.md` já pede E-01 "Teste 1 do S-1: 30/30" (seção "Eliminatórios", linha 43), o que fecha o conflito sem edição adicional.

## Mudança 10: conflito C-6

**Antes:**

```md
| C-6 | Numeração | O ADR 002 manda "renderização **e navegação**" para o 007 (o plano tem Navegação no 008) e chama o ADR 003 de "ADR de persistência". O ADR 004 manda o diff visual para "ADR 005/006". O `PROMPT-ADR-006.md` é uma cópia antiga do prompt de Renderização | Corrigir referências na próxima revisão de 002 e 004; descartar `PROMPT-ADR-006.md` |
```

**Depois:**

```md
| C-6 | Numeração | O ADR 002 manda "renderização **e navegação**" para o 007 (o plano tem Navegação no 008) e chama o ADR 003 de "ADR de persistência". O `PROMPT-ADR-006.md` é uma cópia antiga do prompt de Renderização. A parte "diff visual para ADR 005/006" está resolvida: o ADR 005 (D-4) decidiu que `<RevisionDiff>` usa a fatia `read` do ADR 007, sem editor próprio de diff | Corrigir as referências de renderização/navegação e de "ADR de persistência" na próxima revisão de 002 e 004, quando forem abertos por outro motivo. Descartar `PROMPT-ADR-006.md` |
```

## Mudança 11: tabela "Premissas pendentes por camada destinatária"

**Antes (linha "Edição (005)"):**

```md
| Edição (005) | Produz DokAST/DokMD sem perda, directives só de bloco (002); diff textual e renderizado, comentário por faixa de linhas, indicador `changes_requested`, somente leitura, decisão sobre modo sugestão (004) |
```

**Depois:**

```md
| Edição (005) | Aceito. Produz DokAST/DokMD sem perda nas 30 fixtures via adaptador (002), directives só de bloco. Diff textual e renderizado, comentário por faixa de linhas (resolvido em RevisionView, ver C-4), indicador changes_requested, somente leitura (004). Modo sugestão fica fora da v1 (D-7 do escopo do 005) |
```

**Antes (linha "Renderização (007)"):**

```md
| Renderização (007) | Renderiza DokAST sem MDX, resolve `dok:`, política de imagem externa (002); resolução dinâmica de diagrama até existir versionamento (004); exibe view em modo leitura (001); dono da geração estática de view (C-2) |
```

**Depois:**

```md
| Renderização (007) | Renderiza DokAST sem MDX, resolve `dok:`, política de imagem externa (002); resolução dinâmica de diagrama até existir versionamento (004); exibe view em modo leitura (001); dono da geração estática de view (C-2); implementa a fatia `read` de `src/content-components` para todos os nomes do registro, com o renderer emitindo `data-line-start`/`data-line-end` por bloco, e é o único renderizador de DokAST do app (005) |
```

**Antes (linha "Exportação (010)"):**

```md
| Exportação (010) | Implementa a matriz do Apêndice B, escape de `{` e `<` no .mdx, datas vindas do banco (002); usa `content.sync_state` (003); só publicadas, rascunho só por ação manual do autor (004) |
```

**Depois:**

```md
| Exportação (010) | Implementa a matriz do Apêndice B, escape de `{` e `<` no .mdx, datas vindas do banco (002); usa `content.sync_state` (003); só publicadas, rascunho só por ação manual do autor (004); implementa a fatia `export` de `src/content-components` para todos os nomes do registro (005) |
```

## Resumo do efeito

| Item | Estado antes | Estado depois |
| --- | --- | --- |
| ADR 002 | Proposto (Propostos vinculantes) | Aceito |
| ADR 003 | Proposto (Propostos vinculantes) | Aceito |
| ADR 004 | Proposto (Propostos vinculantes) | Aceito |
| ADR 005 | Não existia no ledger | Aceito, contrato novo |
| C-4 | Em aberto | Resolvido, com lacuna residual registrada na premissa do 005 |
| C-5 | Em aberto | Fechado |
| C-6 | Em aberto | Parcialmente resolvido (diff visual). Resto continua em aberto, dono inalterado |
| Pendência 6 (zod) | Contrato do 002 desatualizado | Corrigido |
| Pendência 13 (W103) | Achado do S-1, sem registro no ledger | Registrado em `riscos_abertos` do 002 |
| Pendência 14 (lista frouxa fora do corpus) | Achado do S-1, sem registro no ledger | Não incluída nesta mudança do ledger. É pendência de fixture do ADR 002 (fatia F5), a tratar quando o 002 for reaberto por outro motivo, não gatilho de reabertura por si só |
