---
id: T-0002
titulo: "Desfecho da parada 4: aceitar o MDXEditor com a lista frouxa como fatia obrigatória"
criada_por: A
criada_em: 2026-09-19T20:20
adr: "005"
tipo: escrever
depende_de: []
exige_aprovacao_humana: false
---

> [!IMPORTANT]
> Esta tarefa responde `Q-0001-T-0001` e substitui `A-Q-0001` no ponto em que as duas se cruzam.
> `A-Q-0001` foi publicada às 20:12, dois minutos depois de `Q-0001` chegar, e responde à parada 4 no estado anterior à correção. A nota de bootstrap dentro dela está errada nesse ponto. Da `A-Q-0001` continua valendo só a autorização de escrita: criar `adrs/ADR-005-edicao.md` não exige dúvida nova (`aprovado_por: humano`, concedido em 2026-09-19). Ledger e commit continuam exigindo aprovação separada.
> Ao consumir o par `Q-0001` e `A-Q-0001`, anotar em T-0001, na seção "Dúvidas resolvidas": "Q-0001: decidida em T-0002".

## Objetivo

A decisão do S-1 está fechada no MDXEditor, e o ADR 005 registra a lacuna da lista frouxa como fatia obrigatória, com causa caracterizada, dono e custo, sem que a prosa cubra a lacuna.

## Decisão

**Opção 1 da `Q-0001`: aceitar o MDXEditor.** A lista frouxa vira fatia obrigatória antes de liberar o editor, na mesma classe da exceção ao colar nó `html`.

Por quê, no que muda a decisão:

1. **A regra vinculante do ADR 002 (seção 8.2) passou a ser satisfeita ao pé da letra.** "Pelo menos um candidato passa nos testes 1 e 3": o MDXEditor fecha E-01 em 30/30 e passa no teste 3. A opção 1 não contorna contrato do ledger, então não é reabertura e não precisa da regra de desempate do Milkdown. A opção 3 descartaria um candidato que satisfaz a regra.
2. **A trava 2 cumpriu o que existia para cumprir.** Ela existe para distinguir correção de modelo de ajuste à fixture. A evidência de `Q-0001` mostra correção de modelo: substituição do `$transform` estático do `ListNode`, valendo para toda instância, sem caso especial por fixture, com os casos de `extra/` indo de 9/36 para 30/36 e nenhuma regressão. As 6 falhas restantes não são resíduo da fusão de listas, são um segundo defeito, de outra natureza (perda do `spread`), que os casos fora do corpus expuseram. Prorrogar o prazo da trava 1 para cobrir um defeito recém-descoberto trocaria um prazo fixo por um prazo elástico, que é exatamente o que a trava 1 impede.
3. **O custo aceito fica escrito, não dissolvido.** O E-01 30/30 vale sobre um corpus que não exercita lista frouxa na raiz, então prova menos do que o número sugere. Isso entra no ADR como consequência negativa, junto com a dependência de código próprio sobrescrevendo interno do Lexical.
4. **A perda do `spread` é alteração silenciosa de documento do usuário**, não diferença cosmética: lista frouxa e lista justa renderizam HTML diferente. Isso proíbe tratá-la como custo tolerável em produção. Daí a fatia ser obrigatória antes de liberar o editor, e não uma fatia comum como D-2 26/27 ou notas de rodapé editáveis.
5. A normalização do `spread` no `normalizeDok`, que B descartou sem numerar, está descartada pelo mesmo motivo: apagaria intenção autoral e mudaria o contrato do 002 fora desta sessão.

## Entregáveis

| Caminho | Conteúdo |
| --- | --- |
| `adrs/_work/spike-s1/mdxeditor/RESULTADO.md` | Seção nova com a caracterização do defeito de `spread` pedida no critério 1 |
| `adrs/_work/ADR-005-pendencias-ledger.md` | Item 14 completado com a caracterização e com a fatia obrigatória |
| `adrs/ADR-005-edicao.md` | O ADR, seguindo T-0001 |
| `adrs/_work/ADR-005-ledger-diff.md` | Diff proposto do ledger, seguindo T-0001 |

## Critério de pronto

