---
id: T-0005
titulo: "Aplicar o diff no LEDGER.md, aceitar os ADRs 002 a 005 e commitar a etapa"
criada_por: A
criada_em: 2026-09-19T21:05
adr: "005"
tipo: executar
depende_de: [T-0004]
exige_aprovacao_humana: false
---

> [!IMPORTANT]
> A aprovação já existe. `A-Q-0002` (em `tasks/done/`) traz `aprovado_por: humano` e cobre, nomeadamente: aplicar o diff em `adrs/LEDGER.md`, mover os ADRs 002, 003, 004 e 005 para Aceitos, e commitar a etapa. Esta tarefa executa aquela instrução, sem dúvida nova.

## Objetivo

O `adrs/LEDGER.md` reflete o estado real: quatro ADRs Aceitos, contrato do 005 publicado, C-4 e C-5 fora da tabela de conflitos, e a etapa commitada na `main`.

## Contexto

T-0001 a T-0004 concluídas e revisadas. O diff está em `adrs/_work/ADR-005-ledger-diff.md`, 11 mudanças, mais os três ajustes de `A-Q-0002`.

O ADR 005 mudou depois que o diff foi escrito: T-0002 reescreveu `riscos_abertos` e a fatia F4, e T-0003 inseriu a seção 6 e renumerou as seções 6 a 13 para 7 a 14. A cópia do contrato no ledger precisa vir do arquivo atual, não do diff.

## Entregáveis

`adrs/LEDGER.md`, `adrs/ADR-005-edicao.md` (só o campo de status), `adrs/_work/ADR-005-pendencias-ledger.md` (marca de aplicado), e os commits.

## Critério de pronto

1. **Ajuste 1 aplicado.** `adrs/ADR-005-edicao.md` com `Status: Aceito` no cabeçalho e `status: "Aceito"` no YAML da seção 13, e a cópia no ledger com o mesmo valor.
2. **Ajuste 2 aplicado.** `riscos_abertos` do contrato do ADR 002, no bloco que vai para "Aceitos", inclui a pendência 14 (corpus sem `list.spread = true` na raiz, com a fatia F5 do ADR 002 como dona), no mesmo formato do registro do W103.
3. **Ajuste 3 aplicado.** O bloco YAML do ADR 005 no ledger é cópia literal da seção 13 do arquivo atual, conferida depois de T-0002 e T-0003. Verificar por comparação de texto, não por leitura.
4. **As 11 mudanças aplicadas.** Conferência final: nenhuma seção "Propostos vinculantes" com conteúdo, quatro ADRs em "Aceitos", tabela "Numeração oficial" coerente com `insumos/ORDEM.md`, C-4 e C-5 fora da tabela de conflitos, C-6 reduzido ao que sobrou, e C-1, C-2, C-3 e C-7 intactos.
5. **Pendências marcadas.** Em `adrs/_work/ADR-005-pendencias-ledger.md`, cada item aplicado ao ledger ganha a marca de aplicado, com a data. Os itens que continuam só documentados ficam explícitos.
6. **Commits.** Dois commits, um para o ADR 005 e os artefatos do spike, outro para o ledger aplicado. Mensagem semântica em português. **Sem qualquer linha de atribuição a IA, sem `Co-Authored-By`, sem rodapé de ferramenta.** Push na `main`. Anexar ao "Resultado" a saída de `git log --oneline -3` e de `git status --short`.

## Restrições

- Não mudar nenhum número, nota ou decisão do ADR 005 nesta tarefa. Só status, ledger e marcas de pendência.
- Não tocar em `insumos/`, `prompts/` nem `guia-sessoes/`.
- O `node_modules/` do spike não entra em commit. Conferir o `.gitignore` antes do `git add`.

## Dúvidas resolvidas

Nenhuma nesta tarefa. A autorização de `A-Q-0002` (`tasks/done/`) já cobre os seis itens do critério de pronto, conforme a nota `[!IMPORTANT]` no topo desta tarefa.

## Resultado

### Entregáveis

