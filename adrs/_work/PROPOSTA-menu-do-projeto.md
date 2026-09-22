# Proposta: toda configuração do projeto vive no menu do card

**Data:** 2026-09-22
**Pedido:** humano. "Toda e qualquer configuração do projeto tem que estar nos três pontinhos do card do projeto."
**Alcance:** lista de projetos (`/projetos`), cabeçalho das áreas do projeto (wiki, diagramas, editor) e as configurações que já existem no app.

## O que existe hoje

Levantado no app em 2026-09-22.

| Configuração | Onde está hoje | Onde grava |
| --- | --- | --- |
| Nome e descrição | Só na criação. Não existe renomear nem editar descrição | `public.projects` |
| Excluir projeto | Ícone de lixeira no card, visível só no hover | `public.projects`, cascata |
| Cabeçalho e rodapé de exportação | Aba "Cabeçalho e rodapé" no cabeçalho de toda área do projeto, e link no diálogo Baixar | `public.project_export_frames` |
| Famílias de formas ligadas | Botão "Mais formas" no painel do editor | `localStorage`, por pessoa e por projeto |
| Formato de exportação e "incluir faixas" | Diálogo Baixar do editor | `localStorage`, global, sem projeto |
| Formas favoritas | Estrela no painel do editor | `localStorage`, global |
| Esquema de cores e tema | Painel Detalhes e clique direito no canvas; rodapé da barra lateral | `localStorage`, preferência da pessoa |

O card do projeto não tem menu. O único menu de três pontinhos do app é o dos nós da árvore (`arvore-navegacao.tsx`), com Renomear, extras e Apagar.

## A proposta

Um componente só, `MenuDoProjeto`, com os três pontinhos. Ele aparece em dois lugares e tem os mesmos itens nos dois: no card da lista de projetos, sempre visível no canto direito, e ao lado do nome do projeto no cabeçalho das áreas (wiki, diagramas, editor), para não obrigar a voltar à lista no meio do trabalho. A aba "Cabeçalho e rodapé" sai do cabeçalho: configuração não é área.

```
⋯
  Renomear…              nome e descrição, diálogo igual ao de "Novo projeto"
  Cabeçalho e rodapé…    abre a tela que já existe
  Famílias de formas…    abre o diálogo "Mais formas" que já existe
  Exportação…            formato padrão (PNG, SVG, .drawio) e "incluir cabeçalho e rodapé"
  ────────
  Copiar link            URL do projeto na área de transferência, com toast
  ────────
  Excluir…               o mesmo AlertDialog de hoje, em vermelho
```

Regras:

- **Tudo que configura o projeto entra aqui, e só aqui.** Botão solto no card (a lixeira de hoje) e aba de configuração no cabeçalho deixam de existir. Quem criar uma configuração nova de projeto acrescenta um item neste menu, e nada mais.
- **Ordem fixa:** o que descreve o projeto, o que muda a saída dele, ação de compartilhar, ação destrutiva por último e separada.
- **O que é preferência da pessoa não entra:** tema, esquema de cores, formas favoritas. São dela, valem em qualquer projeto, e ficam onde estão.
- **O que é ação sobre conteúdo não entra:** criar diagrama, criar página, pastas. Isso é trabalho dentro da área, não configuração.
- **Sempre visível.** O botão fica no card em cor apagada, sem depender de hover, porque toque não tem hover. No cabeçalho das áreas ele fica ao lado do nome.

## O que muda no código, sem migração

1. `projects.functions.ts` ganha `updateProject(id, {name, description})`, com a mesma validação zod de `addProject`. O repositório ganha `updateProject`. A política RLS de `projects` já cobre, é `owner_id = auth.uid()`. Nenhuma coluna nova.
2. `projetos.index.tsx`: o card recebe `MenuDoProjeto`. A lixeira sai. O diálogo "Renomear" reaproveita o formulário de "Novo projeto".
3. `abas-projeto.tsx`: a aba "Cabeçalho e rodapé" sai. O cabeçalho das áreas recebe `MenuDoProjeto` ao lado do nome. O link "Editar cabeçalho e rodapé" do diálogo Baixar continua, porque quem está exportando quer chegar lá direto.
4. `mais-formas-dialog.tsx` passa a receber `projectId` e a poder abrir fora do editor. O botão "Mais formas" do painel continua, como atalho para o mesmo diálogo.
5. Exportação: as duas chaves globais de `localStorage` (`dokdraw-export-format`, `dokdraw-export-incluir-faixas`) viram uma chave por projeto, `dokdraw-exportacao-{projectId}`, lida pelo diálogo Baixar e pelo item "Exportação…" do menu.
6. "Copiar link": `navigator.clipboard.writeText` com a URL de `/projetos/{id}`, toast "Link copiado.", mesmo padrão dos links de diagrama.

## Fase 2, depois, com migração

Configuração de projeto gravada em `localStorage` é da pessoa e do navegador, não do projeto. Famílias ligadas e exportação padrão deveriam seguir o projeto para qualquer membro e qualquer máquina. Isso pede uma coluna `settings jsonb` em `public.projects`, categoria `app-release`, e entra quando o menu estiver na tela e aprovado. Membros por projeto entram só depois do ADR 013 (tenancy). Tipo do projeto (`kind`) não é editável e não entra.

## Alternativas descartadas

| Alternativa | Por que não |
| --- | --- |
| Uma página "Configurações do projeto" com abas, aberta por um item só do menu | Esconde as configurações atrás de dois cliques e quebra o pedido: a lista de configurações deixa de estar no menu |
| Menu só no card, sem repetir no cabeçalho das áreas | Renomear ou trocar o cabeçalho de exportação no meio da edição obrigaria a voltar à lista. O item continua sendo "do card", só fica alcançável de onde a pessoa está |
| Manter a lixeira no card fora do menu | Contradiz a regra de que tudo vive no menu, e um ícone destrutivo no hover é fácil de acionar sem querer |

## Custo aceito

A aba "Cabeçalho e rodapé" some do cabeçalho, e quem se acostumou com ela passa a achar pelo menu. Um item a mais de clique, em troca de um lugar só para tudo.

## Verificação

Na lista: o card mostra os três pontinhos sem hover, o menu tem os sete itens na ordem acima, Renomear altera nome e descrição e o card atualiza, Excluir pede confirmação e apaga, Copiar link mostra o toast. No editor: o menu ao lado do nome abre os mesmos itens, "Cabeçalho e rodapé…" leva à tela, "Famílias de formas…" abre o diálogo com as famílias do projeto marcadas, "Exportação…" muda o padrão que o diálogo Baixar mostra na próxima abertura. A aba "Cabeçalho e rodapé" não aparece mais. No celular, o botão do card responde ao toque.
