# Ficha: contêineres aninhados (pergunta 2, ADR 015)

Pesquisa sobre o suporte de `@xyflow/react` 12.11.6 (versão travada em `dok-draw-app/package.json`, `^12.11.6`) a nó dentro de nó, para decidir se AWS (aninhamento de até cinco níveis: região, VPC, zona de disponibilidade, sub-rede, grupo de segurança) e C4 (fronteira de sistema, um nível em volta de containers e components) usam o mesmo mecanismo de contêiner no contrato de conjunto de formas da pergunta 1.

## O que a versão instalada suporta

`@xyflow/react` 12 implementa hierarquia de nós por três propriedades, documentadas em [Sub Flows](https://reactflow.dev/learn/layouting/sub-flows):

- `parentId`: liga um nó a outro como filho. A doc registra a renomeação da versão anterior: "If you want to add a node as a child of another node you need to use the `parentId` (this was called `parentNode` in previous versions) option".
- `extent: 'parent'`: trava o filho dentro dos limites geométricos do pai. A doc: "we set the child extent to `'parent'` so that we can't move the child nodes out of the parent node."
- `type: 'group'`: node type sem handles, para representar o contêiner visual em si.

A doc de [referência de tipos de nó](https://reactflow.dev/api-reference/types/node) documenta uma quarta propriedade, `expandParent: boolean`, para o pai crescer sozinho quando o filho é arrastado até a borda dele.

A ordem do array de nós é uma regra do mecanismo, não um detalhe de implementação: "It's important that your parent nodes appear before their children in the `nodes`/`defaultNodes` array to get processed correctly." Arestas ligadas a nó com pai renderizam acima dos demais nós, ajustável por `zIndex`.

> [!WARNING]
> Lacuna: a documentação de Sub Flows não menciona nó neto (filho de filho) nem qualquer limite de profundidade. A página trata só de um nível de relação pai-filho. Dono: pergunta 2 deste ADR, que decide se o produto usa aninhamento além de um nível.

## Um mecanismo para os dois conjuntos, ou dois mecanismos

`parentId`, `extent: 'parent'` e `type: 'group'` não têm restrição de profundidade no código nem na doc: um nó pode ser filho de um nó que é filho de outro nó, repetindo a mesma propriedade em cada nível. Estruturalmente, o mesmo trio de propriedades cobre a fronteira única do C4 (um nível: containers e components dentro da fronteira de sistema) e o aninhamento de cinco níveis do AWS (região contém VPC contém zona de disponibilidade contém sub-rede contém grupo de segurança).

A diferença aparece no comportamento de redimensionamento automático do pai quando o filho é solto dentro dele, `expandParent`. A fronteira do C4 tem um nível de contêiner acima da folha, então o disparo de `expandParent` acontece sempre entre pai e filho direto. O AWS tem até quatro contêineres acima da folha (grupo de segurança dentro de sub-rede dentro de zona dentro de VPC dentro de região), e o redimensionamento automático dispara em cascata por avô, bisavô e assim por diante.

A issue [`expandParent doesn't work correctly in two level subflow` (#4500)](https://github.com/xyflow/xyflow/issues/4500), aberta em 2024-07-31 no repositório `xyflow/xyflow` e ainda `open` na consulta feita em 2026-09-21, via API do GitHub, descreve exatamente essa cascata. O corpo da issue: "Top level group node doesn't update its size if move grandchild." Os passos de reprodução: "Drag 'child node 1' outside of its grandparent [...] Check grandparent size (bug) [...] Drag parent node, grandparent size is updated." O comportamento esperado, segundo quem relatou: "After dragging the node all parents size should be updated." O comentário mais recente, de `moklick` (mantenedor do xyflow) em 2026-07-08, trata a propriedade como instável a ponto de troca: "`expandParent` will probably be deprecated and replaced by something like `autoResize`. But it's TBD." A versão 12.11.6, instalada no app, foi publicada em 2026-09-01 segundo o registro do pacote no npm, depois desse comentário, sem correção registrada na issue.

Esse é o ponto em que o mesmo mecanismo de nó-pai não serve igualmente aos dois conjuntos para redimensionar. `parentId` e `extent: 'parent'` bastam para desenhar e restringir a geometria dos dois. `expandParent`, a parte que poupa o produto de recalcular manualmente o tamanho do contêiner, funciona no caso de um nível do C4 e é instável, sem previsão de correção, no caso de quatro níveis de contêiner acima da folha do AWS.

O drag através de fronteira aninhada, mover um grupo de segurança de uma sub-rede para outra, também depende de profundidade. React Flow 12 não reatribui pai por conta própria ao soltar um nó dentro de outro. O padrão do próprio framework para decidir o novo pai é calcular interseção geométrica no fim do drag e escrever o `parentId` resultante. A função que calcula essa interseção teve bug documentado especificamente em nó com três níveis de aninhamento: a issue [`getIntersectingNodes` does not work for nodes with a depth of 2 or more (#4781)](https://github.com/xyflow/xyflow/issues/4781), aberta em 2024-11-04, relatava erro na soma de posições absolutas em `evaluateAbsolutePosition` para nó de profundidade dois ou mais. Foi corrigida pela pull request [#4782](https://github.com/xyflow/xyflow/pull/4782), mesclada em 2024-11-08, quatro dias depois da abertura. A correção existe na versão instalada, publicada em 2026-09-01, quase dois anos depois. Fica como evidência de que o cálculo de posição por profundidade já teve bug específico de três níveis ou mais, o mesmo tipo de estrutura do AWS, na mesma família de código que sustenta tanto o redimensionamento (`expandParent`, ainda aberto em #4500) quanto o reparentamento por interseção (`getIntersectingNodes`, corrigido em #4781/#4782).

## Limites e riscos conhecidos de aninhamento profundo

- **Redimensionamento em cascata (`expandParent`)**: issue #4500, aberta, sem correção prevista na versão instalada. Afeta AWS a partir do segundo nível de contêiner acima da folha (avô), não afeta C4.
- **Reparentamento por interseção (`getIntersectingNodes`)**: bug corrigido em profundidade dois ou mais (#4781, #4782), presente na versão instalada só como correção, não como funcionalidade nova. Indica que a mesma classe de cálculo, posição absoluta por profundidade, já falhou uma vez na estrutura que o AWS precisa.
- **Limite documentado de profundidade**: nenhum. A doc de Sub Flows não declara teto de níveis nem recomendação de profundidade máxima. Ausência de limite documentado não é garantia de suporte, é lacuna.

> [!WARNING]
> Lacuna: não há medição própria de desempenho do DokDraw com cinco níveis de nó-pai. As issues citadas são evidência de bug funcional, não de degradação de frame rate. Dono: spike da fatia que implementar o conjunto de formas AWS, antes de aceitar cinco níveis como número final.

## Recomendação

O contrato de conjunto de formas (pergunta 1) declara um mecanismo de contêiner genérico único, construído sobre `parentId` e `extent: 'parent'` do `@xyflow/react`, usado tanto pelo conjunto C4 quanto pelo conjunto AWS. Uma forma que é contêiner entra no contrato com uma propriedade booleana ou de tipo (`isContainer`, por exemplo) que qualquer conjunto pode marcar, sem código específico de C4 ou de AWS no núcleo do editor.

O redimensionamento automático do contêiner quando um filho é solto dentro dele não usa `expandParent`. Filho de forma contêiner não recebe `extent: 'parent'`: travar o filho dentro dos limites atuais do pai impede a caixa delimitadora dos filhos de ultrapassar o pai, e é exatamente essa ultrapassagem que dispara o crescimento. O produto calcula o novo tamanho do contêiner a partir da caixa delimitadora real dos filhos no momento em que o drag termina (`onNodeDragStop` ou equivalente) e aplica esse tamanho a todos os ancestrais afetados, do pai direto até a raiz. A mesma rotina decide o novo `parentId` por interseção geométrica, sem depender de `getIntersectingNodes` da biblioteca no caso de profundidade maior que um, já que #4781 mostra essa função historicamente frágil na mesma faixa de profundidade. Essa rotina é única, reaproveitada pelos dois conjuntos, e substitui a propriedade e a função da biblioteca justamente na parte que as issues #4500 e #4781 mostram instável ou historicamente frágil em profundidade.

## Alternativa descartada

Dois mecanismos de contêiner, um mecanismo simples para a fronteira única do C4 usando `expandParent` da biblioteca, e um mecanismo próprio, calculado pelo produto, só para o aninhamento profundo do AWS. Descartada porque duplica a lógica de drag, seleção em grupo e persistência de posição para dois caminhos de código que fazem a mesma coisa em profundidades diferentes, e porque o contrato de conjunto de formas da pergunta 1 exige que forma nova entre sem mexer no núcleo do editor. Um conjunto futuro com dois ou três níveis de contêiner, entre o caso do C4 e o do AWS, obrigaria a escolher entre os dois caminhos sem critério objetivo.

## Custo aceito

A recomendação abre mão do redimensionamento automático pronto da biblioteca (`expandParent`) e da restrição de movimento pronta (`extent: 'parent'` no filho de contêiner) mesmo para o caso de um nível do C4, onde as duas funcionam, para manter um único caminho de código. O produto passa a manter e testar sua própria rotina de recálculo de tamanho de contêiner e de reatribuição de `parentId`, incluindo o caso de cascata por múltiplos ancestrais que a biblioteca ainda não resolve. Esse custo recai sobre a fatia que implementa o conjunto AWS, que é quem primeiro precisa da cascata de mais de um nível.
