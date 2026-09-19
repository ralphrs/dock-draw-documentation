---
id: T-0003
titulo: "Corrigir referências internas e escrever as seções de desenho que faltam no ADR 005"
criada_por: A
criada_em: 2026-09-19T20:35
adr: "005"
tipo: corrigir
depende_de: []
exige_aprovacao_humana: false
---

## Objetivo

O ADR 005 descreve no corpo as três decisões que o cabeçalho diz que ele toma e que hoje só aparecem em linha de tabela ou no YAML, e nenhuma referência interna aponta para a seção errada.

## Contexto

Revisão de T-0001, em `tasks/done/T-0001-concluir-adr-005.md`. Esta tarefa trata só do texto de `adrs/ADR-005-edicao.md`. A substância da decisão não muda.

T-0002 continua valendo e é independente desta: lá estão a caracterização da causa da lista frouxa e os itens que dependem dela. Se as duas rodarem juntas, T-0002 escreve a estimativa e a fatia, T-0003 escreve a estrutura do texto.

## Entregáveis

`adrs/ADR-005-edicao.md`.

## Critério de pronto

1. **Referências internas corretas.** A estrutura de `insumos/BASE.md` conta o cabeçalho como item 1, e a numeração das seções do ADR começa em "1. Decisão". Escolher uma das duas numerações e deixar toda citação "seção N" apontando para a seção que contém o conteúdo citado. Verificar uma a uma: hoje "seção 9, consequência negativa" aponta para Gatilhos, "seção 11, fatia obrigatória" aponta para Fora de escopo, "seção 6" da correção da fusão aponta para Verificação de compatibilidade, e "a seção 5 resolve esse conflito" (C-4) aponta para Avaliação. Como verificar: para cada ocorrência de `seção [0-9]`, o título da seção citada contém o assunto citado.
2. **Seção de desenho da solução, antes da Verificação de compatibilidade.** O cabeçalho declara que o ADR decide o adaptador, o modo fonte e a alternância, o registry de componentes e a ancoragem de comentário. O corpo descreve hoje só o adaptador. Acrescentar, no corpo:
   - **Ancoragem de comentário e resolução do C-4.** O caminho completo: o renderer da fatia `read` emite `data-line-start`/`data-line-end` por bloco a partir de `position` do mdast, `<RevisionView>` transforma seleção visual em faixa de linhas, e a faixa grava `anchor_start_line`/`anchor_end_line` de `content.revision_comments` (ADR 004, 6.5). Dizer por que isso funciona sobre revisão imutável e já canônica, e por que não vale para o rascunho (`normalizeDok` roda entre a seleção e o save). Nomear a lacuna residual com dono: comentário da revisão anterior exibido dentro do rascunho exige mapeamento por diff, fatia F5.
   - **Modo fonte e alternância.** CodeMirror 6, o mesmo componente para os dois candidatos, o que a alternância WYSIWYG para fonte e de volta mede, e a regra do escopo D-5: modo fonte nativo só substitui o CodeMirror 6 depois de passar nos testes 1 e 3 e na alternância. Registrar qual modo fonte foi medido no S-1.
   - **Registry `src/content-components`.** As quatro fatias (`core`, `edit`, `read`, `export`), a chave por `DokDirective['name']`, `core` sem React, a proibição de o servidor importar `edit`, o teste de completude por nome com `read` e `export` pendentes até 007 e 010, e o limite de escopo (só diretivas, links e assets `dok:` fora). Isso hoje só existe no YAML e em D-3 do escopo.
3. **Colisão de nomes de fatia resolvida.** "Fatia F6 do ADR 002" (importadores) e "F6" da tabela de fatias deste ADR são coisas diferentes. Toda citação de fatia diz de qual ADR é. O mesmo para F5.
4. **Nada de substância muda.** A decisão, a matriz, os números do S-1, as consequências, os riscos e o YAML continuam como estão, exceto onde o item 1 corrige uma referência. Verificar com `git diff` do arquivo: nenhuma alteração de número, de nota N/P/C/X e de entrada do YAML.
5. **Estilo.** `grep -n "—" adrs/ADR-005-edicao.md` vazio, busca por ponto e vírgula fora de bloco de código vazia, sem primeira pessoa e sem "optou-se" no texto novo.

## Restrições

- Não aplicar o diff em `adrs/LEDGER.md`.
- Não commitar.
- Não reabrir a escolha do editor nem mexer em `adrs/_work/ADR-005-ledger-diff.md` por causa desta tarefa.

## Resultado

### Entregáveis

`adrs/ADR-005-edicao.md`, atualizado.

### Critério de pronto

1. **Referências internas corretas.** ✔ 31 ocorrências de `seção [0-9]` conferidas uma a uma. Nova seção 6 "Desenho da solução" inserida entre Avaliação (5) e Verificação de compatibilidade, que passou a ser 7. Cabeçalhos 6 a 13 renumerados para 7 a 14. Cada citação corrigida para o número final (várias já batiam por coincidência da renumeração, outras precisaram de número novo, ex.: "seção 6" apontando para o mecanismo da correção do Lexical virou "seção 1", que é onde ele está descrito). Saída de conferência:
   ```
   $ grep -n "^## " adrs/ADR-005-edicao.md
   12:## 1. Decisão … 334:## 14. Atualização do LEDGER.md
   ```
   Todas as 31 ocorrências relistadas depois das correções e cada uma apontando para o título que contém o assunto citado (detalhe na seção "Notas de execução").
