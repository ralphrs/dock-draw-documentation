# Emenda 1 ao ADR 002 — Pendências para o diff do LEDGER

Acumuladas em 2026-09-19, durante a escrita da Emenda 1 (`adrs/_work/ADR-002-emenda-1-rascunho.md`). Nenhuma aplicada ao `LEDGER.md` nesta sessão: anexar a emenda ao ADR 002 e aplicar o bloco no ledger são ações das categorias `fora-de-work` e `ledger`, pendentes de uma dúvida `Q-*` própria depois deste rascunho.

## Texto do ledger, quando aplicado

1. **Bloco `## ADR 002 — Formato de conteúdo (DokMD v1)`, contrato YAML**: mesclar o bloco complementar da seção final da emenda em cima do bloco já aceito.
   - `interfaces_publicadas` ganha `runFixtureSuite` e `classifyUrl`, acrescentados ao final da lista existente, sem remover nenhum item.
   - `restricoes_impostas` ganha duas linhas novas (execução sem DOM/Node builtin, `DOK-E011` acima de 300.000 bytes), acrescentadas ao final da lista existente.
   - `premissas_sobre_camadas_futuras` ganha um item novo para "Renderização (ADR 007)" (recebe `classifyUrl`) e complementa o item existente de "Exportação (ADR 010)" com `toProfile` e a decisão de runtime do job agendado, sem remover o texto já aceito desse item.
   - `riscos_abertos` ganha três linhas novas (orçamento medido em Node, não em produção, plano do Cloudflare Workers não registrado, correlação bytes/linha varia com o conteúdo).
   - `gatilhos_de_reabertura` ganha três linhas novas (divergência de medição em ambiente real, runtime do job agendado sem restrição de isolado V8, fatia F5 encontra página acima de 300.000 bytes).
2. **Nota de rodapé no cabeçalho do bloco do ADR 002**: "Emenda 1 (execução, desempenho, testes) anexada em `ADR-002-emenda-1-rascunho.md`", com a data de aceite.

## Novo código de diagnóstico

3. **`DOK-E011`**: registrado nesta emenda, ainda não implementado em `dokmd.ts`. Dono: fatia F2 (validação) do ADR 002, quando a fatia F1 sair do spike para produção. A pendência 13 do ledger (DOK-W103 falso) e esta são do mesmo tipo, achado documentado sem mudar o número do S-1.

## Verificação de não reabertura

4. Conferido ponto a ponto no corpo da emenda (nota do topo do rascunho): os três campos tocados do contrato do ADR 002 (`riscos_abertos`, `interfaces_publicadas`, `premissas_sobre_camadas_futuras`) recebem só acréscimo. `dependencias` e a lista original de `restricoes_impostas` não são alteradas. Nenhum ponto exigiu reabertura, então não foi aberta dúvida com `categoria_aprovacao: reabertura`.

## Compatibilidade conferida (critério 4 de T-0006)

5. Para trás, contra os contratos dos ADRs 001 a 005 do `LEDGER.md`: sem conflito, ver "Verificação de compatibilidade" na emenda.
6. Para frente, contra a tabela "Premissas pendentes por camada destinatária" do ledger: os itens novos de 007 e 010 complementam entradas já existentes na tabela (a linha de "Renderização (007)" e a de "Exportação (010)"), sem contradizer o que já está registrado para essas camadas.
