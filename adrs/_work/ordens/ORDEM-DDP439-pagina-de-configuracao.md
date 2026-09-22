# Ordem DDP-439: página de configuração do projeto, aberta pelos três pontinhos do card

**Issue:** `DDP-439` (proposta aprovada pelo humano em 2026-09-22, texto em `adrs/_work/PROPOSTA-menu-do-projeto.md`, protótipo https://claude.ai/artifact/PkmdDtqkiX2MzqEn5gpmwz). Inclui a fase 1 da `DDP-441` (ordenar a lista por critério).
**App:** `dok-draw-app`. Sem migração, sem dependência nova, sem publicação.

## O que fazer

**1. Renomear projeto no servidor.** Em `src/application/projects.functions.ts`, `updateProject`: `inputValidator` com `projectId` uuid, `name` 1 a 120 e `description` até 500 (mesmo zod de `addProject`), handler chama `updateProject(supabase, projectId, {name, description})` do repositório e devolve o `C4Project`. Em `src/infrastructure/supabase/c4-repository.ts`, `updateProject` faz `update({name, description, updated_at: new Date().toISOString()})` em `projects` por `id`, `select("*").single()`, `toProject`. Acrescente `createdAt: row.created_at` a `toProject` e `createdAt: string` a `C4Project` em `src/domain/c4/types.ts`. A RLS `projects_owner_all` já cobre.

**2. Menu do card.** Componente novo `src/components/projeto/menu-do-projeto.tsx`, `MenuDoProjeto({projectId, nome, onExcluir})`, com `DropdownMenu` no padrão de `arvore-navegacao.tsx` (linhas 736 a 766): gatilho `button` com `MoreHorizontal`, `aria-label="Ações de {nome}"`, sempre visível em `text-muted-foreground`, sem `opacity-0`. Itens, nesta ordem: **Configurações…** (`Settings`, `navigate` para `/projetos/$projectId/configuracoes`), **Copiar link** (`Link2`, `navigator.clipboard.writeText(`${location.origin}/projetos/${projectId}`)` e `toast.success("Link copiado.")`), separador, **Excluir…** (`Trash2`, `className="text-destructive"`, chama `onExcluir`). O gatilho e os itens fazem `e.stopPropagation()` para não abrir o projeto.

**3. Lista de projetos**, `src/routes/_authenticated/projetos.index.tsx`. O `Button` da lixeira (linhas 119 a 130) sai e entra `<MenuDoProjeto>` no mesmo lugar (`absolute right-2 top-2`), com `onExcluir` abrindo o `AlertDialog` que já existe. Ao lado de "Novo projeto", um `Select` "Ordenar" com `Atualizado` (padrão), `Nome A–Z` e `Criado`, gravado em `localStorage` na chave `dokdraw-ordem-projetos` com `try/catch` (padrão de `src/lib/formas.tsx`). A ordenação é no cliente sobre `projects.data`: `updatedAt` decrescente, `name.localeCompare(…, "pt-BR")`, `createdAt` decrescente.

**4. Rota de layout** `src/routes/_authenticated/projetos.$projectId.configuracoes.tsx`: `AppShell fullBleed editorMode`, cabeçalho igual ao de `projetos.$projectId.diagramas.index.tsx` (linhas 355 a 362) com `ArrowLeft` para `/projetos/$projectId/diagramas`, breadcrumb `Projetos › {nome} › Configurações` e `AbasProjeto ativo="diagramas"` sem destaque (passe `ativo={undefined}`, ver item 6). Abaixo, `flex min-h-0 flex-1`: `nav` à esquerda com 220px, grupos e itens como `Link` com `activeProps`: **Projeto**: Geral (`/configuracoes`, `activeOptions={{exact: true}}`). **Wiki**: Wiki (`/configuracoes/wiki`). **Diagramas**: Diagramas (`/configuracoes/diagramas`), Cabeçalho e rodapé (`/configuracoes/cabecalho-rodape`). **Pessoas**: Membros (`/configuracoes/membros`). Por último, separado, **Zona de perigo** em `text-destructive`, `Link` para `/configuracoes` com `hash="zona-de-perigo"`. À direita, `<Outlet />` em `min-w-0 flex-1 overflow-y-auto`. Abaixo de `md`, a `nav` vira uma linha horizontal com rolagem no topo.

**5. A tela de cabeçalho e rodapé vira filha do layout.** `projetos.$projectId.configuracoes.cabecalho-rodape.tsx` passa a renderizar só o conteúdo: sai o `AppShell` e o `header` próprio (linhas 334 a 347), fica o `div` de `flex min-h-0 flex-1` com as abas, as zonas e a prévia. O `input` de arquivo continua. Nada mais muda nessa tela.

**6. Abas do projeto.** Em `src/components/wiki/abas-projeto.tsx`, a aba "Cabeçalho e rodapé" sai e `ativo` passa a `"diagramas" | "wiki" | undefined`. Nos três cabeçalhos que usam as abas, `projetos.$projectId.wiki.tsx` (linha 166), `projetos.$projectId.diagramas.index.tsx` (linha 362) e `projetos.$projectId.diagramas.$viewId.tsx` (linha 2278), entra logo depois de `<AbasProjeto>` um `Button variant="ghost" size="icon" asChild` com `Settings`, `aria-label="Configurações do projeto"`, `Link` para `/projetos/$projectId/configuracoes`. O link "Editar cabeçalho e rodapé" do diálogo Baixar (`$viewId.tsx`, linhas 2340 a 2346) continua apontando para `/configuracoes/cabecalho-rodape`.

**7. Seção Geral**, `projetos.$projectId.configuracoes.index.tsx`. `fetchProject` com `queryKey ["project", projectId]`. Formulário com `Label`, `Input` Nome e `Textarea` Descrição (mesmos campos e limites do diálogo "Novo projeto"), preenchidos quando a consulta chega, botão "Salvar" desabilitado sem mudança ou com nome vazio; ao salvar, `updateProject`, `invalidateQueries` de `["project", projectId]` e `["projects"]`, `toast.success("Projeto salvo.")`. Abaixo, só leitura: Tipo (`kind`, "C4"), Criado em e Atualizado em (`toLocaleString("pt-BR")`). No fim, bloco `id="zona-de-perigo"` com título "Zona de perigo", texto "Excluir apaga elementos, relacionamentos, visões, pastas e o cabeçalho e rodapé. Não dá para desfazer." e botão `variant="destructive"` "Excluir projeto…" que abre o mesmo `AlertDialog` da lista; ao concluir, `removeProject`, invalida `["projects"]`, `navigate` para `/projetos`, toast "Projeto excluído.".

**8. Seção Wiki**, `configuracoes.wiki.tsx`. Título "Wiki", `Badge` "Liga quando a wiki gravar no banco", e dois `Select` desabilitados: "Página inicial" (opção única "Primeira página da árvore") e "Ordem da árvore" (Alfabética, Manual). Sem gravação. Texto curto: "A wiki deste projeto ainda lê dados em memória. Estes campos passam a valer quando ela gravar no banco."

**9. Seção Diagramas**, `configuracoes.diagramas.tsx`. Extraia de `src/components/editor/mais-formas-dialog.tsx` o miolo (busca, categorias, cards com `Checkbox`, rodapé "N famílias ligadas") para `src/components/editor/familias-de-formas.tsx`, `FamiliasDeFormas({familias, onChange})`, e faça o diálogo usá-lo sem mudar o comportamento do diálogo. Na seção, `useFamiliasLigadas(projectId)` alimenta o componente e o botão "Salvar" grava com `setFamilias`. Abaixo, "Nível inicial de um diagrama novo": `Select` Contexto, Contêiner, Componente, gravado em `localStorage` na chave `dokdraw-nivel-inicial-{projectId}` por um hook `useNivelInicial(projectId)` em `src/lib/formas.tsx`, no mesmo padrão de `useFamiliasLigadas`. Em `projetos.$projectId.diagramas.index.tsx`, onde "Novo diagrama" chama `addView`: se já existe escolha de nível, o padrão passa a ser essa preferência; se não existe, o nível passa a ser a preferência (hoje é fixo).

**10. Seção Membros**, `configuracoes.membros.tsx`. Título "Membros", uma linha "Você · Dono" com o e-mail de `supabase.auth.getUser()` (cliente já usado em `_authenticated/route.tsx`), e `Badge` "Convites por projeto chegam com o ADR 013". Nada mais.

## O que não fazer aqui

- Nenhuma migração, nenhuma coluna, nada em `drizzle/` nem em `supabase/`.
- Nada de exportação na página. O diálogo Baixar não muda.
- Não mexa em `content.*`, em `.env*` nem no bucket.
- Não crie ordem manual de projetos (fase 2 da `DDP-441`, por pessoa, com tabela própria).

## Tabela de restrições do contrato

| Restrição (`LEDGER.md` e decisões) | Onde esta ordem cumpre |
| --- | --- |
| Configuração de projeto vive na página aberta pelo card (`DDP-439`) | Itens 2 a 4 |
| Exportar é ação por diagrama ou aba, não configuração (`DDP-439`) | "O que não fazer" |
| Pasta é `view_folders` e tela de cabeçalho e rodapé é `project_export_frames` (`DEC-0022`, `DDP-392`) | Item 5 não toca nos dados |
| Dependência nova só com justificativa em ADR | Nenhuma |

## Verificação

Na lista: o card mostra os três pontinhos sem hover; o menu tem Configurações, Copiar link e Excluir; Copiar link mostra o toast e a área de transferência tem a URL; Excluir pede confirmação e apaga; clicar no menu não abre o projeto; "Ordenar" muda a ordem e a escolha sobrevive a recarregar a página. Na página: as seções aparecem na navegação lateral e a ativa fica destacada; Geral altera nome e descrição, o card e o cabeçalho do editor atualizam; "Zona de perigo" rola até o bloco e excluir volta para a lista; Wiki mostra o aviso com os campos desabilitados; Diagramas marca famílias e o painel do editor reflete sem recarregar; o nível inicial escolhido vale no próximo "Novo diagrama"; Cabeçalho e rodapé funciona dentro da página, com prévia e envio de imagem; Membros mostra o dono. Nos três cabeçalhos (wiki, diagramas, editor) a engrenagem abre a página e a aba "Cabeçalho e rodapé" não aparece mais. O diálogo Baixar continua com o link para a tela. Em 390px, a navegação lateral vira linha no topo e o menu do card responde ao toque.

## Restrições

- Não aplique nada no banco. Não publique.
- Não toque `.env*`.
- Nenhum contrato do ledger muda.