`adrs/LEDGER.md`, `adrs/ADR-005-edicao.md` (campo de status), `adrs/_work/ADR-005-pendencias-ledger.md` (marca de aplicado), `adrs/_work/ADR-005-ledger-diff.md` (ajustado ao arquivo final do ADR), `adrs/_work/spike-s1/mdxeditor/RESULTADO.md` (correção de versão, T-0004), e os commits desta seção.

### Critério de pronto

1. **Ajuste 1 aplicado.** ✔ `adrs/ADR-005-edicao.md`: `Status: Aceito` no cabeçalho, `status: "Aceito"` na seção 13. `adrs/LEDGER.md`: bloco do ADR 005 com `status: "Aceito"`.
2. **Ajuste 2 aplicado.** ✔ `riscos_abertos` do ADR 002 em `adrs/LEDGER.md` (bloco "Aceitos") ganhou dois itens novos: o W103 (pendência 13) e a pendência 14 ("O corpus de 30 fixtures não exercita list.spread = true..."), mesmo formato.
3. **Ajuste 3 aplicado.** ✔ Comparação por código, não por leitura:
   ```
   $ node -e "... compara mAdr[1] === mLedger[1] ..."
   idênticos: true
   ```
   O bloco YAML do ADR 005 em `adrs/LEDGER.md` é cópia byte a byte da seção 13 de `adrs/ADR-005-edicao.md` no estado atual, depois de T-0002 e T-0003.
4. **As 11 mudanças aplicadas.** ✔ Conferido em `adrs/LEDGER.md`:
   - Seção "Propostos vinculantes" vazia (nota histórica, sem bloco de ADR).
   - Cinco ADRs em "Aceitos" (001 a 005), cinco blocos YAML válidos (`adr`/`status` conferidos por `yaml.parse`, ver saída abaixo).
   - Tabela "Numeração oficial": 002, 003, 004 e 005 como "Aceito".
   - C-4 e C-5 fora da tabela "Conflitos em aberto" (restam C-1, C-2, C-3, C-6, C-7).
   - C-6 com o texto reduzido, a parte "diff visual" resolvida.
   - C-1, C-2, C-3 e C-7 com o texto original, intactos.

   ```
   $ node -e "... 5 blocos yaml, cada um com adr/status ..."
   blocos yaml encontrados: 5
   0 OK adr=001 status=Aceito
   1 OK adr=002 status=Aceito
   2 OK adr=003 status=Aceito
   3 OK adr=004 status=Aceito
   4 OK adr=005 status=Aceito
   ```
5. **Pendências marcadas.** ✔ `adrs/_work/ADR-005-pendencias-ledger.md`, linha 3: "Todas as 14 aplicadas em `adrs/LEDGER.md` em 2026-09-19, por `A-Q-0002` (`aprovado_por: humano`, decisão 2, categorias `ledger` e `aceite-adr`). Diff completo em `adrs/_work/ADR-005-ledger-diff.md`." Item 14 explícito sobre o que ficou só documentado (a lacuna de cobertura do corpus, fatia F5 do ADR 002, sem virar gatilho de reabertura por si só).
6. **Commits.** ✔ Dois commits, mais um terceiro só para esta evidência (abaixo). Push feito na `main`. Sem `Co-Authored-By` nem rodapé de ferramenta em nenhum dos três.

### Commits realizados

```
$ git log --oneline -3
3f4e52e docs(ledger): aceita os ADRs 002 a 005 e publica o contrato do 005
01b3e53 docs(adr-005): fecha o desenho, a causa da lista frouxa e as referências internas
d3273d2 docs: sessão C desenvolvedora, A como scrum master, app-release

$ git status --short
(vazio)

$ git push origin main
219b29a..3f4e52e  main -> main
```

`01b3e53` traz os entregáveis do ADR 005 e do spike (T-0002, T-0003, T-0004). `3f4e52e` traz só `adrs/LEDGER.md`.

### Achado fora do escopo original, corrigido antes desta tarefa

`T-0004` (em `tasks/done/`) corrigiu uma versão citada errada em `mdxeditor/RESULTADO.md` (`mdast-util-to-markdown@9.0.0` para `@2.1.2`), achada na revisão de `T-0002`. Não muda nada nesta tarefa além de já deixar o artefato correto antes do commit.
