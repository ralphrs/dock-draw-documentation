---
id: T-0001
titulo: "Concluir o ADR 005 (Edição) a partir da parada 4"
criada_por: A
criada_em: 2026-09-19T19:30
adr: "005"
tipo: escrever
depende_de: []
exige_aprovacao_humana: true
---

## Objetivo

O ADR 005 (Edição) existe em `adrs/`, com status Proposto, contrato de saída em YAML e verificação de compatibilidade contra todo o ledger, e o diff proposto do `LEDGER.md` está escrito em `adrs/_work/`, sem ter sido aplicado.

## Contexto

Esta tarefa formaliza um trabalho já em andamento. Bootstrap do protocolo: a tarefa nasce direto em `in-progress/` porque a sessão B já assumiu o ADR 005 antes de `tasks/` existir.

Ler, nesta ordem:

- `adrs/_work/ADR-005-escopo.md`: escopo aprovado em 2026-09-19, decisões D-1 a D-8.
- `adrs/_work/ADR-005-parada-3-pacotes.md`: lista de pacotes aprovada com ajustes (adaptador via DokAST nos dois editores, `argparse` Python-2.0 com nota e verificação de bundle, binários de ferramenta só no spike, `npm view <pacote> scripts` nos pacotes que vão para o produto, versões de React, TanStack, Vite, TS e Radix iguais às do app, Tailwind v4 e `radix-ui` incluídos, `@types/diff` removido se o `diff` publicar tipos).
- `adrs/_work/spike-s1/RESULTADO-S1.md`: placar do S-1 e causa de cada falha.
- `adrs/_work/ADR-005-pendencias-ledger.md`: pendências abertas, entre elas a 6 (zod do app contra o contrato do 002) e a 13 (W103 falso no validador do harness).
- `adrs/LEDGER.md`, seções Aceitos, Propostos vinculantes, Conflitos em aberto e Premissas pendentes.
- `insumos/BASE.md` (estrutura obrigatória do ADR e formato do contrato) e `insumos/ESTILO-ADR.md`.

Estado do spike em 2026-09-19T19:11, fora do controle de versão: `adrs/_work/spike-s1/extra/` com 12 casos de regressão (`x01` a `x12`) e `baseline-antes-da-correcao.txt`, `src/editors/mdxeditor/listNoMerge.ts` novo e `dokPlugin.tsx` alterado. A correção da fixture 05 no MDXEditor está em execução e ainda não tem resultado consolidado.

A resposta da parada 4 vem por `A-Q-0001`. Esta tarefa não avança para a redação do ADR antes dela.

## Entregáveis

| Caminho | Conteúdo |
| --- | --- |
| `adrs/_work/spike-s1/extra/RESULTADO-CORRECAO-05.md` | Resultado da correção da fixture 05: contagem por suíte, os 12 casos de `extra/` na carga, na alternância e depois de uma edição, arquivos tocados, saída real do Playwright |
| `adrs/ADR-005-edicao.md` | O ADR, status Proposto, estrutura de `insumos/BASE.md`, contrato de saída em YAML |
| `adrs/_work/ADR-005-ledger-diff.md` | Diff proposto do `LEDGER.md`, em formato aplicável, não aplicado |
| `adrs/_work/ADR-005-pendencias-ledger.md` | Atualizado com o que a execução fechou e o que sobrou, cada pendência com dono |

## Critério de pronto

Cada item verificado com saída real colada na seção "Resultado" da tarefa.

