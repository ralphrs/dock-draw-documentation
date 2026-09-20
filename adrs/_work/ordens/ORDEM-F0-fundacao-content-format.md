# Ordem F0: fundação do `src/content-format` no app

Ordem de implementação para o agente do Lovable, derivada da fatia F0 do ADR 002 (`adrs/ADR-002-formato-de-conteudo.md`, seção 11), ampliada com o que a fatia F1 vai precisar encontrar já pronto. Escrita conforme `decisoes/DEC-0007-lovable-como-implementador.md`: o texto abaixo não deixa decisão em aberto para quem executa.

## Pré-requisito, antes de despachar esta ordem

O agente do Lovable trabalha só dentro de `dok-draw-app` e não tem acesso ao repositório `dok-draw-documentation`. Quem despacha esta ordem (sessão A, com os dois repositórios disponíveis) faz isto antes de enviar o bloco "A ordem" ao Lovable, e não pede ao Lovable para fazer:

1. Copiar todo o conteúdo de `adrs/ADR-002-anexos/fixtures/` (deste repositório) para `src/content-format/testing/fixtures/` dentro de `dok-draw-app`, incluindo `manifest.json` e as 30 subpastas, sem alterar nenhum arquivo copiado.
2. Commitar e enviar essa cópia para a `main` de `dok-draw-app`, para que o Lovable já a encontre no repositório quando executar a ordem.

Sem este passo, o teste do passo 6 abaixo ("encontra as 30 fixtures") falha por arquivo ausente, e a falha não é da ordem nem de quem a executou.

## A ordem

````md
# Ordem: fundação do `src/content-format`

Você trabalha no repositório `dok-draw-app`. As fixtures de `src/content-format/testing/fixtures/` já estão no repositório quando você recebe esta ordem. Esta ordem instala as dependências, cria a estrutura mínima e o runner de teste do módulo `src/content-format`. Você não porta lógica de parser nesta ordem, só a fundação. Siga os passos na ordem escrita. Nenhum passo é opcional.

## 1. Instalar as dependências de produção

Rode, num único comando:

```
bun add mdast-util-from-markdown@^2.0.3 mdast-util-to-markdown@^2.1.2 micromark-extension-gfm@^3.0.0 mdast-util-gfm@^3.1.0 micromark-extension-directive@^4.0.0 mdast-util-directive@^3.1.0 micromark-extension-frontmatter@^2.0.0 mdast-util-frontmatter@^2.0.1 micromark-extension-mdx-jsx@^3.0.2 mdast-util-mdx-jsx@^3.2.0 unist-util-visit@^5.1.0 mdast-util-to-string@^4.0.0 github-slugger@^2.0.0 yaml@^2.9.1
```

Não instale `zod`: o app já tem `zod@^3.25.76` em `package.json`, e é a versão que o contrato aceita. Código de `content-format` importa sempre de `zod/v4`, nunca de `zod` direto.

## 2. Instalar as dependências de desenvolvimento

```
bun add -D @types/mdast@^4.0.4 vitest@5.0.1
```

## 3. Conferir a instalação

Rode `bun pm ls` e confira, um a um, que os 14 pacotes do passo 1 e os 2 do passo 2 aparecem com a versão pedida (a faixa `^` pode resolver para um patch mais novo dentro da mesma versão menor, isso é esperado). O `bunfig.toml` do repositório tem um guardião de 24 horas (`minimumReleaseAge`) que pode rejeitar silenciosamente uma versão publicada há pouco tempo. Se qualquer pacote não aparecer, aparecer com versão fora da faixa pedida, ou o `bun add` terminar com aviso sobre idade de publicação: **pare aqui, não troque a versão nem prossiga, e devolva a saída completa do comando como resultado desta ordem.**

## 4. Criar a estrutura do módulo

Crie o arquivo `src/content-format/index.ts` com exatamente este conteúdo:

```ts
// Placeholder da fatia F0. A fatia F1 substitui este arquivo pelo módulo real
// (parseDok, serializeDok, normalizeDok, validateDok e as demais interfaces
// publicadas no contrato do ADR 002).
export const CONTENT_FORMAT_SCAFFOLD = true as const
```

Não escreva nenhum outro arquivo dentro de `src/content-format/` além dos que os passos seguintes desta ordem pedem.

## 5. Configurar o Vitest

Crie `vitest.config.ts` na raiz do repositório:

```ts
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
```

`environment: 'node'`, nunca `jsdom` nem `happy-dom`: o `src/content-format` roda sem DOM (navegador, server function, job agendado), e a suíte precisa quebrar se algum código do módulo passar a depender de `window` ou `document`.