1. **A causa da lista frouxa está caracterizada, não estimada por aproximação.** A tabela de `Q-0001` diz que `x08` (citação, `ul` com `ul`) e `x09` (citação, `ol` com `ol` com vários blocos) têm `list.spread = true` e passam, enquanto `x05` e `x06`, a mesma forma na raiz, falham. Enquanto essa diferença não tiver explicação no código, a estimativa de 1 a 1,5 dia não se sustenta. Entregar: por que o caminho dentro da citação preserva o `spread` e o da raiz não, com arquivo e linha. Se a explicação mudar a estimativa, a estimativa muda no ADR.
2. **A fatia obrigatória está escrita com critério de pronto verificável**: os 12 casos de `extra/` passando nos três momentos (carga, alternância, depois de uma edição), 36/36, mais o caso de lista frouxa na raiz que a fatia F5 do ADR 002 acrescenta ao corpus (pendência 14). Nomear as duas fatias obrigatórias juntas: lista frouxa e exceção ao colar nó `html`.
3. **O ADR declara a lacuna, sem prosa cobrindo**: E-01 30/30 medido sobre um corpus que não cobre `list.spread = true` na raiz. Alerta `Lacuna:` com dono, ou entrada em `riscos_abertos` do contrato, com gatilho de reabertura se a fatia não fechar.
4. **As consequências negativas do MDXEditor estão todas no ADR**, cada uma com custo: correção sobrescrevendo interno do Lexical (`lexical` e `@lexical/*` como dependências diretas com versão exata, suíte do S-1 como gate de atualização), lista frouxa (fatia obrigatória), exceção ao colar `html` (fatia obrigatória), D-2 fixtures 26 e 27 (C, 1 dia), notas de rodapé como ilha opaca (C, 2 a 3 dias), peso do chunk da rota de edição.
5. **O descarte do Plate distingue as naturezas**: risco de modelo (`@platejs/list` por indentação, sem item de vários blocos, 3 a 5 dias com risco, caminho `list-classic` exigindo pacote não instalado) contra risco de manutenção do MDXEditor. O descarte do Milkdown cita a regra de desempate satisfeita, não a ficha.
6. Os demais critérios de pronto de T-0001 seguem valendo, inclusive os oito itens da etapa 6 de `.claude/commands/adr.md`.

## Restrições

- Não mexer no corpus das 30 fixtures do ADR 002. A lacuna de cobertura é da fatia F5 do 002, já registrada como pendência 14.
- Não normalizar `spread` em `normalizeDok`, nem no porte do spike.
- Não estender a correção do MDXEditor dentro desta tarefa. A lista frouxa é fatia de implementação, fora do S-1. Se a caracterização do critério 1 mostrar que a correção é de minutos e no adaptador, abrir dúvida antes de implementar, em vez de decidir sozinho por ser barata.
- Não aplicar o diff em `adrs/LEDGER.md`. Parada 5 é dúvida com `categoria_aprovacao: ledger`.
- Não commitar.

## Dúvidas resolvidas

- **Q-0001: decidida nesta tarefa** (nota já anexada em `T-0001`, seção "Dúvidas resolvidas", por instrução do cabeçalho `[!IMPORTANT]` acima).

## Resultado

### Entregáveis

| Caminho | Estado |
| --- | --- |
| `adrs/_work/spike-s1/mdxeditor/RESULTADO.md` | Seção nova "Por que x08 passa e x05/x06 não: causa exata (T-0002)" |
| `adrs/_work/ADR-005-pendencias-ledger.md` | Item 14 reescrito com a causa e a fatia obrigatória nomeada |
| `adrs/ADR-005-edicao.md` | Atualizado (seções 1, 8, 10, YAML `riscos_abertos`) |
| `adrs/_work/ADR-005-ledger-diff.md` | Sem mudança nesta tarefa (a pendência 14 não entra no diff do ledger, por decisão já registrada nela: é lacuna de fixture do 002, não item que muda um contrato hoje) |

### Critério de pronto

1. **Causa caracterizada, não estimada por aproximação.** ✔ Diagnóstico com o dev server real (porta 5311) e com `parseDok` isolado sobre texto reconstruído à mão, sem tocar `extra/`, o corpus ou o adaptador. Mecanismo em quatro peças, cada uma com arquivo e linha:
   - O adaptador grava `spread: false` incondicionalmente em `list`/`listItem` na exportação (já conhecido).
   - `save()` faz duas serializações (`normalizeDok` reparseia o texto já serializado uma vez).
   - `mdast-util-to-markdown@9.0.0`, `join.js:25-38`: a junção entre itens irmãos usa `parent.spread`, `false` vira linha única. A junção parágrafo-parágrafo dentro do mesmo item é incondicional, por isso o conteúdo nunca se perde, só a linha em branco ao redor.
   - `mdast-util-from-markdown@2.0.3`, `prepareList`, `lib/index.js:278-382`: recalcula `list.spread` andando para trás a partir do fechamento da lista. Dentro de uma citação, uma linha em branco que separa duas listas é absorvida como conteúdo contínuo da citação (`containerBalance` trata `blockQuote` como contêiner aninhado, `linhas 292-304`) e contamina a lista anterior, marcando `listSpread = true` por acidente (`linhas 336-343`). Na raiz, a mesma linha em branco fecha a lista de forma limpa.
   - Confirmado isolando a variável com `parseDok` puro: a mesma forma (lista tight de 2 itens seguida de outra lista) reparseia `spread=false` na raiz e `spread=true` dentro de citação, com ou sem item de vários blocos.
   - Consequência: `x08-citacao-ul-ul`, o único caso de `extra/` que testa "linha em branco entre itens irmãos sobrevive ao save", passa por esse acidente do reparse, não por o MDXEditor preservar a informação. `x09`, `x10`, `x11`, `x12` não testam essa forma (listas de um item só ou tight). A estimativa de 1 a 1,5 dia se sustenta: a causa raiz (visitors gravando `spread: false`) já estava certa, o acidente do reparse só explica por que `x08` mascarava a lacuna.
