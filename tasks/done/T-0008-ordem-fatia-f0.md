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

## Resultado

### Entregáveis

`adrs/_work/ordens/ORDEM-F0-fundacao-content-format.md`, com a ordem (bloco de código, 10 passos numerados) e a derivação (tabela de 16 linhas). Nenhum arquivo do app tocado, nenhum commit.

### Critério de pronto

1. **A ordem nomeia cada pacote com a versão exata do contrato.** ✔ Os 14 pacotes do passo 1 mais `@types/mdast` do passo 2 copiados um a um de `adrs/LEDGER.md`, bloco do ADR 002, conferidos linha a linha nesta sessão contra o arquivo real.
2. **A ordem resolve o `zod`.** ✔ Passo 1: "Não instale `zod`... importa sempre de `zod/v4`, nunca de `zod` direto", com o motivo (o app já tem `^3.25.76`, aceito pelo contrato) na derivação.
3. **A ordem especifica o runner de teste.** ✔ `vitest@5.0.1`, script `test`, `environment: 'node'` com justificativa (passo 5). Versão escolhida por já ter rodado no S-1 sobre a mesma versão de Vite do app, peer dependency conferida no registro npm nesta sessão (`vitest@^8.0.0` aceito, app tem `vite@8.1.5`).
4. **A ordem diz onde as fixtures ficam e em que formato chegam, com a decisão registrada.** ✔ Cópia versionada dentro de `dok-draw-app` (`src/content-format/testing/fixtures/`), decisão e alternativa descartada na seção "Decisões tomadas" da própria ordem. Achado durante a escrita: o Lovable não alcança `dok-draw-documentation`, então a cópia virou pré-requisito de despacho (feito por quem envia a ordem), não um passo dentro do bloco que o Lovable executa. Sem `fs` no código de produção: o teste que lê as fixtures fica em `src/content-format/testing/`, fora do `entry` do build de plataforma browser e coberto pelo `ignores` do bloco de ESLint.
5. **A ordem inclui as três verificações de fronteira**, cada uma com comando. ✔ Passo 5 (ambiente Vitest), passo 7 (ESLint restrito), passo 8 (build de plataforma browser, `bun run check:content-format-env`).
6. **Critério de pronto verificável por comando.** ✔ Passo 10 lista seis comandos, cada um com o código de saída ou a contagem esperada (2 de 2 testes, zero linhas `UNRESOLVED_IMPORT`).
7. **A ordem proíbe o que é fácil de violar.** ✔ Seção "Restrições": sem `tailwind.config`, sem editar `tsconfig.json`, sem pacote fora da lista, sem editar arquivo fora do escopo nomeado, sem `.env*`, sem deploy.
8. **Nenhuma decisão em aberto.** Duas rodadas de releitura encontraram e corrigiram duas ambiguidades reais antes de considerar a ordem pronta:
   - O passo original de copiar fixtures pedia ao Lovable acessar `../dok-draw-documentation/...`, caminho que o agente não alcança (ele só opera dentro de `dok-draw-app`). Corrigido: virou pré-requisito de despacho, fora do bloco que o Lovable recebe.
   - O padrão `node:*` do bloco de ESLint não cobre `node:fs/promises` (asterisco simples não cruza `/` em glob). Corrigido para `node:**`.

   Depois das duas correções, releitura final não achou frase que admita duas implementações diferentes.
9. **Estilo conforme `insumos/ESTILO-ADR.md`, inclusive dentro da ordem.** ✔ Verificado por comando:
   ```
   $ grep -n "—" adrs/_work/ordens/ORDEM-F0-fundacao-content-format.md; grep -n ";" ...
   (vazio)
   $ grep -niE "\beu\b|\bnós\b|\bnosso\b|optou-se|decidimos|escolhemos" ...
   (vazio)
   ```
   Os seis blocos de código TS/JS/JSON foram validados com o compilador TypeScript real do spike (`ts.transpileModule`, sem erro de sintaxe em nenhum), e o `manifest.json` real das fixtures conferido em 30 entradas.

### Decisões tomadas

A ordem em si registra quatro decisões na própria seção "Decisões tomadas" do arquivo (fixtures como cópia versionada, cópia como pré-requisito de despacho em vez de passo do Lovable, `vitest.config.ts` separado do `vite.config.ts` do app, `index.ts` como placeholder de uma linha). Resumo aqui, por completude do registro desta tarefa:

- **Justificativa da restrição de ambiente (navegador) escolhida no lugar da justificativa da Emenda 1 (Cloudflare).** Achado ao baixar e inspecionar `@lovable.dev/vite-tanstack-config@2.20.0` do registro npm nesta sessão: o preset força `nitroOpts.preset = "cloudflare-module"` com `cloudflare: { nodeCompat: true, ... }` dentro de um build do Lovable. `nodeCompat: true` habilita compatibilidade com Node dentro do Workers, o que enfraquece "Cloudflare não tem Node" como razão. Alternativa descartada: manter a justificativa da Emenda 1 sem qualificação. Custo aceito: a Emenda 1 (seção 1, `riscos_abertos`) fica com uma premissa desatualizada até quem revisar decidir se atualiza o texto à luz de `nodeCompat: true`, achado que não estava em `decisoes/ACHADOS-2026-09-19-adrs-x-app.md`. Esta tarefa não editou a Emenda 1 nem `ACHADOS`, por estarem fora do escopo de `T-0008` e de `decisoes/`.
- **`group: ["node:**"]`** em vez de `["node:*"]` no bloco de ESLint, para cobrir subcaminhos como `node:fs/promises`. Sem custo aceito relevante, é a forma correta do glob para o que a regra já pretendia fazer.

## Revisão do arquiteto

- **Veredito:** aceita.
- **Motivo:** a ordem é executável sem decisão em aberto, que é o único critério que importa num texto que vai para um agente que não pergunta. Dois achados feitos durante a escrita valem mais que o texto em si: o Lovable não alcança `dok-draw-documentation`, o que mata o passo de copiar fixtures de fora e o transforma em pré-requisito de despacho, e `node:*` não cobre `node:fs/promises` em glob. Os dois seriam falha silenciosa na primeira execução.
- **Conferido pelo arquiteto, contra o registro npm e o `package.json` do app:** `vitest` 5.0.1 é a versão atual e aceita `vite ^6.4.0 || ^7.0.0 || ^8.0.0`, o app tem `vite 8.1.5` e `zod ^3.25.76`. As três escolhas da ordem batem.
- **Achado que sai desta tarefa:** `@lovable.dev/vite-tanstack-config@2.20.0` força `nitroOpts.preset = "cloudflare-module"` com `cloudflare.nodeCompat: true`. A Emenda 1 ao ADR 002 justifica a restrição de ambiente com "Cloudflare não tem Node", premissa que `nodeCompat: true` enfraquece. B agiu certo ao não editar a Emenda por conta própria. Vira T-0009.
- **Tarefas derivadas:** T-0009 (atualizar a premissa de ambiente da Emenda 1 e o `ACHADOS`), D-0001 (revisão e despacho da ordem F0).
