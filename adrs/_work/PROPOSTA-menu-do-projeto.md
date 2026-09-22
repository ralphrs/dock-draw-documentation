# Proposta: a página de configuração do projeto, aberta pelos três pontinhos do card

**Data:** 2026-09-22, segunda versão no mesmo dia
**Pedido:** humano. "Toda e qualquer configuração do projeto tem que estar nos três pontinhos do card do projeto." E, sobre a primeira versão: "O projeto pode ter muita página na wiki e muito diagrama. Então a página de configuração do projeto tem que abranger os dois mundos. É uma página de configuração. Exportar imagem não pode ir ali, pois não faz sentido. A exportação dos diagramas tem que ser por diagrama ou por aba do diagrama."
**Alcance:** lista de projetos (`/projetos`), cabeçalho das áreas do projeto e as configurações que já existem no app.

## O que existe hoje

Levantado no app em 2026-09-22.

| Configuração | Onde está hoje | Onde grava |
| --- | --- | --- |
| Nome e descrição | Só na criação. Não existe renomear nem editar descrição | `public.projects` |
| Excluir projeto | Ícone de lixeira no card, visível só no hover | `public.projects`, cascata |
| Cabeçalho e rodapé | Aba "Cabeçalho e rodapé" no cabeçalho de toda área do projeto, rota `/projetos/{id}/configuracoes/cabecalho-rodape` | `public.project_export_frames` |
| Famílias de formas ligadas | Botão "Mais formas" no painel do editor | `localStorage`, por pessoa e por projeto |
| Formato de exportação e "incluir faixas" | Diálogo Baixar do editor | `localStorage`, global |
| Wiki | Nenhuma configuração. A wiki ainda lê dados em memória | nada |
| Membros | Nenhuma configuração por projeto. Acesso é global por convite | `public.invites` |

O card do projeto não tem menu. O único menu de três pontinhos do app é o dos nós da árvore (`arvore-navegacao.tsx`).

## A proposta

### O menu do card

Três pontinhos sempre visíveis no canto do card, sem depender de hover. Três itens:

```
⋯
  Configurações…    abre a página de configuração do projeto
  Copiar link       URL do projeto na área de transferência, com toast
  ────────
  Excluir…          a confirmação de hoje, em vermelho
```

A lixeira do hover sai. Dentro das áreas do projeto (wiki, diagramas, editor), o nome do projeto no cabeçalho ganha um ícone de engrenagem que abre a mesma página, para não obrigar a voltar à lista. A aba "Cabeçalho e rodapé" sai do cabeçalho: ela vira uma seção da página.

### A página de configuração

Rota `/projetos/{id}/configuracoes`, uma página só, com navegação lateral por seção. A tela de cabeçalho e rodapé já mora nesse caminho e passa a ser uma das seções. Cada seção diz de que mundo é.

| Seção | O que tem na fase 1 | O que entra depois |
| --- | --- | --- |
| **Geral** | Nome, descrição. Tipo (`kind`) só leitura. Criado em, atualizado em | Ícone ou cor do projeto |
| **Wiki** | Página inicial da wiki (qual página abre ao entrar) e ordem da árvore (alfabética ou manual). As duas ficam desligadas com o aviso "chega com a wiki gravada no banco", porque hoje a wiki lê memória | Estados do fluxo editorial (ADR 004), quem pode publicar, modelo de página nova |
| **Diagramas** | Famílias de formas ligadas ao projeto (o diálogo "Mais formas" vira esta seção; o botão do painel continua como atalho). Nível inicial de novo diagrama | Esquema de cores padrão do projeto, tamanho de página padrão |
| **Cabeçalho e rodapé** | A tela que já existe, sem mudança, agora dentro da página | Modelos prontos |
| **Membros** | Só o dono, listado. Aviso "convites por projeto chegam com o ADR 013" | Convite, papel por projeto |
| **Zona de perigo** | Excluir projeto, a mesma confirmação do menu | Arquivar, transferir de workspace |

Regras:

- **Configuração do projeto vive na página, e a página abre pelos três pontinhos.** Quem criar uma configuração nova de projeto acrescenta uma seção ou um campo aqui, e nada mais.
- **Os dois mundos têm lugar desde o começo.** A seção Wiki existe na fase 1 mesmo com os campos desligados, para a página nascer com a forma certa e a wiki não chegar depois sem endereço.
- **Exportar não é configuração.** O diálogo Baixar continua no diagrama, e é lá que se escolhe formato e se inclui cabeçalho e rodapé. Com as abas de diagrama (`DEC-0021`), o diálogo ganha o alcance: "esta aba" ou "todas as abas", uma imagem por aba. A preferência de formato fica no próprio diálogo, lembrando a última escolha, sem nada na página de configuração.
- **Preferência da pessoa não entra:** tema, esquema de cores da pessoa, formas favoritas. Valem em qualquer projeto e ficam onde estão.
- **Ação sobre conteúdo não entra:** criar diagrama, criar página, pastas.

