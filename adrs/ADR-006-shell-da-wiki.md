# ADR 006: Shell da Wiki, o caminho de escrita

| Campo | Valor |
| :--- | :--- |
| Status | **Aceito** em 2026-09-20 |
| Data | 2026-09-20 |
| Camada | Shell da Wiki: rotas, telas e estado do caminho de escrita (criar página, editar, submeter, revisar, publicar) |
| Depende de | ADR 002 e Emenda 1 (Aceito), ADR 003, Armazenamento e versionamento (Aceito), ADR 004, Fluxo editorial (Aceito), ADR 005, Edição (Aceito) |
| Decide | Estrutura de rotas e fronteira de autenticação da Wiki, tela de listagem e criação de página, tela de edição que monta o editor do ADR 005, tela da fila de revisão, onde mora o estado do rascunho entre editor e servidor e como autosave e conflito aparecem para quem escreve, o que é SSR e o que é cliente com o isolamento do chunk do editor, estado vazio, de carregamento e de erro de cada tela, como a fatia `edit` do registro de diretivas é consumida sem arrastar a fatia `read` |
| Não decide | Renderização de leitura e resolução de URIs `dok:` (ADR 007), descoberta, árvore de navegação e backlinks (ADR 008), busca (ADR 009), o componente do editor em si (ADR 005, já aceito), publicação pública e domínio (ADR 011), papéis e tenancy, incluindo como um segundo usuário entra num workspace e como um espaço é criado (ADR 004, já aceito, e ADR 013, não escrito) |
| Reversível? | Majoritariamente. Ver seção 9 |

## 1. Decisão

**A Wiki entra sob a mesma fronteira `_authenticated` que já resolve autenticação e layout para o Diagram Studio, com três rotas de arquivo novas (`projetos.$projectId.wiki.index`, `projetos.$projectId.wiki.paginas.$pageId`, `projetos.$projectId.wiki.paginas.$pageId.editar`), todas herdando `ssr: false` do layout pai. O escopo é o projeto desde a `DEC-0017`, e a fila de revisão da seção 6.4 ficou fora do contrato porque o escopo dela não foi decidido (seção 14). O estado do rascunho vive no cliente entre edições, sincronizado com `page_drafts` por `saveDraft` a cada 2 segundos de inatividade de digitação, com um envio forçado a cada 30 segundos se o rascunho continuar sujo, o mesmo padrão de debounce que o Diagram Studio já usa para posição de nó. `DraftVersionConflictError` reabre o rascunho gravado no servidor com um aviso não bloqueante. `RevisionConflictError` bloqueia a tela de edição com um diálogo modal, porque a publicação mudou sob o rascunho. A tela de edição importa só a fatia `edit` do registro de diretivas e o adaptador do ADR 005, nunca a fatia `read` nem o renderer do ADR 007, reforçado por uma regra de ESLint escopada ao arquivo da rota.**

Por quê, em uma linha cada:

- **Reaproveitar `_authenticated`, não abrir uma segunda fronteira.** `src/routes/_authenticated/route.tsx` já resolve `beforeLoad` com `supabase.auth.getUser()` e redireciona para `/` sem sessão. Uma segunda fronteira duplicaria essa checagem, e uma rota nova esquecida de um dos dois guardas vaza conteúdo, o que o critério eliminatório W-01 (seção 3) barra.
- **`ssr: false` herdado, sem decisão nova de renderização.** O chunk da rota de edição do ADR 005 pesa 132,88 kB gzip mais 9,09 kB de CSS, e o teste E-07 daquele ADR exige que ele só carregue na própria rota. O `@tanstack/router-plugin` já faz *code splitting* por arquivo de rota, o mesmo mecanismo que isola hoje o chunk de `_authenticated/projetos.$projectId.tsx` do resto do app. Nada precisa ser configurado além de manter o componente do editor dentro do arquivo da rota de edição.
- **Debounce de 2 s com envio forçado de 30 s, sem biblioteca nova.** `_authenticated/projetos.$projectId.tsx` já debounça `commitNodes` em 400 ms para posição de nó, um payload pequeno e frequente. `saveDraft` grava o texto inteiro da página e roda no servidor sobre ele, então o intervalo é maior para não gerar uma escrita por tecla. O envio forçado de 30 s existe porque um debounce puro nunca dispara enquanto a pessoa digita sem pausa, e um rascunho de 30 s sem chegar ao servidor é perda de trabalho maior do que o produto aceita.
- **`DraftVersionConflictError` não bloqueia, `RevisionConflictError` bloqueia.** Os dois erros do ADR 003 têm gravidade diferente. Perder a versão local de um rascunho é recuperável recarregando o que está salvo no servidor, porque o rascunho de ninguém além do autor é visível. Publicar uma revisão sobre uma base que já não é a publicada corrompe o histórico se o autor não perceber, então a tela para e obriga uma decisão explícita.
- **Import restrito à fatia `edit`, com regra de lint.** `src/content-components/edit` é o único registro que a tela de edição precisa, publicado pelo ADR 005. `RevisionView`/`RevisionDiff`, que usam a fatia `read` do ADR 007, entram só na tela de revisão (seção 6.4), nunca na de edição. O mesmo mecanismo que a fatia F0 do ADR 002 já usa (`no-restricted-imports` com `patterns`/`group`) impede o import por engano, em vez de depender de revisão manual.

