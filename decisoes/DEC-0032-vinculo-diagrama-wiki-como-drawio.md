# DEC-0032: vínculo página-diagrama no modelo do draw.io no Confluence, e exportação com sidecar `.dokdraw.yaml`

**Data:** 2026-09-22
**Quem decidiu:** humano, em comentário na `DDP-405`
**Alcance:** ADR 007 (Renderização), extensão do ADR 001 (revisões de diagrama) e ADR 010 (Exportação). Nenhum ADR aceito reabre.

## A decisão

O vínculo entre página da wiki e diagrama segue o modelo do draw.io no Confluence: o diagrama tem dono e histórico próprios, a página o mostra por referência, quem reusa vê sempre a versão mais nova, e o diagrama é criado e editado a partir da própria página. Na exportação para Markdown, cada diagrama vira imagem sem perder o vínculo com o original: sidecar `<slug>.dokdraw.yaml` ao lado da imagem, o mesmo YAML gravado dentro do PNG e um comentário com a URI `dok:diagram` no Markdown gerado.

O estudo com as fontes, o que já existe no ledger e o que falta está em `adrs/_work/ESTUDO-vinculo-diagrama-wiki.md`.

## O que muda nos prompts

- `PROMPT-ADR-007`: a fatia `read` inclui inserir diagrama novo de dentro da página, editar no lugar com volta à página e prévia estática gerada no salvamento da view. O conflito C-2 fecha com o dono no Diagram Studio.
- `PROMPT-ADR-010`, pergunta 3: o sidecar é `.dokdraw.yaml`, não `.dokdraw.json`, com chunk `iTXt` no PNG e comentário `dok:` no Markdown.
- Extensão do ADR 001: revisões de diagrama com restauração pelo Diagram Studio, sem mudar a DEC-0019.

Os prompts ficam em `prompts/`, pasta que só o humano edita. O ajuste é pedido no card de aprovação desta decisão.

## Alternativas descartadas e custo aceito

Diagrama como anexo da página, JSON no sidecar e revisão fixada na página exportada, pelos motivos da seção 5 do estudo. Custo aceito: três camadas de vínculo na exportação (sidecar, chunk, comentário) para sobreviver a hospedagem que reamostra imagem, e a extensão do ADR 001 como trabalho novo.
