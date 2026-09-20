# Modelo de issue: trilha de desenvolvimento (sessão C)

Projeto `DDP`, tipo `Tarefa`. Responsável: Sessão C. Rótulos: `sessao-c`, `trilha-dev`, o ADR (`adr-002`), a sprint (`sprint-1`) e o tipo de revisão (`revisar-ordem` ou `revisar-resultado`).

Descrição:

```md
## Objetivo

Uma frase: o que passa a estar garantido quando a revisão termina.

## Contrato que vale

ADR, seção e interfaces do ledger que a implementação precisa respeitar. Cite o caminho e o nome exato, não resuma de memória.

## Escopo

O que revisar. Para `revisar-ordem`, o caminho da ordem. Para `revisar-resultado`, o SHA do commit do Lovable e a URL do preview. O que fica explicitamente de fora.

## Critério de pronto

Veredito com cada item respondido e evidência inline. Para resultado: build, typecheck, lint e teste com a saída real, mais a conferência do preview quando a fatia tem interface.

## Restrições

Não escrever código de produto. Não commitar, não publicar. Ambiguidade de ADR vira dúvida, nunca veredito de "aceita, mas diferente".
```