> [!WARNING]
> Lacuna: nenhum ADR decide como um `content.spaces` é criado. O ADR 003 semeia só `content.workspace_members` (dono do workspace, por trigger) e não publica `createSpace` entre as funções da seção 6.5. A tela de listagem desta camada (seção 6.2) assume que ao menos um espaço já existe no workspace. Dono: ADR 013 (Tenancy) ou uma decisão de produto de auto-criar um espaço padrão por workspace, nenhuma das duas tomada até aqui.

## 2. Contexto e entradas recebidas

Do `LEDGER.md` (Aceitos):

- **ADR 002 e Emenda 1**: `parseDok`, `serializeDok`, `normalizeDok`, `validateDok` em `src/content-format`, sem DOM nem builtin de Node. `validateDok` recusa texto canônico acima de 300.000 bytes com `DOK-E011`, antes de qualquer outra checagem.
- **ADR 003**: `Space`, `Page`, `PageDraft`, `PageRevision` em `src/content-store/types.ts`. `PageDraft` tem `contentDokmd`, `basedOnRevisionId` e `version`. `saveDraft({ pageId, authorId, contentDokmd, expectedVersion })` lança `DraftVersionConflictError` quando `expectedVersion` diverge da versão gravada. `submitRevision({ pageId, authorId })` lança `RevisionConflictError` quando `draft.basedOnRevisionId` diverge de `pages.publishedRevisionId` atual. `createPage` cria `pages` mais um `page_drafts` inicial. Nenhuma função cria um `Space`.
- **ADR 004**: `RevisionStatus` com sete valores (`submitted`, `in_review`, `changes_requested`, `approved`, `published`, `rejected`, `superseded`). `REVISION_TRANSITIONS`/`isTransitionAllowed` validam par `(from, to, actor)` contra os papéis `admin`, `editor`, `reviewer`. `castReviewVote`, `publishRevision`, `getSpaceEditorialPolicy` em `src/editorial-flow/server.ts`. `space_editorial_policies.publish_role` restringe quem publica a `admin` ou `editor`, por espaço.
- **ADR 005**: `AdapterContract` (`AdapterProps`, `AdapterHandle`) em `src/editors/contract.ts`, com `getTree()`/`insertTree`/`insertDirective`. `src/content-components/edit` publica `create()` e o componente de edição por diretiva, testado por completude contra o registro do ADR 002. `RevisionView`/`RevisionDiff` usam a fatia `read` do ADR 007 (ainda não escrito) e são o único renderizador de DokAST do app. Chunk da rota de edição medido em 132,88 kB gzip mais 9,09 kB de CSS. `normalizeDok` + `validateDok` bloqueiam o save no servidor, inclusive vindo do modo fonte.

Do app real (`dok-draw-app`, leitura em 2026-09-20):

- `src/routes/_authenticated/route.tsx` declara `ssr: false` e `beforeLoad` redirecionando para `/` sem sessão. Toda rota sob esse diretório herda os dois.
- `src/routes/README.md` fixa a convenção de arquivo plano com ponto (`projetos.$projectId.tsx` → `/projetos/:projectId`), sem `src/pages/` nem `_app/index.tsx`.
- `src/routes/_authenticated/projetos.$projectId.tsx` debounça `commitNodes` em 400 ms (`setTimeout` com `clearTimeout` a cada nova chamada) antes de chamar a server function de persistência, o único precedente de autosave no app hoje.
- `src/components/app-shell.tsx` publica `<AppShell>`, com navegação lateral (`NavItem` para `/projetos` e, condicional a `isAdmin`, `/convidados`) e `editorMode`/`fullBleed` para telas de canvas cheio.
- Nenhum arquivo do app referencia `content.*`, `src/content-store` ou `src/editorial-flow`: as fatias de implementação dos ADRs 003, 004 e 005 ainda não chegaram ao código real (`grep` em `src/integrations/supabase/types.ts` não encontra as tabelas).

Do achado que origina este ADR (`decisoes/ACHADO-2026-09-20-shell-da-wiki-sem-dono.md`): os quatro ADRs aceitos declaram, cada um na própria seção "Não decide", que a interface não é deles, e o ADR 005 usa a palavra "shell" seis vezes como algo que existe sem construí-lo.

## 3. Critérios

### Eliminatórios

| ID | Critério | Por que, neste projeto | Como verifico aqui |
| :--- | :--- | :--- | :--- |
| W-01 | Nenhuma fronteira de autenticação nova, só reuso de `_authenticated` | Duas fronteiras de guarda de sessão é superfície onde uma rota esquecida vaza conteúdo | Toda rota nova desta camada vive em `src/routes/_authenticated/` |
| W-02 | Nenhuma dependência nova sem que o contrato a nomeie (regra de compatibilidade 4, `insumos/BASE.md`) | Ambiente Lovable, instalação só por registro npm, sem justificar peso extra de bundle | `package.json` sem entrada nova em `dependencies` |
| W-03 | A tela de edição nunca importa a fatia `read` do registro nem o renderer do ADR 007 (ponto 8 do escopo) | A fatia `read` ainda não existe (ADR 007 não escrito), e misturá-la na edição acopla duas camadas que o ADR 005 já separou | Regra de ESLint escopada ao arquivo da rota de edição, com `patterns`/`group`, acusa o import em qualquer forma (direta, relativa ou por alias) |
| W-04 | Cor só por token CSS, tema claro e escuro pela classe `.dark` (arquitetura base) | Restrição herdada de todos os ADRs anteriores, sem exceção nova aqui | Nenhuma cor hexadecimal nem classe Tailwind de cor literal nos arquivos desta camada |

