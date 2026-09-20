# Ordem F4: pipeline de save

Fatia F4 do ADR 002 (seção 11), recortada por `DEC-0012`: entrega o pipeline, não a gravação (migra para a fatia do ADR 003 que expõe `src/content-store/server.ts`). Depende só do módulo aceito (`normalizeDok`/`validateDok`, `3185728`), não da F3 (`collectRefs`/`extractText` não entram aqui).

## Onde a fatia mora

`src/application/content-format.functions.ts`, não `src/content-format`. Server function é camada de aplicação, padrão de `src/application/diagram.functions.ts`. Esta fatia não cria nem edita arquivo em `src/content-format`: a entrada do build de verificação de ambiente não muda.

## Restrições do contrato

| Restrição/interface (`LEDGER.md`) | Como se confere |
| :--- | :--- |
| `restricoes_impostas` ADR 002: "Todo save passa por `normalizeDok` + `validateDok`... qualquer `DOK-E` bloqueia" | `runSavePipeline` chama as duas em sequência, recusa antes de devolver canônico |
| `interfaces_publicadas` ADR 002: `validateDok` devolve `Diagnostic[]`, `DOK-E` bloqueia, `DOK-W` não | Teste da fixture 28 (só aviso) confirma `ok: true` com o aviso na resposta |

A restrição de ambiente do módulo (sem builtin/DOM) não alcança este arquivo: camada de aplicação roda no servidor. Nenhuma linha cita essa restrição. O teste de `DOK-E011` (critério 5) verifica comportamento já garantido por `validateDok` (F1/F2), não restrição nova desta fatia: a restrição de gravação da Emenda 1 continua migrada para o ADR 003 (`DEC-0012`).

## 1. Criar `src/application/content-format.functions.ts`

```ts
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { normalizeDok, validateDok, type Diagnostic } from "@/content-format";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Caso de uso do pipeline de save: normaliza, valida, recusa em DOK-E. */

export type SavePipelineResult =
  | { ok: true; canonical: string; warnings: Diagnostic[] }
  | { ok: false; diagnostics: Diagnostic[] };

export function runSavePipeline(text: string): SavePipelineResult {
  const canonical = normalizeDok(text);
  const diags = validateDok(canonical);
  const errors = diags.filter((d) => d.code.startsWith("DOK-E"));
  if (errors.length > 0) return { ok: false, diagnostics: errors };
  const warnings = diags.filter((d) => d.code.startsWith("DOK-W"));
  return { ok: true, canonical, warnings };
}

export const saveDokPipeline = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { text: string }) => z.object({ text: z.string() }).parse(input))
  .handler(async ({ data }) => runSavePipeline(data.text));
```

`saveDokPipeline` segue o mesmo formato de `fetchModel` em `diagram.functions.ts` (`createServerFn` + `requireSupabaseAuth` + `inputValidator` + `handler`). Compilado nesta sessão sob as seis flags estritas, com `@tanstack/react-start` real e um stub do `auth-middleware` real do app (mesma assinatura, sem Supabase de verdade). `runSavePipeline`, a lógica pura, testada com Vitest real e as fixtures reais.

## 2. Criar `src/application/content-format.functions.test.ts`

```ts
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { normalizeDok } from "@/content-format";
import { runSavePipeline } from "./content-format.functions";

const fxDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "content-format",
  "testing",
  "fixtures",
);
const fx = (name: string, file: string) => readFileSync(join(fxDir, name, file), "utf8");

describe("runSavePipeline", () => {
  it("recusa HTML cru com DOK-E002 e linha", () => {
    const doc = [
      "---",
      "dok: 1",
      "id: 11111111-1111-4111-8111-111111111111",
      "title: t",
      "---",
      "",
      "<div>oi</div>",
    ].join("\n");
    const result = runSavePipeline(doc);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.diagnostics).toHaveLength(1);
      expect(result.diagnostics[0]?.code).toBe("DOK-E002");
      expect(result.diagnostics[0]?.line).toBe(7);
    }
  });

  it("texto válido devolve exatamente normalizeDok(x)", () => {
    const input = fx("01-frontmatter-minimo", "input.md");
    const result = runSavePipeline(input);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.canonical).toBe(normalizeDok(input));
  });

  it("round-trip: rodar sobre a própria saída devolve saída idêntica", () => {
    const input = fx("08-tabela-gfm", "input.md");
    const first = runSavePipeline(input);
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    const second = runSavePipeline(first.canonical);
    expect(second.ok).toBe(true);
    if (second.ok) expect(second.canonical).toBe(first.canonical);
  });

  it("DOK-W sozinho não bloqueia e aparece na resposta", () => {
    const input = fx("28-imagens-e-anexos", "expected.md");
    const result = runSavePipeline(input);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.warnings.map((w) => w.code)).toEqual(["DOK-W102"]);
  });

  it("acima de 300.000 bytes recusa só com DOK-E011", () => {
    const doc = [
      "---",
      "dok: 1",
      "id: 11111111-1111-4111-8111-111111111111",
      "title: t",
      "---",
      "",
      "x".repeat(310_000),
    ].join("\n");
    const result = runSavePipeline(doc);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.diagnostics).toHaveLength(1);
      expect(result.diagnostics[0]?.code).toBe("DOK-E011");
    }
  });
});
```

## 3. Bateria, no escopo desta fatia

```
bunx prettier --write src/application/content-format.functions.ts src/application/content-format.functions.test.ts
bun run typecheck
bun run build
bun run test
bunx eslint src/application/content-format.functions.ts src/application/content-format.functions.test.ts
```

`typecheck`/`build`: código 0 em 2026-09-20. `bun run test`: 4 arquivos (`environment.test.ts`, `fixtures.test.ts`, `refs.test.ts`, `content-format.functions.test.ts` novo, 5 testes). `eslint`: sem problema. Não rode `bun run lint` nem `prettier --check .`: 704 e 47 pré-existentes, fora do pronto. Sem `check:content-format-env`: esta fatia não toca `src/content-format`.

## O que fazer se algo falhar

- `typecheck` falha: não desligue flag, não use `as any` além do que o padrão já usa em `context`. Pare e devolva a saída.
- Teste falha numa fixture: não edite a fixture. Pare e devolva a saída.
- `eslint` acusa problema: corrija dentro dos dois arquivos. Se parecer exigir mudar `eslint.config.js`, pare e abra dúvida.
- Qualquer outro código diferente de 0: pare, devolva a saída completa.

## Restrições

- Não edite `index.ts` nem `refs.ts` (F1, F2, F3, aceitas).
- Nenhum pacote novo.
- Não edite `eslint.config.js`, `package.json`, `vite.content-format-check.config.ts`.
- Nenhuma escrita em tabela nenhuma: se parecer necessário, pare e abra dúvida.
- Não toque `.env*`. Não commite, não despache.
