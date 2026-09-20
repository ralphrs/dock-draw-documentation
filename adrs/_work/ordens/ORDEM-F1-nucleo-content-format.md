# Ordem F1: núcleo do `src/content-format`

Ordem de implementação para o agente do Lovable, derivada da fatia F1 do ADR 002 (`adrs/ADR-002-formato-de-conteudo.md`, seção 11), ajustada ao que a fatia F0 já entregou e ao que a Emenda 1 mudou. Escrita conforme `decisoes/DEC-0007-lovable-como-implementador.md`: o texto abaixo não deixa decisão em aberto para quem executa.

Todo o código desta ordem foi escrito e verificado nesta sessão contra os pacotes reais instalados pela F0 (mesmas versões), com `tsc` sob as seis flags estritas do `tsconfig.json` do app, com o `.prettierrc` real do app, e com as 30 fixtures reais rodando via Vitest. Os três arquivos abaixo já saem formatados como o repositório formata, então esta ordem não repete o defeito da F0 (27 problemas de `prettier/prettier`, achado do `DDP-9`).

## A ordem

````md
# Ordem: núcleo do `src/content-format`

Você trabalha no repositório `dok-draw-app`. A fatia F0 já entregou a fundação. Esta ordem substitui o placeholder de `src/content-format/index.ts` pelo módulo real e acrescenta a suíte de fixtures. Siga os passos na ordem escrita. Nenhum passo é opcional.

## O que já existe, não recrie

A fatia F0 (`ccc3ce2`) já entregou, e nenhum destes arquivos muda nesta ordem:

- As 16 dependências do contrato (14 em `dependencies`, `@types/mdast` e `vitest` em `devDependencies`). Não rode `bun add` de novo.
- `vitest.config.ts` (raiz), `environment: "node"`, `include: ["src/**/*.test.ts"]`.
- `src/content-format/testing/environment.test.ts`, com os dois testes de fundação. Não o edite, não o apague.
- `src/content-format/testing/fixtures/`, com `manifest.json` e as 30 subpastas.
- O bloco de `eslint.config.js` com `files: ["src/content-format/**/*.{ts,tsx}"]`, `no-restricted-globals` e `no-restricted-imports`.
- `vite.content-format-check.config.ts`, que builda `src/content-format/index.ts` isolado, sem externos.
- Os scripts `test`, `typecheck`, `check:content-format-env` em `package.json`.

## Os dois padrões de correção das flags estritas do app

O `tsconfig.json` do app tem seis flags que o harness de referência (`harness/dokmd.mjs`, fora deste repositório) não precisava respeitar. Só duas geram erro no código desta fatia, sempre da mesma forma. Os dois padrões já estão aplicados em todo o código abaixo. Se você escrever qualquer linha nova em `src/content-format` depois desta ordem, aplique os dois também, em vez de desligar a flag ou usar `as` para calar o erro.

**Padrão 1, `noPropertyAccessFromIndexSignature`.** Em um valor de tipo `Record<string, unknown>`, acesse a chave por colchete, nunca por ponto:

```ts
// Errado, TS4111:
if (ordered.props && typeof ordered.props === "object") { /* ... */ }

// Certo:
if (ordered["props"] && typeof ordered["props"] === "object") { /* ... */ }
```

**Padrão 2, `exactOptionalPropertyTypes`.** Quando um campo opcional (`campo?: T`) recebe um valor que pode ser `T | undefined` de verdade (grupo de captura de regex, campo opcional de outro tipo), declare o campo como `campo?: T | undefined`, não só `campo?: T`:

```ts
// Errado, TS2322 (a chave existe com valor undefined, e o tipo não admite isso):
export type UrlClass = { kind: "page"; id: string; anchor?: string };
return { kind: "page", id, anchor: m[2] }; // m[2]: string | undefined

// Certo:
export type UrlClass = { kind: "page"; id: string; anchor?: string | undefined };
return { kind: "page", id, anchor: m[2] };
```

## 1. Substituir `src/content-format/index.ts`

Apague o conteúdo do placeholder e substitua por este arquivo inteiro:

