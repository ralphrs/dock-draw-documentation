# DEC-0019: diagrama versiona no mesmo id, e o vínculo na página é sempre o último

**Data:** 2026-09-20
**Quem decidiu:** humano
**Alcance:** o que `page_refs.target_rev_id` faz, o gatilho de reabertura do ADR 004, e o que o ADR 001 precisa entregar ao versionar diagrama

## O pedido

> o diagrama versiona no mesmo ID... o que é vinculado na wiki basicamente é o ID do diagrama e quando vinculado e renderizado será sempre o latest

## A decisão

O diagrama passa a ter histórico, e o identificador não muda entre versões. A página vincula o id, nunca uma versão. A renderização resolve sempre a versão mais recente.

`page_refs.target_rev_id` fica nulo para sempre, por decisão e não por falta.

## O que isso inverte

Os ADRs 003 e 004 construíram o mecanismo de fixação inteiro à espera do ADR 001. Cinco lugares do ledger dizem, com palavras próximas, que a fixação "fica definida para quando o ADR 001 versionar diagramas". Um deles é gatilho de reabertura do ADR 004.

A leitura natural desses textos é que a fixação está adiada. Esta decisão diz que ela está descartada. Sem a correção, o ADR 001 versionaria diagrama, alguém leria o gatilho e ligaria a fixação, revertendo esta decisão sem perceber que a estava revertendo.

O mecanismo não é apagado do schema. A coluna continua existindo, e o que muda é a regra que a preenche: nada preenche.

### Alternativas descartadas

| Alternativa | Por que não |
| :--- | :--- |
| Fixar a versão do diagrama no momento da publicação da página | Congela diagrama num desenho velho dentro de documentação que a pessoa acabou de ler como atual. Numa wiki de arquitetura, o diagrama desatualizado é pior que o diagrama que mudou |
| Deixar o autor escolher entre fixar e seguir o último | Duas semânticas para o mesmo embed, e quem lê a página não sabe qual está vendo sem abrir o texto |
| Versão nova do diagrama gerar id novo | Quebra todo vínculo já escrito em toda página a cada edição de diagrama |

## O custo aceito, que é real

**A revisão publicada de uma página deixa de ser reproduzível.** O ADR 003 garante que o texto da revisão é imutável e append-only. O texto continua imutável. O que a página mostra, não: abrir uma revisão publicada meses atrás exibe o diagrama de hoje, não o daquele dia.

O ADR 004 registrou exatamente esse comportamento como risco aberto, com a palavra "inerte" e um gatilho para consertar. Ele deixa de ser risco e passa a ser o desenho.

Quem precisar do diagrama tal como estava vai ao histórico do diagrama, que esta decisão cria. Não à página.

## O que o ADR 001 precisa entregar

Versionar diagrama mantendo o id estável. O histórico pertence ao diagrama, não à página, e a página nunca aponta para dentro dele.

Isso não é pequeno: `public.views`, `view_nodes`, `model_elements` e `relationships` são mutáveis e editadas no lugar, sem histórico nenhum. Versionar as quatro é trabalho de ADR, não de migração.

## Lacuna declarada

Esta decisão não diz o que acontece quando o diagrama vinculado é apagado. Hoje `page_refs.target_id` não tem chave estrangeira, por doutrina do ADR 003, então nada impede a exclusão e a página fica apontando para o vazio. A resposta provável mora no item que mostra em quais páginas um diagrama aparece, antes de mexer nele, catalogado em `DDP-145`.

Também não diz se o histórico do diagrama é navegável pela interface, nem por quem. Isso é escopo do ADR 001.