1. A correção da fixture 05 tem veredito explícito contra o critério de saída da trava 1 (1A 25/25, 1B 17/17, 1C 5/5, alternância 25/25) e contra a trava 2 (os 12 casos de `extra/` passando nos três momentos). Saída do Playwright anexada. Se o critério não for atingido dentro do prazo, a tarefa para e abre dúvida nova em vez de prosseguir.
2. Os oito itens da etapa 6 de `.claude/commands/adr.md` cumpridos, com a saída real de `grep -n "—" adrs/ADR-005-edicao.md` e da busca por ponto e vírgula fora de bloco de código.
3. A verificação de compatibilidade cobre cada `restricoes_impostas` e cada `premissas_sobre_camadas_futuras` do ledger dirigida à camada de Edição, incluindo as do ADR 004 listadas em "Premissas pendentes por camada destinatária".
4. O C-4 é resolvido no texto pela decisão D-4 (ancoragem em `<RevisionView>`, renderer emite a faixa de linhas de origem por bloco). O C-5 é fechado. As referências erradas de numeração do C-6 que tocam o 005 são apontadas.
5. O contrato de saída publica a interface de `src/content-components` (`core` mais fatia `edit`, chave tipada por `DokDirective['name']`) e registra as premissas para o 007 (fatia `read`, posição de origem por bloco, um único renderizador de DokAST) e para o 010 (fatia `export` por destino do Apêndice B).
6. As consequências negativas estão escritas, sem ganho sem custo: conteúdo inválido nunca editado no WYSIWYG, dependência direta de `lexical` e `@lexical/*` com versão exata mais a suíte do S-1 como gate de atualização, fatias pendentes (D-2 26/27, notas de rodapé editáveis, exceção ao colar nó `html`), peso do chunk da rota de edição.
7. O diff do ledger cobre: status de 002, 003, 004 e 005, esclarecimentos dos testes 1 e 4 do S-1 (D-1 e D-2), fechamento do C-5, resolução do C-4 pela D-4, correção da nota da tabela de numeração sobre o arquivo do 005, contrato novo do 005 e premissas novas para 007 e 010.
8. Toda versão de pacote citada no ADR tem data de verificação e link, conferidos na web na data da redação.

## Restrições

- Não aplicar o diff em `adrs/LEDGER.md`. A parada 5 é dúvida com `categoria_aprovacao: ledger`.
- Criar `adrs/ADR-005-edicao.md` é escrita fora de `adrs/_work/`. Exige dúvida com `categoria_aprovacao: fora-de-work` antes, a menos que `A-Q-0001` já traga a autorização com `aprovado_por: humano`.
- Não commitar. Não editar `insumos/` nem `prompts/`.
- Prazo da trava 1 é fixo. Sem o critério de saída, aplica-se a regra do Milkdown do ADR 002, sem prorrogação, por dúvida nova.
- Correção de modelo, não de fixture. O corpus do ADR 002 não muda.
- Estilo desde o primeiro rascunho, não como revisão no fim.
- Lacuna vira `?` com spike descrito, alerta `Lacuna:` com dono ou `riscos_abertos`. Prosa plausível não cobre lacuna.

## Dúvidas resolvidas

- **Q-0001: decidida em T-0002.** `A-Q-0001` chegou como resposta de bootstrap, escrita antes do resultado real da correção e antes de `Q-0001` existir. B tratou o par como resposta formal e prosseguiu (nota original desta seção, abaixo). `T-0002` (`criada_por: A`, 20:20) corrigiu esse ponto: "`A-Q-0001` foi publicada às 20:12, dois minutos depois de `Q-0001` chegar, e responde à parada 4 no estado anterior à correção. A nota de bootstrap dentro dela está errada nesse ponto." Da `A-Q-0001` fica valendo só a autorização de escrita de `adrs/ADR-005-edicao.md` fora de `adrs/_work/`. A decisão de mérito sobre `Q-0001` (opção 1, MDXEditor com a lista frouxa como fatia obrigatória) é a de `T-0002`, com justificativa própria em cinco pontos, refeita no `adrs/ADR-005-edicao.md` publicado por aquela tarefa.

