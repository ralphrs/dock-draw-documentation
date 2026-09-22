# DEC-0028: um design system central no Figma, com rascunhos em draft

**Data:** 2026-09-21
**Quem decidiu:** humano, em comentário na `DDP-246`
**Alcance:** organização dos arquivos do DokDraw no Figma, trabalho da sessão D

## A decisão

O design system do DokDraw vive num arquivo só, `design-system`, na raiz da pasta `dok draw app` do time SquadPro. O arquivo de hoje, "DokDraw — Formas do Diagram Studio" (`VomOXhYuTYoBTALAuT0r1e`), vira esse arquivo: muda de nome e vai para a raiz da pasta.

Proposta nova (forma, mudança de cor, ajuste de margem) nasce num arquivo pequeno em `dok draw app/draft`, feito para o humano validar. Aprovada, a sessão D consolida a proposta no `design-system`. O `design-system` só guarda o que foi aprovado.

Dentro do `design-system`, cada família de formas ganha a própria página: C4 Model, AWS, Básicas e assim por diante. O agrupamento por família pedido no mesmo dia continua, como página, e não como arquivo separado.

## O que esta decisão substitui

A `DDP-248` e o pedido seguinte do humano tinham criado uma biblioteca por família na subpasta `done`, começando por "DokDraw — Formas aprovadas (biblioteca)" (`gN8mZGcM6KXDP6iWkMQCHL`), a renomear para "DokDraw - Formas C4 Model Aprovadas". Com o arquivo central, essa biblioteca fica redundante. O conteúdo dela já está no `design-system`, e ela é arquivada depois da conferência.

Alternativa descartada: manter o arquivo central e as bibliotecas por família ao mesmo tempo. Cada forma aprovada viveria em dois lugares, e toda correção precisaria ser feita duas vezes, o que já foi registrado como risco na `DDP-248`.

## Lacuna declarada

O humano escreveu "design-system.figma (ou a extensão correta)". Arquivo do Figma não tem extensão visível na nuvem, e o nome fica `design-system`.

## Qual arquivo é o design-system, respondido em 2026-09-21

Na `DDP-368` o humano escolheu o arquivo **Design-System** (`gN8mZGcM6KXDP6iWkMQCHL`), a antiga biblioteca, e não o arquivo de trabalho `VomOXhYuTYoBTALAuT0r1e` que esta decisão tinha indicado. O Design-System recebe tudo o que já foi aprovado, organizado por camadas: fundação (temas, paletas, tipografia, espaçamento), componentes de base (moldura, alça de conexão), conexões e uma camada por família de formas (C4 Model, AWS, Básicas). O arquivo `VomOXhYuTYoBTALAuT0r1e` deixa de ser o central e vira fonte da migração. O que não foi aprovado continua em arquivos de draft.

## Emenda de 2026-09-22: `done` volta como arquivo do aprovado, e toda aprovação gera consolidação

O humano procurou a pasta `dok draw app/done` e não encontrou nada, e reafirmou o fluxo que espera: o `Design-System` na raiz de `dok draw app` sempre na versão mais recente, recebendo em camadas o que vai sendo aprovado, e o arquivo de proposta aprovado saindo de `draft` para `done`.

O que faltava no processo, e passa a valer:

1. **Toda aprovação do humano numa revisão nos dois temas gera, no mesmo ciclo, um card de consolidação para a sessão D.** O card nomeia a página do `Design-System` (`gN8mZGcM6KXDP6iWkMQCHL`) que recebe a forma, a camada (fundação, componentes de base, conexões, ou a família: C4 Model, Básicas, AWS, Azure, Google Cloud, OCI, Tecnologias, UML, BPMN) e as regras aceitas na revisão. A sessão A abre esse card. Sem ele, a forma fica aprovada só no draft, que foi o que aconteceu com cilindro e contêiner genéricos (`DDP-338`) e ator (`DDP-343`).
2. **`done` é o arquivo das propostas aprovadas**, não uma biblioteca. O arquivo de draft aprovado vai inteiro para `dok draw app/done`, com o nome que já tem, e fica como registro de como a proposta foi validada. A biblioteca por família continua descartada, como esta decisão já dizia.
3. **A API do Figma não move nem renomeia arquivo** (`DDP-368`). Quem move é o humano. Por isso o card de consolidação termina com a lista dos arquivos a mover, e a sessão A abre um card de rótulo `humano` com essa lista assim que a consolidação é aceita.

Custo aceito: um gesto manual do humano por lote de aprovações. Alternativa descartada: pedir à sessão D que recrie o conteúdo aprovado num arquivo novo dentro de `done`, o que duplicaria o desenho e perderia o histórico da proposta.

## Emenda de 2026-09-22 (tarde): pastas com identificador, nome do arquivo vivo e criação direto em `draft`

O humano fixou a estrutura com os links das pastas e pediu que nenhum design novo avance antes de ela estar aplicada:

| Lugar | Identificador | Papel |
| --- | --- | --- |
| `dok draw app` (raiz) | `658360362` | Só o arquivo vivo `design-system-latest` |
| `dok draw app/draft` | `658381844` | Proposta em andamento ou aguardando aprovação |
| `dok draw app/done` | `658381968` | Proposta aprovada, arquivada |

O arquivo central `gN8mZGcM6KXDP6iWkMQCHL` passa a chamar `design-system-latest`. A API não renomeia documento (teste em 2026-09-22: `figma.root.name` responde "Setting the document name is currently not supported"), então o nome é gesto do humano, pedido na `DDP-449`.

A sessão D cria todo arquivo novo com `create_new_file` e `projectId: "658381844"`, direto em `draft`. Isso fecha a causa dos arquivos soltos na raiz do time. O guia completo, com o ciclo de vida e a tabela do que a API faz, está em `guia-sessoes/FIGMA-ORGANIZACAO.md`, e o prompt da sessão D aponta para ele.

Custo aceito: mover e renomear continuam manuais. Alternativa descartada: usar a API REST do Figma com token do humano para mover arquivos, que a API REST também não oferece.
