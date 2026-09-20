# DEC-0004 — Meta da trilha de desenvolvimento

- **Data:** 2026-09-19
- **Decidido por:** humano, na conversa com a sessão A
- **Alcance:** trilha de desenvolvimento (sessão C)
- **Efeito:** destrava a criação de tarefas `D`

## Decisão

A trilha de desenvolvimento termina quando um autor conseguir **editar e publicar uma página da Wiki no app, ponta a ponta**: criar a página, editar o conteúdo em DokMD no MDXEditor, salvar o rascunho, submeter para revisão, aprovar e publicar.

## O que a meta cobre

As fatias de implementação dos quatro ADRs aceitos que participam desse caminho:

| ADR | Fatias | Estimativa |
| --- | --- | ---: |
| 002 Formato de conteúdo | F0 a F4 (núcleo, validação, URIs, save pipeline). F5 e F6 entram só se a migração do legado for pré-requisito de uma página real | 5 dias |
| 003 Armazenamento | S1 a S4 (schema, RLS, server functions, `page_refs`). S5 a S7 ficam fora, porque assets, lixeira e `sync_state` não estão no caminho de publicar uma página | 6,5 dias |
| 004 Fluxo editorial | E1 a E3 (tabelas e RLS, FSM, server functions de publicação). E4 a E6 ficam fora: comentário, notificação e resolução de `rev` não bloqueiam o caminho | 4,5 dias |
| 005 Edição | F1 a F4 (adaptador, registry, exceção ao colar `html`, lista frouxa). F5 depende do ADR 007. F6 a F8 são melhorias | a estimar |

## Fora da meta, e por quê

Busca, exportação, sincronização com o Drive, publicação pública e navegação dependem de ADRs que não existem. Renderização de leitura (ADR 007) fica de fora da meta, o que significa que a página publicada não tem visualização final nesta trilha. É uma consequência aceita: o recorte é o caminho de escrita, não o de leitura.

## Alternativa descartada

Uma meta menor, só o módulo `src/content-format` no app com as 30 fixtures rodando no Vitest. Descartada porque fecharia em uma sprint sem entregar nada observável por quem usa o produto, e deixaria a integração entre as camadas para depois, que é exatamente onde os ADRs podem estar errados.

## Custo aceito

Seis a sete sprints antes de qualquer entrega visível de ponta a ponta, e uma página publicada que ainda não tem tela de leitura própria. O risco de integração aparece tarde, na fatia F1 do ADR 005, quando o adaptador do editor encontra o `content-format` real pela primeira vez fora do spike.

## Pendência que a meta cria

A primeira sprint abre com um pedido `app-release`: a fatia F0 do ADR 002 exige as dependências do contrato no `package.json` do app, e o Lovable enxerga a `main`.