## 6. Escrever o teste de fundação

Crie `src/content-format/testing/environment.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

describe('fundação do content-format (fatia F0)', () => {
  it('roda sem DOM', () => {
    expect(typeof window).toBe('undefined')
    expect(typeof document).toBe('undefined')
  })

  it('encontra as 30 fixtures do ADR 002', () => {
    const fixturesRoot = join(dirname(fileURLToPath(import.meta.url)), 'fixtures')
    const manifest = JSON.parse(readFileSync(join(fixturesRoot, 'manifest.json'), 'utf8')) as unknown[]
    expect(manifest.length).toBe(30)
  })
})
```

Este arquivo usa `node:fs` porque só o Vitest o executa, nunca o build de produção. A fatia F1 substitui este teste pela suíte real.

## 7. Restringir o que `src/content-format` pode importar

Abra `eslint.config.js`. Depois do bloco que já existe (o que tem `files: ["**/*.{ts,tsx}"]` e a regra `no-restricted-imports` do `server-only`), e antes de `eslintPluginPrettier`, insira este novo elemento no array que `tseslint.config(...)` recebe:

```js
{
  files: ["src/content-format/**/*.{ts,tsx}"],
  ignores: ["src/content-format/testing/**"],
  languageOptions: {
    globals: {},
  },
  rules: {
    "no-restricted-globals": [
      "error",
      "window",
      "document",
      "navigator",
      "localStorage",
      "sessionStorage",
      "self",
    ],
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["node:**"],
            message: "src/content-format não pode importar builtin do Node fora de src/content-format/testing.",
          },
        ],
        paths: [
          "fs", "path", "os", "child_process", "crypto", "http", "https",
          "net", "tls", "dns", "zlib", "stream", "buffer", "cluster", "worker_threads",
        ].map((name) => ({
          name,
          message: "src/content-format não pode importar builtin do Node fora de src/content-format/testing.",
        })),
      },
    ],
  },
},
```

O `ignores` exclui `src/content-format/testing/**`, porque o teste do passo 6 usa `node:fs` de propósito e nunca entra no bundle de produção.

## 8. Verificar a fronteira de ambiente por build

Crie `vite.content-format-check.config.ts` na raiz do repositório:

```ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: '.content-format-check',
    emptyOutDir: true,
    lib: {
      entry: 'src/content-format/index.ts',
      formats: ['es'],
      fileName: () => 'content-format.browser.js',
    },
    rollupOptions: {
      external: [],
    },
  },
})
```

`external: []` faz o build falhar se `src/content-format` importar algo que não resolve em plataforma browser, como um builtin do Node. Acrescente ao final de `.gitignore` a linha `.content-format-check/`.

## 9. Acrescentar os scripts de `package.json`

Em `"scripts"`, acrescente três entradas, sem remover nenhuma das seis que já existem:

```json
"test": "vitest run",
"typecheck": "tsc --noEmit",
"check:content-format-env": "vite build --config vite.content-format-check.config.ts"
```

## 10. Rodar a bateria de verificação, na ordem, e anexar a saída de cada comando ao resultado

```
bun install
bun run typecheck
bun run build
bun run test
bun run check:content-format-env
bun run lint
```

Todos os seis precisam terminar com código de saída 0. `bun run test` precisa reportar 2 de 2 testes passando. `bun run check:content-format-env` precisa terminar sem nenhuma linha `UNRESOLVED_IMPORT`.

## O que fazer se algo falhar

Nenhum passo desta ordem admite mais de uma forma de resolver uma falha. Se qualquer comando do passo 10 terminar com código diferente de 0, ou qualquer verificação do passo 3 não bater: pare, não tente uma segunda abordagem, não instale pacote fora da lista, não edite um arquivo fora dos que esta ordem pediu, e devolva a saída de erro completa como resultado. Quem revisa decide o próximo passo.

## Restrições

- Não crie `tailwind.config.*` nem arquivo de configuração do PostCSS.
- Não edite `tsconfig.json`, nenhuma flag.
- Não instale nenhum pacote além dos nomeados nos passos 1 e 2.
- Não edite nenhum arquivo fora de: `src/content-format/**`, `vitest.config.ts`, `vite.content-format-check.config.ts`, `eslint.config.js` (só o bloco do passo 7), `package.json` (só o campo `scripts`), `.gitignore` (só a linha do passo 8).
- Não toque em `.env*`.
- Não faça deploy nem publique. Comitar no `dok-draw-app` e o Lovable sincronizar com a `main` é o suficiente para esta ordem.
````

## Derivação

De onde cada exigência vem, para quem revisa conferir sem reler tudo.

