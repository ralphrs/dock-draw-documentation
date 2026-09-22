# DEC-0036: roadmap com plugin do Claude Code, plugin do Obsidian e modelos pré-definidos

**Data:** 2026-09-22
**Quem decidiu:** humano, no terminal da sessão A
**Alcance:** roadmap do produto, ADR 010 (exportação e sincronização), ADR 013 (tenancy), catálogo do Diagram Studio

## A decisão

Três itens entram no roadmap:

1. **Plugin do Claude Code para diagramar e documentar.** A pessoa usa o Claude Code no terminal, dentro de um repositório, para gerar e atualizar diagramas e páginas de wiki no DokDraw.
2. **Plugin do Obsidian.** O cofre do Obsidian conversa com a wiki do DokDraw. O ADR 002 já aceita wikilink e alertas do Obsidian na importação, então o formato tem base. Falta o canal e a direção da sincronização.
3. **Modelos pré-definidos de diagrama.** A pessoa escolhe um modelo (contexto C4, contêineres com API e banco, arquitetura de referência por nuvem, linha do tempo, BPMN, máquina de estados) e o diagrama nasce preenchido.

## Ordem e dependências

Os dois plugins compartilham o canal de troca com o DokDraw: API ou MCP server próprio, formato de arquivo DokMD e `.dokdraw`, sidecar da DEC-0032, importador de projeto da DEC-0034. Esse canal é assunto do ADR 010, ainda não escrito, e a autenticação do plugin depende do ADR 013. Os modelos usam as famílias da DEC-0033 e os diagramas de referência por nuvem. Ordem: famílias da DEC-0033, ADR 010, plugin do Claude Code, plugin do Obsidian, modelos em paralelo com os plugins depois das famílias.

## Onde vira trabalho

| O quê | Card | Sessão |
| --- | --- | --- |
| Épico: plugin Claude Code | `DDP-498` | roadmap |
| Estudo: o que o DokDraw expõe (API, MCP, formato) e o que o plugin faz | `DDP-499` | B |
| Épico: plugin Obsidian | `DDP-500` | roadmap |
| Estudo: canal de sincronização, perda em cada direção, uma via primeiro | `DDP-501` | B |
| Épico: modelos pré-definidos | `DDP-502` | roadmap |
| Estudo: formato do modelo, catálogo, criação a partir de diagrama, galeria | `DDP-503` | B, prancha da D depois do aceite |

## Custo aceito e alternativa descartada

Custo: os plugins só andam depois do ADR 010, porque sem o canal de troca cada plugin inventaria o seu. Alternativa descartada: começar pelo plugin do Claude Code com acesso direto ao Supabase, que espalharia chave e regra de acesso fora do app antes do ADR 013.
