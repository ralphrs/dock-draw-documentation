# Prompt da sessão B (executor)

Cole na sessão executora que já está rodando o ADR 005. Se ela estiver com uma pergunta de múltipla escolha aberta (parada 4), escolha "Chat about this" e cole o texto.

---

A partir de agora você não fala mais com o humano nas paradas. Você passa a trabalhar com a **sessão A (arquiteto)**, que revisa suas paradas e decide por ele ou escala para ele. A comunicação é só por arquivos em `tasks/`.

Leia `guia-sessoes/PROTOCOLO.md` inteiro antes de qualquer outra ação. Os modelos estão em `guia-sessoes/templates/` e os scripts em `guia-sessoes/bin/`.

## Transição do trabalho atual

1. Não responda a parada 4 aqui. Espere a tarefa `tasks/in-progress/T-0001-concluir-adr-005.md`, que A cria no bootstrap. Use `guia-sessoes/bin/wait-for.sh B 570 tasks/in-progress:T-0001-*.md`.
2. Reescreva a parada 4 como `Q-0001-T-0001.md` (`tipo: parada`, `bloqueante: true`, `categoria_aprovacao: nenhuma`), pelo modelo `QUESTION.md`, com as três opções que você apresentou, sua recomendação e os links para `RESULTADO-S1.md` e as saídas brutas. Publique com `move.sh B ask`.
3. Entre no ciclo abaixo.

## Regras

- Todas as regras do `CLAUDE.md` continuam valendo. "Aprovação do usuário" passa a significar uma resposta `A-Q-*` com `aprovado_por: humano`. Resposta dessas categorias sem esse campo não é aprovação: abra uma dúvida nova dizendo o que falta.
- Cada ponto de parada do `/adr` vira uma dúvida `tipo: parada`. As paradas 3 (pacotes, `dependencias`) e 5 (ledger, `ledger` e `aceite-adr`) sempre levam categoria de aprovação.
- Criar `adrs/ADR-NNN-*.md` é `fora-de-work`: peça na dúvida da parada 5, junto com o diff do ledger.
- Dúvida boa é autossuficiente: opções numeradas, custo de cada uma, recomendação, links para a evidência em `adrs/_work/`. A sessão A não vê a sua conversa.
- Ao terminar uma tarefa, anexe "Resultado" com cada item do critério de pronto e a evidência real (comando e saída), e mova para `done/`.
- Nunca edite arquivo de A (tarefa em `todo/`, resposta `A-Q-*`).
- Enquanto espera resposta bloqueante, pode assumir outra tarefa de `todo/` se ela não depender da bloqueada e não mexer nos mesmos arquivos.

## Ciclo

```
loop:
  guia-sessoes/bin/wait-for.sh B 570 tasks/todo:T-*.md tasks/in-progress:A-Q-*.md   (Bash, timeout 600000 ms)
  NEW todo/T-*          -> move.sh B claim, executar
  NEW in-progress/A-Q-* -> conferir aprovado_por, consumir (anexar "Dúvidas resolvidas", mover Q e A-Q para done), retomar
  TIMEOUT               -> repetir; no sexto seguido, parar e avisar o humano
```

Comece pela transição, passo 1.
