# Estudo: vínculo entre página da wiki e diagrama, no modelo do draw.io no Confluence

**Pedido do humano (DDP-405, 2026-09-22):** "Quando vincularmos os diagramas, devemos usar a mesma abordagem do draw.io no Confluence. Consulte essa arquitetura de vínculo do diagrama draw.io com o Confluence e veja a melhor forma de resolvermos esse link. Alguns comportamentos que eu quero: 1. Quando vincularmos tem que ser como draw.io no Confluence. 2. Quando exportarmos para .md a wiki, vamos ter que transformar os diagramas em imagem, sem perder o link com o arquivo original (.dokdraw que no caso acredito ser melhor salvar como yaml)."

Pesquisa em 2026-09-22 na documentação oficial do draw.io. Cada fato traz o link.

## 1. Como o draw.io se vincula à página no Confluence Cloud

| Aspecto | O que o draw.io faz | Fonte |
| --- | --- | --- |
| Onde o diagrama vive | Como anexo da página. "Diagram data is only stored as attachments on pages in your Confluence Cloud instance, or on issues in your Jira Cloud instance and nowhere else." | [Data flow](https://www.drawio.com/docs/integrations/atlassian/data-flow-confluence-jira-cloud/) |
| Quais anexos | Três arquivos por diagrama: `<nome>.drawio` (o diagrama editável), `<nome>.png` (a prévia que a página mostra) e `~<nome>.drawio.tmp` (autosave do rascunho) | [Recuperar diagrama](https://www.drawio.com/doc/faq/confluence-cloud-recover-diagram-draft-page) |
| Como a página aponta | A macro "draw.io Diagram" no corpo da página referencia o anexo pelo nome do diagrama. Não existe "mover" diagrama: é copiar para a página nova e apagar a macro antiga, e a cópia "will not retain the revision history of the original diagram file" | [Mover diagrama](https://www.drawio.com/doc/faq/confluence-cloud-move-diagram) |
| Reuso em outra página | Macro "Embed draw.io diagram": "there is one master diagram (single source) that is simply displayed (embedded) in other locations using the diagram viewer. When you edit and save the original diagram, all embedded diagrams will be automatically updated". Funciona entre espaços. O viewer escolhe página e camadas do diagrama | [Embed and reuse](https://www.drawio.com/docs/integrations/atlassian/confluence/confluence-cloud-embed-diagram/) |
| Onde se edita | Só na página que contém o original: "You won't be able to edit the diagram from the Confluence page when you have used the Embed draw.io diagram macro. You'll need to go to the page that has the original diagram and edit it there" | [Editar embutido](https://www.drawio.com/docs/integrations/atlassian/confluence/confluence-cloud-edit-embedded-diagram/) |
| Histórico | O arquivo do diagrama tem histórico de revisão próprio, separado do histórico da página. Restaurar uma versão antiga do diagrama sem mexer na página é feito pelo editor do draw.io | [draw.io no Confluence Cloud](https://www.drawio.com/docs/integrations/atlassian/confluence/) |
| Quando quebra | "If you revert the page to an earlier version after deleting the draw.io diagram file, the draw.io macro on that page will show an error because the attachment is missing" | [Mover diagrama](https://www.drawio.com/doc/faq/confluence-cloud-move-diagram) |
| Exportação da página | O PDF é o único caso em que o dado sai do Atlassian: "Export to PDF. The operation is performed, the result returned and both the input and output are not persisted". O diagrama vai como imagem | [Data flow](https://www.drawio.com/docs/integrations/atlassian/data-flow-confluence-jira-cloud/) |
| Imagem que continua editável | Exportar PNG com "Include a copy of my diagram" grava o XML do diagrama dentro do arquivo, "by including the XML code in the zTXt section of the image file". O arquivo `.drawio.png` reabre no editor. Ressalva: sites que reamostram PNG apagam o metadado | [XML in PNG](https://www.drawio.com/docs/manual/export/xml-in-png/) |

Resumo do modelo: **um diagrama é um arquivo com dono e histórico próprios, a página o mostra por referência, quem reusa vê sempre a versão mais nova, e a imagem exportada carrega o diagrama dentro de si.**

## 2. O que o DokDraw já tem, pelo ledger

| Comportamento do draw.io | DokDraw hoje | Onde |
| --- | --- | --- |
| Diagrama com dono e histórico próprios | Diagrama vive em `public.projects` e `public.views`, mutável, **sem histórico de revisão** | ADR 001, conflito C-1 |
| Página aponta por referência | `::diagram[texto]{src="dok:diagram/<uuid>" view="<uuid>" title="..."}`, id estável, nunca título | ADR 002 |
| Reuso mostra sempre a versão mais nova | Resolução sempre dinâmica, `page_refs.target_rev_id` nulo por decisão | DEC-0019, ADR 003 e 004 |
| Quebra quando o anexo some | `page_refs` é consultada antes de excluir diagrama ou view | ADR 003, seção 6.6 |
| Viewer escolhe página e camadas | `view` escolhe a view do projeto. Camada não existe no modelo | ADR 002 |
| Edição só no original | Não decidido. A fatia `read` (ADR 007) exibe a view em modo leitura | ADR 007, não escrito |
| Exportar página com o diagrama como imagem | Não decidido. C-2: "geração estática de view ainda não tem dono" | ADR 007 e 010, não escritos |
| Imagem que carrega o diagrama | Não decidido. O prompt do ADR 010 pergunta sobre "sidecar .dokdraw.json no vault Obsidian" | ADR 010, pergunta 3 |

O vínculo em si já é o do draw.io: a diretiva `::diagram` é a macro "Embed", com fonte única e atualização automática. O que falta é o entorno: criar e editar o diagrama a partir da página, histórico do diagrama, e a exportação.

## 3. O que falta para "ser como o draw.io no Confluence"

Grupo A, no editor da página (ADR 005 já aceito, ADR 007 a escrever):

1. **Inserir diagrama novo de dentro da página.** Hoje a diretiva só aponta para uma view que já existe. No draw.io, "/draw" cria o arquivo e a macro de uma vez. No DokDraw: comando "Diagrama" no editor abre um seletor com "Criar novo" (cria a view no projeto da página, com o título da página como nome sugerido) e "Escolher existente" (busca por nome, mostra a prévia). Os dois inserem `::diagram` com os ids.
2. **Editar no lugar.** Clique na prévia do diagrama dentro da página abre o Diagram Studio na view certa, e "Voltar" retorna à página na mesma posição do texto. Igual ao lápis da macro do draw.io. Como no draw.io, quem edita é sempre o original: não existe cópia por página.
3. **Prévia estática na leitura.** A página publicada mostra uma imagem gerada da view (SVG), não o canvas interativo, com zoom em lightbox. É o `.png` de prévia do draw.io, gerado no servidor a cada salvamento da view (resolve C-2: o dono da geração estática é o Diagram Studio, no momento de salvar, e a fatia `read` só consome).

Grupo B, histórico (extensão do ADR 001, gatilho já registrado no ADR 004):

4. **Revisões do diagrama** com restauração pelo próprio Diagram Studio, separadas das revisões da página, como no draw.io. A DEC-0019 continua: a página mostra a versão mais nova. Quem quer o diagrama de uma data vai ao histórico do diagrama.

Grupo C, exportação (ADR 010 a escrever, com a direção do humano):

5. **Diagrama vira imagem na exportação para Markdown**, `diagramas/<slug-da-view>.png` (e `.svg` no perfil Obsidian e Starlight), referenciada por `![título](diagramas/<slug>.png)` no lugar da diretiva.
6. **O vínculo com o original não se perde.** Três camadas, da mais para a menos robusta:
   - Sidecar `diagramas/<slug>.dokdraw.yaml` ao lado da imagem, com o modelo da view (elementos, relacionamentos, nós da view, estilos, faixas) e um cabeçalho `dokdraw` com `project_id`, `view_id`, `revision` (quando o grupo B existir), `exported_at` e a URL do original.
   - O mesmo YAML gravado dentro do PNG, num chunk `iTXt` com chave `dokdraw`, como o draw.io faz com `zTXt`. A imagem sozinha basta para reimportar. Mesma ressalva do draw.io: hospedagem que reamostra apaga o chunk, por isso o sidecar é a camada principal e o chunk é a conveniência.
   - No `.md`, logo abaixo da imagem, um comentário `<!-- dok:diagram/<uuid>?view=<uuid> -->`. É saída, não DokMD armazenado, então o veto a HTML do ADR 002 não se aplica. Na reimportação, o comentário ou o sidecar recompõe `::diagram`.
7. **Formato do `.dokdraw`: YAML**, como o humano pediu. O pacote `yaml` já está na stack do ADR 002. O prompt do ADR 010 falava em `.dokdraw.json`: passa a `.dokdraw.yaml`.

## 4. Onde cada item entra

| Item | ADR | Estado |
| --- | --- | --- |
| 1, 2 | 007 Renderização (fatia `read` e ponte para o Diagram Studio), com a diretiva do ADR 002 | Prompt a ajustar antes de escrever |
| 3 | 007, resolvendo C-2 com o dono no Diagram Studio | Idem |
| 4 | Extensão do ADR 001 | Gatilho já no ADR 004. Abrir quando o grupo A fechar |
| 5, 6, 7 | 010 Exportação | Prompt a ajustar: pergunta 3 recebe a direção (YAML, sidecar mais chunk mais comentário) |

Nada aqui reabre ADR aceito. A DEC-0019 (sempre a versão mais nova) é exatamente o comportamento da macro Embed do draw.io e fica como está.

## 5. Alternativas descartadas

- **Diagrama como anexo da página, ao pé da letra do draw.io.** Descartada: o ADR 001 põe o diagrama no projeto, e a diretiva por id já dá o comportamento de fonte única sem duplicar o modelo em cada página. Custo aceito: "criar de dentro da página" precisa de um passo a mais (escolher o projeto quando a página pertence a mais de um).
- **Só o chunk dentro do PNG, sem sidecar.** Descartada pela ressalva do próprio draw.io: reamostragem apaga o metadado. O sidecar é a fonte, o chunk é a conveniência.
- **JSON no sidecar.** Descartada pela direção do humano. YAML é legível no diff do Git e no Obsidian, e o pacote já existe na stack.
- **Fixar a revisão do diagrama na página exportada.** Descartada: a página exportada carrega a imagem e o modelo do momento da exportação, o que já é uma fixação natural. Fixar dentro da wiki reabriria a DEC-0019.

## 6. Riscos

- O grupo B (revisões do diagrama) é a parte cara: tabela append-only para o modelo inteiro da view, no molde do ADR 003 para páginas.
- A prévia estática por salvamento (item 3) exige geração de SVG no servidor ou no cliente que salva. Se for no cliente, a página só vê prévia nova depois de alguém abrir o Diagram Studio. Decisão do ADR 007.
- Reimportar a partir do sidecar traz de volta um diagrama, não a identidade dele: se o `view_id` ainda existe no destino, a reimportação atualiza; se não existe, cria. Regra a fechar no ADR 010.
