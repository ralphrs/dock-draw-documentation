# ADR 002 — Bibliotecas da Wiki: editor, leitura e navegação

| Campo | Valor |
| --- | --- |
| Status | Proposto — decisão do editor condicionada ao spike S1 |
| Data | 2026-09-18 |
| Relaciona | ADR 001 (motor de diagrama) e seu anexo de requisitos |
| Decide | Quais bibliotecas ou frameworks fazem a Wiki do DokDraw: o **editor de páginas**, a **renderização de leitura** e a **navegação**. Considera o Starlight e as alternativas |
| Não decide | Armazenamento, exportação e sincronização. Cada um vai para ADR próprio |

## Decisão

1. **Editor de páginas: MDXEditor**, com **Plate** como alternativa. A escolha final sai do spike S1, que roda as mesmas fixtures nas duas bibliotecas.
2. **Leitura: renderer próprio sobre `unified`/`remark`**, consumindo o mesmo mdast que o editor produz.
3. **Navegação** (sidebar, TOC, busca): própria. O `fumadocs-core` fica como plano B.
4. **Nenhum framework de documentação é adotado**, e isso inclui o Starlight. Nenhum deles tem editor, e nenhum roda como biblioteca dentro do app. O dialeto do Starlight (frontmatter + `:::note/:::tip/:::caution`) continua sendo o formato de autoria.

> [!NOTE]
> A decisão exige dependências novas: o editor escolhido e `unified`/`remark-*`. É a mesma exceção documentada do ADR 001, e o build real passa a ser pré-condição.

---

## O que mais importa, em ordem

A primeira versão deste ADR comparava frameworks de documentação. Faltava o principal: **uma wiki é uma ferramenta de escrita**. O leitor só vê o que alguém conseguiu escrever bem. Por isso os critérios estão ordenados por peso, e o editor pesa mais que tudo.

| Prioridade | Grupo | Peso | Por quê |
| --- | --- | --- | --- |
| **P1** | **Editor**: fidelidade ao Markdown/MDX e inserção de elementos | 40% | É onde o usuário passa o tempo. Se o editor corrompe o Markdown ou não sabe inserir um callout, um componente ou um diagrama, nada mais importa |
| **P2** | **Editor**: formatação, links e ergonomia | 20% | É o que diferencia "editor completo" de "textarea com preview" |
| **P3** | **Integração com a stack** | 20% | React 19, TanStack Start SSR, Radix/shadcn, Tailwind v4, cores só por token |
| **P4** | **Leitura e navegação** | 10% | Sidebar, TOC e busca. É importante, mas é o trecho mais fácil de construir |
| **P5** | **Sustentabilidade** | 10% | Licença, manutenção, número de mantenedores, caminho para colaboração em tempo real |

Licença não permissiva e "não roda dentro de um app React" continuam eliminatórios, independentemente do peso.

---

## Critérios

Escala do anexo ao ADR 001: **N** Nativo · **P** Plugin oficial · **C** Código próprio · **X** Contra a arquitetura · **?** Verificar no spike · **—** Não avaliado (já eliminada).

### P1 — Fidelidade e inserção de elementos (40%)

| # | Requisito | Como verificar |
| --- | --- | --- |
| E-01 | **Markdown é o formato de entrada e saída**, não um JSON proprietário convertido com perdas | Abrir 30 fixtures, salvar sem editar e comparar: `out === in` |
| E-02 | **Callouts no dialeto Starlight** (`:::note`, `:::tip`, `:::caution`, `:::danger`), com inserção e troca de tipo pela UI | Inserir pela toolbar e conferir o Markdown gerado |
| E-03 | **Componentes MDX** (`<Tabs>`, `<Card>`, `<Steps>`…) inseridos por menu, com **formulário de props**, sem executar código | Inserir um componente, editar uma prop e conferir que `{expressão}`, `import` e `export` são rejeitados |
| E-04 | **Nó customizado de diagrama** do Studio, com preview do SVG dentro do editor | Registrar um nó próprio que abre o seletor de diagrama e serializa de volta |
| E-05 | Tabelas, imagens, blocos de código com linguagem e destaque, frontmatter editável | Um documento de fixture com os quatro |