### Importantes (peso, 0 a 3 por candidata sobrevivente)

| ID | Critério | Peso | Por que, neste projeto |
| :--- | :--- | ---: | :--- |
| I-1 | Reuso de padrão já em produção no app | 5 | Menor custo de implementação e menor superfície nova para quem mantém depois |
| I-2 | Isolamento do chunk do editor fora das telas de listagem e revisão | 4 | É a exigência concreta que a seção "Decide" ponto 6 do escopo pede, e o teto de 132,88 kB é caro para carregar sem necessidade |
| I-3 | Robustez do tratamento de conflito de rascunho e de publicação | 3 | Perder o texto de uma sessão de escrita ou publicar por cima de outra pessoa são os dois piores desfechos possíveis desta camada |
| I-4 | Simplicidade do modelo de estado do rascunho | 3 | Menos partes móveis é menos bug em uma fatia que o agente do Lovable implementa sem ter participado da decisão |

## 4. Candidatas

Duas decisões estruturais, cada uma com duas candidatas.

**Decisão A, fronteira de rotas:**

| ID | Candidata |
| :--- | :--- |
| A1 | Aninhar sob `_authenticated`, reaproveitando `beforeLoad` e `ssr: false` já existentes |
| A2 | Nova fronteira de autenticação dedicada à Wiki, com `beforeLoad` próprio |

**Decisão B, estado do rascunho entre editor e servidor:**

| ID | Candidata |
| :--- | :--- |
| B1 | Estado local do componente React, debounce de tempo fixo chamando `saveDraft`, sem dependência nova |
| B2 | Biblioteca de estado local-first ou CRDT (por exemplo Yjs), antecipando colaboração em tempo real |

## 5. Avaliação

### 5.1 Eliminatórios

| Requisito | A1 (reaproveitar) | A2 (fronteira nova) | B1 (debounce local) | B2 (CRDT) |
| :--- | :--- | :--- | :--- | :--- |
| W-01 fronteira única | N | **X**: duplica `beforeLoad`, e uma das duas pode divergir da outra com o tempo | N | N |
| W-02 sem dependência nova | N | N | N | **X**: Yjs (ou equivalente) não está no contrato de nenhum ADR aceito, e nenhum requisito de produto pede colaboração em tempo real na v1. O ADR 003 registra isso como premissa **futura**, não atual |
| W-03 edição não importa `read` | N | N | N | N |
| W-04 cor só por token | N | N | N | N |

**Eliminada A2** (X em W-01) **e B2** (X em W-02, sem justificativa de produto para abrir a exceção da regra de compatibilidade 4).

A1 e B1 sobrevivem sozinhas em cada decisão, sem candidata concorrente para ponderar. A ponderação da seção 3 (I-1 a I-4) já está refletida na escolha: A1 e B1 marcam o máximo nos quatro critérios importantes, porque reaproveitam o único precedente do app (I-1), preservam o isolamento de chunk por rota que o TanStack Router já faz (I-2), tratam os dois erros do ADR 003 de forma diferenciada (I-3) e não introduzem sincronização distribuída para um produto de autor único por rascunho (I-4).

## 6. Desenho da solução

### 6.1 Estrutura de rotas

```
src/routes/_authenticated/
  projetos.$projectId.wiki.index.tsx                       → /projetos/:projectId/wiki
  projetos.$projectId.wiki.paginas.$pageId.tsx             → /projetos/:projectId/wiki/paginas/:pageId
  projetos.$projectId.wiki.paginas.$pageId.editar.tsx      → /projetos/:projectId/wiki/paginas/:pageId/editar
```

Todas herdam `ssr: false` e o `beforeLoad` de `_authenticated/route.tsx`, sem `beforeLoad` próprio. A wiki não ganha item de menu próprio: a entrada é a tela do projeto, que passa a ter duas áreas irmãs, Diagramas e Wiki.

O escopo era `:spaceId` até a `DEC-0017`, aprovada pelo humano em 2026-09-20. A correção está na seção 14.

A rota de índice resolve o espaço a partir do projeto, e lista os espaços do workspace com:

```ts
// src/content-store/server.ts: extensão aditiva ao ADR 003
export function getSpaceList(workspaceId: UUID): Promise<Space[]>
```

`getSpaceList` mora em `src/content-store/server.ts`, o mesmo arquivo de `getPageTree`, porque consulta `content.spaces`, tabela do ADR 003, com a mesma forma de leitura simples por chave estrangeira que `getPageTree` já usa para `content.pages`. Alternativa descartada: um módulo próprio desta camada para consultas de leitura sobre `content.*`. Descartada porque o app já teria dois lugares para "como ler `content.spaces`", um em `content-store` e outro na Wiki, sem ganho, e a fatia G1 (seção 11) já depende de `src/content-store/server.ts` existir no app. Custo aceito: o ADR 003 recebe uma função nova sem ter sido reaberto por completo, registrada na "Verificação de compatibilidade" (seção 7) e no contrato de saída (seção 13) para o `LEDGER.md` acolher em nome dele.

`getSpaceList` continua existindo porque a criação de página precisa do `space_id`, coluna `not null` de `content.pages`. Com a wiki entrando pelo projeto, o espaço deixa de ser escolhido na tela e passa a vir do projeto, e `public.projects` ainda não tem a coluna que aponta para o espaço (`DDP-114`). Até ela existir, a resolução é de aplicação.

### 6.2 Tela de listagem e criação de página (`projetos.$projectId.wiki.index.tsx`)

