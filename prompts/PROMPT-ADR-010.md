# Prompt — ADR 010: Exportação e sincronização (Export & Sync)

[Colar o Bloco 0. Anexar: LEDGER.md com os contratos 002 a 007; o trecho de exportação e sync do rascunho antigo do ADR 002 (perfis, destinos, sync periódico do Drive).]

# Tarefa
Escreva o ADR 010 — Exportação e sincronização. Decida como o conteúdo sai do DokDraw: perfis de export (Markdown universal, vault Obsidian, projeto Starlight, .docx) e destinos (download, pasta local, Google Drive, depois OneDrive e Dropbox). O Google Drive é espelho por sincronização periódica de mão única; nunca é fonte de verdade nem é lido de volta.

# Perguntas que o ADR precisa responder
1. Perfis: a tradução de cada construção do ADR 002 para cada perfil (usar a matriz do ADR 002). Implementação sobre `src/content-format` (ADR 002); se precisar de `toProfile`, acrescentá-la como emenda ao ADR 002, não como parser paralelo.
2. .docx: biblioteca (ex.: docx), mapeador próprio de AST → Word, estilos nomeados derivados dos tokens; Pandoc como plano B (GPL: só isolado no servidor, com análise jurídica).
3. Diagramas no export: SVG/PNG gerados de onde (ADR 007)? Sidecar .dokdraw.json no vault Obsidian?
4. Zip: biblioteca e licença.
5. Pasta local: File System Access API (Chromium) e fallback de zip.
6. Sync periódico: onde roda o job (pg_cron, Supabase Edge Functions agendadas, server functions + cron externo); envio só do delta (updated_at + hash); tabela de estado de sync (ADR 003); tokens OAuth no servidor; escopo drive.file; conflito quando o arquivo foi editado no Drive; exclusão vai para a lixeira; retry com backoff.
7. O que é exportado e sincronizado: só revisões publicadas (ADR 004)? Rascunhos pelo autor?

# Eliminatórios específicos
- X-01 Export e sync usam `src/content-format` (ADR 002), nunca parse próprio.
- X-02 Nenhum componente GPL embutido no produto.
- X-03 O sync nunca sobrescreve em silêncio um arquivo editado no destino.

# Contrato de saída esperado (mínimo)
interfaces_publicadas: interfaces ExportProfile, ExportTarget (sob demanda) e SyncTarget (agendado); tabela de estado de sync.
restricoes_impostas: todo componente do registry tem representação em cada perfil ou fallback documentado.
