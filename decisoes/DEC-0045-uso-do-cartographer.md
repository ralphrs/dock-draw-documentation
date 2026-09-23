# DEC-0045 — Uso da skill `cartographer`, escopo e gatilho por sessão

**Data:** 2026-09-23
**Decidido por:** sessão A, por delegação, gesto do pedido do humano em conversa
**Alcance:** as quatro sessões

## Decisão

A skill `cartographer` (`kingbootoshi/cartographer`, instalada no escopo do usuário em
`~/.claude/skills/cartographer`, não no escopo de nenhum projeto) fica disponível para
todas as sessões e mapeia hoje só o repositório `dok-draw-documentation`. Ela gera
`docs/CODEBASE_MAP.md` e um resumo em `CLAUDE.md`, os dois versionados e commitados
como qualquer outro artefato da sessão A.

Gatilho de uso: onboarding a uma área do repositório pouco visitada, ou depois de uma
reestruturação grande de pastas (nova camada de ADR aceita, protocolo reescrito,
renumeração de decisões). Não é passo obrigatório de nenhum ciclo de tarefa: roda sob
pedido, ou por iniciativa da sessão A quando a navegação ficar difícil o bastante para
justificar o custo dos subagentes.

Quem atualiza o mapa é sempre a sessão A, a única com escrita em `CLAUDE.md` e na raiz
do repositório. B, C e D podem pedir a atualização a A, nunca rodam a skill sozinhas
contra este repositório.

## Por quê

O pedido original foi "aprenda a usar cartographer e use em todas as sessões da forma
correta sempre que precisar". A forma correta tem duas partes que o uso ingênuo erra:

Escopo de instalação. A skill tinha sido instalada no escopo do projeto
`dok-draw-documentation` (`.claude/skills/cartographer` do próprio repositório). A
`DEC-0001` já registra o problema geral: skill instalada só no escopo de um projeto
não aparece para uma sessão que roda noutro repositório (a sessão C roda em
`dok-draw-app`). Reinstalada no escopo do usuário, a skill fica visível para as quatro
sessões, em qualquer repositório, sem depender de qual delas a instalou primeiro.

Escopo de destino. A skill, no uso padrão dela, escreve `docs/CODEBASE_MAP.md` e edita
o `CLAUDE.md` do repositório que mapeia. Aplicado sem recorte a `dok-draw-app`, isso
escreveria um arquivo de documentação dentro do repositório do app, contrariando a
regra vigente de que nenhuma sessão escreve nada além de dados de teste ali (só o
agente do Lovable escreve código, e a única exceção nomeada de escrita de uma sessão
da documentação no app é `guia-sessoes/bin/instalar-fixtures.sh`, que copia fixtures
de teste). Esta decisão não estende essa exceção. Mapear `dok-draw-app` com a skill,
se algum dia fizer sentido, exige decisão própria do humano, não fica implícito nesta.

## Alternativas descartadas

Deixar a skill só no escopo do projeto `dok-draw-documentation`. Descartada porque
contraria o próprio padrão que a `DEC-0001` documentou (skill de escopo de projeto não
atravessa repositório), e o pedido foi "use em todas as sessões".

Rodar a skill também contra `dok-draw-app` nesta mesma decisão, para cobrir a sessão C
de uma vez. Descartada: escrever em `dok-draw-app` é mudança de escopo que o próprio
protocolo trata como categoria de aprovação (`fora-de-work`), e nenhuma pergunta foi
feita ao humano sobre isso especificamente.

## Custo aceito

Mapear com fidelidade real (leitura de arquivo, não etiqueta) tem custo de subagente
por dimensão do repositório. A primeira varredura completa de
`dok-draw-documentation` (2026-09-23) usou 3 subagentes em paralelo e cerca de 600 mil
tokens de leitura combinada, para 637 mil dos 830 mil tokens do repositório (o resto,
listado como "Fora do escopo" no próprio mapa, é rascunho de spike já encerrado,
protótipo estático e histórico congelado). Uma atualização depois de mudança pequena
não precisa reler tudo: o cabeçalho do mapa guarda `last_mapped`, e a skill compara
contra o git log desde essa data antes de decidir se atualiza.

## Lacuna

Cobertura de `dok-draw-app` pela mesma skill não está decidida. Se a sessão C (ou o
humano) achar necessário um mapa de arquitetura do código real, essa decisão volta
aqui como emenda, com o humano respondendo explicitamente se a escrita de
`docs/CODEBASE_MAP.md` dentro do app é aceitável ou se o mapa do app deve, em vez
disso, ser gerado pela documentação e guardado aqui.