Chama `getPageTree(spaceId)`, que devolve `Array<Page & { children: Page[] }>`. Renderiza como árvore expansível, título de cada página vindo de `Page.title` (a coluna cache, não o frontmatter, porque `getPageTree` não carrega revisão). Um botão "Nova página" abre um diálogo pedindo só o título, chama `createPage({ spaceId, projectId, parentPageId: null, authorId, initialContentDokmd })` com um DokMD mínimo (frontmatter com `dok: 1`, `id` novo, `title` do diálogo, corpo vazio) e navega para `/projetos/:projectId/wiki/paginas/:pageId/editar` da página criada.

Cada linha da árvore linka para a rota de edição da página. Nenhuma linha renderiza conteúdo de leitura (isso é o ADR 007): a listagem mostra só título, posição na árvore e a data de `updatedAt`.

### 6.3 Tela de edição (`wiki.$spaceId.paginas.$pageId.editar.tsx`)

Estrutura de tela igual ao padrão de `AppShell fullBleed editorMode` que `_authenticated/projetos.$projectId.tsx` já usa para o canvas do Diagram Studio: cabeçalho com título da página e ações, área central para o editor.

1. **Carga**: `getDraft(pageId, authorId)`. Se não existir rascunho para o autor, `initializeDraftFrom` (ADR 004, seção 6.3) cria um a partir da revisão publicada atual, ou de um corpo vazio se a página nunca foi publicada.
2. **Montagem do editor**: o componente monta `AdapterHandle` (ADR 005) sobre `draft.contentDokmd`, com o registro `src/content-components/edit` injetado. Um alternador troca entre o modo WYSIWYG e o modo fonte (CodeMirror 6 compartilhado, ADR 005), preservando a árvore entre os dois (teste 10 do S-1).
3. **Autosave**: cada mudança no editor reinicia um `setTimeout` de 2.000 ms. Ao disparar (por inatividade ou pelo temporizador forçado de 30.000 ms que roda em paralelo e não é resetado pela digitação), o componente chama `getTree()`, serializa com `serializeDok`, normaliza com `normalizeDok` e envia a `saveDraft({ pageId, authorId, contentDokmd, expectedVersion: draft.version })`.
4. **`DraftVersionConflictError`**: o `catch` chama `getDraft` de novo, substitui o estado local pelo texto do servidor e mostra um aviso não bloqueante ("O rascunho foi atualizado a partir de outra aba ou dispositivo"), sem interromper a digitação seguinte.
5. **`DOK-E` no save**: `validateDok` roda no servidor dentro de `saveDraft` (herdado do ADR 002). Um `DOK-E` bloqueia o save e força o modo fonte, com a lista de diagnósticos visível, o mesmo comportamento que o ADR 005 já decidiu (D-1) para conteúdo inválido.
6. **Submeter**: um botão "Enviar para revisão" chama `submitRevision({ pageId, authorId })`. Sucesso navega para a fila de revisão do espaço. `RevisionConflictError` abre um diálogo modal bloqueante: "Esta página foi publicada por outra pessoa desde que este rascunho começou", com duas ações, "Recarregar a partir da publicação atual" (descarta o rascunho local e chama `initializeDraftFrom` de novo) ou "Cancelar" (fecha o diálogo, mantém o rascunho, sem submeter).
7. **Importação restrita**: o arquivo da rota fica sob a regra de ESLint da seção 6.7, que acusa qualquer forma de import de `src/content-components/read`, direta, relativa ou por alias.

### 6.4 Tela da fila de revisão (`wiki.$spaceId.revisao.tsx`)

Lista revisões do espaço com:

```ts
// src/editorial-flow/server.ts: extensão aditiva ao ADR 004
export function listPendingRevisions(spaceId: UUID): Promise<PageRevision[]>
// filtra currentStatus em submitted | in_review | changes_requested | approved
```

`listPendingRevisions` mora em `src/editorial-flow/server.ts`, o mesmo arquivo de `castReviewVote` e `publishRevision`, porque filtra por `PageRevision.currentStatus`, a projeção que o ADR 004 já mantém em `revision_current_status`. Alternativa descartada: as telas se virarem com o que o ADR 003 já publica (`listRevisions(pageId)`, por página) e agregarem por espaço no cliente. Descartada porque `listRevisions` não tem `spaceId` nem filtro de status, e a fila precisaria buscar toda página do espaço primeiro só para depois filtrar status no cliente, uma consulta a mais e uma regra de negócio (quais status entram na fila) reimplementada fora de `editorial-flow`. Custo aceito, o mesmo da função anterior: o ADR 004 recebe uma função nova sem reabertura completa, registrada nas seções 7 e 13 para o `LEDGER.md` acolher em nome dele.

A tela usa `getSpaceEditorialPolicy(spaceId)` para saber `publish_role` e `allow_self_approval`, e o papel do usuário atual em `content.effective_role(spaceId, userId)` para habilitar ou não os botões de ação.

Cada linha mostra `PageRevision.frontmatter.title`, o autor, o status atual e as ações que `isTransitionAllowed(currentStatus, alvo, papelDoUsuário)` libera: "Iniciar revisão" (`submitted` → `in_review`), "Aprovar" (`in_review` → `approved`), "Pedir mudanças" (`in_review` ou `approved` → `changes_requested`), "Rejeitar" (`in_review` → `rejected`), "Publicar" (`approved` → `published`, ou `submitted` → `published` no bypass de `requires_approval = false`, restrito a quem tem `publish_role`). Autoaprovação (revisor = autor) fica desabilitada no botão, não só recusada no servidor, a menos que `allow_self_approval = true`.

