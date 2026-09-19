# Briefing do subagente de editor — spike S-1 (ADR 005)

Projeto: `adrs/_work/spike-s1/` (raiz do repositório: `/Users/ralphrenatodasilva/workspace/000-Pessoal/codebase/dok-draw-documentation`). Vite 8 + React 19 + TanStack Start + TS strict, já instalado. Chromium do Playwright já instalado.

## Objetivo

Implementar o adaptador do seu editor contra o contrato já existente e rodar os testes do S-1 com saída real. Não decidir qual editor vence.

## O que já existe (não altere)

- `content-format/dokmd.ts`: porte do harness do ADR 002 (`parseDok`, `serializeDok`, `normalizeDok`, `validateDok`). Gate 30/30 já passou.
- `src/editors/contract.ts`: contrato `AdapterProps` / `AdapterHandle`. **Leia primeiro.**
- `src/shared/EditorShell.tsx`: shell comum aos dois editores. Frontmatter fica fora do editor. Conteúdo com DOK-E (após `normalizeDok`) abre só no modo fonte (D-1). Alternância WYSIWYG ↔ fonte: fonte → WYSIWYG faz re-parse completo e remonta o adaptador. Menu "Inserir" (Radix DropdownMenu em portal) chama `handle.insertDirective(EDIT[name].create())`; diagrama abre um Radix Popover com seletor. Save simulado = `normalizeDok` + `validateDok`. Banner `changes_requested`. Expõe `window.__spike` (ver `tests/shared/helpers.ts`).
- `src/shared/SourceMode.tsx`: modo fonte CodeMirror 6 compartilhado.
- `src/shared/importDialect.ts`: stub espionado da porta `importDialect` (D-2). Para o `input.md` de uma fixture `import`, devolve `parseDok(expected.md)`. Registra chamadas em `window.__importCalls`.
- `src/content-components/core.ts` e `src/content-components/edit/index.ts`: registry (D-3). `EDIT[name].create()` gera o nó mdast inicial de cada diretiva. Use essa fatia; não duplique a forma dos nós no adaptador.
- `src/content-components/read/`: renderer stub de leitura (não é do editor).
- `src/shared/pageIndex.ts`: índice simulado (páginas, diagramas, assets) e `searchPages`.
- `src/shared/corpus.ts`: corpus exato do teste 1 e do D-2.
- Rotas: `/edit/mdxeditor` e `/edit/plate` (`ssr: false`, adaptador via `React.lazy`). Parâmetros: `?fixture=NN&file=expected|input&readOnly=1&changesRequested=1`.
- `tests/shared/helpers.ts`: leitura das fixtures, `openEditor`, `spike.*`, `collectErrors`.
- Fixtures: `adrs/ADR-002-anexos/fixtures/NN-*/input.md|expected.md` e `manifest.json` (só leitura).

## Desenho obrigatório: adaptador via DokAST (aprovado na parada 3)

- Entrada: `props.initialTree` (mdast de `parseDok`, sem o nó `yaml`) → árvore da biblioteca.
- Saída: `handle.getTree()` = árvore da biblioteca **no estado atual** → mdast.
- O parser e o serializer Markdown da biblioteca **nunca** entram no caminho de persistência.
- `getTree()` precisa converter o estado real da biblioteca. É proibido devolver `initialTree` em cache, comparar com fixtures, chamar `normalizeDok`/`serializeDok`/`parseDok` dentro do adaptador para "consertar" saída, ou ter qualquer caso especial por fixture. Isso invalidaria o spike.
- Colar: o adaptador intercepta o colar e entrega o texto cru (`text/plain`, e `text/html` se houver) a `props.importDialect(...)`; insere `result.tree` via o mesmo caminho de `insertTree` (ignorando nós `yaml`). O editor nunca usa o próprio deserializador de Markdown/HTML ao colar.
- Autocomplete de link interno (teste 5) é do adaptador, usando `props.searchPages`. Link pendente: `pendingPageUri(title)` de `src/shared/pageIndex.ts`.
- Nomes de diretiva vêm do registry (`DIRECTIVE_NAMES`, `EDIT`), não de constantes do adaptador.

## Onde você pode escrever

- `src/editors/<editor>/` (substitua o `Adapter.tsx` placeholder; crie os arquivos que precisar aqui).
- `tests/<editor>/` (specs Playwright).
- `adrs/_work/spike-s1/<editor>/` (`RESULTADO.md`, saídas brutas).

Nada fora disso. Não altere `package.json`, configs, `content-format/`, `src/shared/`, `src/content-components/`, `src/routes/`, `src/editors/contract.ts`, fixtures, ADRs ou LEDGER. Não rode `npm install`. Se algo compartilhado impedir o teste, **pare esse item, registre no RESULTADO.md com a evidência e siga com os outros**.

## Como rodar

- `npx tsc --noEmit -p .` precisa passar para os seus arquivos.
- `SPIKE_PORT=<sua porta> npx playwright test tests/<editor> 2>&1 | tee <editor>/playwright-output.txt`
- O `webServer` do Playwright sobe o Vite na sua porta. Não use a porta do outro subagente.

## Testes (todos em `tests/<editor>/`, com `console.log` do que foi medido)

Edição trivial = colocar o cursor no texto do editor, digitar `x`, apertar Backspace.

