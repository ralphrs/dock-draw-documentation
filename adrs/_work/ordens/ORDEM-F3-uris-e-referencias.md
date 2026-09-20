# Ordem F3: URIs e referências

Fatia F3 do ADR 002 (seção 11), depende só da F1 (aceita, `3185728`). Entrega `collectRefs`, `extractText`, `anchorSlug` em `src/content-format/refs.ts`, sem tocar `index.ts`. `parseDokUri` (tabela de fatias) é `classifyUrl` (Emenda 1 seção 5, já na F1): sem símbolo novo.

## Restrições do contrato

| Restrição (`LEDGER.md`) | Como se confere |
| :--- | :--- |
| Nenhuma camada parseia Markdown por conta própria | Assinatura `tree: Root`, TS rejeita chamada com `string` |
| Links, imagens, diagramas por id em URI `dok:` | Testes de `collectRefs` (fixtures 12-14, 23, 28) comparam o `id` de cada uma |
| `src/content-format` (fora de `testing`) sem builtin do Node | ESLint de `src/content-format/**` (direto) e o build do passo 3 (transitiva) |
| `extractText` exclui URL e atributo técnico (seção 7.5) | Teste de `extractText` espera `"Texto com link."`, sem a URL (linha 194) |

Esta ordem não importa biblioteca de UI em `refs.ts`, por coerência com módulo de transformação pura. Não é restrição do ledger, sem mecanismo que reprove, fora da tabela. Proposta de restrição nova em `DDP-84`.

## 1. Criar `src/content-format/refs.ts`

Arquivo novo, conteúdo inteiro:

```ts
// URIs e referências (fatia F3 do ADR 002). Não toca em index.ts (F1/F2, aceitas).
import type { Nodes, Root } from "mdast";
import { visit } from "unist-util-visit";
import { slug } from "github-slugger";
import { classifyUrl } from "./index";

export type Ref = {
  kind: "page" | "unresolved" | "asset" | "diagram";
  id?: string | undefined;
  view?: string | undefined;
  rev?: string | undefined;
  anchor?: string | undefined;
  unresolvedTitle?: string | undefined;
  position: number;
};

export function collectRefs(tree: Root): Ref[] {
  const refs: Ref[] = [];
  visit(tree, (n) => {
    const position = n.position?.start.line ?? 0;
    if (n.type === "link" || n.type === "image") {
      const c = classifyUrl(n.url, { image: n.type === "image" });
      if (c.kind === "page") refs.push({ kind: "page", id: c.id, anchor: c.anchor, position });
      else if (c.kind === "unresolved")
        refs.push({ kind: "unresolved", unresolvedTitle: c.title, position });
      else if (c.kind === "asset") refs.push({ kind: "asset", id: c.id, position });
      else if (c.kind === "diagram")
        refs.push({ kind: "diagram", id: c.id, view: c.view, position });
      return;
    }
    if (n.type === "leafDirective" && n.name === "diagram") {
      const src = n.attributes?.["src"];
      if (!src) return;
      const c = classifyUrl(src);
      if (c.kind !== "diagram") return;
      refs.push({
        kind: "diagram",
        id: c.id,
        view: n.attributes?.["view"] ?? undefined,
        rev: n.attributes?.["rev"] ?? undefined,
        position,
      });
    }
  });
  return refs;
}

export type TextBlock = { headingPath: string[]; text: string; kind: string };

function inlineText(nodes: Nodes[]): string {
  let out = "";
  for (const n of nodes) {
    if (n.type === "text" || n.type === "inlineCode") out += n.value;
    else if (n.type === "image") out += n.alt ?? "";
    else if ("children" in n) out += inlineText(n.children as Nodes[]);
  }
  return out.trim();
}

export function extractText(tree: Root): TextBlock[] {
  const blocks: TextBlock[] = [];
  const stack: { depth: number; text: string }[] = [];
  const push = (kind: string, text: string) => {
    if (text.trim().length > 0) blocks.push({ headingPath: stack.map((s) => s.text), text, kind });
  };
  const label = (n: Nodes): string | null => {
    const first = "children" in n ? (n.children as Nodes[])[0] : undefined;
    const hasLabel = (first as { data?: { directiveLabel?: boolean } } | undefined)?.data
      ?.directiveLabel;
    return hasLabel ? inlineText([first as Nodes]) : null;
  };
  visit(tree, (n, _i, parent) => {
    if (n.type === "heading") {
      const text = inlineText(n.children as Nodes[]);
      push("heading", text);
      while (stack.length && stack[stack.length - 1]!.depth >= n.depth) stack.pop();
      stack.push({ depth: n.depth, text });
      return;
    }
    if (n.type === "paragraph") {
      if (parent?.type === "listItem") return;
      return void push("paragraph", inlineText(n.children as Nodes[]));
    }
    if (n.type === "listItem") {
      const kids = (n.children as Nodes[]).filter((c) => c.type !== "list");
      return void push("item", inlineText(kids));
    }
    if (n.type === "tableCell") return void push("cell", inlineText(n.children as Nodes[]));
    if (n.type === "code") return void push("code", n.value);
    if (n.type === "leafDirective" && n.name === "diagram") {
      push("diagram-title", n.attributes?.["title"] ?? "");
      const l = label(n);
      if (l) push("diagram-description", l);
      return;
    }
    if (n.type === "containerDirective") {
      const l = label(n);
      if (l) push("label", l);
    }
  });
  return blocks;
}

export function anchorSlug(headingText: string): string {
  return slug(headingText);
}
```