Clicar numa linha abre `<RevisionDiff>` (ADR 005), que usa a fatia `read` do ADR 007 para comparar a revisão contra a publicada. Esta é a única tela desta camada que importa a fatia `read`, e o faz através do componente já publicado pelo ADR 005, nunca chamando o renderer direto.

### 6.5 Estado vazio, de carregamento e de erro, por tela

| Tela | Vazio | Carregamento | Erro |
| :--- | :--- | :--- | :--- |
| `wiki.index` | "Nenhum espaço neste workspace ainda. Peça a um administrador para configurar um." Sem botão de ação, porque criar espaço não é decidido aqui | `Skeleton` de três linhas, mesmo componente que `AppShell` já usa para a identidade do usuário | Toast de erro (`sonner`, padrão do app) mais um botão "Tentar de novo" que reexecuta a consulta |
| `wiki.$spaceId.index` | "Esta página ainda não tem subpáginas. Crie a primeira." com o botão "Nova página" em foco por padrão | `Skeleton` de árvore (três linhas recuadas), enquanto `getPageTree` está pendente | Toast de erro mais "Tentar de novo". A árvore anterior, se houver, permanece visível em vez de sumir |
| `wiki.$spaceId.paginas.$pageId.editar` | Não se aplica: a rota sempre tem um rascunho depois do passo 1 da seção 6.3 | `Skeleton` do editor (retângulo do tamanho da área de edição) até `getDraft` resolver | `DOK-E` do save vira lista de diagnósticos dentro do modo fonte (ADR 005, D-1), nunca um toast solto. Falha de rede no autosave mostra um indicador discreto "Não foi possível salvar" perto do título, sem bloquear a digitação, e tenta de novo no próximo ciclo de debounce |
| `wiki.$spaceId.revisao` | "Nenhuma revisão esperando por você neste espaço." sem ação, porque a origem de uma revisão nova é a tela de edição, não esta | `Skeleton` de lista (quatro linhas), mesmo padrão da listagem | Toast de erro mais "Tentar de novo" |

Foco e teclado: o diálogo de "Nova página" e o diálogo de conflito de publicação usam `Dialog` do shadcn (Radix), que já devolve o foco ao elemento que abriu o diálogo ao fechar, sem código adicional. Toda ação de linha (árvore de páginas, fila de revisão) é um elemento focável por teclado (`button`, nunca `div` com `onClick`), com `Tab` seguindo a ordem visual de cima para baixo. O alternador WYSIWYG/fonte e as ações de salvar/submeter ficam no cabeçalho da tela de edição, alcançáveis por `Tab` antes da área do editor.

Cor: toda cor desta camada vem dos tokens que `AppShell` já define (`--background`, `--border`, `--surface`, `--muted-foreground`, `--sidebar`, `--sidebar-border`, `--destructive`), sem hex novo. O aviso de conflito de rascunho (não bloqueante) e o diálogo de conflito de publicação (bloqueante) usam a mesma paleta de estado que o app já usa para erro (`--destructive`), a única diferença é o bloqueio da interação, não a cor.

### 6.6 SSR e cliente

Toda a camada roda sob `ssr: false`, herdado. Nenhuma rota desta camada precisa de SSR: a v1 do produto não pede indexação nem link direto para uma tela de edição ou revisão, que exigem sessão de qualquer forma. O isolamento do chunk do editor (ponto 6 do escopo) fica garantido pela combinação de dois fatos já verdadeiros no app, sem código novo de *splitting*: o `@tanstack/router-plugin` gera um chunk por arquivo de rota (medido no ADR 005 para `projetos.$projectId.tsx`), e nenhuma outra rota desta camada importa o componente de edição, só um `<Link>` para a URL dele.

### 6.7 Consumo da fatia `edit` sem arrastar a fatia `read`

`eslint.config.js` ganha um bloco novo, no mesmo padrão que a fatia F0 do ADR 002 já aplica a `src/content-format`, com `patterns`/`group` para pegar import relativo e com alias, não só o nome exato:

```js
{
  files: ["src/routes/_authenticated/projetos.$projectId.wiki.*.editar.tsx"],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["**/content-components/read", "**/content-components/read/**"],
            message: "A tela de edição usa só a fatia edit. A fatia read é do ADR 007, consumida pela tela de revisão.",
          },
        ],
      },
    ],
  },
}
```

`paths` com o nome literal (`"@/content-components/read"`) só barra quem escreve exatamente essa string. `no-restricted-imports` compara o texto do import como está escrito, então `"../../content-components/read"` ou `"@/content-components/read/index"` passariam por `paths` sem acusar nada, e o eliminatório W-03 (seção 3) ficaria sem verificação real. `group` com curinga (`**`) casa qualquer forma de chegar ao mesmo módulo, o mesmo mecanismo que a fatia F0 do ADR 002 já usa para barrar builtin do Node em `src/content-format` (`group: ["node:**"]`).

O `files` deste bloco casa só com o arquivo da rota de edição, e o texto desta ordem restringe a garantia ao mesmo alcance: nesta fatia, a tela de edição vive inteira em `wiki.$spaceId.paginas.$pageId.editar.tsx`, sem módulo próprio adicional, o mesmo padrão que `_authenticated/projetos.$projectId.tsx` já usa para o editor do Diagram Studio (um arquivo de rota grande, sem extrair helper de tela para fora dele). Alternativa descartada: abrir um diretório próprio para os módulos da tela de edição, com a regra escopada a ele em vez de a um arquivo. Descartada porque não há hoje nenhum módulo desta tela além do arquivo da rota para colocar num diretório, e inventar a estrutura antes de precisar dela contraria o restante do desenho desta camada. Custo aceito: se um dia a tela de edição ganhar um módulo auxiliar próprio (por exemplo, um hook de autosave extraído para reuso), esse arquivo não entra sob a regra de ESLint desta seção até o `files` ser estendido para cobri-lo, e a revisão de código é quem barra o import de `read` nesse intervalo.