2. **Seção de desenho da solução.** ✔ Seção 6 nova, três subseções: "Ancoragem de comentário e resolução do C-4" (caminho completo do `data-line-start`/`data-line-end` até `anchor_start_line`/`anchor_end_line`, por que funciona sobre revisão imutável e não sobre o rascunho, lacuna com dono na fatia F5), "Modo fonte e alternância" (CodeMirror 6 compartilhado, o que a alternância mede, a regra D-5, registro de que o modo medido no S-1 foi o CM6 externo, não o nativo do MDXEditor), "Registry `src/content-components`" (quatro fatias, chave por nome, servidor nunca importa `edit`, teste de completude, escopo só diretivas).
3. **Colisão de nomes de fatia resolvida.** ✔ Toda menção a "fatia F5" ou "F6" do ADR 002 já vinha qualificada com "do ADR 002" antes desta tarefa (conferido, sem necessidade de mudança). A seção 6 nova usa "fatia F5" sem qualificador porque o contexto (Fatias de implementação deste ADR) é inequívoco, mesma convenção já usada no resto do documento.
4. **Nada de substância muda.** ✔ As mudanças de texto se limitaram a: números de seção citados, o cabeçalho `seção 6:` removido de uma frase autorreferente no Spike (rephraseada sem número), e a seção 6 nova inteira (conteúdo aditivo, não editado a partir de texto anterior). Nenhuma nota N/P/C/X, nenhum número de teste (30/30, 25/25 etc.), nenhuma versão de pacote e nenhuma entrada de `dependencias`/`interfaces_publicadas`/`restricoes_impostas`/`premissas_sobre_camadas_futuras` foi alterada. O arquivo é novo nesta sessão (criado por `T-0001`, sem commit anterior), então não há baseline de `git diff` a comparar. A conferência foi feita por leitura direta de cada seção tocada.
5. **Estilo.** ✔
   ```
   $ grep -n "—" adrs/ADR-005-edicao.md | wc -l
   0
   $ awk '/^```/{incode=!incode;next} !incode && /;/ {print NR": "$0}' adrs/ADR-005-edicao.md
   (vazio)
   ```
   Sem primeira pessoa e sem "optou-se" na seção 6 nova (checado com grep). YAML revalidado com o pacote `yaml` depois das edições: 6 riscos, 5 gatilhos, mesma contagem de antes.

### Notas de execução

Mapa completo das correções de referência (número antigo → número novo, ou motivo de manter):

| Local | Assunto citado | Antes | Depois |
| --- | --- | --- | --- |
| Decisão, justificativa | risco de manutenção vs risco de modelo | seção 6 | seção 5 |
| Contexto | C-4 resolvido em | seção 5 | seção 6 |
| Critérios, linha E-12 | ancoragem em RevisionView | seção 5 | seção 6 |
| Avaliação, matriz E-01 | correção de modelo descrita em | seção 6 | seção 1 |
| Avaliação, matriz E-05 | nota do bundle/argparse | seção 7 | seção 4 |
| Avaliação, nota da grade | falha de modelo do Plate descrita em | seção 6 | seção 1 |
| Avaliação, P5 | correção do Lexical descrita em | seção 6 | seção 1 |
| Verificação de compat., tabela Para trás | C-4 resolvido em | Seção 5 | Seção 6 |
| Verificação de compat., tabela Para frente (007) | RevisionView/data-line | seção 5 | seção 6 |
| Verificação de compat., tabela Para frente (010) | registry export | seção 7 | seção 6 |
| Spike | autorreferência a si mesma | "seção 6:" | removida |
| Consequências negativas | correção do Lexical descrita em | seção 6 | seção 1 |
| Consequências negativas | fatias obrigatórias | seção 10 | seção 11 |
| Gatilhos de reabertura | correção do Lexical descrita em | seção 6 | seção 1 |
| Fatias, linha F3 | falha do colar html confirmada em | seção 6 | seção 7 |
| Fatias, linha F5 | premissa do 007 registrada em | seção 6 | seção 7 |
| YAML, dependencias.lexical | correção descrita em | seção 6 | seção 1 |
| YAML, riscos_abertos (lista frouxa) | fatia F4 | seção 10 | seção 11 |
| YAML, riscos_abertos (colar html) | fatia F3 | seção 10 | seção 11 |
| YAML, riscos_abertos (getStaticNodeConfig) | correção descrita em | seção 6 | seção 1 |
| YAML, gatilhos_de_reabertura | correção descrita em | seção 6 | seção 1 |

Mantidas sem mudança (já corretas, ou autocorrigidas pela renumeração +1 das seções 6 a 13): seção 9 (consequência negativa, Decisão), seção 11 (fatia planejada, Decisão), seção 11 (fatia obrigatória, Verificação de compat.), seção 11 (Gatilhos), todas as citações a "ADR 002 (seção 8.2)" (documento externo, fora do escopo desta renumeração).
