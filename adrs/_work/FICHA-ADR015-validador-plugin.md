# Ficha: contrato do validador de diagrama como plugin

Ficha de pesquisa para a pergunta 4 do `PROMPT-ADR-015.md`: o que um validador de diagrama recebe e devolve, no molde do `DOK-E`/`DOK-W` do ADR 002, e como um diagrama declara que segue uma notação para ser validado contra ela.

Fonte: `adrs/ADR-002-formato-de-conteudo.md` (Apêndice A.4, A.7, A.8 e o bloco `interfaces_publicadas` do contrato YAML), `decisoes/DEC-0021-a-aba-e-quadro-livre-e-o-c4-vira-shape.md`, `adrs/_work/ADR-015-escopo.md` seção 2 e 6.1, `adrs/LEDGER.md` seção ADR 001.

## 1. O contrato exato de `DOK-E`/`DOK-W` no ADR 002

O ADR 002 publica `validateDok` como uma das quatro funções de `src/content-format` (`parseDok`, `serializeDok`, `normalizeDok`, `validateDok`), listadas no bloco `interfaces_publicadas` do contrato YAML. `parseDok` lê texto e devolve `DokAST` (mdast restrito). `normalizeDok` é idempotente e é o texto que o save grava. `validateDok` devolve `Diagnostic[]`.

O tipo publicado, no Apêndice A.4:

```ts
export type Diagnostic = { code: `DOK-${'E' | 'W'}${number}`; message: string; line?: number }
```

Pontos do desenho que importam para o molde:

A severidade mora no próprio código, não num campo separado. Não existe `severity: 'error' | 'warning'` ao lado de `code`. O prefixo `E` ou `W` do código já diz se o diagnóstico bloqueia. São dois níveis, sem terceiro nível de "info".

A posição é `line`, opcional, porque nem todo diagnóstico aponta uma linha (frontmatter ausente, por exemplo, aponta o documento inteiro).

O Apêndice A.7 enumera cada código com nível e significado, de `DOK-E001` a `DOK-E010` e `DOK-W101` a `DOK-W106`. A tabela é o registro fechado dos diagnósticos possíveis, análoga ao registro fechado de directives da seção 5.

A restrição `Todo save passa por normalizeDok + validateDok no servidor; qualquer DOK-E bloqueia` (contrato YAML, `restricoes_impostas`) liga o validador ao caminho de escrita. `DOK-E` impede a gravação. `DOK-W` não impede, só relata. A fatia F4 confirma o mesmo: "server function que normaliza, valida, bloqueia em `DOK-E` e devolve o texto canônico".

> [!WARNING]
> Lacuna: o ADR 002 não escreve o parâmetro de `validateDok`. O texto publica só a existência da função e o que ela devolve (`Diagnostic[]`). O tipo com assinatura completa existe para `extractText(ast)` e para `migrateDok`, `(ast: DokAST) => DokAST`, ambos sobre AST, nunca sobre texto cru. A leitura de que `validateDok` também recebe `DokAST` é inferência por analogia com essas duas funções e com o pipeline de save (parse, depois normaliza, depois valida), não fato escrito no ADR 002. A proposta da seção 2 assume essa forma por analogia. `DOK-E010` ("Referência não normalizada, só aparece se alguém validar sem normalizar") é evidência de que `validateDok` é chamável fora do caminho de save, sobre entrada não normalizada, o que sustenta a recomendação da seção 4 de um validador de diagrama também chamável fora do caminho de escrita.

## 2. Proposta de contrato equivalente para um validador de diagrama

### O que entra

Um validador de diagrama não deveria receber o estado bruto do canvas (posição de nó, zoom, seleção). O paralelo correto ao `DokAST` de `validateDok(ast)` é a estrutura semântica do desenho, sem geometria: a lista de elementos com `id`, `type`, `parentId` e atributos, e a lista de relacionamentos com origem, destino e tipo. `x`, `y`, `width`, `height`, `zIndex` ficam de fora, do mesmo jeito que `DokAST` descarta formatação e mantém estrutura e conteúdo.

Isso exige um segundo argumento que `validateDok` não precisa: a definição da notação contra a qual o desenho é checado. `validateDok` não recebe o registro de directives como parâmetro porque esse registro é fechado e mora dentro de `src/content-format`. O registro de formas do Diagram Studio é dado, não código fixo (`adrs/_work/ADR-015-escopo.md`, seção 2: "o registro de formas já está separado do motor"). O `LEDGER.md`, na seção do ADR 001, registra a mesma restrição: "o registry de formas (ShapeDef) é independente do motor". Um validador de notação, portanto, precisa da definição da notação como entrada, não embutida.