## 2. Criar `src/content-format/testing/refs.test.ts`

Arquivo novo. Não toca `fixtures.test.ts` nem `environment.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parseDok } from "../index";
import { anchorSlug, collectRefs, extractText } from "../refs";

const dir = dirname(fileURLToPath(import.meta.url));
const fx = (name: string) => readFileSync(join(dir, "fixtures", name, "expected.md"), "utf8");

describe("collectRefs", () => {
  it("fixture 12: dois refs de page (um com âncora), sem self-anchor", () => {
    const refs = collectRefs(parseDok(fx("12-link-interno")));
    expect(refs.map((r) => ({ kind: r.kind, id: r.id, anchor: r.anchor }))).toEqual([
      { kind: "page", id: "0192f0a1-5c3e-7a10-8b2c-3d4e5f607183", anchor: undefined },
      { kind: "page", id: "0192f0a1-5c3e-7a10-8b2c-3d4e5f607183", anchor: "contexto" },
    ]);
  });

  it("fixture 13: título vivo é ref de page sem âncora", () => {
    const refs = collectRefs(parseDok(fx("13-link-titulo-vivo")));
    expect(refs).toHaveLength(1);
    expect(refs[0]?.kind).toBe("page");
  });

  it("fixture 14: page e asset", () => {
    const refs = collectRefs(parseDok(fx("14-link-por-referencia")));
    expect(refs.map((r) => r.kind)).toEqual(["page", "asset"]);
  });

  it("fixture 23: dois diagramas, o segundo com rev", () => {
    const refs = collectRefs(parseDok(fx("23-diagram-canonico")));
    expect(refs).toHaveLength(2);
    expect(refs[0]?.rev).toBeUndefined();
    expect(refs[1]?.rev).toBe("0192f0a1-6d4f-7b20-9c3d-4e5f60718295");
  });

  it("fixture 28: dois assets, imagem externa não entra", () => {
    const refs = collectRefs(parseDok(fx("28-imagens-e-anexos")));
    expect(refs.map((r) => r.kind)).toEqual(["asset", "asset"]);
  });
});

describe("extractText", () => {
  it("headings, parágrafo e item, sem URL", () => {
    const doc = [
      "---",
      "dok: 1",
      "id: 11111111-1111-4111-8111-111111111111",
      "title: t",
      "---",
      "",
      "# Título",
      "",
      "Texto com [link](dok:page/0192f0a1-5c3e-7a10-8b2c-3d4e5f607183).",
      "",
      "- item um",
    ].join("\n");
    const blocks = extractText(parseDok(doc));
    expect(blocks).toEqual([
      { headingPath: [], text: "Título", kind: "heading" },
      { headingPath: ["Título"], text: "Texto com link.", kind: "paragraph" },
      { headingPath: ["Título"], text: "item um", kind: "item" },
    ]);
  });
});

describe("anchorSlug", () => {
  it("usa github-slugger", () => {
    expect(anchorSlug("Contexto do Pagamento")).toBe("contexto-do-pagamento");
  });
});
```