2. **Fatia obrigatória com critério de pronto verificável.** ✔ F4 (seção 10 do ADR): "os 12 casos de `extra/` passam na carga, na alternância e depois de uma edição (36/36), mais um caso novo de lista frouxa fora de citação e de callout que a fatia F5 do ADR 002 acrescenta ao corpus". F3 (colar `html`) e F4 nomeadas juntas na seção 1 e na seção 8 do ADR.
3. **Lacuna declarada, sem prosa cobrindo.** ✔ `riscos_abertos` do contrato YAML (item novo, reescrito) e seção 8 "Negativas" registram: o adaptador grava `spread: false` incondicionalmente, o único caso que parecia contradizer isso passa por acidente de parser, e o corpus de 30 fixtures do ADR 002 não exercita a forma. Sem alegar que o MDXEditor "geralmente preserva" ou qualquer hedge equivalente.
4. **Consequências negativas completas.** ✔ Seção 8 do ADR já tinha os seis itens (dependência do Lexical, D-1, fatias F3/F4, D-2 26/27, notas de rodapé, dependências diretas). O item de F3/F4 foi reescrito com a causa nova, sem remover nenhum dos outros.
5. **Descarte do Plate e do Milkdown.** ✔ Já cumprido antes desta tarefa (seção 4 e seção 5/6 do ADR, verificado acima, sem mudança necessária).
6. **Demais critérios de T-0001.** ✔ Checklist de estilo rodado de novo depois das edições: `grep -n "—"` e busca de ponto e vírgula fora de bloco de código, ambos zero linhas. YAML revalidado com o pacote `yaml` (6 riscos, mesma contagem de outras seções). Nenhuma palavra sem acentuação introduzida pelas edições (checado com grep).

### Notas de execução

- A investigação usou o dev server do spike (porta 5311) e uma instrumentação temporária em `node_modules/mdast-util-to-markdown/lib/util/container-flow.js` (`console.log` na função `between`), revertida ao final e conferida por diff contra o conteúdo original. Nenhum arquivo do repositório (fora dos quatro entregáveis) ficou alterado.
- Um arquivo de diagnóstico temporário (`extra/zzdiag01-raiz-solta-simples.md`) foi criado para isolar a variável "raiz × citação" e apagado ao final. `extra/` ficou com os mesmos 12 casos de antes desta tarefa.
- O servidor de desenvolvimento temporário foi encerrado ao final da investigação.

### Pendências

- Nenhuma nova. A fatia F4 continua não implementada (é fatia de produto, fora do escopo de ADR), agora com critério de pronto mais preciso.

## Revisão do arquiteto

- **Veredito:** aceita com ressalva.
- **Motivo:** a caracterização entrega o que a tarefa pedia e muda o entendimento do defeito, em vez de confirmar a hipótese anterior. O achado de que `x08` passava por acidente do reparse (`prepareList` recalculando `list.spread` quando o fechamento acontece dentro de citação) mostra que a suíte de 12 casos media menos do que parecia: só um caso testava a forma, e testava errado. A estimativa de 1 a 1,5 dia continua de pé porque a causa raiz (`spread: false` incondicional nos visitors) já estava certa. A lacuna está no `riscos_abertos` sem hedge, e a fatia F4 ganhou critério de pronto com um caso novo fora de citação e de callout.
- **Ressalva:** `mdxeditor/RESULTADO.md`, item 2 da seção "Por que x08 passa e x05/x06 não", cita `mdast-util-to-markdown@9.0.0`. A versão instalada no spike é 2.1.2 (`node -p "require('./node_modules/mdast-util-to-markdown/package.json').version"`), e o contrato do ADR 002 no ledger fixa `^2.1.2`. O mesmo número errado está na seção "Resultado" desta tarefa. O arquivo e as linhas citados existem e a leitura do código está correta, então o defeito é só do número da versão. Corrigido em T-0004.
- **Tarefas derivadas:** T-0004.