Dois tipos de metadado alimentam essa definição, e moram em lugares diferentes. Atributo por elemento (`technology`, `description`, o tipo escolhido) vem do desenho, preenchido por quem desenha. Regra por tipo (em que nível o tipo aparece, que contenção é permitida, que relação é válida entre dois tipos) vem do conjunto de formas, papel que `ELEMENT_TYPE_META` já cumpre hoje para renderização (`adrs/_work/ADR-015-escopo.md`, seção 2). O validador cruza os dois: lê o atributo que o desenho carrega e checa contra a regra que o tipo, no conjunto declarado, impõe.

Duas formas de passar essa definição:

Como parâmetro de uma função genérica: `validateDiagram(diagram: DiagramModel, shapeSet: ShapeSetDef) => Diagnostic[]`.

Como função já fechada sobre a notação, produzida por um registro de plugins: `getValidator('c4'): (diagram: DiagramModel) => Diagnostic[]`, onde `getValidator` devolve `undefined` para uma notação sem validador.

A segunda forma encaixa melhor na palavra que a `DEC-0021` usa ("plugins validadores de diagramas"). Um plugin de notação publica sua própria função de validação, do mesmo jeito que hoje um conjunto de formas publica sua lista de tipos. `DiagramModel` continua sendo o parâmetro de dado, mas a notação já está fechada dentro da função que o registro devolve, e não passa a cada chamada. O prefixo do código de diagnóstico (seção seguinte) mora nesse mesmo registro, junto do id da notação, não é convenção deixada a cargo de quem escreve o plugin.

### O que sai

`Diagnostic[]`, no mesmo molde de dois níveis do `DOK-E`/`DOK-W`: severidade no prefixo do código, sem terceiro nível.

```ts
export type DiagramDiagnostic = {
  code: `${string}-${'E' | 'W'}${number}`
  message: string
  elementId?: string
  relationshipId?: string
}
```

`line` não faz sentido num diagrama. O paralelo funcional de "onde apontar" é `elementId` ou `relationshipId`, porque um diagnóstico de notação quase sempre nasce de uma forma ou de uma ligação específica, não do desenho inteiro. Os dois campos ficam opcionais pela mesma razão que `line` é opcional em `Diagnostic`: nem todo diagnóstico aponta uma peça (uma notação pode exigir um elemento raiz ausente, por exemplo, e aí nenhum `elementId` existe para apontar).

O prefixo do código não é fixo como `DOK`. Cada plugin de notação nomeia o próprio prefixo (`C4-E001`, `C4-W002`). A razão está na seção 4.

## 3. Como um diagrama declara a notação, e o que acontece com forma fora do conjunto

### Onde a declaração mora

A `DEC-0021` já formula a pergunta como algo que o desenho carrega, não o conjunto de formas: "o que o banco guarda de um desenho livre, e o que guarda de um desenho que declara seguir uma notação" (seção "O que o ADR 015 passa a ter de decidir"). A declaração é atributo do diagrama, não do conjunto de formas.

Um conjunto de formas (`ShapeSetDef`) publica, no máximo, se tem ou não um validador registrado. `getValidator` devolve `undefined` para um conjunto sem regra publicada. A `adrs/_work/ADR-015-escopo.md` separa o problema 1 (registro de notação com gramática, exemplo C4) do problema 2 (biblioteca de ícones, exemplo AWS), e a distinção do escopo é sobre pipeline de asset contra modelagem, não sobre ausência de regra estrutural. A pergunta 2 do prompt do ADR 015 já assume que AWS tem gramática de contenção: "diagramas AWS dependem de agrupamento aninhado: região, VPC, zona de disponibilidade, sub-rede, grupo de segurança". Essa é exatamente a forma de regra que um validador checa. Se o conjunto AWS publica ou não um validador de contenção é decisão do ADR 015, ligada à resposta da pergunta 2 sobre contêineres, não uma consequência automática de AWS ser biblioteca de ícones.

Para um diagrama declarar que segue C4, o campo fica no diagrama (proposta: uma coluna ou atributo em `views`, análoga ao `level` de hoje, mas nomeada pela notação em vez de pelo nível C4 isolado), com valor nulo por padrão. Diagrama sem essa declaração é quadro livre sem checagem, exatamente a leitura que a `DEC-0021` estabelece como base.

### O que acontece com uma forma fora do conjunto declarado