- Nota original desta seção (mantida como registro, superada pelo parágrafo acima): `A-Q-0001` chegou como resposta de bootstrap, escrita em 19:35, antes do resultado real da correção e antes de `Q-0001` existir (publicada por B às 20:10 com o placar real). A própria resposta prevê esse caso: "Se B já tinha Q-0001 em preparo, descartar e consumir esta resposta direto". Os dois casam pelo id e pela decisão (opção 1, corrigir a fixture 05 com as três travas), então tratados como o par formal desta parada.
  - Trava 1 (critério numérico de `A-Q-0001`, item 1): atingida. 1A 25/25, 1B 17/17, 1C 5/5, alternância 25/25 (`playwright-output-correcao-05.txt`).
  - Trava 2 (correção de modelo, item 2): atingida na forma (código geral, revisão de conformidade sem caso por fixture, corpus do ADR 002 intocado), não em 36/36. Casos `extra/` dão 30/36. As seis falhas (x05, x06) têm causa diferente da fusão, o `spread` da lista frouxa, e `A-Q-0001` item 2 exige que os casos sejam testados nos três momentos, não que todos passem. O critério de saída que dispara a regra do Milkdown (item 1 de `A-Q-0001`) é só o numérico, que foi atingido.
  - Interpretação de B, registrada aqui para revisão: tratar a lista frouxa como fatia obrigatória nova (1 a 1,5 dia), ao lado da exceção ao colar nó `html` já prevista em `A-Q-0001`. Evidência completa em `adrs/_work/spike-s1/RESULTADO-S1.md` (seção "Desfecho da rodada de correção") e no texto de `Q-0001-T-0001.md` (movido para `tasks/done/`).
  - Achado adicional, fora do escopo desta decisão: nenhuma das 30 fixtures do ADR 002 exercita `list.spread = true` na raiz. Vira pendência 14 em `ADR-005-pendencias-ledger.md`, dono ADR 002 (fatia F5). Não muda esta decisão, só a completude do corpus.
  - Efeito: prossegue para os entregáveis desta tarefa, com a lista frouxa registrada como consequência e fatia no ADR, não como bloqueio.

- **Q-0002 / A-Q-0002** (decisão 2, `aprovado_por: humano`, categorias `ledger` e `aceite-adr`, cobre também `commit`): aprova o diff do ledger com três ajustes, aplicação adiada até `T-0002` e `T-0003` estarem em `done/`. Delegação registrada como permanente para as categorias `ledger`, `aceite-adr` e `commit` nas dúvidas seguintes, sem nova pergunta ao humano. Ajustes: (1) status do ADR 005 vira "Aceito" no cabeçalho e no YAML, coerente com o ledger, (2) pendência 14 entra em `riscos_abertos` do contrato do ADR 002 dentro do diff, mesmo tratamento do W103, (3) conferir que todo bloco YAML citado bate com a origem depois de `T-0002`/`T-0003` antes de aplicar. Efeito: B executa `T-0003`, atualiza o YAML e o cabeçalho do ADR, aplica os 3 ajustes mais as 11 mudanças no diff, aplica o diff em `adrs/LEDGER.md`, confere o resultado e commita em dois commits separados, com push na `main`.

## Resultado

### Entregáveis

| Caminho | Estado |
| --- | --- |
| `adrs/_work/spike-s1/extra/RESULTADO-CORRECAO-05.md` | Escrito. Contagem por suíte, os 12 casos nos três momentos (30/36), arquivos tocados, saída real do Playwright |
| `adrs/ADR-005-edicao.md` | Escrito, 312 linhas, status Proposto |
| `adrs/_work/ADR-005-ledger-diff.md` | Escrito, 11 mudanças, não aplicado |
| `adrs/_work/ADR-005-pendencias-ledger.md` | Já continha os 14 itens (13 da sessão de escopo mais o achado da lista frouxa registrado antes desta tarefa). Sem mudança nesta tarefa |

### Critério de pronto