| Item da ordem | Origem |
| :--- | :--- |
| Lista de 14 pacotes do passo 1, com as versões | `adrs/LEDGER.md`, bloco do ADR 002 (Formato de conteúdo), `dependencias`. Copiado um a um, conferido contra o arquivo em 2026-09-19 |
| `@types/mdast@^4.0.4` como dev | Mesmo bloco, `dependencias`, marcado `devDependency` no contrato |
| Não instalar `zod` | `adrs/LEDGER.md`, mesmo bloco: "zod (API v4): `^4.6.5`, ou `^3.25.76` importando de `zod/v4`". `decisoes/ACHADOS-2026-09-19-adrs-x-app.md`, item 4, confirma `zod ^3.25.76` já instalado no app |
| `vitest@5.0.1` | Mesma versão já usada no spike S-1 (`adrs/_work/spike-s1/package.json`), que roda sobre `vite@8.1.5`, a mesma versão do app. Peer dependency de `vitest@5.0.1` aceita `vite ^8.0.0` (conferido em `npm view vitest@5.0.1 peerDependencies` em 2026-09-19). Licença MIT, publicado 2026-09-15, fora do guardião de 24 horas do `bunfig.toml` |
| Guardião de 24 horas do `bunfig.toml` (passo 3) | `bunfig.toml` real do app: `minimumReleaseAge = 86400`, `minimumReleaseAgeExcludes` só lista pacotes `@lovable.dev/*`. Nenhum pacote desta ordem está na lista de exceção, então o guardião vale para todos |
| `src/content-format/index.ts` como placeholder, sem lógica | `adrs/ADR-002-formato-de-conteudo.md`, seção 11: a fatia F0 é "Build real no app Lovable... `install`, `build` e `tsc` passam", a F1 é quem porta `parseDok`/`serializeDok`/`normalizeDok`/`validateDok`. Esta ordem cobre só F0 |
| Fixtures em `src/content-format/testing/fixtures/`, copiadas como pré-requisito de despacho | Tarefa `T-0008`, seção "As fixtures": "A fatia F0 precisa levá-las para dentro do app, porque o critério de pronto da fatia F1 é 'as 30 fixtures rodam no Vitest'". Localização real: `adrs/ADR-002-anexos/fixtures/` (confirmado nesta sessão). A cópia sai do bloco enviado ao Lovable porque ele não tem acesso a `dok-draw-documentation`, ver "Decisões tomadas" |
| `environment: 'node'`, sem `jsdom` | `adrs/_work/ADR-002-emenda-1-rascunho.md`, seção 1: `src/content-format` roda em três ambientes, nenhum com DOM garantido. `T-0008` pede que a ordem use o rascunho "como base", com "justificativa própria" |
| Teste de fundação (passo 6) usa `node:fs` | Permitido porque só o Vitest carrega esse arquivo. Nunca entra no build de produção, verificado pelo `ignores` do bloco de ESLint (passo 7) e pelo `entry` do `vite.content-format-check.config.ts` (passo 8), que aponta só para `index.ts` |
| Bloco de ESLint do passo 7 | `adrs/_work/ADR-002-emenda-1-rascunho.md`, seção 1, terceira verificação proposta ("Lint com escopo restrito"). Padrão de `no-restricted-imports` já existe em `eslint.config.js` real do app, para o caso `server-only`, seguido aqui. Justificativa própria, não a da emenda: `src/content-format` roda no navegador (o adaptador do editor do ADR 005 chama `parseDok`/`serializeDok` no cliente), e nenhum builtin do Node existe lá, isso vale independentemente de qual runtime a server function usa |
| `group: ["node:**"]`, com dois asteriscos | Um asterisco só (`node:*`) não cruza `/` em glob, então não bloquearia `import ... from 'node:fs/promises'`. Dois asteriscos cobrem qualquer subcaminho depois de `node:` |
| `ignores: ["src/content-format/testing/**"]` | Decisão desta ordem, registrada em "Decisões tomadas" abaixo, para não quebrar o teste do passo 6 |
| Build de plataforma browser sem externos (passo 8) | `adrs/_work/ADR-002-emenda-1-rascunho.md`, seção 1, primeira verificação. Mesmo mecanismo verificado de fato no spike nesta sessão (`vite build`, modo library, `rollupOptions.external: []`, contra `dokmd.ts`: 363 módulos, sem erro de resolução). Contraprova: apontar a mesma configuração para um módulo que usa Node falha com `UNRESOLVED_IMPORT` |
| Scripts `test`, `typecheck`, `check:content-format-env` | `T-0008`, critério de pronto 3 (runner de teste com script no `package.json`) e 5 (cada verificação de fronteira com o comando que a executa) |
| Proibição de editar `tsconfig.json` | `T-0008`, critério de pronto 7, e achado 2 de `decisoes/ACHADOS-2026-09-19-adrs-x-app.md`: o app já é mais estrito que o `insumos/BASE.md` declara, e o custo dessas flags para `content-format` (pendência 6 do mesmo arquivo) é problema da fatia F1, que porta código de verdade, não desta ordem |

