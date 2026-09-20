# Escopo do ADR 006 — Shell da Wiki: o caminho de escrita

Aprovado pelo humano em `DDP-47`, 2026-09-20. Origem: `decisoes/ACHADO-2026-09-20-shell-da-wiki-sem-dono.md`.

## A pergunta que este ADR responde

Por onde uma pessoa cria, edita, submete, aprova e publica uma página da Wiki no app, e o que sustenta essas telas.

A meta de `DEC-0004` pede essas seis ações. As 16 fatias que a meta lista entregam formato, schema, RLS, server functions, máquina de estados e adaptador de editor, e nenhuma delas entrega tela. O app tem quatro rotas hoje, nenhuma de Wiki. Os quatro ADRs aceitos declaram, cada um na própria seção "Não decide", que a interface não é deles.

## Decide

1. **Estrutura de rotas** da Wiki no TanStack Start, e o que fica sob `_authenticated`. O app já tem essa fronteira montada para o Diagram Studio, e o ADR diz como a Wiki se encaixa nela em vez de inventar uma segunda.
2. **Tela de listagem e criação de página**: como uma pessoa chega a uma página existente, e como cria uma nova.
3. **Tela de edição**: onde o componente do ADR 005 é montado, o que envolve ele, e onde ficam as ações de salvar rascunho e submeter para revisão.
4. **Tela da fila de revisão**: como um revisor vê o que está esperando por ele, e onde ficam aprovar, pedir mudança e publicar.
5. **Onde mora o estado do rascunho** entre o editor e o servidor, e como o autosave e a detecção de conflito do ADR 003 aparecem para quem escreve.
6. **O que é SSR e o que é cliente.** O ADR 005 mediu o chunk da rota de edição em 132,88 kB gzip mais 9,09 kB de CSS, e o teste E-07 dele exige que a landing e as páginas de leitura não carreguem o editor. Este ADR diz como isso é garantido na estrutura de rotas.
7. **Estado vazio, de carregamento e de erro** de cada tela acima, com a ação que tira a pessoa de lá.
8. **Como a fatia `edit` do registro de diretivas é consumida** sem arrastar a fatia `read`, respeitando a separação que o ADR 005 fixou.

## Não decide

- **Renderização de leitura**, que é o ADR 007, incluindo a fatia `read` do registro e a resolução de URIs `dok:`.
- **Descoberta, árvore de navegação e backlinks**, que são o ADR 008.
- **Busca**, que é o ADR 009.
- **O componente do editor em si**, que é o ADR 005. Este ADR monta o editor, não o constrói.
- **Publicação pública e domínio**, que é o ADR 011.
- **Quem pode o quê**, que vem do ADR 004 (política editorial por espaço) e do ADR 013 (tenancy). Este ADR consome os dois e não decide papel nenhum.

## Depende de

| ADR | O que este consome |
| :--- | :--- |
| 002 e Emenda 1 | `parseDok`, `serializeDok`, `normalizeDok`, os diagnósticos que bloqueiam o save, e o teto de 300.000 bytes com `DOK-E011` |
| 003 | `saveDraft`, `submitRevision`, `expectedVersion` e os dois erros de conflito |
| 004 | A máquina de estados, a política editorial por espaço, e quais transições cada papel pode disparar |
| 005 | O componente do editor, o adaptador via DokAST, o modo fonte, e a exigência de carga sob demanda |

## Restrições que já valem, e que este ADR não pode contrariar

- **Cor só por token CSS.** Nada de hex nem de classe de cor literal em componente. Tema claro e escuro pela classe `.dark`.
- **shadcn sobre Radix.** Menu e popover em portal Radix, com foco devolvido.
- **Nenhuma dependência nova** sem que o contrato a nomeie, com licença auditada.
- **Conteúdo de usuário nunca é compilado nem avaliado como código.** Nada de `dangerouslySetInnerHTML` com o que a pessoa digitou.
- **Animação respeita `prefers-reduced-motion`.**

## Posição no roteiro

Antes da sprint 4. As fatias do ADR 005 que estão na meta montam o editor dentro de uma tela, e a tela precisa existir e estar decidida antes disso.

Roteiro depois desta decisão: sprint 1 (fatias do ADR 002), ADR 006, sprints 2 e 3, sprint 4, e então o 013 e o resto da trilha de ADR.

## O que o ADR precisa entregar

Além do formato de sempre do `insumos/BASE.md`, com bloco YAML para o ledger e fatias de implementação com critério de pronto verificável, duas coisas específicas desta camada:

1. **As fatias precisam ser executáveis por quem não participou da decisão**, porque quem implementa é o agente do Lovable. Tela descrita por adjetivo produz a interface genérica que toda ferramenta de geração entrega por padrão.
2. **Cada tela entra com os quatro pontos que a sessão C exige na revisão de ordem**: estado vazio, estado de erro e de carregamento, teclado e foco, contraste e token. Definidos no ADR, não deixados para a ordem.
