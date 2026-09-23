# Ordem DDP-536: subpasta recém-criada não renomeia até recarregar (RT-F05)

**Issue:** `DDP-536`, defeito achado pela rodada 1 do plano de regressão (`DDP-524`, caso RT-F05, preview no commit `b5c15ed`). Tela: lista de diagramas do projeto.
**App:** `dok-draw-app`. Sem migração, sem campo novo no banco, sem dependência nova, sem publicação nesta ordem.

## Por que

Em `src/routes/_authenticated/projetos.$projectId.diagramas.index.tsx`, `criarPasta` (linha 180) insere a pasta na árvore da tela com um id provisório e, quando o banco responde, troca o provisório pelo real assim (linhas 200 a 202):

```ts
const comReal = (queryClient.getQueryData<NoDiagramaArvore[]>(chave) ?? []).map((n) =>
  n.id === provisorio ? { ...n, id: pasta.id, title: pasta.name } : n,
);
```

O `map` só percorre o nível raiz. Uma pasta criada dentro de outra fica com o id provisório na árvore da tela até a próxima leitura do banco. Três sintomas saem daí:

1. O campo de nome não abre depois de criar dentro de pasta. `criarFilho` em `src/components/arvore/arvore-navegacao.tsx` (linha 241) recebe o id real de `aoClicar` e chama `setEdicao` com ele, mas nenhum item da árvore tem esse id, então nenhuma linha entra em edição. Na raiz o campo abre, porque ali a troca acontece.
2. Renomear pela ação "Renomear" manda o id provisório a `patchViewFolder`. O `z.string().uuid()` aceita, porque o provisório vem de `crypto.randomUUID()`, o banco não acha a linha e a tela mostra "Não foi possível renomear a pasta.".
3. Mover ou apagar essa pasta antes de recarregar falha pelo mesmo motivo.

`criarDiagrama`, logo abaixo (linha 218), já faz a troca com uma função recursiva `trocar` e não tem o problema.

## O que fazer

**1. Troca recursiva em `criarPasta`.** Substituir as linhas 200 a 202 por uma função recursiva no mesmo molde da de `criarDiagrama`:

```ts
const trocar = (lista: NoDiagramaArvore[]): NoDiagramaArvore[] =>
  lista.map((n) =>
    n.id === provisorio
      ? { ...n, id: pasta.id, title: pasta.name }
      : { ...n, children: trocar(n.children) },
  );
escrever(trocar(queryClient.getQueryData<NoDiagramaArvore[]>(chave) ?? []));
```

Com isso os sintomas 1, 2 e 3 somem juntos: o campo de nome abre em qualquer nível e renomear, mover e apagar mandam o id real.

**2. Mensagem certa ao mover para onde já existe irmã com o mesmo nome.** `mover` (linha 277) trata qualquer erro com "Não foi possível mover. O destino não é válido.". O banco devolve `23505` nesse caso, e `moveViewFolder` em `src/infrastructure/supabase/c4-repository.ts` (linha 445) não passa por `recusarNomeRepetido` como `createViewFolder` e `updateViewFolder` passam. Duas mudanças:

- Em `moveViewFolder` do repositório, guardar o resultado do `update`, chamar `recusarNomeRepetido(result.error)` antes de `unwrap`, no mesmo desenho de `updateViewFolder` (linha 438).
- Em `mover` da rota, o `catch` passa a distinguir: `eNomeRepetido(erro)` mostra "Já existe uma pasta com esse nome aqui.", qualquer outro erro mantém "Não foi possível mover. O destino não é válido.". `eNomeRepetido` já existe no arquivo (linha 105).

**3. Conferir** no preview, no projeto `Regressão`: criar pasta na raiz, criar pasta dentro dela, ver o campo de nome abrir nos dois casos, renomear a subpasta na hora sem recarregar, mover a subpasta para a raiz e de volta, apagar a subpasta, tudo sem recarregar a página e sem toast de erro. Depois criar duas pastas irmãs com o mesmo nome e arrastar uma pasta para dentro de outra que já tem irmã com o mesmo nome: as duas vezes com "Já existe uma pasta com esse nome aqui.". Um ciclo (pasta para dentro da própria subpasta) continua recusado com a mensagem de destino inválido.

## O que não fazer aqui

- Não mexer em `arvore-navegacao.tsx`: o componente está certo, ele só recebe o id errado.
- Não mexer na lista da wiki (`projetos.$projectId.wiki.tsx`): a árvore de páginas tem outro repositório e não entrou na rodada.
- Nenhuma migração. O índice único `view_folders_name_parent_unique` já existe (`DDP-311`) e é ele que devolve `23505`.
- Nenhum texto de tela cita tarefa, ADR, ordem ou sessão (`DEC-0041`).

## O que fica em aberto (lacuna declarada)

- `view_folders.updated_at` não muda ao renomear nem ao mover: não há gatilho de `updated_at` na tabela. Não é desta ordem, fica registrado em `DDP-539`.

## Tabela de restrições do contrato

| Restrição (`LEDGER.md` e decisões) | Onde esta ordem cumpre |
| --- | --- |
| Quem escreve código no app é o Lovable (`DEC-0007`) | Ordem enviada por `send_message`, sem commit das sessões |
| Commit direto na `main` atualiza o preview, publicar é ação separada (`DEC-0007`) | Sem `deploy_project` nesta ordem |
| Dependências novas só com justificativa em ADR | Nenhuma dependência nova |
| Pastas de diagrama: nome único por pasta-mãe, `NULLS NOT DISTINCT` (`DDP-311`, `DDP-421`) | Item 2 só repassa o `23505` que o índice já devolve, sem regra nova |
| Nenhum texto de tela com referência interna (`DEC-0041`) | As duas mensagens novas não citam nada interno |
