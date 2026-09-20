# Achado de 2026-09-20: o caminho de escrita da Wiki não tem tela, e nenhum ADR a reivindica

Levantado pela sessão A ao somar o backlog para o `PLANO.md`.

## O achado

A meta de `DEC-0004` é um autor **criar a página, editar em DokMD, salvar o rascunho, submeter, aprovar e publicar**. Seis ações de interface.

As 16 fatias que a meta lista entregam formato, schema, RLS, server functions, máquina de estados e adaptador de editor. **Nenhuma entrega tela.** O app tem quatro rotas hoje (`__root.tsx`, `_authenticated`, `index.tsx`, `sem-acesso.tsx`), nenhuma de Wiki, e nenhum ADR decide rota.

## A evidência

Os quatro ADRs aceitos declaram, cada um na própria seção "Não decide", que a interface não é deles:

| ADR | Texto |
| :--- | :--- |
| 002 | "Não decide: editor (ADR 005), renderização e navegação (ADR 007)" |
| 003 | "Não decide: editor (ADR 005), renderização (ADR 007)" |
| 004 | "Não decide: UI do editor e modo de sugestão de edição inline (ADR 005)" |
| 005 | "Não decide: a renderização de leitura e a resolução de URIs `dok:` (ADR 007)" |

O ADR 005 é o mais próximo, e ele próprio aponta para fora: usa a palavra "shell" seis vezes, sempre como algo que existe e chama as funções dele. A seção de fora de escopo diz que "este ADR só assume que o shell final chama `saveDraft`/`submitRevision` com o texto que `getDok()` devolve".

**Quem constrói esse shell não está escrito em lugar nenhum.** A tabela "Premissas pendentes por camada destinatária" do `LEDGER.md` também não tem linha para ele, o que significa que a premissa não foi transferida a ninguém: ela evaporou.

Os dois ADRs que poderiam absorver o shell não resolvem. O 007 é renderização de leitura, e a própria `DEC-0004` o deixa fora da meta. O 008 é navegação e descoberta, depende do 007, e trata de encontrar página, não de escrever uma.

## O efeito no plano

A meta de `DEC-0004` **não é alcançável com o backlog atual**. Ao fim das 16 fatias existe um módulo de formato completo, um schema com RLS, server functions de rascunho e publicação, uma máquina de estados e um editor que converte árvore para árvore. Nada disso tem por onde ser acionado por uma pessoa.

O `PLANO.md` contava 15 ciclos até a meta. O número está errado por baixo, e o erro não é de estimativa: é uma camada inteira fora da conta.

## Por que não é implementação sem ADR

As decisões do shell são difíceis de reverter e valem para todas as telas que vierem depois: a estrutura de rotas do TanStack Start e o que fica sob `_authenticated`, onde mora o estado do rascunho entre o editor e o servidor, o que é SSR e o que é cliente (o ADR 005 já mediu o custo do chunk do editor e exige carga sob demanda), e como o registro de diretivas é consumido na fatia `edit` sem arrastar a fatia `read`.

Nove das 28 fatias do backlog têm interface e dependem dessas respostas. Decididas dentro da primeira fatia que precisar delas, viram contrato implícito escrito por quem executa, que é exatamente o que `DEC-0007` existe para impedir.

## Recomendação

Atribuir a camada ao **ADR 006**, hoje vago por `DEC-0008`: shell da Wiki, o caminho de escrita.

`DEC-0008` descartou "atribuir uma camada nova ao 006 escolhida pelo arquiteto para preencher o espaço", com o argumento de que ADR nasce de necessidade e não de número disponível. Este caso não contraria esse argumento, ele o confirma: a necessidade apareceu primeiro, com evidência, e o número estava livre. A própria `DEC-0008` registra que "se o humano lembrar qual era a camada, o espaço continua lá, e ocupá-lo não custa nada".

O escopo do 006 seria o caminho de escrita, e não a leitura: rotas da Wiki, listagem e criação de página, tela de edição com salvar e submeter, fila de revisão com aprovar e publicar. Renderização de leitura continua no 007, descoberta e navegação continuam no 008.

Decisão do humano, categoria `ledger`. Issue de aprovação separada.