## 7. Verificação de compatibilidade

### Para trás

| Contrato ou restrição | Situação | Evidência |
| :--- | :--- | :--- |
| ADR 003, `saveDraft` recebe `expectedVersion` e lança `DraftVersionConflictError` | Cumprida | Seção 6.3, passo 3 e 4 |
| ADR 003, `submitRevision` lança `RevisionConflictError` quando a base diverge da publicada | Cumprida | Seção 6.3, passo 6 |
| ADR 004, toda transição de status passa por `REVISION_TRANSITIONS`/`isTransitionAllowed` | Cumprida | Seção 6.4: os botões de ação só aparecem quando `isTransitionAllowed` devolve verdadeiro para o papel do usuário |
| ADR 004, autoaprovação bloqueada a menos que `allow_self_approval = true` | Cumprida | Seção 6.4 |
| ADR 005, o adaptador nunca chama o parser ou serializador da biblioteca no caminho de persistência | Herdada, sem mudança | Esta camada só chama `getTree()`/`serializeDok`, nunca acessa a biblioteca do editor diretamente |
| ADR 005, conteúdo com `DOK-E` abre só no modo fonte | Cumprida | Seção 6.3, passo 5 |
| ADR 005, `RevisionDiff`/`RevisionView` usam a fatia `read` do ADR 007 | Cumprida | Seção 6.4: só a tela de revisão importa esses componentes |
| Arquitetura base, cor só por token CSS | Cumprida | Seção 6.5 |
| Arquitetura base, nenhuma dependência nova sem contrato | Cumprida | Seção 5.1 (B2 eliminada por essa razão) |
| ADR 003, lista fechada de funções em `src/content-store/server.ts` | Estendida, aditivamente | Seção 6.1: `getSpaceList(workspaceId): Promise<Space[]>` entra no mesmo arquivo, mesma forma de leitura de `getPageTree`. Contrato de saída (seção 13) registra a extensão para o `LEDGER.md` acolher em nome do ADR 003 |
| ADR 004, lista fechada de funções em `src/editorial-flow/server.ts` | Estendida, aditivamente | Seção 6.4: `listPendingRevisions(spaceId): Promise<PageRevision[]>` entra no mesmo arquivo, filtrando pela projeção que o ADR 004 já mantém. Contrato de saída (seção 13) registra a extensão para o `LEDGER.md` acolher em nome do ADR 004 |

### Para frente

| Camada | Premissa que este ADR deixa | Evidência |
| :--- | :--- | :--- |
| Renderização (ADR 007) | As rotas de leitura pública ficam fora de `_authenticated`, porque conteúdo publicado precisa de SSR e indexação, que este ADR não usa | Seção 6.6 |
| Navegação e descoberta (ADR 008) | Um link para editar uma página aponta para `/projetos/:projectId/wiki/paginas/:pageId/editar`, o caminho exato publicado na seção 6.1 | Seção 6.1 |
| Tenancy (ADR 013) | Decide como um `content.spaces` é criado. Até lá, `wiki.index` assume que o espaço já existe | Seção 1, aviso |

## 8. Spike

Nenhum critério eliminatório da seção 3 ficou marcado com `?`. As duas decisões estruturais (seção 4) se resolvem por leitura direta do código do app e dos contratos já aceitos, sem biblioteca nova para testar. Sem spike.

## 9. Consequências

### Positivas

- A camada reaproveita três padrões já em produção no app (fronteira `_authenticated`, debounce de autosave, `AppShell`/`Dialog` do shadcn), sem introduzir mecanismo novo de autenticação, de estado global nem de sincronização.
- O isolamento do chunk do editor não exige configuração de *splitting* dedicada, porque o `@tanstack/router-plugin` já faz isso por rota, o mesmo mecanismo que o ADR 005 mediu.
- A diferenciação entre os dois erros de conflito do ADR 003 (não bloqueante para rascunho, bloqueante para publicação) dá ao produto o comportamento que a gravidade de cada erro pede, sem tratar os dois como o mesmo caso.

### Negativas

- O envio forçado de 30 segundos grava um `page_drafts` mesmo quando a pessoa está digitando sem parar por minutos, o que produz mais linhas de `version` incrementadas do que um esquema baseado só em inatividade. É custo aceito pelo produto trocar por menos perda de trabalho em caso de fechar a aba sem querer.
- O aviso não bloqueante de `DraftVersionConflictError` descarta silenciosamente qualquer edição feita entre o último autosave bem-sucedido e o momento do conflito, porque esta decisão não constrói merge entre as duas versões (o ADR 003 já registra merge automático como gatilho de reabertura próprio, não desta camada).
- `wiki.index` sem ação de criar espaço deixa um workspace com zero espaços sem caminho de saída dentro da Wiki. É a lacuna registrada na seção 1, aceita porque decidir criação de espaço aqui reabriria escopo que pertence ao ADR 013.

### Reversibilidade