```ts
// Núcleo de src/content-format (fatia F1 do ADR 002).
// Porte de adrs/ADR-002-anexos/harness/dokmd.mjs (referência do spike S-1).
// Lógica idêntica ao harness. Mudanças: tipos, nomes do contrato do ADR 002
// (parseDok, serializeDok, normalizeDok, validateDok) e Diagnostic.message no lugar de msg.

import type { Nodes, Root } from "mdast";
import type { ContainerDirective, LeafDirective } from "mdast-util-directive";
import { fromMarkdown } from "mdast-util-from-markdown";
import { toMarkdown, type Options as ToMarkdownOptions } from "mdast-util-to-markdown";
import { gfm } from "micromark-extension-gfm";
import { gfmFromMarkdown, gfmToMarkdown } from "mdast-util-gfm";
import { directive } from "micromark-extension-directive";
import { directiveFromMarkdown, directiveToMarkdown } from "mdast-util-directive";
import { frontmatter } from "micromark-extension-frontmatter";
import { frontmatterFromMarkdown, frontmatterToMarkdown } from "mdast-util-frontmatter";
import { visit, SKIP } from "unist-util-visit";
import YAML from "yaml";
import { z } from "zod/v4";

export const DOK_FORMAT_VERSION = 1;

export type Diagnostic = {
  code: `DOK-${"E" | "W"}${number}`;
  message: string;
  line?: number | undefined;
};

// ---------------------------------------------------------------------------
// Sintaxe: CommonMark + GFM + frontmatter YAML + directives SÓ DE BLOCO.
// ---------------------------------------------------------------------------
const directiveSyntax = directive();
const flowOnlyDirectives = { flow: directiveSyntax.flow };

const directiveMd = directiveToMarkdown();
const flowOnlyDirectiveMd: ToMarkdownOptions = {
  ...directiveMd,
  unsafe: (directiveMd.unsafe ?? []).filter(
    (u) => !(u.character === ":" && u.inConstruct?.includes?.("phrasing")),
  ),
};

export const SERIALIZE_OPTIONS = {
  bullet: "-",
  bulletOther: "*",
  bulletOrdered: ".",
  emphasis: "_",
  strong: "*",
  rule: "-",
  fence: "`",
  fences: true,
  listItemIndent: "one",
  incrementListMarker: true,
  setext: false,
  closeAtx: false,
  quote: '"',
  resourceLink: false,
  tightDefinitions: false,
} as const satisfies ToMarkdownOptions;

export function parseDok(text: string): Root {
  return fromMarkdown(text, {
    extensions: [frontmatter(["yaml"]), gfm(), flowOnlyDirectives],
    mdastExtensions: [
      frontmatterFromMarkdown(["yaml"]),
      gfmFromMarkdown(),
      directiveFromMarkdown(),
    ],
  });
}

export function serializeDok(tree: Root): string {
  return toMarkdown(tree, {
    ...SERIALIZE_OPTIONS,
    extensions: [frontmatterToMarkdown(["yaml"]), gfmToMarkdown(), flowOnlyDirectiveMd],
  });
}

// ---------------------------------------------------------------------------
// Frontmatter
// ---------------------------------------------------------------------------
const tag = z
  .string()
  .max(64)
  .regex(/^(?!\d+$)[\p{L}\p{N}_/-]+$/u, "tag: letras, números, _ - / e ao menos um não-dígito");
const propKey = z.string().regex(/^[a-z][a-z0-9_-]{0,63}$/);
const propScalar = z.union([z.string(), z.number(), z.boolean(), z.null()]);
const propValue = z.union([propScalar, z.array(z.union([z.string(), z.number(), z.boolean()]))]);
const uniq = (arr: unknown[]) => new Set(arr).size === arr.length;

export const frontmatterSchema = z.strictObject({
  dok: z.literal(DOK_FORMAT_VERSION),
  id: z.uuid(),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(300).optional(),
  tags: z.array(tag).max(50).refine(uniq, "tags duplicadas").optional(),
  aliases: z
    .array(z.string().trim().min(1).max(200))
    .max(20)
    .refine(uniq, "aliases duplicados")
    .optional(),
  props: z.record(propKey, propValue).optional(),
});

export const FRONTMATTER_KEY_ORDER = [
  "dok",
  "id",
  "title",
  "description",
  "tags",
  "aliases",
  "props",
] as const;