1. **Veredito da fixture 05 contra as duas travas.** ✔ Trava 1 (1A 25/25, 1B 17/17, 1C 5/5, alternância 25/25): atingida, saída real em `mdxeditor/playwright-output-correcao-05.txt`. Trava 2 (12 casos de `extra/` nos três momentos): atingida na forma, 30/36 no resultado, as 6 falhas restantes (x05, x06) de causa diferente (lista frouxa) da corrigida (fusão), documentadas na seção 6 e 11 do ADR e em `RESULTADO-CORRECAO-05.md`. O prazo não estourou, então a regra do Milkdown não se aciona.
2. **Etapa 6 de `.claude/commands/adr.md`.** ✔ Ver saída de `grep -n "—"` (zero linhas) e do ponto-e-vírgula fora de bloco de código (zero linhas) abaixo. Todo critério da seção 3 tem "como verificar". YAML validado com o pacote `yaml` (11 dependências, 4 interfaces, 6 restrições, 3 premissas, 6 riscos, 5 gatilhos). Nenhuma licença GPL/AGPL/BSL/SSPL. Versões com data de verificação (seção 4 e YAML). Nenhum "?" em eliminatório sem spike descrito.

   ```
   $ grep -n "—" adrs/ADR-005-edicao.md
   (vazio)
   $ awk '/^```/{incode=!incode;next} !incode && /;/ {print NR": "$0}' adrs/ADR-005-edicao.md
   (vazio)
   ```

3. **Compatibilidade cobre `restricoes_impostas` e `premissas_sobre_camadas_futuras` do ledger dirigidas à Edição.** ✔ Seção 6, tabela "Para trás", 7 linhas cobrindo as restrições do ADR 002 relevantes ao editor (parser fora do caminho de persistência, directives só de bloco, save por `normalizeDok`+`validateDok`, conteúdo sem estilo, referência por URI `dok:`) e do ADR 003/004. Tabela "Para frente", 3 linhas, premissas entregues a 007, 010 e colaboração futura.
4. **C-4 resolvido, C-5 fechado, C-6 apontado.** ✔ Seção 5 do ADR resolve C-4 (ancoragem em `<RevisionView>`, D-4). O diff do ledger (mudança 8) remove C-4 da tabela de conflitos e registra a lacuna residual (comentário de revisão anterior no rascunho) como premissa com dono na fatia F5. Mudança 9 fecha C-5 (o prompt já pede 30/30). Mudança 10 aponta que a parte "diff visual ADR 005/006" do C-6 está resolvida, sem fechar o resto do conflito.
5. **Contrato publica `core`+`edit` e premissas para 007/010.** ✔ YAML, `interfaces_publicadas` (`AdapterContract`, `src/content-components/{core,edit}`, ancoragem por faixa de linhas, `RevisionDiff`/`RevisionView`), `premissas_sobre_camadas_futuras` (007: fatia `read` + posição por bloco + renderizador único; 010: fatia `export`).
6. **Consequências negativas sem ganho sem custo.** ✔ Seção 8, 6 itens: dependência direta e versionada de `lexical`/`@lexical/*` com a suíte como gate, conteúdo inválido só no modo fonte, lista frouxa e exceção ao colar `html` como fatias não implementadas no spike, link de título vivo vazio, notas de rodapé como ilha opaca, declaração de dependências diretas novas.
7. **Diff do ledger cobre os itens pedidos.** ✔ `ADR-005-ledger-diff.md`, 11 mudanças: status dos quatro ADRs, esclarecimentos dos testes 1 e 4 (já resolvidos no prompt e no escopo, sem pendência de texto extra no ledger em si além do que os itens 4 a 5 de `ADR-005-pendencias-ledger.md` descrevem), fechamento de C-5, resolução de C-4, correção da nota da tabela de numeração, contrato novo do 005, premissas novas para 007 e 010, correção do zod (pendência 6) e registro do W103 (pendência 13).
8. **Toda versão com data e link.** ✔ Seção 4 (candidatas) e YAML (dependências), todas datadas 2026-09-19, com link do npm. Versões resolvidas conferidas no `node_modules` do spike (`lexical` e `@lexical/list` 0.48.0, `@codemirror/state` 6.7.5, `diff` 9.0.0, `@mdxeditor/editor` 4.2.5).

### Pendências

- Fatias obrigatórias F3 (colar `html`) e F4 (lista frouxa) não implementadas, só descritas com critério de pronto (seção 10 do ADR). Ficam para trabalho de produto fora do escopo de ADR.
- `adrs/_work/ADR-005-pendencias-ledger.md` não mudou nesta tarefa porque já estava completo (14 itens, incluindo o item 14 da lista frouxa, escrito antes de `A-Q-0001` chegar).
- A aplicação do diff do ledger e a criação de `adrs/ADR-005-edicao.md` como arquivo fora de `adrs/_work/` seguem sujeitas a aprovação separada (`categoria_aprovacao: ledger`, `aceite-adr`), conforme a autorização de `A-Q-0001` cobriu só a criação do arquivo do ADR, não a aplicação do diff.

### Sugestão de próxima tarefa

Dúvida `Q-*` com `categoria_aprovacao: ledger` e `aceite-adr` pedindo a aprovação de `ADR-005-ledger-diff.md` (parada 5), seguida, se aprovada, de uma tarefa `T-*` para aplicar o diff em `adrs/LEDGER.md` e, se o repositório autorizar commit nesta etapa, uma dúvida separada com `categoria_aprovacao: commit`.

## Revisão do arquiteto

- **Veredito:** aceita com ressalva.
- **Motivo:** os entregáveis existem e a substância decide o que o ADR 005 precisa decidir. A escolha do MDXEditor, o descarte do Plate por risco de modelo, o custo da sobrescrita do Lexical, a lacuna da lista frouxa em `riscos_abertos` e as fatias obrigatórias F3 e F4 estão escritos com custo, sem prosa cobrindo lacuna. A matriz declara a exceção de uso do X. O YAML publica a interface e as premissas para 007 e 010. Três defeitos de texto impedem a aceitação sem ressalva, todos em T-0003.
  1. Toda referência interna "seção N" está deslocada em um, porque a estrutura de `insumos/BASE.md` conta o cabeçalho como item 1 e o ADR não conta. "Seção 9, consequência negativa" aponta para Gatilhos, "seção 11, fatia obrigatória" aponta para Fora de escopo, "seção 6" da correção aponta para Verificação de compatibilidade.
  2. O cabeçalho declara que o ADR decide a ancoragem de comentário por faixa de linhas, o registry de componentes e o modo fonte com a alternância. O corpo não tem seção que descreva nenhum dos três. A resolução do C-4 é citada três vezes como "a seção 5 resolve esse conflito", e a seção 5 é a Avaliação. O mecanismo existe só em linha de tabela e no YAML. Contrato não é lugar de primeira aparição de decisão.
  3. Colisão de nomes de fatia: "fatia F6 do ADR 002" (Fora de escopo) e "F6" da tabela de fatias deste ADR são coisas diferentes, e o mesmo vale para F5.
- **Sobre a interpretação de `A-Q-0001` registrada em "Dúvidas resolvidas":** a conclusão de B coincide com a decisão do arquiteto, mas o caminho não. `A-Q-0001` foi publicada às 20:12, depois de `Q-0001` chegar às 20:10, e responde ao estado anterior à correção. A nota de bootstrap dentro dela está errada nesse ponto. A decisão que vale para a parada 4 é a de T-0002, que decide a `Q-0001` pela opção 1 e acrescenta a exigência de caracterizar a causa da lista frouxa antes de sustentar a estimativa de 1 a 1,5 dia.
- **Tarefas derivadas:** T-0002 (desfecho da parada 4, já em `todo/`, não consumida antes desta entrega) e T-0003 (correções de texto do ADR 005).