Trocar o mecanismo de autosave (por exemplo, para um `Realtime` do Supabase por cima de `page_drafts`, premissa já registrada pelo ADR 003 para colaboração futura) não muda o schema nem a assinatura de `saveDraft`, só a lógica de quando chamá-la. Trocar a estrutura de rotas depois de aceita exige mover arquivos e reescrever os links do ADR 008, mas não afeta `content-store` nem `editorial-flow`, porque nenhuma tabela guarda caminho de URL.

## 10. Gatilhos de reabertura

- O produto exigir colaboração em tempo real na v1, o que reabre a decisão B da seção 4 e a premissa futura do ADR 003.
- O ADR 013 decidir uma forma de criar espaço que exija uma tela dentro da Wiki, não só no fluxo de tenancy, o que acrescenta uma fatia nova a esta camada.
- O ADR 007 decidir que páginas de leitura publicadas também exigem sessão, o que elimina a distinção entre `ssr: false` desta camada e SSR público que a seção 6.6 assume.
- O debounce de 2 s/30 s se mostrar curto ou longo demais depois de uso real (sinal: reclamação de perda de digitação, ou volume de `page_drafts.version` incrementando mais rápido do que o Postgres aguenta sob carga), o que reabre só o número, não o desenho da seção 6.3.

## 11. Fatias de implementação

Em ordem de dependência.

| # | Fatia | Depende de | Dias | Pronto quando |
| :- | :--- | :--- | ---: | :--- |
| G1 | Estrutura de rotas (`wiki.index`, `wiki.$spaceId.index`) e tela de listagem e criação de página | `getPageTree`/`createPage` (ADR 003, fatia que expõe `src/content-store/server.ts`) implementados no app | 2 | Árvore de páginas carrega, "Nova página" cria e navega para o editor da página nova, os três estados da seção 6.5 (vazio, carregamento, erro) cobertos para as duas rotas |
| G2 | Tela de edição, autosave e os dois erros de conflito | G1, adaptador e registro `edit` do ADR 005 (fatias F1/F2 daquele ADR), `saveDraft`/`submitRevision`/`getDraft`/`initializeDraftFrom` (ADR 003/004) implementados no app | 3 | Editor monta sobre o rascunho, autosave grava a cada 2 s de inatividade ou 30 s forçado, `DraftVersionConflictError` recarrega sem bloquear, `RevisionConflictError` abre o diálogo bloqueante, `DOK-E` força o modo fonte, regra de ESLint da seção 6.7 aplicada e sem violação |
| G3 | Tela da fila de revisão | G1, `REVISION_TRANSITIONS`/`castReviewVote`/`publishRevision`/`getSpaceEditorialPolicy` (ADR 004) implementados no app, `<RevisionDiff>` (ADR 005) | 2 | Fila lista revisões pendentes do espaço, botões de ação aparecem só quando `isTransitionAllowed` permite para o papel do usuário, autoaprovação desabilitada sem `allow_self_approval`, os três estados da seção 6.5 cobertos |

Total: 7 dias. As três fatias são obrigatórias: sem elas, a meta de `DEC-0004` (autor cria, edita, salva, submete, aprova e publica) continua sem tela nenhuma para acioná-la, o mesmo achado que originou este ADR.

### Base da estimativa

Nenhuma fatia teve spike (seção 8), então os números são estimativa informada a partir do escopo já fechado nesta seção, não medição.

- **G1 (2 dias).** Duas rotas simples (lista e diálogo de criação) sobre uma função de leitura e uma de escrita já com assinatura fechada (ADR 003). O trabalho é montar a árvore, o diálogo e os três estados de UI, sem lógica de negócio nova.
- **G2 (3 dias).** A tela mais densa desta camada: monta o adaptador do ADR 005, implementa o debounce com dois temporizadores (inatividade e forçado), dois fluxos de erro com UI distinta cada um, e a regra de ESLint da seção 6.7. Nenhuma peça individual é grande, a soma é.
- **G3 (2 dias).** Uma lista filtrada por status e por papel, com botões condicionais e um componente de diff já pronto (`RevisionDiff`, ADR 005) para embutir, não para construir.

## 12. Fora de escopo

| Assunto | Vai para |
| :--- | :--- |
| Renderização de leitura, resolução de URIs `dok:` | ADR 007 |
| Descoberta, árvore de navegação, backlinks | ADR 008 |
| Busca | ADR 009 |
| O componente de editor em si, o adaptador via DokAST | ADR 005 (já aceito) |
| Publicação pública e domínio customizado | ADR 011 |
| Papéis e RBAC completo de workspace | ADR 004 (já aceito, papéis por espaço) e ADR 013 (tenancy, convites, workspace) |
| Criação e gestão de um `content.spaces` | Sem dono definido, ver aviso da seção 1 e gatilho de reabertura |
| Merge automático entre revisores | ADR 004, gatilho de reabertura próprio |
| Colaboração em tempo real, CRDT | Futuro, premissa já registrada pelo ADR 003, reaberta pela seção 10 se virar requisito |

## 13. Contrato de saída