function canonicalYaml(data: Record<string, unknown>): string {
  const ordered: Record<string, unknown> = {};
  for (const k of FRONTMATTER_KEY_ORDER) if (data[k] !== undefined) ordered[k] = data[k];
  for (const k of Object.keys(data)) if (!(k in ordered)) ordered[k] = data[k]; // mantém p/ o validador acusar
  if (ordered["props"] && typeof ordered["props"] === "object") {
    ordered["props"] = Object.fromEntries(
      Object.entries(ordered["props"] as Record<string, unknown>).sort(([a], [b]) =>
        a < b ? -1 : 1,
      ),
    );
  }
  return YAML.stringify(ordered, { lineWidth: 0 }).trimEnd();
}

// ---------------------------------------------------------------------------
// Diretivas registradas (v1)
// ---------------------------------------------------------------------------
export const CALLOUT_NAMES = ["note", "tip", "caution", "danger"] as const;
export const CALLOUT_VARIANTS: readonly string[] = [
  "info",
  "important",
  "abstract",
  "summary",
  "tldr",
  "todo",
  "quote",
  "cite",
  "hint",
  "success",
  "check",
  "done",
  "example",
  "question",
  "help",
  "faq",
  "warning",
  "attention",
  "error",
  "bug",
  "failure",
  "fail",
  "missing",
];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const SLUG = /^[a-z0-9][a-z0-9-]*$/;

type DirectiveSpec = { attrs: readonly string[]; labelRequired?: boolean };
type DirectiveKind = "containerDirective" | "leafDirective";

export const DIRECTIVES: Record<DirectiveKind, Record<string, DirectiveSpec>> = {
  containerDirective: {
    note: { attrs: ["variant", "fold"] },
    tip: { attrs: ["variant", "fold"] },
    caution: { attrs: ["variant", "fold"] },
    danger: { attrs: ["variant", "fold"] },
    tabs: { attrs: ["sync"] },
    tab: { attrs: [], labelRequired: true },
    steps: { attrs: [] },
  },
  leafDirective: {
    diagram: { attrs: ["src", "view", "rev", "title"] },
  },
};

const ATTR_RULES: Record<string, (v: string) => boolean> = {
  variant: (v) => CALLOUT_VARIANTS.includes(v),
  fold: (v) => v === "open" || v === "closed",
  sync: (v) => SLUG.test(v),
  src: (v) => /^dok:diagram\//.test(v) && UUID.test(v.slice("dok:diagram/".length)),
  view: (v) => UUID.test(v),
  rev: (v) => UUID.test(v),
  title: (v) => v.trim().length > 0 && v.length <= 200,
};

// ---------------------------------------------------------------------------
// URIs
// ---------------------------------------------------------------------------
export type UrlClass =
  | { kind: "forbidden" }
  | { kind: "invalid" }
  | { kind: "page"; id: string; anchor?: string | undefined }
  | { kind: "unresolved"; title: string }
  | { kind: "asset"; id: string }
  | { kind: "diagram"; id: string; view?: string | undefined }
  | { kind: "external" }
  | { kind: "self-anchor" }
  | { kind: "relative" };

