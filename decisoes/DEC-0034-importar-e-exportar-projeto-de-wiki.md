# DEC-0034: importar e exportar um projeto de wiki em `.md` e `.mdx`, pelas configurações do projeto e pelo menu de três pontos

**Data:** 2026-09-22
**Quem decidiu:** humano, no terminal da sessão A
**Alcance:** ADR 002 (importador já decidido por página), ADR 010 (exportação, a escrever), interface do projeto no app

## A decisão

A wiki importa um projeto inteiro em `.md` ou `.mdx`: uma pasta ou um pacote com várias páginas, não só uma página colada. As ações **Importar** e **Exportar** aparecem em dois lugares: na tela de configurações do projeto (`projetos.$projectId.configuracoes.*`) e no menu de três pontos do projeto (lista de projetos e cabeçalho do projeto). Importar e exportar são pares: o que sai pelo perfil Markdown do ADR 010 volta pelo importador sem perda do que o DokMD guarda.

## O que já existe e o que falta

O ADR 002 já decide o dialeto de entrada: MDX (subconjunto do Starlight por allowlist), wikilink, alertas GitHub e Obsidian são aceitos só na importação e convertidos para DokMD, com avisos `DOK-W1xx` por página, e `importDialect` é interface publicada. O que falta é o nível de projeto:

- Fonte do pacote: envio de `.zip`, pasta local pela File System Access API (Chromium) ou repositório Git por URL. Ordem de entrega a decidir no estudo.
- Mapeamento de pastas e arquivos para espaços, páginas, slugs e hierarquia (ADR 003), com `index.md` e frontmatter `title` como título.
- Imagens e anexos relativos viram assets (`dok:asset`), links relativos entre arquivos viram `dok:page`, com resolução em duas passadas.
- Diagramas: imagem com sidecar `.dokdraw.yaml` ou comentário `dok:diagram` (DEC-0032) volta a ser `::diagram`; imagem sem sidecar fica imagem.
- Conflito com página existente de mesmo slug: regra a decidir (sobrescrever como revisão nova, pular, renomear).
- Relatório da importação: páginas criadas, avisos por página, o que ficou como texto por não ter conversão.

## Onde vira trabalho

| O quê | Card | Sessão |
| --- | --- | --- |
| Estudo do importador de projeto: fontes, mapeamento, assets, diagramas, conflitos, relatório, e o que muda no ADR 010 | `DDP-490` | B |
| Prancha das entradas Importar e Exportar (configurações e menu de três pontos) e do fluxo do diálogo de importação | `DDP-491` | D |

O prompt do ADR 010 fica em `prompts/`, pasta do humano. Frase a acrescentar na pergunta 7: "Importação de projeto `.md`/`.mdx` é o par da exportação: mesmo perfil Markdown, sem perda do que o DokMD guarda, com relatório de avisos por página (DEC-0034)".

## Custo aceito e alternativa descartada

Custo: o importador de projeto precisa de duas passadas (criar páginas, depois resolver links) e de uma regra de conflito que o ADR 003 não tem. Alternativa descartada: importar só página a página pelo editor, que já existe pelo ADR 002 e não atende quem chega com um repositório de documentação inteiro.
