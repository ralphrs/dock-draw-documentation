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
export const DOK_MAX_CANONICAL_BYTES = 300_000;

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

// Normaliza a partir de uma árvore já parseada, mutando-a. O chamador decide
// se a árvore pode ser mutada (normalizeDok, árvore local e descartada) ou
// precisa clonar antes de chamar (validateDok, a mesma árvore segue para o
// visit logo depois, e inlineReferences remove linkReference/imageReference/
// definition da árvore, o que impediria o DOK-E010 de disparar se a árvore
// mutada fosse a mesma que o visit percorre).
function normalizeTree(tree: Root): string {
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

export function normalizeDok(text: string): string {
  return normalizeTree(parseDok(text));
}

// ---------------------------------------------------------------------------
// Validação (erros E bloqueiam o save; avisos W não)
// ---------------------------------------------------------------------------
export function validateDok(text: string): Diagnostic[] {
  const diags: Diagnostic[] = [];
  const add = (code: Diagnostic["code"], message: string, node?: Nodes) =>
    diags.push({ code, message, line: node?.position?.start.line });
  const tree = parseDok(text);

  const normalized = normalizeTree(structuredClone(tree));
  const byteLength = new TextEncoder().encode(normalized).length;
  if (byteLength > DOK_MAX_CANONICAL_BYTES) {
    add(
      "DOK-E011",
      `página excede o tamanho máximo (${DOK_MAX_CANONICAL_BYTES} bytes de texto canônico), atual: ${byteLength} bytes`,
    );
    return diags;
  }

  const first = tree.children[0];
  if (first?.type !== "yaml") {
    add("DOK-E001", "frontmatter ausente");
    return diags;
  }
  let data: unknown;
  try {
    data = YAML.parse(first.value);
  } catch (e) {
    add("DOK-E001", `YAML inválido: ${(e as Error).message}`, first);
    return diags;
  }
  const version = (data as { dok?: unknown } | null | undefined)?.dok;
  if (data && typeof version === "number" && version > DOK_FORMAT_VERSION) {
    add("DOK-E009", `versão de formato ${version} é mais nova que ${DOK_FORMAT_VERSION}`, first);
  } else if (data !== undefined) {
    const r = frontmatterSchema.safeParse(data);
    if (!r.success) {
      for (const iss of r.error.issues)
        add("DOK-E001", `${iss.path.join(".") || "(raiz)"}: ${iss.message}`, first);
      return diags;
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

`validateDok` faz um `parseDok` só. `normalizeDok(text)` reparseia o texto por dentro, e chamá-la de dentro de `validateDok` custaria um segundo parse, portanto `validateDok` extrai o miolo de `normalizeDok` num helper interno, `normalizeTree`, que recebe a árvore já parseada em vez do texto. `normalizeDok(text)` continua com a mesma assinatura publicada, e passa a ser `parseDok` seguido do helper.

`normalizeTree` muta a árvore que recebe: escreve em `first.value` o YAML canônico, e `inlineReferences` remove os nós `definition` e troca `linkReference`/`imageReference` por `link`/`image`. Essa segunda mutação não é inofensiva para `validateDok`: o `visit` mais adiante emite `DOK-E010` justamente quando encontra `linkReference`, `imageReference` ou `definition` na árvore, e uma árvore já normalizada nunca mais tem esses nós, o que apagaria esse diagnóstico em silêncio. Por isso `validateDok` chama `normalizeTree` sobre `structuredClone(tree)`, nunca sobre a árvore original. `structuredClone` é global de plataforma (Node, navegador e Cloudflare Workers o expõem, e o `tsconfig.json` do app já inclui a lib `DOM` que o tipa), não é builtin do Node importado por `node:*`, então não fere a restrição do ledger.

Com o parse único, a sequência de `validateDok` passa a ser: `parseDok(text)`, que não é checagem. Normalização a partir dessa árvore (clonada) e tamanho em bytes UTF-8 por `TextEncoder` (nunca `Buffer.byteLength`, builtin do Node proibido em `src/content-format`). Acima de `DOK_MAX_CANONICAL_BYTES`, emite `DOK-E011` e retorna, antes de qualquer outra checagem, exatamente como `ADR-002-emenda-1.md` linha 79 e `LEDGER.md` linha 210 exigem. Só então o frontmatter é checado: ausente, YAML inválido ou fora do esquema (`frontmatterSchema`) emite `DOK-E001` e retorna. Só chega ao `visit`, sobre a árvore original (nunca a clonada), o texto dentro do tamanho e com frontmatter válido. O caso de versão futura (`DOK-E009`) não interrompe a validação, porque o frontmatter continua sintaticamente válido, só declara uma versão que este validador ainda não conhece.

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
import { validateDok } from "../index";
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

  it("emite DOK-E011 para texto canônico acima de 300.000 bytes", () => {
    const frontmatter = [
      "---",
      "dok: 1",
      "id: 11111111-1111-4111-8111-111111111111",
      "title: pagina grande",
      "---",
      "",
    ].join("\n");
    const body = "x".repeat(310_000);
    const diags = validateDok(frontmatter + body);
    expect(diags).toHaveLength(1);
    expect(diags[0]?.code).toBe("DOK-E011");
  });
});
```

Nenhuma das 30 fixtures do manifesto passa de 300.000 bytes (`decisoes/ACHADO-2026-09-20-bateria-de-verificacao-de-escopo-aberto.md` cita a mesma medição para o corpus), então o primeiro teste passa 30/30 com ou sem `DOK-E011`. O segundo teste é o único que prova o diagnóstico, com um texto sintético que ultrapassa o limite. `environment.test.ts`, da F0, continua rodando do lado dos dois, sem mudança.

## 4. Acrescentar uma linha ao `.prettierignore`

Abra `.prettierignore`, na raiz do repositório, e acrescente esta linha ao final, sem remover nem alterar nenhuma linha já existente:

```
src/content-format/testing/fixtures/
```

O corpus de 30 fixtures é Markdown de referência: `input.md` e `expected.md` de cada fixture são a evidência citada pelo ADR 002 e pelo spike S-1, byte a byte. O Prettier formata Markdown, e formatar essas fixtures muda o que o parser lê (acrescenta ponto e vírgula a um bloco de código, reindenta um `:::` de callout, insere linha em branco numa estrutura de tabs), sem que a suíte acuse nada, porque `input` e `expected` seriam reescritos na mesma passada. Esta linha protege o corpus de qualquer execução futura de `bun run format` no repositório inteiro, dentro ou fora do processo desta ordem. Detalhe completo em `decisoes/ACHADO-2026-09-20-bateria-de-verificacao-de-escopo-aberto.md`.

## 5. Rodar a bateria de verificação, na ordem, e anexar a saída de cada comando ao resultado

```
bunx prettier --write src/content-format/index.ts src/content-format/testing/runFixtureSuite.ts src/content-format/testing/fixtures.test.ts
bun run typecheck
bun run build
bun run test
bun run check:content-format-env
bunx eslint src/content-format/index.ts src/content-format/testing/runFixtureSuite.ts src/content-format/testing/fixtures.test.ts
```

Todo comando desta bateria roda no escopo que esta ordem declara, nunca no projeto inteiro: o comando que escreve (`prettier --write`) recebe a lista literal dos três arquivos que esta ordem cria ou edita, e o comando que só confere (`eslint`, sem `--fix`) recebe a mesma lista, em vez de `bun run lint` (`eslint .`, projeto inteiro). `bun run typecheck` e `bun run build` seguem abertos, porque conferem sem escrever e já passam limpos na `main`: `bun run typecheck` e `bun run build` terminaram com código de saída 0 contra `ccc3ce2`, medido em 2026-09-20. Regra e medição completas em `decisoes/ACHADO-2026-09-20-bateria-de-verificacao-de-escopo-aberto.md`.

Os seis comandos precisam terminar com código de saída 0. `bun run test` precisa reportar 2 arquivos de teste, todos passando (`environment.test.ts`, com 2 testes, e `fixtures.test.ts`, com 2 testes: a suíte de 30 fixtures e o teste de `DOK-E011`). `bun run check:content-format-env` precisa terminar sem nenhuma linha `UNRESOLVED_IMPORT` nem `Rolldown failed to resolve`. O `eslint` escopado aos três arquivos precisa terminar sem nenhum problema.

A dívida pré-existente não entra na definição de pronto desta fatia: `environment.test.ts` carrega 17 problemas de formatação herdados da F0, e o resto da `main` acusa 704 problemas (666 deles de `prettier/prettier`), ambos medidos em 2026-09-20. Nenhum dos dois aparece na saída do `eslint` escopado desta bateria, porque o comando só recebe os três arquivos desta ordem. O tratamento da dívida é issue própria de backlog.

## O que fazer se algo falhar

Nenhum passo desta ordem admite mais de uma forma de resolver uma falha.

- **O `prettier --write` escopado muda alguma coisa nos três arquivos.** Aceitável, é para isso que o passo existe. Prossiga para o próximo comando com o resultado da formatação.
- **`bun run typecheck` falha em `src/content-format/index.ts` ou em `runFixtureSuite.ts`.** Não desligue nenhuma flag do `tsconfig.json`, não introduza `as any` nem `@ts-ignore`. Pare e devolva a saída completa do erro como resultado.
- **`bun run test` falha em `fixtures.test.ts`, no teste das 30 fixtures, com uma ou mais fixtures na lista de `failedRows`.** Não edite a fixture nem o `manifest.json` para fazer passar. Pare e devolva a lista de `failedRows` (a mensagem de falha já vem em JSON, com o nome de cada checagem que não bateu) como resultado.
- **`bun run test` falha no teste de `DOK-E011`.** Confira a sequência do passo 1: `parseDok`, `normalizeTree` sobre uma cópia (`structuredClone`), tamanho por `TextEncoder`, `DOK-E011` antes de qualquer checagem de frontmatter. Não ajuste o limite nem o texto sintético do teste para fazer passar. Pare e devolva a saída.
- **`bun run test` falha em `environment.test.ts`.** Esse arquivo é da F0, não desta ordem. Pare, porque uma falha ali indica que algo desta ordem quebrou infraestrutura que não deveria tocar, e devolva a saída.
- **`bun run check:content-format-env` falha com `UNRESOLVED_IMPORT` ou equivalente.** Não adicione o pacote a `rollupOptions.external`. Um import não resolvido em plataforma browser significa que algum código de `src/content-format/index.ts` depende de builtin do Node ou de algo que não roda no navegador. Pare e devolva a saída, apontando a linha do import.
- **`bunx eslint` acusa problema num dos três arquivos.** Corrija dentro do próprio arquivo até o comando terminar com código de saída 0. Não amplie o comando para lint de qualquer outro arquivo do repositório: a dívida de `environment.test.ts` e do resto da `main`, nomeada no passo 5, fica fora desta ordem.
- **Qualquer outro comando termina com código diferente de 0.** Pare, não tente uma segunda abordagem, não instale pacote fora do que já está instalado, não edite arquivo fora do que esta ordem autoriza, e devolva a saída de erro completa como resultado. Quem revisa decide o próximo passo.

## Restrições

- Não instale nenhum pacote. Todas as dependências desta fatia já estão instaladas pela F0.
- Não edite `tsconfig.json`, nenhuma flag.
- Não edite nenhum arquivo fora de: `src/content-format/index.ts`, `src/content-format/testing/runFixtureSuite.ts`, `src/content-format/testing/fixtures.test.ts`, `.prettierignore`. Isso inclui não editar `environment.test.ts`, `vitest.config.ts`, `eslint.config.js`, `vite.content-format-check.config.ts` nem `package.json`. Em `.prettierignore`, a única mudança permitida é a linha do passo 4: acrescentar `src/content-format/testing/fixtures/`, sem tocar em nenhuma linha existente.
- Não toque em `.env*`.
- Não faça deploy nem publique. Comitar no `dok-draw-app` e o Lovable sincronizar com a `main` é o suficiente para esta ordem.
````

## Derivação

De onde cada exigência vem, para quem revisa conferir sem reler tudo.

| Item da ordem | Origem |
| :--- | :--- |
| Conteúdo de `index.ts` | Porte de `adrs/_work/spike-s1/content-format/dokmd.ts` (estado do S-1, commit `8f531b1`, 30/30 nas fixtures). Reformatado com `.prettierrc` real do app (`printWidth: 100, semi: true, singleQuote: false, trailingComma: "all"`), verificado nesta sessão com `prettier --check` real, sem pendência |
| `DOK-E011` em `validateDok`, tamanho por `TextEncoder`, `parseDok` único via `normalizeTree` clonado, sequência de checagens | `ADR-002-emenda-1.md` linha 79 e `LEDGER.md` linha 210: `validateDok` calcula o tamanho em bytes UTF-8 do texto normalizado e emite `DOK-E011` antes de qualquer outra checagem. Achado da sessão C em `DDP-57`, `DDP-59`, `DDP-62`, `DDP-63` (parse triplo, orçamento de desempenho, e a sequência de `DOK-E011` antes de `DOK-E001`). Compilado sob as seis flags e testado nesta sessão num sandbox isolado, 30/30 fixtures e 2 testes de `fixtures.test.ts` passando, `p50` de 220,05 ms numa página de 5 mil linhas medido no harness do spike (`content-format/perf.ts`) sobre o texto exato desta ordem, dentro do orçamento de 300 ms de `ADR-002-emenda-1.md` seção 2 |
| `import { z } from "zod/v4"` em vez de `"zod"` | `adrs/LEDGER.md`, bloco do ADR 002: "zod (API v4): `^4.6.5`, ou `^3.25.76` importando de `zod/v4`". App tem `zod ^3.25.76`. Testado nesta sessão contra o `zod@3.25.76` real (instalado num ambiente isolado): o mesmo `frontmatterSchema` compila limpo sob as seis flags do app, e o import bundla sem erro num build de plataforma browser real (98 módulos) |
| As duas correções das flags estritas, aplicadas nos oito pontos | `adrs/_work/ADR-002-custo-flags-estritas.md` (`DDP-2`), os dois grupos de causa. Verificado nesta sessão: `index.ts` compila com exit 0 sob as seis flags reais do app (`noFallthroughCasesInSwitch`, `noImplicitOverride`, `noImplicitReturns`, `noPropertyAccessFromIndexSignature`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noUncheckedSideEffectImports`) |
| `classifyUrl` citado como já publicado | `adrs/ADR-002-emenda-1.md` (`DDP-8`), seção 5: `classifyUrl` vira interface publicada, sem mudança de assinatura |
| `runFixtureSuite.ts`, assinatura `(fixturesRoot, manifestPath) => SuiteResult` | `adrs/ADR-002-emenda-1.md`, seção 4: runner compartilhado, sem número fixo de fixtures. A assinatura da issue é literal, o `SuiteResult` e o `SuiteRow` são forma nova desta ordem, não do contrato |
| `runFixtureSuite.ts` lê `manifest.length`, sem constante `30` | Mesma seção da Emenda 1, e critério de pronto do ADR 002 seção 8.1: "o placar final é `${manifest.length - fail}/${manifest.length}`" |
| `fixtures.test.ts` compara `result.passed` com `result.total`, não com o número `30` | Mesmo motivo: a fatia F5 do ADR 002 (pendência 14 do ledger) acrescenta fixture nova, e o teste não pode assumir a contagem de hoje |
| Não recriar os quatro arquivos e os scripts da F0 | `adrs/_work/ordens/ORDEM-F0-fundacao-content-format.md`, entregáveis, conferidos nesta sessão contra o commit real `ccc3ce2` do app (`git show ccc3ce2 --stat`) |
| Passo 4, linha nova em `.prettierignore` | `decisoes/ACHADO-2026-09-20-bateria-de-verificacao-de-escopo-aberto.md`, achado da sessão C em `DDP-57` e da conferência da sessão A: 16 das 30 fixtures saem do formato pelo `prettier --write` do projeto inteiro, e a reescrita muda o que o parser lê, sem a suíte acusar |
| Bateria de verificação (passo 5), comandos escopados aos três arquivos | `decisoes/ACHADO-2026-09-20-bateria-de-verificacao-de-escopo-aberto.md`: comando que escreve recebe a lista literal dos arquivos da ordem, comando que só confere roda aberto quando já passa limpo na `main`, com a medição do dia registrada. `T-0008`/`DDP-5` já usava o padrão de um script por vez, com o resultado esperado |
| `bun run typecheck` e `bun run build` rodando abertos | Mesmo achado: os dois só conferem, não escrevem, e `bun run typecheck` mediu código de saída 0 na `main` em 2026-09-20 |
| Playbook de "O que fazer se algo falhar" | `T-0008` já tinha a mesma seção. Ampliada aqui com um caso por comando da bateria, porque a fatia F1 tem mais pontos de falha possíveis que a F0 (código de verdade, não só configuração), e com o caso do teste de `DOK-E011` |

## Decisões tomadas

- **`validateDok` chama `parseDok` uma vez só, extraindo de `normalizeDok` um helper interno (`normalizeTree`) que opera sobre árvore já parseada.** Alternativa descartada: manter `validateDok` chamando `normalizeDok(text)` como texto, que reparseia por dentro. Descartada porque o pipeline completo do save (`normalizeDok` do lado de fora mais `validateDok`) chegava a três parses por gravação, e a sessão C mediu o `p50` de uma página de 5 mil linhas em 295,98 ms, a 4 ms do orçamento de 300 ms de `ADR-002-emenda-1.md` seção 2. Com o parse único, o mesmo `p50` cai para 220,05 ms, medido nesta sessão no harness do spike (`content-format/perf.ts`), sobre o texto exato desta ordem (extraído do documento final, não de uma variante à parte). Custo aceito: `validateDok` precisa clonar a árvore antes de normalizar (`structuredClone`), porque `normalizeTree` muta o que recebe e a mesma árvore segue para o `visit` logo depois. Sem a cópia, `inlineReferences` apagaria os nós `linkReference`/`imageReference`/`definition` antes do `visit`, e `DOK-E010` nunca dispararia. Verificado nesta sessão: `validateDok` sobre `14-link-por-referencia/input.md` (fixture com referência não normalizada) continua emitindo quatro `DOK-E010`, com a cópia em vigor.
- **`DOK-E011` volta a ser a primeira checagem de `validateDok`, antes de `DOK-E001`.** Alternativa descartada: manter `DOK-E001` na frente, que era a decisão anterior desta ordem. Descartada porque a premissa que a sustentava estava errada: `normalizeDok` não depende de frontmatter válido, o `try/catch` do YAML inválido não propaga erro, e a função devolve texto normalmente mesmo com frontmatter ausente, quebrado ou fora do esquema. `ADR-002-emenda-1.md` linha 79 e `LEDGER.md` linha 210 exigem `DOK-E011` "antes de qualquer outra checagem", sem condição, porque o diagnóstico não depende de percorrer a árvore nem de frontmatter válido. Custo aceito: um documento com frontmatter ausente ou quebrado e também acima do limite de tamanho recebe só `DOK-E011`, não `DOK-E001`, até o autor reduzir o conteúdo e salvar de novo. Nenhuma das 30 fixtures do manifesto combina as duas situações, verificado nesta sessão.
- **`SuiteResult`/`SuiteRow` como os únicos tipos novos, sem reaproveitar `ManifestEntry` do `check-fixtures.ts` do spike.** O `check-fixtures.ts` é ferramenta do spike, em `adrs/_work/`, nunca chega ao app. `runFixtureSuite.ts` precisa da própria definição de `ManifestEntry`, porque não importa nada do spike. Custo aceito: duas definições de forma idêntica, uma no spike e uma no app, sem tipo compartilhado entre os dois repositórios.
- **`fixturesDefaultPaths` como função auxiliar exportada, em vez de o teste montar o caminho sozinho.** Mantém a lógica de "onde ficam as fixtures relativas ao arquivo de teste" num único lugar, caso um segundo teste (por exemplo, no ADR 007 ou 005, quando forem escritos) precise do mesmo caminho. Custo aceito: uma função a mais exportada por um runner que, hoje, só tem um consumidor.
- **Nota sobre `dirname` sem uso em `runFixtureSuite.ts`** registrada dentro da própria ordem (passo 2), em vez de remover o import sem registrar o motivo. A regra de lint que desligaria isso já existe (`@typescript-eslint/no-unused-vars: "off"`), então o registro é só uma verificação de sanidade para quem revisa, não uma ambiguidade real.
