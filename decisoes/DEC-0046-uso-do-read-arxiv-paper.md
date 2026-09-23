# DEC-0046 — Uso da skill `read-arxiv-paper`, com saída redirigida para `adrs/_work/`

**Data:** 2026-09-23
**Decidido por:** sessão A, por delegação, gesto do pedido do humano em conversa
**Alcance:** as quatro sessões, dona de fato é a sessão B

## Decisão

A skill `read-arxiv-paper` (`karpathy/nanochat`, instalada no escopo do usuário em
`~/.claude/skills/read-arxiv-paper`, arquivo não editado) fica disponível para as
quatro sessões. O mecanismo dela é usado como está: dada uma URL `arxiv.org/abs/...`,
normaliza para `/src/...`, baixa e desempacota o TeX-fonte (nunca o PDF), acha o
entrypoint (`main.tex` ou equivalente) e lê o paper inteiro por essa árvore de
arquivos, não pelo abstract.

Duas instruções da skill são escritas para o repositório `nanochat` dela e não fazem
sentido aqui, então toda sessão que a invoca dentro de um repositório do DokDraw
substitui essas duas partes por conta própria, sem editar o arquivo da skill:

- **Onde a skill manda escrever o resumo** (`./knowledge/summary_{tag}.md`, pasta que
  não existe neste projeto) **vira** `adrs/_work/ESTUDO-arxiv-{tag}.md`, no mesmo
  padrão de nome que os outros estudos da pasta já usam (`ESTUDO-design-site-dark.md`,
  `ESTUDO-vinculo-diagrama-wiki.md`). Dona da pasta é a sessão B; a sessão A não edita.
- **Com o que o resumo conecta o paper** (a skill manda relacionar com o código do
  `nanochat`) **vira** relacionar com o ADR ou a fatia do DokDraw que motivou a
  leitura: qual contrato do `LEDGER.md` o paper sustenta, contradiz ou não muda nada,
  e o que fica como lacuna se o paper não resolver a dúvida.

O cache local de download (`~/.cache/nanochat/knowledge/{arxiv_id}.tar.gz`) fica como
a skill já define, sem mudança: é scratch de disco fora do repositório, chaveado pelo
id do arXiv, e compartilhá-lo entre projetos evita baixar o mesmo paper duas vezes.

## Por quê

O pedido foi "estude ela e passe a usá-la em todas as sessões". A skill em si (buscar
fonte TeX em vez de PDF, ler pela árvore de arquivos, não só o abstract) é mecanismo
sólido e não tem nada específico de LLM nele. As duas partes específicas do
`nanochat` (pasta `./knowledge/` e "conecte com o código do nanochat") são a metade
da instrução que amarra a skill a outro repositório. Usar sem essa troca faria a
sessão escrever fora da estrutura de pastas do DokDraw (`decisoes/DEC-0002` já
determina que artefato de pesquisa vive em `decisoes/` ou em `adrs/_work/`, nunca
solto) e produzir um resumo conectado ao projeto errado.

## Alternativa descartada

Editar o arquivo `~/.claude/skills/read-arxiv-paper/SKILL.md` para trocar os dois
trechos direto na fonte. Descartada: o arquivo é recurso do usuário, compartilhado por
qualquer projeto que ele abra no Claude Code, não só o DokDraw. Mudar o arquivo
instalado alteraria o comportamento da skill em outro contexto (inclusive no próprio
`nanochat`, se o humano algum dia rodar Claude Code lá) sem relação com este projeto.
A adaptação fica do lado de quem invoca, documentada aqui, não do lado da skill.

## Custo aceito

Quem invoca a skill precisa lembrar da troca de caminho e de destinatário a cada uso,
porque ela não é automática. O risco de esquecer e deixar um resumo em
`./knowledge/` dentro do repositório (pasta que não existe hoje e viraria lixo não
rastreado) é mitigado por esta decisão ficar referenciada em
`guia-sessoes/PROMPT-SESSAO-B.md`, no ponto onde a sessão B decide qual skill usar.
