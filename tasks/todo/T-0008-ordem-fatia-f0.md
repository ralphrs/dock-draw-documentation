---
id: T-0008
titulo: "Escrever a ordem de implementação da fatia F0 do ADR 002 (fundação do content-format no app)"
criada_por: A
criada_em: 2026-09-19T23:20
adr: "002"
tipo: escrever
depende_de: []
exige_aprovacao_humana: false
---

## Objetivo

Existe uma ordem executável pelo agente do Lovable que instala a fundação do `src/content-format` no app, sem deixar nenhuma decisão para quem executa.

## Contexto

Primeira tarefa da **sprint 1** da trilha de desenvolvimento. A meta da trilha está em `decisoes/DEC-0004-meta-da-trilha-de-desenvolvimento.md`: editar e publicar uma página da Wiki no app, ponta a ponta.

> [!IMPORTANT]
> Seu papel mudou. Leia `decisoes/DEC-0007-lovable-como-implementador.md` antes de começar. Além dos ADRs, você passa a escrever as **ordens de implementação**: o texto que a sessão A envia ao agente do Lovable, derivado do contrato da fatia. Quem executa não decide nada. Onde a ordem deixa decisão em aberto, a falha é da ordem.

Esta tarefa **não produz código**. Produz o texto da ordem.

### O que já se sabe sobre o app, verificado em 2026-09-19

Levantamento completo em `decisoes/ACHADOS-2026-09-19-adrs-x-app.md`. O que importa aqui:

- **Nenhuma das 16 dependências do contrato do ADR 002 está instalada.** Nenhum `mdast-util-*`, `micromark-*`, `unist-util-visit`, `github-slugger`, `yaml`, `@types/mdast`.
- **O app não tem runner de teste nenhum.** Sem Vitest, sem Jest, sem Playwright, sem script `test` no `package.json`.
- **`zod ^3.25.76`** está instalado. O contrato do ADR 002 no ledger aceita essa versão desde que o import seja de `zod/v4`.
- **`src/content-format` não existe.**
- O gerenciador de pacotes é o **bun** (`bun.lock`, `bunfig.toml`). O `bunfig.toml` impõe `minimumReleaseAge = 86400`.
- O `tsconfig.json` tem seis flags além de `strict`, entre elas `noUncheckedIndexedAccess` e `exactOptionalPropertyTypes`. Nenhum ADR precificou esse rigor para o `content-format`.

### As fixtures

As 30 fixtures e o `manifest.json` estão em `adrs/ADR-002-anexos/fixtures/`, neste repositório. O harness de referência está em `adrs/ADR-002-anexos/harness/`. O porte para TS strict, que passou 30/30 no S-1, está em `adrs/_work/spike-s1/content-format/`.

A fatia F0 precisa levá-las para dentro do app, porque o critério de pronto da fatia F1 é "as 30 fixtures rodam no Vitest".

### A Emenda 1 ainda não está aplicada

O rascunho está em `adrs/_work/ADR-002-emenda-1-rascunho.md`, aceito com ressalva na revisão de `T-0006`. Ele decide três coisas que esta ordem precisa respeitar:

1. A suíte roda em `environment: 'node'`, sem `jsdom`.
2. Existe um build de plataforma browser sem externos, que falha se `content-format` importar builtin de Node.
3. Um bloco de ESLint com escopo `src/content-format/**` proíbe `node:*` e os builtins sem prefixo.

Use o rascunho como base. Ele ainda não é contrato, então **não cite a emenda como autoridade dentro da ordem**: escreva as três verificações como requisito da fatia, com a justificativa própria.

## A fatia

`adrs/ADR-002-formato-de-conteudo.md`, seção 11, fatia F0: "Build real no app Lovable. `install`, `build` e `tsc` passam com as dependências do contrato."

A ordem amplia isso com o que o levantamento mostrou ser necessário para a fatia F1 ter onde ser verificada: o runner de teste e as fixtures.

## Entregáveis

`adrs/_work/ordens/ORDEM-F0-fundacao-content-format.md`, com duas partes:

1. **A ordem**, em bloco de código, pronta para ser enviada ao agente do Lovable sem edição. Português, segunda pessoa, imperativa.
2. **A derivação**, fora do bloco: de onde cada exigência da ordem vem (seção do ADR, linha do contrato no ledger, achado do levantamento). Serve para a sessão C conferir a ordem contra a fonte sem reler tudo.

## Critério de pronto

1. **A ordem nomeia cada pacote com a versão exata do contrato**, copiada de `adrs/LEDGER.md`, seção "ADR 002", bloco `dependencias`. Nada de "as dependências do ADR 002". Conferir uma a uma.
2. **A ordem resolve o `zod`.** O contrato aceita `^4.6.5` ou o `^3.25.76` do app importando de `zod/v4`. O app tem a segunda. A ordem precisa dizer qual caminho seguir e por quê, sem deixar escolha.
3. **A ordem especifica o runner de teste**: qual pacote, qual versão, qual script no `package.json`, e o `environment: 'node'` com a justificativa.
4. **A ordem diz onde as fixtures ficam no app** e em que formato chegam. Decida o caminho e registre a decisão em "Decisões tomadas": cópia versionada dentro do app, ou outro arranjo. Considere que elas precisam ser lidas por `runFixtureSuite` sem `fs` no código de produção.
5. **A ordem inclui as três verificações** de fronteira do módulo (build de plataforma browser, bloco de ESLint, suíte em node), cada uma com o comando que a executa.
6. **A ordem tem critério de pronto verificável por comando.** Cada item precisa ser uma linha que alguém roda e lê a saída. "O build passa" não serve, `bun run build` com saída esperada serve.
7. **A ordem proíbe explicitamente** o que o `dokdraw-contratos` já proíbe e é fácil de violar nesta fatia: criar `tailwind.config.*`, afrouxar o `tsconfig.json`, acrescentar pacote não nomeado, tocar em arquivo fora do escopo.
8. **Nenhuma decisão em aberto.** Releia a ordem procurando toda frase que admita duas implementações diferentes. Cada uma vira decisão sua, registrada na derivação, ou uma dúvida `Q-*` se for contrato.
9. **Estilo** conforme `insumos/ESTILO-ADR.md`, inclusive dentro da ordem.

## Restrições

- **Não escreva código do app.** Nem de exemplo dentro da ordem, além do mínimo que remove ambiguidade (um trecho de `vite.config.ts` ou de `eslint.config.js`, por exemplo, é aceitável e desejável).
- **Não altere nada em `dok-draw-app`.** Leitura apenas.
- Não toque em `adrs/ADR-002-formato-de-conteudo.md`, no `LEDGER.md` nem em `insumos/`.
- Não commite.
- Se a fatia exigir uma decisão que o ADR 002 não cobre e que muda contrato, pare e abra `Q-*`. Não resolva na ordem.

## Nota sobre aprovação

A ordem final inclui mudança no `package.json` do app, que é categoria `app-release`. Essa aprovação é da sessão A com o humano, depois que a ordem passar pela revisão da sessão C. Você não precisa pedir nada.
