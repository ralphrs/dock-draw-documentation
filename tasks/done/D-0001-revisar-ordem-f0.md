---
id: D-0001
titulo: "Revisar a ordem F0 (fundação do src/content-format) antes do despacho ao Lovable"
criada_por: A
criada_em: 2026-09-20T09:10
adr: "002"
fatia: "F0"
sprint: 1
tipo: revisar-ordem
depende_de: []
exige_aprovacao_humana: false
---

## Objetivo

A ordem F0 ou está aprovada para despacho, ou tem a lista de ajustes que a torna executável sem decisão em aberto.

## Contrato que vale

- `adrs/LEDGER.md`, bloco do ADR 002 em "Aceitos": as 16 dependências com versão e licença, `restricoes_impostas` (`src/content-format` puro, sem React, sem DOM, nenhuma outra camada parseia Markdown), e a API publicada (`parseDok`, `serializeDok`, `normalizeDok`, `validateDok`, `collectRefs`, `extractText`, `importDialect`, `migrateDok`).
- `adrs/_work/ADR-002-emenda-1-rascunho.md`, seção 1: a restrição de ambiente que a ordem verifica por build de plataforma browser. O rascunho ainda não é contrato, e a premissa dele sobre o alvo Cloudflare está sob correção em T-0009. A ordem não depende dessa correção, porque a verificação que ela manda rodar é o build browser.
- `decisoes/DEC-0007-lovable-como-implementador.md`: o Lovable executa e não decide.
- `decisoes/ACHADOS-2026-09-19-adrs-x-app.md`: estado real do app em 2026-09-19.

## Escopo

Ler `adrs/_work/ordens/ORDEM-F0-fundacao-content-format.md` inteiro, os 10 passos, o pré-requisito de despacho, as restrições, a derivação e as decisões tomadas.

Fora de escopo: reescrever a ordem. Ajuste vira lista para a sessão B aplicar, não edição sua. UX e UI não se aplicam a esta fatia, que não tem interface.

## Critério de pronto

Veredito `ordem aprovada` ou `ordem precisa de ajuste` na seção "Resultado", com cada ajuste apontando a linha do ADR, do ledger ou do achado que o motiva. A revisão precisa responder, uma a uma:

1. **Versões e nomes.** Cada pacote e versão do passo 1 e 2 bate com o bloco do ADR 002 no ledger. Nome de arquivo, diretório e função citados na ordem batem com o contrato, não com uma variante plausível.
2. **Decisão em aberto.** Nenhum passo admite duas implementações diferentes. Onde a ordem descreve comportamento, descreve o comportamento exato, não a intenção.
3. **Caso de erro.** O que a ordem manda fazer quando um comando falha está escrito, e não devolve a decisão ao executor.
4. **Critério verificável.** Os seis comandos do passo 10 têm resultado esperado explícito (código de saída, contagem, ausência de linha). Rodar cada um é possível sem contexto adicional.
5. **Fronteira de módulo.** As três verificações (ambiente Vitest, ESLint restringindo import, build de plataforma browser) cobrem as `restricoes_impostas` do ADR 002 que valem nesta fatia. Se alguma restrição do contrato ficar sem verificação, apontar.
6. **Pré-requisito de despacho.** A cópia das fixtures para `src/content-format/testing/fixtures/` acontece fora do bloco que o Lovable recebe. Conferir que nada dentro do bloco depende de caminho fora de `dok-draw-app`.
7. **Risco de escopo.** Apontar qualquer passo que toque arquivo fora do que a fatia F0 precisa, sobretudo `tsconfig.json`, configuração de Tailwind e `vite.config.ts` do app.

## Restrições

- Não editar a ordem, nem qualquer arquivo de `adrs/`. Escrita só em `DOCS/tasks/`.
- Não despachar nada ao Lovable. O despacho é da sessão A, depois do seu aceite e da aprovação do humano.
- Não rodar comando de instalação no app. A revisão é de texto.
- Se encontrar ambiguidade que só o ADR 002 pode resolver, abrir `QD-*` em vez de propor o texto. Contrato novo vem da trilha de ADR.

## Resultado

**Veredito: ordem aprovada.**

Conferido contra o `dok-draw-app` real: `package.json`, `eslint.config.js`, `tsconfig.json`, `bunfig.toml`, `vite.config.ts` e `.gitignore`, além de `adrs/LEDGER.md` e `adrs/ADR-002-formato-de-conteudo.md` (seção 11).

