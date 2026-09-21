# Ficha de inventário: DEC-0026, tipo 1 (Modelo C4)

Levantamento do tipo 1 da tabela de `decisoes/DEC-0026-os-24-tipos-de-diagrama.md`: "Modelo C4 (contexto, contêineres, componentes e código), situação: Previsto, menos o nível de código, que o editor não tem". A ficha confere contexto, contêineres e componentes contra o código real do app `dok-draw-app` e detalha a lacuna do nível de código.

## 1. Notação de referência

c4model.com, de Simon Brown, página de notação: [c4model.com/diagrams/notation](https://c4model.com/diagrams/notation), consultada em 2026-09-21. A página de nível 4 usada na seção 3 é [c4model.com/diagrams/code](https://c4model.com/diagrams/code), mesma data de consulta.

A notação oficial do C4 model cobre quatro tipos de elemento nos três primeiros níveis: Person, Software System, Container e Component, com o tipo de cada elemento sempre explícito no diagrama. A página de notação não define forma fixa por tipo (cor e forma exata ficam a critério de quem desenha), mas os exemplos do site usam retângulo para Software System, Container e Component, e um ícone de pessoa para Person.

## 2. Formas do modelo C4 já no editor

O domínio do editor está em `dok-draw-app/src/domain/c4/types.ts` e `dok-draw-app/src/domain/c4/catalog.ts`. `C4_ELEMENT_TYPES` (`types.ts`, linhas 9 a 25) lista quinze tipos de elemento, cada um com nível permitido e forma associada em `ELEMENT_TYPE_META` (`catalog.ts`, linhas 30 a 190). As formas renderizam em `dok-draw-app/src/components/editor/element-shape.tsx`.

| Elemento C4 | Representa | Primitiva do editor | Onde no código |
| --- | --- | --- | --- |
| `person` | Pessoa / Ator (interno) | `person` | `catalog.ts:31-40`, desenho em `element-shape.tsx:97-115` (círculo de cabeça mais retângulo de corpo) |
| `external_person` | Pessoa externa | `person` (mesma primitiva, cor `--c4-external`) | `catalog.ts:41-50` |
| `system` | Sistema de software (nível contexto) | `box`, sem caso próprio em `renderShape`, cai no retângulo padrão | `catalog.ts:51-60`, fallback em `element-shape.tsx:258` |
| `external_system` | Sistema de software externo | `box`, mesmo fallback de retângulo | `catalog.ts:61-70` |
| `container` | Contêiner genérico | `box`, mesmo fallback de retângulo, tecnologia padrão "Serviço" | `catalog.ts:71-81` |
| `microservice` | Contêiner do tipo microsserviço | `hexagon` | `catalog.ts:82-92`, desenho em `element-shape.tsx:155-163` |
| `browser` | Contêiner do tipo navegador web | `browser` | `catalog.ts:93-103`, desenho em `element-shape.tsx:165-188` (barra de endereço mais tela) |
| `spa` | Contêiner do tipo aplicação single-page | `browser` (mesma primitiva de `browser`) | `catalog.ts:147-157` |
| `terminal` | Contêiner do tipo aplicação server-side | `terminal` | `catalog.ts:136-146`, desenho em `element-shape.tsx:190-207` (prompt `>_`) |
| `component` | Componente (nível componente) | `box`, mesmo fallback de retângulo | `catalog.ts:104-113` |
| `store` | Banco de dados | `cylinder` | `catalog.ts:114-124`, desenho em `element-shape.tsx:117-134` |
| `queue` | Fila / mensageria | `pipe` | `catalog.ts:125-135`, desenho em `element-shape.tsx:136-153` |
| `bucket` | Bucket de objetos | `bucket` | `catalog.ts:158-168`, desenho em `element-shape.tsx:209-231` |
| `folder` | Diretório / pasta | `folder` | `catalog.ts:169-179`, desenho em `element-shape.tsx:233-256` |
| `group` | Grupo / limite (fronteira de sistema, boundary) | `boundary` | `catalog.ts:180-189`, desenho em `element-shape.tsx:82-95` (retângulo tracejado sem preenchimento) |

Nove dos quinze tipos ficam fora dos quatro elementos centrais do c4model.com (`microservice`, `browser`, `spa`, `terminal`, `store`, `queue`, `bucket`, `folder`, `group`). São variações de tecnologia do Container e do Component, no mesmo padrão de extensão que o draw.io usa para o kit C4 (cilindro para banco de dados, hexágono para serviço, navegador e terminal para tipo de runtime). A notação de referência não proíbe a extensão, porque não fixa forma por tipo, e a DEC-0026 já registra o item 1 como previsto para os três primeiros níveis.

`ELEMENT_TYPE_META` também restringe o nível em que cada tipo aparece (campo `levels`, `catalog.ts:39,49,59,69,79,90,101,112,122,133,144,155,166,177,188`): `person`, `external_person` e `group` valem nos três níveis, `system` só no nível contexto, `container` só no nível contêiner, `component` só no nível componente, e os demais tipos de contêiner valem em contêiner e componente. `groupsForLevel` (`catalog.ts:223-229`) filtra a paleta lateral por esse campo, e `childLevelOf` (`catalog.ts:232-244`) decide para qual nível filho um clique duplo em `system`, `container`, `microservice`, `browser`, `spa` ou `terminal` navega.

## 3. O que falta para o nível de código (nível 4)

> [!WARNING]
> Lacuna: o editor não tem nenhuma primitiva, tipo de elemento ou campo de domínio para o nível de código do C4. Dono: sessão B, no ADR 015.

A busca por `uml`, `class-shape`, `classDiagram` e `umlClass` em `dok-draw-app/src` não retorna nenhum resultado. `C4_LEVELS` (`types.ts:6`) para em `"component"`, sem um quarto nível. `C4Element` (`types.ts:112-124`) tem `name`, `description`, `technology`, `tags`, `color`, `external` e `style`, sem campo de atributo, método, visibilidade ou compartimento, que uma forma de classe UML exige. A ausência é total, não parcial.

A página de nível 4 do c4model.com (seção 1) não define notação própria do C4 para esse nível. O texto diz que a pessoa "zooms in to a component to show how it is implemented as code, using UML class diagrams, entity relationship diagrams or similar", que o diagrama deve mostrar "only those attributes and methods that allow you to tell the story that you want to tell", e que o nível "is not recommended for anything but the most important or complex components". O C4 model delega a forma do nível 4 a uma notação externa e marca esse nível como opcional mesmo quando as outras três são usadas.

**Recomendação:** o nível de código do C4 não pede forma própria. Ele reaproveita as formas de classe UML do tipo 2 da mesma DEC-0026 ("Classes", situação "Previsto (UML)"), levantadas em ficha separada desta mesma tarefa de inventário. A dependência é da forma de classe (compartimentos de atributo e método), não do conteúdo daquela ficha, que esta ficha não antecipa. Falta ainda, e fora do escopo de forma: um campo de domínio em `C4Element` ou um tipo de elemento novo para guardar atributos e métodos, e a extensão de `C4_LEVELS` para um quarto nível `"code"` com sua própria paleta e regra de navegação, que é decisão de ADR, não de inventário de forma.

**Alternativa descartada:** desenhar uma primitiva de classe exclusiva do domínio C4, sem reaproveitar a forma UML. Descartada porque duplicaria a mesma forma (compartimentos de nome, atributos e métodos) em dois domínios do editor, contra a evidência de que o próprio c4model.com aponta para UML como a notação do nível 4, não para uma notação própria do C4.
