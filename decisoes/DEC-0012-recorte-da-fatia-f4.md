# DEC-0012: a fatia F4 entrega o pipeline sem a gravação

**Data:** 2026-09-20
**Quem decidiu:** sessão A, por delegação
**Alcance:** recorte da última fatia da sprint 1, sem mudar contrato

## O achado

A fatia F4 do ADR 002 tem a descrição e o critério de pronto discordando entre si.

| Onde | O que diz |
| :--- | :--- |
| Descrição | "Save pipeline: server function que normaliza, valida, bloqueia em `DOK-E` e **devolve o texto canônico**" |
| Critério de pronto | "Salvar texto com HTML retorna erro com linha; salvar texto válido **grava** exatamente `normalizeDok(x)`; round-trip de uma página salva duas vezes gera diff vazio" |
| Depende de | "F1, F2" |

A descrição termina em devolver. O critério exige gravar. Gravar onde é `page_revisions.content_dokmd`, tabela que o ADR 003 cria e que **não existe no app**: não há schema `content`, não há `src/content-store`, e nenhuma fatia do ADR 003 foi executada.

A coluna de dependências também está incompleta: F1 e F2 não bastam para o que o critério exige.

## A decisão

A fatia F4 entrega **o pipeline, não a gravação**.

O que ela faz: uma server function que recebe texto, roda `normalizeDok`, roda `validateDok`, recusa com a lista de diagnósticos quando houver qualquer `DOK-E`, e devolve o texto canônico quando não houver. É exatamente o que a descrição da fatia diz.

O que ela não faz: escrever em tabela nenhuma. A gravação passa a pertencer à fatia do ADR 003 que expõe `src/content-store/server.ts`, que é onde `saveDraft` e `submitRevision` moram e onde a restrição do ledger ("toda gravação em `content_dokmd` passa por `validateDok`") de fato se cumpre.

## Por que não esperar o ADR 003

Adiar a F4 até a sprint 2 deixaria a sprint 1 fechando com uma fatia pendente por dependência que ninguém tinha declarado, e o pipeline é o que dá sentido às três fatias anteriores: sem ele, `normalizeDok` e `validateDok` existem e ninguém os chama em conjunto no caminho real.

Dois dos três itens do critério são verificáveis sem gravação nenhuma:

- texto com HTML cru volta com erro e com a linha;
- texto válido volta exatamente igual a `normalizeDok(x)`;
- rodar o pipeline sobre a própria saída devolve saída idêntica, que é o round-trip de diff vazio sem precisar de duas gravações.

O terceiro item, "grava exatamente", é o único que exige tabela, e é o que migra.

## O que isso muda no contrato

Nada. As duas restrições do ledger que tocam o assunto continuam como estão:

- "Todo save passa por `normalizeDok` + `validateDok` no servidor; qualquer `DOK-E` bloqueia."
- "Toda gravação em `content_dokmd` passa por `validateDok`, que recusa com `DOK-E011` texto canônico acima de 300.000 bytes UTF-8, antes de qualquer outra checagem."

A primeira é cumprida pela F4. A segunda passa a ser cumprida pela fatia do ADR 003 que grava, e entra na tabela de restrições **daquela** ordem, não desta.

O arquivo do ADR 002 não é reescrito. A seção 11 continua registrando o que foi decidido em 2026-09-18, e esta decisão registra o recorte de 2026-09-20, pelo mesmo princípio que o `LEDGER.md` declara sobre divergência entre ledger e ADR.

## Onde a fatia mora

A server function não vive em `src/content-format`. O módulo é puro, sem DOM e sem builtin de Node, e uma server function é camada de aplicação. Ela vive junto das outras do app, no padrão que `src/application/diagram.functions.ts` já estabelece, e importa o módulo.

Consequência prática: a restrição de ambiente do módulo não se aplica ao arquivo da fatia F4, e a tabela de restrições da ordem precisa dizer isso, em vez de citar uma restrição que não alcança o arquivo.

## Custo aceito

A sprint 1 fecha sem nenhuma página gravada em lugar nenhum, o que já era verdade: gravar depende de tabela que pertence à sprint 2. O que muda é que isso passa a estar escrito, em vez de aparecer como surpresa quando a fatia fosse executada.

## Gatilho de revisão

Se a fatia do ADR 003 que grava não trouxer a restrição `DOK-E011` na tabela de restrições dela, esta decisão terá produzido uma lacuna em vez de uma migração. A conferência acontece na revisão daquela ordem.