```yaml
adr: "006"
camada: "Shell da Wiki (caminho de escrita)"
status: "Aceito"
data: "2026-09-20"
decisao: "As rotas de escrita da Wiki entram sob a mesma fronteira _authenticated do Diagram Studio, herdando ssr:false e o code splitting por rota. O rascunho vive no cliente entre edições, sincronizado por saveDraft a cada 2 s de inatividade com envio forçado a cada 30 s. DraftVersionConflictError recarrega sem bloquear, RevisionConflictError bloqueia com diálogo. A tela de edição consome só a fatia edit do registro de diretivas, nunca a fatia read, reforçado por regra de ESLint."
dependencias: []
interfaces_publicadas:
  - nome: "Rotas /projetos/:projectId/wiki, /projetos/:projectId/wiki/paginas/:pageId, /projetos/:projectId/wiki/paginas/:pageId/editar"
    tipo: "rota"
    descricao: "src/routes/_authenticated/projetos.$projectId.wiki.*.tsx, seção 6.1. Todas herdam ssr:false e beforeLoad de _authenticated/route.tsx. Escopo fixado por DEC-0017; a rota de fila de revisão não tem escopo decidido e saiu do contrato"
  - nome: "getSpaceList(workspaceId): Promise<Space[]>"
    tipo: "função"
    descricao: "Extensão aditiva ao ADR 003, não interface nova desta camada. Entra em src/content-store/server.ts, seção 6.1. LEDGER.md acolhe esta função na entrada do ADR 003, não numa entrada nova para o 006"
  - nome: "listPendingRevisions(spaceId): Promise<PageRevision[]>"
    tipo: "função"
    descricao: "Extensão aditiva ao ADR 004, não interface nova desta camada. Entra em src/editorial-flow/server.ts, filtra currentStatus em submitted | in_review | changes_requested | approved, seção 6.4. LEDGER.md acolhe esta função na entrada do ADR 004, não numa entrada nova para o 006"
restricoes_impostas:
  - "Toda rota da Wiki entra sob src/routes/_authenticated/, nunca cria uma segunda fronteira de autenticação"
  - "O arquivo de rota da tela de edição nunca referencia src/content-components/read nem o renderer do ADR 007, em nenhuma forma de import (direta, relativa ou por alias), verificado por regra de ESLint com patterns/group (seção 6.7). Um módulo auxiliar futuro, fora do arquivo de rota, não está coberto por esta regra até o files do bloco ser estendido para incluí-lo"
  - "Toda escrita de rascunho passa por saveDraft com expectedVersion. DraftVersionConflictError sempre recarrega o rascunho do servidor antes de aceitar nova digitação, nunca é ignorado em silêncio"
  - "Toda submissão passa por submitRevision. RevisionConflictError bloqueia a tela até o autor escolher recarregar a partir da publicação atual ou cancelar, nunca prossegue sem essa escolha"
  - "Cor só por token CSS nas telas desta camada, mesma restrição da arquitetura base"
premissas_sobre_camadas_futuras:
  - camada: "Renderização (ADR 007)"
    premissa: "As rotas de leitura pública ficam fora de _authenticated, porque a publicação exige SSR e indexação que esta camada não usa"
  - camada: "Navegação e descoberta (ADR 008)"
    premissa: "Um link para editar uma página usa o caminho exato /projetos/:projectId/wiki/paginas/:pageId/editar publicado por este ADR"
  - camada: "Tenancy (ADR 013)"
    premissa: "Decide como um content.spaces é criado. Até essa decisão, a rota de índice da wiki assume que ao menos um espaço já existe no workspace"
riscos_abertos:
  - "Nenhum ADR decide criação de content.spaces. content.workspace_members é semeado por trigger para o dono do workspace, mas nenhuma função pública cria um espaço. wiki.index fica sem ação de saída quando o workspace tem zero espaços. Dono: ADR 013 ou uma decisão de produto ainda não tomada"
  - "O debounce de 2 s de inatividade com envio forçado de 30 s é escolha informada por analogia ao padrão de 400 ms já em produção para posição de nó, sem medição de uso real de digitação de texto nesta camada. Ajuste é o gatilho de reabertura da seção 10"
  - "DraftVersionConflictError descarta a diferença entre o rascunho local e o do servidor sem oferecer merge, porque o ADR 003 já registra merge automático como gatilho de reabertura de outra camada, não desta"
gatilhos_de_reabertura:
  - "Produto exigir colaboração em tempo real na v1, reabrindo a decisão B da seção 4"
  - "ADR 013 decidir criação de espaço com uma tela dentro da própria Wiki, acrescentando fatia a esta camada"
  - "ADR 007 decidir que leitura publicada também exige sessão, eliminando a distinção de SSR da seção 6.6"
  - "Uso real mostrar que 2 s ou 30 s produzem perda de digitação ou carga excessiva de escrita no Postgres"
```

## 14. Correção de 2026-09-20: o escopo das rotas

A versão aceita deste ADR publicou as rotas sob `/wiki/:spaceId`. A `DEC-0014`, do mesmo dia, fixou a hierarquia de quatro níveis e deu `project_id` a `content.pages`, citando o pedido de produto "wiki e diagramas para cada projeto". Os dois documentos ficaram aceitos e discordantes, e a discordância só apareceu quando a primeira tela foi construída.

A `DEC-0017` resolveu a favor do projeto, com aprovação do humano. O escopo das rotas passou de `:spaceId` para `:projectId`. O segmento `paginas` e a identificação por id continuam como estavam, porque só o escopo estava errado.

A rota `/wiki/:spaceId/revisao`, fila de revisão, saiu do contrato em vez de ser traduzida. Fila por projeto e fila por espaço servem a papéis diferentes, quem escreve olha o projeto e quem revisa costuma olhar o espaço inteiro, e a escolha não foi feita. Até ela ser feita, a rota não existe.

Custo aceito: página com `project_id` nulo, a página de espaço que a `DEC-0014` admitiu de propósito, fica sem endereço. O dado permanece correto no banco e inalcançável pela interface.
