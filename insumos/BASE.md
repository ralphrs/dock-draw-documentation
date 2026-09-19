# BASE — Contexto comum dos ADRs (Bloco 0)

Você está escrevendo um ADR da engine de documentação do DokDraw. Responda em pt-BR; termos técnicos, nomes de pacotes e APIs em inglês. Entregue o ADR como arquivo Markdown puro (.md), com alertas GFM (> [!NOTE]), não callouts :::.

## Produto
DokDraw é uma plataforma de documentação técnica. A Wiki (estilo Confluence, escrita no dialeto do Starlight: frontmatter + :::note/:::tip/:::caution) é o produto principal. O Diagram Studio (C4, AWS, UML) existe para compor as páginas. A documentação precisa ser: um "segundo cérebro" (wikilinks, aliases, backlinks, compatível com Obsidian); exportável como .md, vault Obsidian, projeto Starlight e .docx; espelhável em nuvem por sincronização periódica de mão única (Google Drive primeiro; o Drive nunca é fonte de verdade); e, no futuro, ter pipeline de aprovação de edições (rascunho → revisão → aprovação → publicação). Na escolha de bibliotecas, o editor de páginas completo (inserção de elementos md/mdx, formatação, links) é o fator de maior peso.

## Arquitetura base (inegociável; candidata que conflita é eliminada)
- App: TanStack Start (SSR, server functions) + React 19 + Vite + TypeScript strict. Alias @ → src. Formatação oxfmt.
- UI: shadcn/Radix. Tailwind CSS v4 via @tailwindcss/vite, sem tailwind.config e sem PostCSS.
- Cores só por token CSS (custom properties), temas .theme-dark / .theme-light. Único hardcode permitido: linear-gradient(135deg,#8b5cf6,#4f8ff7). Nada de CSS reset universal não-layered.
- Animações respeitam prefers-reduced-motion. Tudo funciona em dark e light.
- Backend: Supabase (Postgres, Auth, RLS, Storage). Multi-inquilino.
- Motor de diagrama: @xyflow/react (React Flow), decidido no ADR 001; o modelo do diagrama vive no Supabase.
- Código do app: `/Users/ralphrenatodasilva/workspace/000-Pessoal/codebase/dok-draw-app` (`dok-draw-app`). É a referência real de versões, schema do Supabase e estrutura. Leitura livre. Só a sessão C (desenvolvedora) altera, em branch; merge, push, dependência e migration exigem aprovação do humano.
- Ambiente: projeto Lovable; instalação só pelo registro npm, sem build nativo nem postinstall que baixa binário.
- Segurança: conteúdo de usuário nunca é compilado nem avaliado como código.
- Versões: sempre a última estável, conferida na data da pesquisa, com link da fonte.
- Dependências novas: permitidas só com justificativa no ADR (exceção documentada, como no ADR 001).

## Grade de avaliação (a mesma em todos os ADRs)
N Nativo · P Plugin oficial · C Código próprio (estimar em dias) · X Contra a arquitetura · ? Verificar em spike.
Todo requisito tem uma coluna "Como verificar". Afirmação de README não é evidência: exija documentação, exemplo funcionando ou código-fonte.
Um X em eliminatório encerra a avaliação da candidata.

## Regras de compatibilidade (obrigatórias)
1. PARA TRÁS — base: toda candidata é conferida contra a arquitetura base acima. Conflito = eliminada.
2. PARA TRÁS — ADRs aceitos: toda candidata é conferida contra as "restricoes_impostas" e as "interfaces_publicadas" de cada contrato no LEDGER.md. Conflito = eliminada, a menos que o ADR proponha explicitamente reabrir o ADR anterior, com custo estimado e justificativa. Nunca contorne um contrato em silêncio.
3. PARA FRENTE: toda candidata é conferida contra as "premissas_sobre_camadas_futuras" do ledger e contra os requisitos das camadas seguintes listados no prompt. Uma escolha que inviabiliza uma camada futura é eliminada.
4. Licenças: auditar o pacote e as dependências transitivas. MIT/Apache-2/BSD/ISC passam. MPL-2.0 exige nota. GPL, AGPL, BSL e SSPL são eliminatórios para código embutido no produto.
5. O ADR termina com a seção "Verificação de compatibilidade" (tabela: contrato ou restrição × situação × evidência) e com o "Contrato de saída" no formato abaixo.

## Estilo de escrita
Toda prosa do ADR segue `insumos/ESTILO-ADR.md`.

## Estrutura obrigatória do ADR
1. Cabeçalho (status, data, camada, depende de, decide, não decide)
2. Decisão (proposta primeiro, justificativa depois)
3. Contexto e entradas recebidas (resumo do ledger relevante)
4. Critérios: eliminatórios, importantes, desejáveis — cada um com "por que, neste projeto" e "como verificar"
5. Candidatas (versão, licença, data de verificação, link)
6. Avaliação (matriz N/P/C/X/?, e ponderação quando houver pesos)
7. Verificação de compatibilidade (para trás e para frente)
8. Spike, se houver "?" em eliminatório: testes, critério de aprovação e regra de desempate
9. Consequências (positivas, negativas, reversibilidade)
10. Gatilhos de reabertura
11. Fatias de implementação, em ordem de dependência, com critério de pronto
12. Fora de escopo (e para qual ADR foi)
13. Contrato de saída (YAML) + atualização do LEDGER.md

## Formato do contrato de saída
```yaml
adr: "00X"
camada: ""
status: "Proposto | Aceito"
data: "AAAA-MM-DD"
decisao: ""                  # uma frase
dependencias:                # pacotes que esta decisão adiciona
  - pacote: ""
    versao: ""               # faixa semver fixada
    licenca: ""
    verificado_em: ""        # data + link
interfaces_publicadas:       # o que as outras camadas podem usar
  - nome: ""
    tipo: "tipo TS | tabela | função | formato | evento"
    descricao: ""
restricoes_impostas:         # o que as camadas seguintes são obrigadas a respeitar
  - ""
premissas_sobre_camadas_futuras:  # o que esta decisão assume que outra camada vai entregar
  - camada: ""
    premissa: ""
riscos_abertos:
  - ""
gatilhos_de_reabertura:
  - ""
```