### P2 — Formatação, links e ergonomia (20%)

| # | Requisito | Como verificar |
| --- | --- | --- |
| E-06 | Formatação completa: títulos, negrito, itálico, tachado, código inline, citação, listas (inclusive tarefas), separador | Toolbar e atalhos cobrem tudo |
| E-07 | **Links**: diálogo de inserir/editar, **autocomplete de páginas internas**, abrir, remover | Digitar parte do título de uma página e receber sugestão |
| E-08 | Atalhos Markdown ao digitar (`## `, `- `, `` ``` ``) e colar Markdown/HTML convertendo corretamente | Colar um trecho do GitHub e um do Google Docs |
| E-09 | **Slash menu** (`/`) para inserir blocos | Existe nativamente? |
| E-10 | **Alternar para modo fonte** (e diff), para quem prefere escrever o Markdown cru | Editar no modo fonte e voltar sem perda |
| E-11 | Undo/redo, teclado e acessibilidade básica | Navegar e formatar sem mouse |

### P3 — Integração com a stack (20%)

| # | Requisito | Como verificar |
| --- | --- | --- |
| E-12 | React 19, sem `peerDependencies` travada numa versão anterior | `package.json` publicado e issues abertas |
| E-13 | Convive com o SSR do TanStack Start: renderiza no servidor ou é isolável em import só-cliente | Rota com `lazy` sem erro de hidratação |
| E-14 | **Estilo por token CSS**, sem inline obrigatório e sem briga com Tailwind v4 | Trocar as cores do editor só por CSS var, em `.theme-dark` e `.theme-light` |
| E-15 | UI compatível com **Radix/shadcn** (popovers, diálogos) | Menus do editor e do app abertos juntos, sem conflito de foco |
| E-16 | Compartilha o **mdast** com o pipeline de leitura | O editor exporta ou consome mdast/remark? |

### P4 — Leitura e navegação (10%)

| # | Requisito |
| --- | --- |
| L-01 | Renderização em runtime, no app, de conteúdo que muda a cada edição |
| L-02 | Nenhum conteúdo do usuário é compilado ou avaliado como código |
| L-03 | Árvore de páginas, TOC por headings, busca |
| L-04 | Wikilinks e backlinks calculáveis a partir do AST |

### P5 — Sustentabilidade (10%)

| # | Requisito |
| --- | --- |
| S-01 | Licença permissiva (MIT/Apache-2) — **eliminatório** |
| S-02 | Release nos últimos 6 meses, changelog legível |
| S-03 | Mais de um mantenedor ativo, ou empresa por trás |
| S-04 | Caminho para colaboração em tempo real (Yjs) — desejável, não é requisito agora |

---

## Candidatas

Versões conferidas em setembro de 2026.

**Editores** (o grupo que decide):

| Candidata | Base | Licença | Modelo interno |
| --- | --- | --- | --- |
| **MDXEditor** | Lexical + mdast; UI com Radix | MIT | Markdown ↔ Lexical via mdast (visitors de import/export) |
| **Plate** | Slate; UI no padrão shadcn (componentes copiados para o repositório) | MIT (Plate Plus, com templates, é pago) | JSON do Slate ↔ Markdown via `@platejs/markdown` (remark); elementos customizados em sintaxe MDX |
| **Milkdown** 7.21 | ProseMirror + remark; editor pronto "Crepe" | MIT | ProseMirror ↔ Markdown via remark |
| **Tiptap** 3 | ProseMirror, headless | MIT (core); nuvem, IA e conversões pagas | JSON do ProseMirror ↔ Markdown via `@tiptap/markdown` (beta, sobre marked) |
| **BlockNote** | Tiptap/ProseMirror, blocos estilo Notion | MPL-2.0; pacotes XL em GPL-3.0 | Blocos JSON; conversão para Markdown com perdas |
| CodeMirror 6 | Editor de código | MIT | Texto puro (serve como modo fonte, não como editor completo) |

**Frameworks de documentação**: Starlight 0.42, Docusaurus 3.10, VitePress 1.6, Rspress 2.0, Nextra 4, Fumadocs 16.10, Quartz 5, Zensical.

**Apps de wiki estilo Confluence**: Docmost, Wiki.js, Outline, BookStack.

---

## Avaliação

### 1. Frameworks de docs e apps de wiki: eliminação rápida

| Candidata | Tem editor? | S-01 Licença | Roda dentro do app React? | Resultado |
| --- | --- | --- | --- | --- |
| Starlight | Não (lê arquivos do repositório) | N | X (Astro, SSG) | Eliminado |
| Docusaurus | Não | N | X (SSG) | Eliminado |
| VitePress | Não | N | X (Vue) | Eliminado |
| Rspress | Não | N | X (SSG) | Eliminado |
| Nextra | Não | N | X (só Next.js) | Eliminado |
| Quartz | Não | N | X (SSG) | Eliminado |
| Zensical | Não | N | X (Python) | Eliminado |
| Fumadocs | Não | N | N (camada headless) | Só leitura/navegação — plano B de P4 |
| Docmost | Sim (sobre Tiptap) | X (AGPL-3.0) | X (app completo) | Eliminado; referência de produto |
| Wiki.js | Sim | X (AGPL-3.0) | X (app Vue) | Eliminado |
| Outline | Sim (ProseMirror) | X (BSL 1.1) | X (app completo) | Eliminado; referência de UX |
| BookStack | Sim | N (MIT) | X (app PHP) | Eliminado |

> [!NOTE]
> **Por que o Starlight, e não o Astro, está nesta tabela.** Estão em níveis diferentes. O Starlight é o framework de documentação: sidebar, TOC, busca e asides. O Astro é o **framework de aplicação** por baixo dele, no mesmo nível do TanStack Start e do Next.js. Colocar o Astro aqui seria comparar framework de app com biblioteca de wiki.
>
> A pergunta "e se o app inteiro fosse Astro?" é legítima, porque as live content collections (estáveis desde o Astro 6) buscam dados em runtime de CMS, APIs ou bancos, sem rebuild. Mas ela pertence a outro ADR, e não mudaria esta decisão: o editor continuaria sendo uma ilha React (MDXEditor ou Plate), e o Astro não traz editor. Seria trocar o TanStack Start por outra base sem resolver P1.

**Conclusão:** nenhum framework de documentação tem editor, porque todos pressupõem que o autor escreve arquivos num editor de código. Os apps de wiki têm editor, mas não são embutíveis nem permissivos. O critério mais importante (P1) só pode ser atendido por uma **biblioteca de editor**.

### 2. Editores: matriz ponderada

| # | Critério | MDXEditor | Plate | Milkdown | Tiptap 3 | BlockNote |
| --- | --- | --- | --- | --- | --- | --- |
| **P1** | | | | | | |
| E-01 | Markdown como entrada/saída | **N** (mdast nativo) | P (remark) | **N** (remark) | P (beta, marked) | **X** (conversão com perdas) |
| E-02 | Callouts `:::` Starlight | **N** (diretiva de admonition pronta, com seletor de tipo) | C (elemento callout existe; regra de serialização para `:::` própria) | C (`remark-directive` + nó próprio) | C (tokenizer próprio) | — |
| E-03 | Componentes MDX com props, sem eval | **N** (descritores de JSX + editor genérico de JSX) | P (serializa elementos customizados como MDX; formulário de props próprio) | C | C | — |
| E-04 | Nó de diagrama | C | C | C | C | — |
| E-05 | Tabela, imagem, código, frontmatter | **N** (plugins para os quatro) | N (frontmatter: ?) | N (frontmatter: ?) | P | — |
| **P2** | | | | | | |
| E-06 | Formatação completa | N | N | N | P (headless: UI nossa) | — |
| E-07 | Links + autocomplete interno | N (diálogo de link) · autocomplete ? | N | N | P (UI nossa) | — |
| E-08 | Atalhos e colar | N | N | N | N | — |
| E-09 | Slash menu | ? (provavelmente C) | **N** | **N** (Crepe) | P | — |
| E-10 | Modo fonte / diff | **N** (plugin de fonte e diff) | C | C | C | — |
| E-11 | Undo, teclado, a11y | N | N | N | N | — |
| **P3** | | | | | | |
| E-12 | React 19 | ? | ? | ? | N | — |
| E-13 | SSR TanStack Start (só-cliente) | ? | ? | ? | ? | — |
| E-14 | Estilo por token | N (cores em CSS vars no padrão Radix; classes públicas estáveis) | **N** (shadcn + Tailwind: melhor encaixe) | C (tema do Crepe) | **N** (headless) | — |
| E-15 | Radix/shadcn | **N** (usa Radix) | **N** (é shadcn) | C | C | — |
| E-16 | Compartilha mdast | **N** | N (remark) | N (remark) | X (marked; AST diferente) | — |
| **P5** | | | | | | |
| S-01 | Licença | N | N | N | N | X (XL em GPL-3.0) |
| S-03 | Mantenedores | 1 principal | Empresa (udecode) | 1 principal | Empresa | — |
| S-04 | Colaboração (Yjs) | C | P | P | N | — |

**Pontuação aproximada.** Escala: N = 3, P = 2, C = 1, X = 0. "?" conta como C até o spike; célula mista ("N · ?") conta como P. O total é a média ponderada dos grupos, normalizada sem P4, que é igual para todos.

| | MDXEditor | Plate | Milkdown | Tiptap 3 | BlockNote |
| --- | --- | --- | --- | --- | --- |
| P1 (40%) | **2,60** | 1,80 | 1,80 | 1,40 | eliminado |
| P2 (20%) | 2,50 | **2,67** | **2,67** | 2,17 | — |
| P3 (20%) | **2,20** | 2,00 | 1,20 | 1,60 | — |
| P5 (10%) | 1,67 | 2,67 | 2,00 | **3,00** | — |
| **Total ponderado** | **2,39** | 2,13 | 1,88 | 1,79 | — |

A pontuação ordena as candidatas, mas quem decide é o spike S1. O MDXEditor lidera, porém **as células "?" em P1 e P3 podem inverter o resultado com o Plate**: se o Plate resolver bem callouts `:::` e props de componentes, ele empata ou passa à frente. MDXEditor e Plate ganham em coisas diferentes:

- **MDXEditor vence em P1.** Foi feito para o nosso caso: Markdown/MDX como formato real, admonitions `:::` exatamente como no Starlight, edição de componentes JSX por descritor e alternância para o Markdown cru. É o editor que menos precisa ser ensinado a falar o dialeto do DokDraw.
- **Plate vence em P2, P3 e P5.** A UX é mais moderna (slash menu, blocos), a UI shadcn casa com o chrome do app Lovable, há empresa por trás e há caminho para colaboração. O custo é ensinar o dialeto: callouts `:::` e componentes precisam de regras de serialização próprias.
- **Milkdown** é tecnicamente sólido (remark por baixo), mas perde para os dois em integração com a stack e tem risco de mantenedor único.
- **Tiptap** é o mais maduro como motor, mas é headless (toda a UI é nossa) e o Markdown dele ainda é beta, sobre um parser diferente do nosso pipeline de leitura.
- **BlockNote** cai em E-01: o modelo é de blocos e o Markdown sai com perdas. Além disso, os exportadores ficam nos pacotes XL, em GPL-3.0.

### 3. Leitura e navegação (P4)

- **Renderer próprio sobre `unified`**: consome o mesmo mdast do editor, renderiza com lista fechada de componentes e não avalia código (L-02). Componentes MDX viram nós `mdxJsxFlowElement` resolvidos contra um registry, e expressões `{}` são recusadas.
- **`fumadocs-core`** fica como plano B para árvore, TOC e busca, pelos motivos da versão anterior: a UI dele não serve ao design system, e sem a UI o ganho é pequeno.

---

## Spike S1 — critério de desempate entre MDXEditor e Plate

Duração: até 3 dias, com o mesmo conjunto de fixtures nas duas bibliotecas.

| # | Teste | Passa quando |
| --- | --- | --- |
| 1 | Round-trip de 30 fixtures reais (callouts, tabelas, código, componentes, frontmatter, links) | `serialize(parse(x)) === x` em pelo menos 28 das 30, e as divergências são só de normalização aceitável |
| 2 | Inserir callout pela UI e trocar o tipo | Gera `:::tip` … `:::` idêntico ao Starlight |
| 3 | Inserir `<Tabs>` com duas abas e editar uma prop | Markdown válido; `{alert(1)}` digitado no modo fonte é recusado ou escapado |
| 4 | Nó de diagrama com preview | Abre seletor, mostra o SVG, serializa como a sintaxe definida no ADR de formato |
| 5 | Link interno com autocomplete | Sugere páginas pelo título |
| 6 | Tema por token | O editor segue `.theme-dark` / `.theme-light` sem CSS de tema paralelo |
| 7 | Rota do editor no TanStack Start com `lazy` | Sem erro de hidratação; a Landing não carrega o editor |
| 8 | Colar do Google Docs e do GitHub | Estrutura preservada |

**Regra de decisão:** vence quem passar em 1, 2, 3 e 7 (os não negociáveis). Se os dois passarem, vence quem somar mais pontos nos testes restantes. Se nenhum passar em 1, reabrir com Milkdown.

---

## Consequências

**Positivas**

- O critério mais importante do produto, a escrita, passa a guiar a escolha das bibliotecas.
- Editor e leitura falam o mesmo mdast. O que se escreve é exatamente o que se lê e o que se exporta.
- Componentes MDX podem ser **inseridos e editados** sem que o conteúdo jamais seja executado: a sintaxe JSX é só parseada e resolvida contra um registry.

**Negativas**

- O nó de diagrama e a navegação são construídos por nós, qualquer que seja o editor.
- Com MDXEditor: dependência de um mantenedor principal e colaboração em tempo real fica mais distante.
- Com Plate: é preciso ensinar o dialeto Starlight ao serializador.

**Reversibilidade**

- **Média para o editor.** O conteúdo é Markdown, então trocar de editor não migra dados, mas refaz os nós customizados e a toolbar.
- **Alta para leitura e navegação**, porque consomem mdast.

## Quando revisitar

- **Colaboração em tempo real** virar requisito: pesa a favor de Plate ou Tiptap.
- A Wiki precisar de **versão pública hospedada** com SEO: spike do `fumadocs-core` ou do perfil de exportação Starlight.
- O `@tiptap/markdown` sair de beta e aceitar remark como parser.

## Próximos passos

| # | Fatia | Depende de | Pronto quando |
| --- | --- | --- | --- |
| F0 | Build real + dependências do spike | — | `install`, `build` e `tsc` passam no app Lovable |
| S1 | Spike MDXEditor × Plate | F0 | Tabela de resultados preenchida e decisão registrada neste ADR (status → Aceito) |
| F1 | `wiki-core`: parse e serialize com remark, registry de componentes, validação sem eval | F0 | 30 fixtures em round-trip; testes em Vitest sem DOM |
| F2 | Editor escolhido integrado: toolbar, callouts, componentes, link interno, modo fonte | S1, F1 | Os 8 testes do S1 passam dentro do app, com tokens |
| F3 | Nó de diagrama no editor e na leitura | F2 | Inserir, pré-visualizar e abrir no Studio |
| F4 | Leitura + navegação (sidebar, TOC, backlinks) | F1 | Mesma página idêntica em `.theme-dark` e `.theme-light`; TOC operável por teclado |

## Fora de escopo deste ADR

Cada item abaixo vai para um ADR próprio:

- **Formato canônico**: Markdown com directives e subconjunto de MDX sem expressões; sintaxe de diagrama e links (inclui a troca de `[[diagram:Título]]`).
- **Armazenamento**: Postgres vs. Supabase Storage.
- **Exportação e sincronização**: perfis Markdown, Obsidian, Starlight e `.docx`; destinos local e nuvem; sync periódico com o Google Drive.