## 3. Acrescentar `refs.ts` ao build de verificação

Em `vite.content-format-check.config.ts`, só o `entry` muda:

```ts
entry: ["src/content-format/index.ts", "src/content-format/refs.ts"],
```

Alternativa descartada: reexportar `refs.ts` em `index.ts`, fecharia ciclo sem necessidade (contrato não exige a F3 saindo por `index.ts`).

Medido: build limpo, 367 módulos, sem `UNRESOLVED_IMPORT`. Saída lista três arquivos (as duas entries mais um chunk compartilhado). Critério: código e ausência de `UNRESOLVED_IMPORT`/`Rolldown failed to resolve`, não a contagem.

## 4. Bateria, no escopo desta fatia

```
bunx prettier --write src/content-format/refs.ts src/content-format/testing/refs.test.ts
bun run typecheck
bun run build
bun run test
bun run check:content-format-env
bunx eslint src/content-format/refs.ts src/content-format/testing/refs.test.ts
```

`typecheck`/`build`: código 0 em 2026-09-20. `bun run test`: 3 arquivos (`environment.test.ts`, `fixtures.test.ts`, `refs.test.ts`, 7 testes). `check:content-format-env`: código 0, sem `UNRESOLVED_IMPORT`/`Rolldown failed to resolve` (seção 3). `eslint`: sem problema. Não rode `bun run lint` nem `prettier --check .`: 704 e 47 pré-existentes, fora do pronto.

## O que fazer se algo falhar

- `typecheck` falha em `refs.ts`: não desligue flag, não use `as any`. Pare e devolva a saída.
- `refs.test.ts` falha numa fixture: não edite a fixture. Pare e devolva a saída.
- `check:content-format-env` acusa `UNRESOLVED_IMPORT`: não adicione a `rollupOptions.external`, devolva a saída com a linha do import.
- `eslint` acusa builtin em `refs.ts`: `github-slugger`/`unist-util-visit` não são builtin, confira se o import não é `node:*`. Se for erro real, pare e devolva a saída.
- Qualquer outro código diferente de 0: pare, não tente outra abordagem, devolva a saída completa.

## Restrições

- Não edite `parseDok`, `serializeDok`, `normalizeDok`, `validateDok` nem nenhuma linha de `index.ts`.
- Nenhum pacote novo (`github-slugger` já instalado).
- Não edite `fixtures.test.ts`, `environment.test.ts`, `eslint.config.js`, `package.json`.
- Em `vite.content-format-check.config.ts`, só a linha do `entry` (passo 3).
- Não toque `.env*`. Não commite, não despache.

---

## Nota pós-execução, 2026-09-20

O texto acima é o que foi despachado em `DDP-85` e executado, e não é reescrito: ele precisa continuar idêntico à descrição daquela issue.

Uma correção de fato, registrada aqui em vez de aplicada acima: a seção 3 cita 367 módulos transformados pelo build de verificação. O número foi medido num sandbox e está errado. O build real, no app, transforma **337 módulos**, medido pela sessão C em `DDP-82` e confirmado pela execução em `DDP-85` e pela revisão em `DDP-87`.

O critério de pronto nunca foi a contagem, e sim o código de saída e a ausência de `UNRESOLVED_IMPORT`, então a divergência não reprovou nada. Fica registrada porque o arquivo é referência para a fatia F4.