1. **Teste 1 (E-01), corpus fixo:**
   - A. `T1_EXPECTED` (25 fixtures): abrir `?fixture=N&file=expected`, edição trivial, `spike.save(page).text === expected.md` byte a byte.
   - B. `T1_CANONICAL_INPUT` (17): abrir `?fixture=N&file=input`, edição trivial, `save().text === expected.md`.
   - C. `T1_ERROR` (3, 15, 22, 24, 30): (a) `mode() === 'source'` e o WYSIWYG não montou; (b) `[data-testid=diagnostics]` visível; (c) `sourceText() === input.md` exatamente, também depois de `setMode('wysiwyg')` (que precisa devolver `false`); (d) códigos DOK-E de `save().diagnostics` (sem repetição, ordenados) iguais a `errors` do manifest.
   - Resultado: uma linha por fixture e por parte, com o diff quando falhar. Placar final: A x/25, B x/17, C x/5; E-01 passa com A 25/25 e C 5/5 (30/30), mais B 17/17.
2. **Teste 2:** abrir `?fixture=16&file=expected`, apagar o corpo pela UI, recriar pela UI os dois callouts da fixture 16 (inserir pelo menu, rótulo "Antes de começar", parágrafo e lista, depois um segundo callout trocando o tipo para `danger` pela UI do nó e definindo `variant=bug` e `fold=closed` pela UI). Passa se `save().text === expected.md` da 16. Se algo não for possível pela UI, registre o quê.
3. **Teste 3 (E-02):** no modo fonte (CodeMirror em `[data-testid=source-mode] .cm-content`), digitar `<Tabs>` numa linha e `<script>` em outra: `save()` retorna DOK-E002. Digitar `Hora:agora` num parágrafo **no WYSIWYG** e também no modo fonte: nenhuma diretiva criada, texto salvo contém `Hora:agora` literal, sem DOK-E003.
4. **Teste 4 (E-03, só a parte do diagrama):** abrir fixture 01, inserir diagrama pelo menu → seletor → "Contexto do Pagamento", preencher a descrição pela UI do nó com "Pessoa usa o Checkout, que chama o Gateway de pagamento". Passa se o texto salvo contém exatamente a linha 7 do `expected.md` da fixture 23 e o save é `ok`.
5. **Teste 5:** link interno com autocomplete: digitar "visão" na UI de link do adaptador, a sugestão "Visão geral" aparece (e busca pelo alias "C4" também acha); escolher gera `[texto](dok:page/0192f0a1-5c3e-7a10-8b2c-3d4e5f607183)`. Link pendente para "Página nova" gera `dok:page/new?title=P%C3%A1gina%20nova`. Save `ok` (W101 esperado para o pendente).
6. **Teste 6 (tema por token, preflight do Tailwind ativo):** com `html.theme-light` e depois `html.theme-dark` (trocar a classe via `page.evaluate`), a cor do texto e o fundo da área editável mudam e batem com `var(--foreground)`/`var(--background)` resolvidos. Registrar qualquer CSS de tema da biblioteca que precisou ser sobrescrito (arquivo e quantidade de regras). Com `page.emulateMedia({ reducedMotion: 'reduce' })`, nenhuma animação ou transição acima de 0,01 ms na área do editor.
7. **Teste 7 (E-07):** abrir `/` e registrar as requisições de rede: nenhum chunk da biblioteca do editor carregado na landing. Navegar para `/edit/<editor>` pelo link (navegação de cliente) e também por carga direta: nenhum erro de console, nenhum erro de hidratação (`collectErrors`).
8. **Teste 8:** colar (evento `paste` sintético com `DataTransfer`) um trecho típico do Google Docs (`text/html` com `<b style=...>`, `<span>`, lista) e um do GitHub (`text/html` + `text/plain` Markdown): cada colar gera uma chamada em `window.__importCalls`, o editor insere a árvore devolvida e o save não contém HTML nem JSX. Limite declarado: o stub não converte HTML (D-2); a preservação de estrutura é da F6 do ADR 002.
9. **D-2:** para cada fixture de `D2_IMPORT`: abrir `?fixture=N&file=expected`, apagar o corpo pela UI, colar o `input.md` inteiro: `__importCalls` registra a fixture casada e `save().text === expected.md`.
10. **Alternância (D-5):** para cada fixture de `T1_EXPECTED`: abrir, `setMode('source')`, `setMode('wysiwyg')`, `save().text === expected.md`. Mais um caso: editar no modo fonte (acrescentar um parágrafo), voltar, conferir que o parágrafo está no WYSIWYG e no save.
11. **E-13:** `?readOnly=1`: digitar na área editável não muda `getDok()`, o elemento editável não é `contenteditable=true`, o menu Inserir não aparece. `?changesRequested=1`: `[data-testid=banner-changes-requested]` visível.
12. **Portais Radix:** abrir o menu Inserir sobre o editor: o conteúdo do menu está no topo (`document.elementFromPoint` no centro do menu pertence ao menu), não é cortado, e Escape devolve o foco.
13. **Riscos específicos do seu editor:** ver a seção do seu editor abaixo.

## Formato do RESULTADO.md

```md
# Spike S-1 — <editor> <versão>

Data. Porta. Comando.

## Placar
| Teste | Resultado | Observação |
(1A x/25, 1B x/17, 1C x/5, 2 … 13)

## Adaptador
Arquitetura, arquivos, linhas de código, dias gastos e dias estimados para produção de cada item "C".
Chamadas da biblioteca usadas para entrada e saída (com arquivo:linha).

## Falhas
Cada falha com o diff real (esperado × obtido) e a causa, com evidência (código da biblioteca, issue).

## Desvios e limites
O que não foi possível testar e por quê.

## Saída real
Referência a `<editor>/playwright-output.txt` e trechos relevantes colados sem edição.
```

A saída bruta do Playwright vai inteira em `<editor>/playwright-output.txt`. O RESULTADO.md não resume o que não rodou: item não executado é "não executado", com o motivo.
