# DEC-0006 — Quatro decisões delegadas ao arquiteto

- **Data:** 2026-09-19
- **Decidido por:** arquiteto, por delegação explícita do humano
- **Alcance:** status dos ADRs 002 a 004, arquitetura base contra o app, formato e numeração do Developer Portal

## A delegação

O humano recebeu as quatro perguntas abaixo e respondeu, em todas, "tome a melhor decisão como especialista", acrescentando que quer o app "super moderno, leve e profissional".

Duas delas são categoria `aceite-adr`, que o `guia-sessoes/PROTOCOLO.md` reserva ao humano. A delegação é dele, dada na conversa, e vale para estas quatro decisões, não como regra geral. As categorias de aprovação continuam valendo para tudo o mais.

## Decisão 1: os arquivos dos ADRs 002, 003 e 004 passam a dizer Aceito

Aplicada em duas ocorrências por arquivo, o cabeçalho e o campo `status` do contrato. O texto novo diz desde quando e por quê, em vez de só trocar a palavra.

**Registrada como decisão nova, não como alargamento da `A-Q-0002`.** Aquela resposta nomeava só `adrs/ADR-005-edicao.md` no ajuste 1, e esticar retroativamente o alcance de uma aprovação passada destrói a garantia que sustenta o protocolo inteiro: uma aprovação vale para o que ela lista, e para nada além. A `T-0005` executou o que lhe foi pedido. O defeito está em quem escreveu o ajuste 1 nomeando um arquivo quando quatro precisavam mudar.

Fica pendente `insumos/ORDEM.md`, que também marca 002 a 004 como "Proposto". `insumos/` é bloqueado para escrita e a correção é proposta ao humano.

## Decisão 2: nas duas divergências entre `insumos/BASE.md` e o app, o app manda

Caso a caso, porque as razões são diferentes.

**Classes de tema: `.dark` do app prevalece.** O `src/styles.css` declara `@custom-variant dark (&:is(.dark *))`, que é o contrato do Tailwind v4 com o shadcn. Cerca de cinquenta componentes de `src/components/ui/` dependem disso. Renomear para `.theme-dark` significaria brigar com o ecossistema a cada componente novo, para sempre, em troca de nada além de casar com uma linha de documento.

Consequência aplicada nesta decisão: **o teste 6 do ADR 005, que é ADR Aceito, citava as classes erradas e foi corrigido.** É uma segunda ação de categoria `aceite-adr`, distinta da decisão 1, e está coberta pela mesma delegação.

**Formatador: `prettier` do app prevalece.** Já está integrado ao ESLint por `eslint-config-prettier` e `eslint-plugin-prettier`, com `.prettierrc` e `.prettierignore` no repositório. O `oxfmt` é mais rápido e do ecossistema oxc, e continua imaturo. Trocar ferramenta madura e integrada por imatura não é modernizar, é assumir risco sem ganho observável para quem usa o produto. Fica registrado como migração possível quando o oxfmt estabilizar.

**Alternativa descartada nos dois casos:** corrigir o app para casar com o documento. Descartada porque `insumos/BASE.md` é um retrato, e o `CLAUDE.md` já manda preferir o arquivo do app à cópia em `insumos/`. O custo de mexer no app é alto e recai sobre código que o Lovable enxerga.

**Custo aceito:** `insumos/BASE.md` fica errado em dois pontos até o humano aplicar a correção, porque a pasta é bloqueada. Quem ler só o BASE decide errado nesse intervalo.

**Não decidido aqui:** o `nitro 3.0.260603-beta`, que contraria "sempre a última estável". É dependência do preset do Lovable, não escolha do projeto, então vira risco registrado e não correção.

## Decisão 3: o conteúdo do Developer Portal é DokMD versionado no git

Mesma gramática e mesmo renderer do produto, com o repositório como fonte de verdade em vez do banco.

O pedido foi "moderno, leve e profissional", e esta opção atende os três de forma verificável. Leve, porque não depende de banco, de auth nem de RLS para a documentação existir. Moderno, porque o portal é renderizado pelo próprio produto que documenta. Profissional, porque a documentação do time quebra no mesmo dia em que o renderer regride, o que transforma qualidade em consequência observável em vez de intenção.

Restrição que faz parte da decisão: **as seções mais lidas usam só GFM puro.** Directives entram onde agregam de verdade. Entre a fase 1 e a fase 2 não existe renderer, e `:::tabs` no GitHub é ruído para quem lê.

**Alternativas descartadas:** Markdown GFM puro em tudo, que é legível hoje e não exercita nada, deixando a documentação de fora do próprio produto. E páginas da Wiki no banco, dogfooding completo que amarra a existência da documentação a auth, workspace e RLS, e deixa a documentação de arquitetura sem dono num modelo multi-inquilino.

**Custo aceito:** a documentação vira refém da gramática e migra por `migrateDok` a cada mudança do DokMD. Entre as duas fases, quem ler pelo GitHub vê directives como texto cru.

## Decisão 4: o Developer Portal recebe o número 014, e o 006 continua reservado

**O 006 não é ocupado.** O `insumos/ORDEM.md` e o handoff descrevem o 006 como camada que o humano está produzindo, reservada para algo em andamento que ele nunca nomeou. A delegação recebida é sobre a decisão técnica, e não sobre um espaço que o repositório guarda de propósito.

Há precedente registrado do mesmo dia: a `DEC-0005` deu 013 ao ADR de Tenancy exatamente por isso, e o humano aceitou o 013 sem revelar o que é o 006. Esse silêncio é informação.

O portal é camada de verdade, com decisões próprias e difíceis de reverter: onde vive o conteúdo, como renderiza sem banco, o que fazer com diagrama mutável (conflito C-1) e qual mecanismo impede a documentação de apodrecer. Sem ADR, essas decisões ficam sem contrato no ledger, e o ADR 012 perde o que auditar.

**Reversível a baixo custo enquanto o ADR 014 não for escrito.** Se o humano preferir dar o 006 ao portal, a troca é uma edição no ledger e em `ORDEM.md`.

## O que estas decisões não incluem

A aplicação da Emenda 1 ao ADR 002 continua esperando, e agora por dois motivos: a `T-0007`, que devolve o harness de medição, e a verificação do alvo real do Nitro. A seção 1 da emenda decide uma restrição inteira apoiada num comentário dentro de `vite.config.ts`, sobre um preset cujo conteúdo ninguém abriu. Essa premissa vai para o ledger como `restricoes_impostas`, e precisa ser fato antes disso.