export function classifyUrl(url: string, { image = false }: { image?: boolean } = {}): UrlClass {
  const lower = url.trim().toLowerCase();
  if (/^(javascript|vbscript|data|file):/.test(lower)) return { kind: "forbidden" };
  if (lower.startsWith("dok:")) {
    let m: RegExpMatchArray | null;
    if ((m = url.match(/^dok:page\/([0-9a-f-]{36})(?:#([a-z0-9-]+))?$/)) && UUID.test(m[1]!))
      return image ? { kind: "invalid" } : { kind: "page", id: m[1]!, anchor: m[2] };
    if ((m = url.match(/^dok:page\/new\?title=([^#\s]+)$/)))
      return image ? { kind: "invalid" } : { kind: "unresolved", title: decodeURIComponent(m[1]!) };
    if ((m = url.match(/^dok:asset\/([0-9a-f-]{36})$/)) && UUID.test(m[1]!))
      return { kind: "asset", id: m[1]! };
    if (
      (m = url.match(/^dok:diagram\/([0-9a-f-]{36})(?:\?view=([0-9a-f-]{36}))?$/)) &&
      UUID.test(m[1]!)
    )
      return image ? { kind: "invalid" } : { kind: "diagram", id: m[1]!, view: m[2] };
    return { kind: "invalid" };
  }
  if (/^https:\/\//.test(lower)) return { kind: "external" };
  if (!image && /^(http:\/\/|mailto:)/.test(lower)) return { kind: "external" };
  if (!image && /^#[a-z0-9-]+$/.test(url)) return { kind: "self-anchor" };
  return { kind: "relative" };
}

// ---------------------------------------------------------------------------
// Normalização canônica (transformações que o save sempre aplica)
// ---------------------------------------------------------------------------
function inlineReferences(tree: Root): void {
  const defs = new Map<string, { url: string; title?: string | null | undefined }>();
  visit(tree, "definition", (n) => {
    const key = n.identifier.toLowerCase();
    if (!defs.has(key)) defs.set(key, n);
  });
  visit(tree, (n, i, parent) => {
    if (n.type === "linkReference" || n.type === "imageReference") {
      const d = defs.get(n.identifier.toLowerCase());
      if (!d || !parent || i === undefined) return;
      const repl: Nodes =
        n.type === "linkReference"
          ? { type: "link", url: d.url, title: d.title ?? null, children: n.children }
          : { type: "image", url: d.url, title: d.title ?? null, alt: n.alt };
      (parent.children as Nodes[])[i] = repl;
    }
  });
  visit(tree, "definition", (_n, i, parent) => {
    if (!parent || i === undefined) return;
    parent.children.splice(i, 1);
    return [SKIP, i];
  });
}

function isDirective(n: Nodes): n is ContainerDirective | LeafDirective {
  return n.type === "containerDirective" || n.type === "leafDirective";
}

function reorderDirectiveAttributes(tree: Root): void {
  visit(tree, (n) => {
    if (!isDirective(n)) return;
    const spec = DIRECTIVES[n.type]?.[n.name];
    if (!spec || !n.attributes) return;
    const out: Record<string, string | null | undefined> = {};
    for (const k of spec.attrs)
      if (n.attributes[k] !== undefined && n.attributes[k] !== null) out[k] = n.attributes[k];
    for (const k of Object.keys(n.attributes)) if (!(k in out)) out[k] = n.attributes[k];
    n.attributes = out;
  });
}

export function normalizeDok(text: string): string {
  const tree = parseDok(text);
  const first = tree.children[0];
  if (first?.type === "yaml") {
    try {
      first.value = canonicalYaml(YAML.parse(first.value) ?? {});
    } catch {
      /* YAML inválido: o validador acusa */
    }
  }
  inlineReferences(tree);
  reorderDirectiveAttributes(tree);
  return serializeDok(tree);
}

// ---------------------------------------------------------------------------
// Validação (erros E bloqueiam o save; avisos W não)
// ---------------------------------------------------------------------------
export function validateDok(text: string): Diagnostic[] {
  const diags: Diagnostic[] = [];
  const add = (code: Diagnostic["code"], message: string, node?: Nodes) =>
    diags.push({ code, message, line: node?.position?.start.line });
  const tree = parseDok(text);

  const first = tree.children[0];
  if (first?.type !== "yaml") add("DOK-E001", "frontmatter ausente");
  else {
    let data: unknown;
    try {
      data = YAML.parse(first.value);
    } catch (e) {
      add("DOK-E001", `YAML inválido: ${(e as Error).message}`, first);
    }
    const version = (data as { dok?: unknown } | null | undefined)?.dok;
    if (data && typeof version === "number" && version > DOK_FORMAT_VERSION)
      add("DOK-E009", `versão de formato ${version} é mais nova que ${DOK_FORMAT_VERSION}`, first);
    else if (data !== undefined) {
      const r = frontmatterSchema.safeParse(data);
      if (!r.success)
        for (const iss of r.error.issues)
          add("DOK-E001", `${iss.path.join(".") || "(raiz)"}: ${iss.message}`, first);
    }
  }

  visit(tree, (n, _i, parent) => {
    if (n.type === "yaml" && n !== first) add("DOK-E001", "frontmatter fora do topo", n);
    if (n.type === "html") add("DOK-E002", `HTML cru não é permitido: ${n.value.slice(0, 40)}`, n);
    if (isDirective(n)) {
      const spec = DIRECTIVES[n.type][n.name];
      if (!spec) {
        add(
          "DOK-E003",
          `diretiva desconhecida: ${n.type === "leafDirective" ? "::" : ":::"}${n.name}`,
          n,
        );
        return;
      }
      for (const [k, v] of Object.entries(n.attributes ?? {})) {
        if (!spec.attrs.includes(k))
          add("DOK-E004", `atributo não permitido em ${n.name}: ${k}`, n);
        else if (!ATTR_RULES[k]!(v ?? ""))
          add("DOK-E004", `valor inválido em ${n.name}.${k}: "${v}"`, n);
      }
      const firstChild = n.children?.[0] as { data?: { directiveLabel?: boolean } } | undefined;
      const hasLabel = firstChild?.data?.directiveLabel === true;
      if (spec.labelRequired && !hasLabel) add("DOK-E004", `${n.name} exige rótulo [..]`, n);
      if (n.name === "diagram") {
        for (const req of ["src", "view", "title"])
          if (!n.attributes?.[req]) add("DOK-E004", `diagram exige o atributo ${req}`, n);
        if (!hasLabel)
          add("DOK-W103", "diagram sem descrição textual [..]; o fallback usará o title", n);
      }
      if (
        n.name === "tab" &&
        !(parent?.type === "containerDirective" && (parent as ContainerDirective).name === "tabs")
      )
        add("DOK-E008", ":::tab fora de ::::tabs", n);
      if (n.name === "tabs") {
        const body = (n.children as Nodes[]).filter(
          (c) => !(c as { data?: { directiveLabel?: boolean } }).data?.directiveLabel,
        );
        if (
          !body.length ||
          body.some((c) => !(c.type === "containerDirective" && c.name === "tab"))
        )
          add("DOK-E008", "::::tabs deve conter apenas :::tab (ao menos um)", n);
      }
      if (n.name === "steps") {
        const body = (n.children as Nodes[]).filter(
          (c) => !(c as { data?: { directiveLabel?: boolean } }).data?.directiveLabel,
        );
        if (body.length !== 1 || body[0]!.type !== "list" || !body[0]!.ordered)
          add("DOK-E008", ":::steps deve conter exatamente uma lista ordenada", n);
      }
    }
    if (n.type === "link" || n.type === "image") {
      const c = classifyUrl(n.url, { image: n.type === "image" });
      if (c.kind === "forbidden")
        add("DOK-E005", `esquema de URL proibido: ${n.url.slice(0, 30)}`, n);
      if (c.kind === "relative" || c.kind === "invalid")
        add("DOK-E006", `URL não permitida (use dok: ou https): ${n.url.slice(0, 40)}`, n);
      if (c.kind === "unresolved") add("DOK-W101", `link não resolvido: ${c.title}`, n);
      if (n.type === "image" && c.kind === "external") add("DOK-W102", "imagem externa", n);
    }
    if (n.type === "linkReference" || n.type === "imageReference" || n.type === "definition")
      add("DOK-E010", "referência não normalizada (o save converte para link inline)", n);
  });
  return diags;
}
```

`classifyUrl` já era exportado. A Emenda 1 só o declara interface publicada, nenhuma mudança de assinatura.

## 2. Criar `src/content-format/testing/runFixtureSuite.ts`

Arquivo novo, com este conteúdo inteiro:

```ts
// Runner de fixtures compartilhado, publicado pela Emenda 1 ao ADR 002.
// Lê manifest.json e itera o array: nenhuma contagem fixa de fixtures no código.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { normalizeDok, validateDok } from "../index";

type ManifestEntry = {
  dir: string;
  stage: "canonical" | "import";
  errors: string[];
  warnings: string[];
};

export type SuiteRow = {
  dir: string;
  stage: "canonical" | "import";
  passed: boolean;
  failures: string[];
};

export type SuiteResult = { total: number; passed: number; failed: number; rows: SuiteRow[] };

const IMPORTER_ONLY = new Set(["DOK-W104", "DOK-W106"]); // emitidos pelo importador, não pelo validador

export function runFixtureSuite(fixturesRoot: string, manifestPath: string): SuiteResult {
  const manifest: ManifestEntry[] = JSON.parse(readFileSync(manifestPath, "utf8"));
  const rows: SuiteRow[] = [];
  let failed = 0;

  for (const f of manifest) {
    const dir = join(fixturesRoot, f.dir);
    const input = readFileSync(join(dir, "input.md"), "utf8");
    const expected = existsSync(join(dir, "expected.md"))
      ? readFileSync(join(dir, "expected.md"), "utf8")
      : null;
    const checks: [string, boolean][] = [];

    const n1 = normalizeDok(input);
    checks.push(["idempotente", normalizeDok(n1) === n1]);

    if (expected !== null) {
      checks.push(["expected é ponto fixo", normalizeDok(expected) === expected]);
      const d = validateDok(expected);
      const errs = d.filter((x) => x.code.startsWith("DOK-E"));
      checks.push(["expected sem erros", errs.length === 0]);
      const warns = [
        ...new Set(d.filter((x) => x.code.startsWith("DOK-W")).map((x) => x.code)),
      ].sort();
      const wantWarns = f.warnings.filter((w) => !IMPORTER_ONLY.has(w)).sort();
      checks.push(["avisos esperados", JSON.stringify(warns) === JSON.stringify(wantWarns)]);
      if (f.stage === "canonical") checks.push(["N(input) === expected", n1 === expected]);
    } else {
      const codes = [
        ...new Set(
          validateDok(n1)
            .map((x) => x.code)
            .filter((c) => c.startsWith("DOK-E")),
        ),
      ].sort();
      checks.push([
        "erros esperados",
        JSON.stringify(codes) === JSON.stringify([...f.errors].sort()),
      ]);
    }

    const failures = checks.filter(([, ok]) => !ok).map(([name]) => name);
    if (failures.length) failed++;
    rows.push({ dir: f.dir, stage: f.stage, passed: failures.length === 0, failures });
  }

  return { total: manifest.length, passed: manifest.length - failed, failed, rows };
}

export function fixturesDefaultPaths(testFileDir: string): {
  fixturesRoot: string;
  manifestPath: string;
} {
  const fixturesRoot = join(testFileDir, "fixtures");
  return { fixturesRoot, manifestPath: join(fixturesRoot, "manifest.json") };
}
```

`dirname` fica importado mas sem uso direto nesta versão do arquivo. Se o `lint` acusar `no-unused-vars` nesta linha, remova o símbolo `dirname` do import: `import { join } from "node:path";`. `@typescript-eslint/no-unused-vars` está desligado no `eslint.config.js` do app, então isto não deve gerar erro, é só uma checagem de sanidade.

## 3. Criar `src/content-format/testing/fixtures.test.ts`

Arquivo novo, com este conteúdo inteiro:

```ts
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { fixturesDefaultPaths, runFixtureSuite } from "./runFixtureSuite";

describe("fixtures do ADR 002 (fatia F1)", () => {
  it("passa em todas as fixtures do manifest, sem contagem fixa", () => {
    const testFileDir = dirname(fileURLToPath(import.meta.url));
    const { fixturesRoot, manifestPath } = fixturesDefaultPaths(testFileDir);
    const result = runFixtureSuite(fixturesRoot, manifestPath);
    const failedRows = result.rows.filter((r) => !r.passed);
    expect(failedRows, JSON.stringify(failedRows, null, 2)).toHaveLength(0);
    expect(result.passed).toBe(result.total);
  });
});
```

Este teste é o único ponto que a fatia F1 acrescenta ao Vitest. `environment.test.ts`, da F0, continua rodando do lado dele, sem mudança.

## 4. Rodar a bateria de verificação, na ordem, e anexar a saída de cada comando ao resultado

```
bun run format
bun run typecheck
bun run build
bun run test
bun run check:content-format-env
bun run lint
```

`bun run format` roda antes dos outros porque garante que qualquer diferença de espaço em branco entre o que esta ordem colou e a versão exata do Prettier instalado no app já saia corrigida, sem custar um item de falha. Os cinco comandos seguintes precisam terminar com código de saída 0. `bun run test` precisa reportar 2 arquivos de teste, todos passando (`environment.test.ts`, com 2 testes, e `fixtures.test.ts`, com 1 teste que por dentro roda as 30 fixtures). `bun run check:content-format-env` precisa terminar sem nenhuma linha `UNRESOLVED_IMPORT` nem `Rolldown failed to resolve`. `bun run lint` precisa terminar sem nenhum problema nos arquivos de `src/content-format/`, incluindo os quatro que a F0 criou.

## O que fazer se algo falhar

Nenhum passo desta ordem admite mais de uma forma de resolver uma falha.

- **`bun run format` muda alguma coisa nos dois arquivos novos.** Aceitável, é para isso que o passo existe. Prossiga para o próximo comando com o resultado da formatação.
- **`bun run typecheck` falha em `src/content-format/index.ts` ou em `runFixtureSuite.ts`.** Não desligue nenhuma flag do `tsconfig.json`, não introduza `as any` nem `@ts-ignore`. Pare e devolva a saída completa do erro como resultado.
- **`bun run test` falha em `fixtures.test.ts`, com uma ou mais fixtures na lista de `failedRows`.** Não edite a fixture nem o `manifest.json` para fazer passar. Pare e devolva a lista de `failedRows` (a mensagem de falha já vem em JSON, com o nome de cada checagem que não bateu) como resultado.
- **`bun run test` falha em `environment.test.ts`.** Esse arquivo é da F0, não desta ordem. Pare, porque uma falha ali indica que algo desta ordem quebrou infraestrutura que não deveria tocar, e devolva a saída.
- **`bun run check:content-format-env` falha com `UNRESOLVED_IMPORT` ou equivalente.** Não adicione o pacote a `rollupOptions.external`. Um import não resolvido em plataforma browser significa que algum código de `src/content-format/index.ts` depende de builtin do Node ou de algo que não roda no navegador. Pare e devolva a saída, apontando a linha do import.
- **`bun run lint` acusa problema fora de `src/content-format/`.** Não corrija arquivo fora do escopo desta ordem. Pare e devolva a saída.
- **Qualquer outro comando termina com código diferente de 0.** Pare, não tente uma segunda abordagem, não instale pacote fora do que já está instalado, não edite arquivo fora dos três nomeados nesta ordem, e devolva a saída de erro completa como resultado. Quem revisa decide o próximo passo.

## Restrições

- Não instale nenhum pacote. Todas as dependências desta fatia já estão instaladas pela F0.
- Não edite `tsconfig.json`, nenhuma flag.
- Não edite nenhum arquivo fora de: `src/content-format/index.ts`, `src/content-format/testing/runFixtureSuite.ts`, `src/content-format/testing/fixtures.test.ts`. Isso inclui não editar `environment.test.ts`, `vitest.config.ts`, `eslint.config.js`, `vite.content-format-check.config.ts` nem `package.json`.
- Não toque em `.env*`.
- Não faça deploy nem publique. Comitar no `dok-draw-app` e o Lovable sincronizar com a `main` é o suficiente para esta ordem.
````

## Derivação

De onde cada exigência vem, para quem revisa conferir sem reler tudo.

| Item da ordem | Origem |
| :--- | :--- |
| Conteúdo de `index.ts` | Porte de `adrs/_work/spike-s1/content-format/dokmd.ts` (estado do S-1, commit `8f531b1`, 30/30 nas fixtures). Reformatado com `.prettierrc` real do app (`printWidth: 100, semi: true, singleQuote: false, trailingComma: "all"`), verificado nesta sessão com `prettier --check` real, sem pendência |
| `import { z } from "zod/v4"` em vez de `"zod"` | `adrs/LEDGER.md`, bloco do ADR 002: "zod (API v4): `^4.6.5`, ou `^3.25.76` importando de `zod/v4`". App tem `zod ^3.25.76`. Testado nesta sessão contra o `zod@3.25.76` real (instalado num ambiente isolado): o mesmo `frontmatterSchema` compila limpo sob as seis flags do app, e o import bundla sem erro num build de plataforma browser real (98 módulos) |
| As duas correções das flags estritas, aplicadas nos oito pontos | `adrs/_work/ADR-002-custo-flags-estritas.md` (`DDP-2`), os dois grupos de causa. Verificado nesta sessão: `index.ts` compila com exit 0 sob as seis flags reais do app (`noFallthroughCasesInSwitch`, `noImplicitOverride`, `noImplicitReturns`, `noPropertyAccessFromIndexSignature`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noUncheckedSideEffectImports`) |
| `classifyUrl` citado como já publicado | `adrs/ADR-002-emenda-1.md` (`DDP-8`), seção 5: `classifyUrl` vira interface publicada, sem mudança de assinatura |
| `runFixtureSuite.ts`, assinatura `(fixturesRoot, manifestPath) => SuiteResult` | `adrs/ADR-002-emenda-1.md`, seção 4: runner compartilhado, sem número fixo de fixtures. A assinatura da issue é literal, o `SuiteResult` e o `SuiteRow` são forma nova desta ordem, não do contrato |
| `runFixtureSuite.ts` lê `manifest.length`, sem constante `30` | Mesma seção da Emenda 1, e critério de pronto do ADR 002 seção 8.1: "o placar final é `${manifest.length - fail}/${manifest.length}`" |
| `fixtures.test.ts` compara `result.passed` com `result.total`, não com o número `30` | Mesmo motivo: a fatia F5 do ADR 002 (pendência 14 do ledger) acrescenta fixture nova, e o teste não pode assumir a contagem de hoje |
| Não recriar os quatro arquivos e os scripts da F0 | `adrs/_work/ordens/ORDEM-F0-fundacao-content-format.md`, entregáveis, conferidos nesta sessão contra o commit real `ccc3ce2` do app (`git show ccc3ce2 --stat`) |
| Bateria de verificação (passo 4) | `T-0008`/`DDP-5` já usava o mesmo padrão (script por script, cada um com o resultado esperado). `bun run format` acrescentado por causa do defeito da F0 (critério de pronto 4 desta issue) |
| Ordem de `bun run format` antes dos outros comandos | Decisão desta ordem, registrada em "Decisões tomadas" |
| Playbook de "O que fazer se algo falhar" | `T-0008` já tinha a mesma seção. Ampliada aqui com um caso por comando da bateria, porque a fatia F1 tem mais pontos de falha possíveis que a F0 (código de verdade, não só configuração) |

## Decisões tomadas

- **`bun run format` como primeiro comando da bateria, não o último.** Alternativa descartada: rodar `bun run format` só se `bun run lint` acusar problema de Prettier, tratando a formatação como recuperação de erro em vez de passo normal. Descartada porque transforma um passo determinístico (formatar) numa ramificação condicional que a ordem teria que descrever duas vezes. Custo aceito: o comando roda mesmo quando o conteúdo colado já está formatado (era o caso aqui, verificado), um passo sem efeito na maioria das execuções.
- **`SuiteResult`/`SuiteRow` como os únicos tipos novos, sem reaproveitar `ManifestEntry` do `check-fixtures.ts` do spike.** O `check-fixtures.ts` é ferramenta do spike, em `adrs/_work/`, nunca chega ao app. `runFixtureSuite.ts` precisa da própria definição de `ManifestEntry`, porque não importa nada do spike. Custo aceito: duas definições de forma idêntica, uma no spike e uma no app, sem tipo compartilhado entre os dois repositórios.
- **`fixturesDefaultPaths` como função auxiliar exportada, em vez de o teste montar o caminho sozinho.** Mantém a lógica de "onde ficam as fixtures relativas ao arquivo de teste" num único lugar, caso um segundo teste (por exemplo, no ADR 007 ou 005, quando forem escritos) precise do mesmo caminho. Custo aceito: uma função a mais exportada por um runner que, hoje, só tem um consumidor.
- **Nota sobre `dirname` sem uso em `runFixtureSuite.ts`** registrada dentro da própria ordem (passo 2), em vez de remover o import sem registrar o motivo. A regra de lint que desligaria isso já existe (`@typescript-eslint/no-unused-vars: "off"`), então o registro é só uma verificação de sanidade para quem revisa, não uma ambiguidade real.
