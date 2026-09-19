---
description: Audita adrs/LEDGER.md contra os ADRs gerados e propõe a versão atualizada
---

Audite `adrs/LEDGER.md` contra os arquivos `adrs/ADR-*.md` e `insumos/ORDEM.md`.

1. Para cada ADR, extraia status e "Contrato de saída" (YAML).
2. Liste: contratos ausentes ou divergentes; conflitos citados nos ADRs e ausentes de "Conflitos em aberto"; referências de numeração que não batem com `insumos/ORDEM.md`.
3. Para cada `premissas_sobre_camadas_futuras` cuja camada destinatária já tem ADR, diga se foi cumprida, com a seção que comprova.
4. Proponha o `LEDGER.md` atualizado como diff. **Não aplique** sem minha aprovação.
5. Não edite nenhum ADR; liste correções necessárias como pendências.