1. **Versões e nomes.** Os 14 pacotes do passo 1 e o `@types/mdast@^4.0.4` do passo 2 batem, nome e faixa, com `dependencias` do ADR 002 no ledger. `zod` corretamente não instalado (app já tem `^3.25.76`, conforme a própria nota do ledger). `vitest@5.0.1` não está na lista `dependencias` do YAML do ADR 002, mas está exigido pelo corpo aceito do ADR 002, seção 11, fatia F1: "as 30 fixtures rodam no Vitest com os mesmos 5 checks" — a escolha do runner já é contrato, só não replicada no YAML de dependências. Nomes de diretório (`src/content-format/`, `.../testing/`, `.../testing/fixtures/`) batem com o módulo citado em `interfaces_publicadas`.
2. **Decisão em aberto.** Nenhum passo admite duas leituras. Passos 4, 5, 6 e 8 dão conteúdo de arquivo verbatim. O passo 7 aponta uma âncora textual (bloco com `files: ["**/*.{ts,tsx}"]` + regra `no-restricted-imports` do `server-only`, antes de `eslintPluginPrettier`) que existe de fato no `eslint.config.js` real, numa posição única — conferido linha a linha.
3. **Caso de erro.** Coberto para o passo 3 (guardião de 24h/versão fora da faixa) e para qualquer comando do passo 10: para, não troca versão, não tenta segunda abordagem, devolve a saída completa. Não sobra decisão de "tentar de outro jeito".
4. **Critério verificável.** Os seis comandos do passo 10 têm critério de saída explícito (código 0 em todos, 2/2 testes, ausência de `UNRESOLVED_IMPORT`). `package.json` real hoje só tem `dev/build/build:dev/preview/lint/format` — os três scripts novos (`test`, `typecheck`, `check:content-format-env`) não colidem com nenhum existente.
5. **Fronteira de módulo.** Nenhuma das 9 `restricoes_impostas` já aceitas do ADR 002 se aplica ainda a um placeholder sem lógica (todas tratam do comportamento do parser, que é F1+), então nada do contrato aceito fica sem verificação nesta fatia. As três verificações que a ordem cria (ambiente sem DOM, ESLint restringindo builtins de Node, build de plataforma browser sem externos) antecipam a Emenda 1 (ainda rascunho), e a ordem já reconhece isso e apoia a verificação em razão própria ("o módulo roda no navegador"), independente da correção pendente do alvo Cloudflare em T-0009. Correto.
6. **Pré-requisito de despacho.** O bloco delimitado por ```` ```` ```` (a ordem que o Lovable recebe) não referencia nenhum caminho fora de `dok-draw-app`; a cópia de fixtures e o commit ficam fora dele, a cargo de quem despacha. **Ressalva de processo, não bloqueia o veredito:** esse commit é um push direto de A na `main` de `dok-draw-app`, fora do fluxo em que só o Lovable commita (`DEC-0007`). Push na `main` do app é categoria `app-release` em `PROTOCOLO.md`. A ordem não menciona essa aprovação, e `exige_aprovacao_humana: false` desta tarefa D-0001 vale para a minha revisão, não para esse push. Recomendo que A obtenha o sim humano para o push do pré-requisito antes de executá-lo, além do sim já previsto no ciclo padrão para o envio à Lovable (dependências novas).
7. **Risco de escopo.** Nenhum passo toca `tsconfig.json`, `tailwind.config.*` ou `vite.config.ts`. A lista de restrições da própria ordem fecha exatamente os arquivos tocados, e cada um bate com o que os passos fazem. Duas observações não bloqueantes: (a) o `tsconfig.json` real tem `include` explícito que não abrange `vitest.config.ts` nem `vite.content-format-check.config.ts` na raiz — `bun run typecheck` não vai checá-los tipo a tipo, mas isso não derruba nenhum dos seis comandos do passo 10; (b) o bloco novo de ESLint define `languageOptions.globals: {}`, que no flat config se mescla (não substitui) sobre o `globals.browser` já herdado — quem de fato bloqueia `window`/`document` é a regra `no-restricted-globals`, então o resultado funcional está correto, mas a linha `globals: {}` não faz nada por si só.

- Entregáveis: este veredito, anexado à própria tarefa.
- Critério de pronto: os 7 itens acima, cada um respondido, evidência inline.
- Pendências: nenhuma que impeça o despacho. Ressalva de processo do item 6 (aprovação humana `app-release` para o push do pré-requisito) fica registrada para a sessão A confirmar antes de executar.
- Sugestão de próxima tarefa: quando o resultado do Lovable existir, tarefa `tipo: revisar-resultado` desta mesma fatia F0.

## Revisão do arquiteto

- **Veredito:** aceita.
- **Motivo:** a revisão conferiu contra o app real, não contra o que a ordem afirma sobre ele, e verificou a âncora textual do passo 7 no `eslint.config.js` de fato existente. Os sete itens vieram respondidos com evidência, e as duas observações não bloqueantes são corretas: `languageOptions.globals: {}` no flat config mescla em vez de substituir, e quem bloqueia `window` e `document` na ordem é `no-restricted-globals`, que está lá (conferido pelo arquiteto no passo 7). O `include` do `tsconfig.json` não alcançar os dois arquivos de config da raiz também procede, e não derruba nenhum dos seis comandos do passo 10.
- **Ressalva de processo do item 6: aceita e acatada.** Copiar as fixtures e empurrar para a `main` de `dok-draw-app` é `app-release`, e o envio da ordem ao Lovable instala 15 pacotes e consome crédito do workspace, que a `DEC-0007` manda passar pelo humano a cada envio. As duas ações sobem ao humano juntas, antes de qualquer despacho. Apontar isso era papel da revisão, e a revisão apontou.
- **Achado para a próxima abertura do ADR 002:** o Vitest é contrato pelo corpo da seção 11 (fatia F1, "as 30 fixtures rodam no Vitest") e não aparece em `dependencias` do YAML do contrato. O ledger fica sem valor declarado para conferir contra o instalado, mesmo problema já registrado para as dependências do ADR 001 (pendência 8 de `ACHADOS`). Não bloqueia a F0.
- **Tarefas derivadas:** nenhuma. A próxima é `revisar-resultado` da F0, criada quando o Lovable devolver o commit.
