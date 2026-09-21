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