A `ADR-015-escopo.md`, seção 6.1, já registra que misturar famílias é permitido: "um diagrama C4 pode conter ícone da AWS, um fluxograma pode conter forma de UML, e nada no produto impede". Um validador que recusasse qualquer forma fora do conjunto declarado contradiria essa decisão.

A saída proposta trata forma fora do conjunto declarado como aviso, nunca como erro bloqueante: `C4-W0xx`, "elemento usa tipo do conjunto AWS, fora da notação C4 declarada por este diagrama". Erro bloqueante (`C4-E0xx`) fica reservado para violação da gramática interna do próprio C4 sobre elementos que pertencem ao conjunto C4: por exemplo, uma relação entre dois elementos de nível incompatível, ou um elemento C4 sem o atributo que a notação exige.

> [!WARNING]
> Lacuna: se um diagrama pode trocar a notação declarada depois de já desenhado, e o que acontece com os diagnósticos anteriores nesse caso, não foi pesquisado nesta ficha. A `DEC-0021` lista essa pergunta separadamente ("se um diagrama pode trocar de notação depois de desenhado") e ela cabe na pergunta 6 do prompt (versionamento), não na 4. Dono: sessão B, ao escrever a seção de versionamento do ADR 015.

## 4. Recomendação de contrato

```ts
type ShapeValidator = (diagram: DiagramModel) => DiagramDiagnostic[]

function getValidator(notationId: string): ShapeValidator | undefined

type DiagramModel = {
  elements: { id: string; type: string; parentId?: string; attributes: Record<string, unknown> }[]
  relationships: { id: string; sourceId: string; targetId: string; type: string }[]
}
```

`DiagramModel` não carrega geometria (`x`, `y`, `width`, `height`, `zIndex`), pelo mesmo motivo que `DokAST` não carrega formatação de fonte ou cor: o validador checa estrutura e semântica, não desenho na tela. Atributo por elemento (`attributes`) vem do que a pessoa preencheu na forma. Regra por tipo (nível, contenção, relação válida) fica dentro do registro que `getValidator` fecha, análoga ao papel que `ELEMENT_TYPE_META` cumpre hoje para renderização.

`DiagramDiagnostic`, dois níveis de severidade no prefixo do código, como em `Diagnostic`, com o prefixo declarado junto do id da notação no mesmo registro que expõe `getValidator`, não deixado a critério de cada plugin.

Declaração de notação como atributo do diagrama (`views` ou equivalente), nulo por padrão. Conjunto de formas publica um validador ou não, e a decisão de se AWS publica um (para a gramática de contenção da pergunta 2) fica para o corpo do ADR, não para esta ficha.

Forma fora do conjunto declarado gera aviso (`W`), nunca erro bloqueante. Erro bloqueante fica restrito à gramática interna da notação sobre elementos que pertencem a ela.

## 5. Alternativa descartada

Replicar o gate de `validateDok`: validação obrigatória e bloqueante a cada gravação do diagrama, com um único registro central de códigos (`DIA-E`/`DIA-W`) compartilhado entre notações, do mesmo jeito que `DOK-E`/`DOK-W` é um registro fechado único para todo o DokMD.

Descartada. A `DEC-0021` inverte exatamente essa relação para diagramas: "ou a estrutura manda no desenho, ou o desenho é livre e a estrutura é uma leitura opcional em cima dele. Esta decisão escolhe a segunda." Um gate obrigatório de save reintroduziria a estrutura mandando no desenho, o oposto do que a decisão pede. Um registro central único de códigos também pressupõe um conjunto fechado de notações conhecido de antemão, o que contradiz o modelo de plugin da própria `DEC-0021`, em que uma notação nova entra sem mexer no núcleo.

## 6. Custo aceito da recomendação

Um diagrama declarado como C4 pode ser salvo em estado inválido contra a própria notação, e ficar assim até alguém rodar o validador manualmente ou a interface expor o resultado. Diferente do DokMD, em que `DOK-E` impede a gravação no servidor, aqui a validação sai do caminho de escrita.

Se o corpo do ADR decidir que o conjunto AWS não publica validador (a gramática de contenção da pergunta 2 vira só regra de canvas, não regra checada por plugin), um diagrama que usa formas AWS fica sem checagem de correção além de a forma existir no registro. Essa decisão não é consequência automática do contrato desta ficha, é escolha em aberto que o corpo do ADR precisa registrar com o motivo.

Mistura de família dentro de um diagrama com notação declarada nunca vira erro, só aviso, mesmo quando a mistura é acidental. Um diagrama pensado como C4 puro, mas com uma forma AWS solta por engano, passa no validador com aviso, não com bloqueio.