## O que muda no código, sem migração

1. `projects.functions.ts` ganha `updateProject(id, {name, description})`, com a mesma validação zod de `addProject`. O repositório ganha `updateProject`. A política RLS de `projects` já cobre, `owner_id = auth.uid()`. Nenhuma coluna nova.
2. `projetos.index.tsx`: o card recebe o menu de três pontinhos com os três itens. A lixeira sai.
3. Rota nova `projetos.$projectId.configuracoes.tsx` como layout com a navegação lateral e `Outlet`; `configuracoes.index.tsx` (Geral), `configuracoes.wiki.tsx`, `configuracoes.diagramas.tsx`, `configuracoes.membros.tsx`. A rota `configuracoes.cabecalho-rodape.tsx` continua no mesmo caminho, e só troca o cabeçalho próprio pela navegação lateral do layout.
4. `abas-projeto.tsx`: a aba "Cabeçalho e rodapé" sai. O cabeçalho das áreas ganha a engrenagem ao lado do nome, ligando para `/projetos/{id}/configuracoes`.
5. Seção Diagramas: `useFamiliasLigadas(projectId)` já existe. A seção mostra o mesmo conteúdo do `MaisFormasDialog`, em página, gravando na mesma chave. Nível inicial de novo diagrama: chave nova `dokdraw-nivel-inicial-{projectId}`, lida por "Novo diagrama".
6. Diálogo Baixar: ganha "Alcance: esta aba / todas as abas" quando o diagrama tiver mais de uma aba. Enquanto não houver abas, o controle não aparece.
7. "Copiar link": `navigator.clipboard.writeText` com a URL de `/projetos/{id}`, toast "Link copiado.".

## Fase 2, depois, com migração

Configuração gravada em `localStorage` é da pessoa e do navegador, não do projeto. Famílias ligadas, nível inicial e o que a seção Wiki ligar precisam seguir o projeto para qualquer membro e qualquer máquina. Isso pede `settings jsonb` em `public.projects`, categoria `app-release`, e entra quando a página estiver na tela e aprovada. Membros por projeto entram só depois do ADR 013 (tenancy). Os campos da seção Wiki ligam quando a wiki gravar no banco (S2 e S3 do ADR 003).

## Alternativas descartadas

| Alternativa | Por que não |
| --- | --- |
| Menu do card com um item por configuração (primeira versão desta proposta) | Não escala: com muitas páginas e diagramas, a configuração do projeto tem mais campos do que cabe num menu, e os dois mundos não teriam lugar próprio |
| Exportação como seção da página de configuração | Exportar é ação sobre um diagrama ou uma aba, com escolha na hora. Configuração de projeto não sabe qual diagrama a pessoa quer |
| Duas páginas, uma de wiki e uma de diagramas | O projeto é um só e o card também. Duas páginas obrigam a saber antes onde cada campo mora |
| Página de configuração alcançável só pelo card | Trocar o cabeçalho de exportação no meio da edição obrigaria a voltar à lista. A engrenagem no cabeçalho leva ao mesmo lugar |

## Custo aceito

A aba "Cabeçalho e rodapé" some do cabeçalho, e quem se acostumou passa a achar pela engrenagem ou pelo menu. Na fase 1 a seção Wiki e a seção Membros nascem quase vazias, com o aviso do que falta. É preferível a esconder os dois mundos até terem campo.

## Verificação

Na lista: o card mostra os três pontinhos sem hover, o menu tem Configurações, Copiar link e Excluir, Excluir pede confirmação e apaga, Copiar link mostra o toast. Na página: as seis seções aparecem na navegação lateral, Geral altera nome e descrição e o card atualiza, Diagramas marca famílias e o painel do editor reflete, Cabeçalho e rodapé continua funcionando com a prévia, Wiki e Membros mostram o aviso. No editor: a engrenagem ao lado do nome abre a página, a aba "Cabeçalho e rodapé" não aparece mais, o diálogo Baixar não mudou de lugar. No celular, o botão do card responde ao toque e a navegação lateral vira lista no topo.
