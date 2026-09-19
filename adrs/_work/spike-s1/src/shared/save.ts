// Simula o save do servidor: todo save passa por normalizeDok + validateDok (contrato do ADR 002).
import { normalizeDok, validateDok, type Diagnostic } from '../../content-format/dokmd.ts'

export type SaveResult = { ok: boolean; text: string; diagnostics: Diagnostic[] }

export function saveDok(text: string): SaveResult {
  const normalized = normalizeDok(text)
  const diagnostics = validateDok(normalized)
  return { ok: !diagnostics.some((d) => d.code.startsWith('DOK-E')), text: normalized, diagnostics }
}

export function blockingDiagnostics(text: string): Diagnostic[] {
  return validateDok(text).filter((d) => d.code.startsWith('DOK-E'))
}