## Decisões tomadas

- **Fixtures como cópia versionada dentro de `dok-draw-app`, em vez de referência ao repositório `dok-draw-documentation`.** Alternativa descartada: `runFixtureSuite` ler as fixtures direto de `../dok-draw-documentation/adrs/ADR-002-anexos/fixtures/` em tempo de teste, sem copiar. Descartada porque o ambiente onde o Lovable builda e testa o app não necessariamente tem o repositório `dok-draw-documentation` disponível como pasta irmã, e um teste que só passa na máquina de quem escreveu a ordem não serve de gate de CI. Custo aceito: as fixtures viram dois arquivos-fonte (documentação e app), e uma fixture nova (por exemplo, a que a pendência 14 do ledger do ADR 002 pede) precisa ser copiada de novo depois de criada em `dok-draw-documentation`, sem sincronização automática entre os dois repositórios.
- **A cópia das fixtures saiu do bloco enviado ao Lovable e virou pré-requisito de despacho.** Um rascunho inicial desta ordem pedia ao próprio Lovable para copiar de `../dok-draw-documentation/...`, um caminho que o agente não alcança, porque ele só opera dentro de `dok-draw-app`. Quem despacha a ordem (com os dois repositórios disponíveis) faz a cópia e o commit antes de enviar o bloco "A ordem". Sem essa correção, o passo falharia por acesso a caminho inexistente, e a ordem teria deixado decisão em aberto (qual repositório o Lovable de fato enxerga) em vez de resolvê-la.
- **Justificativa da restrição de ambiente trocada de "alvo Cloudflare do Nitro" para "o módulo roda no navegador".** Ao verificar `decisoes/ACHADOS-2026-09-19-adrs-x-app.md`, item 3, o alvo Cloudflare da Emenda 1 se apoiava só num comentário em `vite.config.ts`, sem abrir o preset. Esta ordem abriu o pacote real: `@lovable.dev/vite-tanstack-config@2.20.0` (baixado do registro npm nesta sessão) força `nitroOpts.preset = "cloudflare-module"` dentro de um build do Lovable, **com `cloudflare: { nodeCompat: true, ... }`**. `nodeCompat: true` habilita a camada de compatibilidade do Node dentro do Workers, então builtins do Node podem até resolver em produção no servidor, o que enfraquece o argumento "Cloudflare não tem Node" como razão para a restrição. A restrição em si não muda (continua correta e conservadora), só a razão: o navegador nunca tem builtin do Node, isso não depende de qual preset o Nitro usa, e é evidência suficiente sozinha. Fica registrado aqui porque muda o texto da célula "Ambientes de execução" da Emenda 1, sem que esta ordem edite a Emenda 1 (fora do escopo de `T-0008`). Custo aceito: quem revisar a Emenda 1 precisa decidir se atualiza a seção 1 e o `riscos_abertos` sobre o plano do Cloudflare Workers, à luz de `nodeCompat: true` (achado novo, não estava em `ACHADOS-2026-09-19-adrs-x-app.md`).
- **`vitest.config.ts` separado, em vez de configurar `test` dentro do `vite.config.ts` do app.** O `vite.config.ts` real usa `defineConfig` do pacote `@lovable.dev/vite-tanstack-config`, um invólucro próprio sobre a API do Vite, sem garantia documentada de repassar um campo `test` para a configuração final. Um arquivo `vitest.config.ts` próprio, com o `defineConfig` do próprio `vitest/config`, evita depender de um comportamento do invólucro que não foi verificado. Custo aceito: dois arquivos de configuração de build em vez de um.
- **`src/content-format/index.ts` como placeholder de uma linha, em vez de deixar o diretório vazio.** O build de plataforma browser (passo 8) precisa de um arquivo de entrada real para verificar alguma coisa. Um diretório vazio não teria o que testar. Custo aceito: um arquivo que a fatia F1 descarta por inteiro.
- **`ignores` no bloco de ESLint do `content-format/testing`**, em vez de duas regras de escopo diferente (uma para `content-format/` e outra, mais permissiva, para `content-format/testing/`). Mais simples de ler e de manter, e o `files`/`ignores` do ESLint flat config já resolve isso numa entrada só.
